// Roleplays: short scripted conversations (4–6 lines) between a parent and a
// child at home — meals, playing, going out, how everyone feels. The learner
// takes one role: the app says the other role's lines aloud, the learner says
// theirs back, then hears the recording to check.
//
// One file per chapter in roleplays/<chapter>.ts. A roleplay uses only words
// from its chapter's word list (src/data/words/) and the chapters before it in
// course order, so it only asks for things the learner has met — and so every
// line has Odia script and can be recorded. `npm run check:roleplays` enforces
// this; `npm run check:content` checks the "-ki" spelling; the lines are part of
// `npm run -s audio:todo -- --check all`, so they need clips before deploy.

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
  you: Role // the role the learner plays
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

// Chapters whose every lesson is finished: their roleplays are unlocked.
export function unlockedChapters(completed: Set<string>): string[] {
  return CHAPTERS.filter((c) => c.lessons.every((id) => completed.has(id))).map((c) => c.key)
}

export function unlockedRoleplays(completed: Set<string>): Roleplay[] {
  const open = new Set(unlockedChapters(completed))
  return ROLEPLAYS.filter((r) => open.has(r.chapter))
}
