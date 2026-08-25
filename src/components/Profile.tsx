import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Stats } from '../db'
import { getName, setName, resetProgress, formatDate } from '../profile'
import { viewStreak } from '../streak'
import Modal from './Modal'

function StatLine({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat-line">
      <div className="sl-main">
        <span className="sl-label muted">{label}</span>
        <b className="sl-value">{value}</b>
      </div>
      {sub && <div className="sl-sub muted">{sub}</div>}
    </div>
  )
}

export default function Profile({
  onBack,
  onSettings,
}: {
  onBack: () => void
  onSettings: () => void
}) {
  const stats = useLiveQuery(() => db.stats.get('main'), [], undefined as Stats | undefined)
  const [name, setNameState] = useState(getName())
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [resetStage, setResetStage] = useState<0 | 1 | 2>(0)

  const sv = viewStreak(stats)
  const quizzes = stats?.quizzesTaken ?? 0
  const avg = quizzes ? Math.round((stats?.quizScoreSum ?? 0) / quizzes) : null
  const lessons = stats?.lessonsCompleted ?? 0
  const longest = stats?.longestStreak ?? 0

  function saveName() {
    const n = draft.trim()
    setName(n)
    setNameState(n)
    setEditing(false)
  }

  return (
    <main className="app">
      <header className="sub-head">
        <button className="back" onClick={onBack} aria-label="Back">
          ‹
        </button>
        <h2>Profile</h2>
      </header>

      <section className="card profile-name">
        <div className="pn-avatar">{name ? name[0].toUpperCase() : '🙂'}</div>
        <div className="pn-info">
          <b>{name || 'Add your name'}</b>
        </div>
        <button
          className="pn-edit"
          onClick={() => {
            setDraft(name)
            setEditing(true)
          }}
        >
          Edit
        </button>
      </section>

      <section className="card stats-card">
        <StatLine
          label="Current streak"
          value={sv.streak ? `${sv.streak} day${sv.streak === 1 ? '' : 's'}` : 'None yet'}
          sub={sv.streak ? `since ${formatDate(stats?.streakStart)}` : undefined}
        />
        <StatLine
          label="Longest streak"
          value={longest ? `${longest} day${longest === 1 ? '' : 's'}` : 'None yet'}
          sub={longest ? `${formatDate(stats?.longestStart)} – ${formatDate(stats?.longestEnd)}` : undefined}
        />
        <StatLine label="Lessons completed" value={String(lessons)} sub="including redos" />
        <StatLine label="Pop quizzes taken" value={String(quizzes)} />
        <StatLine label="Average quiz score" value={avg === null ? '—' : `${avg}%`} />
      </section>

      <button className="settings-link" onClick={onSettings}>
        <span className="sl-icon">⚙️</span>
        <span className="setting-text">
          <b>Settings</b>
          <small className="muted">Daily reminder and app options</small>
        </span>
        <span className="quiz-arrow">›</span>
      </button>

      <button className="reset-btn" onClick={() => setResetStage(1)}>
        Reset all progress
      </button>

      <footer className="credit muted">
        Curriculum from <em>Oriya in Small Bites — a Self-study Language Guide</em> by Niels
        Erik Wegge (The Modern Book Depot, Bhubaneswar, 2000).
      </footer>

      {editing && (
        <Modal
          title="Your name"
          actions={[
            { label: 'Cancel', variant: 'ghost', onClick: () => setEditing(false) },
            { label: 'Save', variant: 'primary', onClick: saveName, disabled: !draft.trim() },
          ]}
        >
          <input
            className="name-input"
            value={draft}
            autoFocus
            maxLength={24}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.trim()) saveName()
            }}
            placeholder="Type your name"
          />
        </Modal>
      )}

      {resetStage === 1 && (
        <Modal
          title="Reset all progress?"
          message="This clears your streak, lessons, reviews and quiz stats. Your name is kept. This can't be undone."
          actions={[
            { label: 'Cancel', variant: 'ghost', onClick: () => setResetStage(0) },
            { label: 'Reset', variant: 'danger', onClick: () => setResetStage(2) },
          ]}
        />
      )}

      {resetStage === 2 && (
        <Modal
          title="Are you absolutely sure?"
          message="Everything except your name will be permanently erased."
          actions={[
            { label: 'Keep my progress', variant: 'ghost', onClick: () => setResetStage(0) },
            {
              label: 'Yes, erase it all',
              variant: 'danger',
              onClick: () => {
                void resetProgress()
                setResetStage(0)
              },
            },
          ]}
        />
      )}
    </main>
  )
}
