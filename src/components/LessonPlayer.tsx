import { useMemo, useState } from 'react'
import type { Lesson, Step } from '../data/lessons'
import { saveLessonProgress } from '../db'
import { answerMatches } from '../lib/normalize'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const optText = (o: string | { a: string }) => (typeof o === 'string' ? o : o.a)

// The core teaching display: phonetic spelling large, Odia script small beneath.
function Phrase({
  phonetic,
  script,
  showScript,
  size = 'lg',
}: {
  phonetic: string
  script?: string
  showScript: boolean
  size?: 'lg' | 'md'
}) {
  return (
    <div className="phrase">
      <p className={size === 'lg' ? 'phonetic-lg' : 'phonetic-md'}>{phonetic}</p>
      {showScript && script && <p className="script-sub">{script}</p>}
    </div>
  )
}

function Feedback({
  correct,
  answer,
  why,
  onNext,
}: {
  correct: boolean
  answer?: string
  why?: string
  onNext: () => void
}) {
  return (
    <div className={`feedback ${correct ? 'ok' : 'no'}`}>
      <p className="fb-title">{correct ? 'Correct ✓' : 'Not quite'}</p>
      {!correct && answer && (
        <p className="fb-ans">
          Answer: <b>{answer}</b>
        </p>
      )}
      {why && <p className="fb-why" dangerouslySetInnerHTML={{ __html: why }} />}
      <button className="btn-primary" onClick={onNext}>
        Continue
      </button>
    </div>
  )
}

function IntroStep({ step, showScript, onNext }: StepProps) {
  return (
    <div className="step">
      <div className="teach">
        <Phrase phonetic={step.odia ?? ''} script={step.script} showScript={showScript} />
        {step.gloss && <p className="gloss">{step.gloss}</p>}
      </div>
      {step.note && <p className="note" dangerouslySetInnerHTML={{ __html: step.note }} />}
      <button className="btn-primary" onClick={onNext}>
        Continue
      </button>
    </div>
  )
}

