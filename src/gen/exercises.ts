// Turns generated sentences (grammar.ts) and taught vocabulary into exercise
// steps, for two places:
//  - the "fresh practice" that ends every lesson (and the remix when a finished
//    lesson is replayed) — strictly that lesson's own topic, never other lessons;
//  - the Pop Quiz, which is where everything the learner has finished gets mixed.

import { CHAPTERS, LESSONS, chapterOf, type Step } from '../data/lessons'
import bankJson from '../data/practice-bank.json'
import { ROLEPLAYS_BY_CHAPTER, ROLE_LABEL, unlockedChapters, type Roleplay } from '../data/roleplays'
import { enText, generate, odText, type Ctx, type Focus, type Gen, type Sentence } from './grammar'
import { chance, makeRng, pick, shuffle, type Rng } from './rng'

// A lesson step, plus two things only generated steps use.
export type PStep = Step & {
  orders?: string[][] // other accepted word orders (assemble)
  fresh?: boolean // generated, not from the curated lesson
  sig?: string // identity, to avoid repeating recent questions
  odOpts?: boolean // choice: the options are Odia even though a phrase is shown (a roleplay reply)
}

type Format = 'choiceEn' | 'choiceOd' | 'cloze' | 'ending' | 'buildOd' | 'buildEn' | 'type' | 'match'
const FORMATS: Format[] = ['choiceEn', 'cloze', 'ending', 'buildOd', 'choiceOd', 'buildEn', 'type', 'match']

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)
const SHORT_HINT: Record<string, string> = { '(informal)': '(inf.)', '(respectful)': '(resp.)' }

// “The English”, plus its (informal)/(respectful) hint after any question mark.
const quoted = (s: Sentence) => `“${enText(s)}”`
const hintOf = (s: Sentence) => (s.hint ? `  ${s.hint}` : '')
const enKey = (s: Sentence) => norm(enText(s)) + (s.hint ?? '')

// Near-miss siblings that differ visibly from the target (and each other).
function distinctSiblings(g: Gen, rng: Rng, by: 'en' | 'od' | 'both'): Sentence[] {
  const seenOd = new Set([norm(odText(g.s))])
  const seenEn = new Set([by === 'od' ? enKey(g.s) : norm(enText(g.s))])
  const out: Sentence[] = []
  for (const s of shuffle(rng, g.siblings())) {
    const o = norm(odText(s))
    const e = by === 'od' ? enKey(s) : norm(enText(s))
    if (seenOd.has(o) || seenEn.has(e)) continue
    seenOd.add(o)
    seenEn.add(e)
    out.push(s)
  }
  return out
}

