import { useEffect, useMemo, useState } from 'react'
import { db } from '../db'
import { buildQuiz, rememberSeen, type PStep } from '../gen/exercises'
import { markPracticedToday } from '../streak'
import { recordQuizResult, encouragement, getName } from '../profile'
import { StepView } from './Steps'
import { personalize } from '../lib/personalize'
import Modal from './Modal'

// A Pop Quiz: ten questions, freshly generated from everything the learner has
// finished — new sentences in every exercise type, steering clear of questions
// they saw recently.
export default function PopQuiz({ onExit }: { onExit: () => void }) {
  const [questions, setQuestions] = useState<PStep[] | null>(null)
  const [index, setIndex] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const praise = useMemo(() => encouragement(), [])
  const learnerName = useMemo(() => getName() || 'Suresh', [])

  useEffect(() => {
    void db.lessonProgress.toArray().then((rows) => {
      const done = new Set(rows.filter((r) => r.completed).map((r) => r.lessonId))
      const qs = buildQuiz(done, 10)
      rememberSeen(qs)
      setQuestions(qs)
    })
  }, [])

  const finished = !!questions && index >= questions.length
  const pct = questions && questions.length ? Math.round((score / questions.length) * 100) : 0

  useEffect(() => {
    if (finished) {
      // Sequence the two stats writes so the streak update isn't clobbered.
      void (async () => {
        await markPracticedToday() // doing a Pop Quiz counts for the day
        await recordQuizResult(pct)
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  if (!questions) {
    return (
      <main className="app">
        <p className="muted">Building your quiz…</p>
      </main>
    )
  }

  if (!questions.length) {
    return (
      <main className="app">
        <section className="card done-card">
          <p className="due-count">Not yet</p>
          <p className="muted">Finish a lesson first, then the quiz can test what you learned.</p>
          <button className="btn-primary" onClick={onExit}>
            Back to home
          </button>
        </section>
      </main>
    )
  }

  if (finished) {
    return (
      <main className="app">
        <section className="card quiz-result">
          <div className={`score-ring ${pct >= 80 ? 'great' : pct >= 50 ? 'ok' : 'low'}`}>
            <span className="score-pct">{pct}%</span>
          </div>
          <p className="due-count">{praise}</p>
          <p className="muted">
            You got {score} of {questions.length} correct.
          </p>
          <button className="btn-primary" onClick={onExit}>
            Back to home
          </button>
        </section>
      </main>
    )
  }

  function result(correct: boolean) {
    if (answered) return
    setAnswered(true)
    if (correct) setScore((s) => s + 1)
  }

  function next() {
    setAnswered(false)
    setIndex((i) => i + 1)
  }

  return (
    <main className="app player">
      <div className="player-top">
        <button className="x-btn" onClick={() => setConfirmQuit(true)} aria-label="Quit quiz">
          ✕
        </button>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(index / questions.length) * 100}%` }}
          />
        </div>
        <span className="q-count">
          {index + 1} / {questions.length}
        </span>
      </div>

      <StepView
        key={index}
        step={personalize(questions[index], learnerName)}
        showScript={false}
        onNext={next}
        onResult={result}
      />

      {confirmQuit && (
        <Modal
          title="Quit quiz?"
          message="Your quiz progress won't be saved — you'll start fresh next time. Return to the main menu?"
          actions={[
            { label: 'Keep going', variant: 'ghost', onClick: () => setConfirmQuit(false) },
            { label: 'Quit', variant: 'danger', onClick: onExit },
          ]}
        />
      )}
    </main>
  )
}