function ChoiceStep({ step, showScript, onNext }: StepProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const opts = step.opts ?? []
  const ans = step.ans as number

  return (
    <div className="step">
      <p className="q">{step.q}</p>
      {step.show && <Phrase phonetic={step.show} script={step.script} showScript={showScript} />}
      <div className="opts">
        {opts.map((o, i) => {
          const state =
            picked === null ? '' : i === ans ? 'right' : i === picked ? 'wrong' : 'dim'
          return (
            <button
              key={i}
              className={`opt ${state}`}
              disabled={picked !== null}
              onClick={() => setPicked(i)}
            >
              {optText(o)}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <Feedback
          correct={picked === ans}
          answer={optText(opts[ans])}
          why={step.why}
          onNext={onNext}
        />
      )}
    </div>
  )
}

function ClozeStep({ step, onNext }: StepProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const opts = (step.opts ?? []) as string[]
  const ans = step.ans as number

  return (
    <div className="step">
      <p className="q">{step.q}</p>
      <p className="cloze-line">
        {step.pre} <span className="blank">{picked !== null ? opts[picked] : '____'}</span>{' '}
        {step.post}
      </p>
      <div className="opts">
        {opts.map((o, i) => {
          const state =
            picked === null ? '' : i === ans ? 'right' : i === picked ? 'wrong' : 'dim'
          return (
            <button
              key={i}
              className={`opt ${state}`}
              disabled={picked !== null}
              onClick={() => setPicked(i)}
            >
              {o}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <Feedback correct={picked === ans} answer={opts[ans]} why={step.why} onNext={onNext} />
      )}
    </div>
  )
}

function MatchStep({ step, onNext }: StepProps) {
  const pairs = step.pairs ?? []
  const left = useMemo(() => shuffle(pairs.map((p) => p[0])), [pairs])
  const right = useMemo(() => shuffle(pairs.map((p) => p[1])), [pairs])
  const answerFor = useMemo(() => new Map(pairs.map((p) => [p[0], p[1]])), [pairs])

  const [selLeft, setSelLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)

  const done = matched.size === pairs.length
  const matchedRights = new Set([...matched].map((l) => answerFor.get(l)))

  function pickRight(r: string) {
    if (selLeft && answerFor.get(selLeft) === r) {
      setMatched(new Set(matched).add(selLeft))
      setSelLeft(null)
    } else {
      setWrong(r)
      setTimeout(() => setWrong(null), 350)
      setSelLeft(null)
    }
  }

  return (
    <div className="step">
      <p className="q">Match the pairs</p>
      <div className="match">
        <div className="match-col">
          {left.map((l) => (
            <button
              key={l}
              className={`tile ${matched.has(l) ? 'locked' : selLeft === l ? 'sel' : ''}`}
              disabled={matched.has(l)}
              onClick={() => setSelLeft(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="match-col">
          {right.map((r) => (
            <button
              key={r}
              className={`tile ${matchedRights.has(r) ? 'locked' : wrong === r ? 'shake' : ''}`}
              disabled={matchedRights.has(r)}
              onClick={() => pickRight(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {done && (
        <button className="btn-primary" onClick={onNext}>
          Continue
        </button>
      )}
    </div>
  )
}

function AssembleStep({ step, showScript, onNext }: StepProps) {
  const ans = (step.ans as string[]) ?? []
  const tokens = useMemo(() => shuffle([...ans, ...(step.dist ?? [])]), [ans, step.dist])
  const [built, setBuilt] = useState<number[]>([])
  const [checked, setChecked] = useState(false)

  const inBuilt = new Set(built)
  const correct = built.map((i) => tokens[i]).join(' ') === ans.join(' ')

  return (
    <div className="step">
      <p className="q">{step.q}</p>
      {step.show && (
        <Phrase
          phonetic={step.show}
          script={step.script}
          showScript={showScript}
          size="md"
        />
      )}
      {step.gloss && <p className="hint">{step.gloss}</p>}

      <div className="build-row">
        {built.map((i, pos) => (
          <button
            key={pos}
            className="tile built"
            disabled={checked}
            onClick={() => setBuilt(built.filter((_, p) => p !== pos))}
          >
            {tokens[i]}
          </button>
        ))}
        {built.length === 0 && <span className="build-placeholder">Tap words below…</span>}
      </div>

      <div className="pool-row">
        {tokens.map((t, i) =>
          inBuilt.has(i) ? null : (
            <button
              key={i}
              className="tile"
              disabled={checked}
              onClick={() => setBuilt([...built, i])}
            >
              {t}
            </button>
          ),
        )}
      </div>

      {!checked ? (
        <button
          className="btn-primary"
          disabled={built.length === 0}
          onClick={() => setChecked(true)}
        >
          Check
        </button>
      ) : (
        <Feedback correct={correct} answer={ans.join(' ')} why={step.why} onNext={onNext} />
      )}
    </div>
  )
}

function TypeStep({ step, onNext }: StepProps) {
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false)
  const ans = step.ans as string
  const correct = checked && answerMatches(value, ans, step.alts)

  return (
    <div className="step">
      <p className="q">{step.q}</p>
      <input
        className="type-input"
        value={value}
        autoFocus
        disabled={checked}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim() && !checked) setChecked(true)
        }}
        placeholder="Type your answer…"
      />
      {!checked ? (
        <button
          className="btn-primary"
          disabled={!value.trim()}
          onClick={() => setChecked(true)}
        >
          Check
        </button>
      ) : (
        <Feedback correct={correct} answer={ans} why={step.why} onNext={onNext} />
      )}
    </div>
  )
}

interface StepProps {
  step: Step
  showScript: boolean
  onNext: () => void
}

function StepView(props: StepProps) {
  switch (props.step.t) {
    case 'intro':
      return <IntroStep {...props} />
    case 'choice':
      return <ChoiceStep {...props} />
    case 'cloze':
      return <ClozeStep {...props} />
    case 'match':
      return <MatchStep {...props} />
    case 'assemble':
      return <AssembleStep {...props} />
    case 'type':
      return <TypeStep {...props} />
    default:
      return null
  }
}

export default function LessonPlayer({
  lesson,
  showScript,
  onExit,
}: {
  lesson: Lesson
  showScript: boolean
  onExit: () => void
}) {
  const [index, setIndex] = useState(0)
  const total = lesson.items.length
  const finished = index >= total

  function next() {
    const nextIndex = index + 1
    const done = nextIndex >= total
    void saveLessonProgress(lesson.id, nextIndex, done)
    setIndex(nextIndex)
  }

  if (finished) {
    return (
      <main className="app">
        <section className="card done-card">
          <p className="done-mark">✓</p>
          <p className="due-count">Lesson complete</p>
          <p className="muted">{lesson.title}</p>
          <button className="btn-primary" onClick={onExit}>
            Back to lessons
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app player">
      <div className="player-top">
        <button className="x-btn" onClick={onExit} aria-label="Quit lesson">
          ✕
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(index / total) * 100}%` }} />
        </div>
      </div>
      <StepView key={index} step={lesson.items[index]} showScript={showScript} onNext={next} />
    </main>
  )
}
