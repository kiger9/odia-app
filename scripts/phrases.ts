// Every Odia phrase a set of lessons can speak, with its Odia script (from
// data/script.ts) and recorded clip (from data/clips.ts). Shared by audio:todo
// (what's missing) and audio:record (records what's missing).
//
// "dictionary" is a pseudo lesson: every dictionary entry's phonetic (a verb's
// infinitive) plus each verb's present example. "all" means every lesson in
// course order plus the dictionary.
//
// A phrase is "spoken" if it's a step's Odia question, its Odia answer, or an
// Odia tile in a match (see lib/spoken.ts).

import { CHAPTERS, LESSONS } from '../src/data/lessons'
import { bankSteps, freshSteps, type PStep } from '../src/gen/exercises'
import { makeRng } from '../src/gen/rng'
import { answerOdia, promptOdia } from '../src/lib/spoken'
import { toScript } from '../src/data/script'
import { CLIPS } from '../src/data/clips'
import { DICTIONARY } from '../src/data/dictionary'

export const COURSE = CHAPTERS.flatMap((c) => c.lessons)

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

export interface Row {
  lesson: string
  source: 'lesson' | 'practice' | 'dictionary'
  phonetic: string
  script: string | null
  clip: string | null
}

export function spokenRows(ids: string[]): Row[] {
  if (ids.includes('all')) ids = [...COURSE, 'dictionary']
  const rows: Row[] = []
  const seen = new Set<string>()
  function addRow(id: string, source: Row['source'], phonetic: string) {
    if (seen.has(phonetic)) return
    seen.add(phonetic)
    const script = toScript(phonetic) ?? null
    rows.push({ lesson: id, source, phonetic, script, clip: (script && CLIPS[script]) || null })
  }
  for (const id of ids) {
    if (id === 'dictionary') {
      for (const e of DICTIONARY) {
        addRow(id, 'dictionary', e.phonetic)
        if (e.present) addRow(id, 'dictionary', e.present)
      }
      continue
    }
    const lesson = LESSONS.find((l) => l.id === id)
    if (!lesson) throw new Error(`no lesson "${id}"`)
    const add = (source: Row['source'], steps: PStep[]) => {
      for (const s of steps) for (const phonetic of spokenIn(s)) addRow(id, source, phonetic)
    }
    add('lesson', lesson.items)
    add('practice', practiceSteps(id))
  }
  return rows
}
