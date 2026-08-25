import { useState } from 'react'
import { SHOW_SCRIPT_FEATURE } from '../settings'
import {
  HOUR_OPTIONS,
  disableReminders,
  enableReminders,
  getReminderHour,
  notificationPermission,
  notificationSupport,
  remindersOn,
  setReminderHour,
  showReminderNow,
} from '../notifications'

export default function Settings({
  showScript,
  onToggleScript,
  onBack,
}: {
  showScript: boolean
  onToggleScript: (v: boolean) => void
  onBack: () => void
}) {
  const support = notificationSupport()
  const [remind, setRemind] = useState(remindersOn())
  const [hour, setHour] = useState(getReminderHour())
  const [blocked, setBlocked] = useState(notificationPermission() === 'denied')
  const [tested, setTested] = useState(false)

  async function toggleRemind(on: boolean) {
    if (!on) {
      setRemind(false)
      await disableReminders()
      return
    }
    const result = await enableReminders()
    setRemind(result === 'granted')
    setBlocked(result === 'denied' && notificationPermission() === 'denied')
  }

  async function pickHour(value: number) {
    setHour(value)
    await setReminderHour(value)
  }

  async function sendTest() {
    if (await showReminderNow()) {
      setTested(true)
      setTimeout(() => setTested(false), 3000)
    }
  }

  return (
    <main className="app">
      <header className="sub-head">
        <button className="back" onClick={onBack} aria-label="Back">
          ‹
        </button>
        <h2>Settings</h2>
      </header>

      {/* Daily practice reminder */}
      <section className="card setting-card">
        <label className="setting-row">
          <span className="setting-text">
            <b>Daily reminder</b>
            <small className="muted">
              An evening nudge to practise Odia and keep your streak going.
            </small>
          </span>
          <span
            className={`switch ${remind ? 'on' : ''} ${support === 'ok' ? '' : 'disabled'}`}
            role="switch"
            aria-checked={remind}
          >
            <input
              type="checkbox"
              checked={remind}
              disabled={support !== 'ok' || blocked}
              onChange={(e) => void toggleRemind(e.target.checked)}
            />
            <span className="knob" />
          </span>
        </label>

        {remind && (
          <div className="reminder-time">
            <small className="muted">Remind me at</small>
            <div className="hour-picker">
              {HOUR_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className={`hour-option ${hour === o.value ? 'active' : ''}`}
                  onClick={() => void pickHour(o.value)}
                >
                  <b>{o.label}</b>
                </button>
              ))}
            </div>
            <button className="test-btn" onClick={() => void sendTest()}>
              {tested ? 'Sent — check your notifications' : 'Send a test reminder'}
            </button>
          </div>
        )}
      </section>

      {support === 'needs-install' && (
        <p className="muted setting-note">
          To get reminders on an iPhone, add this app to your home screen first: tap the
          Share button, then <b>Add to Home Screen</b>, and open it from there.
        </p>
      )}
      {support === 'unsupported' && (
        <p className="muted setting-note">This browser can't show notifications.</p>
      )}
      {support === 'ok' && blocked && (
        <p className="muted setting-note">
          Notifications are blocked for this app in your phone's settings. Allow them there
          and this switch will work.
        </p>
      )}
      {support === 'ok' && !blocked && (
        <p className="muted setting-note">
          Reminders are sent by your phone, not by us — nothing leaves the device. You'll
          only be nudged on days you haven't practised yet.
        </p>
      )}

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
