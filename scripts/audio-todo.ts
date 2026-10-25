// Lists every Odia phrase the given lessons can speak, with its Odia script
// (from data/script.ts) and recorded clip (from data/clips.ts), so it's clear
// what still needs transcribing or recording.
//
//   npm run audio:todo -- be howru have        # table
//   npm run audio:todo -- --json be howru      # machine-readable
//
// A phrase is "spoken" if it's a step's Odia question, its Odia answer, or an
// Odia tile in a match (see lib/spoken.ts).

import { CHAPTERS, LESSONS } from '../src/data/lessons'
import { bankSteps, freshSteps, type PStep } from '../src/gen/exercises'
import { makeRng } from '../src/gen/rng'
import { answerOdia, promptOdia } from '../src/lib/spoken'
import { toScript } from '../src/data/script'
import { CLIPS } from '../src/data/clips'

const args = process.argv.slice(2)
const json = args.includes('--json')
const ids = args.filter((a) => !a.startsWith('--'))
if (!ids.length) {
  console.error('usage: npm run audio:todo -- [--json] <lessonId> …')
  process.exit(1)
}

const COURSE = CHAPTERS.flatMap((c) => c.lessons)

function spokenIn(step: PStep): string[] {
  const out = [promptOdia(step), answerOdia(step)]
  if (step.t === 'match') out.push(...(step.pairs ?? []).map((p) => p[0]))
  return out.filter((p): p is string => !!p && !p.includes('{name}')).map((p) => p.trim())
}

// The practice a learner can meet in this lesson: its bank if it has one (that
// is everything it can say), else whatever the generator might produce.
function practiceSteps(id: string): PStep[] {
  const bank = bankSteps(id)
  if (bank) return bank
  const done = new Set(COURSE.slice(0, COURSE.indexOf(id)))
  const steps: PStep[] = []
  for (let seed = 1; seed <= 2000; seed++) steps.push(...freshSteps(id, done, 6, makeRng(seed)))
  return steps
}

interface Row {
  lesson: string
  source: 'lesson' | 'practice'
  phonetic: string
  script: string | null
  clip: string | null
}
const rows: Row[] = []
const seen = new Set<string>()
for (const id of ids) {
  const lesson = LESSONS.find((l) => l.id === id)
  if (!lesson) throw new Error(`no lesson "${id}"`)
  const add = (source: Row['source'], steps: PStep[]) => {
    for (const s of steps)
      for (const phonetic of spokenIn(s)) {
        if (seen.has(phonetic)) continue
        seen.add(phonetic)
        const script = toScript(phonetic) ?? null
        rows.push({ lesson: id, source, phonetic, script, clip: (script && CLIPS[script]) || null })
      }
  }
  add('lesson', lesson.items)
  add('practice', practiceSteps(id))
}

if (json) {
  console.log(JSON.stringify(rows, null, 1))
} else {
  for (const r of rows)
    console.log([r.lesson, r.source, r.phonetic, r.script ?? '— no script', r.clip ?? '— no clip'].join('\t'))
  const noScript = rows.filter((r) => !r.script).length
  const noClip = rows.filter((r) => r.script && !r.clip).length
  console.log(`\n${rows.length} phrases · ${noScript} need script · ${noClip} need recording`)
}
