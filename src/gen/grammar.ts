// The sentence generator: a small grammar of spoken Odia that builds fresh,
// correct sentences (with their English) from parts the learner has already
// been taught, so practice isn't the same handful of fixed sentences.
//
// Accuracy rules:
// - Verb endings follow the book's Appendix C table (verified for every person
//   and tense on asiba), and each verb's stems come from Appendix D — including
//   the irregular ones (go: gåli / jibi; sleep: soichi / southili; drink: piili).
// - Every word, ending and construction is one a lesson already teaches. Each
//   piece names the lesson(s) that teach it and only appears once one of them
//   is done (`known`), so nothing is tested before it has been taught.
// - Forms not confirmed for every person are restricted to the persons that are
//   (e.g. "-ni" negatives only for I / he-she; "was/had" only for I).

import { chance, pick, shuffle, type Rng } from './rng'

export type Person = '1s' | '1p' | '2i' | '2r' | '3i' | '3r'
export type Tense = 'pres' | 'past' | 'fut' | 'pprog' | 'pperf'
export type FrameId =
  | 'verb'
  | 'beLoc'
  | 'wellness'
  | 'emotion'
  | 'feel'
  | 'like'
  | 'need'
  | 'have'
  | 'poss'
  | 'count'
  | 'measure'
  | 'thisThat'
export type Mode = 'stmt' | 'neg' | 'yn' | 'what' | 'where' | 'when' | 'how'

// Narrows generation to one lesson's topic (e.g. "past tense, you-informal").
export interface Focus {
  frames?: FrameId[]
  verbs?: string[]
  tenses?: Tense[]
  persons?: Person[]
  modes?: Mode[]
  withReq?: boolean // must include "with someone"
  timeReq?: boolean // must include a time word
  times?: string[] // only these time words
}

export interface Ctx {
  known: Set<string> // ids of lessons the learner has completed (or is in)
  focus?: Focus
}

export interface Sentence {
  frame: FrameId
  od: string[] // Odia tokens, in the main word order
  odOrders: string[][] // other accepted word orders
  en: string[] // English tokens
  enOrders: string[][]
  question: boolean
  hint?: string // e.g. "(informal)" — disambiguates the English prompt
  key: number // index in `od` of the word being drilled
  wrong: string[] // tempting wrong forms for od[key], all taught
  why: string // short HTML explanation
}

export interface Gen {
  s: Sentence
  siblings: () => Sentence[] // the same sentence with one thing changed
}

// ---------- helpers ----------

const knows = (ctx: Ctx, lessons: readonly string[]) => lessons.some((l) => ctx.known.has(l))
const words = (s: string) => s.split(' ').filter(Boolean)
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)
const uniq = (xs: string[], not: string) => [...new Set(xs)].filter((x) => x !== not)
const ALL_PERSONS: Person[] = ['1s', '2i', '2r', '3i', '1p', '3r']
const ASKABLE: Person[] = ['2i', '2r', '3i', '3r'] // who you'd ask a question about

export function odText(s: Sentence, tokens = s.od): string {
  return cap(tokens.join(' ')) + (s.question ? '?' : '')
}
export function enText(s: Sentence, tokens = s.en): string {
  return cap(tokens.join(' ')) + (s.question ? '?' : '')
}

// ---------- people ----------

type Cat = 'I' | 'you' | 'he' | 'we' | 'they' // English agreement class
type Gender = 'He' | 'She'

interface Subj {
  id: string
  od: string
  p: Person
  en: string
  cat: Cat
  pronoun: boolean // lower-cased mid-sentence ("are you…")
  hint?: string
  desc: string // for explanations
  lessons: string[]
}

const SUBJECTS: Subj[] = [
  { id: 'mu', od: 'Mu', p: '1s', en: 'I', cat: 'I', pronoun: false, desc: 'I', lessons: ['be'] },
  { id: 'tame', od: 'Tåme', p: '2i', en: 'You', cat: 'you', pronoun: true, hint: '(informal)', desc: 'you, informal', lessons: ['be'] },
  { id: 'apana', od: 'Apånå', p: '2r', en: 'You', cat: 'you', pronoun: true, hint: '(respectful)', desc: 'you, respectful', lessons: ['be'] },
  { id: 'se', od: 'Se', p: '3i', en: 'He', cat: 'he', pronoun: true, hint: '(informal)', desc: 'he / she', lessons: ['be'] },
  { id: 'ame', od: 'Ame', p: '1p', en: 'We', cat: 'we', pronoun: true, desc: 'we', lessons: ['be'] },
  { id: 'semane', od: 'Semane', p: '3r', en: 'They', cat: 'they', pronoun: true, desc: 'they', lessons: ['be'] },
  { id: 'rahul', od: 'Rahul', p: '3i', en: 'Rahul', cat: 'he', pronoun: false, desc: 'Rahul — the he/she form', lessons: ['be'] },
  { id: 'mitu', od: 'Mitu', p: '3i', en: 'Mitu', cat: 'he', pronoun: false, desc: 'Mitu — the he/she form', lessons: ['be'] },
  { id: 'rabi', od: 'Rabi', p: '3i', en: 'Rabi', cat: 'he', pronoun: false, desc: 'Rabi — the he/she form', lessons: ['be'] },
  { id: 'pila', od: 'Pilamane', p: '3r', en: 'The children', cat: 'they', pronoun: true, desc: 'the children — the “they” form', lessons: ['plural'] },
  { id: 'bapa', od: 'Bapa', p: '3r', en: 'Dad', cat: 'he', pronoun: false, desc: 'Dad — an elder, so respectful', lessons: ['withothers', 'days'] },
  { id: 'aai', od: 'Aai', p: '3r', en: 'Grandma', cat: 'he', pronoun: false, desc: 'Grandma — an elder, so respectful', lessons: ['possess', 'days'] },
]

function subjEn(s: Subj, g: Gender, mid: boolean): string[] {
  const en = s.id === 'se' ? g : s.en
  return words(mid && s.pronoun ? en[0].toLowerCase() + en.slice(1) : en)
}
const beEn = (c: Cat) => (c === 'I' ? 'am' : c === 'he' ? 'is' : 'are')
const wasEn = (c: Cat) => (c === 'I' || c === 'he' ? 'was' : 'were')
const doEn = (c: Cat) => (c === 'he' ? 'does' : 'do')
const hasEn = (c: Cat) => (c === 'he' ? 'has' : 'have')

// The verb "to be" (åchi) and its negative.
const BE: Record<Person, string> = { '1s': 'åchi', '2i': 'åchå', '3i': 'åchi', '1p': 'åchu', '2r': 'åchånti', '3r': 'åchånti' }
const NAHI: Partial<Record<Person, string>> = { '1s': 'nahi', '3i': 'nahi', '2r': 'nahanti', '3r': 'nahanti' }

// ---------- verbs ----------

