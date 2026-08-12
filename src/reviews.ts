// The spaced-repetition review pool. When a lesson is completed, the phrases it
// taught (its intro/teaching cards) enter this pool and get scheduled by ts-fsrs,
// so they resurface for review right before you'd forget them.

import { LESSONS } from './data/lessons'
import { db, type Progress } from './db'
import { newCard, review, Rating, type Grade } from './srs'

export interface ReviewItem {
  id: string
  lessonId: string
  phonetic: string // the book's Latin spelling — what you recall
  english: string // the prompt
  note?: string // optional HTML hint shown on reveal
}

// Catalogue every reviewable item from the lessons' teaching cards.
function buildItems(): ReviewItem[] {
  const items: ReviewItem[] = []
  for (const lesson of LESSONS) {
    for (const step of lesson.items) {
      if (step.t === 'intro' && step.odia && step.gloss) {
        items.push({
          id: `${lesson.id}|${step.odia}`,
          lessonId: lesson.id,
          phonetic: step.odia,
          english: step.gloss,
          note: step.note,
        })
      }
    }
  }
  return items
}

export const REVIEW_ITEMS: ReviewItem[] = buildItems()
export const REVIEW_ITEM_BY_ID = new Map(REVIEW_ITEMS.map((i) => [i.id, i]))

const ITEMS_BY_LESSON = new Map<string, ReviewItem[]>()
for (const it of REVIEW_ITEMS) {
  const arr = ITEMS_BY_LESSON.get(it.lessonId) ?? []
  arr.push(it)
  ITEMS_BY_LESSON.set(it.lessonId, arr)
}

// Add a completed lesson's taught items to the pool (idempotent). Each new item
// is treated as one successful exposure (the lesson), so ts-fsrs schedules its
// first review for the future rather than piling it up immediately.
export async function enqueueLessonItems(lessonId: string): Promise<void> {
  const items = ITEMS_BY_LESSON.get(lessonId) ?? []
  if (!items.length) return
  const now = new Date()
  const found = await db.progress.bulkGet(items.map((i) => i.id))
  const existing = new Set(found.filter((p): p is Progress => !!p).map((p) => p.lexemeId))
  const toAdd: Progress[] = items
    .filter((i) => !existing.has(i.id))
    .map((i) => {
      const card = review(newCard(now), now, Rating.Good)
      return {
        lexemeId: i.id,
        due: card.due.getTime(),
        reviews: 0,
        card,
        updatedAt: now.getTime(),
      }
    })
  if (toAdd.length) await db.progress.bulkAdd(toAdd)
}

// Record one review and reschedule the item.
export async function recordReview(id: string, grade: Grade): Promise<void> {
  const p = await db.progress.get(id)
  if (!p) return
  const now = new Date()
  const card = review(p.card, now, grade)
  await db.progress.update(id, {
    card,
    due: card.due.getTime(),
    reviews: p.reviews + 1,
    updatedAt: now.getTime(),
  })
}

// Due items (ignoring any stale rows not in the current catalogue), shuffled.
export function dueItemsFrom(rows: Progress[], now = Date.now()): ReviewItem[] {
  const due = rows
    .filter((p) => p.due <= now && REVIEW_ITEM_BY_ID.has(p.lexemeId))
    .map((p) => REVIEW_ITEM_BY_ID.get(p.lexemeId)!)
  for (let i = due.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[due[i], due[j]] = [due[j], due[i]]
  }
  return due
}

export function poolStats(rows: Progress[], now = Date.now()) {
  const known = rows.filter((p) => REVIEW_ITEM_BY_ID.has(p.lexemeId))
  const dueCount = known.filter((p) => p.due <= now).length
  const nextDue = known
    .filter((p) => p.due > now)
    .map((p) => p.due)
    .sort((a, b) => a - b)[0]
  return { poolSize: known.length, dueCount, nextDue }
}

export function formatWhen(ms: number, now = Date.now()): string {
  const diff = ms - now
  if (diff <= 0) return 'now'
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `in ${mins} min`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `in ${hours} h`
  const days = Math.round(hours / 24)
  return `in ${days} day${days === 1 ? '' : 's'}`
}
