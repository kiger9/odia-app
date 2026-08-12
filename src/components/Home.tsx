import { useLiveQuery } from 'dexie-react-hooks'
import { db, type LessonProgress, type Progress, type Stats } from '../db'
import { CHAPTERS, LESSON_BY_ID } from '../data/lessons'
import { poolStats, formatWhen } from '../reviews'
import { viewStreak } from '../streak'
import Wordmark from './Wordmark'

// How far through a single lesson (0–1).
function lessonFrac(lesson: { items: unknown[] }, p?: LessonProgress): number {
  if (p?.completed) return 1
  if (!p) return 0
  return Math.min(p.step / lesson.items.length, 1)
}

export default function Home({
  onStart,
  onReview,
  onSettings,
  dailyGoal,
}: {
  onStart: (lessonId: string) => void
  onReview: () => void
  onSettings: () => void
  dailyGoal: number
}) {
  const progress = useLiveQuery(() => db.lessonProgress.toArray(), [], [] as LessonProgress[])
  const reviewRows = useLiveQuery(() => db.progress.toArray(), [], [] as Progress[])
  const statsRec = useLiveQuery(() => db.stats.get('main'), [], undefined as Stats | undefined)
  const byId = new Map(progress.map((p) => [p.lessonId, p]))

  const totalLessons = CHAPTERS.reduce((n, c) => n + c.lessons.length, 0)
  const completed = progress.filter((p) => p.completed).length
  const { poolSize, dueCount, nextDue } = poolStats(reviewRows)
  const streak = viewStreak(statsRec, dailyGoal)
  const goalPct = Math.min((streak.count / streak.goal) * 100, 100)

  return (
    <main className="app">
      <header className="brand">
        <button className="gear" onClick={onSettings} aria-label="Settings">
          ⚙
        </button>
        <Wordmark size="md" />
        <p className="muted">
          {completed} of {totalLessons} lessons complete
        </p>
      </header>

      <div className="tiles">
        <div className="stat-tile">
          <div className="stat-head">
            <span className={`flame ${streak.streak > 0 ? 'lit' : ''}`}>🔥</span>
            <span className="stat-num">{streak.streak}</span>
            <span className="stat-cap">day{streak.streak === 1 ? '' : 's'}</span>
          </div>
          <div className="stat-sub muted">
            {streak.metToday ? 'Goal met ✓' : `${streak.count} / ${streak.goal} exercises today`}
          </div>
          <div className="pbar mini">
            <i style={{ width: `${goalPct}%` }} />
          </div>
        </div>

        {poolSize > 0 && (
          <button
            className="stat-tile stat-button"
            onClick={onReview}
            disabled={dueCount === 0}
          >
            <div className="stat-head">
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
                    onClick={() => onStart(lesson.id)}
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
    </main>
  )
}
