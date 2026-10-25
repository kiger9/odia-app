# Speaking practice: hear the learner answer, and mark it

A plan for letting the app (installed from Safari on an iPhone) listen to the
learner say an answer in Odia and tell them whether it was right. Written to be
handed to other sessions: each phase below is a self-contained brief with the
files it touches, the contract it must honour and the check that says it is done.

Status: plan only. Nothing in the app has changed yet. Findings in §2 come from
real calls made on 2026-10-25 against the ElevenLabs account the app already
records its clips with.

---

## 1. The decision, in short

**Record on the phone, transcribe in the cloud with ElevenLabs Scribe behind a
small Cloudflare Worker, and judge the answer in the app by comparing the
transcript word by word with the Odia script the app already has for every
answer.**

Why this and not the alternatives:

| Option | Verdict | Reason |
| --- | --- | --- |
| Safari's built-in `SpeechRecognition` (Web Speech API) | No | It uses Siri's recognizer, whose language list has no Odia, so there is nothing to tune. |
| An on-device model in the browser (Whisper in WebAssembly and the like) | Not now | Odia is one of Whisper's weakest languages, the model download is tens of MB, and iOS Safari's memory limits make it fragile. Revisit only if the cloud route proves unworkable. |
| Call ElevenLabs straight from the phone | No | The site is static on GitHub Pages; the API key would ship to every phone. |
| **ElevenLabs Scribe via a Worker** | **Yes** | Scribe knows Odia (language code `ori`), the account and billing already exist, the Worker keeps the key server-side, and Scribe accepts `keyterms`, which fixed every misread in testing (§2). |
| Another cloud recognizer (Google `or-IN`, Azure `or-IN`) | Fallback | Both list Odia. Keep as plan B if real-voice accuracy disappoints; the Worker boundary means swapping vendors touches one file. |

The app's own facts that make this cheap:

- Every phrase an exercise can ask already has Odia script (`toScript` in
  `src/data/script.ts`) and a recording, enforced by `npm run -s audio:todo -- --check all`
  in the deploy. So the *expected* answer in script is always available, and the
  "Hear answer" button works for speaking steps with no new audio.
- Typed answers are already graded tolerantly (`answerMatches` in `src/lib/normalize.ts`),
  and every `type` step carries `ans` plus `alts`. A speaking step is a `type`
  step answered by voice.
- The app already talks to a Cloudflare Worker (`REMINDER_SERVER` in
  `src/notifications.ts`, used for reminders and backup). The pattern for a
  best-effort server call is established.

---

## 2. What was measured (so later sessions don't repeat it)

All calls: `POST https://api.elevenlabs.io/v1/speech-to-text`, multipart, header
`xi-api-key`. Input: the app's own clips in `public/audio/` (voice Barsha, so a
clear, consistent speaker, **not** a learner). Raw results are in
`docs/speaking-practice/stt-sample.json` (60 random clips, every configuration).

| Configuration | Exact match with the clip's script | Came back in another script (Bengali, Gujarati, Devanagari, Latin…) | Odia but misspelt |
| --- | --- | --- | --- |
| `scribe_v1`, `language_code=ori` | 39 / 60 | 10 | 11 |
| `scribe_v2`, language auto-detected | 29 / 60 | 22 | 9 |
| `scribe_v1`, `ori`, **with `keyterms`** | **60 / 60** | 0 | 0 |
| `scribe_v2`, auto, with `keyterms` | 60 / 60 | 0 | 0 |
| `scribe_v2`, `ori`, with `keyterms` | 60 / 60 | 0 | 0 |

Other facts established:

- The language code is `ori` (`ory` is rejected with a list of valid codes).
- `keyterms` is a repeated multipart field (`-F keyterms=ତମେ -F keyterms=ଘରେ …`),
  accepted by both models. In the 60-clip run it was the clip's own words plus
  seven fixed decoys (ମୁଁ ତମେ ଆପଣ ଅଛି ଅଛନ୍ତି ଘରେ ନାହିଁ).
