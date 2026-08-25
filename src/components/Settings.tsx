import { useEffect, useState } from 'react'
import Modal from './Modal'
import { SHOW_SCRIPT_FEATURE } from '../settings'
import { backupNow, formatCode, getLastBackup, getSyncCode, restoreFrom } from '../backup'
import {
  HOUR_OPTIONS,
  disableReminders,
  enableReminders,
  getRegistrationState,
  getReminderHour,
  notificationPermission,
  notificationSupport,
  registerWithServer,
  remindersOn,
  setReminderHour,
  showReminderNow,
  type RegStatus,
} from '../notifications'

const RESTORE_ERROR: Record<string, string> = {
  'bad-code': 'A sync code is 12 characters. Check for a missing one.',
  'not-found': "No backup found for that code. Check it character by character — it's easy to read a 5 as an S.",
  'rate-limited': 'Too many tries from here. Wait an hour.',
  offline: "Couldn't reach the service. Check your connection.",
  failed: 'Something went wrong reading that backup.',
}

// "3 minutes ago" reads better than a timestamp for something checked at a glance.
function describeWhen(at: number): string {
  const mins = Math.round((Date.now() - at) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

// Said plainly, because this is what someone reads when a reminder didn't arrive.
const REG_MESSAGE: Record<RegStatus, string> = {
  ok: 'Set up — reminders arrive even when the app is closed',
  never: 'Not set up for reminders while the app is closed',
  'no-push': "This phone wouldn't set up push — reminders only work while the app is open",
  refused: 'Your phone is blocking notifications for this app',
  unreachable: "Couldn't reach the reminder service — reminders only work while the app is open",
  rejected: 'The reminder service turned this phone away',
}

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
  const [reg, setReg] = useState(getRegistrationState())
  const [retrying, setRetrying] = useState(false)

  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [lastBackup, setLastBackup] = useState(getLastBackup())
  const [restoring, setRestoring] = useState(false)
  const [codeDraft, setCodeDraft] = useState('')
  const [restoreBusy, setRestoreBusy] = useState(false)
  const [restoreError, setRestoreError] = useState('')

  // Registration happens in the background when the switch goes on, so watch for
  // it to land rather than showing a stale "not registered" underneath.
  useEffect(() => {
    if (!remind || reg.status === 'ok') return
    const t = setInterval(() => setReg(getRegistrationState()), 700)
    return () => clearInterval(t)
  }, [remind, reg.status])

  async function toggleRemind(on: boolean) {
    if (!on) {
      setRemind(false)
      await disableReminders()
      return
    }
    const result = await enableReminders()
    setRemind(result === 'granted')
    setBlocked(result === 'denied' && notificationPermission() === 'denied')
    setReg(getRegistrationState())
  }

  async function retry() {
    setRetrying(true)
    await registerWithServer()
    setReg(getRegistrationState())
    setRetrying(false)
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

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(formatCode(getSyncCode()))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Some browsers refuse the clipboard; the code is on screen to read anyway.
    }
  }

  async function saveNow() {
    setSaving(true)
    const result = await backupNow()
    setSaving(false)
    setLastBackup(getLastBackup())
    setSavedMsg(
      result === 'saved'
        ? 'Saved'
        : result === 'offline'
          ? "Couldn't reach the service — it'll try again later"
          : 'The service refused the copy',
    )
    setTimeout(() => setSavedMsg(''), 4000)
  }

  async function doRestore() {
    setRestoreBusy(true)
    const result = await restoreFrom(codeDraft)
    setRestoreBusy(false)
    if (result.status === 'restored') {
      setRestoring(false)
      // Everything on screen was read from the database at load, so the honest
      // way to show restored progress is to start again from it.
      location.reload()
      return
    }
    setRestoreError(RESTORE_ERROR[result.status])
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

            <div className={`reg-status ${reg.status === 'ok' ? 'good' : 'bad'}`}>
              <span>{REG_MESSAGE[reg.status]}</span>
              {reg.status !== 'ok' && (
                <button className="reg-retry" onClick={() => void retry()} disabled={retrying}>
                  {retrying ? 'Trying…' : 'Try again'}
                </button>
              )}
            </div>
            {reg.status !== 'ok' && reg.detail && (
              <small className="muted reg-detail">{reg.detail}</small>
            )}
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
          Your name and streak never leave the phone — the reminder is written here. The
          service is told only where to knock and when, and stays quiet on days you've
          already practised.
        </p>
      )}

      {/* Progress backup */}
      <section className="card setting-card">
        <span className="setting-text">
          <b>Your progress, saved</b>
          <small className="muted">
            Your streak and lessons are copied off this phone after each practice, so
            losing the phone doesn't lose them.
          </small>
        </span>

        <div className="sync-code" onClick={copyCode} role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') void copyCode() }}>
          <code>{formatCode(getSyncCode())}</code>
          <span className="sync-copy">{copied ? 'Copied' : 'Copy'}</span>
        </div>

        <small className="muted sync-note">
          Keep this code somewhere safe — a note, a password manager, anywhere but this
          phone. It's the only way back to your progress, and nobody can look it up for
          you. {lastBackup ? `Last saved ${describeWhen(lastBackup)}.` : 'Not saved yet.'}
        </small>

        <button className="test-btn" onClick={() => void saveNow()} disabled={saving}>
          {saving ? 'Saving…' : savedMsg || 'Save a copy now'}
        </button>
        <button className="test-btn" onClick={() => setRestoring(true)}>
          Restore from a code
        </button>
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

      {restoring && (
        <Modal
          title="Restore from a code"
          message="This replaces everything on this phone — streak, lessons, reviews — with whatever was saved under that code. It can't be undone."
          actions={[
            {
              label: 'Cancel',
              variant: 'ghost',
              onClick: () => {
                setRestoring(false)
                setRestoreError('')
                setCodeDraft('')
              },
            },
            {
              label: restoreBusy ? 'Restoring…' : 'Restore',
              variant: 'danger',
              onClick: () => void doRestore(),
              disabled: restoreBusy || codeDraft.replace(/[^A-Za-z0-9]/g, '').length !== 12,
            },
          ]}
        >
          <input
            className="name-input code-input"
            value={codeDraft}
            autoFocus
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={17}
            onChange={(e) => {
              setCodeDraft(e.target.value)
              setRestoreError('')
            }}
            placeholder="XXXX-XXXX-XXXX"
          />
          {restoreError && <p className="restore-error">{restoreError}</p>}
        </Modal>
      )}

      <footer className="credit muted">
        Curriculum from <em>Oriya in Small Bites — a Self-study Language Guide</em> by Niels
        Erik Wegge (The Modern Book Depot, Bhubaneswar, 2000).
        <br />
        <span className="build-id">Version {__BUILD_ID__}</span>
      </footer>
    </main>
  )
}
