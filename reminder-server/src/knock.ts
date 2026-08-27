// Deciding whose evening it is, and knocking.
//
// The knock carries no words. The service has never been told the learner's name
// or streak, so all it sends is `{"kind":"reminder"}` and the phone writes the
// rest — see public/notify-sw.js in the app. What the service *does* have to get
// right is the "when", and the "when" is a local-time question asked from a
// machine that has no idea where the phone is.

import {
  rawPayload,
  sendPushBatch,
  urlBase64ToUint8Array,
  type PushSubscriptionData,
} from '@mmmike/web-push'
import type { Env } from './http'

export interface SubscriptionRow {
  endpoint: string
  p256dh: string
  auth: string
  hour: number
  tz: string
  last_practiced_day: string | null
  last_notified_day: string | null
  failures: number
}

/** A reminder is stale by morning; a knock the phone couldn't take within a few
 *  hours should be dropped rather than delivered at 3am. */
const REMINDER_TTL_SECONDS = 3 * 60 * 60
/** Collapse key: an undelivered knock is replaced by the next one, never queued
 *  behind it. Two reminders on the same evening are worse than none. */
const TOPIC = 'odia-reminder'

// Free-plan Workers allow fifty outbound requests per scheduled run. Knocking is
// one request each, so the sweep takes a bounded slice and leaves the rest for
// the next tick fifteen minutes later — which is why anything skipped here is
// logged rather than quietly dropped.
const MAX_PER_RUN = 40

/** Where a phone thinks it is right now: local calendar day and hour. */
export function localNow(tz: string, at = new Date()): { day: string; hour: number } {
  let parts: Intl.DateTimeFormatPart[]
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(at)
  } catch {
    // An unknown timezone would otherwise take the whole sweep down with it.
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(at)
  }
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return {
    day: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')),
  }
}

/**
 * Is this phone owed a knock right now?
 *
 * The window runs from the chosen hour to midnight rather than firing on the
 * hour exactly. That is deliberate on two counts: a cron tick that never ran, or
 * a service that was down at 7pm, used to cost the learner the whole evening —
 * now the next tick catches up. And it matches what the phone's own service
 * worker does when it wakes on its own, so the two can never disagree about
 * whether tonight's reminder has already been dealt with.
 */
export function isDue(row: SubscriptionRow, at = new Date()): boolean {
  const { day, hour } = localNow(row.tz, at)
  if (hour < row.hour) return false
  if (row.last_notified_day === day) return false
  if (row.last_practiced_day === day) return false
  return true
}

function toSubscription(row: SubscriptionRow): PushSubscriptionData {
  return { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }
}

export function vapid(env: Env) {
  return {
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
    subject: env.VAPID_SUBJECT,
  }
}

/**
 * Is the key pair this service holds one it could actually sign with?
 *
 * Worth its own check because of how it fails otherwise: signing a batch throws
 * before a single push is attempted, so one mistyped secret is every learner's
 * reminders, silently, for as long as nobody looks. A missing or malformed key
 * should be a sentence in the log and a flag on /health, not a stack trace at
 * midnight.
 */
export function vapidUsable(env: Env): string | null {
  if (!env.VAPID_PRIVATE_KEY) return 'VAPID_PRIVATE_KEY is not set'
  if (!env.VAPID_PUBLIC_KEY) return 'VAPID_PUBLIC_KEY is not set'
  if (!/^mailto:.+|^https:\/\/.+/.test(env.VAPID_SUBJECT ?? '')) {
    return 'VAPID_SUBJECT must be a mailto: or https: URL'
  }
  try {
    // A P-256 private key is 32 bytes and the public key is an uncompressed
    // point: 65 bytes starting with 0x04.
    if (urlBase64ToUint8Array(env.VAPID_PRIVATE_KEY).length !== 32) {
      return 'VAPID_PRIVATE_KEY is not a 32-byte P-256 key'
    }
    const publicKey = urlBase64ToUint8Array(env.VAPID_PUBLIC_KEY)
    if (publicKey.length !== 65 || publicKey[0] !== 4) {
      return 'VAPID_PUBLIC_KEY is not an uncompressed P-256 public key'
    }
  } catch {
    return 'the VAPID keys are not valid base64url'
  }
  return null
}