function sentenceStep(g: Gen, format: Format, rng: Rng): PStep | null {
  const s = g.s
  const sig = norm(odText(s))
  const base = { why: s.why, sig, fresh: true }
  switch (format) {
    case 'choiceEn': {
      const sibs = distinctSiblings(g, rng, 'en').slice(0, 2)
      if (sibs.length < 2) return null
      return { ...base, t: 'choice', q: 'What does this mean?', show: odText(s), opts: [s, ...sibs].map((x) => ({ a: enText(x) })), ans: 0 }
    }
    case 'choiceOd': {
      const sibs = distinctSiblings(g, rng, 'od').slice(0, 2)
      if (sibs.length < 2) return null
      const q = s.question ? `How do you ask ${quoted(s)}${hintOf(s)}` : `How do you say ${quoted(s)}?${hintOf(s)}`
      return { ...base, t: 'choice', q, opts: [s, ...sibs].map((x) => ({ a: odText(x) })), ans: 0 }
    }
    case 'cloze': {
      const wrong = shuffle(rng, s.wrong).slice(0, 3)
      if (wrong.length < 2) return null
      const pre = s.od.slice(0, s.key).join(' ')
      return {
        ...base, t: 'cloze', q: `Complete: ${quoted(s)}${hintOf(s)}`,
        pre: cap(pre), post: s.od.slice(s.key + 1).join(' ') + (s.question ? '?' : ''),
        opts: [s.od[s.key], ...wrong].map((o) => (s.key === 0 ? cap(o) : o)), ans: 0,
      }
    }
    case 'ending': {
      // "Which ending?" — the stem is given, pick the person ending: Ame jau [-chu].
      // Only endings the learner has been taught are offered.
      const e = s.ending
      if (!e || e.wrong.length < 2) return null
      const wrong = shuffle(rng, e.wrong).slice(0, 3)
      return {
        ...base, sig: sig + ':end', t: 'cloze', q: `Which ending? ${quoted(s)}${hintOf(s)}`,
        pre: cap([...s.od.slice(0, s.key), e.stem].join(' ')),
        post: s.od.slice(s.key + 1).join(' ') + (s.question ? '?' : ''),
        opts: [e.end, ...wrong].map((x) => '-' + x), ans: 0,
      }
    }
    case 'buildOd': {
      const have = new Set(s.od.map(norm))
      const dist = shuffle(rng, s.wrong).filter((w) => !have.has(norm(w))).slice(0, 2)
      if (!dist.length) return null
      const ans = [cap(s.od[0]), ...s.od.slice(1)]
      return { ...base, t: 'assemble', q: `Build in Odia: ${quoted(s)}${hintOf(s)}`, ans, dist, orders: s.odOrders }
    }
    case 'buildEn': {
      const have = new Set(s.en.map(norm))
      const pool = new Set<string>()
      for (const x of distinctSiblings(g, rng, 'en')) for (const w of x.en) if (!have.has(norm(w))) pool.add(w)
      const dist = shuffle(rng, [...pool]).slice(0, 3)
      if (dist.length < 2) return null
      const ans = [cap(s.en[0]), ...s.en.slice(1)]
      return { ...base, t: 'assemble', dir: 'en', q: 'Translate into English', show: odText(s), ans, dist, orders: s.enOrders }
    }
    case 'type': {
      if (s.od.length > 4) return null
      return {
        ...base, t: 'type', q: `Type in Odia: ${quoted(s)}${hintOf(s)}`, ans: odText(s),
        alts: s.odOrders.map((o) => odText(s, o)),
      }
    }
    case 'match': {
      const sibs = distinctSiblings(g, rng, 'both').slice(0, 3)
      if (sibs.length < 3) return null
      const label = (x: Sentence) => enText(x) + (x.hint ? ` ${SHORT_HINT[x.hint] ?? x.hint}` : '')
      const pairs = [s, ...sibs].map((x) => [odText(x), label(x)] as [string, string])
      return { ...base, why: undefined, t: 'match', q: 'Match the pairs', pairs }
    }
  }
}

// ---------- vocabulary (from what the lessons teach) ----------

interface Vocab {
  od: string
  en: string
  lesson: string
}

function buildVocab(): Vocab[] {
  const out: Vocab[] = []
  const seen = new Set<string>()
  const add = (od: string, en: string, lesson: string) => {
    od = od.trim()
    en = en.replace(/\s+/g, ' ').trim()
    const k = norm(od)
    if (!od || !en || od.startsWith('-') || seen.has(k)) return
    // "You are going" alone is ambiguous when you must produce the Odia.
    if (!en.includes('(') && /^(tåme|tåmårå|tåmåku)(?=\s|$)/i.test(od)) en += '  (informal)'
    if (!en.includes('(') && /^(apånå|apånånkårå)(?=\s|$)/i.test(od)) en += '  (respectful)'
    seen.add(k)
    out.push({ od, en, lesson })
  }
  for (const l of LESSONS)
    for (const it of l.items) {
      if (it.t === 'intro' && it.odia && it.gloss) {
        if (it.rule || /[→=]/.test(it.odia)) continue // grammar rules aren't words to quiz
        if (it.odia.includes('·')) {
          // "Eita · Seita" = "This (one) · That (one)" → two words. A trailing
          // note belongs to every word: "Duita · Tinita" = "Two · Three
          // (counting objects)", "Diå! · Diåntu!" = "Give! (inf · resp)".
          const a = it.odia.split('·')
          const m = it.gloss.match(/^(.*?)\s*\(([^()]*)\)\s*$/)
          const body = (m ? m[1] : it.gloss).split('·')
          const notes = m ? m[2].split('·') : []
          const note = (i: number) =>
            !m ? '' : notes.length === a.length ? ` (${notes[i].trim()})` : body.length === a.length ? ` (${m[2]})` : ''
          if (body.length === a.length) a.forEach((x, i) => add(x, body[i] + note(i), l.id))
          else if (body.length === 1 && notes.length === a.length) a.forEach((x, i) => add(x, body[0] + note(i), l.id))
          continue
        }
        add(it.odia, it.gloss, l.id)
      } else if (it.t === 'match') for (const [o, e] of it.pairs ?? []) add(o, e, l.id)
    }
  return out
}
const VOCAB = buildVocab()