- **Keyterms do not force the answer.** Four clips were sent with keyterms for a
  *different* sentence (e.g. the clip "ଆମେ ଘରେ ଅଛୁ" with keyterms ତମେ ଘରେ ଅଛ):
  all four came back as what was actually said. This is the property the
  grading depends on, and it must be re-checked with a real voice in Phase 0.
- Script-hopping is the dominant failure without keyterms: the sounds are right
  but written in Bengali (ତମେ ଘରେ ଅଛ → તમે ઘરે છો). Single words are worst
  (ନୂଆ → "Nuwa", ଖୀର → "Keto").
- Without keyterms, `scribe_v2` with `language_code=ori` once returned Chinese
  characters for a clean clip. Pin `scribe_v1` + `ori` + keyterms to start.
- An AAC-in-MP4 file (what iOS Safari's `MediaRecorder` produces) transcribed
  exactly. A 16 kHz copy with pink noise mixed in also transcribed exactly.
- Latency was 0.6 to 1.0 s per 1 to 3 s clip from this sandbox, so expect
  roughly 1.5 to 3 s on a phone including upload.
- The response has `text`, `language_code`, `language_probability` and `words`
  (each with `text`, `start`, `end`, `logprob`, `type` of `word` or `spacing`).
- Cost: about 260 Scribe calls (roughly six minutes of audio) used 135 credits
  on the Creator plan (300,000 per month). A learner doing 30 spoken answers a
  day is about 1,000 credits a month.

What is **not** known yet, and what Phase 0 exists to find out: accuracy on a
learner's voice (non-native, phone mic, room noise), and whether iOS reliably
gives us a recording in a home-screen web app.

---

## 3. Shared contracts

Every session works against these. Change them here first if they must change.

### 3.1 Worker API

```
POST {SPEECH_SERVER}/transcribe
Content-Type: multipart/form-data
  file       audio/mp4 | audio/webm | audio/wav | audio/mpeg, at most 1.5 MB
  keyterms   JSON array of strings, at most 40 entries, each at most 40 chars
  (optional) hint  free text for logs only, e.g. the step's sig; never sent to ElevenLabs

200  { "text": "ଆମେ ଘରେ ଅଛୁ",
       "words": [ { "text": "ଆମେ", "start": 0.10, "end": 0.38, "logprob": -0.01 }, … ],   // spacing entries dropped
       "language": "ori", "languageProbability": 1.0, "ms": 812 }
400  bad multipart / keyterms not a JSON array
413  file too large
415  unsupported content type
429  rate limited (per IP and a daily total)          body: { "retryAfter": seconds }
502  ElevenLabs failed or timed out                   body: { "upstream": status }
```

- CORS: allow origin `https://kiger9.github.io` and `http://localhost:5173`
  (Vite dev). Answer `OPTIONS` preflights. Reject other origins with 403.
- The Worker adds `model_id=scribe_v1`, `language_code=ori`, forwards the
  file and keyterms, and nothing else. It stores no audio and no transcript.
- Budget guard: a daily counter (KV or Durable Object) of seconds of audio
  forwarded; over the cap, answer 429 with `retryAfter` until midnight UTC.
  Default cap: 3 hours a day.

### 3.2 Client result model (`src/speech/`)

```ts
export type HeardResult =
  | { status: 'heard'; text: string; words: HeardWord[] }        // Odia came back
  | { status: 'unclear' }      // empty, too short, or no Odia characters in the text
  | { status: 'denied' }       // microphone permission refused
  | { status: 'unavailable' }  // offline, worker error, rate limited, timeout

export type Verdict =
  | { ok: true; heard: string; matched: boolean[] }                // one flag per expected word
  | { ok: false; heard: string; matched: boolean[]; phonetic?: string } // phonetic = heard words mapped back to the book's spelling where known
```

### 3.3 The speaking step

No new data. A `speak` step is a `type` step presented for voice:

```ts
// in PStep (src/gen/exercises.ts)
t: 'speak'   // q: 'Say in Odia: “We are at home”', ans: 'Ame ghåre åchu', alts: […]
```

Speak steps are made at runtime from `type` steps (and from `assemble` steps
that build Odia, using `ans.join(' ')` and `orders`), inside `lessonRun` and
`buildQuiz`, only when speaking is enabled. So:

- `src/data/practice-bank.json` does not change and need not be rebuilt.
- `scripts/phrases.ts`, `audio:todo` and `check:content` keep working unchanged,
  because the phrases a speak step can show or say are the same as its source
  step's. (`spoken.ts`'s `answerOdia` must return `ans` for `speak` as it does
  for `type`.)
