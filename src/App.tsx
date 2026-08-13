import { useEffect, useState } from 'react'
import Splash from './components/Splash'
import Home from './components/Home'
import Profile from './components/Profile'
import LessonPlayer from './components/LessonPlayer'
import ReviewSession from './components/ReviewSession'
import PopQuiz from './components/PopQuiz'
import Dictionary from './components/Dictionary'
import Modal from './components/Modal'
import { LESSON_BY_ID } from './data/lessons'
import { getShowScript } from './settings'
import { getName, setName, hasBeenAskedName, markNameAsked } from './profile'

type Screen =
  | { name: 'home' }
  | { name: 'lesson'; id: string; startStep: number }
  | { name: 'review' }
  | { name: 'quiz' }
  | { name: 'profile' }
  | { name: 'dictionary' }

export default function App() {
  const [splash, setSplash] = useState<'showing' | 'leaving' | 'gone'>('showing')
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [showScript] = useState(getShowScript())

  // First-run (or first time since this feature shipped): ask for the learner's name.
  const [askName, setAskName] = useState(() => !hasBeenAskedName())
  const [nameDraft, setNameDraft] = useState('')

  useEffect(() => {
    const t1 = setTimeout(() => setSplash('leaving'), 2600)
    const t2 = setTimeout(() => setSplash('gone'), 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  function dismissSplash() {
    setSplash((s) => (s === 'showing' ? 'leaving' : s))
    setTimeout(() => setSplash('gone'), 400)
  }

  function saveWelcomeName() {
    const n = nameDraft.trim()
    if (n) setName(n)
    markNameAsked()
    setAskName(false)
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
    view = <Profile onBack={() => setScreen({ name: 'home' })} />
  } else if (screen.name === 'dictionary') {
    view = <Dictionary onBack={() => setScreen({ name: 'home' })} />
  } else {
    view = home
  }

  const showWelcome = splash === 'gone' && askName && !getName()

  return (
    <>
      {view}
      {splash !== 'gone' && <Splash leaving={splash === 'leaving'} onDismiss={dismissSplash} />}
      {showWelcome && (
        <Modal
          title="Welcome! 🎉"
          message="What should we call you?"
          actions={[
            { label: 'Not now', variant: 'ghost', onClick: () => { markNameAsked(); setAskName(false) } },
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
    </>
  )
}
