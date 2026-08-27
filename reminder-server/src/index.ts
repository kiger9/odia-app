/*
 * Odia in Small Bites — the reminder service.
 *
 * A Cloudflare Worker whose entire job is to knock on a phone in the evening.
 * Apple gives a closed web app no way to wake itself, so on an iPhone this is
 * the only thing that can deliver a reminder at all: the knock wakes the app's
 * service worker, and the service worker writes the reminder from what the phone
 * already knows.
 *
 * It is built to know as little as possible. A row here is a push address, an
 * hour, a timezone and two dates. No name, no streak, no account, nothing that
 * would make this database interesting to steal. (The progress backups it also
 * keeps are filed under a hash of a code that only ever exists on the learner's
 * phone — see backups.ts.)
 *
 * Deploying it, and the secrets it needs, are in README.md.
 */

import { corsHeaders, json, text, type Env } from './http'
import { pruneRateLimits, backup, restore } from './backups'
import { sweep, vapidUsable } from './knock'
import { practiced, status, subscribe, test, unsubscribe } from './subscriptions'

type Handler = (request: Request, env: Env) => Promise<Response>

const ROUTES: Record<string, Handler> = {
  '/subscribe': subscribe,
  '/unsubscribe': unsubscribe,
  '/practiced': practiced,
  '/status': status,
  '/test': test,
  '/backup': backup,
  '/restore': restore,
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) })
    }

    // Enough to tell a deployed service from a missing one, and to check that
    // the key it holds is the key the app subscribes with — a mismatch there is
    // invisible until an evening goes by in silence.
    if (pathname === '/health' || pathname === '/') {
      return json(request, env, {
        ok: true,
        service: 'odia-reminder',
        vapidPublicKey: env.VAPID_PUBLIC_KEY,
        vapidConfigured: vapidUsable(env) ?? true,
      })
    }

    const handler = ROUTES[pathname]
    if (!handler) return text(request, env, 'not found', 404)
    if (request.method !== 'POST') return text(request, env, 'method not allowed', 405)

    try {
      return await handler(request, env)
    } catch (e) {
      // A phone can do nothing useful with a stack trace, and the app treats any
      // non-2xx as "try again later", which is the right thing to do here.
      console.error(`${pathname} failed`, e)
      return json(request, env, { error: 'something went wrong' }, 500)
    }
  },

  // Every quarter hour: work out whose evening it is, and knock.
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        try {
          const result = await sweep(env)
          console.log('sweep', JSON.stringify(result))
        } catch (e) {
          console.error('sweep failed', e)
        }
        await pruneRateLimits(env).catch(() => {})
      })(),
    )
  },
}
