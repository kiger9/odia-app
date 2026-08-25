import { useEffect, useState } from 'react'
import Splash from './components/Splash'
import Home from './components/Home'
import Profile from './components/Profile'
import SettingsScreen from './components/Settings'
import LessonPlayer from './components/LessonPlayer'
import ReviewSession from './components/ReviewSession'
import PopQuiz from './components/PopQuiz'
import Dictionary from './components/Dictionary'
import Modal from './components/Modal'
import { LESSON_BY_ID } from './data/lessons'
import { getShowScript, setShowScript } from './settings'
import { getName, setName, hasBeenAskedName, markNameAsked } from './profile'
import {
  enableReminders,
  hasBeenAskedNotifications,
  markNotificationsAsked,
  notificationPermission,
  notificationSupport,
  startReminderTimer,
  syncNotificationState,
} from './notifications'

type Screen =
  | { name: 'home' }
  | { name: 'lesson'; id: string; startStep: number }
  | { name: 'review' }
  | { name: 'quiz' }
  | { name: 'profile' }
  | { name: 'settings' }
  | { name: 'dictionary' }

// First-run setup runs in order: name, then the offer of a daily reminder.
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

  const home = (
    <Home
      onStart={(id, startStep) => setScreen({ name: 'lesson', id, startStep })}
      onReview={() => setScreen({ name: 'review' })}
      onQuiz={() => setScreen({ name: 'quiz' })}
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
