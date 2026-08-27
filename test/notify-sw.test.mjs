/*
 * The service-worker half of the evening reminder (public/notify-sw.js), run
 * against a stand-in browser.
 *
 * This file exists because of how its subject fails. Everything here happens
 * while the app is closed and nobody is watching: a browser rotates a push
 * address, a subscription quietly disappears, a knock arrives on a day that
 * already counts. Break one of these and nothing goes red — reminders simply
 * stop arriving, and the first report is a person saying the feature turned
 * itself off. So they are pinned here.
 *
 *   node --test
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'

const KEY =
  'BME-bRW2AZa85mlOvVUORbC7VdTrKeXXLWxdV0-YOOswF6NnLDav8YML4lgMbZveHOd_xm_hMb13Vg1gJaHy9EI'
const SERVER = 'https://odia-reminder.example.workers.dev'
const TODAY = new Date().toLocaleDateString('en-CA')

const STATE = {
  enabled: true,
  hour: 20,
  tz: 'Asia/Kolkata',
  server: SERVER,
  vapidKey: KEY,
  name: 'Neel',
  streak: 7,
  lastPracticedDay: null,
  lastNotifiedDay: null,
}

/** Enough of a service worker's world to run the file in, and a record of
 *  everything it tried to do to the outside. */
function harness(state, { hasSubscription = false } = {}) {
  const calls = { subscribe: [], posts: [], notifications: [] }
  let stored = state ? JSON.stringify(state) : null
  const listeners = {}

  const cache = {
    match: async () => (stored === null ? undefined : { json: async () => JSON.parse(stored) }),
    put: async (_url, res) => {
      stored = await res.text()
    },
  }
  const existing = hasSubscription ? { endpoint: 'https://push.example/OLD' } : null

  const self = {
    atob: globalThis.atob,
    btoa: globalThis.btoa,
    registration: {
      scope: 'https://kiger9.github.io/odia-app/',
      showNotification: async (title, opts) => calls.notifications.push({ title, ...opts }),
      pushManager: {
        getSubscription: async () => existing,
        subscribe: async (opts) => {
          calls.subscribe.push(opts)
          return {
            endpoint: 'https://push.example/NEW',
            getKey: (name) =>
              new TextEncoder().encode(name === 'p256dh' ? 'p'.repeat(65) : 'a'.repeat(16)),
          }
        },
      },
    },
    clients: { matchAll: async () => [], openWindow: async () => {} },
    addEventListener: (type, fn) => {
      ;(listeners[type] ??= []).push(fn)
    },
  }

  const context = {
    self,
    caches: { open: async () => cache },
    Response: globalThis.Response,
    URL,
    TextEncoder,
    Uint8Array,
    Date,
    Promise,
    JSON,
    console,
    fetch: async (url, init) => {
      calls.posts.push({ url, body: JSON.parse(init.body) })
      return { ok: true }
    },
  }
  vm.createContext(context)
  vm.runInContext(readFileSync('public/notify-sw.js', 'utf8'), context)

  return {
    calls,
    state: () => (stored === null ? null : JSON.parse(stored)),
    async dispatch(type, event = {}) {
      const waits = []
      for (const fn of listeners[type] ?? []) fn({ ...event, waitUntil: (p) => waits.push(p) })
      await Promise.all(waits)
    },
  }
}

test('a rotated push address is replaced and re-registered', async () => {
  const h = harness(STATE)
  await h.dispatch('pushsubscriptionchange', {
    oldSubscription: { endpoint: 'https://push.example/OLD' },
  })

  assert.equal(h.calls.subscribe.length, 1)
  assert.equal(h.calls.subscribe[0].userVisibleOnly, true)
  // An uncompressed P-256 point, i.e. our VAPID key survived the round trip
  // through base64url — a subscription against the wrong key can never be
  // pushed to.
  assert.equal(h.calls.subscribe[0].applicationServerKey.length, 65)

  const post = h.calls.posts[0]
  assert.equal(post.url, `${SERVER}/subscribe`)
  assert.equal(post.body.subscription.endpoint, 'https://push.example/NEW')
  // Without this the service keeps knocking on an address nobody answers.
  assert.equal(post.body.replaces, 'https://push.example/OLD')
  assert.equal(post.body.hour, 20)
  assert.equal(post.body.tz, 'Asia/Kolkata')
})

test('a replacement supplied by the browser is used as it is', async () => {
  const h = harness(STATE)
  await h.dispatch('pushsubscriptionchange', {
    oldSubscription: { endpoint: 'https://push.example/OLD' },
    newSubscription: {
      endpoint: 'https://push.example/GIVEN',
      getKey: () => new TextEncoder().encode('k'.repeat(16)),
    },
  })

  assert.equal(h.calls.subscribe.length, 0)
  assert.equal(h.calls.posts[0].body.subscription.endpoint, 'https://push.example/GIVEN')
})

test('nobody is signed up behind the learner’s back', async () => {
  const h = harness({ ...STATE, enabled: false })
  await h.dispatch('pushsubscriptionchange', { oldSubscription: { endpoint: 'x' } })

  assert.equal(h.calls.subscribe.length, 0)
  assert.equal(h.calls.posts.length, 0)
})

test('an activation rebuilds a subscription that went missing', async () => {
  const h = harness(STATE, { hasSubscription: false })
  await h.dispatch('activate')

  assert.equal(h.calls.subscribe.length, 1)
  assert.equal(h.calls.posts[0].url, `${SERVER}/subscribe`)
})

test('an activation leaves a healthy subscription alone', async () => {
  const h = harness(STATE, { hasSubscription: true })
  await h.dispatch('activate')

  assert.equal(h.calls.subscribe.length, 0)
  assert.equal(h.calls.posts.length, 0)
})

test('a knock posts the reminder and marks the day', async () => {
  const h = harness(STATE)
  await h.dispatch('push', { data: { json: () => ({ kind: 'reminder' }) } })

  assert.equal(h.calls.notifications.length, 1)
  assert.match(h.calls.notifications[0].title, /7-day streak/)
  assert.equal(h.state().lastNotifiedDay, TODAY)
})

test('a knock on a day that already counts says well done, not nothing', async () => {
  // Silence is not an option: the browser posts its own "this site was updated
  // in the background" notice in our place, and doing that repeatedly costs the
  // app its push subscription.
  const h = harness({ ...STATE, lastPracticedDay: TODAY })
  await h.dispatch('push', { data: { json: () => ({ kind: 'reminder' }) } })

  assert.equal(h.calls.notifications.length, 1)
  assert.equal(h.calls.notifications[0].title, 'Done for today ✓')
})

test('a knock with no readable payload and no state still shows something', async () => {
  const h = harness(null)
  await h.dispatch('push', {
    data: {
      json: () => {
        throw new Error('no payload')
      },
    },
  })

  assert.equal(h.calls.notifications.length, 1)
})
