# Odia in Small Bites

React + TypeScript + Vite app that teaches spoken Odia in the book's phonetic spelling.

## Lesson content conventions

- **The yes/no question particle is always hyphenated:** `åchi-ki`, `jauchå-ki`, never `åchiki` or `åchi ki`. This applies to everything a learner sees: lesson text, notes, generated practice, the practice bank. Questions end with `?`.
- Typed answers are compared ignoring case, accents, spaces and hyphens (`src/lib/normalize.ts`), so a learner who types `achiki` is still marked correct. Keep it that way.
- Audio is looked up by Odia script (`src/data/script.ts` → `src/data/clips.ts`). A phrase whose last word is a `-ki` form speaks as a question even without `?`, so it plays the question recording.
- Practice for lessons with a bank comes from `src/data/practice-bank.json`; rebuild it after changing generated sentences: `npm run practice:bank -- be howru have`.

## Roleplays

- Scripted parent–child conversations live in `src/data/roleplays/<chapter>.ts` (types and rules in `src/data/roleplays.ts`): 4–6 alternating lines. **Every conversation is played in both roles**: the chapter session alternates the learner's role between conversations and flips each one on the next run (per-chapter counter in localStorage, `odia:rp-run:<chapter>`; `withRole` in `roleplays.ts`); the random mode picks any conversation in either role. The app's lines show their meaning only after the learner taps Continue (`Roleplay.tsx`); the learner's own lines show theirs as a prompt.
- A chapter's roleplays unlock when every lesson in it is complete (button at the end of the chapter on Home; the Roleplay button beside Pop Quiz plays a random one from finished chapters). Lines also turn up as questions in Pop Quiz and in end-of-lesson practice once the chapter is complete (`roleplaySteps` in `src/gen/exercises.ts`; lines with a second sentence or a pause are skipped for the build format, long or multi-sentence ones for typing).
- Roleplays are built around their chapter's words and earlier chapters' (`src/data/words/`), but may use words the lessons haven't taught yet where the conversation needs them. Those words must still have Odia script: put them in `src/data/words/roleplays/<chapter>.ts`. `npm run check:roleplays` enforces the word and line rules (`-- --stats` adds a per-chapter table, `-- --new` lists the untaught words). Roleplay lines count as spoken phrases: `audio:todo`/`audio:record` cover them (`roleplays` pseudo lesson, included in `all`), so new lines need clips in the same commit.

## Checks

- `npm run check:content` fails if any lesson step, generated sentence, bank step or roleplay line writes a known word run together with `ki` (e.g. `åchiki`) or writes `ki` as a separate word (`åchå ki?`). Run it after editing `src/data/lessons.ts`, `src/data/roleplays/` or `src/gen/`.
- `npm run -s audio:todo -- <lessons>` (e.g. `be howru have`) lists every phrase those lessons can speak with its script and clip; the last line should read `0 need script · 0 need recording`.
- `npm run -s audio:todo -- --check all` fails if any phrase the app can speak has no script, no clip, or a clip file missing from `public/audio/` (entries left without script on purpose are listed in `NO_SCRIPT_OK` in `scripts/audio-todo.ts`). The deploy workflow runs it before building, so a lesson change without its audio won't deploy.
- `npm run lint` and `npm run build` should stay clean.

## Recording audio

- **Any change to what the app says needs its audio in the same commit.** After editing `src/data/lessons.ts`, `src/data/words/`, `src/data/dictionary.ts`, `src/data/roleplays/` or `src/gen/` (and rebuilding the practice bank if needed): give new phrases Odia script, run `npm run audio:record -- --dry-run all`, then `npm run audio:record -- all`, confirm `npm run -s audio:todo -- --check all` passes, and commit `src/data/clips.ts` and `public/audio/` with the change. Report the clips recorded and credits used. If recording isn't possible here (no `ELEVENLABS_API_KEY`, `api.elevenlabs.io` blocked, quota reached), say so plainly instead of committing silent phrases; the deploy would fail anyway.
- Clips are recorded with ElevenLabs: voice "Barsha" (`Zcdoxp4Mfxbmk4fIwInk`), model `eleven_v4`, one take per phrase, stored as mono 48 kbps mp3 in `public/audio/` and listed in `src/data/clips.ts` (Odia script → file).
- `npm run audio:record -- all` records every phrase that has script but no clip, straight from the ElevenLabs API (needs `ELEVENLABS_API_KEY` and network access to `api.elevenlabs.io`). Try `--dry-run` first (count + credit estimate) and `--limit 5` for a small test. It is safe to stop and rerun; recorded phrases are skipped. It prints the credits used.
- New words go in `src/data/words/<chapter>.ts` (spoken forms where the book teaches them; same spelling in every chapter). Then `npm run -s audio:todo -- all` should end with `0 need script · 0 need recording` apart from entries that aren't Odia.
