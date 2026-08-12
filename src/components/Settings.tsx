import { SHOW_SCRIPT_FEATURE } from '../settings'

export default function Settings({
  showScript,
  onToggleScript,
  onBack,
}: {
  showScript: boolean
  onToggleScript: (v: boolean) => void
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
