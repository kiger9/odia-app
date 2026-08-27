// Evening practice reminders — the page half. (The service-worker half, which is
// what actually fires when the app is closed, lives in public/notify-sw.js.)
//
// A reminder can arrive by three routes, tried in that order of dependability:
//   • the reminder service knocks (see reminder-server/) and the service worker
//     wakes to post it — the only route that works on a closed iPhone;
//   • Periodic Background Sync wakes the service worker on its own, which
//     Android does but Apple doesn't;
//   • if the app is open or parked in the background at the time, a plain timer
//     in here posts it instead.
// All three write the same "already nudged today" mark, so they never double up.
//
// Wherever it comes from, the wording is composed on the phone — a woken service
// worker can't read React state, so the name, the streak and whether today
// already counts are mirrored into the Cache API for it. That is also why the
// service can stay ignorant of all three.
//
// One rule runs through everything below, learned the hard way: the switch in
// Settings is a *picture* of two things the phone owns — the notification
// permission and the push subscription — and never the other way round. Anything
// we keep in localStorage is a cache of that picture, and Safari is entitled to
// throw it away between sessions. So we read the phone on every launch and put
// the picture back, rather than believing our own notes.

import { db } from './db'
import {
  unsubscribe as pushUnsubscribe,
  serializeSubscription,
  urlBase64ToUint8Array,
} from '@mmmike/web-push'

const ENABLED_KEY = 'odia:notifyEnabled'
const HOUR_KEY = 'odia:notifyHour'
const ASKED_KEY = 'odia:notifyAsked'
const ENDPOINT_KEY = 'odia:notifyEndpoint'
const REPORTED_KEY = 'odia:notifyReportedDay'

// The one piece of this app that isn't a static file: a small service that wakes
// hourly and knocks on phones whose evening it is. An iPhone gives a closed web
// app no way to wake itself, so on iOS this is the only thing that can deliver a
// reminder. See reminder-server/ for what it does — which is very little: it
// knows an address, an hour and a timezone, and nothing about the learner.
export const REMINDER_SERVER = 'https://odia-reminder.neel-upadhye.workers.dev'
const VAPID_PUBLIC_KEY =
  'BME-bRW2AZa85mlOvVUORbC7VdTrKeXXLWxdV0-YOOswF6NnLDav8YML4lgMbZveHOd_xm_hMb13Vg1gJaHy9EI'

const CACHE = 'odia-notify'
const TAG = 'odia-reminder'
const DEFAULT_HOUR = 19

// --- the evening the learner picks ---
export interface HourOption {
  value: number
  label: string
}
export const HOUR_OPTIONS: HourOption[] = [
  { value: 18, label: '6:00 pm' },
  { value: 19, label: '7:00 pm' },
  { value: 20, label: '8:00 pm' },
  { value: 21, label: '9:00 pm' },
]

export function getReminderHour(): number {
  const raw = Number(localStorage.getItem(HOUR_KEY))
  return HOUR_OPTIONS.some((o) => o.value === raw) ? raw : DEFAULT_HOUR
}

export async function setReminderHour(hour: number): Promise<void> {
  localStorage.setItem(HOUR_KEY, String(hour))
  await syncNotificationState()
  // The service decides when to knock, so it needs to hear about the new hour.
  if (remindersOn()) void registerWithServer()
}

// --- what this device is capable of ---
export type Support = 'ok' | 'needs-install' | 'unsupported'

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true
  )
}

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function notificationSupport(): Support {
  if ('serviceWorker' in navigator && typeof Notification !== 'undefined') return 'ok'
  // On an iPhone the Notification API only exists once the app has been added to
  // the home screen — worth saying so rather than calling it unsupported.
  if (isIOS() && !isStandalone()) return 'needs-install'
  return 'unsupported'
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
}

// The preference the learner set. Reminders are only really on when the phone
// also still allows them (they can be revoked in the phone's own settings).
export function reminderPreference(): boolean {
  return localStorage.getItem(ENABLED_KEY) === 'true'
}

export function remindersOn(): boolean {
  return reminderPreference() && notificationPermission() === 'granted'
}

// --- the "have we offered this yet?" flag used by first-run setup ---
export function hasBeenAskedNotifications(): boolean {
  return localStorage.getItem(ASKED_KEY) === 'true'
}
export function markNotificationsAsked(): void {
  localStorage.setItem(ASKED_KEY, 'true')
}

