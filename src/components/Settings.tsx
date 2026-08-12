import { SHOW_SCRIPT_FEATURE, GOAL_OPTIONS } from '../settings'

export default function Settings({
  showScript,
  onToggleScript,
  dailyGoal,
  onSetGoal,
  onBack,
}: {
  showScript: boolean
  onToggleScript: (v: boolean) => void
  dailyGoal: number
  onSetGoal: (v: number) => void
  onBack: () => void
}) {
  return (
    <main className="app">
      <header className="sub-head">
        <button className="back" onClick={onBack} aria-label="Back">
          ‹
        </button>
        <h2>Settings</h2>
      </header>

      <section className="card setting-card">
        <div className="setting-text">
          <b>Daily goal</b>
          <small className="muted">How much practice counts as a full day for your streak.</small>
        </div>
        <div className="goal-picker">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`goal-option ${dailyGoal === opt.value ? 'active' : ''}`}
              onClick={() => onSetGoal(opt.value)}
            >
              <b>{opt.value}</b>
              <small>{opt.label}</small>
            </button>
          ))}
        </div>
      </section>

      {/* Odia-script toggle — hidden until the script content layer is ready. */}
      {SHOW_SCRIPT_FEATURE && (
        <>
          <section className="card setting-card">
            <label className="setting-row">
              <span className="setting-text">
                <b>Show Odia script</b>
                <small className="muted">
                  Display the Odia script beneath the phonetic spelling while learning.
                </small>
              </span>
              <span
                className={`switch ${showScript ? 'on' : ''}`}
                role="switch"
                aria-checked={showScript}
              >
                <input
                  type="checkbox"
                  checked={showScript}
                  onChange={(e) => onToggleScript(e.target.checked)}
                />
                <span className="knob" />
              </span>
            </label>
          </section>

          <p className="muted setting-note">
            Script is being added lesson by lesson — this toggle reveals it wherever it's
            available.
          </p>
        </>
      )}

      <footer className="credit muted">
        Curriculum from <em>Oriya in Small Bites — a Self-study Language Guide</em> by Niels
        Erik Wegge (The Modern Book Depot, Bhubaneswar, 2000).
      </footer>
    </main>
  )
}
