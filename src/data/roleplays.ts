// Roleplays: short scripted conversations (4–6 lines) between a parent and a
// child at home — meals, playing, going out, bedtime, how everyone feels. The
// learner takes one role: the app says the other role's lines aloud (their
// meaning appears only after Continue, to check comprehension), the learner
// says theirs, then hears the recording to check.
//
// Every conversation is played in both roles: `you` is the learner's role the
// first time; the chapter test swaps roles on alternate runs, and the random
// mode picks either. So every line is a line the learner will say.
//
// One file per chapter in roleplays/<chapter>.ts. Each conversation is built
// around what its chapter (and the ones before it) teaches, but it reads as a
// real exchange first: words the lessons haven't taught are fine where the
// conversation needs them. Every word must have Odia script — new words go in
// words/roleplays/<chapter>.ts. `npm run check:roleplays` checks the rules
// (`-- --new` lists the untaught words); `npm run check:content` the "-ki"
// spelling; the lines are part of `audio:todo --check all`, so they need clips.

import { CHAPTERS } from './lessons'
import { START } from './roleplays/start'
import { MEET } from './roleplays/meet'
import { NUM } from './roleplays/num'
import { SIMPLECONJ } from './roleplays/simpleconj'
import { THINGS } from './roleplays/things'
import { AROUND } from './roleplays/around'
import { DOING } from './roleplays/doing'
import { CMD } from './roleplays/cmd'
import { PASTTENSE } from './roleplays/pasttense'
import { FUTURETENSE } from './roleplays/futuretense'
import { LIFE } from './roleplays/life'
import { TIME } from './roleplays/time'

export type Role = 'parent' | 'child'

export interface RoleplayLine {
  who: Role
  od: string // the book's phonetic spelling; questions end with "?"
  en: string // English meaning, with "(informal)" / "(respectful)" where it matters
}

export interface Roleplay {
  id: string // unique, e.g. 'start-breakfast'
  chapter: string // chapter key from lessons.ts; unlocks when that chapter is complete
  title: string // 'Breakfast time'
  scene: string // one line of English setting the scene
  you: Role // the learner's role the first time (the other on alternate runs)
  lines: RoleplayLine[] // 4–6, speakers alternating
}

export const ROLEPLAYS_BY_CHAPTER: Record<string, Roleplay[]> = {
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
}

// Every roleplay, in course order.
export const ROLEPLAYS: Roleplay[] = CHAPTERS.flatMap((c) => ROLEPLAYS_BY_CHAPTER[c.key] ?? [])

export const ROLEPLAY_BY_ID: Record<string, Roleplay> = Object.fromEntries(ROLEPLAYS.map((r) => [r.id, r]))

export const ROLE_LABEL: Record<Role, string> = { parent: 'Parent', child: 'Child' }

export function otherRole(role: Role): Role {
  return role === 'parent' ? 'child' : 'parent'
}

// The same conversation with the learner in the given role.
export function withRole(r: Roleplay, you: Role): Roleplay {
  return { ...r, you }
}

// Chapters whose every lesson is finished: their roleplays are unlocked.
export function unlockedChapters(completed: Set<string>): string[] {
  return CHAPTERS.filter((c) => c.lessons.every((id) => completed.has(id))).map((c) => c.key)
}

export function unlockedRoleplays(completed: Set<string>): Roleplay[] {
  const open = new Set(unlockedChapters(completed))
  return ROLEPLAYS.filter((r) => open.has(r.chapter))
}