- No new audio is needed. **CLAUDE.md's rule still applies: if any session adds
  or changes lesson text, it records the audio in the same commit.** This plan
  adds none.
- Every speak step can be turned back into its `type` step on the spot ("Type
  instead"), so a learner is never stuck.

### 3.4 Grading rules (`src/speech/match.ts`)

Input: `heard` (script from the Worker), `expected` (the step's `ans`, plus
`alts` and accepted `orders`), `drilled` (index of the word the step is about,
when known; see below).

1. Expected script for each accepted answer = `toScript(answer)`; split on spaces.
   Note `åchi-ki` becomes two script words (`ଅଛି କି`). Strip `?`, `।`, `,`, `·`.
2. Fold both sides, per word: NFC; drop the anusvara and candrabindu (ଂ, ଁ);
   long vowels to short (ୀ→ି, ୂ→ୁ, ଈ→ଇ, ଊ→ଉ); ଯ→ୟ; ୱ→ବ. **Do not** fold anything
   that distinguishes person endings (ି vs ୁ vs ∅ vs ନ୍ତି) or ଛ from ଚ beyond
   the explicit list: those differences are what the lessons teach.
3. A word matches if equal after folding, or if its length is at least 4 and the
   Levenshtein distance is 1, **except** the drilled word, which must be equal.
   The drilled word is: the cloze/ending answer when the source sentence had
   one (`Sentence.key`), else none.
4. The answer is correct if some accepted answer matches word for word, same
   count, same order. Otherwise `ok: false`, with the per-word flags from the
   best-scoring accepted answer so the UI can show which words were off.
5. If `heard` has no Odia characters (U+0B00 to U+0B7F) the result is
   `unclear`, never `incorrect`: a script-hop is our failure, not the learner's.
6. Phonetic read-back: reverse `WORDS` (script to the book's spelling, first
   spelling wins) to show what was heard in the spelling the learner knows;
   words not in the map are shown in script only.

Fixtures for this live in `docs/speaking-practice/stt-sample.json`: every
`scribe_v1_ori` and `scribe_v2_auto` value that is still Odia (the "misspelt"
rows) is a useful borderline case; decide and record the intended verdict for
each in the check script (§4, Phase B).

### 3.5 Keyterms for a step

`keytermsFor(step)`: the script words of every accepted answer, plus the
script words of the step's distractors (`dist` for assemble, the other `opts`
for choice or cloze sources, `wrong` siblings when the step came from the
generator and carries them), plus the fixed decoy set
(ମୁଁ ତମେ ଆପଣ ସେ ଆମେ ସେମାନେ ଅଛି ଅଛ ଅଛନ୍ତି ଅଛୁ ନାହିଁ ନାହାନ୍ତି ଘରେ). Deduplicate,
cap at 40. The decoys matter: they give a wrong answer somewhere to land, which
is what keeps keyterms from forcing the right one.

### 3.6 Settings and storage

- `localStorage` key `odia:speaking` with values `on`, `off`, `unset`
  (default `unset`: the first speak step offers it, with a one-time note that
  the recording is sent to ElevenLabs to be transcribed and not kept).
- `SPEECH_SERVER` constant in `src/speech/server.ts`, like `REMINDER_SERVER`.
- Nothing new in IndexedDB. A speak step reports `onResult(correct)` exactly as
  a type step does, so streaks, quiz scores and reviews need no change.

