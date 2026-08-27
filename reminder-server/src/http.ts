// Request plumbing: CORS, JSON in, JSON out.
//
// The app is served from GitHub Pages and this service lives on workers.dev, so
// every call the phone makes is cross-origin and each one is preceded by a
// preflight. Getting that wrong fails exactly the way a network outage does,
// which is why the allowed origins are configuration rather than a guess.

export interface Env {
  DB: D1Database
  VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
  VAPID_SUBJECT: string
  ALLOWED_ORIGINS: string
  /** Optional. Mixed into the sync-code hash so a stolen database isn't a
   *  head start on guessing codes offline. */
  BACKUP_PEPPER?: string
}

function allowed(env: Env): string[] {
  return (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
}

export function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin')
  const list = allowed(env)
  // An unknown origin gets no CORS headers at all: the browser then refuses the
  // response, which is the point.
  if (!origin || (list.length > 0 && !list.includes(origin))) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function json(
  request: Request,
  env: Env,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders(request, env),
    },
  })
}

export function text(request: Request, env: Env, message: string, status: number): Response {
  return new Response(message, {
    status,
    headers: { 'Content-Type': 'text/plain', ...corsHeaders(request, env) },
  })
}

/** Body as an object, or null for anything that isn't one. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/** A push endpoint we are willing to store. Anything else is a bug or an abuse. */
export function validEndpoint(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 1024) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}