/** One knock, to one phone. Used by the test button in the app's Settings. */
export async function knockOnce(
  env: Env,
  row: SubscriptionRow,
  kind: 'reminder' | 'test-knock',
): Promise<boolean> {
  const { delivered, gone } = await sendPushBatch(
    [toSubscription(row)],
    rawPayload(JSON.stringify({ kind })),
    vapid(env),
    { ttl: kind === 'test-knock' ? 60 : REMINDER_TTL_SECONDS, urgency: 'high', topic: TOPIC },
  )
  if (gone.length) await forget(env, gone)
  return delivered > 0
}

/** Drop addresses the push service says no longer exist (404/410). This is the
 *  only reason a row is ever deleted by the sweep: a phone that is merely
 *  unreachable — flat battery, aeroplane, a push service having a bad hour —
 *  keeps its place, because forgetting it would end its reminders for good. */
async function forget(env: Env, endpoints: string[]): Promise<void> {
  if (!endpoints.length) return
  await env.DB.batch(
    endpoints.map((endpoint) =>
      env.DB.prepare('DELETE FROM subscriptions WHERE endpoint = ?').bind(endpoint),
    ),
  )
}

export interface SweepResult {
  considered: number
  due: number
  delivered: number
  gone: number
  failed: number
  deferred: number
}

/**
 * The quarter-hourly sweep. Reads everyone, works out whose evening it is, and
 * knocks — then writes down who was knocked on, so nobody is nudged twice.
 */
export async function sweep(env: Env, at = new Date()): Promise<SweepResult> {
  const misconfigured = vapidUsable(env)
  if (misconfigured) {
    // Nothing can be delivered until a person fixes this, and trying anyway just
    // buries the reason under a stack trace.
    console.error(`sweep: not sending — ${misconfigured}`)
    return { considered: 0, due: 0, delivered: 0, gone: 0, failed: 0, deferred: 0 }
  }

  const { results } = await env.DB.prepare(
    `SELECT endpoint, p256dh, auth, hour, tz, last_practiced_day, last_notified_day, failures
       FROM subscriptions`,
  ).all<SubscriptionRow>()

  const all = results ?? []
  const due = all.filter((row) => isDue(row, at))
  const batch = due.slice(0, MAX_PER_RUN)
  const deferred = due.length - batch.length
  if (deferred > 0) {
    // Never let a cap look like "everyone was reminded".
    console.warn(`sweep: ${deferred} reminders deferred to the next tick (cap ${MAX_PER_RUN})`)
  }
  if (!batch.length) {
    return { considered: all.length, due: due.length, delivered: 0, gone: 0, failed: 0, deferred }
  }

  let delivered = 0
  let gone: string[] = []
  let failed: { endpoint: string; error: unknown }[] = []
  try {
    ;({ delivered, gone, failed } = await sendPushBatch(
      batch.map(toSubscription),
      rawPayload(JSON.stringify({ kind: 'reminder' })),
      vapid(env),
      { ttl: REMINDER_TTL_SECONDS, urgency: 'high', topic: TOPIC },
    ))
  } catch (e) {
    // A batch only throws over something the caller got wrong, so every phone in
    // it is still owed a reminder: leave the rows exactly as they are and let the
    // next tick try again once somebody has fixed it.
    console.error('sweep: the batch could not be sent', e)
    return { considered: all.length, due: due.length, delivered: 0, gone: 0, failed: 0, deferred }
  }

  const goneSet = new Set(gone)
  const failedByEndpoint = new Map(failed.map((f) => [f.endpoint, f.error]))
  const now = Date.now()
  const statements: D1PreparedStatement[] = []

  for (const row of batch) {
    if (goneSet.has(row.endpoint)) continue // deleted below
    const failure = failedByEndpoint.get(row.endpoint)
    if (failure !== undefined) {
      statements.push(
        env.DB.prepare(
          `UPDATE subscriptions
              SET failures = failures + 1, last_error = ?, updated_at = ?
            WHERE endpoint = ?`,
        ).bind(String((failure as Error)?.message ?? failure).slice(0, 200), now, row.endpoint),
      )
      continue
    }
    // Knocked. Mark the phone's own local day, not the server's — that is the
    // day the phone will compare against when it decides whether to speak.
    statements.push(
      env.DB.prepare(
        `UPDATE subscriptions
            SET last_notified_day = ?, failures = 0, last_error = NULL, updated_at = ?
          WHERE endpoint = ?`,
      ).bind(localNow(row.tz, at).day, now, row.endpoint),
    )
  }

  if (statements.length) await env.DB.batch(statements)
  await forget(env, gone)

  return {
    considered: all.length,
    due: due.length,
    delivered,
    gone: gone.length,
    failed: failed.length,
    deferred,
  }
}