// --- the state blob the service worker reads ---
// It carries the address of the service and the push key as well as the wording
// ingredients, because a woken worker whose subscription has just been rotated
// has to be able to register the new one on its own — see `pushsubscriptionchange`
// in public/notify-sw.js. Nothing here is secret: the VAPID public key is public
// by definition, and the rest never leaves the phone.
interface NotifyState {
  enabled: boolean
  hour: number
  tz: string
  server: string
  vapidKey: string
  name: string
  streak: number
  lastPracticedDay: string | null
  lastNotifiedDay?: string | null
}

function stateUrl(): string {
  return `${location.origin}${import.meta.env.BASE_URL}notify-state`
}

async function readState(): Promise<Partial<NotifyState>> {
  try {
    const cache = await caches.open(CACHE)
    const res = await cache.match(stateUrl())
    return res ? await res.json() : {}
  } catch {
    return {}
  }
}

async function putState(state: Partial<NotifyState>): Promise<void> {
  const cache = await caches.open(CACHE)
  await cache.put(
    stateUrl(),
    new Response(JSON.stringify(state), { headers: { 'Content-Type': 'application/json' } }),
  )
}

// Mirror the current name/streak/settings to where the service worker can see them.
// Cheap and idempotent — call it whenever any of those might have changed.
export async function syncNotificationState(): Promise<void> {
  if (!('caches' in window)) return
  try {
    const [existing, stats] = await Promise.all([readState(), db.stats.get('main')])
    const lastPracticedDay = stats?.lastPracticedDate ?? stats?.lastGoalMetDate ?? null
    await putState({
      ...existing,
      enabled: remindersOn(),
      hour: getReminderHour(),
      tz: timezone(),
      server: REMINDER_SERVER,
      vapidKey: VAPID_PUBLIC_KEY,
      name: (localStorage.getItem('odia:name') ?? '').trim(),
      streak: stats?.streak ?? 0,
      lastPracticedDay,
    })
    void reportPracticed(lastPracticedDay)
  } catch {
    // Never let a reminder detail break the lesson the learner is doing.
  }
}

// --- reaching the service worker ---
// `navigator.serviceWorker.ready` simply never settles when there is no worker
// (private windows, a failed registration, browsers with it switched off), so it
// is always raced against a timer — nothing here may leave the UI waiting.
//
// The default is generous because the short one was a lie: on a cold start an
// iPhone can take longer than a few seconds to hand the worker over, and giving
// up early made a perfectly healthy phone report that it couldn't do push.
// Callers with a person waiting on them pass something shorter.
function swReady(timeoutMs = 15000): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null)
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]).catch(() => null)
}

// --- background wake-ups ---
interface PeriodicSyncManager {
  register: (tag: string, opts: { minInterval: number }) => Promise<void>
  unregister: (tag: string) => Promise<void>
}
type SyncCapableRegistration = ServiceWorkerRegistration & { periodicSync?: PeriodicSyncManager }

async function registerBackgroundSync(): Promise<void> {
  try {
    const reg = (await swReady()) as SyncCapableRegistration | null
    if (!reg?.periodicSync) return
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as PermissionName,
    })
    if (status.state !== 'granted') return
    // We ask for hourly ticks; the browser clamps this to whatever it thinks is
    // reasonable. More ticks simply means a better chance of one landing in the
    // evening window, when the reminder is actually due.
    await reg.periodicSync.register(TAG, { minInterval: 60 * 60 * 1000 })
  } catch {
    // Not supported here (Safari, Firefox, un-installed PWA) — the in-app timer
    // below is the fallback.
  }
}

async function unregisterBackgroundSync(): Promise<void> {
  try {
    const reg = (await swReady()) as SyncCapableRegistration | null
    await reg?.periodicSync?.unregister(TAG)
  } catch {
    /* nothing was registered */
  }
}

// --- this phone's push address ---
// We drive the PushManager here rather than using the library's `subscribe()`,
// which calls `Notification.requestPermission()` on every call. WebKit answers
// that with "denied" whenever it isn't running inside a tap — so the daily
// re-registration on launch reported a blocked phone every single time the app
// was opened, which is what made reminders look like they switched themselves
// off overnight. Permission is only ever *asked for* from a tap; the rest of the
// time we work with the answer the phone already gave us.

