// Pop Quiz: generate fresh multiple-choice questions from everything the learner
// has learned so far (the items already in their review pool). Each question asks
// either "which is the Odia?" or "what does this mean?", with distractors drawn
// from other learned words.

import { db } from './db'
import { REVIEW_ITEM_BY_ID, REVIEW_ITEMS, type ReviewItem } from './reviews'
import { fillName } from './profile'

export interface QuizQuestion {
  direction: 'toOdia' | 'toEnglish'
  prompt: string
  answer: string
  options: string[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Everything the learner has been taught (items that have entered the review pool).
export async function getLearnedItems(): Promise<ReviewItem[]> {
  const rows = await db.progress.toArray()
  return rows
    .map((r) => REVIEW_ITEM_BY_ID.get(r.lexemeId))
    .filter((x): x is ReviewItem => !!x)
    .map((i) => ({ ...i, phonetic: fillName(i.phonetic), english: fillName(i.english) }))
}

export function buildQuiz(learned: ReviewItem[], count = 10): QuizQuestion[] {
  const targets = shuffle(learned).slice(0, Math.min(count, learned.length))

  return targets.map((t) => {
    const toOdia = Math.random() < 0.5
    const field: 'phonetic' | 'english' = toOdia ? 'phonetic' : 'english'
    const answer = t[field]

    const options = new Set<string>([answer])
    for (const d of shuffle(learned.filter((i) => i.id !== t.id))) {
      if (options.size >= 4) break
      options.add(d[field])
    }
    // Top up from the full catalogue if the learned set is too small/repetitive.
    if (options.size < 4) {
      for (const d of shuffle(REVIEW_ITEMS)) {
        if (options.size >= 4) break
        options.add(d[field])
      }
    }

    return {
      direction: toOdia ? 'toOdia' : 'toEnglish',
      prompt: toOdia ? t.english : t.phonetic,
      answer,
      options: shuffle([...options]),
    }
  })
}
