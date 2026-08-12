// Profile: the learner's name, lifetime stats, encouragement, and progress reset.

import { db } from './db'

// --- name (localStorage, so it survives a progress reset) ---
const NAME_KEY = 'odia:name'
const NAME_ASKED_KEY = 'odia:nameAsked'

export function getName(): string {
  return (localStorage.getItem(NAME_KEY) ?? '').trim()
}
export function setName(name: string): void {
  localStorage.setItem(NAME_KEY, name.trim())
}
export function hasBeenAskedName(): boolean {
  return localStorage.getItem(NAME_ASKED_KEY) === 'true' || getName() !== ''
}
export function markNameAsked(): void {
  localStorage.setItem(NAME_ASKED_KEY, 'true')
}

// --- lifetime stat recording ---
export async function recordLessonCompleted(): Promise<void> {
  const rec = await db.stats.get('main')
  await db.stats.put({
    id: 'main',
    streak: 0,
    ...(rec ?? {}),
    lessonsCompleted: (rec?.lessonsCompleted ?? 0) + 1,
  })
}

export async function recordQuizResult(pct: number): Promise<void> {
  const rec = await db.stats.get('main')
  await db.stats.put({
    id: 'main',
    streak: 0,
    ...(rec ?? {}),
    quizzesTaken: (rec?.quizzesTaken ?? 0) + 1,
    quizScoreSum: (rec?.quizScoreSum ?? 0) + pct,
  })
}

// --- reset everything EXCEPT the name ---
export async function resetProgress(): Promise<void> {
  await Promise.all([db.progress.clear(), db.lessonProgress.clear(), db.stats.clear()])
  localStorage.removeItem('odia:celebratedDay')
}

// --- name-aware encouragement (with generic backups when there's no name) ---
const GENERIC = ['Nice job!', 'Well done!', 'Great work!', 'Keep it up!', 'Brilliant!']
const named = (n: string) => [
  `Nice job, ${n}!`,
  `Way to go, ${n}!`,
  `Well done, ${n}!`,
  `Great work, ${n}!`,
  `You're on fire, ${n}!`,
]

export function encouragement(): string {
  const name = getName()
  const pool = name ? named(name) : GENERIC
  return pool[Math.floor(Math.random() * pool.length)]
}

// Format a YYYY-MM-DD date as e.g. "Aug 8, 2026".
export function formatDate(day: string | null | undefined): string {
  if (!day) return '—'
  return new Date(`${day}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
