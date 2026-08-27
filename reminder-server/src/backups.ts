// Keeping a copy of a learner's progress off their phone.
//
// The sync code the app shows in Settings is the whole credential — twelve
// characters of randomness, sixty bits, and no way to recover it. That is a
// deliberate trade against making a family invent passwords, and it puts two
// obligations here: never store the code itself, and make guessing one expensive.

import { json, readJson, type Env } from './http'

const CODE_LENGTH = 12
const CODE_PATTERN = /^[0-9A-HJ-KMNP-TV-Z]{12}$/
/** A backup is a streak, some lesson rows and a handful of settings. Anything
 *  approaching a megabyte is not that. */
const MAX_PAYLOAD_BYTES = 512 * 1024

const RESTORE_LIMIT = 10
const RESTORE_WINDOW_MS = 60 * 60 * 1000

/** The code is hashed before it is written down, so a copy of the database is
 *  not a list of everyone's progress. The pepper — a secret this service holds
 *  and the database doesn't — is what stops that hash being brute-forced offline
 *  through an alphabet this small. */
async function hashCode(code: string, env: Env): Promise<string> {
  const data = new TextEncoder().encode(`${env.BACKUP_PEPPER ?? ''}:${code}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** The app folds lookalike characters before sending, but a code typed into an
 *  older build might not have been, so fold them here too. */
function normalise(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const cleaned = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1')
    .replace(/U/g, 'V')
  if (cleaned.length !== CODE_LENGTH || !CODE_PATTERN.test(cleaned)) return null
  return cleaned
}

function caller(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown'
}

/** True when this caller has spent its guesses for the hour. */
async function rateLimited(request: Request, env: Env): Promise<boolean> {
  const who = await hashCode(caller(request), env)
  const now = Date.now()
  const existing = await env.DB.prepare(
    'SELECT tries, window_start FROM restore_attempts WHERE caller = ?',
  )
    .bind(who)
    .first<{ tries: number; window_start: number }>()

  if (!existing || now - existing.window_start > RESTORE_WINDOW_MS) {
    await env.DB.prepare(
      `INSERT INTO restore_attempts (caller, tries, window_start) VALUES (?, 1, ?)
         ON CONFLICT(caller) DO UPDATE SET tries = 1, window_start = excluded.window_start`,
    )
      .bind(who, now)
      .run()
    return false
  }
  if (existing.tries >= RESTORE_LIMIT) return true
  await env.DB.prepare('UPDATE restore_attempts SET tries = tries + 1 WHERE caller = ?')
    .bind(who)
    .run()
  return false
}

export async function backup(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request)
  const code = normalise(body?.code)
  if (!code) return json(request, env, { error: 'a 12-character sync code is required' }, 400)
  if (body?.data === undefined) return json(request, env, { error: 'data required' }, 400)

  const payload = JSON.stringify(body.data)
  if (payload.length > MAX_PAYLOAD_BYTES) {
    return json(request, env, { error: 'that backup is too large' }, 413)
  }

  const savedAt = Date.now()
  await env.DB.prepare(
    `INSERT INTO backups (code_hash, payload, saved_at) VALUES (?, ?, ?)
       ON CONFLICT(code_hash) DO UPDATE SET payload = excluded.payload, saved_at = excluded.saved_at`,
  )
    .bind(await hashCode(code, env), payload, savedAt)
    .run()

  return json(request, env, { ok: true, savedAt })
}

export async function restore(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request)
  const code = normalise(body?.code)
  if (!code) return json(request, env, { error: 'a 12-character sync code is required' }, 400)
  if (await rateLimited(request, env)) {
    return json(request, env, { error: 'too many tries — wait an hour' }, 429)
  }

  const found = await env.DB.prepare('SELECT payload, saved_at FROM backups WHERE code_hash = ?')
    .bind(await hashCode(code, env))
    .first<{ payload: string; saved_at: number }>()
  if (!found) return json(request, env, { error: 'no backup under that code' }, 404)

  return json(request, env, { data: JSON.parse(found.payload), savedAt: found.saved_at })
}

/** Housekeeping for the sweep: spent rate-limit windows are litter. */
export async function pruneRateLimits(env: Env): Promise<void> {
  await env.DB.prepare('DELETE FROM restore_attempts WHERE window_start < ?')
    .bind(Date.now() - RESTORE_WINDOW_MS)
    .run()
}
