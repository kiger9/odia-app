// Which Odia a step says aloud: its question when it appears, and the right
// answer once the learner has answered. Phonetic text — audio.ts turns it into
// script to find the recording, and stays silent for anything that isn't Odia.

import type { PStep } from '../gen/exercises'

const optText = (o: string | { a: string }) => (typeof o === 'string' ? o : o.a)

// The Odia shown as the question: a teaching card's phrase, or the phrase to
// translate (choice and build-in-English steps show their Odia in `show`).
export function promptOdia(step: PStep): string | undefined {
  if (step.t === 'intro') return step.rule ? undefined : step.odia
  if (step.t === 'choice' || step.t === 'assemble') return step.show
  return undefined
}

// The right answer, when it's Odia.
export function answerOdia(step: PStep): string | undefined {
  switch (step.t) {
    case 'choice':
      // With a phrase shown, the options are its English meanings.
      return step.show ? undefined : optText(step.opts?.[step.ans as number] ?? '')
    case 'cloze': {
      // The whole sentence, blank filled. "-chu" options are endings that
      // attach to the stem at the end of `pre`.
      const o = (step.opts?.[step.ans as number] ?? '') as string
      const filled = o.startsWith('-') ? `${step.pre ?? ''}${o.slice(1)}` : `${step.pre ?? ''} ${o}`
      return `${filled} ${step.post ?? ''}`.replace(/\s+/g, ' ').trim()
    }
    case 'assemble':
      return step.dir === 'en' ? undefined : (step.ans as string[]).join(' ')
    case 'type':
      return step.ans as string
    default:
      return undefined
  }
}
