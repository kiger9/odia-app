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

// Below this score the message encourages without celebrating.
const PRAISE_FROM = 75
const KEEP_GOING = ['Let’s keep at it', 'Room to improve', 'Keep trying', 'Practice makes perfect', 'You’ll get there', 'Let’s try again']
const keepGoingNamed = (n: string) => [`Keep at it, ${n}`, `You’ll get there, ${n}`, `Let’s try again, ${n}`]

// Praise for a lesson or streak (no score), or matched to a score in percent:
// celebration from 75% up, a gentler nudge below.
export function encouragement(pct?: number): string {
  const name = getName()
  const pool =
    pct !== undefined && pct < PRAISE_FROM
      ? [...KEEP_GOING, ...(name ? keepGoingNamed(name) : [])]
      : name
        ? named(name)
        : GENERIC
  return pool[Math.floor(Math.random() * pool.length)]
}

// Replace the {name} placeholder with the learner's name (used by reviews & quiz,
// which draw from lesson content that may contain {name}).
export function fillName(s: string): string {
  return typeof s === 'string' ? s.replace(/\{name\}/g, getName() || 'Suresh') : s
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