// Appendix C endings. Present continuous attaches to the "-u" stem (asu-chi);
// past and the two "thili" tenses share one set; future its own.
const END = {
  pres: { '1s': 'chi', '2i': 'chå', '3i': 'chi', '1p': 'chu', '2r': 'chånti', '3r': 'chånti' },
  past: { '1s': 'i', '2i': 'å', '3i': 'a', '1p': 'u', '2r': 'e', '3r': 'e' },
  fut: { '1s': 'i', '2i': 'å', '3i': 'å', '1p': 'u', '2r': 'e', '3r': 'e' },
} as const

interface Comp {
  od: string[]
  en: string
  lessons: string[]
}

interface Verb {
  id: string
  pres: string
  past: string
  fut: string
  prog: string
  perf?: string
  neg?: string // present negative ("not ___ing")
  pre?: string[] // compound words before the verb (kamå kåruchi)
  en: [base: string, ing: string, past: string, pp: string]
  lessons: string[]
  comps: Comp[]
  withOk?: boolean // can take "with someone"
  needsComp?: boolean // odd without an object ("Dad brought")
  drillOnly?: boolean // only in its own lesson's practice
}

const HOME_TO: Comp = { od: ['ghårå-ku'], en: 'home', lessons: ['comego', 'possess'] }
const AT_HOME: Comp = { od: ['ghåre'], en: 'at home', lessons: ['be'] }
const MANGO: Comp = { od: ['ambå'], en: 'a mango', lessons: ['this'] }
const WATER: Comp = { od: ['pani'], en: 'water', lessons: ['verbs1', 'need'] }

const VERBS: Verb[] = [
  {
    id: 'ja', pres: 'jau', past: 'gål', fut: 'jib', prog: 'jauthil', perf: 'jaithil', neg: 'jauni',
    en: ['go', 'going', 'went', 'gone'], lessons: ['conjgo', 'comego'], withOk: true,
    comps: [
      HOME_TO,
      { od: ['måndirå-ku'], en: 'to the temple', lessons: ['comego'] },
      { od: ['bågicha-ku'], en: 'to the garden', lessons: ['comego'] },
      { od: ['school-ku'], en: 'to school', lessons: ['comego'] },
      { od: ['Puri'], en: 'to Puri', lessons: ['comego'] },
      { od: ['Aai-nkårå', 'ghårå-ku'], en: 'to grandma’s house', lessons: ['possess'] },
      { od: ['baharå-ku'], en: 'out', lessons: ['inout'] },
      { od: ['bhitårå-ku'], en: 'inside', lessons: ['inout'] },
      { od: ['upårå-ku'], en: 'upstairs', lessons: ['inout'] },
    ],
  },
  {
    id: 'as', pres: 'asu', past: 'asil', fut: 'asib', prog: 'asuthil', perf: 'asithil', neg: 'asuni',
    en: ['come', 'coming', 'came', 'come'], lessons: ['comego'], withOk: true,
    comps: [
      HOME_TO,
      { od: ['bågicha-ru'], en: 'from the garden', lessons: ['comego'] },
      { od: ['måndirå-ru'], en: 'from the temple', lessons: ['smallwords'] },
    ],
  },
  {
    id: 'kha', pres: 'khau', past: 'khail', fut: 'khaib', prog: 'khauthil', perf: 'khaithil', neg: 'khauni',
    en: ['eat', 'eating', 'ate', 'eaten'], lessons: ['verbs1', 'conjeat'], withOk: true,
    comps: [
      { od: ['bhatå'], en: 'rice', lessons: ['verbs1', 'past', 'meals'] },
      { od: ['machå'], en: 'fish', lessons: ['num', 'meals'] },
      MANGO,
      { od: ['kådåli'], en: 'a banana', lessons: ['count'] },
      { od: ['jolokia'], en: 'breakfast', lessons: ['meals'] },
      { od: ['pizza'], en: 'pizza', lessons: ['likeit'] },
    ],
  },
  {
    id: 'pi', pres: 'piu', past: 'piil', fut: 'pib', prog: 'piuthil', neg: 'piuni',
    en: ['drink', 'drinking', 'drank', 'drunk'], lessons: ['verbs1', 'conjdrink'],
    comps: [WATER, { od: ['cha'], en: 'tea', lessons: ['verbs1'] }, { od: ['khirå'], en: 'milk', lessons: ['need'] }],
  },
  {
    id: 'dekh', pres: 'dekhu', past: 'dekhil', fut: 'dekhib', prog: 'dekhuthil', perf: 'dekhithil', neg: 'dekhuni',
    en: ['see', 'watching', 'saw', 'seen'], lessons: ['conjsee', 'past'], needsComp: true,
    comps: [
      { od: ['hati'], en: 'the elephant', lessons: ['this', 'past'] },
      { od: ['gai'], en: 'the cow', lessons: ['have'] },
    ],
  },
  {
    id: 'kar', pres: 'kåru', past: 'kåril', fut: 'kårib', prog: 'kåruthil', perf: 'kårithil', neg: 'kåruni',
    en: ['do', 'doing', 'did', 'done'], lessons: ['conjdo', 'past'], comps: [], drillOnly: true,
  },
  {
    id: 'kama', pre: ['kamå'], pres: 'kåru', past: 'kåril', fut: 'kårib', prog: 'kåruthil', perf: 'kårithil', neg: 'kåruni',
    en: ['work', 'working', 'worked', 'worked'], lessons: ['conjdo'], comps: [AT_HOME], withOk: true,
  },
  {
    id: 'chesta', pre: ['chesta'], pres: 'kåru', past: 'kåril', fut: 'kårib', prog: 'kåruthil', perf: 'kårithil', neg: 'kåruni',
    en: ['try', 'trying', 'tried', 'tried'], lessons: ['conjdo'], comps: [],
  },
  {
    id: 'help', pre: ['help'], pres: 'kåru', past: 'kåril', fut: 'kårib', prog: 'kåruthil', perf: 'kårithil', neg: 'kåruni',
    en: ['help', 'helping', 'helped', 'helped'], lessons: ['conjdo'], comps: [],
  },
  {
    id: 'khel', pres: 'khelu', past: 'khelil', fut: 'khelib', prog: 'kheluthil', perf: 'khelithil', neg: 'kheluni',
    en: ['play', 'playing', 'played', 'played'], lessons: ['conjplay', 'withothers'], withOk: true,
    comps: [{ od: ['bahare'], en: 'outside', lessons: ['inout'] }],
  },
  {
    // Sleep drops the connecting -u-: soichi, southili (Appendix D).
    id: 'soi', pres: 'soi', past: 'soil', fut: 'soib', prog: 'southil', perf: 'soithil',
    en: ['sleep', 'sleeping', 'slept', 'slept'], lessons: ['conjsleep'],
    comps: [AT_HOME, { od: ['upåre'], en: 'upstairs', lessons: ['inout'] }],
  },
  {
    id: 'anu', pres: 'anu', past: 'anil', fut: 'anib', prog: 'anuthil', perf: 'anithil', neg: 'anuni',
    en: ['bring', 'bringing', 'brought', 'brought'], lessons: ['verbs1'], needsComp: true,
    comps: [{ od: ['phulå'], en: 'flowers', lessons: ['verbs1'] }, WATER, MANGO],
  },
  {
    id: 'rah', pres: 'råhu', past: 'råhil', fut: 'råhib', prog: 'råhuthil', perf: 'råhithil', neg: 'råhuni',
    en: ['stay', 'staying', 'stayed', 'stayed'], lessons: ['verbs1'], comps: [AT_HOME], needsComp: true, // bare “Mu råhuchi” = bye-bye
  },
]

