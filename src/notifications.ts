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

import { db } from './db'
import { subscribe as pushSubscribe, unsubscribe as pushUnsubscribe, serializeSubscription } from '@mmmike/web-push'

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
interface NotifyState {
  enabled: boolean
  hour: number
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
function swReady(timeoutMs = 4000): Promise<ServiceWorkerRegistration | null> {
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
export type RegStatus = 'never' | 'ok' | 'no-push' | 'refused' | 'unreachable' | 'rejected'

export interface RegState {
  status: RegStatus
  detail?: string
  at?: number
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

function setRegistrationState(status: RegStatus, detail?: string): boolean {
  localStorage.setItem(REG_STATE_KEY, JSON.stringify({ status, detail, at: Date.now() }))
  return status === 'ok'
}

// Hand this phone's push address to the service, along with when to knock.
// Safe to call repeatedly — the service keys on the address, so re-registering
// updates the existing row rather than adding another.
export async function registerWithServer(): Promise<boolean> {
  let result
  try {
    result = await pushSubscribe(VAPID_PUBLIC_KEY)
  } catch (e) {
    // The phone wouldn't hand out a push address at all.
    return setRegistrationState('no-push', String((e as Error)?.message ?? e).slice(0, 140))
  }
  if (result.status !== 'subscribed') {
    return setRegistrationState(result.status === 'denied' ? 'refused' : 'no-push', result.status)
  }

  try {
    const subscription = serializeSubscription(result.subscription)
    const stats = await db.stats.get('main')
    const res = await post('/subscribe', {
      subscription,
      hour: getReminderHour(),
      tz: timezone(),
      lastPracticedDay: stats?.lastPracticedDate ?? stats?.lastGoalMetDate ?? null,
    })
    // `post` resolves to null only when the request never completed at all.
    if (!res) return setRegistrationState('unreachable', 'no response from the reminder service')
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return setRegistrationState('rejected', `${res.status} ${body.slice(0, 100)}`)
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
  if (res?.ok) localStorage.setItem(REPORTED_KEY, day)
}

// --- turning reminders on and off ---
export type EnableResult = 'granted' | 'denied' | 'unsupported'

// Must be called straight from a tap: browsers only show the permission prompt
// while a user gesture is still in play.
export async function enableReminders(): Promise<EnableResult> {
  if (notificationSupport() !== 'ok') return 'unsupported'
  let permission = Notification.permission
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission()
    } catch {
      return 'denied'
    }
  }
  if (permission !== 'granted') {
    localStorage.setItem(ENABLED_KEY, 'false')
    await syncNotificationState()
    return 'denied'
  }
  localStorage.setItem(ENABLED_KEY, 'true')
  await syncNotificationState()
  // Housekeeping — not awaited, so the switch flips the moment permission lands.
  void registerBackgroundSync()
  void registerWithServer()
  return 'granted'
}

export async function disableReminders(): Promise<void> {
  localStorage.setItem(ENABLED_KEY, 'false')
  await syncNotificationState()
  void unregisterBackgroundSync()
  void unregisterFromServer()
}

// Push addresses go stale — delete and reinstall the app, or leave it alone for
// months, and the phone's push service hands out a new one. Re-registering once
// a day quietly repairs that, and costs one request.
const REFRESH_KEY = 'odia:notifyRefreshedDay'

export async function refreshReminderRegistration(): Promise<void> {
  if (!remindersOn()) return
  const today = todayKey()
  if (localStorage.getItem(REFRESH_KEY) === today) return
  if (await registerWithServer()) localStorage.setItem(REFRESH_KEY, today)
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

// Post the reminder right now, from the page. Used by the in-app timer and by the
// "send a test" button in Settings.
export async function showReminderNow(): Promise<boolean> {
  if (notificationPermission() !== 'granted') return false
  try {
    const reg = await swReady()
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

  // Coming back to the app is also a good moment to re-arm the timer and let the
  // worker re-check — a phone asleep at reminder time may still owe tonight's nudge.
  function onVisible() {
    if (document.visibilityState !== 'visible') return
    clearTimeout(timer)
    schedule()
    void syncNotificationState()
    void swReady().then((reg) => reg?.active?.postMessage({ type: 'odia-notify-check' }))
  }
  document.addEventListener('visibilitychange', onVisible)

  return () => {
    stopped = true
    clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisible)
  }
}
