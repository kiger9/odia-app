// Builds the fixed bank of practice steps a lesson's "fresh practice" (and the
// Pop Quiz) draws from, so only the bank's phrases ever need recording.
//
//   npm run practice:bank -- be howru have
//
// For each lesson: up to BANK_SIZE distinct steps (by sig) from the generator,
// as a learner who finished every earlier lesson would get them. Seeds are
// fixed, so re-running gives the same file. Lessons already in the file are
// kept; the ones named here are replaced.

import { readFileSync, writeFileSync } from 'node:fs'
import { CHAPTERS } from '../src/data/lessons'
import { generateSteps, type PStep } from '../src/gen/exercises'
import { makeRng } from '../src/gen/rng'

const BANK_SIZE = 60
const MAX_SEEDS = 2000
const FILE = 'src/data/practice-bank.json'

const ids = process.argv.slice(2)
if (!ids.length) {
  console.error('usage: npm run practice:bank -- <lessonId> …')
  process.exit(1)
}

const COURSE = CHAPTERS.flatMap((c) => c.lessons)

function buildBank(id: string): PStep[] {
  if (!COURSE.includes(id)) throw new Error(`no lesson "${id}"`)
  const done = new Set(COURSE.slice(0, COURSE.indexOf(id)))
  const bank = new Map<string, PStep>()
  for (let seed = 1; seed <= MAX_SEEDS && bank.size < BANK_SIZE; seed++)
    for (const { fresh: _, ...step } of generateSteps(id, done, 6, makeRng(seed)))
      if (bank.size < BANK_SIZE && !bank.has(step.sig!)) bank.set(step.sig!, step)
  return [...bank.values()]
}

const bank: Record<string, PStep[]> = JSON.parse(readFileSync(FILE, 'utf8'))
for (const id of ids) {
  bank[id] = buildBank(id)
  console.log(`${id}: ${bank[id].length} steps`)
}

// One step per line, lessons in course order, so a rebuild diffs cleanly.
const order = (id: string) => (COURSE.includes(id) ? COURSE.indexOf(id) : COURSE.length)
const lessons = Object.keys(bank).sort((a, b) => order(a) - order(b))
const body = lessons.map((id) => ` ${JSON.stringify(id)}: [\n${bank[id].map((s) => `  ${JSON.stringify(s)}`).join(',\n')}\n ]`)
writeFileSync(FILE, `{\n${body.join(',\n')}\n}\n`)