function conj(v: Verb, t: Tense, p: Person): string {
  switch (t) {
    case 'pres':
      return v.pres + END.pres[p]
    case 'past':
      return v.past + END.past[p]
    case 'fut':
      return v.fut + END.fut[p]
    case 'pprog':
      return v.prog + END.past[p]
    case 'pperf':
      return (v.perf ?? '') + END.past[p]
  }
}

// Which lessons teach each person's form of each tense. Present is taught with
// each verb (the conjugation chapter), so it only needs the verb itself.
const TENSE_LESSONS: Record<Exclude<Tense, 'pres'>, Partial<Record<Person, string[]>>> = {
  past: { '1s': ['past', 'days'], '2i': ['pastyou'], '3i': ['pasthe'], '2r': ['pastresp'], '3r': ['pastresp'], '1p': ['pastwe'] },
  fut: { '1s': ['future', 'soon'], '2i': ['futureyou', 'withothers', 'likeit', 'soon'], '3i': ['futurehe'], '2r': ['futureresp'], '3r': ['futureresp'], '1p': ['futurewe'] },
  pprog: { '1s': ['pastprog'] },
  pperf: { '1s': ['pastperf'] },
}
const TENSES: Tense[] = ['pres', 'past', 'fut', 'pprog', 'pperf']
const TENSE_DESC: Record<Tense, string> = {
  pres: 'present (“is ___ing”)',
  past: 'past',
  fut: 'future',
  pprog: '“was ___ing”',
  pperf: '“had ___”',
}

function tenseOk(ctx: Ctx, v: Verb, t: Tense, p: Person): boolean {
  if (t === 'pperf' && !v.perf) return false
  if (t === 'pres') return true
  return knows(ctx, TENSE_LESSONS[t][p] ?? [])
}

interface With {
  od: string[]
  en: string
  not: string[] // subjects it can't go with ("I … with me")
}
const WITH: With[] = [
  { od: ['Rahul-sangåre'], en: 'with Rahul', not: ['rahul'] },
  { od: ['mo-sangåre'], en: 'with me', not: ['mu', 'ame'] },
  { od: ['tåmå-sangåre'], en: 'with you', not: ['tame', 'apana'] },
  { od: ['bapa-nkå-sangåre'], en: 'with dad', not: ['bapa'] },
]

interface Time {
  id: string
  od: string[]
  en: string
  tense: Tense
  front: boolean // may also open the sentence ("Aji Rahul …")
  lessons: string[]
}
const TIMES: Time[] = [
  { id: 'aji', od: ['aji'], en: 'today', tense: 'pres', front: true, lessons: ['days'] },
  { id: 'kali', od: ['kali'], en: 'tomorrow', tense: 'fut', front: true, lessons: ['days'] },
  { id: 'gatakali', od: ['gåtå', 'kali'], en: 'yesterday', tense: 'past', front: true, lessons: ['days'] },
  { id: 'shighra', od: ['shighrå'], en: 'soon', tense: 'fut', front: false, lessons: ['soon'] },
]

// ---------- frame: verb sentences ----------

interface VP {
  subj: Subj
  g: Gender
  verb: Verb
  tense: Tense
  mode: Mode
  comp?: Comp
  with?: With
  time?: Time
}

function modeOk(ctx: Ctx, mode: Mode, v: Verb, t: Tense, s: Subj): boolean {
  const asking = ASKABLE.includes(s.p)
  switch (mode) {
    case 'stmt':
      return true
    case 'neg':
      return knows(ctx, ['neg']) && t === 'pres' && !!v.neg && (s.p === '1s' || s.p === '3i')
    case 'yn':
      return asking && (t === 'pres' || t === 'fut') && knows(ctx, ['comego', 'withothers', 'likeit'])
    case 'what':
      return asking && ['kha', 'pi', 'anu'].includes(v.id) && ['pres', 'past', 'fut'].includes(t) && knows(ctx, ['verbs1'])
    case 'where':
      return asking && v.id === 'ja' && ['pres', 'past', 'fut'].includes(t) && knows(ctx, ['where'])
    case 'when':
      return asking && t === 'fut' && knows(ctx, ['soon'])
    default:
      return false
  }
}

const VERB_MODES: Mode[] = ['stmt', 'neg', 'yn', 'what', 'where', 'when']

function verbCandidates(ctx: Ctx) {
  const f = ctx.focus
  const out: { verb: Verb; subj: Subj; tense: Tense; mode: Mode }[] = []
  for (const verb of VERBS) {
    if (!knows(ctx, verb.lessons)) continue
    if (f?.verbs ? !f.verbs.includes(verb.id) : verb.drillOnly) continue
    for (const subj of SUBJECTS) {
      if (!knows(ctx, subj.lessons)) continue
      if (f?.persons && !f.persons.includes(subj.p)) continue
      for (const tense of TENSES) {
        if (f?.tenses && !f.tenses.includes(tense)) continue
        if (!tenseOk(ctx, verb, tense, subj.p)) continue
        if (f?.timeReq && !timesFor(ctx, tense).length) continue
        for (const mode of VERB_MODES) {
          if (f?.modes && !f.modes.includes(mode)) continue
          if (verb.needsComp && mode !== 'what' && !compsFor(ctx, verb).length) continue
          if (modeOk(ctx, mode, verb, tense, subj)) out.push({ verb, subj, tense, mode })
        }
      }
    }
  }
  return out
}

function timesFor(ctx: Ctx, t: Tense): Time[] {
  const only = ctx.focus?.times
  return TIMES.filter((x) => x.tense === t && knows(ctx, x.lessons) && (!only || only.includes(x.id)))
}
const compsFor = (ctx: Ctx, v: Verb) => v.comps.filter((c) => knows(ctx, c.lessons))
const withsFor = (ctx: Ctx, v: Verb, s: Subj) =>
  v.withOk && knows(ctx, ['withothers']) ? WITH.filter((w) => !w.not.includes(s.id)) : []

function makeVerb(rng: Rng, ctx: Ctx): VP | null {
  const all = verbCandidates(ctx)
  if (!all.length) return null
  // Pick the verb first so a verb with many subjects doesn't crowd the rest out,
  // and prefer plain statements — questions/negatives are the seasoning.
  const verb = pick(rng, [...new Set(all.map((c) => c.verb))])
  let cands = all.filter((c) => c.verb === verb)
  const stmts = cands.filter((c) => c.mode === 'stmt')
  if (stmts.length && chance(rng, 0.6)) cands = stmts
  const { subj, tense, mode } = pick(rng, cands)
  const p: VP = { subj, verb, tense, mode, g: chance(rng, 0.5) ? 'He' : 'She' }

  const f = ctx.focus
  const comps = compsFor(ctx, verb)
  const wantComp = verb.needsComp || chance(rng, ['ja', 'as'].includes(verb.id) ? 0.85 : 0.7)
  if (comps.length && mode !== 'what' && mode !== 'where' && wantComp) p.comp = pick(rng, comps)
  const times = mode === 'when' ? [] : timesFor(ctx, tense)
  if (times.length && (f?.timeReq || chance(rng, 0.3))) p.time = pick(rng, times)
  const withs = withsFor(ctx, verb, subj)
  if (withs.length && (f?.withReq || (chance(rng, 0.2) && !(p.comp && p.time)))) p.with = pick(rng, withs)
  if (f?.withReq && !p.with) return null
  return p
}

