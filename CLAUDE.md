# Odia in Small Bites

React + TypeScript + Vite app that teaches spoken Odia in the book's phonetic spelling.

## Lesson content conventions

- **The yes/no question particle is always hyphenated:** `åchi-ki`, `jauchå-ki`, never `åchiki` or `åchi ki`. This applies to everything a learner sees: lesson text, notes, generated practice, the practice bank. Questions end with `?`.
- Typed answers are compared ignoring case, accents, spaces and hyphens (`src/lib/normalize.ts`), so a learner who types `achiki` is still marked correct. Keep it that way.
- Audio is looked up by Odia script (`src/data/script.ts` → `src/data/clips.ts`). A phrase whose last word is a `-ki` form speaks as a question even without `?`, so it plays the question recording.
- Practice for lessons with a bank comes from `src/data/practice-bank.json`; rebuild it after changing generated sentences: `npm run practice:bank -- be howru have`.

## Checks

- `npm run check:content` fails if any lesson step, generated sentence or bank step writes a known word run together with `ki` (e.g. `åchiki`) or writes `ki` as a separate word (`åchå ki?`). Run it after editing `src/data/lessons.ts` or `src/gen/`.
- `npm run -s audio:todo -- <lessons>` (e.g. `be howru have`) lists every phrase those lessons can speak with its script and clip; the last line should read `0 need script · 0 need recording`.
- `npm run lint` and `npm run build` should stay clean.

## Recording audio

- Clips are recorded with ElevenLabs: voice "Barsha" (`Zcdoxp4Mfxbmk4fIwInk`), model `eleven_v4`, one take per phrase, stored as mono 48 kbps mp3 in `public/audio/` and listed in `src/data/clips.ts` (Odia script → file).
- `npm run audio:record -- all` records every phrase that has script but no clip, straight from the ElevenLabs API (needs `ELEVENLABS_API_KEY` and network access to `api.elevenlabs.io`). Try `--dry-run` first (count + credit estimate) and `--limit 5` for a small test. It is safe to stop and rerun; recorded phrases are skipped. It prints the credits used.
- New words go in `src/data/words/<chapter>.ts` (spoken forms where the book teaches them; same spelling in every chapter). Then `npm run -s audio:todo -- all` should end with `0 need script · 0 need recording` apart from entries that aren't Odia.
