// Odia script for the book's phonetic spellings, word by word — so any phrase
// built from these words, curated or generated, can be shown in script and
// spoken aloud. A phrase converts only if every one of its words is listed;
// anything else stays phonetic-only (and silent).
//
// The words live in words/<chapter>.ts, one file per chapter, so each chapter
// can be transcribed on its own; a word used in several chapters must be spelt
// the same everywhere (`npm run check:content` checks).
//
// DRAFT: written without a workbook to copy from. Have an Odia speaker check it.
// Where the spoken form the book teaches differs from formal spelling, the
// spoken form wins, since this is also what the audio is recorded from:
// Tåme → ତମେ (formal: ତୁମେ); likewise tåmårå → ତମର (formal: ତୁମର) and
// gote → ଗୋଟେ (formal: ଗୋଟିଏ).

import { START } from './words/start'
import { MEET } from './words/meet'
import { NUM } from './words/num'
import { SIMPLECONJ } from './words/simpleconj'
import { THINGS } from './words/things'
import { AROUND } from './words/around'
import { DOING } from './words/doing'
import { CMD } from './words/cmd'
import { PASTTENSE } from './words/pasttense'
import { FUTURETENSE } from './words/futuretense'
import { LIFE } from './words/life'
import { TIME } from './words/time'
import { DICTIONARY_WORDS } from './words/dictionary'

export const WORD_LISTS: Record<string, Record<string, string>> = {
  start: START,
  meet: MEET,
  num: NUM,
  simpleconj: SIMPLECONJ,
  things: THINGS,
  around: AROUND,
  doing: DOING,
  cmd: CMD,
  pasttense: PASTTENSE,
  futuretense: FUTURETENSE,
  life: LIFE,
  time: TIME,
  dictionary: DICTIONARY_WORDS,
}

export const WORDS: Record<string, string> = Object.assign({}, ...Object.values(WORD_LISTS))

export function toScript(phonetic: string): string | undefined {
  const out: string[] = []
  let prev = ''
  for (const word of phonetic.trim().split(/\s+/)) {
    if (word === '·') {
      out.push('·') // "Morå · Tåmårå · Tarå": several words on one card
      prev = ''
      continue
    }
    const key = word.toLowerCase().replace(/[?!.,;:“”"]/g, '')
    if (!key) continue // a stray "?" written apart from its sentence
    let script = WORDS[key]
    if (!script) return undefined
    // The book writes "-ibå" for both "you will …" (ଖାଇବ) and, after "aså",
    // "let's …" (ଖାଇବା) — the word list holds the first; "let's" takes the long ା.
    if (prev === 'aså' && key.endsWith('ibå') && script.endsWith('ବ')) script += 'ା'
    out.push(script + (word.endsWith(',') ? ',' : '')) // keep the pause in "Na, …"
    prev = key
  }
  if (!out.length) return undefined
  // A phrase ending in the "-ki" question particle is a question even where
  // the "?" is left off (a fill-in-the-blank answer, a card), so it speaks as
  // the same question recording as its "?" twin. Nothing visible changes.
  const last = phonetic.trim().split(/\s+/).pop()!.toLowerCase().replace(/[?!.,;:“”"]/g, '')
  const question = /\?\s*$/.test(phonetic) || last.endsWith('-ki')
  return out.join(' ') + (question ? '?' : '')
}
