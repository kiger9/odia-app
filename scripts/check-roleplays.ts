// Checks the roleplays (src/data/roleplays/) against their rules, and exits 1
// listing every problem:
//   - 4–6 lines, speakers alternating, the learner's role among them;
//   - every word in a line is in the word list of the roleplay's chapter or an
//     earlier one (src/data/words/), so the learner has met it and it can be
//     spoken — names and all; no {name} placeholder;
//   - a question ends with "?" (in Odia and English alike — the English may
//     carry a trailing "(informal)" hint); a line whose last word is a "-ki"
//     form is a question; no full stops, no "·", no bare endings like "-ku";
//   - ids unique; each chapter with 4+ roleplays has the learner speaking
//     first in at least two and second in at least two, as parent in at least
//     two and as child in at least two.
//
//   npm run check:roleplays           # report
//   npm run check:roleplays -- --stats  # also a per-chapter table

import { CHAPTERS } from '../src/data/lessons'
import { ROLEPLAYS, ROLEPLAYS_BY_CHAPTER } from '../src/data/roleplays'
import { WORD_LISTS, toScript } from '../src/data/script'

const stats = process.argv.includes('--stats')
const problems: string[] = []
const bad = (r: { id: string }, msg: string) => problems.push(`${r.id}: ${msg}`)

const order = CHAPTERS.map((c) => c.key)
const strip = (w: string) => w.toLowerCase().replace(/[?!.,;:“”"]/g, '')

// Words a learner has met by the end of each chapter.
const allowed = new Map<string, Set<string>>()
for (let i = 0; i < order.length; i++) {
  const set = new Set<string>()
  for (const key of order.slice(0, i + 1)) for (const w of Object.keys(WORD_LISTS[key] ?? {})) set.add(w)
  allowed.set(order[i], set)
}
const firstChapterWith = (w: string) => order.find((k) => w in (WORD_LISTS[k] ?? {}))

const ids = new Set<string>()
for (const r of ROLEPLAYS) {
  if (ids.has(r.id)) bad(r, 'duplicate id')
  ids.add(r.id)
  if (!/^[a-z0-9-]+$/.test(r.id)) bad(r, 'id must be lowercase letters, digits and hyphens')
  if (!order.includes(r.chapter)) bad(r, `unknown chapter "${r.chapter}"`)
  if (!r.title.trim() || !r.scene.trim()) bad(r, 'needs a title and a scene')
  if (r.lines.length < 4 || r.lines.length > 6) bad(r, `${r.lines.length} lines (must be 4–6)`)
  if (!r.lines.some((l) => l.who === r.you)) bad(r, `the learner (${r.you}) has no lines`)
  const known = allowed.get(r.chapter) ?? new Set<string>()
  r.lines.forEach((l, i) => {
    const at = `line ${i + 1} "${l.od}"`
    if (i > 0 && l.who === r.lines[i - 1].who) bad(r, `${at}: same speaker twice running`)
    if (!l.od.trim() || !l.en.trim()) bad(r, `${at}: needs od and en`)
    if (/\{name\}/.test(l.od + l.en)) bad(r, `${at}: no {name} placeholder in roleplays`)
    const words = l.od.trim().split(/\s+/).map(strip).filter(Boolean)
    const last = words[words.length - 1] ?? ''
    const odQ = /\?\s*$/.test(l.od)
    if (/\.\s*$/.test(l.od)) bad(r, `${at}: no full stop at the end (the lessons don't use them)`)
    if (l.od.includes('·') || words.some((w) => w.startsWith('-'))) bad(r, `${at}: a line is one sentence, no "·" or bare endings`)
    if (last.endsWith('-ki') && !odQ) bad(r, `${at}: a "-ki" question must end with "?"`)
    const enBody = l.en.replace(/\s*\([^()]*\)\s*$/, '')
    if (/\?\s*$/.test(enBody) !== odQ) bad(r, `${at}: Odia and English must both end with "?" or neither`)
    if (/\bki\b/.test(l.od.toLowerCase().replace(/-ki\b/g, ''))) bad(r, `${at}: write the particle as "stem-ki"`)
    for (const w of words) {
      if (known.has(w)) continue
      const where = firstChapterWith(w)
      bad(r, `${at}: "${w}" ${where ? `is first taught in chapter "${where}"` : 'is in no word list (src/data/words/)'}`)
    }
    if (!toScript(l.od)) bad(r, `${at}: has no Odia script (toScript fails)`)
  })
}

for (const key of order) {
  const rs = ROLEPLAYS_BY_CHAPTER[key] ?? []
  if (rs.length < 4) continue
  const n = (f: (r: (typeof rs)[number]) => boolean) => rs.filter(f).length
  const first = n((r) => r.lines[0]?.who === r.you)
  const parent = n((r) => r.you === 'parent')
  if (first < 2 || rs.length - first < 2)
    problems.push(`chapter ${key}: learner speaks first in ${first} of ${rs.length} (need 2+ each way)`)
  if (parent < 2 || rs.length - parent < 2)
    problems.push(`chapter ${key}: learner is the parent in ${parent} of ${rs.length} (need 2+ each role)`)
}

if (stats) {
  console.log('chapter      n  you-first  as-parent  lines')
  for (const key of order) {
    const rs = ROLEPLAYS_BY_CHAPTER[key] ?? []
    const first = rs.filter((r) => r.lines[0]?.who === r.you).length
    const parent = rs.filter((r) => r.you === 'parent').length
    const lines = rs.reduce((s, r) => s + r.lines.length, 0)
    console.log(`${key.padEnd(12)} ${String(rs.length).padStart(2)}  ${String(first).padStart(9)}  ${String(parent).padStart(9)}  ${String(lines).padStart(5)}`)
  }
}

if (problems.length) {
  console.error(`${problems.length} problem(s) in src/data/roleplays/:`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}
const lines = new Set(ROLEPLAYS.flatMap((r) => r.lines.map((l) => l.od)))
console.log(`check:roleplays ok — ${ROLEPLAYS.length} roleplays, ${lines.size} distinct lines`)