export type PushOutcome =
  | { status: 'subscribed'; subscription: PushSubscription; isNew: boolean }
  | { status: 'unsupported' }
  | { status: 'needs-permission' }
  | { status: 'refused' }
  | { status: 'no-push'; detail: string }

function pushSupported(): boolean {
  return notificationSupport() === 'ok' && 'PushManager' in window
}

// Is this subscription one the reminder service can actually push to? A
// subscription made with a different VAPID key would be rejected by the push
// service, so it may as well not exist.
function boundToOurKey(subscription: PushSubscription, key: Uint8Array): boolean {
  const bound = subscription.options.applicationServerKey
  if (!bound) return true
  const bytes = new Uint8Array(bound)
  return bytes.length === key.length && bytes.every((b, i) => b === key[i])
}

/** The live subscription, if this phone already has one for our key. */
export async function currentSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported() || notificationPermission() !== 'granted') return null
  try {
    const reg = await swReady()
    const existing = (await reg?.pushManager?.getSubscription()) ?? null
    if (!existing) return null
    return boundToOurKey(existing, urlBase64ToUint8Array(VAPID_PUBLIC_KEY)) ? existing : null
  } catch {
    return null
  }
}

async function obtainSubscription(allowPrompt: boolean): Promise<PushOutcome> {
  if (!pushSupported()) return { status: 'unsupported' }

  let permission = Notification.permission
  if (permission === 'default') {
    // Only a tap may open the prompt. Asking here from a background refresh is
    // what produced the phantom "denied".
    if (!allowPrompt) return { status: 'needs-permission' }
    try {
      permission = await Notification.requestPermission()
    } catch {
      return { status: 'refused' }
    }
  }
  if (permission !== 'granted') return { status: 'refused' }

  const reg = await swReady()
  if (!reg?.pushManager) return { status: 'no-push', detail: 'the service worker never came up' }

  try {
    const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    const existing = await reg.pushManager.getSubscription()
    if (existing) {
      if (boundToOurKey(existing, key)) {
        return { status: 'subscribed', subscription: existing, isNew: false }
      }
      // Made against a key we no longer use — the push service would turn it
      // away, so replace it rather than keeping a dead address on file.
      await existing.unsubscribe().catch(() => {})
    }
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key as BufferSource,
    })
    return { status: 'subscribed', subscription, isNew: true }
  } catch (e) {
    return { status: 'no-push', detail: String((e as Error)?.message ?? e).slice(0, 140) }
  }
}

// --- registering this phone with the reminder service ---
// Every call here is best-effort and silent. A reminder that doesn't arrive is a
// disappointment; an error message in the middle of a lesson is worse.