function renderVerb(p: VP, ctx: Ctx): Sentence {
  const { subj, verb, tense, mode } = p
  const yn = mode === 'yn'
  const form = (mode === 'neg' ? verb.neg! : conj(verb, tense, subj.p)) + (yn ? '-ki' : '')
  const wh = mode === 'what' ? ['kånå'] : mode === 'where' ? ['kouthiki'] : mode === 'when' ? ['kebe'] : []
  const time = p.time?.od ?? []
  const rest = [...(p.with?.od ?? []), ...wh, ...(p.comp?.od ?? []), ...(verb.pre ?? [])]
  const od = [subj.od, ...time, ...rest, form]
  const odOrders = p.time?.front && (mode === 'stmt' || mode === 'neg') ? [[...time, subj.od, ...rest, form]] : []

  // English
  const [base, ing, past, pp] = verb.en
  const S = subjEn(subj, p.g, false)
  const s = subjEn(subj, p.g, true)
  const c = subj.cat
  let core: string[]
  if (mode === 'neg') core = [...S, beEn(c), 'not', ing]
  else if (mode === 'yn') core = tense === 'pres' ? [cap(beEn(c)), ...s, ing] : ['Will', ...s, base]
  else if (mode === 'what' || mode === 'where' || mode === 'when') {
    const W = mode === 'what' ? 'What' : mode === 'where' ? 'Where' : 'When'
    core = tense === 'pres' ? [W, beEn(c), ...s, ing] : tense === 'past' ? [W, 'did', ...s, base] : [W, 'will', ...s, base]
  } else
    core = {
      pres: [...S, beEn(c), ing],
      past: [...S, past],
      fut: [...S, 'will', base],
      pprog: [...S, wasEn(c), ing],
      pperf: [...S, 'had', pp],
    }[tense]
  const tail = [...words(p.comp?.en ?? ''), ...words(p.with?.en ?? '')]
  const tEn = words(p.time?.en ?? '')
  const en = [...core, ...tail, ...tEn]
  const enOrders = p.time?.front && (mode === 'stmt' || mode === 'neg') ? [[...tEn, ...core, ...tail]] : []

  // Tempting wrong forms: other people's endings, other tenses, ±negative.
  const wrong: string[] = []
  const persons = mode === 'neg' ? [] : ALL_PERSONS.filter((q) => tenseOk(ctx, verb, tense, q))
  for (const q of persons) wrong.push(conj(verb, tense, q) + (yn ? '-ki' : ''))
  for (const t of TENSES)
    if (t !== tense && tenseOk(ctx, verb, t, subj.p) && (!yn || t === 'pres' || t === 'fut'))
      wrong.push(conj(verb, t, subj.p) + (yn ? '-ki' : ''))
  if (mode === 'neg') wrong.push(conj(verb, 'pres', subj.p))
  else if (mode === 'stmt' && modeOk(ctx, 'neg', verb, tense, subj)) wrong.push(verb.neg!)

  let why = `<b>${subj.od}</b> (${subj.desc}) + ${TENSE_DESC[tense]} → <b>${form}</b>.`
  if (mode === 'neg') why = `<b>-ni</b> on the verb means “not”: <b>${form}</b>.`
  if (yn) why += ' <b>-ki</b> turns it into a yes/no question.'
  if (p.time) why += ` <b>${p.time.od.join(' ')}</b> = ${p.time.en}.`

  return {
    frame: 'verb', od, odOrders, en, enOrders,
    question: mode === 'yn' || wh.length > 0,
    hint: subj.hint, key: od.length - 1, wrong: uniq(wrong, form), why,
  }
}

function verbSiblings(p: VP, ctx: Ctx): VP[] {
  const out: VP[] = []
  const fix = (q: VP): VP | null => {
    if (!tenseOk(ctx, q.verb, q.tense, q.subj.p)) return null
    if (!modeOk(ctx, q.mode, q.verb, q.tense, q.subj)) q = { ...q, mode: 'stmt' }
    if (q.with && q.with.not.includes(q.subj.id)) q = { ...q, with: undefined }
    if (q.time && q.time.tense !== q.tense) q = { ...q, time: timesFor(ctx, q.tense)[0] }
    return q
  }
  for (const subj of SUBJECTS) if (subj !== p.subj && knows(ctx, subj.lessons)) out.push({ ...p, subj })
  for (const tense of TENSES) if (tense !== p.tense) out.push({ ...p, tense })
  for (const comp of compsFor(ctx, p.verb)) if (p.comp && comp !== p.comp) out.push({ ...p, comp })
  if (p.mode === 'neg') out.push({ ...p, mode: 'stmt' })
  if (p.mode === 'stmt' && modeOk(ctx, 'neg', p.verb, p.tense, p.subj)) out.push({ ...p, mode: 'neg' })
  for (const verb of VERBS)
    if (verb !== p.verb && !verb.drillOnly && knows(ctx, verb.lessons)) {
      const comps = compsFor(ctx, verb)
      if (verb.needsComp && p.mode !== 'what' && !comps.length) continue
      const comp = (p.comp || verb.needsComp) && p.mode !== 'what' ? comps[0] : undefined
      out.push({ ...p, verb, comp, with: verb.withOk ? p.with : undefined })
    }
  return out.map(fix).filter((q): q is VP => !!q)
}

// ---------- frames built on åchi / possessives / numbers ----------

interface Poss {
  od: string
  subj: string // as a subject: I / You / He …
  poss: string // as a possessive: my / your / his …
  cat: Cat
  hint?: string
  ask: boolean
  lessons: string[]
}
const POSS: Poss[] = [
  { od: 'Morå', subj: 'I', poss: 'my', cat: 'I', ask: false, lessons: ['have', 'need', 'possess'] },
  { od: 'Tåmårå', subj: 'You', poss: 'your', cat: 'you', hint: '(informal)', ask: true, lessons: ['have', 'need', 'possess'] },
  { od: 'Tarå', subj: 'He', poss: 'his', cat: 'he', ask: true, lessons: ['have', 'possess'] },
  { od: 'Apånånkårå', subj: 'You', poss: 'your', cat: 'you', hint: '(respectful)', ask: true, lessons: ['have', 'names'] },
  { od: 'Amårå', subj: 'We', poss: 'our', cat: 'we', ask: false, lessons: ['possess'] },
  { od: 'Semanånkårå', subj: 'They', poss: 'their', cat: 'they', ask: false, lessons: ['possess'] },
]
const possSubj = (x: Poss, g: Gender, mid: boolean) => {
  const w = x.od === 'Tarå' ? g : x.subj
  return mid && w !== 'I' ? w.toLowerCase() : w
}
const possWord = (x: Poss, g: Gender) => (x.od === 'Tarå' ? (g === 'He' ? 'his' : 'her') : x.poss)