function vocabStep(pool: Vocab[], target: Vocab, format: Format, rng: Rng): PStep | null {
  const others = shuffle(rng, pool).filter((v) => norm(v.od) !== norm(target.od) && norm(v.en) !== norm(target.en))
  // Prefer distractors from the same lesson: closer, so harder.
  const near = [...others.filter((v) => v.lesson === target.lesson), ...others.filter((v) => v.lesson !== target.lesson)]
  const pickDistinct = (n: number, field: 'od' | 'en') => {
    const seen = new Set([norm(target[field])])
    const res: Vocab[] = []
    for (const v of near) {
      if (res.length >= n) break
      if (seen.has(norm(v[field]))) continue
      seen.add(norm(v[field]))
      res.push(v)
    }
    return res
  }
  const sig = norm(target.od)
  switch (format) {
    case 'ending':
      return null // single words have no person ending to drill
    case 'choiceEn':
    case 'cloze': {
      const d = pickDistinct(2, 'en')
      if (d.length < 2) return null
      return { t: 'choice', q: 'What does this mean?', show: target.od, opts: [target, ...d].map((v) => ({ a: v.en })), ans: 0, sig, fresh: true }
    }
    case 'choiceOd':
    case 'buildOd': {
      const d = pickDistinct(2, 'od')
      if (d.length < 2) return null
      return { t: 'choice', q: `How do you say “${target.en}”?`, opts: [target, ...d].map((v) => ({ a: v.od })), ans: 0, sig, fresh: true }
    }
    case 'type':
    case 'buildEn': {
      if (target.od.split(' ').length > 3 || target.od.includes('{name}')) return null
      return { t: 'type', q: `Type in Odia: “${target.en}”`, ans: target.od, sig, fresh: true }
    }
    case 'match': {
      const d = pickDistinct(6, 'od').filter((v, i, a) => a.findIndex((x) => norm(x.en) === norm(v.en)) === i).slice(0, 3)
      if (d.length < 3) return null
      return { t: 'match', q: 'Match the pairs', pairs: [target, ...d].map((v) => [v.od, v.en] as [string, string]), sig, fresh: true }
    }
  }
}

// ---------- what each lesson's fresh practice focuses on ----------