async function post(path: string, body: unknown): Promise<Response | null> {
  try {
    return await fetch(`${REMINDER_SERVER}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return null
  }
}

function timezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

// What happened the last time this phone tried to join the reminder list. Every
// step used to fail silently, which meant a reminder that never arrived left
// nobody — learner or maintainer — anything to go on. Settings shows this.
//
// `confirmed` is the part that matters when something goes wrong later: it says
// the service has acknowledged *this* address at least once, so a failure now is
// an outage to retry rather than a phone that was never signed up.
export type RegStatus = 'never' | 'ok' | 'no-push' | 'refused' | 'unreachable' | 'rejected'

export interface RegState {
  status: RegStatus
  detail?: string
  at?: number
  confirmed?: boolean
}

const REG_STATE_KEY = 'odia:notifyRegState'

export function getRegistrationState(): RegState {
  try {
    const raw = localStorage.getItem(REG_STATE_KEY)
    return raw ? (JSON.parse(raw) as RegState) : { status: 'never' }
  } catch {
    return { status: 'never' }
  }
}

function setRegistrationState(status: RegStatus, detail?: string, confirmed?: boolean): boolean {
  const previous = getRegistrationState()
  const state: RegState = {
    status,
    detail,
    at: Date.now(),
    confirmed: confirmed ?? (status === 'ok' ? true : (previous.confirmed ?? false)),
  }
  localStorage.setItem(REG_STATE_KEY, JSON.stringify(state))
  return status === 'ok'
}

// Hand this phone's push address to the service, along with when to knock.
// Safe to call repeatedly — the service keys on the address, so re-registering
// updates the existing row rather than adding another.
//
// `allowPrompt` must only be true when this is running inside a tap. `replaces`
// carries the address the service should forget, for the case where the phone
// handed us a new one.
export async function registerWithServer(
  opts: { allowPrompt?: boolean; replaces?: string } = {},
): Promise<boolean> {
  const outcome = await obtainSubscription(opts.allowPrompt === true)

  if (outcome.status === 'unsupported') {
    return setRegistrationState('no-push', "this browser doesn't do push", false)
  }
  if (outcome.status === 'needs-permission') {
    // Nothing has gone wrong — nobody has said yes yet.
    return setRegistrationState('never', undefined, false)
  }
  if (outcome.status === 'refused') {
    return setRegistrationState('refused', 'notifications are switched off for this app', false)
  }
  if (outcome.status === 'no-push') {
    return setRegistrationState('no-push', outcome.detail, false)
  }

  try {
    const subscription = serializeSubscription(outcome.subscription)
    const known = localStorage.getItem(ENDPOINT_KEY)
    const stats = await db.stats.get('main')
    const res = await post('/subscribe', {
      subscription,
      hour: getReminderHour(),
      tz: timezone(),
      lastPracticedDay: stats?.lastPracticedDate ?? stats?.lastGoalMetDate ?? null,
      // Rotated addresses would otherwise pile up as dead rows the service keeps
      // knocking on.
      replaces: opts.replaces ?? (known && known !== subscription.endpoint ? known : undefined),
    })
    // `post` resolves to null only when the request never completed at all.
    if (!res) return setRegistrationState('unreachable', 'no response from the reminder service')
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return setRegistrationState('rejected', `${res.status} ${body.slice(0, 100)}`)
    }
    // A service running a different VAPID key can hold this address all it likes
    // — every push it sends will be turned away by the push service. Say so here
    // rather than leaving a silent evening to explain it.
    const ack = (await res.json().catch(() => null)) as { vapidPublicKey?: string } | null
    if (ack?.vapidPublicKey && ack.vapidPublicKey !== VAPID_PUBLIC_KEY) {
      return setRegistrationState('rejected', 'the service is using a different push key', false)
    }
    localStorage.setItem(ENDPOINT_KEY, subscription.endpoint)
    return setRegistrationState('ok')
  } catch (e) {
    return setRegistrationState('unreachable', String((e as Error)?.message ?? e).slice(0, 140))
  }
}

async function unregisterFromServer(): Promise<void> {
  const endpoint = localStorage.getItem(ENDPOINT_KEY)
  localStorage.removeItem(ENDPOINT_KEY)
  localStorage.removeItem(REPORTED_KEY)
  localStorage.removeItem(REFRESH_KEY)
  try {
    const removed = await pushUnsubscribe()
    if (removed ?? endpoint) await post('/unsubscribe', { endpoint: removed ?? endpoint })
  } catch {
    /* the switch is already off locally; the address expires on its own */
  }
}

// Tell the service today already counts, so it stays quiet this evening. Only
// fires when the practised day has actually moved on, and remembers what it
// last reported — so a failed attempt is simply retried next time the app opens.
async function reportPracticed(day: string | null): Promise<void> {
  if (!day || !remindersOn()) return
  if (localStorage.getItem(REPORTED_KEY) === day) return
  const endpoint = localStorage.getItem(ENDPOINT_KEY)
  if (!endpoint) return
  const res = await post('/practiced', { endpoint, lastPracticedDay: day })
  if (res?.ok) {
    localStorage.setItem(REPORTED_KEY, day)
    return
  }
  // A 404 here is the service saying it has never heard of this phone — the
  // address was pruned, or this build is talking to a service that was rebuilt
  // underneath it. Either way we are not on the list and nobody would have told
  // us; the only symptom would have been an evening that stayed quiet.
  if (res?.status === 404) {
    localStorage.removeItem(ENDPOINT_KEY)
    void registerWithServer()
  }
}

// --- turning reminders on and off ---
export type EnableResult = 'granted' | 'denied' | 'unsupported'

// Must be called straight from a tap: browsers only show the permission prompt
// while a user gesture is still in play, and Safari wants the push subscription
// taken out inside the same gesture too. So the phone is dealt with first and
// our own bookkeeping — the Cache API blob, the service — waits until after.
export async function enableReminders(): Promise<EnableResult> {
  if (notificationSupport() !== 'ok') return 'unsupported'

  const outcome = await obtainSubscription(true)
  if (outcome.status === 'unsupported') {
    localStorage.setItem(ENABLED_KEY, 'false')
    return 'unsupported'
  }
  if (outcome.status === 'refused' || outcome.status === 'needs-permission') {
    localStorage.setItem(ENABLED_KEY, 'false')
    setRegistrationState('refused', 'notifications are switched off for this app', false)
    await syncNotificationState()
    return 'denied'
  }

  // Permission is granted from here on, whether or not push itself worked out:
  // the in-app timer can still deliver, so the switch belongs on.
  localStorage.setItem(ENABLED_KEY, 'true')
  await syncNotificationState()

  if (outcome.status === 'no-push') {
    setRegistrationState('no-push', outcome.detail, false)
  } else {
    // Not awaited: the switch should flip the moment permission lands.
    void registerWithServer()
  }
  void registerBackgroundSync()
  return 'granted'
}

export async function disableReminders(): Promise<void> {
  localStorage.setItem(ENABLED_KEY, 'false')
  setRegistrationState('never', undefined, false)
  await syncNotificationState()
  void unregisterBackgroundSync()
  void unregisterFromServer()
}

// --- putting the switch back where the learner left it ---
// Two things go wrong while the app is closed, and both used to read as "the
// reminders turned themselves off":
//
//   • Safari clears a web app's storage after a stretch of not being opened, and
//     everything about the reminder lived in localStorage. The push subscription
//     survives that, so it — not our notes — says whether this phone is signed up.
//   • The browser rotates or drops the subscription. The service worker repairs
//     that when it's awake to see it happen (`pushsubscriptionchange`); this
//     catches the times it wasn't.
//
// Runs on every launch and whenever the app is brought back to the front. It
// never prompts, so it is safe outside a tap.
const REFRESH_KEY = 'odia:notifyRefreshedDay'
const RETRY_AFTER_MS = 5 * 60 * 1000

export async function reconcileReminders(): Promise<void> {
  if (notificationSupport() !== 'ok') return
  const permission = notificationPermission()

  if (permission === 'denied') {
    // Revoked in the phone's own settings. Record it once, honestly.
    if (reminderPreference()) {
      localStorage.setItem(ENABLED_KEY, 'false')
      setRegistrationState('refused', 'notifications are switched off for this app', false)
      await syncNotificationState()
    }
    return
  }
  if (permission !== 'granted') return

  const live = await currentSubscription()

  if (live && !reminderPreference()) {
    // Storage was wiped but the phone is still subscribed: the learner never
    // turned this off, the browser just forgot we knew. Turning reminders off
    // unsubscribes, so a live subscription can only mean they were on.
    localStorage.setItem(ENABLED_KEY, 'true')
    await recoverSettingsFromServer(live.endpoint)
    await syncNotificationState()
  }

  if (!reminderPreference()) return

  if (!live) {
    // Subscribed once, no subscription now — rebuild it. Permission is already
    // granted, so this needs no tap and shows no prompt.
    await registerWithServer()
    await syncNotificationState()
    return
  }

  // Push addresses also go stale quietly. Re-registering once a day repairs that
  // and keeps the service's copy of the hour and timezone current, at the cost of
  // one request.
  const today = todayKey()
  const reg = getRegistrationState()
  if (localStorage.getItem(REFRESH_KEY) === today && reg.status === 'ok') return
  // While something is actually wrong we retry on the way back into the app, but
  // not every single time: an app flipped in and out of ten times in a minute
  // should not be ten calls to a service that is plainly having trouble.
  if (reg.status !== 'ok' && reg.at && Date.now() - reg.at < RETRY_AFTER_MS) return
  if (await registerWithServer()) localStorage.setItem(REFRESH_KEY, today)
}

// After a storage wipe the reminder hour is gone too, and defaulting a 9pm
// learner back to 7pm is exactly the kind of small betrayal that gets an app's
// notifications switched off for good. The service still has it.
async function recoverSettingsFromServer(endpoint: string): Promise<void> {
  if (localStorage.getItem(HOUR_KEY)) return
  const res = await post('/status', { endpoint })
  if (!res?.ok) return
  try {
    const row = (await res.json()) as { known?: boolean; hour?: number }
    if (row.known && HOUR_OPTIONS.some((o) => o.value === row.hour)) {
      localStorage.setItem(HOUR_KEY, String(row.hour))
      localStorage.setItem(ENDPOINT_KEY, endpoint)
      setRegistrationState('ok')
    }
  } catch {
    /* the hour stays at its default; not worth a failure */
  }
}

/* Reminder wording. Kept in step with `compose()` in public/notify-sw.js — if you
   change one, change the other. */
function compose(name: string, streak: number): { title: string; body: string } {
  const hi = name ? `${name}, ` : ''
  if (streak > 0) {
    return {
      title: `🔥 ${streak}-day streak`,
      body: `${hi}a few minutes of Odia keeps it alive.`,
    }
  }
  return {
    title: 'Time for a small bite 🇮🇳',
    body: `${hi}practise a little Odia and start a streak tonight.`,
  }
}

// Post the reminder right now, from the page.
export async function showReminderNow(): Promise<boolean> {
  if (notificationPermission() !== 'granted') return false
  try {
    const reg = await swReady(5000)
    if (!reg) return false
    const stats = await db.stats.get('main')
    const name = (localStorage.getItem('odia:name') ?? '').trim()
    const text = compose(name, stats?.streak ?? 0)
    await reg.showNotification(text.title, {
      body: text.body,
      icon: `${import.meta.env.BASE_URL}icon-192.png`,
      badge: `${import.meta.env.BASE_URL}icon-192.png`,
      tag: TAG,
      data: { url: location.href },
    })
    return true
  } catch {
    return false
  }
}

// The "send a test" button in Settings. A notification the page posts to itself
// proves only that the app is open, which was never in doubt — the question is
// whether a knock from the service reaches this phone. So the test goes the long
// way round, through the service, and only falls back to posting it here when
// that can't be arranged. The caller says which happened.
export type TestResult = 'knocked' | 'local' | 'failed'

export async function sendTestReminder(): Promise<TestResult> {
  if (notificationPermission() !== 'granted') return 'failed'
  const endpoint = (await currentSubscription())?.endpoint
  if (endpoint) {
    const res = await post('/test', { endpoint })
    if (res?.ok) return 'knocked'
    // A service that no longer knows this address is worth repairing while
    // someone is standing here waiting to see whether it works.
    if (res?.status === 404) {
      if (await registerWithServer()) {
        const retry = await post('/test', { endpoint })
        if (retry?.ok) return 'knocked'
      }
    }
  }
  return (await showReminderNow()) ? 'local' : 'failed'
}

// --- the in-app fallback timer ---
// Covers the case where the app is open (or parked in the background) when the
// reminder falls due, on phones that never give the service worker a wake-up.
function msUntilNextReminder(hour: number, from = new Date()): number {
  const at = new Date(from)
  at.setHours(hour, 0, 0, 0)
  if (at.getTime() <= from.getTime()) at.setDate(at.getDate() + 1)
  return at.getTime() - from.getTime()
}

function todayKey(d = new Date()): string {
  return d.toLocaleDateString('en-CA')
}

// Starts the timer; returns a cleanup function for React.
export function startReminderTimer(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  let stopped = false

  async function fire() {
    try {
      const [stats, state] = await Promise.all([db.stats.get('main'), readState()])
      const today = todayKey()
      const practiced = (stats?.lastPracticedDate ?? stats?.lastGoalMetDate ?? null) === today
      if (remindersOn() && !practiced && state.lastNotifiedDay !== today) {
        if (await showReminderNow()) await putState({ ...state, lastNotifiedDay: today })
      }
    } catch {
      // A missed reminder is not worth an error.
    }
    schedule()
  }

  function schedule() {
    if (stopped) return
    timer = setTimeout(() => void fire(), msUntilNextReminder(getReminderHour()))
  }

  schedule()

  // Coming back to the app is also a good moment to re-arm the timer, check the
  // reminder is still actually set up, and let the worker re-check — a phone
  // asleep at reminder time may still owe tonight's nudge.
  function onVisible() {
    if (document.visibilityState !== 'visible') return
    clearTimeout(timer)
    schedule()
    void syncNotificationState().then(() => reconcileReminders())
    void swReady().then((reg) => reg?.active?.postMessage({ type: 'odia-notify-check' }))
  }
  document.addEventListener('visibilitychange', onVisible)

  return () => {
    stopped = true
    clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisible)
  }
}
