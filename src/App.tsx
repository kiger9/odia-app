import { useEffect, useState } from 'react'
import Splash from './components/Splash'
import Home from './components/Home'
import Settings from './components/Settings'
import LessonPlayer from './components/LessonPlayer'
import ReviewSession from './components/ReviewSession'
import { LESSON_BY_ID } from './data/lessons'
import { getShowScript, setShowScript as persistShowScript } from './settings'

type Screen =
  | { name: 'home' }
  | { name: 'lesson'; id: string }
  | { name: 'review' }
  | { name: 'settings' }

export default function App() {
  const [splash, setSplash] = useState<'showing' | 'leaving' | 'gone'>('showing')
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [showScript, setShowScript] = useState(getShowScript())

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

  function toggleScript(v: boolean) {
    setShowScript(v)
    persistShowScript(v)
  }

  const home = (
    <Home
      onStart={(id) => setScreen({ name: 'lesson', id })}
      onReview={() => setScreen({ name: 'review' })}
      onSettings={() => setScreen({ name: 'settings' })}
    />
  )

  let view
  if (screen.name === 'lesson') {
    const lesson = LESSON_BY_ID[screen.id]
    view = lesson ? (
      <LessonPlayer
        lesson={lesson}
        showScript={showScript}
        onExit={() => setScreen({ name: 'home' })}
      />
    ) : (
      home
    )
  } else if (screen.name === 'review') {
    view = <ReviewSession onExit={() => setScreen({ name: 'home' })} />
  } else if (screen.name === 'settings') {
    view = (
      <Settings
        showScript={showScript}
        onToggleScript={toggleScript}
        onBack={() => setScreen({ name: 'home' })}
      />
    )
  } else {
    view = home
  }

  return (
    <>
      {view}
      {splash !== 'gone' && <Splash leaving={splash === 'leaving'} onDismiss={dismissSplash} />}
    </>
  )
}