// A lesson with several pieces lists one focus per piece; practice rotates
// through them so each piece gets its own questions.
const LESSON_FOCUS: Record<string, Focus | Focus[]> = {
  be: { frames: ['beLoc'] },
  howru: { frames: ['wellness'] },
  have: { frames: ['have'] },
  num: { frames: ['measure'] },
  count: { frames: ['count'] },
  conjgo: { frames: ['verb'], tenses: ['pres'], verbs: ['ja'] },
  conjeat: { frames: ['verb'], tenses: ['pres'], verbs: ['kha'] },
  conjdrink: { frames: ['verb'], tenses: ['pres'], verbs: ['pi'] },
  conjdo: { frames: ['verb'], tenses: ['pres'], verbs: ['kar', 'kama', 'chesta', 'help'] },
  conjsee: { frames: ['verb'], tenses: ['pres'], verbs: ['dekh'] },
  conjplay: { frames: ['verb'], tenses: ['pres'], verbs: ['khel'] },
  conjsleep: { frames: ['verb'], tenses: ['pres'], verbs: ['soi'] },
  this: { frames: ['thisThat'] },
  comego: { frames: ['verb'], tenses: ['pres'], verbs: ['ja', 'as'] },
  possess: { frames: ['poss'] },
  inout: [
    { frames: ['beLoc'], comps: ['inout'] },
    { frames: ['verb'], verbs: ['ja'], comps: ['inout'], compReq: true },
  ],
  where: { frames: ['beLoc', 'verb'], modes: ['where'] },
  verbs1: { frames: ['verb'], tenses: ['pres'], verbs: ['kha', 'pi', 'anu', 'rah'] },
  withothers: { frames: ['verb'], withReq: true, withFrom: ['withothers'] },
  smallwords: [
    { frames: ['poss'], ownersNamed: true }, // Kirsten-rå ghårå
    { frames: ['verb'], alsoReq: true }, // Mu be jauchi
    { frames: ['verb'], withReq: true, withFrom: ['smallwords'] }, // Rahul-sange
    { frames: ['verb'], verbs: ['ja', 'as'], comps: ['comego', 'smallwords'], compReq: true }, // -ku / -ru
  ],
  neg: { frames: ['verb', 'beLoc'], modes: ['neg'] },
  need: { frames: ['need'] },
  likeit: { frames: ['like'] },
  meals: { frames: ['verb'], verbs: ['kha'] },
  feel1: { frames: ['feel', 'emotion'] },
  feel2: { frames: ['feel', 'emotion'] },
  past: { frames: ['verb'], tenses: ['past'], persons: ['1s'] },
  pastyou: { frames: ['verb'], tenses: ['past'], persons: ['2i'] },
  pasthe: { frames: ['verb'], tenses: ['past'], persons: ['3i'] },
  pastresp: { frames: ['verb'], tenses: ['past'], persons: ['2r', '3r'] },
  pastwe: { frames: ['verb'], tenses: ['past'], persons: ['1p'] },
  pastprog: { frames: ['verb'], tenses: ['pprog'] },
  pastperf: { frames: ['verb'], tenses: ['pperf'] },
  future: { frames: ['verb'], tenses: ['fut'], persons: ['1s'] },
  futureyou: { frames: ['verb'], tenses: ['fut'], persons: ['2i'] },
  futurehe: { frames: ['verb'], tenses: ['fut'], persons: ['3i'] },
  futureresp: { frames: ['verb'], tenses: ['fut'], persons: ['2r', '3r'] },
  futurewe: { frames: ['verb'], tenses: ['fut'], persons: ['1p'] },
  didit: { frames: ['praise'] },
  days: { frames: ['verb'], timeReq: true, times: ['aji', 'kali', 'gatakali'] },
  soon: { frames: ['verb'], tenses: ['fut'], modes: ['stmt', 'when'], times: ['shighra'], timeReq: true },
}

// ---------- recently-seen questions (so a quiz doesn't repeat itself) ----------

const RECENT_KEY = 'odia-recent-practice'
function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}
export function rememberSeen(steps: PStep[]): void {
  try {
    const sigs = steps.map((s) => s.sig).filter((x): x is string => !!x)
    const next = [...sigs, ...loadRecent().filter((x) => !sigs.includes(x))].slice(0, 250)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable — repeats are merely more likely
  }
}

// ---------- roleplay lines as exercises ----------

// A line of a roleplay (data/roleplays.ts) as a step: its meaning, the reply to
// the line before it, or typing / building it. Only the lines themselves are
// ever said, so the roleplays' recordings cover these steps too.
type RpFormat = 'meaning' | 'reply' | 'type' | 'build'
const RP_FORMATS: RpFormat[] = ['meaning', 'reply', 'type', 'build']

