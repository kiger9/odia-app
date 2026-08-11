import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Progress } from './db'
import { LEXEMES, type Lexeme } from './data/lexemes'
import { newCard, review, Rating, type Grade } from './srs'

const LEXEMES_BY_ID = new Map(LEXEMES.map((l) => [l.id, l]))

// Make sure every seed word has a progress row. New words start due immediately.
async function seedMissingProgress(): Promise<void> {
  const now = Date.now()
  const existing = new Set((await db.progress.toArray()).map((p) => p.lexemeId))
  const toAdd: Progress[] = LEXEMES.filter((l) => !existing.has(l.id)).map((l) => {
    const card = newCard(new Date(now))
    return { lexemeId: l.id, due: card.due.getTime(), reviews: 0, card, updatedAt: now }
  })
  if (toAdd.length) await db.progress.bulkAdd(toAdd)
}

// Save one review: ask the scheduler for the new state, write it to storage.
async function recordReview(progress: Progress, grade: Grade): Promise<void> {
  const now = new Date()
  const card = review(progress.card, now, grade)
  await db.progress.update(progress.lexemeId, {
    card,
    due: card.due.getTime(),
    reviews: progress.reviews + 1,
    updatedAt: now.getTime(),
  })
}

function formatWhen(ms: number): string {
  const diff = ms - Date.now()
  if (diff <= 0) return 'now'
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `in ${mins} min`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `in ${hours} h`
  const days = Math.round(hours / 24)
  return `in ${days} day${days === 1 ? '' : 's'}`
}

export default function App() {
  const [seeded, setSeeded] = useState(false)
  const [inSession, setInSession] = useState(false)

  useEffect(() => {
    seedMissingProgress().then(() => setSeeded(true))
  }, [])

  const progress = useLiveQuery(() => db.progress.toArray(), [], [] as Progress[])

  const dueNow = useMemo(
    () => progress.filter((p) => p.due <= Date.now()),
    [progress],
  )

  if (!seeded) {
    return (
      <main className="app">
        <p className="muted">Loading…</p>
      </main>
    )
  }

  return inSession ? (
    <Session queue={dueNow} onDone={() => setInSession(false)} />
  ) : (
    <Home progress={progress} dueCount={dueNow.length} onStart={() => setInSession(true)} />
  )
}

function Home({
  progress,
  dueCount,
  onStart,
}: {
  progress: Progress[]
  dueCount: number
  onStart: () => void
}) {
  const seen = progress.filter((p) => p.reviews > 0).length
  const nextDue = progress
    .map((p) => p.due)
    .filter((d) => d > Date.now())
    .sort((a, b) => a - b)[0]

  return (
    <main className="app">
      <header className="brand">
        <h1>
          Odia <span className="brand-mark">in small bites</span>
        </h1>
        <p className="muted">Learn spoken Odia, one review at a time.</p>
      </header>

      <section className="card home-card">
        {dueCount > 0 ? (
          <>
            <p className="due-count">
              <strong>{dueCount}</strong> {dueCount === 1 ? 'review' : 'reviews'} due
            </p>
            <button className="btn-primary" onClick={onStart}>
              Start practice
            </button>
          </>
        ) : (
          <>
            <p className="due-count">All caught up 🎉</p>
            <p className="muted">
              {nextDue ? `Next review ${formatWhen(nextDue)}.` : 'Come back soon.'}
            </p>
          </>
        )}
      </section>

      <p className="stat muted">
        {seen} of {LEXEMES.length} words started
      </p>

      <footer className="credit muted">
        Curriculum from <em>Oriya in Small Bites</em> by Niels Erik Wegge.
      </footer>
    </main>
  )
}

function Session({ queue, onDone }: { queue: Progress[]; onDone: () => void }) {
  // Snapshot the queue when the session starts so ratings don't reshuffle it.
  const [items] = useState(() => queue)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const current = items[index]
  const lexeme: Lexeme | undefined = current && LEXEMES_BY_ID.get(current.lexemeId)

  if (!current || !lexeme) {
    return (
      <main className="app">
        <section className="card">
          <p className="due-count">Session complete ✓</p>
          <p className="muted">Your progress is saved.</p>
          <button className="btn-primary" onClick={onDone}>
            Back to home
          </button>
        </section>
      </main>
    )
  }

  async function rate(grade: Grade) {
    await recordReview(current!, grade)
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  return (
    <main className="app">
      <div className="progress-bar" aria-hidden>
        <div
          className="progress-fill"
          style={{ width: `${(index / items.length) * 100}%` }}
        />
      </div>

      <section className="card exercise">
        <p className="prompt-label muted">What is this in Odia?</p>
        <p className="prompt-en">{lexeme.english}</p>

        {revealed ? (
          <div className="answer">
            <p className="answer-script">{lexeme.script}</p>
            <p className="answer-phonetic">{lexeme.phonetic}</p>
            {lexeme.note && <p className="answer-note muted">{lexeme.note}</p>}
          </div>
        ) : (
          <button className="btn-primary" onClick={() => setRevealed(true)}>
            Show answer
          </button>
        )}
      </section>

      {revealed && (
        <div className="ratings">
          <button className="btn-rate again" onClick={() => rate(Rating.Again)}>
            Again
          </button>
          <button className="btn-rate hard" onClick={() => rate(Rating.Hard)}>
            Hard
          </button>
          <button className="btn-rate good" onClick={() => rate(Rating.Good)}>
            Good
          </button>
          <button className="btn-rate easy" onClick={() => rate(Rating.Easy)}>
            Easy
          </button>
        </div>
      )}

      <button className="btn-quit muted" onClick={onDone}>
        Quit — progress saved
      </button>
    </main>
  )
}