interface Item {
  od: string
  en: string
  pl?: string // English plural, where it matters
  lessons: string[]
}
const PLACES: Item[] = [
  { od: 'ghåre', en: 'at home', lessons: ['be'] },
  { od: 'bhitåre', en: 'inside', lessons: ['inout'] },
  { od: 'bahare', en: 'outside', lessons: ['inout'] },
  { od: 'upåre', en: 'upstairs', lessons: ['inout'] },
  { od: 'tåle', en: 'downstairs', lessons: ['inout'] },
]
const FEELINGS: Item[] = [
  { od: 'bhokå', en: 'hungry', lessons: ['feel1'] },
  { od: 'soså', en: 'thirsty', lessons: ['feel1'] },
  { od: 'thånda', en: 'cold', lessons: ['feel1'] },
  { od: 'gåråm', en: 'hot', lessons: ['feel1'] },
]
const EMOTIONS: Item[] = [
  { od: 'khusi', en: 'happy', lessons: ['feel1'] },
  { od: 'dukhi', en: 'sad', lessons: ['feel1'] },
]
const FOODS: Item[] = [
  { od: 'ambå', en: 'mangoes', lessons: ['this', 'likeit'] },
  { od: 'kådåli', en: 'bananas', lessons: ['count', 'likeit'] },
  { od: 'bhatå', en: 'rice', lessons: ['verbs1', 'meals'] },
  { od: 'machå', en: 'fish', lessons: ['num', 'meals'] },
  { od: 'pizza', en: 'pizza', lessons: ['likeit'] },
  { od: 'cha', en: 'tea', lessons: ['verbs1'] },
  { od: 'khirå', en: 'milk', lessons: ['need'] },
]
const NEEDS: Item[] = [
  { od: 'pani', en: 'water', lessons: ['need', 'verbs1'] },
  { od: 'khirå', en: 'milk', lessons: ['need'] },
  { od: 'cha', en: 'tea', lessons: ['verbs1'] },
  { od: 'tånka', en: 'money', lessons: ['need'] },
  { od: 'bhatå', en: 'rice', lessons: ['verbs1', 'meals'] },
]
const THINGS: Item[] = [
  { od: 'båhi', en: 'book', pl: 'books', lessons: ['have'] },
  { od: 'gadi', en: 'car', lessons: ['have'] },
  { od: 'ghårå', en: 'house', lessons: ['have', 'possess'] },
  { od: 'gai', en: 'cow', pl: 'cows', lessons: ['have'] },
  { od: 'pen', en: 'pen', lessons: ['have'] },
]
const COUNTABLE: Item[] = [
  { od: 'båhi', en: 'book', pl: 'books', lessons: ['count'] },
  { od: 'kådåli', en: 'banana', pl: 'bananas', lessons: ['count'] },
  { od: 'gai', en: 'cow', pl: 'cows', lessons: ['count'] },
  { od: 'ambå', en: 'mango', pl: 'mangoes', lessons: ['this'] },
]
interface Num {
  bare: string
  ta?: string // the counting-objects form (Tinita båhi)
  en: string
}
const NUMS: Num[] = [
  { bare: 'Dui', ta: 'Duita', en: 'two' },
  { bare: 'Tini', ta: 'Tinita', en: 'three' },
  { bare: 'Chari', ta: 'Charita', en: 'four' },
  { bare: 'Panch', ta: 'Panchta', en: 'five' },
  { bare: 'Chå', ta: 'Chåta', en: 'six' },
  { bare: 'Sat', en: 'seven' },
  { bare: 'Ath', en: 'eight' },
  { bare: 'Nå', en: 'nine' },
  { bare: 'Dås', ta: 'Dåsta', en: 'ten' },
]
const UNITS: { od: string[]; en: string }[] = [
  { od: ['tånka'], en: 'rupees' },
  { od: ['kilo'], en: 'kilos' },
  { od: ['ghånta'], en: 'hours' },
  { od: ['kilo', 'machå'], en: 'kilos of fish' },
]
const DEMONSTRABLE: { od: string; en: string; adj: Item[] }[] = [
  { od: 'ambå', en: 'mango', adj: [{ od: 'mitha', en: 'sweet', lessons: [] }, { od: 'bådå', en: 'big', lessons: [] }] },
  { od: 'ghårå', en: 'house', adj: [{ od: 'bådå', en: 'big', lessons: [] }, { od: 'nua', en: 'new', lessons: [] }] },
  { od: 'gadi', en: 'car', adj: [{ od: 'nua', en: 'new', lessons: [] }, { od: 'bådå', en: 'big', lessons: [] }] },
  { od: 'båhi', en: 'book', adj: [{ od: 'nua', en: 'new', lessons: [] }] },
  { od: 'hati', en: 'elephant', adj: [{ od: 'bådå', en: 'big', lessons: [] }] },
]

const knownItems = (ctx: Ctx, xs: Item[]) => xs.filter((x) => knows(ctx, x.lessons))
const knownSubjs = (ctx: Ctx, ps?: Person[]) =>
  SUBJECTS.filter((s) => knows(ctx, s.lessons) && (!ps || ps.includes(s.p)))

// A small "build a sentence from slots" helper the simpler frames share.
function simple(
  frame: FrameId,
  od: string[],
  en: string[],
  key: number,
  wrong: string[],
  why: string,
  extra: Partial<Sentence> = {},
): Sentence {
  return {
    frame, od, en, key, why,
    odOrders: [], enOrders: [], question: false,
    wrong: uniq(wrong, od[key]),
    ...extra,
  }
}

// Each simple frame: make params → render → siblings, wrapped as a Gen.
type MakeGen = (rng: Rng, ctx: Ctx) => Gen | null

