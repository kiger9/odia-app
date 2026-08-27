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
  reconcileReminders,
  registerWithServer,
  remindersOn,
  sendTestReminder,
  setReminderHour,
  type RegState,
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
//
// The two "couldn't reach it" cases depend on whether this phone was ever signed
// up: a service that already holds this address and is briefly unreachable is a
// blip we retry, not a phone that gets no reminders. Reporting every hiccup as
// "your phone is blocking notifications" is how a working setup came to look
// broken every time the app was reopened.
function regMessage(reg: RegState): string {
  switch (reg.status) {
    case 'ok':
      return 'Set up — reminders arrive even when the app is closed'
    case 'never':
      return 'Not set up for reminders while the app is closed'
    case 'no-push':
      return "This phone wouldn't set up push — reminders only work while the app is open"
    case 'refused':
      return 'Your phone is blocking notifications for this app'
    case 'unreachable':
      return reg.confirmed
        ? "Set up — the reminder service was unreachable just now, we'll try again"
        : "Couldn't reach the reminder service — reminders only work while the app is open"
    case 'rejected':
      return 'The reminder service turned this phone away'
  }
}

const TEST_MESSAGE: Record<string, string> = {
  knocked: 'Sent from the service — check your notifications',
  local: "Shown from the app — the service couldn't be reached",
  failed: "Couldn't show a notification",
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
  const [tested, setTested] = useState('')
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

  // What is on screen was read from localStorage, which the browser is entitled
  // to have cleared while the app was closed. Check the phone itself before
  // showing anyone a verdict about it.
  useEffect(() => {
    let live = true
    void reconcileReminders().then(() => {
      if (!live) return
      setRemind(remindersOn())
      setHour(getReminderHour())
      setBlocked(notificationPermission() === 'denied')
      setReg(getRegistrationState())
    })
    return () => {
      live = false
    }
  }, [])

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
    // Straight from a tap, so this one is allowed to open the permission prompt.
    await registerWithServer({ allowPrompt: true })
    setReg(getRegistrationState())
    setRetrying(false)
  }

  async function pickHour(value: number) {
    setHour(value)
    await setReminderHour(value)
  }

  // The point of a test is the route that breaks — the service knocking on a
  // phone that isn't looking — so it goes the long way round and says which way
  // the reminder actually arrived.
  async function sendTest() {
    const result = await sendTestReminder()
    setTested(result)
    setReg(getRegistrationState())
    setTimeout(() => setTested(''), 5000)
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
              {tested ? TEST_MESSAGE[tested] : 'Send a test reminder'}
            </button>

            <div className={`reg-status ${reg.status === 'ok' ? 'good' : 'bad'}`}>
              <span>{regMessage(reg)}</span>
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
