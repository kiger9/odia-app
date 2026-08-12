// Streak tracking, "did you practice today?" model. A day counts toward the
// streak when the learner does something meaningful — finishes their due reviews,
// completes a Pop Quiz, or completes a lesson. Consecutive practiced days grow the
// streak; a skipped day resets it.

import { db, type Stats } from './db'

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

// Mark that the learner practiced today (idempotent within a day).
export async function markPracticedToday(): Promise<void> {
  const today = localDay()
  const rec = await db.stats.get('main')
  const last = lastDate(rec)
  if (last === today) return
  const streak = last === dayBefore(today) ? (rec?.streak ?? 0) + 1 : 1
  await db.stats.put({ id: 'main', streak, lastPracticedDate: today })
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