const beLoc: MakeGen = (rng, ctx) => {
  const subjs = knownSubjs(ctx, ctx.focus?.persons)
  const places = knownItems(ctx, PLACES)
  if (!subjs.length || !places.length) return null
  type P = { subj: Subj; g: Gender; place: Item; mode: Mode }
  const ok = (p: P) =>
    p.mode === 'stmt' ||
    (p.mode === 'neg' && knows(ctx, ['neg', 'howru']) && !!NAHI[p.subj.p]) ||
    (p.mode === 'yn' && knows(ctx, ['have']) && ASKABLE.includes(p.subj.p)) ||
    (p.mode === 'where' && knows(ctx, ['where']) && ASKABLE.includes(p.subj.p))
  const render = (p: P): Sentence => {
    const yn = p.mode === 'yn'
    const form = p.mode === 'neg' ? NAHI[p.subj.p]! : BE[p.subj.p] + (yn ? '-ki' : '')
    const od = [p.subj.od, p.mode === 'where' ? 'kouthi' : p.place.od, form]
    const S = subjEn(p.subj, p.g, false)
    const s = subjEn(p.subj, p.g, true)
    const be = beEn(p.subj.cat)
    const pl = words(p.place.en)
    const en =
      p.mode === 'neg' ? [...S, be, 'not', ...pl]
      : yn ? [cap(be), ...s, ...pl]
      : p.mode === 'where' ? ['Where', be, ...s]
      : [...S, be, ...pl]
    const wrong = ALL_PERSONS.map((q) => BE[q] + (yn ? '-ki' : ''))
    if (p.mode === 'neg') wrong.push(BE[p.subj.p], ...Object.values(NAHI))
    else if (p.mode === 'stmt' && ok({ ...p, mode: 'neg' })) wrong.push(NAHI[p.subj.p]!)
    const why =
      p.mode === 'neg'
        ? `“Not” for <b>${p.subj.od}</b> (${p.subj.desc}) → <b>${form}</b>.`
        : `<b>${p.subj.od}</b> (${p.subj.desc}) → <b>${BE[p.subj.p]}</b>.`
    return simple('beLoc', od, en, 2, wrong, why, { hint: p.subj.hint, question: yn || p.mode === 'where' })
  }
  const modes = (['stmt', 'neg', 'yn', 'where'] as Mode[]).filter((m) => !ctx.focus?.modes || ctx.focus.modes.includes(m))
  for (let i = 0; i < 12; i++) {
    const p: P = { subj: pick(rng, subjs), g: chance(rng, 0.5) ? 'He' : 'She', place: pick(rng, places), mode: chance(rng, 0.6) && modes.includes('stmt') ? 'stmt' : pick(rng, modes) }
    if (!ok(p)) continue
    const sibs = (): P[] => [
      ...subjs.filter((x) => x !== p.subj).map((subj) => ({ ...p, subj })),
      ...(p.mode === 'where' ? [] : places.filter((x) => x !== p.place).map((place) => ({ ...p, place }))),
      { ...p, mode: p.mode === 'neg' ? 'stmt' : 'neg' } as P,
    ].filter(ok)
    return { s: render(p), siblings: () => sibs().map(render) }
  }
  return null
}

const wellness: MakeGen = (rng, ctx) => {
  const subjs = knownSubjs(ctx)
  if (!knows(ctx, ['howru']) || !subjs.length) return null
  type P = { subj: Subj; g: Gender; mode: 'stmt' | 'very' | 'neg' | 'how' }
  const ok = (p: P) =>
    (p.mode !== 'neg' || !!NAHI[p.subj.p]) && (p.mode !== 'how' || ASKABLE.includes(p.subj.p))
  const render = (p: P): Sentence => {
    const S = subjEn(p.subj, p.g, false)
    const be = beEn(p.subj.cat)
    const form = p.mode === 'neg' ? NAHI[p.subj.p]! : BE[p.subj.p]
    const mid = { stmt: ['bhålå'], very: ['båhut', 'bhålå'], neg: ['bhålå'], how: ['kemiti'] }[p.mode]
    const en = {
      stmt: [...S, be, 'fine'],
      very: [...S, be, 'very', 'well'],
      neg: [...S, be, 'not', 'well'],
      how: ['How', be, ...subjEn(p.subj, p.g, true)],
    }[p.mode]
    const od = [p.subj.od, ...mid, form]
    const wrong = [...ALL_PERSONS.map((q) => BE[q]), ...(p.mode === 'neg' ? [BE[p.subj.p], ...Object.values(NAHI)] : [])]
    return simple('wellness', od, en, od.length - 1, wrong, `<b>${p.subj.od}</b> (${p.subj.desc}) → <b>${form}</b>.`, {
      hint: p.subj.hint, question: p.mode === 'how',
    })
  }
  for (let i = 0; i < 12; i++) {
    const p: P = { subj: pick(rng, subjs), g: chance(rng, 0.5) ? 'He' : 'She', mode: pick(rng, ['stmt', 'very', 'neg', 'how'] as const) }
    if (!ok(p)) continue
    const sibs = () =>
      [
        ...subjs.filter((x) => x !== p.subj).map((subj) => ({ ...p, subj })),
        ...(['stmt', 'very', 'neg', 'how'] as const).filter((m) => m !== p.mode).map((mode) => ({ ...p, mode })),
      ].filter(ok)
    return { s: render(p), siblings: () => sibs().map(render) }
  }
  return null
}

const emotion: MakeGen = (rng, ctx) => {
  const emos = knownItems(ctx, EMOTIONS)
  const subjs = knownSubjs(ctx)
  if (!emos.length || !subjs.length) return null
  type P = { subj: Subj; g: Gender; emo: Item; yn: boolean }
  const ok = (p: P) => !p.yn || (knows(ctx, ['feel2']) && ASKABLE.includes(p.subj.p))
  const render = (p: P): Sentence => {
    const form = BE[p.subj.p] + (p.yn ? '-ki' : '')
    const be = beEn(p.subj.cat)
    const en = p.yn
      ? [cap(be), ...subjEn(p.subj, p.g, true), p.emo.en]
      : [...subjEn(p.subj, p.g, false), be, p.emo.en]
    const wrong = ALL_PERSONS.map((q) => BE[q] + (p.yn ? '-ki' : ''))
    return simple('emotion', [p.subj.od, p.emo.od, form], en, 2, wrong,
      `Feelings like <b>${p.emo.od}</b> use “to be”: <b>${p.subj.od}</b> (${p.subj.desc}) → <b>${BE[p.subj.p]}</b>.`,
      { hint: p.subj.hint, question: p.yn })
  }
  for (let i = 0; i < 12; i++) {
    const p: P = { subj: pick(rng, subjs), g: chance(rng, 0.5) ? 'He' : 'She', emo: pick(rng, emos), yn: chance(rng, 0.35) }
    if (!ok(p)) continue
    const sibs = () =>
      [
        ...subjs.filter((x) => x !== p.subj).map((subj) => ({ ...p, subj })),
        ...emos.filter((x) => x !== p.emo).map((emo) => ({ ...p, emo })),
      ].filter(ok)
    return { s: render(p), siblings: () => sibs().map(render) }
  }
  return null
}

const feel: MakeGen = (rng, ctx) => {
  const fs = knownItems(ctx, FEELINGS)
  if (!fs.length) return null
  const you = knows(ctx, ['feel2'])
  type P = { who: 'Mote' | 'Tåmåku'; f: Item; yn: boolean; keyWho: boolean }
  const render = (p: P): Sentence => {
    const od = [p.who, p.f.od, p.yn ? 'laguchi-ki' : 'laguchi']
    const en = p.yn ? ['Are', 'you', p.f.en] : [p.who === 'Mote' ? 'I' : 'You', 'feel', p.f.en]
    const wrong = p.keyWho
      ? p.who === 'Mote' ? ['Mu', ...(you ? ['Tåmåku'] : [])] : ['Tåme', 'Mote']
      : fs.map((x) => x.od)
    return simple('feel', od, en, p.keyWho ? 0 : 1, wrong,
      `Feelings “feel to” someone: <b>Mote</b> = to me, <b>Tåmåku</b> = to you. <b>${p.f.od}</b> = ${p.f.en}.`,
      { question: p.yn })
  }
  const who: P['who'] = you && chance(rng, 0.4) ? 'Tåmåku' : 'Mote'
  const p: P = { who, f: pick(rng, fs), yn: who === 'Tåmåku' && chance(rng, 0.6), keyWho: chance(rng, 0.4) }
  const sibs = (): P[] => [
    ...fs.filter((x) => x !== p.f).map((f) => ({ ...p, f })),
    ...(you ? [{ ...p, who: (p.who === 'Mote' ? 'Tåmåku' : 'Mote') as P['who'], yn: false }] : []),
  ]
  return { s: render(p), siblings: () => sibs().map(render) }
}

