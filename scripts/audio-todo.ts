// Lists every Odia phrase the given lessons can speak, with its Odia script
// and recorded clip, so it's clear what still needs transcribing or recording.
//
//   npm run audio:todo -- be howru have        # table (also: dictionary, all)
//   npm run audio:todo -- --json be howru      # machine-readable
//
// See scripts/phrases.ts for what counts as a spoken phrase.

import { spokenRows } from './phrases'

const args = process.argv.slice(2)
const json = args.includes('--json')
const ids = args.filter((a) => !a.startsWith('--'))
if (!ids.length) {
  console.error('usage: npm run audio:todo -- [--json] <lessonId|dictionary|all> …')
  process.exit(1)
}

const rows = spokenRows(ids)
if (json) {
  console.log(JSON.stringify(rows, null, 1))
} else {
  for (const r of rows)
    console.log([r.lesson, r.source, r.phonetic, r.script ?? '— no script', r.clip ?? '— no clip'].join('\t'))
  const noScript = rows.filter((r) => !r.script).length
  const noClip = rows.filter((r) => r.script && !r.clip).length
  console.log(`\n${rows.length} phrases · ${noScript} need script · ${noClip} need recording`)
}
