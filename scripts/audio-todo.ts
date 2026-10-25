// Lists every Odia phrase the given lessons can speak, with its Odia script
// and recorded clip, so it's clear what still needs transcribing or recording.
//
//   npm run audio:todo -- be howru have        # table (also: dictionary, all)
//   npm run audio:todo -- --json be howru      # machine-readable
//   npm run audio:todo -- --check all          # fail if anything is missing (CI)
//
// See scripts/phrases.ts for what counts as a spoken phrase.

import { existsSync } from 'node:fs'
import { spokenRows } from './phrases'

const args = process.argv.slice(2)
const json = args.includes('--json')
const check = args.includes('--check')
const ids = args.filter((a) => !a.startsWith('--'))
if (!ids.length) {
  console.error('usage: npm run audio:todo -- [--json|--check] <lessonId|dictionary|all> …')
  process.exit(1)
}

// Entries that are left without script on purpose: they aren't Odia to speak.
const NO_SCRIPT_OK = new Set(['Be (written: bi)'])

const rows = spokenRows(ids)
if (check) {
  const problem = (r: (typeof rows)[number]) =>
    !r.script ? (NO_SCRIPT_OK.has(r.phonetic) ? '' : 'no script')
    : !r.clip ? 'no clip'
    : !existsSync(`public/audio/${r.clip}`) ? `missing file public/audio/${r.clip}`
    : ''
  const bad = rows.filter(problem)
  for (const r of bad) console.log([r.lesson, r.phonetic, r.script ?? '', problem(r)].join('\t'))
  if (bad.length) {
    console.error(`\n${bad.length} phrases can't be played. See CLAUDE.md, "Recording audio".`)
    process.exit(1)
  }
  console.log(`audio ok — ${rows.length} phrases checked, every one with script has a clip`)
} else if (json) {
  console.log(JSON.stringify(rows, null, 1))
} else {
  for (const r of rows)
    console.log([r.lesson, r.source, r.phonetic, r.script ?? '— no script', r.clip ?? '— no clip'].join('\t'))
  const noScript = rows.filter((r) => !r.script).length
  const noClip = rows.filter((r) => r.script && !r.clip).length
  console.log(`\n${rows.length} phrases · ${noScript} need script · ${noClip} need recording`)
}
