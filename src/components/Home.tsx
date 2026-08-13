import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type LessonProgress, type Progress, type Stats } from '../db'
import { CHAPTERS, LESSON_BY_ID } from '../data/lessons'
import { poolStats, formatWhen } from '../reviews'
import { viewStreak, todayString, getCelebratedDay, setCelebratedDay } from '../streak'
import { encouragement } from '../profile'
import Wordmark from './Wordmark'
import Celebration from './Celebration'
import Modal from './Modal'

// How far through a single lesson (0–1).
function lessonFrac(lesson: { items: unknown[] }, p?: LessonProgress): number {
  if (p?.completed) return 1
  if (!p) return 0
  return Math.min(p.step / lesson.items.length, 1)
}

export default function Home({
  onStart,
  onReview,
  onQuiz,
  onProfile,
  onDictionary,
}: {
  onStart: (lessonId: string, startStep: number) => void
  onReview: () => void
  onQuiz: () => void
  onProfile: () => void
  onDictionary: () => void
}) {
  const progress = useLiveQuery(() => db.lessonProgress.toArray(), [], [] as LessonProgress[])
  const reviewRows = useLiveQuery(() => db.progress.toArray(), [], [] as Progress[])
  const statsRec = useLiveQuery(() => db.stats.get('main'), [], undefined as Stats | undefined)
  const byId = new Map(progress.map((p) => [p.lessonId, p]))

  const totalLessons = CHAPTERS.reduce((n, c) => n + c.lessons.length, 0)
  const completed = progress.filter((p) => p.completed).length
  const { poolSize, dueCount, nextDue } = poolStats(reviewRows)
  const streak = viewStreak(statsRec)

  // Resume-or-restart prompt for a partly-done lesson.
  const [resumeLesson, setResumeLesson] = useState<{ id: string; step: number } | null>(null)
  function handleLessonClick(id: string) {
    const p = byId.get(id)
    if (p && !p.completed && p.step > 0) setResumeLesson({ id, step: p.step })
    else onStart(id, 0)
  }

  // Celebration: play once, the first time home reopens after practicing today.
  const [celebrate, setCelebrate] = useState<string | null>(null)
  const triggered = useRef(false)
  useEffect(() => {
    if (triggered.current || !statsRec) return
    if (viewStreak(statsRec).practicedToday && getCelebratedDay() !== todayString()) {
      triggered.current = true
      setCelebratedDay(todayString())
      setCelebrate(encouragement())
    }
  }, [statsRec])
  useEffect(() => {
    if (!celebrate) return
    const t = setTimeout(() => setCelebrate(null), 2300)
    return () => clearTimeout(t)
  }, [celebrate])

  const streakSub = streak.practicedToday
    ? 'Practiced today ✓'
    : streak.streak > 0
      ? 'Practice to keep it going'
      : 'Start your streak today'

  return (
    <main className="app">
      <header className="brand">
        <button className="book-btn" onClick={onDictionary} aria-label="Dictionary">
          📖
        </button>
        <button className="gear" onClick={onProfile} aria-label="Profile">
          👤
        </button>
        <Wordmark size="md" />
        <p className="muted">
          {completed} of {totalLessons} lessons complete
        </p>
      </header>

      {celebrate ? (
        <Celebration phrase={celebrate} />
      ) : (
        <div className="tiles">
          <div className="stat-tile">
            <div className="stat-head">
              <span className={`flame ${streak.streak > 0 ? 'lit' : ''}`}>🔥</span>
              <span className="stat-num">{streak.streak}</span>
              <span className="stat-cap">Day Streak</span>
            </div>
            <div className="stat-sub muted">{streakSub}</div>
          </div>

          {poolSize > 0 && (
            <button
              className="stat-tile stat-button"
              onClick={onReview}
              disabled={dueCount === 0}
            >
              <div className="stat-head">
                <span className="review-icon">📝</span>
                <span className="stat-num review-num">{dueCount > 0 ? dueCount : '✓'}</span>
                <span className="stat-cap">{dueCount > 0 ? 'reviews due' : 'reviews'}</span>
              </div>
              <div className="stat-sub muted">
                {dueCount > 0
                  ? 'Tap to begin'
                  : nextDue
                    ? `Next ${formatWhen(nextDue)}`
                    : 'Up to date'}
              </div>
            </button>
          )}
        </div>
      )}

      <button className="quiz-btn" onClick={onQuiz} disabled={completed === 0}>
        <span className="quiz-emoji">🎲</span>
        <span className="quiz-text">
          <b>Pop Quiz</b>
          <small>
            {completed === 0
              ? 'Complete any lesson to unlock this feature'
              : "Fresh questions from everything you've learned"}
          </small>
        </span>
        <span className="quiz-arrow">›</span>
      </button>

      {CHAPTERS.map((ch) => {
        const lessons = ch.lessons.map((id) => LESSON_BY_ID[id])
        const doneInCh = ch.lessons.filter((id) => byId.get(id)?.completed).length
        const chFrac =
          lessons.reduce((sum, l) => sum + lessonFrac(l, byId.get(l.id)), 0) / lessons.length

        return (
          <section className="chapter" key={ch.key}>
            <div className="chapter-head">
              <h2>{ch.title}</h2>
              <span className="chapter-count muted">
                {doneInCh}/{ch.lessons.length}
              </span>
            </div>
            <p className="chapter-blurb muted">{ch.blurb}</p>
            <div className="pbar chapter-pbar">
              <i style={{ width: `${Math.round(chFrac * 100)}%` }} />
            </div>

            <div className="lesson-list">
              {lessons.map((lesson) => {
                const p = byId.get(lesson.id)
                const frac = lessonFrac(lesson, p)
                const state = p?.completed ? 'done' : p && p.step > 0 ? 'progress' : 'new'
                return (
                  <button
                    className={`lesson-row ${state}`}
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson.id)}
                  >
                    <div className="lesson-main">
                      <span className="lesson-icon">{state === 'done' ? '✓' : '›'}</span>
                      <span className="lesson-text">
                        <b>{lesson.title}</b>
                        <small>
                          {state === 'progress'
                            ? `In progress · ${Math.round(frac * 100)}%`
                            : lesson.sub}
                        </small>
                      </span>
                    </div>
                    <div className="pbar">
                      <i style={{ width: `${Math.round(frac * 100)}%` }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      <footer className="credit muted">
        Curriculum from <em>Oriya in Small Bites</em> by Niels Erik Wegge.
      </footer>

      {resumeLesson && (
        <Modal
          title="Continue lesson?"
          message="You're partway through this lesson — pick up where you left off, or start over?"
          actions={[
            {
              label: 'Start over',
              variant: 'ghost',
              onClick: () => {
                const r = resumeLesson
                setResumeLesson(null)
                onStart(r.id, 0)
              },
            },
            {
              label: 'Continue',
              variant: 'primary',
              onClick: () => {
                const r = resumeLesson
                setResumeLesson(null)
                onStart(r.id, r.step)
              },
            },
          ]}
        />
      )}
    </main>
  )
}