function roleplayStep(r: Roleplay, i: number, format: RpFormat, rng: Rng): PStep | null {
  const line = r.lines[i]
  const pool = (ROLEPLAYS_BY_CHAPTER[r.chapter] ?? []).flatMap((x) => x.lines)
  const sig = `rp:${r.id}:${i}`
  // Lines from the same chapter that differ from this one in both languages.
  const others = (field: 'od' | 'en') => {
    const seen = new Set([norm(line.od), norm(line.en)])
    const out: typeof pool = []
    for (const l of shuffle(rng, pool)) {
      if (seen.has(norm(l.od)) || seen.has(norm(l.en))) continue
      seen.add(norm(l.od))
      seen.add(norm(l.en))
      if (field === 'od' || l.od.endsWith('?') === line.od.endsWith('?')) out.push(l)
    }
    return out
  }
  const question = line.od.endsWith('?')
  switch (format) {
    case 'meaning': {
      const d = others('en').slice(0, 2)
      if (d.length < 2) return null
      return { t: 'choice', q: 'What does this mean?', show: line.od, opts: [line, ...d].map((l) => ({ a: l.en })), ans: 0, sig: sig + ':m', fresh: true }
    }
    case 'reply': {
      if (i === 0) return null
      const prev = r.lines[i - 1]
      const d = others('od').slice(0, 2)
      if (d.length < 2) return null
      return {
        t: 'choice', q: `The ${ROLE_LABEL[prev.who].toLowerCase()} says this. Reply: “${line.en}”`,
        show: prev.od, opts: [line, ...d].map((l) => ({ a: l.od })), ans: 0, odOpts: true, sig: sig + ':r', fresh: true,
      }
    }
    case 'type':
      if (line.od.split(' ').length > 4 || line.od.includes('.')) return null
      return { t: 'type', q: `Type in Odia: “${line.en}”`, ans: line.od, sig: sig + ':t', fresh: true }
    case 'build': {
      // Tiles carry no "?" or ",": a "-ki" question still speaks as one; other
      // questions and lines with a pause or a second sentence ("." "!" "," before
      // the end) would need a second recording, so skip them.
      const words = line.od.split(' ')
      if (/[.!,]/.test(line.od.slice(0, -1)) || (question && !words[words.length - 1].endsWith('-ki?'))) return null
      const ans = words.map((w) => w.replace(/[?.!]$/, ''))
      const have = new Set(ans.map(norm))
      const dist = shuffle(rng, [...new Set(pool.flatMap((l) => l.od.replace(/[?,.!]/g, '').split(' ')))])
        .filter((w) => !have.has(norm(w))).slice(0, 2)
      if (dist.length < 2) return null
      return { t: 'assemble', q: `Build in Odia: “${line.en}”`, ans, dist, sig: sig + ':b', fresh: true }
    }
  }
}

// n distinct steps drawn from these roleplays, not seen recently where possible.
function roleplaySteps(roleplays: Roleplay[], n: number, rng: Rng, avoid: Set<string>): PStep[] {
  const out: PStep[] = []
  const used = new Set<string>()
  let fallback: PStep | null = null
  for (let attempt = 0; attempt < 40 * n && out.length < n && roleplays.length; attempt++) {
    const r = pick(rng, roleplays)
    const i = Math.floor(rng() * r.lines.length)
    const step = roleplayStep(r, i, pick(rng, RP_FORMATS), rng)
    if (!step || used.has(step.sig!)) continue
    if (avoid.has(step.sig!)) {
      fallback ??= step
      continue
    }
    used.add(step.sig!)
    out.push(step)
  }
  if (out.length < n && fallback && !used.has(fallback.sig!)) out.push(fallback)
  return out
}

// The roleplays of a lesson's chapter, once every lesson in it is finished —
// so practice never asks for a line built on a lesson still to come.
function chapterRoleplays(lessonId: string, completed: Set<string>): Roleplay[] {
  const ch = chapterOf(lessonId)
  if (!ch || !ch.lessons.every((id) => id === lessonId || completed.has(id))) return []
  return ROLEPLAYS_BY_CHAPTER[ch.key] ?? []
}

// ---------- assembling a set of practice steps ----------

interface Source {
  ctx?: Ctx // generate sentences in this context…
  vocab: Vocab[] // …or fall back to these words
  endings?: boolean // a conjugation lesson: lean on "which ending?" questions
}

