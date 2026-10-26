import { useEffect, useState } from 'react'
import Splash from './components/Splash'
import Home from './components/Home'
import Profile from './components/Profile'
import SettingsScreen from './components/Settings'
import LessonPlayer from './components/LessonPlayer'
import ReviewSession from './components/ReviewSession'
import PopQuiz from './components/PopQuiz'
import Dictionary from './components/Dictionary'
import Roleplay from './components/Roleplay'
import Modal from './components/Modal'
import { CHAPTERS, LESSON_BY_ID } from './data/lessons'
import { ROLEPLAYS_BY_CHAPTER, ROLEPLAY_BY_ID, otherRole, unlockedRoleplays, withRole, type Role } from './data/roleplays'
import { db } from './db'
import { getShowScript, setShowScript } from './settings'
import { getName, setName, hasBeenAskedName, markNameAsked } from './profile'
import { backupIfStale } from './backup'
import {
  enableReminders,
  hasBeenAskedNotifications,
  markNotificationsAsked,
  notificationPermission,
  notificationSupport,
  refreshReminderRegistration,
  startReminderTimer,
  syncNotificationState,
} from './notifications'

type Screen =
  | { name: 'home' }
  | { name: 'lesson'; id: string; startStep: number }
  | { name: 'review' }
  | { name: 'quiz' }
  | { name: 'roleplay'; chapter: string; roles: Role[] } // a chapter's roleplays, in order, with the learner's role in each
  | { name: 'roleplay-random'; pick: { id: string; you: Role }[] } // chosen from finished chapters
  | { name: 'profile' }
  | { name: 'settings' }
  | { name: 'dictionary' }

// First-run setup runs in order: name, then the offer of a daily reminder.
// How many times a chapter's roleplays have been started: odd runs swap the
// learner's role in every conversation, so two runs cover both sides of each.
function nextRoleplayRun(chapter: string): number {
  const key = `odia:rp-run:${chapter}`
  let run = 0
  try {
    run = Number(localStorage.getItem(key)) || 0
    localStorage.setItem(key, String(run + 1))
  } catch {
    // storage unavailable: always the default roles
  }
  return run
}

// The learner's role in each conversation of a chapter for this run.
function chapterRoles(chapter: string): Role[] {
  const run = nextRoleplayRun(chapter)
  // Strictly alternate parent and child within a run; the next run flips every
  // conversation, so two runs cover both roles of each.
  return (ROLEPLAYS_BY_CHAPTER[chapter] ?? []).map((_, i): Role => ((i + run) % 2 === 0 ? 'parent' : 'child'))
}

type Setup = 'name' | 'notifications' | 'done'