---

## 4. Phases, as hand-off briefs

Phases A, B and C are independent and can run in parallel. D needs B and C.
E needs everything. Phase 0 can run first or alongside A to C, but **D must not
ship to `main` until Phase 0 has passed on a real iPhone.**

### Phase 0: device spike (needs a person with an iPhone)

Goal: prove that an iPhone, in Safari and as a home-screen app, can record a
few seconds of speech and that Scribe grades a real learner's voice well enough.

Deliverable: a hidden page in the app at hash route `#mic-test` (not linked
from the UI), plus a short written result appended to this file under §6.

Steps:
1. Build `src/components/MicTest.tsx`: a button that requests the microphone,
   records 3 s with `MediaRecorder`, shows `MediaRecorder.isTypeSupported`
   results for `audio/mp4`, `audio/webm`, `audio/webm;codecs=opus`, the blob's
   `type` and size, plays the recording back, then posts it to the Worker (or,
   before the Worker exists, lets you download the blob to transcribe by hand
   with the curl in §2) and shows the transcript and round-trip time.
2. Route it from `src/App.tsx` when `location.hash === '#mic-test'`.
3. Test matrix, on a real iPhone, recent iOS:
   - Safari tab, and installed to the home screen (standalone). Both must work.
   - Microphone permission: first use, after denial (Settings > Safari >
     Microphone, or per-site), and after the app is relaunched. Record what
     prompts appear each time.
   - Say five answers from lesson `be` correctly and five wrongly (a different
     person ending). Note transcripts. The matcher must get at least 9 of 10.
   - With wired and Bluetooth earphones; in a quiet room and with a TV on.
   - Phone in Low Power Mode; app returning from background mid-recording.
4. If `MediaRecorder` is missing or produces an empty blob in standalone mode,
   implement the fallback now: capture PCM through an `AudioWorkletNode`
   (or `ScriptProcessorNode` where the worklet is unavailable), downsample to
   16 kHz mono, and encode a WAV in the browser (about 32 KB per second). Scribe
   accepts WAV.

Known iOS behaviour to design around (verify, do not assume):
- `getUserMedia` needs a secure context (GitHub Pages is fine) and must be
  called from a user gesture. Create the `MediaRecorder` in that same gesture.
- Standalone web apps prompt for the microphone again on each launch.
- iOS produces `audio/mp4` (AAC). `audio/webm` is not supported.
- Stop every track on the stream after recording, or the red recording
  indicator stays on and later playback may be routed oddly.
- Opening the microphone changes the audio session: stop any clip that is
  playing (`stopSpeaking()` in `src/audio.ts`) before recording, and expect the
  first clip after recording to play quieter until the session settles.
- Bluetooth headsets switch to the low-quality hands-free profile while the
  microphone is open; transcription may suffer. Report, do not fix.

Done when: §6 of this file has the filled-in matrix, and the fallback recorder
exists if it was needed.

### Phase A: the Worker

Goal: `POST /transcribe` as in §3.1, deployed, with the key kept server-side.

Deliverable: `worker/speech/` in this repo (`wrangler.toml`, `src/index.ts`,
`README.md`), plus `SPEECH_SERVER` wired in `src/speech/server.ts`.

Decision taken here: a **new** Worker rather than adding a route to the
reminder Worker. Its source is not in this repository and its host is not
reachable from cloud sessions, so no session can test changes to it. If the
owner prefers one Worker, port the finished route across later.

Steps:
1. Scaffold with Wrangler (TypeScript, no framework). Secret
   `ELEVENLABS_API_KEY` via `wrangler secret put`; vars `ALLOWED_ORIGINS`,
   `DAILY_SECONDS_CAP`, `MAX_BYTES`.
2. Implement §3.1 exactly. Forward the file as received (do not transcode).
   Build the ElevenLabs request with `FormData`; repeat `keyterms` once per
   term. Time out the upstream call at 15 s.