function makeSet(sources: Source[], n: number, rng: Rng, avoid: Set<string>): PStep[] {
  const steps: PStep[] = []
  const used = new Set<string>()
  let formats = shuffle(rng, FORMATS)
  for (let i = 0; i < n; i++) {
    if (!formats.length) formats = shuffle(rng, FORMATS)
    const src = sources[i % sources.length]
    // Try a few candidates, in this round's format where possible, preferring
    // one that wasn't seen recently.
    let chosen: PStep | null = null
    let fallback: PStep | null = null
    for (let attempt = 0; attempt < 30 && !chosen; attempt++) {
      const fmts = [src.endings && chance(rng, 0.4) ? 'ending' : formats[0], ...shuffle(rng, FORMATS)] as Format[]
      let step: PStep | null = null
      const g = src.ctx && (src.vocab.length === 0 || chance(rng, 0.8)) ? generate(rng, src.ctx) : null
      if (g) for (const f of fmts) if ((step = sentenceStep(g, f, rng))) break
      if (!step && src.vocab.length) {
        const v = pick(rng, src.vocab)
        for (const f of fmts) if ((step = vocabStep(src.vocab, v, f, rng))) break
      }
      if (!step || used.has(step.sig!)) continue
      if (avoid.has(step.sig!)) fallback ??= step
      else chosen = step
    }
    chosen ??= fallback
    if (!chosen) continue
    used.add(chosen.sig!)
    const fmt = formatOf(chosen)
    formats = formats.filter((f) => f !== fmt)
    steps.push(chosen)
  }
  return steps
}

function formatOf(s: PStep): Format {
  if (s.t === 'assemble') return s.dir === 'en' ? 'buildEn' : 'buildOd'
  if (s.t === 'choice') return s.show ? 'choiceEn' : 'choiceOd'
  if (s.sig?.endsWith(':end')) return 'ending'
  return s.t as Format
}

const vocabFor = (known: Set<string>) => VOCAB.filter((v) => known.has(v.lesson))

// Lessons whose whole point is "which person ending?" — their practice asks for
// the ending itself more often.
const ENDING_LESSONS = new Set([
  'be', 'conjgo', 'conjeat', 'conjdrink', 'conjdo', 'conjsee', 'conjplay', 'conjsleep',
  'past', 'pastyou', 'pasthe', 'pastresp', 'pastwe', 'future', 'futureyou', 'futurehe', 'futureresp', 'futurewe', 'didit',
])

// Words for a lesson with no generator focus: its own, or — if it teaches too
// few to make questions from — those of the finished lessons in its chapter.
function lessonVocab(lessonId: string, known: Set<string>): Vocab[] {
  const own = VOCAB.filter((v) => v.lesson === lessonId)
  if (own.length >= 3) return own
  const mates = CHAPTERS.find((c) => c.lessons.includes(lessonId))?.lessons ?? [lessonId]
  return VOCAB.filter((v) => mates.includes(v.lesson) && known.has(v.lesson))
}

// ---------- pre-built practice banks ----------

// A lesson with a bank (built by `npm run practice:bank`) practises only from
// those steps, so the only Odia it can ask is what has been recorded. Lessons
// without one are generated fresh each time.
const BANKS = bankJson as unknown as Record<string, PStep[] | undefined>

export function bankSteps(lessonId: string): PStep[] | undefined {
  const bank = BANKS[lessonId]
  return bank?.length ? bank : undefined
}

// n steps from a bank at random: ones not seen recently first, and not the same
// format twice running where there's a choice.
function drawFromBank(bank: PStep[], n: number, rng: Rng, avoid: Set<string>): PStep[] {
  const pool = shuffle(rng, bank)
  const unseen = pool.filter((s) => !avoid.has(s.sig!))
  const seen = pool.filter((s) => avoid.has(s.sig!))
  const out: PStep[] = []
  let last: Format | undefined
  while (out.length < n && (unseen.length || seen.length)) {
    const from = unseen.length ? unseen : seen
    const [step] = from.splice(Math.max(0, from.findIndex((s) => formatOf(s) !== last)), 1)
    last = formatOf(step)
    out.push({ ...step, fresh: true })
  }
  return out
}

