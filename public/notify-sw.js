/* Odia in Small Bites — the evening practice reminder, service-worker half.
 *
 * This file is pulled into the generated service worker (see `workbox.importScripts`
 * in vite.config.ts). It must stay plain, dependency-free JavaScript, and it must
 * never throw at load time — if it did, the whole service worker would fail to
 * install and the app would lose offline support.
 *
 * There is no server behind this app, so the reminder is produced on the device:
 * the browser wakes this worker up (Periodic Background Sync) and we decide, from
 * a small blob of state the page leaves in the Cache API, whether tonight's
 * reminder is still owed. The page half lives in src/notifications.ts.
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

  function showReminder(state) {
    var text = compose(state)
    return self.registration.showNotification(text.title, {
      body: text.body,
      icon: new URL('icon-192.png', self.registration.scope).href,
      badge: new URL('icon-192.png', self.registration.scope).href,
      tag: TAG,
      renotify: true,
      data: { url: self.registration.scope },
    })
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
