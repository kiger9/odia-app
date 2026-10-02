import { useEffect, useMemo, useState } from 'react'
import type { Lesson } from '../data/lessons'
import { db, saveLessonProgress } from '../db'
import { enqueueLessonItems } from '../reviews'
import { markPracticedToday } from '../streak'
import { recordLessonCompleted, encouragement, getName } from '../profile'
import { lessonRun, rememberSeen, type PStep } from '../gen/exercises'
import { StepView } from './Steps'
import { personalize } from '../lib/personalize'
import Modal from './Modal'

export default function LessonPlayer({
  lesson,
  showScript,
  startStep = 0,
  onExit,
}: {
  lesson: Lesson
  showScript: boolean
  startStep?: number
  onExit: () => void
}) {
  const [index, setIndex] = useState(startStep)
  const [confirmQuit, setConfirmQuit] = useState(false)
  // This run's steps: the curated lesson + freshly generated practice (or, for
  // a lesson already finished, a remix) — built once when the lesson opens.
  const [steps, setSteps] = useState<PStep[] | null>(null)
  const praise = useMemo(() => encouragement(), [])
  const learnerName = useMemo(() => getName() || 'Suresh', [])

  useEffect(() => {
    void db.lessonProgress.toArray().then((rows) => {
      const done = new Set(rows.filter((r) => r.completed).map((r) => r.lessonId))
      const run = lessonRun(lesson.id, done, done.has(lesson.id))
      rememberSeen(run)
      setSteps(run)
    })
  }, [lesson.id])

  if (!steps) {
    return (
      <main className="app">
        <p className="muted">Loading…</p>
      </main>
    )
  }

  const total = steps.length
  const finished = index >= total

  function next() {
    const nextIndex = index + 1
    const done = nextIndex >= total
    void saveLessonProgress(lesson.id, nextIndex, done)
    // On completion, add this lesson's phrases to the review pool and count the day.
    if (done) {
      void enqueueLessonItems(lesson.id)
      // Sequence the two stats writes — running them concurrently races and the
      // streak update gets clobbered by the lesson-count write.
      void (async () => {
        await markPracticedToday()
        await recordLessonCompleted()
      })()
    }
    setIndex(nextIndex)
  }

  if (finished) {
    return (
      <main className="app">
        <section className="card done-card">
          <p className="done-mark">✓</p>
          <p className="due-count">{praise}</p>
          <p className="muted">Lesson complete — {lesson.title}</p>
          <button className="btn-primary" onClick={onExit}>
            Back to lessons
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app player">
      <div className="player-top">
        <button className="x-btn" onClick={() => setConfirmQuit(true)} aria-label="Quit lesson">
          ✕
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(index / total) * 100}%` }} />
        </div>
      </div>
      <StepView
        key={index}
        step={personalize(steps[index], learnerName)}
        showScript={showScript}
        onNext={next}
      />

      {confirmQuit && (
        <Modal
          title="Quit lesson?"
          message="Return to the main menu? Your progress in this lesson is saved."
          actions={[
            { label: 'Keep going', variant: 'ghost', onClick: () => setConfirmQuit(false) },
            { label: 'Quit', variant: 'danger', onClick: onExit },
          ]}
        />
      )}
    </main>
  )
}
