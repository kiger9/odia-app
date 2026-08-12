// The on-device store (IndexedDB via Dexie). Everything a learner does is written
// here immediately, so progress survives closing the app.

import Dexie, { type Table } from 'dexie'
import type { Card } from './srs'

// --- spaced-repetition state per learned item (foundation from Milestone 0) ---
export interface Progress {
  lexemeId: string
  due: number
  reviews: number
  card: Card
  updatedAt: number
}

// --- per-lesson progress (Milestone 1) ---
export interface LessonProgress {
  lessonId: string // primary key
  step: number // furthest step reached (for resume)
  completed: boolean
  updatedAt: number
}

// --- streak + profile stats (single row, id = 'main') ---
export interface Stats {
  id: string
  streak: number // consecutive practiced days
  lastPracticedDate?: string | null // local date the learner last practiced
  streakStart?: string | null // date the current streak began
  longestStreak?: number
  longestStart?: string | null
  longestEnd?: string | null
  lessonsCompleted?: number // total lesson completions, including redos
  quizzesTaken?: number
  quizScoreSum?: number // sum of quiz percentages (for the average)
  // legacy fields from earlier versions, kept for read-time migration:
  day?: string
  count?: number
  lastGoalMetDate?: string | null
}

class OdiaDB extends Dexie {
  progress!: Table<Progress, string>
  lessonProgress!: Table<LessonProgress, string>
  stats!: Table<Stats, string>

  constructor() {
    super('odia-app')
    this.version(1).stores({ progress: 'lexemeId, due' })
    this.version(2).stores({
      progress: 'lexemeId, due',
      lessonProgress: 'lessonId, completed',
    })
    this.version(3).stores({
      progress: 'lexemeId, due',
      lessonProgress: 'lessonId, completed',
      stats: 'id',
    })
  }
}

export const db = new OdiaDB()

// Record how far a learner got in a lesson (and whether they finished it).
export async function saveLessonProgress(
  lessonId: string,
  step: number,
  completed: boolean,
): Promise<void> {
  const existing = await db.lessonProgress.get(lessonId)
  await db.lessonProgress.put({
    lessonId,
    step: Math.max(step, existing?.step ?? 0),
    completed: completed || (existing?.completed ?? false),
    updatedAt: Date.now(),
  })
}

// Ask the browser to keep our data safe from automatic eviction (iOS Safari).
export async function requestPersistentStorage(): Promise<void> {
  if (navigator.storage?.persist) {
    await navigator.storage.persist()
  }
}
