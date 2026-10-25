// Sound on/off for the spoken Odia, in the top bar of lessons, quizzes and
// reviews. The choice is remembered on this phone.

import { useState } from 'react'
import { getMuted, setMuted } from '../audio'

export default function MuteButton() {
  const [muted, setMutedState] = useState(getMuted)

  function toggle() {
    setMuted(!muted)
    setMutedState(!muted)
  }

  return (
    <button
      className="x-btn mute-btn"
      onClick={toggle}
      aria-label={muted ? 'Turn sound on' : 'Mute sound'}
      aria-pressed={muted}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
