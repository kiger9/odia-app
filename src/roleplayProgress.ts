// Which roleplay variants the learner has played to the end. A variant is one
// conversation in one learner role, so every conversation has two. Kept in
// localStorage as a JSON array of "id:role" strings; any storage failure reads
// as "nothing done".

import { ROLEPLAYS_BY_CHAPTER, type Role } from './data/roleplays'

const KEY = 'odia:rp-done'

export interface Variant {
  id: string
  you: Role
}

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    const arr: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

function write(done: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]))
  } catch {
    // storage unavailable: progress just isn't remembered
  }
}

const key = (id: string, role: Role) => `${id}:${role}`

export function isDone(id: string, role: Role): boolean {
  return read().has(key(id, role))
}

export function markDone(id: string, role: Role) {
  const done = read()
  if (done.has(key(id, role))) return
  done.add(key(id, role))
  write(done)
}

// How many of a chapter's variants (two per conversation) are done.
export function doneCount(chapter: string): number {
  const done = read()
  let n = 0
  for (const r of ROLEPLAYS_BY_CHAPTER[chapter] ?? []) {
    if (done.has(key(r.id, 'parent'))) n++
    if (done.has(key(r.id, 'child'))) n++
  }
  return n
}

// Forget a chapter's records: a new round.
export function clearChapter(chapter: string) {
  const done = read()
  for (const r of ROLEPLAYS_BY_CHAPTER[chapter] ?? []) {
    done.delete(key(r.id, 'parent'))
    done.delete(key(r.id, 'child'))
  }
  write(done)
}

// All 2N variants of a chapter in play order: every conversation once (roles
// alternating, parent first), then each again in the other role.
export function chapterVariants(chapter: string): Variant[] {
  const rps = ROLEPLAYS_BY_CHAPTER[chapter] ?? []
  const first = rps.map((r, i): Variant => ({ id: r.id, you: i % 2 === 0 ? 'parent' : 'child' }))
  const second = first.map((v): Variant => ({ id: v.id, you: v.you === 'parent' ? 'child' : 'parent' }))
  return [...first, ...second]
}

// What a chapter session plays: the variants not done yet. When all are done,
// the chapter's records are cleared and the full list starts a new round.
// `total` is the number of variants in the chapter; `base` how many are
// already done as the session opens.
export function chapterPlaylist(chapter: string): { list: Variant[]; total: number; base: number } {
  const all = chapterVariants(chapter)
  const done = read()
  let list = all.filter((v) => !done.has(key(v.id, v.you)))
  if (!list.length) {
    clearChapter(chapter)
    list = all
  }
  return { list, total: all.length, base: all.length - list.length }
}

// Variants not done yet among the given conversations (all of them if every
// one is done).
export function undoneVariants(ids: string[]): Variant[] {
  const done = read()
  const all = ids.flatMap((id): Variant[] => [
    { id, you: 'parent' },
    { id, you: 'child' },
  ])
  const left = all.filter((v) => !done.has(key(v.id, v.you)))
  return left.length ? left : all
}
