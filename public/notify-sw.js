/* Odia in Small Bites — the evening practice reminder, service-worker half.
 *
 * This file is pulled into the generated service worker (see `workbox.importScripts`
 * in vite.config.ts). It must stay plain, dependency-free JavaScript, and it must
 * never throw at load time — if it did, the whole service worker would fail to
 * install and the app would lose offline support.
 *
 * Three things wake this worker: a knock from the reminder service (`push` — the
 * only route that reaches a closed iPhone), Periodic Background Sync, which
 * Android offers and Apple doesn't, and `pushsubscriptionchange`, which is the
 * browser telling us it has thrown this phone's push address away. The first two
 * post a reminder; the third has to go and get a new address, because nobody
 * else will: the page may not be opened for days, and until it is, every knock
 * the service sends goes to an address that no longer exists. That is the whole
 * of "reminders stopped arriving once I closed the app".
 *
 * Either way the wording is written here, from a small blob of state the page
 * leaves in the Cache API — which is why the service can know nothing about the
 * learner. Page half: src/notifications.ts.
 */
(function () {
  'use strict'

  var CACHE = 'odia-notify'
  var TAG = 'odia-reminder'

  function stateUrl() {
    return new URL('notify-state', self.registration.scope).href
  }

  function readState() {
    return caches
      .open(CACHE)
      .then(function (cache) {
        return cache.match(stateUrl())
      })
      .then(function (res) {
        return res ? res.json() : null
      })
      .catch(function () {
        return null
      })
  }

  function writeState(state) {
    return caches
      .open(CACHE)
      .then(function (cache) {
        return cache.put(
          stateUrl(),
          new Response(JSON.stringify(state), {
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      })
      .catch(function () {})
  }

  // Local calendar date as YYYY-MM-DD — same convention the streak uses.
  function localDay(d) {
    return d.toLocaleDateString('en-CA')
  }

  /* Reminder wording. Kept in step with the copy in src/notifications.ts — if you
     change one, change the other. */
  function compose(state) {
    var name = (state.name || '').trim()
    var streak = state.streak || 0
    var hi = name ? name + ', ' : ''
    if (streak > 0) {
      return {
        title: '🔥 ' + streak + '-day streak',
        body: hi + 'a few minutes of Odia keeps it alive.',
      }
    }
    return {
      title: 'Time for a small bite 🇮🇳',
      body: hi + 'practise a little Odia and start a streak tonight.',
    }
  }

  /* When the reminder service knocks on a day that already counts. The knock has
     to produce something visible — the browser insists, and posts its own generic
     "site updated in the background" notice if we stay silent — so it may as well
     be good news rather than a nag. This only happens when the learner practised
     while offline, or in the last minutes before their reminder hour. */
  function composePraise(state) {
    var name = (state.name || '').trim()
    var streak = state.streak || 0
    var hi = name ? name + ', ' : ''
    if (streak > 1) {
      return { title: 'Done for today ✓', body: hi + streak + ' days in a row.' }
    }
    return { title: 'Done for today ✓', body: hi + 'nicely done.' }
  }

  /* One shared tag throughout, so a later notification replaces the earlier one
     rather than stacking. `renotify` is what decides whether replacing it also
     buzzes the phone again. */
  function notify(text, renotify) {
    return self.registration.showNotification(text.title, {
      body: text.body,
      icon: new URL('icon-192.png', self.registration.scope).href,
      badge: new URL('icon-192.png', self.registration.scope).href,
      tag: TAG,
      renotify: !!renotify,
      data: { url: self.registration.scope },
    })
  }

  function showReminder(state) {
    return notify(compose(state), true)
  }

  /* Is tonight's reminder still owed? Called whenever the browser gives us a tick. */
  function maybeRemind() {
    return readState().then(function (state) {
      if (!state || !state.enabled) return
      var now = new Date()
      var today = localDay(now)
      // Only in the evening, from the chosen hour until midnight.
      if (now.getHours() < (state.hour || 19)) return
      // Already nudged today, or they've already practised — leave them alone.
      if (state.lastNotifiedDay === today) return
      if (state.lastPracticedDay === today) return
      state.lastNotifiedDay = today
      return writeState(state).then(function () {
        return showReminder(state)
      })
    })
  }

  /* A knock from the reminder service. This is the path that works on an iPhone
     with the app fully closed — the only one Apple allows.

     The knock is deliberately wordless: the service knows nothing about the
     learner, so the reminder is written here, on the phone, from the name and
     streak already stored locally. */
  function onKnock(isTest) {
    return readState().then(function (state) {
      var s = state || {}
      var today = localDay(new Date())

      /* Every branch below MUST end in a visible notification. A push that shows
         nothing is not silence — the browser posts its own "this site was updated
         in the background" notice in our place, and doing that repeatedly costs
         the app its push subscription. Where we've already spoken today, we show
         the same thing again under the shared tag: that replaces the banner
         already on screen instead of buzzing a second time. */
      if (isTest) return notify(compose(s), true)
      if (s.lastPracticedDay === today) return notify(composePraise(s), true)
      if (s.lastNotifiedDay === today) return notify(compose(s), false)

      s.lastNotifiedDay = today
      return writeState(s).then(function () {
        return notify(compose(s), true)
      })
    })
  }

  /* --- keeping the push address alive ---------------------------------------
     The address a push service hands out is not permanent: it is rotated, and it
     is dropped outright when a browser decides an app has been idle. The page
     repairs that when it is next opened, but "next opened" is precisely what a
     reminder exists to bring about, so the worker has to be able to do it alone.

     Everything needed is in the state blob the page leaves behind: where the
     service lives, and the public key to subscribe against. */

  function urlBase64ToBytes(base64) {
    var padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    var raw = self.atob(padded)
    var bytes = new Uint8Array(raw.length)
    for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
    return bytes
  }

  function postJson(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(function () {
      return null
    })
  }

  function serialize(subscription) {
    function b64(name) {
      var key = subscription.getKey(name)
      if (!key) return null
      var bytes = new Uint8Array(key)
      var binary = ''
      for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      return self.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }
    var p256dh = b64('p256dh')
    var auth = b64('auth')
    if (!p256dh || !auth) return null
    return { endpoint: subscription.endpoint, keys: { p256dh: p256dh, auth: auth } }
  }

  /* Take out a fresh subscription and tell the service to swap it for the old
     one. `oldEndpoint` may be absent — a subscription the browser dropped while
     we weren't looking leaves nothing to name — and `ready` may already hold the
     replacement, which some browsers hand over with the event rather than making
     us ask for one. */
  function resubscribe(oldEndpoint, ready) {
    return readState().then(function (state) {
      var s = state || {}
      if (!s.enabled || !s.server || !s.vapidKey) return
      if (!ready && !self.registration.pushManager) return
      return Promise.resolve(
        ready ||
          self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToBytes(s.vapidKey),
          }),
      )
        .then(function (subscription) {
          var body = serialize(subscription)
          if (!body) return
          return postJson(s.server + '/subscribe', {
            subscription: body,
            hour: s.hour || 19,
            tz: s.tz || 'UTC',
            lastPracticedDay: s.lastPracticedDay || null,
            replaces: oldEndpoint || undefined,
          })
        })
        .catch(function () {
          /* The page tries again on its next launch — see reconcileReminders(). */
        })
    })
  }

  /* The subscription can also be gone without the event ever firing: some
     browsers drop it during an update, and Safari has been known to lose it
     across a restart. An activation is a cheap moment to look. */
  function ensureSubscribed() {
    return readState().then(function (state) {
      if (!state || !state.enabled || !self.registration.pushManager) return
      return self.registration.pushManager.getSubscription().then(function (existing) {
        if (existing) return
        return resubscribe(null, null)
      })
    })
  }

  self.addEventListener('pushsubscriptionchange', function (event) {
    var old = event.oldSubscription && event.oldSubscription.endpoint
    event.waitUntil(resubscribe(old, event.newSubscription || null))
  })

  self.addEventListener('activate', function (event) {
    event.waitUntil(ensureSubscribed())
  })

  self.addEventListener('push', function (event) {
    var kind = ''
    try {
      kind = ((event.data && event.data.json()) || {}).kind || ''
    } catch {
      /* a knock with no readable payload is still a knock */
    }
    event.waitUntil(onKnock(kind === 'test-knock'))
  })

  self.addEventListener('periodicsync', function (event) {
    if (event.tag === TAG) event.waitUntil(maybeRemind())
  })

  // Some browsers only offer one-shot sync; harmless if it never fires.
  self.addEventListener('sync', function (event) {
    if (event.tag === TAG) event.waitUntil(maybeRemind())
  })

  self.addEventListener('message', function (event) {
    var data = event.data || {}
    if (data.type === 'odia-notify-check') event.waitUntil(maybeRemind())
  })

  // Tapping the reminder should land in the app, reusing the open window if there is one.
  self.addEventListener('notificationclick', function (event) {
    if (event.notification.tag !== TAG) return
    event.notification.close()
    var scope = self.registration.scope
    event.waitUntil(
      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then(function (list) {
          for (var i = 0; i < list.length; i++) {
            if (list[i].url.indexOf(scope) === 0 && 'focus' in list[i]) return list[i].focus()
          }
          if (self.clients.openWindow) return self.clients.openWindow(scope)
        }),
    )
  })
})()
