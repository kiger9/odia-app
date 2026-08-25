// Streak tracking, "did you practice today?" model. A day counts toward the
// streak when the learner does something meaningful — finishes their due reviews,
// completes a Pop Quiz, or completes a lesson. Consecutive practiced days grow the
// streak; a skipped day resets it.

import { db, type Stats } from './db'
import { syncNotificationState } from './notifications'
import { scheduleBackup } from './backup'

// Local calendar date as YYYY-MM-DD (so streaks follow the learner's own midnight).
function localDay(d = new Date()): string {
  return d.toLocaleDateString('en-CA')
}

function dayBefore(day: string): string {
  const d = new Date(`${day}T12:00:00`)
  d.setDate(d.getDate() - 1)
  return localDay(d)
}

// Older records used `lastGoalMetDate`; new ones use `lastPracticedDate`.
function lastDate(rec: Stats | undefined): string | null {
  return rec?.lastPracticedDate ?? rec?.lastGoalMetDate ?? null
}

export function todayString(): string {
  return localDay()
}

// Mark that the learner practiced today (idempotent within a day). Also maintains
// the current streak's start date and the all-time longest streak.
export async function markPracticedToday(): Promise<void> {
  const today = localDay()
  const rec = await db.stats.get('main')
  const last = lastDate(rec)
  if (last === today) return

  const continuing = last === dayBefore(today)
  const streak = continuing ? (rec?.streak ?? 0) + 1 : 1
  const streakStart = continuing ? (rec?.streakStart ?? today) : today

  let longestStreak = rec?.longestStreak ?? 0
  let longestStart = rec?.longestStart ?? null
  let longestEnd = rec?.longestEnd ?? null
  if (streak >= longestStreak) {
    longestStreak = streak
    longestStart = streakStart
    longestEnd = today
  }

  await db.stats.put({
    ...(rec ?? {}),
    id: 'main',
    streak,
    lastPracticedDate: today,
    streakStart,
    longestStreak,
    longestStart,
    longestEnd,
  })

  // Tonight's reminder should skip a day that already counts — tell the worker.
  void syncNotificationState()
  // Progress just moved; get a copy off this device.
  scheduleBackup()
}

export interface StreakView {
  streak: number
  practicedToday: boolean
}

export function viewStreak(rec: Stats | undefined, today = localDay()): StreakView {
  const last = lastDate(rec)
  const practicedToday = last === today
  const alive = last === today || last === dayBefore(today)
  return { streak: alive ? (rec?.streak ?? 0) : 0, practicedToday }
}

// --- celebration (shown once per day, the first time home reopens after practicing) ---
const CELEBRATED_KEY = 'odia:celebratedDay'

export const CELEBRATION_PHRASES = [
  'Nice job!',
  'Well done today!',
  "You're on fire!",
  'Great work!',
  'Keep it blazing!',
  'That’s the spirit!',
]

export function getCelebratedDay(): string | null {
  return localStorage.getItem(CELEBRATED_KEY)
}
export function setCelebratedDay(day: string): void {
  localStorage.setItem(CELEBRATED_KEY, day)
}
