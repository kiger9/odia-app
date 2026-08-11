import { useEffect, useState } from 'react'
import Splash from './components/Splash'
import Home from './components/Home'
import Settings from './components/Settings'
import LessonPlayer from './components/LessonPlayer'
import { LESSON_BY_ID } from './data/lessons'
import { getShowScript, setShowScript as persistShowScript } from './settings'

type Screen = { name: 'home' } | { name: 'lesson'; id: string } | { name: 'settings' }

export default function App() {
  const [splash, setSplash] = useState<'showing' | 'leaving' | 'gone'>('showing')
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [showScript, setShowScript] = useState(getShowScript())

  useEffect(() => {
    const t1 = setTimeout(() => setSplash('leaving'), 1100)
    const t2 = setTimeout(() => setSplash('gone'), 1500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  function toggleScript(v: boolean) {
    setShowScript(v)
    persistShowScript(v)
  }

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
      <Home onStart={(id) => setScreen({ name: 'lesson', id })} onSettings={() => setScreen({ name: 'settings' })} />
    )
  } else if (screen.name === 'settings') {
    view = (
      <Settings
        showScript={showScript}
        onToggleScript={toggleScript}
        onBack={() => setScreen({ name: 'home' })}
      />
    )
  } else {
    view = (
      <Home
        onStart={(id) => setScreen({ name: 'lesson', id })}
        onSettings={() => setScreen({ name: 'settings' })}
      />
    )
  }

  return (
    <>
      {view}
      {splash !== 'gone' && <Splash leaving={splash === 'leaving'} />}
    </>
  )
}
