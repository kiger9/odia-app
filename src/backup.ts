// Keeping a learner's progress somewhere other than this one phone.
//
// Deleting the app takes its storage with it — that is how a streak was lost — so
// everything the learner has earned is copied to the reminder service after each
// practice, filed under a sync code the app makes up on their behalf.
//
// The code is the whole credential. Anyone holding it can read or replace that
// backup, and a lost code cannot be recovered, which is why Settings shows it and
// asks the learner to keep it somewhere. The alternative was making a family
// invent passwords, and this seemed the better trade.

import { db, type LessonProgress, type Progress, type Stats } from './db'
import { REMINDER_SERVER } from './notifications'

const CODE_KEY = 'odia:syncCode'
const LAST_BACKUP_KEY = 'odia:lastBackup'

// No I, L, O or U: they are the characters people mistype when reading a code off
// a screen. The server folds the lookalikes back in, so a slip still works.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const CODE_LENGTH = 12

/** The settings this app keeps outside the database, and worth carrying over. */
const SAVED_SETTINGS = ['odia:name', 'odia:showScript', 'odia:dailyGoal', 'odia:notifyHour']

export interface BackupPayload {
  version: 1
  progress: Progress[]
  lessonProgress: LessonProgress[]
  stats: Stats[]
  settings: Record<string, string>
}

// --- the sync code ---

function makeCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH))
  let out = ''
  for (let i = 0; i < CODE_LENGTH; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}

/** This device's code, made on first use and kept from then on. */
export function getSyncCode(): string {
  let code = localStorage.getItem(CODE_KEY)
  if (!code || code.length !== CODE_LENGTH) {
    code = makeCode()
    localStorage.setItem(CODE_KEY, code)
  }
  return code
}

/** Grouped into fours, which is how people read and copy a code without losing their place. */
export function formatCode(code: string): string {
  return (code.match(/.{1,4}/g) ?? [code]).join('-')
}

export function normaliseCode(raw: string): string | null {
  const cleaned = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1')
    .replace(/U/g, 'V')
  return cleaned.length === CODE_LENGTH ? cleaned : null
}

/** Adopt a code from elsewhere — used after restoring onto a new phone. */
export function adoptSyncCode(code: string): void {
  localStorage.setItem(CODE_KEY, code)
}

export function getLastBackup(): number | null {
  const n = Number(localStorage.getItem(LAST_BACKUP_KEY))
  return Number.isFinite(n) && n > 0 ? n : null
}

// --- gathering and restoring ---

export async function collect(): Promise<BackupPayload> {
  const [progress, lessonProgress, stats] = await Promise.all([
    db.progress.toArray(),
    db.lessonProgress.toArray(),
    db.stats.toArray(),
  ])
  const settings: Record<string, string> = {}
  for (const key of SAVED_SETTINGS) {
    const v = localStorage.getItem(key)
    if (v !== null) settings[key] = v
  }
  return { version: 1, progress, lessonProgress, stats, settings }
}

/** Replace everything on this device with what came back. */
async function apply(payload: BackupPayload): Promise<void> {
  if (payload?.version !== 1) throw new Error('That backup was made by a newer version of the app.')
  await db.transaction('rw', db.progress, db.lessonProgress, db.stats, async () => {
    await Promise.all([db.progress.clear(), db.lessonProgress.clear(), db.stats.clear()])
    if (payload.progress?.length) await db.progress.bulkPut(payload.progress)
    if (payload.lessonProgress?.length) await db.lessonProgress.bulkPut(payload.lessonProgress)
    if (payload.stats?.length) await db.stats.bulkPut(payload.stats)
  })
  for (const [key, value] of Object.entries(payload.settings ?? {})) {
    if (SAVED_SETTINGS.includes(key)) localStorage.setItem(key, value)
  }
  // A restored day may already count, and the celebration shouldn't replay.
  localStorage.removeItem('odia:celebratedDay')
}

// --- talking to the service ---

export type BackupResult = 'saved' | 'offline' | 'refused'

export async function backupNow(): Promise<BackupResult> {
  try {
    const res = await fetch(`${REMINDER_SERVER}/backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: getSyncCode(), data: await collect() }),
    })
    if (!res.ok) return 'refused'
    localStorage.setItem(LAST_BACKUP_KEY, String(Date.now()))
    return 'saved'
  } catch {
    return 'offline'
  }
}

export type RestoreResult =
  | { status: 'restored'; savedAt: number }
  | { status: 'not-found' }
  | { status: 'rate-limited' }
  | { status: 'offline' }
  | { status: 'bad-code' }
  | { status: 'failed'; detail: string }

export async function restoreFrom(rawCode: string): Promise<RestoreResult> {
  const code = normaliseCode(rawCode)
  if (!code) return { status: 'bad-code' }

  let res: Response
  try {
    res = await fetch(`${REMINDER_SERVER}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
  } catch {
    return { status: 'offline' }
  }
  if (res.status === 404) return { status: 'not-found' }
  if (res.status === 429) return { status: 'rate-limited' }
  if (!res.ok) return { status: 'failed', detail: `the service answered ${res.status}` }

  try {
    const { data, savedAt } = (await res.json()) as { data: BackupPayload; savedAt: number }
    await apply(data)
    adoptSyncCode(code)
    localStorage.setItem(LAST_BACKUP_KEY, String(savedAt))
    return { status: 'restored', savedAt }
  } catch (e) {
    return { status: 'failed', detail: String((e as Error)?.message ?? e).slice(0, 120) }
  }
}

// --- when backups happen ---
// After practice, but not on every keystroke of it: a lesson finishing, reviews
// finishing and a quiz finishing can land within seconds of each other.
let pending: ReturnType<typeof setTimeout> | undefined

export function scheduleBackup(): void {
  clearTimeout(pending)
  pending = setTimeout(() => void backupNow(), 4000)
}

/** A safety net for a device that was offline, or is running an older app. */
export async function backupIfStale(): Promise<void> {
  const last = getLastBackup()
  if (last && Date.now() - last < 12 * 60 * 60 * 1000) return
  await backupNow()
}