3. Rate limit: per client IP, 20 requests a minute, with a KV counter or the
   Workers rate-limiting binding. Daily seconds cap as in §3.1; estimate
   duration from the Scribe response's last word `end`, falling back to bytes
   divided by 8,000.
4. Tests: `worker/speech/test/` with Vitest and `@cloudflare/vitest-pool-workers`
   or plain `unstable_dev`, mocking `fetch` to ElevenLabs. Cover: happy path,
   oversize file, wrong origin, keyterms over the cap, upstream 500 and
   timeout, daily cap reached.
5. Manual check from the sandbox or a laptop: `curl -F file=@public/audio/mu-achi.mp3 -F 'keyterms=["ମୁଁ","ଅଛି"]' $SPEECH_SERVER/transcribe` returns `ମୁଁ ଅଛି`.
6. Deployment needs the owner's Cloudflare account. If the session cannot
   deploy, it stops with `wrangler deploy` documented in the README and tells
   the owner the exact commands; it does not commit a key anywhere.

Done when: the curl above works against the deployed URL, `SPEECH_SERVER`
points at it, and `npm run lint` and `npm run build` are clean.

### Phase B: the matcher and its check

Goal: `src/speech/match.ts` implementing §3.4 and §3.5, with a check script in
the repo's existing style.

Deliverable: `src/speech/match.ts`, `src/speech/keyterms.ts`,
`scripts/check-speech.ts`, and a `check:speech` entry in `package.json`
(rolldown + node, like `check:content`).

Steps:
1. `foldScript(word)`, `expectedWords(step)` (all accepted answers, via
   `toScript`), `grade(heard, step): Verdict`, `phoneticOf(scriptWord)`
   (reverse of `WORDS`), `keytermsFor(step)`.
2. `scripts/check-speech.ts`: a table of `(expected phonetic, heard script,
   want: ok | wrong | unclear)`. Seed it with: every row of
   `docs/speaking-practice/stt-sample.json` where the plain `scribe_v1_ori`
   text differs from `expected` (decide each verdict by hand and write it
   down; e.g. ଖାଉଛୁ heard as ଖାଉଚୁ should pass, ଅଛି heard as ଅଛୁ must fail,
   Bengali text must be `unclear`); the four "wrong answer" pairs from §2; and
   person-ending confusions for every pronoun taught in lesson `be`.
3. The script also asserts that `keytermsFor` of every step in
   `practice-bank.json` stays within 40 terms and includes every expected word.
4. Add `npm run check:speech` to the deploy workflow next to `audio:todo`.

Done when: `npm run check:speech` passes, `lint` and `build` are clean, and the
case table has at least 40 rows with a one-line reason for each non-obvious verdict.

### Phase C: recording in the browser

Goal: a hook that records one answer and returns a blob, robust on iOS.

Deliverable: `src/speech/recorder.ts` (`useRecorder()` hook and a plain
`recordOnce()` for the spike page), `src/speech/transcribe.ts` (POST to the
Worker, returns `HeardResult`), and the `#mic-test` page from Phase 0 using them.

Steps:
1. `useRecorder()` state machine: `idle → asking → recording → encoding → done | error`.
   Start on tap; stop on second tap, on silence of 1.2 s after speech began
   (use an `AnalyserNode` RMS threshold), or at 8 s. Expose `elapsed` for a
   level meter.
2. Call `stopSpeaking()` before opening the microphone. Stop all tracks and
   close the `AudioContext` after each recording.
3. Pick the mime type: first supported of `audio/mp4`, `audio/webm;codecs=opus`,
   `audio/webm`; else the WAV fallback from Phase 0 if it was built.
4. `transcribe(blob, keyterms, signal)`: `fetch` with a 12 s timeout; map
   statuses to `HeardResult` as in §3.2; treat a response with no Odia
   characters as `unclear`.
5. Offline: if `!navigator.onLine`, return `unavailable` without recording.

