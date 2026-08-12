import { useEffect, useState } from 'react'
import { buildQuiz, getLearnedItems, type QuizQuestion } from '../quiz'
import { markPracticedToday } from '../streak'

export default function PopQuiz({ onExit }: { onExit: () => void }) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  useEffect(() => {
    getLearnedItems().then((items) => setQuestions(buildQuiz(items, 10)))
  }, [])

  const finished = !!questions && index >= questions.length

  useEffect(() => {
    if (finished) void markPracticedToday() // doing a Pop Quiz counts for the day
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
    const pct = Math.round((score / questions.length) * 100)
    return (
      <main className="app">
        <section className="card done-card">
          <p className="done-mark">🎉</p>
          <p className="due-count">
            {score} / {questions.length}
          </p>
          <p className="muted">
            {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Nice work — keep practicing.' : 'Good effort — review and try again.'}
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
        <button className="x-btn" onClick={onExit} aria-label="Quit quiz">
          ✕
        </button>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(index / questions.length) * 100}%` }}
          />
        </div>
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
    </main>
  )
}
