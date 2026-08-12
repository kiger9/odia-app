// Streak + daily-goal tracking. Every learning action (a lesson step answered or
// a review rated) counts toward today's goal; meeting the goal on consecutive days
// grows the streak.

import { db, type Stats } from './db'
import { getDailyGoal } from './settings'

// Local calendar date as YYYY-MM-DD (so streaks follow the learner's own midnight).
function localDay(d = new Date()): string {
  return d.toLocaleDateString('en-CA')
}

function dayBefore(day: string): string {
  const d = new Date(`${day}T12:00:00`)
  d.setDate(d.getDate() - 1)
  return localDay(d)
}

export interface StreakView {
  streak: number
  count: number
  goal: number
  metToday: boolean
}

// Called once per learning action. Handles day rollover, counting, and streaks.
export async function recordActivity(): Promise<void> {
  const goal = getDailyGoal()
  const today = localDay()
  const rec: Stats = (await db.stats.get('main')) ?? {
    id: 'main',
    day: today,
    count: 0,
    streak: 0,
    lastGoalMetDate: null,
  }

  if (rec.day !== today) {
    rec.day = today
    rec.count = 0
  }
  rec.count += 1

  if (rec.count >= goal && rec.lastGoalMetDate !== today) {
    rec.streak = rec.lastGoalMetDate === dayBefore(today) ? rec.streak + 1 : 1
    rec.lastGoalMetDate = today
  }

  await db.stats.put(rec)
}

// Derive what to show, accounting for day rollover and whether the streak is still alive.
export function viewStreak(rec: Stats | undefined, goal: number, today = localDay()): StreakView {
  if (!rec) return { streak: 0, count: 0, goal, metToday: false }

  const count = rec.day === today ? rec.count : 0
  const metToday = rec.lastGoalMetDate === today
  const alive = rec.lastGoalMetDate === today || rec.lastGoalMetDate === dayBefore(today)
  return { streak: alive ? rec.streak : 0, count, goal, metToday }
}