const like: MakeGen = (rng, ctx) => {
  if (!knows(ctx, ['likeit'])) return null
  const foods = knownItems(ctx, FOODS)
  type P = { food: Item; mode: 'like' | 'dislike' | 'q' }
  const render = (p: P): Sentence => {
    if (p.mode === 'q')
      return simple('like', [p.food.od, 'bhålå', 'laguchi-ki'], ['Do', 'you', 'like', p.food.en], 0,
        foods.map((x) => x.od), `<b>${p.food.od}</b> = ${p.food.en}. <b>bhålå laguchi-ki?</b> = do you like it?`, { question: true })
    const v = p.mode === 'like' ? 'laguchi' : 'laguni'
    return simple('like', ['Mote', p.food.od, 'bhålå', v],
      p.mode === 'like' ? ['I', 'like', p.food.en] : ['I', 'don’t', 'like', p.food.en], 3,
      [p.mode === 'like' ? 'laguni' : 'laguchi', 'åchi'],
      `Liking “feels good to me”: <b>Mote … bhålå laguchi</b>; <b>laguni</b> = doesn’t.`)
  }
  const p: P = { food: pick(rng, foods), mode: pick(rng, ['like', 'dislike', 'q'] as const) }
  const sibs = (): P[] => [
    ...foods.filter((x) => x !== p.food).map((food) => ({ ...p, food })),
    ...(['like', 'dislike', 'q'] as const).filter((m) => m !== p.mode).map((mode) => ({ ...p, mode })),
  ]
  return { s: render(p), siblings: () => sibs().map(render) }
}

const need: MakeGen = (rng, ctx) => {
  if (!knows(ctx, ['need'])) return null
  const posses = POSS.filter((x) => knows(ctx, x.lessons))
  const things = knownItems(ctx, NEEDS)
  type P = { who: Poss; g: Gender; thing: Item; mode: 'stmt' | 'neg' | 'yn' | 'what' }
  const ok = (p: P) => (p.mode === 'yn' || p.mode === 'what' ? p.who.ask : true)
  const render = (p: P): Sentence => {
    const S = possSubj(p.who, p.g, false)
    const s = possSubj(p.who, p.g, true)
    const he = p.who.cat === 'he'
    const od = {
      stmt: [p.who.od, p.thing.od, 'dårkar'],
      neg: [p.who.od, p.thing.od, 'dårkar', 'nahi'],
      yn: [p.who.od, p.thing.od, 'dårkar-ki'],
      what: [p.who.od, 'kånå', 'dårkar'],
    }[p.mode]
    const en = {
      stmt: [S, he ? 'needs' : 'need', p.thing.en],
      neg: [S, he ? 'doesn’t' : 'don’t', 'need', p.thing.en],
      yn: [cap(doEn(p.who.cat)), s, 'need', p.thing.en],
      what: ['What', doEn(p.who.cat), s, 'need'],
    }[p.mode]
    const wrong = [...posses.map((x) => x.od), ...(p.who.od === 'Morå' ? ['Mu'] : [])]
    return simple('need', od, en, 0, wrong,
      `<b>dårkar</b> (need) takes the “whose” word: <b>${p.who.od}</b> = ${possWord(p.who, p.g)}.`,
      { hint: p.who.hint, question: p.mode === 'yn' || p.mode === 'what' })
  }
  for (let i = 0; i < 12; i++) {
    const p: P = { who: pick(rng, posses), g: chance(rng, 0.5) ? 'He' : 'She', thing: pick(rng, things), mode: chance(rng, 0.5) ? 'stmt' : pick(rng, ['neg', 'yn', 'what'] as const) }
    if (!ok(p)) continue
    const sibs = () =>
      [
        ...posses.filter((x) => x !== p.who).map((who) => ({ ...p, who })),
        ...(p.mode === 'what' ? [] : things.filter((x) => x !== p.thing).map((thing) => ({ ...p, thing }))),
        ...(p.mode === 'stmt' ? [{ ...p, mode: 'neg' as const }] : p.mode === 'neg' ? [{ ...p, mode: 'stmt' as const }] : []),
      ].filter(ok)
    return { s: render(p), siblings: () => sibs().map(render) }
  }
  return null
}

const have: MakeGen = (rng, ctx) => {
  if (!knows(ctx, ['have'])) return null
  const posses = POSS.filter((x) => knows(ctx, x.lessons))
  const things = knownItems(ctx, THINGS)
  type P = { who: Poss; g: Gender; thing: Item; yn: boolean }
  const ok = (p: P) => !p.yn || p.who.ask
  const render = (p: P): Sentence => {
    const od = [p.who.od, 'gote', p.thing.od, p.yn ? 'åchi-ki' : 'åchi']
    const en = p.yn
      ? [cap(doEn(p.who.cat)), possSubj(p.who, p.g, true), 'have', 'a', p.thing.en]
      : [possSubj(p.who, p.g, false), hasEn(p.who.cat), 'a', p.thing.en]
    return simple('have', od, en, 0, posses.map((x) => x.od),
      `“Have” in Odia is “mine there is”: <b>${p.who.od}</b> (${possWord(p.who, p.g)}) <b>gote ${p.thing.od} åchi</b>.`,
      { hint: p.who.hint, question: p.yn })
  }
  for (let i = 0; i < 12; i++) {
    const p: P = { who: pick(rng, posses), g: chance(rng, 0.5) ? 'He' : 'She', thing: pick(rng, things), yn: chance(rng, 0.3) }
    if (!ok(p)) continue
    const sibs = () =>
      [
        ...posses.filter((x) => x !== p.who).map((who) => ({ ...p, who })),
        ...things.filter((x) => x !== p.thing).map((thing) => ({ ...p, thing })),
      ].filter(ok)
    return { s: render(p), siblings: () => sibs().map(render) }
  }
  return null
}

