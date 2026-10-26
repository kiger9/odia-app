// Roleplay: a scripted conversation, line by line. The app says the other
// role's lines aloud without their English (it fades in when the learner taps
// Continue, so they listen first); for the learner's lines it shows the English,
// the learner says the Odia out loud, then taps to hear the recording and marks
// whether they got it. A chapter's roleplays run back to back, like a final test; the
// random mode plays one from any finished chapter.

import { useEffect, useMemo, useState } from 'react'
import { ROLE_LABEL, otherRole, type Roleplay as RoleplayData } from '../data/roleplays'
import { toScript } from '../data/script'
import { speak, stopSpeaking } from '../audio'
import { markPracticedToday } from '../streak'
import { encouragement } from '../profile'
import { SHOW_SCRIPT_FEATURE } from '../settings'
import { SpeakButton } from './Steps'
import MuteButton from './MuteButton'
import Modal from './Modal'

export default function Roleplay({
  roleplays,
  heading,
  showScript,
  onExit,
  onAnother,
}: {
  roleplays: RoleplayData[]
  heading: string
  showScript: boolean
  onExit: () => void
  onAnother?: () => void // random mode: play another one
}) {
  const [rpIndex, setRpIndex] = useState(0)
  const [pos, setPos] = useState(0) // the line being said or asked for
  const [revealed, setRevealed] = useState(false) // the learner's line, after "Check"
  const [got, setGot] = useState(0) // learner lines marked right
  const [asked, setAsked] = useState(0) // learner lines marked either way
  const [confirmQuit, setConfirmQuit] = useState(false)
  const praise = useMemo(() => encouragement(), [])

  const rp = roleplays[rpIndex]
  const finished = rpIndex >= roleplays.length
  const sceneDone = !!rp && pos >= rp.lines.length
  const line = rp?.lines[pos]
  const mine = !!line && line.who === rp.you

  // Say each line as it comes up: the other role's at once, the learner's once
  // revealed. Cut off anything still playing when the learner moves on.
  useEffect(() => {
    if (!line) return
    if (!mine || revealed) speak(line.od)
    return stopSpeaking
  }, [line, mine, revealed])

  useEffect(() => {
    if (finished) void markPracticedToday()
  }, [finished])

  if (!rp && !finished) {
    return (
      <main className="app">
        <section className="card done-card">
          <p className="due-count">Nothing to play yet</p>
          <p className="muted">Finish every lesson in a chapter to unlock its roleplays.</p>
          <button className="btn-primary" onClick={onExit}>
            Back to home
          </button>
        </section>
      </main>
    )
  }

  if (finished) {
    const pct = asked ? Math.round((got / asked) * 100) : 100
    return (
      <main className="app">
        <section className="card quiz-result">
          <div className={`score-ring ${pct >= 80 ? 'great' : pct >= 50 ? 'ok' : 'low'}`}>
            <span className="score-pct">{pct}%</span>
          </div>
          <p className="due-count">{praise}</p>
          <p className="muted">
            You said {got} of {asked} lines right.
          </p>
          {onAnother && (
            <button className="btn-primary" onClick={onAnother}>
              Another roleplay
            </button>
          )}
          <button className={onAnother ? 'btn-ghost' : 'btn-primary'} onClick={onExit}>
            Back to home
          </button>
        </section>
      </main>
    )
  }

  function advance() {
    setRevealed(false)
    setPos((p) => p + 1)
  }

  function mark(right: boolean) {
    setAsked((n) => n + 1)
    if (right) setGot((n) => n + 1)
    advance()
  }

  function nextScene() {
    stopSpeaking()
    setPos(0)
    setRevealed(false)
    setRpIndex((i) => i + 1)
  }

  // Lines said so far (the current one included once it's been said or revealed).
  const shown = rp.lines.slice(0, sceneDone ? rp.lines.length : mine && !revealed ? pos : pos + 1)
  const progress = roleplays.reduce((sum, r, i) => sum + (i < rpIndex ? r.lines.length : i === rpIndex ? pos : 0), 0)
  const totalLines = roleplays.reduce((sum, r) => sum + r.lines.length, 0)

  return (
    <main className="app player">
      <div className="player-top">
        <button className="x-btn" onClick={() => setConfirmQuit(true)} aria-label="Quit roleplay">
          ✕
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(progress / totalLines) * 100}%` }} />
        </div>
        {roleplays.length > 1 && (
          <span className="q-count">
            {rpIndex + 1} / {roleplays.length}
          </span>
        )}
        <MuteButton />
      </div>

      <section className="rp-scene">
        <p className="prompt-label muted">{heading}</p>
        <h2 className="rp-title">{rp.title}</h2>
        <p className="rp-setting muted">{rp.scene}</p>
        <p className="rp-roles">
          You are the <b>{ROLE_LABEL[rp.you].toLowerCase()}</b>; the app is the{' '}
          {ROLE_LABEL[otherRole(rp.you)].toLowerCase()}.
        </p>
      </section>

      <div className="rp-chat">
        {shown.map((l, i) => (
          <div className={`rp-bubble ${l.who === rp.you ? 'me' : 'them'}`} key={i}>
            <span className="rp-who muted">{l.who === rp.you ? 'You' : ROLE_LABEL[l.who]}</span>
            <div className="rp-line">
              <p className="rp-od">{l.od}</p>
              <SpeakButton text={l.od} />
            </div>
            {SHOW_SCRIPT_FEATURE && showScript && toScript(l.od) && (
              <p className="rp-script muted">{toScript(l.od)}</p>
            )}
            {(l.who === rp.you || i < pos || sceneDone) && (
              <p className={`rp-en muted${l.who === rp.you ? '' : ' reveal'}`}>{l.en}</p>
            )}
          </div>
        ))}

        {!sceneDone && mine && !revealed && (
          <div className="rp-bubble me turn">
            <span className="rp-who muted">Your turn — say it out loud</span>
            <p className="rp-prompt">{line.en}</p>
          </div>
        )}
      </div>

      <div className="rp-actions">
        {sceneDone ? (
          <button className="btn-primary" onClick={nextScene}>
            {rpIndex + 1 < roleplays.length ? 'Next conversation' : 'Finish'}
          </button>
        ) : !mine ? (
          <button className="btn-primary" onClick={advance}>
            Continue
          </button>
        ) : !revealed ? (
          <button className="btn-primary" onClick={() => setRevealed(true)}>
            Check my line
          </button>
        ) : (
          <>
            <p className="rp-ask muted">Did you say it right?</p>
            <div className="rp-mark">
              <button className="btn-rate again" onClick={() => mark(false)}>
                Not quite
              </button>
              <button className="btn-rate good" onClick={() => mark(true)}>
                Got it
              </button>
            </div>
          </>
        )}
      </div>

      {confirmQuit && (
        <Modal
          title="Quit roleplay?"
          message="Return to the main menu? This conversation won't be saved."
          actions={[
            { label: 'Keep going', variant: 'ghost', onClick: () => setConfirmQuit(false) },
            { label: 'Quit', variant: 'danger', onClick: onExit },
          ]}
        />
      )}
    </main>
  )
}