Done when: `#mic-test` works in desktop Chrome and Safari with the deployed
Worker, and the hook has no listeners or tracks left open after a recording
(check the tab's recording indicator and `getTracks()` state).

### Phase D: the speaking step in lessons and quizzes

Goal: learners meet "Say in Odia" steps, graded and read back to them.

Deliverable: `SpeakStep` in `src/components/Steps.tsx`, step conversion in
`src/gen/exercises.ts`, the `odia:speaking` setting in `src/settings.ts` and a
toggle in `src/components/Settings.tsx`.

Steps:
1. `PStep['t']` gains `'speak'`. `answerOdia` in `src/lib/spoken.ts` returns
   `ans` for it. `formatOf` maps it to `'type'` so bank drawing is unaffected.
2. `toSpeakStep(step)`: from a `type` step, or an `assemble` step with no `dir`
   (`ans.join(' ')`, `alts` from `orders`), rewriting the question's leading
   "Type in Odia:" or "Build in Odia:" to "Say in Odia:". Only when
   `canSpeak(ans)` is true (it always is for bank content).
3. In `lessonRun` and `buildQuiz`, after the steps are chosen and only when
   speaking is `on`: convert eligible fresh-practice steps with probability
   0.5, at most two per lesson run and three per quiz. Curated lesson steps
   stay as written. Use the run's `rng` so the result is reproducible.
4. `SpeakStep`: question text; the mic button (big, centred; label "Tap and
   speak", then "Listening…" with the level meter, then "Checking…"); below it,
   "Type instead" which swaps in `TypeStep` with the same step data. On a
   result: reuse `Feedback`, with `say={answerOdia(step)}` so "Hear answer"
   works, and a new line "You said: ଆମେ ଘରେ ଅଛୁ · Ame ghåre åchu" with words
   that missed underlined. `unclear` or `unavailable` show "Couldn't hear that.
   Try again or type it" and do not call `onResult` until the learner answers
   one way or the other. `denied` switches to the type step and remembers
   `odia:speaking = off` with a note in Settings on how to re-enable.
5. First speak step when the setting is `unset`: a small sheet, "Practise
   speaking? Your recording is sent to ElevenLabs to be transcribed and isn't
   kept. You can turn this off in Settings." with "Yes" and "Not now".
6. Settings: "Speaking exercises" toggle; under it the microphone permission
   state (`navigator.permissions.query({ name: 'microphone' })` where
   supported) phrased like the reminder status lines.
7. Styling in `src/App.css` following the existing `.btn-primary`, `.opt`,
   `.feedback` conventions; the mic button must be at least 64 px and usable
   one-handed.

Done when: a lesson with a bank (`be`, `howru`, `have`) shows speak steps on a
desktop browser with the Worker deployed, `npm run check:content`,
`npm run -s audio:todo -- --check all`, `npm run check:speech`, `lint` and
`build` all pass, and the type fallback works offline (toggle the network in
devtools).

### Phase E: device QA and rollout

1. Repeat the Phase 0 matrix on the real feature. Two learners if possible, one
   a non-native speaker.
2. Confirm the Worker's daily counter moves and that 429 shows the "type
   instead" path, not an error.
3. Ship behind the setting defaulting to `unset` (opt-in prompt). Watch
   ElevenLabs usage for a week. If keyterms ever appear to force a wrong
   answer to right on a real voice, lower the per-word tolerance in §3.4 to
   exact-only before touching anything else.
4. Remove `#mic-test` or leave it undocumented; owner's call.

---

## 5. Open points for the owner

1. **Cloudflare access.** Phase A needs an account to deploy to. Either run
   `wrangler deploy` yourself from the README, or give a session the
   credentials as environment secrets.
2. **One Worker or two.** This plan makes a new one so its source is in the
   repo. Say so if you'd rather extend the reminder Worker.
3. **Consent copy** in Phase D step 5. Edit it if you want different wording.
4. **How often.** Phase D step 3 proposes up to two speak steps per lesson run
   and three per quiz. Adjust.

---

## 6. Phase 0 results

_To be filled in by the device spike. Record iOS version, Safari vs standalone,
each row of the matrix, the blob mime type and size, and the ten transcripts._
