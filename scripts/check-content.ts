// Content convention check: the yes/no question particle is always hyphenated
// ("åchi-ki", never "åchiki" or "åchi ki"). Scans every string a learner can see — all
// lesson steps, what the practice generator produces, and the practice bank —
// and exits 1, listing offenders, if a word is a known word glued to "ki" or
// "ki" stands on its own as a separate word.
//
//   npm run check:content
//
// A token is an offender when it ends in "ki" (but not "-ki") and what remains
// is a key of script.ts WORDS or a word used elsewhere in the lessons — so
// "åchiki" (åchi is known) is flagged; the motion words kouthiki, eithiki and
// seithiki ("to where / here / there") are listed below as not the particle.

import { CHAPTERS, LESSONS } from '../src/data/lessons'
import bankJson from '../src/data/practice-bank.json'
import { buildQuiz, generateSteps, lessonRun } from '../src/gen/exercises'
import { makeRng } from '../src/gen/rng'
import { WORDS } from '../src/data/script'

const SEEDS = 300
const COURSE = CHAPTERS.flatMap((c) => c.lessons)

// Every token (lowercased, tags and punctuation stripped, hyphens kept) in a
// value, by walking all its strings.
function tokensIn(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    const text = value.replace(/<[^>]*>/g, ' ')
    for (const t of text.toLowerCase().split(/[\s·/,.;:!?“”"‘’()—–]+/)) {
      if (t === 'ki') out.push(' ki') // the particle written apart: "åchå ki?"
      const tok = t.replace(/^[-']+|[-']+$/g, '')
      if (tok) out.push(tok)
    }
  } else if (Array.isArray(value)) {
    for (const v of value) tokensIn(v, out)
  } else if (value && typeof value === 'object') {
    // `sig` is the internal identity of a generated step (letters only), never shown.
    for (const [k, v] of Object.entries(value)) if (k !== 'sig') tokensIn(v, out)
  }
  return out
}

// Where each token came from, for the report.
const found = new Map<string, Set<string>>()
function scan(source: string, value: unknown) {
  for (const t of tokensIn(value)) {
    if (!found.has(t)) found.set(t, new Set())
    found.get(t)!.add(source)
  }
}

for (const lesson of LESSONS) scan(`lesson ${lesson.id}`, lesson.items)
scan('practice bank', bankJson)
for (const id of COURSE) {
  const done = new Set(COURSE.slice(0, COURSE.indexOf(id)))
  for (let seed = 1; seed <= SEEDS; seed++) {
    scan(`generator ${id}`, generateSteps(id, done, 6, makeRng(seed)))
    scan(`lessonRun ${id}`, lessonRun(id, done, seed % 2 === 0, makeRng(seed)))
  }
}
for (let seed = 1; seed <= SEEDS; seed++) scan('buildQuiz', buildQuiz(new Set(COURSE), 10, makeRng(seed)))

// Words that genuinely end in "ki" (the "-ki" of motion: "to here/there/where"),
// not the question particle — "kouthi" (where) is a known word, so name them.
const NOT_THE_PARTICLE = new Set(['kouthiki', 'eithiki', 'seithiki', 'setiki', 'kahiki', 'chaliki'])

const known = (stem: string) => stem in WORDS || found.has(stem)
const offenders = [...found.keys()]
  .filter((t) => t.endsWith('ki') && !t.endsWith('-ki') && !NOT_THE_PARTICLE.has(t) && t.length > 4 && known(t.slice(0, -2)))
  .sort()
const apart = found.get(' ki')

if (offenders.length || apart) {
  console.error('Question particle written without its hyphen (write "stem-ki"):')
  for (const t of offenders)
    console.error(`  ${t}  →  ${t.slice(0, -2)}-ki   (${[...found.get(t)!].sort().join(', ')})`)
  if (apart) console.error(`  "ki" as a separate word  →  attach it: "åchå-ki"   (${[...apart].sort().join(', ')})`)
  process.exit(1)
}
console.log(`check:content ok — ${found.size} distinct words scanned, no unhyphenated "-ki"`)
