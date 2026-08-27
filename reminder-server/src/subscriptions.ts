// The endpoints a phone uses to sign up, correct itself and drop out.
//
// Everything here has to be safe to call over and over: the app re-registers on
// a schedule precisely because push addresses go stale quietly, and the service
// worker re-registers on its own whenever the browser rotates one. Both paths
// land here, so `/subscribe` is an upsert and `/unsubscribe` is a no-op on an
// address we don't have.

import { json, readJson, validEndpoint, type Env } from './http'
import { knockOnce, type SubscriptionRow } from './knock'

const HOURS = [18, 19, 20, 21]

function validDay(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function validTz(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: value })
    return true
  } catch {
    return false
  }
}

async function row(env: Env, endpoint: string): Promise<SubscriptionRow | null> {
  return await env.DB.prepare(
    `SELECT endpoint, p256dh, auth, hour, tz, last_practiced_day, last_notified_day, failures
       FROM subscriptions WHERE endpoint = ?`,
  )
    .bind(endpoint)
    .first<SubscriptionRow>()
}

export async function subscribe(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request)
  const subscription = body?.subscription as
    | { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } }
    | undefined

  const endpoint = subscription?.endpoint
  const p256dh = subscription?.keys?.p256dh
  const auth = subscription?.keys?.auth
  if (!validEndpoint(endpoint) || typeof p256dh !== 'string' || typeof auth !== 'string') {
    return json(request, env, { error: 'a subscription with an endpoint and keys is required' }, 400)
  }

  const hour = HOURS.includes(Number(body?.hour)) ? Number(body?.hour) : 19
  const tz = validTz(body?.tz) ? body.tz : 'UTC'
  const lastPracticedDay = validDay(body?.lastPracticedDay) ? body.lastPracticedDay : null
  const replaces = validEndpoint(body?.replaces) ? body.replaces : null

  // A rotated address is the same phone with a new name, so the old row's two
  // dates come across with it. Carrying tonight's "already knocked" mark is what
  // stops the replacement being knocked on a second time the same evening; the
  // practised day matters when the phone rotating the address has been offline
  // and is no longer the best-informed party about its own week.
  let carriedNotifiedDay: string | null = null
  let carriedPracticedDay: string | null = null
  if (replaces && replaces !== endpoint) {
    const old = await row(env, replaces)
    carriedNotifiedDay = old?.last_notified_day ?? null
    carriedPracticedDay = old?.last_practiced_day ?? null
    await env.DB.prepare('DELETE FROM subscriptions WHERE endpoint = ?').bind(replaces).run()
  }
  const practicedDay =
    [lastPracticedDay, carriedPracticedDay].filter((d): d is string => Boolean(d)).sort().pop() ??
    null

  const now = Date.now()
  await env.DB.prepare(
    `INSERT INTO subscriptions
       (endpoint, p256dh, auth, hour, tz, last_practiced_day, last_notified_day,
        failures, last_error, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET
       p256dh = excluded.p256dh,
       auth = excluded.auth,
       hour = excluded.hour,
       tz = excluded.tz,
       -- Only ever move the practised day forward: a phone that has been offline
       -- for a week must not talk the service out of what it already knows.
       last_practiced_day = NULLIF(
         MAX(
           COALESCE(excluded.last_practiced_day, ''),
           COALESCE(subscriptions.last_practiced_day, '')
         ),
         ''
       ),
       last_notified_day = COALESCE(excluded.last_notified_day, subscriptions.last_notified_day),
       failures = 0,
       last_error = NULL,
       updated_at = excluded.updated_at`,
  )
    .bind(endpoint, p256dh, auth, hour, tz, practicedDay, carriedNotifiedDay, now, now)
    .run()

  // The app checks this against the key it subscribed with. A service holding a
  // different key can accept an address perfectly happily and never manage to
  // push to it, which is a silent evening nobody can explain.
  return json(request, env, { ok: true, vapidPublicKey: env.VAPID_PUBLIC_KEY })
}

export async function unsubscribe(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request)
  if (!validEndpoint(body?.endpoint)) return json(request, env, { error: 'endpoint required' }, 400)
  await env.DB.prepare('DELETE FROM subscriptions WHERE endpoint = ?').bind(body.endpoint).run()
  return json(request, env, { ok: true })
}

/** "Today already counts — stay quiet tonight." */
export async function practiced(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request)
  if (!validEndpoint(body?.endpoint) || !validDay(body?.lastPracticedDay)) {
    return json(request, env, { error: 'endpoint and lastPracticedDay required' }, 400)
  }
  const result = await env.DB.prepare(
    `UPDATE subscriptions
        SET last_practiced_day = NULLIF(MAX(COALESCE(last_practiced_day, ''), ?), ''),
            updated_at = ?
      WHERE endpoint = ?`,
  )
    .bind(body.lastPracticedDay, Date.now(), body.endpoint)
    .run()
  // Nothing to update means the service has forgotten this phone — worth saying,
  // so the app can sign up again rather than assume it is on the list.
  if (!result.meta.changes) return json(request, env, { error: 'unknown endpoint' }, 404)
  return json(request, env, { ok: true })
}

/** What the service knows about this phone. The app uses it to put a wiped
 *  Settings screen back together, and to tell "we were never signed up" apart
 *  from "the service had a bad minute". */
export async function status(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request)
  if (!validEndpoint(body?.endpoint)) return json(request, env, { error: 'endpoint required' }, 400)
  const found = await row(env, body.endpoint)
  if (!found) return json(request, env, { known: false })
  return json(request, env, {
    known: true,
    hour: found.hour,
    tz: found.tz,
    lastPracticedDay: found.last_practiced_day,
    lastNotifiedDay: found.last_notified_day,
    failures: found.failures,
  })
}

/** The test button in Settings: a real knock, sent the real way, so what it
 *  proves is the thing that actually breaks. */
export async function test(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request)
  if (!validEndpoint(body?.endpoint)) return json(request, env, { error: 'endpoint required' }, 400)
  const found = await row(env, body.endpoint)
  if (!found) return json(request, env, { error: 'unknown endpoint' }, 404)
  const delivered = await knockOnce(env, found, 'test-knock')
  if (!delivered) return json(request, env, { error: 'the push service would not take it' }, 502)
  return json(request, env, { ok: true })
}
