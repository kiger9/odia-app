// Checks the roleplays (src/data/roleplays/) and exits 1 listing every problem:
//   - 4–6 lines, a parent and a child taking turns;
//   - every word has Odia script (a lesson word list, or the roleplay word
//     list words/roleplays/<chapter>.ts for words the lessons don't teach);
//   - punctuation: a question ends with "?" in Odia and English alike (the
//     English may carry a trailing "(informal)" hint); a line whose last word
//     is a "-ki" form is a question; no full stop at the end of a line; inside
//     a line, only "." between two sentences and "," for a pause; no "·", no
//     bare endings like "-ku", no "{name}"; at most 10 words;
//   - ids unique, lowercase, prefixed with their chapter key.
//
//   npm run check:roleplays              # report
//   npm run check:roleplays -- --stats   # also a per-chapter table
//   npm run check:roleplays -- --new     # also each roleplay's words not yet
//                                        # taught by the end of its chapter

import { CHAPTERS, LESSON_BY_ID, type Step } from '../src/data/lessons'
import { ROLEPLAYS, ROLEPLAYS_BY_CHAPTER } from '../src/data/roleplays'
import { WORDS, WORD_LISTS, toScript } from '../src/data/script'

const stats = process.argv.includes('--stats')
const showNew = process.argv.includes('--new')
const problems: string[] = []
const bad = (r: { id: string }, msg: string) => problems.push(`${r.id}: ${msg}`)

const order = CHAPTERS.map((c) => c.key)
const strip = (w: string) => w.toLowerCase().replace(/[?!.,;:“”"]/g, '')

// The Odia words a chapter's lessons show (teaching cards, phrases shown,
// answers, match tiles, cloze parts), as far as they are known words.
function lessonWords(key: string): Set<string> {
  const out = new Set<string>()
  const add = (text: unknown) => {
    if (typeof text !== 'string') return
    for (const w of text.split(/\s+/).map(strip)) if (w in WORDS) out.add(w)
  }
  const ch = CHAPTERS.find((c) => c.key === key)
  for (const id of ch?.lessons ?? [])
    for (const st of LESSON_BY_ID[id]?.items ?? ([] as Step[])) {
      if (st.rule) continue
      add(st.odia)
      add(st.show)
      add(st.pre)
      add(st.post)
      if (Array.isArray(st.ans)) st.ans.forEach(add)
      else add(st.ans)
      st.alts?.forEach(add)
      st.pairs?.forEach(([od]) => add(od))
      if (!st.show) st.opts?.forEach((o) => add(typeof o === 'string' ? o : o.a))
    }
  return out
}

// Words a learner has met by the end of each chapter: its lesson word list and
// lesson text, and those of every chapter before it.
const chapterWords = new Map(order.map((key) => [key, new Set([...Object.keys(WORD_LISTS[key] ?? {}), ...lessonWords(key)])]))
const taught = new Map<string, Set<string>>()
for (let i = 0; i < order.length; i++) {
  const set = new Set<string>()
  for (const key of order.slice(0, i + 1)) for (const w of chapterWords.get(key)!) set.add(w)
  taught.set(order[i], set)
}

const untaught = new Map<string, string[]>() // roleplay id → words beyond its chapter
const ids = new Set<string>()
for (const r of ROLEPLAYS) {
  if (ids.has(r.id)) bad(r, 'duplicate id')
  ids.add(r.id)
  if (!/^[a-z0-9-]+$/.test(r.id) || !r.id.startsWith(`${r.chapter}-`))
    bad(r, `id must be lowercase letters, digits and hyphens, starting "${r.chapter}-"`)
  if (!order.includes(r.chapter)) bad(r, `unknown chapter "${r.chapter}"`)
  if (!r.title.trim() || !r.scene.trim()) bad(r, 'needs a title and a scene')
  if (r.lines.length < 4 || r.lines.length > 6) bad(r, `${r.lines.length} lines (must be 4–6)`)
  if (!r.lines.some((l) => l.who === 'parent') || !r.lines.some((l) => l.who === 'child'))
    bad(r, 'needs both a parent and a child')
  const known = taught.get(r.chapter) ?? new Set<string>()
  const fresh = new Set<string>()
  r.lines.forEach((l, i) => {
    const at = `line ${i + 1} "${l.od}"`
    if (i > 0 && l.who === r.lines[i - 1].who) bad(r, `${at}: same speaker twice running`)
    if (!l.od.trim() || !l.en.trim()) bad(r, `${at}: needs od and en`)
    if (/\{name\}/.test(l.od + l.en)) bad(r, `${at}: no {name} placeholder in roleplays`)
    const raw = l.od.trim().split(/\s+/)
    const words = raw.map(strip).filter(Boolean)
    if (words.length > 10) bad(r, `${at}: ${words.length} words (keep a line to 10 or fewer)`)
    const last = words[words.length - 1] ?? ''
    const odQ = /\?\s*$/.test(l.od)
    if (/\.\s*$/.test(l.od)) bad(r, `${at}: no full stop at the end of a line`)
    if (raw.slice(0, -1).some((w) => /[!?]$/.test(w)))
      bad(r, `${at}: inside a line, end a sentence with "." (a "?" or "!" only at the very end)`)
    if (l.od.includes('·') || words.some((w) => w.startsWith('-'))) bad(r, `${at}: no "·" or bare endings`)
    if (last.endsWith('-ki') && !odQ) bad(r, `${at}: a "-ki" question must end with "?"`)
    const enBody = l.en.replace(/\s*\([^()]*\)\s*$/, '')
    if (/\?\s*$/.test(enBody) !== odQ) bad(r, `${at}: Odia and English must both end with "?" or neither`)
    if (/\bki\b/.test(l.od.toLowerCase().replace(/-ki\b/g, ''))) bad(r, `${at}: write the particle as "stem-ki" ("or" is kimba)`)
    for (const w of words) {
      if (!(w in WORDS)) bad(r, `${at}: "${w}" has no Odia script — add it to src/data/words/roleplays/${r.chapter}.ts`)
      else if (!known.has(w)) fresh.add(w)
    }
    if (words.every((w) => w in WORDS) && !toScript(l.od)) bad(r, `${at}: has no Odia script (toScript fails)`)
  })
  untaught.set(r.id, [...fresh])
}

if (stats) {
  console.log('chapter      n  lines  you-parent  you-first  untaught-words')
  for (const key of order) {
    const rs = ROLEPLAYS_BY_CHAPTER[key] ?? []
    const first = rs.filter((r) => r.lines[0]?.who === r.you).length
    const parent = rs.filter((r) => r.you === 'parent').length
    const lines = rs.reduce((s, r) => s + r.lines.length, 0)
    const fresh = new Set(rs.flatMap((r) => untaught.get(r.id) ?? [])).size
    console.log(`${key.padEnd(12)} ${String(rs.length).padStart(2)}  ${String(lines).padStart(5)}  ${String(parent).padStart(10)}  ${String(first).padStart(9)}  ${String(fresh).padStart(14)}`)
  }
}
if (showNew)
  for (const r of ROLEPLAYS) {
    const w = untaught.get(r.id) ?? []
    if (w.length) console.log(`${r.id}: ${w.join(', ')}`)
  }

if (problems.length) {
  console.error(`${problems.length} problem(s) in src/data/roleplays/:`)
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}
const lines = new Set(ROLEPLAYS.flatMap((r) => r.lines.map((l) => l.od)))
console.log(`check:roleplays ok — ${ROLEPLAYS.length} roleplays (each played in both roles), ${lines.size} distinct lines`)
