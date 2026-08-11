import { useLiveQuery } from 'dexie-react-hooks'
import { db, type LessonProgress } from '../db'
import { CHAPTERS, LESSON_BY_ID } from '../data/lessons'

export default function Home({
  onStart,
  onSettings,
}: {
  onStart: (lessonId: string) => void
  onSettings: () => void
}) {
  const progress = useLiveQuery(() => db.lessonProgress.toArray(), [], [] as LessonProgress[])
  const byId = new Map(progress.map((p) => [p.lessonId, p]))

  const totalLessons = CHAPTERS.reduce((n, c) => n + c.lessons.length, 0)
  const completed = progress.filter((p) => p.completed).length

  return (
    <main className="app">
      <header className="brand">
        <button className="gear" onClick={onSettings} aria-label="Settings">
          ⚙
        </button>
        <h1>
          Odia <span className="brand-mark">in small bites</span>
        </h1>
        <p className="muted">
          {completed} of {totalLessons} lessons complete
        </p>
      </header>

      {CHAPTERS.map((ch) => {
        const lessons = ch.lessons.map((id) => LESSON_BY_ID[id])
        const doneInCh = ch.lessons.filter((id) => byId.get(id)?.completed).length
        return (
          <section className="chapter" key={ch.key}>
            <div className="chapter-head">
              <h2>{ch.title}</h2>
              <span className="chapter-count muted">
                {doneInCh}/{ch.lessons.length}
              </span>
            </div>
            <p className="chapter-blurb muted">{ch.blurb}</p>

            <div className="lesson-list">
              {lessons.map((lesson) => {
                const p = byId.get(lesson.id)
                const state = p?.completed
                  ? 'done'
                  : p && p.step > 0
                    ? 'progress'
                    : 'new'
                const pct = p?.completed
                  ? 100
                  : p
                    ? Math.round((p.step / lesson.items.length) * 100)
                    : 0
                return (
                  <button
                    className={`lesson-row ${state}`}
                    key={lesson.id}
                    onClick={() => onStart(lesson.id)}
                  >
                    <span className="lesson-icon">{state === 'done' ? '✓' : '›'}</span>
                    <span className="lesson-text">
                      <b>{lesson.title}</b>
                      <small>
                        {state === 'progress' ? `In progress · ${pct}%` : lesson.sub}
                      </small>
                    </span>
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