// Fresh practice for one lesson — only on that lesson's topic. Mixing in other
// lessons is the Pop Quiz's job; dropped into a focused lesson it just reads as
// a random question out of nowhere.
export function freshSteps(lessonId: string, completed: Set<string>, n: number, rng: Rng = makeRng()): PStep[] {
  const avoid = new Set(loadRecent())
  // Once the whole chapter is done, one of the steps is a line from its roleplays.
  const rp = roleplaySteps(chapterRoleplays(lessonId, completed), n > 1 ? 1 : 0, rng, avoid)
  const bank = bankSteps(lessonId)
  const own = bank ? drawFromBank(bank, n - rp.length, rng, avoid) : generateSteps(lessonId, completed, n - rp.length, rng)
  if (!rp.length) return own
  const at = Math.floor(rng() * (own.length + 1))
  return [...own.slice(0, at), ...rp, ...own.slice(at)]
}

// Straight from the generator, bank or no bank — what the bank builder samples.
export function generateSteps(lessonId: string, completed: Set<string>, n: number, rng: Rng = makeRng()): PStep[] {
  const known = new Set([...completed, lessonId])
  const vocab = lessonVocab(lessonId, known)
  const focuses = [LESSON_FOCUS[lessonId] ?? []].flat()
  const endings = ENDING_LESSONS.has(lessonId)
  const sources: Source[] = focuses.length
    ? focuses.map((focus) => ({ ctx: { known, focus }, vocab: [], endings }))
    : [{ vocab }]
  let steps = makeSet(sources, n, rng, new Set())
  // Too few distinct sentences? Top up from the lesson's own words.
  if (steps.length < n && vocab.length)
    steps = [...steps, ...makeSet([{ vocab }], n - steps.length, rng, new Set(steps.map((s) => s.sig!)))]
  return steps
}

export const FRESH_FIRST = 4 // generated steps after a first-time lesson
export const FRESH_REPLAY = 6 // …and when replaying a finished one

// The steps for one run of a lesson. First time: the curated lesson as written,
// then fresh practice. Replay: the teaching cards, a random half of the curated
// exercises, and more fresh practice — so no two replays are the same.
export function lessonRun(lessonId: string, completed: Set<string>, replay: boolean, rng: Rng = makeRng()): PStep[] {
  const lesson = LESSONS.find((l) => l.id === lessonId)
  if (!lesson) return []
  let curated: PStep[] = lesson.items
  if (replay) {
    const keep = curated.map((s) => s.t === 'intro' || chance(rng, 0.5))
    const exercises = curated.map((s, i) => (s.t === 'intro' ? -1 : i)).filter((i) => i >= 0)
    for (const i of shuffle(rng, exercises).slice(0, 2)) keep[i] = true // at least two
    curated = curated.filter((_, i) => keep[i])
  }
  return [...curated, ...freshSteps(lessonId, completed, replay ? FRESH_REPLAY : FRESH_FIRST, rng)]
}

export function lessonRunLength(lessonId: string): number {
  const lesson = LESSONS.find((l) => l.id === lessonId)
  return (lesson?.items.length ?? 0) + FRESH_FIRST
}

// A Pop Quiz over everything finished so far, avoiding recently-seen questions.
// Finished lessons with a bank supply their share of the questions from it (all
// of them, if every finished lesson has one); the rest are generated.
export function buildQuiz(completed: Set<string>, n = 10, rng: Rng = makeRng()): PStep[] {
  if (!completed.size) return []
  const avoid = new Set(loadRecent())
  // Up to a fifth of the quiz is lines from the roleplays of finished chapters.
  const roleplays = unlockedChapters(completed).flatMap((key) => ROLEPLAYS_BY_CHAPTER[key] ?? [])
  const rp = roleplaySteps(roleplays, Math.floor(n / 5), rng, avoid)
  n -= rp.length
  const banked = [...completed].filter((id) => bankSteps(id))
  const allBanked = banked.length === completed.size
  const pool = [...new Map(banked.flatMap((id) => bankSteps(id)!).map((s) => [s.sig, s])).values()]
  const fromBank = drawFromBank(pool, allBanked ? n : Math.round((n * banked.length) / completed.size), rng, avoid)
  const rest = allBanked ? 0 : n - fromBank.length
  const src: Source = { ctx: { known: completed }, vocab: vocabFor(completed) }
  const generated = makeSet([src], rest, rng, new Set([...avoid, ...fromBank.map((s) => s.sig!)]))
  return shuffle(rng, [...fromBank, ...generated, ...rp]).map((s) => ({ ...s, fresh: false }))
}