export default function App() {
  const [splash, setSplash] = useState<'showing' | 'leaving' | 'gone'>('showing')
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [showScript, setShowScriptState] = useState(getShowScript())

  // First-run (or first time since this feature shipped): ask for the learner's
  // name, then offer reminders. Either step is skipped if it's already settled.
  const [setup, setSetup] = useState<Setup>(() => {
    if (!hasBeenAskedName()) return 'name'
    if (shouldOfferReminders()) return 'notifications'
    return 'done'
  })
  const [nameDraft, setNameDraft] = useState('')

  useEffect(() => {
    const t1 = setTimeout(() => setSplash('leaving'), 2600)
    const t2 = setTimeout(() => setSplash('gone'), 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  // Keep the reminder's copy of the name/streak fresh, and cover the case where
  // the app is open when the evening reminder falls due.
  useEffect(() => {
    void syncNotificationState()
    void refreshReminderRegistration()
    // Catches a device that was offline when its last practice finished.
    void backupIfStale()
    return startReminderTimer()
  }, [])

  function dismissSplash() {
    setSplash((s) => (s === 'showing' ? 'leaving' : s))
    setTimeout(() => setSplash('gone'), 400)
  }

  // Move on from the name step — into the reminder offer, if it's worth making.
  function afterName() {
    setSetup(shouldOfferReminders() ? 'notifications' : 'done')
  }

  function saveWelcomeName() {
    const n = nameDraft.trim()
    if (n) setName(n)
    markNameAsked()
    void syncNotificationState()
    afterName()
  }

  function skipName() {
    markNameAsked()
    afterName()
  }

  function acceptReminders() {
    markNotificationsAsked()
    setSetup('done')
    // Fired straight from the tap so the browser still shows its permission
    // prompt — but not awaited, so setup is never held up by it.
    void enableReminders()
  }

  function declineReminders() {
    markNotificationsAsked()
    setSetup('done')
  }

  // One roleplay at random from the chapters finished so far, in either role.
  async function startRandomRoleplay() {
    const rows = await db.lessonProgress.toArray()
    const done = new Set(rows.filter((r) => r.completed).map((r) => r.lessonId))
    const open = unlockedRoleplays(done)
    const pairs = open.flatMap((r) => [{ id: r.id, you: r.you }, { id: r.id, you: otherRole(r.you) }])
    const pick = pairs.length ? [pairs[Math.floor(Math.random() * pairs.length)]] : []
    setScreen({ name: 'roleplay-random', pick })
  }

  const home = (
    <Home
      onStart={(id, startStep) => setScreen({ name: 'lesson', id, startStep })}
      onReview={() => setScreen({ name: 'review' })}
      onQuiz={() => setScreen({ name: 'quiz' })}
      onRoleplay={(chapter) => setScreen({ name: 'roleplay', chapter, roles: chapterRoles(chapter) })}
      onRandomRoleplay={() => void startRandomRoleplay()}
      onProfile={() => setScreen({ name: 'profile' })}
      onDictionary={() => setScreen({ name: 'dictionary' })}
    />
  )

  let view
  if (screen.name === 'lesson') {
    const lesson = LESSON_BY_ID[screen.id]
    view = lesson ? (
      <LessonPlayer
        lesson={lesson}
        showScript={showScript}
        startStep={screen.startStep}
        onExit={() => setScreen({ name: 'home' })}
      />
    ) : (
      home
    )
  } else if (screen.name === 'review') {
    view = <ReviewSession onExit={() => setScreen({ name: 'home' })} />
  } else if (screen.name === 'quiz') {
    view = <PopQuiz onExit={() => setScreen({ name: 'home' })} />
  } else if (screen.name === 'roleplay') {
    const chapter = CHAPTERS.find((c) => c.key === screen.chapter)
    view = (
      <Roleplay
        key={screen.chapter}
        roleplays={(ROLEPLAYS_BY_CHAPTER[screen.chapter] ?? []).map((r, i) => withRole(r, screen.roles[i] ?? r.you))}
        heading={`${chapter?.title ?? 'Roleplay'} · Roleplay`}
        showScript={showScript}
        onExit={() => setScreen({ name: 'home' })}
      />
    )
  } else if (screen.name === 'roleplay-random') {
    const picked = screen.pick.filter((p) => !!ROLEPLAY_BY_ID[p.id]).map((p) => withRole(ROLEPLAY_BY_ID[p.id], p.you))
    view = (
      <Roleplay
        key={screen.pick.map((p) => `${p.id}:${p.you}`).join(',')}
        roleplays={picked}
        heading="Random roleplay"
        showScript={showScript}
        onExit={() => setScreen({ name: 'home' })}
        onAnother={() => void startRandomRoleplay()}
      />
    )
  } else if (screen.name === 'profile') {
    view = (
      <Profile
        onBack={() => setScreen({ name: 'home' })}
        onSettings={() => setScreen({ name: 'settings' })}
      />
    )
  } else if (screen.name === 'settings') {
    view = (
      <SettingsScreen
        showScript={showScript}
        onToggleScript={(v) => {
          setShowScript(v)
          setShowScriptState(v)
        }}
        onBack={() => setScreen({ name: 'profile' })}
      />
    )
  } else if (screen.name === 'dictionary') {
    view = <Dictionary onBack={() => setScreen({ name: 'home' })} />
  } else {
    view = home
  }

  const ready = splash === 'gone'
  const showWelcome = ready && setup === 'name' && !getName()
  const showNotifyOffer = ready && setup === 'notifications'
  const learner = getName()

  return (
    <>
      {view}
      {splash !== 'gone' && <Splash leaving={splash === 'leaving'} onDismiss={dismissSplash} />}
      {showWelcome && (
        <Modal
          title="Welcome! 🎉"
          message="What should we call you?"
          actions={[
            { label: 'Not now', variant: 'ghost', onClick: skipName },
            { label: 'Save', variant: 'primary', onClick: saveWelcomeName, disabled: !nameDraft.trim() },
          ]}
        >
          <input
            className="name-input"
            value={nameDraft}
            autoFocus
            maxLength={24}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nameDraft.trim()) saveWelcomeName()
            }}
            placeholder="Type your name"
          />
        </Modal>
      )}
      {showNotifyOffer && (
        <Modal
          title="A nudge each evening? 🔔"
          message={`${learner ? `${learner}, a` : 'A'} short daily reminder is the easiest way to keep a streak alive. We'll only nudge you in the evening, and only on days you haven't practised.`}
          actions={[
            { label: 'No thanks', variant: 'ghost', onClick: declineReminders },
            {
              label: 'Yes, remind me',
              variant: 'primary',
              onClick: acceptReminders,
            },
          ]}
        />
      )}
    </>
  )
}

// Only worth interrupting setup for if this device can actually do it and the
// learner hasn't already answered (here or in the phone's own settings).
function shouldOfferReminders(): boolean {
  return (
    !hasBeenAskedNotifications() &&
    notificationSupport() === 'ok' &&
    notificationPermission() === 'default'
  )
}
