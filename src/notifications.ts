// Evening practice reminders — the page half. (The service-worker half, which is
// what actually fires when the app is closed, lives in public/notify-sw.js.)
//
// The app has no server, so a reminder can't be pushed to the phone. Instead it is
// produced on the device itself, two ways:
//   • the service worker is woken by Periodic Background Sync and posts the
//     reminder if it's evening and the learner hasn't practised — this is the one
//     that works with the app closed (Android/Chrome, once installed);
//   • if the app is open or sitting in the background at reminder time, a plain
//     timer in here posts it instead.
// A woken service worker can't read React state, so everything it needs (the name,
// the streak, whether today counts already) is mirrored into the Cache API.

import { db } from './db'

const ENABLED_KEY = 'odia:notifyEnabled'
const HOUR_KEY = 'odia:notifyHour'
const ASKED_KEY = 'odia:notifyAsked'

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
    await putState({
      ...existing,
      enabled: remindersOn(),
      hour: getReminderHour(),
      name: (localStorage.getItem('odia:name') ?? '').trim(),
      streak: stats?.streak ?? 0,
      lastPracticedDay: stats?.lastPracticedDate ?? stats?.lastGoalMetDate ?? null,
    })
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
  return 'granted'
}

export async function disableReminders(): Promise<void> {
  localStorage.setItem(ENABLED_KEY, 'false')
  await syncNotificationState()
  void unregisterBackgroundSync()
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
