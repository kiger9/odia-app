import { useEffect, useState } from 'react'
import { db, type Progress } from '../db'
import { dueItemsFrom, recordReview, type ReviewItem } from '../reviews'
import { markPracticedToday } from '../streak'
import { Rating, type Grade } from '../srs'
import Modal from './Modal'

export default function ReviewSession({ onExit }: { onExit: () => void }) {
  const [queue, setQueue] = useState<ReviewItem[] | null>(null)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [confirmQuit, setConfirmQuit] = useState(false)

  // Snapshot the due items once when the session starts.
  useEffect(() => {
    db.progress.toArray().then((rows: Progress[]) => setQueue(dueItemsFrom(rows)))
  }, [])

  if (queue === null) {
    return (
      <main className="app">
        <p className="muted">Loading…</p>
      </main>
    )
  }

  const current = queue[index]

  if (!current) {
    return (
      <main className="app">
        <section className="card done-card">
          <p className="done-mark">✓</p>
          <p className="due-count">{queue.length ? 'Reviews done' : 'Nothing due'}</p>
          <p className="muted">
            {queue.length ? 'Your schedule is updated.' : 'Come back when reviews are due.'}
          </p>
          <button className="btn-primary" onClick={onExit}>
            Back to home
          </button>
        </section>
      </main>
    )
  }

  async function rate(grade: Grade) {
    await recordReview(current!.id, grade)
    const wasLast = index >= (queue?.length ?? 0) - 1
    setRevealed(false)
    setIndex((i) => i + 1)
    if (wasLast) void markPracticedToday() // finishing due reviews counts for the day
  }

  return (
    <main className="app player">
      <div className="player-top">
        <button className="x-btn" onClick={() => setConfirmQuit(true)} aria-label="Quit review">
          ✕
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(index / queue.length) * 100}%` }} />
        </div>
        <span className="q-count">
          {index + 1} / {queue.length}
        </span>
      </div>

      <section className="card review-q">
        <p className="prompt-label muted">Say it in Odia</p>
        <p className="prompt-en">{current.english}</p>

        {revealed ? (
          <div className="answer">
            <p className="answer-phonetic">{current.phonetic}</p>
            {current.note && (
              <p className="answer-note muted" dangerouslySetInnerHTML={{ __html: current.note }} />
            )}
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

      {confirmQuit && (
        <Modal
          title="Quit review?"
          message="Return to the main menu? Reviews you've already rated are saved."
          actions={[
            { label: 'Keep going', variant: 'ghost', onClick: () => setConfirmQuit(false) },
            { label: 'Quit', variant: 'danger', onClick: onExit },
          ]}
        />
      )}
    </main>
  )
}
