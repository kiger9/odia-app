import { useEffect, useMemo, useState } from 'react'
import { buildQuiz, getLearnedItems, type QuizQuestion } from '../quiz'
import { markPracticedToday } from '../streak'
import { recordQuizResult, encouragement } from '../profile'
import Modal from './Modal'

export default function PopQuiz({ onExit }: { onExit: () => void }) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const praise = useMemo(() => encouragement(), [])

  useEffect(() => {
    getLearnedItems().then((items) => setQuestions(buildQuiz(items, 10)))
  }, [])

  const finished = !!questions && index >= questions.length
  const pct = questions && questions.length ? Math.round((score / questions.length) * 100) : 0

  useEffect(() => {
    if (finished) {
      void markPracticedToday() // doing a Pop Quiz counts for the day
      void recordQuizResult(pct)
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

  const q = questions[index]

  function pick(opt: string) {
    if (picked) return
    setPicked(opt)
    if (opt === q.answer) setScore((s) => s + 1)
  }

  function next() {
    setPicked(null)
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

      <section className="card review-q">
        <p className="prompt-label muted">
          {q.direction === 'toOdia' ? 'Which is the Odia?' : 'What does this mean?'}
        </p>
        <p className="prompt-en">{q.prompt}</p>
      </section>

      <div className="opts">
        {q.options.map((opt) => {
          const state =
            picked === null ? '' : opt === q.answer ? 'right' : opt === picked ? 'wrong' : 'dim'
          return (
            <button
              key={opt}
              className={`opt ${state}`}
              disabled={picked !== null}
              onClick={() => pick(opt)}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {picked !== null && (
        <button className="btn-primary" onClick={next}>
          Continue
        </button>
      )}

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
