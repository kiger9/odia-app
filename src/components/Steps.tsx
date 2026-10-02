// The exercise screens (teach card, multiple choice, fill-the-blank, match,
// build-a-sentence, type-it), shared by lessons and the Pop Quiz.

import { useRef, useState } from 'react'
import type { PStep } from '../gen/exercises'
import { answerMatches } from '../lib/normalize'
import { SHOW_SCRIPT_FEATURE } from '../settings'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const optText = (o: string | { a: string }) => (typeof o === 'string' ? o : o.a)
const sameTokens = (a: string[], b: string[]) =>
  a.length === b.length && a.every((t, i) => t.toLowerCase() === b[i].toLowerCase())

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
      {/* Odia-script subtext — hidden until the script content layer is ready. */}
      {SHOW_SCRIPT_FEATURE && showScript && script && <p className="script-sub">{script}</p>}
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

interface StepProps {
  step: PStep
  showScript: boolean
  onNext: () => void
  onResult?: (correct: boolean) => void // reported once, when answered
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

// Multiple choice and fill-the-blank share this: the options are shuffled on
// every showing, so the right answer is never "always the top one". (Each
// step is its own mount, so useState's initializer shuffles once per step.)
function useShuffledOrder(n: number) {
  return useState(() => shuffle(Array.from({ length: n }, (_, i) => i)))[0]
}

function ChoiceStep({ step, showScript, onNext, onResult }: StepProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const opts = step.opts ?? []
  const ans = step.ans as number
  const order = useShuffledOrder(opts.length)

  function choose(i: number) {
    setPicked(i)
    onResult?.(i === ans)
  }

  return (
    <div className="step">
      <p className="q">{step.q}</p>
      {step.show && <Phrase phonetic={step.show} script={step.script} showScript={showScript} />}
      <div className="opts">
        {order.map((i) => {
          const state =
            picked === null ? '' : i === ans ? 'right' : i === picked ? 'wrong' : 'dim'
          return (
            <button
              key={i}
              className={`opt ${state}`}
              disabled={picked !== null}
              onClick={() => choose(i)}
            >
              {optText(opts[i])}
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

function ClozeStep({ step, onNext, onResult }: StepProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const opts = (step.opts ?? []) as string[]
  const ans = step.ans as number
  const order = useShuffledOrder(opts.length)

  function choose(i: number) {
    setPicked(i)
    onResult?.(i === ans)
  }

  return (
    <div className="step">
      <p className="q">{step.q}</p>
      {step.gloss && <p className="hint">{step.gloss}</p>}
      <p className="cloze-line">
        {step.pre} <span className="blank">{picked !== null ? opts[picked] : ' '}</span>{' '}
        {step.post}
      </p>
      <div className="opts">
        {order.map((i) => {
          const state =
            picked === null ? '' : i === ans ? 'right' : i === picked ? 'wrong' : 'dim'
          return (
            <button
              key={i}
              className={`opt ${state}`}
              disabled={picked !== null}
              onClick={() => choose(i)}
            >
              {opts[i]}
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

function MatchStep({ step, onNext, onResult }: StepProps) {
  const pairs = step.pairs ?? []
  const [left] = useState(() => shuffle(pairs.map((p) => p[0])))
  const [right] = useState(() => shuffle(pairs.map((p) => p[1])))
  const answerFor = new Map(pairs.map((p) => [p[0], p[1]]))

  const [selLeft, setSelLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)
  const mistakes = useRef(0)

  const done = matched.size === pairs.length
  const matchedRights = new Set([...matched].map((l) => answerFor.get(l)))

  function pickRight(r: string) {
    if (selLeft && answerFor.get(selLeft) === r) {
      const next = new Set(matched).add(selLeft)
      setMatched(next)
      setSelLeft(null)
      if (next.size === pairs.length) onResult?.(mistakes.current === 0)
    } else {
      if (selLeft) mistakes.current++
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

function AssembleStep({ step, showScript, onNext, onResult }: StepProps) {
  const ans = (step.ans as string[]) ?? []
  const [tokens] = useState(() => shuffle([...ans, ...(step.dist ?? [])]))
  const [built, setBuilt] = useState<number[]>([])
  const [checked, setChecked] = useState(false)

  const inBuilt = new Set(built)
  const words = built.map((i) => tokens[i])
  // Any accepted word order counts ("Aji Rahul …" = "Rahul aji …").
  const correct = [ans, ...(step.orders ?? [])].some((o) => sameTokens(words, o))

  function check() {
    setChecked(true)
    onResult?.(correct)
  }

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
            onClick={() => setBuilt((cur) => cur.filter((_, p) => p !== pos))}
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
              onClick={() => setBuilt((cur) => (cur.includes(i) ? cur : [...cur, i]))}
            >
              {t}
            </button>
          ),
        )}
      </div>

      {!checked ? (
        <button className="btn-primary" disabled={built.length === 0} onClick={check}>
          Check
        </button>
      ) : (
        <Feedback correct={correct} answer={ans.join(' ')} why={step.why} onNext={onNext} />
      )}
    </div>
  )
}

function TypeStep({ step, onNext, onResult }: StepProps) {
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const ans = step.ans as string
  const correct = checked && answerMatches(value, ans, step.alts)

  function check() {
    setChecked(true)
    onResult?.(answerMatches(value, ans, step.alts))
  }

  // Insert a special character (e.g. å) at the cursor, so learners don't need to
  // switch their phone keyboard.
  function insertChar(ch: string) {
    const el = inputRef.current
    if (!el) {
      setValue((v) => v + ch)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    setValue(value.slice(0, start) + ch + value.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + ch.length
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className="step">
      <p className="q">{step.q}</p>
      <input
        ref={inputRef}
        className="type-input"
        value={value}
        autoFocus
        disabled={checked}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim() && !checked) check()
        }}
        placeholder="Type your answer…"
      />
      {!checked && (
        <div className="char-row">
          <button type="button" className="char-btn" onClick={() => insertChar('å')}>
            å
          </button>
        </div>
      )}
      {!checked ? (
        <button className="btn-primary" disabled={!value.trim()} onClick={check}>
          Check
        </button>
      ) : (
        <Feedback correct={correct} answer={ans} why={step.why} onNext={onNext} />
      )}
    </div>
  )
}

export function StepView(props: StepProps) {
  const view = (() => {
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
  })()
  return (
    <>
      {props.step.fresh && <p className="fresh-chip">✨ Fresh practice</p>}
      {view}
    </>
  )
}