const poss: MakeGen = (rng, ctx) => {
  if (!knows(ctx, ['possess', 'smallwords'])) return null
  const names = knows(ctx, ['smallwords'])
    ? ['Rahul', 'Mitu', 'Rabi'].map((n) => ({ od: `${n}-rå`, en: `${n}’s` }))
    : []
  const owners = [
    ...(knows(ctx, ['possess']) ? POSS.filter((x) => knows(ctx, x.lessons)) : []).map((x) => ({
      od: x.od, en: x.od === 'Tarå' ? (chance(rng, 0.5) ? 'his' : 'her') : x.poss, hint: x.hint,
    })),
    ...names.map((x) => ({ ...x, hint: undefined as string | undefined })),
  ]
  const things = knownItems(ctx, THINGS).filter((x) => x.od !== 'pen')
  if (!owners.length || !things.length) return null
  type P = { who: (typeof owners)[number]; thing: Item }
  const render = (p: P): Sentence =>
    simple('poss', [p.who.od, p.thing.od], [p.who.en, p.thing.en], 0,
      [...owners.map((x) => x.od), ...(p.who.od === 'Morå' ? ['Mu'] : [])],
      p.who.od.endsWith('-rå')
        ? `A name + <b>-rå</b> = ’s (whose).`
        : `<b>${p.who.od}</b> = ${p.who.en}.`,
      { hint: p.who.hint })
  const p: P = { who: pick(rng, owners), thing: pick(rng, things) }
  const sibs = (): P[] => [
    ...owners.filter((x) => x !== p.who).map((who) => ({ ...p, who })),
    ...things.filter((x) => x !== p.thing).map((thing) => ({ ...p, thing })),
  ]
  return { s: render(p), siblings: () => sibs().map(render) }
}

const count: MakeGen = (rng, ctx) => {
  if (!knows(ctx, ['count'])) return null
  const nouns = knownItems(ctx, COUNTABLE)
  const nums = NUMS.filter((n) => n.ta)
  type P = { n: Num; noun: Item; how: boolean }
  const render = (p: P): Sentence =>
    p.how
      ? simple('count', ['Keteta', p.noun.od, 'åchi'], ['How', 'many', p.noun.pl!, 'are', 'there'], 0, ['Kete', 'Gote'],
          `<b>Keteta?</b> = how many (things you can count).`, { question: true })
      : simple('count', [p.n.ta!, p.noun.od, 'åchi'], ['There', 'are', p.n.en, p.noun.pl!], 0,
          [p.n.bare, ...nums.map((n) => n.ta!)],
          `Counting objects adds <b>-ta</b>: ${p.n.bare} → <b>${p.n.ta}</b>.`)
  const p: P = { n: pick(rng, nums), noun: pick(rng, nouns), how: chance(rng, 0.2) }
  const sibs = (): P[] => [
    ...nums.filter((x) => x !== p.n).map((n) => ({ ...p, n, how: false })),
    ...nouns.filter((x) => x !== p.noun).map((noun) => ({ ...p, noun })),
  ]
  return { s: render(p), siblings: () => sibs().map(render) }
}

const measure: MakeGen = (rng, ctx) => {
  if (!knows(ctx, ['num'])) return null
  type P = { n: Num; unit: (typeof UNITS)[number] }
  const render = (p: P): Sentence =>
    simple('measure', [p.n.bare, ...p.unit.od], [p.n.en, ...words(p.unit.en)], 0,
      [...NUMS.map((n) => n.bare), ...(p.n.ta && knows(ctx, ['count']) ? [p.n.ta] : [])],
      `<b>${p.n.bare}</b> = ${p.n.en}. Prices, kilos and hours use the plain number (no -ta).`)
  const p: P = { n: pick(rng, NUMS), unit: pick(rng, UNITS) }
  const sibs = (): P[] => [
    ...NUMS.filter((x) => x !== p.n).map((n) => ({ ...p, n })),
    ...UNITS.filter((x) => x !== p.unit).map((unit) => ({ ...p, unit })),
  ]
  return { s: render(p), siblings: () => sibs().map(render) }
}

const thisThat: MakeGen = (rng, ctx) => {
  if (!knows(ctx, ['this'])) return null
  type P = { near: boolean; noun: (typeof DEMONSTRABLE)[number]; adj: Item; keyAdj: boolean }
  const render = (p: P): Sentence => {
    const dem = p.near ? 'Ei' : 'Sei'
    return simple('thisThat', [dem, `${p.noun.od}-ta`, p.adj.od], [p.near ? 'This' : 'That', p.noun.en, 'is', p.adj.en],
      p.keyAdj ? 2 : 0,
      p.keyAdj ? ['mitha', 'bådå', 'nua'] : [p.near ? 'Sei' : 'Ei', p.near ? 'Eita' : 'Seita'],
      `<b>${dem}</b> + thing<b>-ta</b> = ${p.near ? 'this' : 'that'} thing. (<i>${p.near ? 'Eita' : 'Seita'}</i> = ${p.near ? 'this' : 'that'} one, on its own.)`)
  }
  const noun = pick(rng, DEMONSTRABLE)
  const p: P = { near: chance(rng, 0.5), noun, adj: pick(rng, noun.adj), keyAdj: chance(rng, 0.4) }
  const sibs = (): P[] => [
    { ...p, near: !p.near },
    ...p.noun.adj.filter((x) => x !== p.adj).map((adj) => ({ ...p, adj })),
    ...DEMONSTRABLE.filter((x) => x !== p.noun).map((noun) => ({ ...p, noun, adj: noun.adj[0] })),
  ]
  return { s: render(p), siblings: () => sibs().map(render) }
}

const verbGen: MakeGen = (rng, ctx) => {
  const p = makeVerb(rng, ctx)
  if (!p) return null
  return { s: renderVerb(p, ctx), siblings: () => verbSiblings(p, ctx).map((q) => renderVerb(q, ctx)) }
}

const FRAMES: Record<FrameId, MakeGen> = {
  verb: verbGen, beLoc, wellness, emotion, feel, like, need, have, poss, count, measure, thisThat,
}
// The lesson that first makes each frame possible.
const FRAME_LESSONS: Record<FrameId, string[]> = {
  verb: ['conjgo', 'conjeat', 'conjdrink', 'conjdo', 'conjsee', 'conjplay', 'conjsleep', 'comego', 'verbs1', 'past', 'withothers'],
  beLoc: ['be'],
  wellness: ['howru'],
  emotion: ['feel1'],
  feel: ['feel1'],
  like: ['likeit'],
  need: ['need'],
  have: ['have'],
  poss: ['possess', 'smallwords'],
  count: ['count'],
  measure: ['num'],
  thisThat: ['this'],
}

export function framesAvailable(ctx: Ctx): FrameId[] {
  return (Object.keys(FRAMES) as FrameId[]).filter(
    (f) => knows(ctx, FRAME_LESSONS[f]) && (!ctx.focus?.frames || ctx.focus.frames.includes(f)),
  )
}

// One fresh sentence (with a way to get its near-miss siblings), or null if
// nothing suitable has been taught yet.
export function generate(rng: Rng, ctx: Ctx): Gen | null {
  // Verb sentences are where the variety lives, so they get extra weight.
  const frames = framesAvailable(ctx).flatMap((f) => (f === 'verb' ? [f, f, f] : [f]))
  for (const f of shuffle(rng, frames)) {
    for (let i = 0; i < 3; i++) {
      const g = FRAMES[f](rng, ctx)
      if (g) return g
    }
  }
  return null
}
