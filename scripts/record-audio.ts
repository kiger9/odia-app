// Records every phrase that has Odia script but no clip yet, straight from the
// ElevenLabs text-to-speech API, and adds it to the app (public/audio +
// src/data/clips.ts) — the same voice, model and clip format as the rest.
//
//   npm run audio:record -- --dry-run all          # what's missing + credit estimate
//   npm run audio:record -- --limit 5 be howru     # record a few, to try it
//   npm run audio:record -- all                    # record everything missing
//
// Needs ELEVENLABS_API_KEY in the environment and network access to
// api.elevenlabs.io. Options: --concurrency N (default 3), --limit N,
// --model ID (default eleven_v4, or ELEVENLABS_MODEL). One take per phrase.
// Safe to stop and rerun: anything already in clips.ts is skipped.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spokenRows } from './phrases'

const VOICE = 'Zcdoxp4Mfxbmk4fIwInk' // "Barsha", an Odia voice
const API = process.env.ELEVENLABS_API_BASE ?? 'https://api.elevenlabs.io/v1' // override only for testing
const CLIPS_FILE = 'src/data/clips.ts'
const AUDIO_DIR = 'public/audio'

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args.splice(i, 2)[1] : undefined
}
const dryRun = args.includes('--dry-run')
const concurrency = Number(flag('--concurrency') ?? 3)
const limit = Number(flag('--limit') ?? Infinity)
const model = flag('--model') ?? process.env.ELEVENLABS_MODEL ?? 'eleven_v4'
const ids = args.filter((a) => !a.startsWith('--'))
if (!ids.length) {
  console.error('usage: npm run audio:record -- [--dry-run] [--limit N] [--concurrency N] [--model ID] <lessonId|dictionary|all> …')
  process.exit(1)
}

// What the voice reads: a card listing several words is read as a list, and a
// statement ends with the Odia full stop (questions keep their "?").
function promptFor(script: string): string {
  const text = script.replace(/ · /g, ', ')
  return text.endsWith('?') ? text : `${text} ।`
}

// File name from the phonetic spelling: "Tåmårå gote gadi åchi-ki?" →
// tamara-gote-gadi-achi-ki-q.mp3
function slug(phonetic: string): string {
  return phonetic
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ñ/g, 'n')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\?/g, ' q')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const todo = new Map<string, string>() // script → phonetic (first one seen)
for (const r of spokenRows(ids)) if (r.script && !r.clip && !todo.has(r.script)) todo.set(r.script, r.phonetic)
const items = [...todo].slice(0, limit)
const estimate = items.reduce((n, [script]) => n + promptFor(script).length, 0)
console.log(`${todo.size} phrases need recording; this run: ${items.length} (≈ ${estimate} credits)`)
if (dryRun || !items.length) process.exit(0)

const key = process.env.ELEVENLABS_API_KEY
if (!key) {
  console.error('ELEVENLABS_API_KEY is not set')
  process.exit(1)
}

async function charactersUsed(): Promise<number | undefined> {
  const res = await fetch(`${API}/user/subscription`, { headers: { 'xi-api-key': key! } })
  return res.ok ? ((await res.json()) as { character_count: number }).character_count : undefined
}

const tmp = mkdtempSync(join(tmpdir(), 'odia-audio-'))
let clipsSrc = readFileSync(CLIPS_FILE, 'utf8')
const taken = new Set([...clipsSrc.matchAll(/: '([^']+\.mp3)'/g)].map((m) => m[1]))

// Adds one entry to clips.ts right away, so a stopped run keeps what it made.
function addClip(script: string, file: string) {
  const end = clipsSrc.lastIndexOf('}')
  clipsSrc = clipsSrc.slice(0, end) + `  '${script}': '${file}',\n` + clipsSrc.slice(end)
  writeFileSync(CLIPS_FILE, clipsSrc)
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
let fatal = ''

async function record(script: string, phonetic: string): Promise<boolean> {
  for (let attempt = 0; attempt < 6 && !fatal; attempt++) {
    const res = await fetch(`${API}/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': key!, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: promptFor(script), model_id: model }),
    })
    if (res.ok) {
      let name = `${slug(phonetic)}.mp3`
      for (let i = 2; taken.has(name); i++) name = `${slug(phonetic)}-${i}.mp3`
      taken.add(name)
      const raw = join(tmp, `${name}.src`)
      writeFileSync(raw, Buffer.from(await res.arrayBuffer()))
      // mono 48 kbps, leading/trailing silence trimmed — the app's clip format
      execFileSync('ffmpeg', [
        '-nostdin', '-loglevel', 'error', '-y', '-i', raw, '-af',
        'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,' +
          'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.1,areverse',
        '-ac', '1', '-ar', '44100', '-b:a', '48k', join(AUDIO_DIR, name),
      ])
      addClip(script, name)
      return true
    }
    const body = await res.text()
    if (res.status === 429 && !/quota|limit_reached/i.test(body)) {
      // too many at once: wait as told (or back off) and try again
      const wait = Number(res.headers.get('retry-after')) * 1000 || 2000 * 2 ** attempt
      await sleep(Math.min(wait, 60_000))
      continue
    }
    if (res.status === 401 || res.status === 429 || /quota/i.test(body)) fatal = `${res.status} ${body.slice(0, 300)}`
    else console.error(`  failed (${res.status}): ${phonetic} — ${body.slice(0, 200)}`)
    return false
  }
  return false
}

const before = await charactersUsed()
let done = 0
let failed = 0
let next = 0
await Promise.all(
  Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (!fatal && next < items.length) {
      const [script, phonetic] = items[next++]
      if (await record(script, phonetic)) done++
      else failed++
      if ((done + failed) % 25 === 0) console.log(`  ${done + failed}/${items.length} (${failed} failed)`)
    }
  }),
)
const after = await charactersUsed()

console.log(`recorded ${done}, failed ${failed}, not attempted ${items.length - done - failed}`)
if (before !== undefined && after !== undefined) console.log(`credits used: ${after - before}`)
if (fatal) {
  console.error(`stopped: ${fatal}`)
  process.exit(1)
}
