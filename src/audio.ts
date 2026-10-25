// Speaking Odia aloud: recorded clips in public/audio, looked up by the
// phrase's Odia script, plus the mute setting (kept in localStorage).
//
// Clips are recorded with ElevenLabs (voice "Barsha", an Odia voice) from the
// script in data/script.ts. A phrase with no clip is simply silent.

import { toScript } from './data/script'

// Odia script → clip file in public/audio.
const CLIPS: Record<string, string> = {
  'ମୁଁ ଅଛି': 'mu-achi.mp3',
  'ତମେ ଅଛ': 'tame-acha.mp3',
  'ଆପଣ ଅଛନ୍ତି': 'apana-achanti.mp3',
  'ଆମେ ଅଛୁ': 'ame-achu.mp3',
  'ମୁଁ ଘରେ ଅଛି': 'mu-ghare-achi.mp3',
  'ଆପଣ ଘରେ ଅଛନ୍ତି': 'apana-ghare-achanti.mp3',
  'ସେ ଅଛନ୍ତି': 'se-achanti.mp3',
  'ସେମାନେ ଅଛନ୍ତି': 'semane-achanti.mp3',
  'ସେମାନେ ଘରେ ଅଛନ୍ତି': 'semane-ghare-achanti.mp3',
  'ସେ ଘରେ ଅଛି': 'se-ghare-achi.mp3',
  'ଆମେ ଘରେ ଅଛୁ': 'ame-ghare-achu.mp3',
  'ତମେ ଘରେ ଅଛ': 'tame-ghare-acha.mp3',
  'ରାହୁଲ ଘରେ ଅଛି': 'rahul-ghare-achi.mp3',
  'ରବି ଘରେ ଅଛି': 'rabi-ghare-achi.mp3',
  'ମିତୁ ଘରେ ଅଛି': 'mitu-ghare-achi.mp3',
}

const MUTED_KEY = 'odia:muted'

// Audio is on by default; muting stops the automatic playback.
export function getMuted(): boolean {
  return localStorage.getItem(MUTED_KEY) === 'true'
}

export function setMuted(value: boolean): void {
  localStorage.setItem(MUTED_KEY, String(value))
  if (value) stopSpeaking()
}

function clipFor(phonetic: string | undefined): string | undefined {
  const script = phonetic && toScript(phonetic)
  return script ? CLIPS[script] : undefined
}

export function canSpeak(phonetic: string | undefined): boolean {
  return !!clipFor(phonetic)
}

// One shared element: iOS only lets an element play without a tap once it has
// played from a tap, so the first tap anywhere unlocks it for good.
let player: HTMLAudioElement | null = null
function getPlayer(): HTMLAudioElement {
  if (!player) {
    player = new Audio()
    const unlock = () => {
      document.removeEventListener('pointerdown', unlock, true)
      if (player && !player.src) {
        player.src = SILENCE
        void player.play().catch(() => {})
      }
    }
    document.addEventListener('pointerdown', unlock, true)
  }
  return player
}
// A tiny silent WAV, for the unlock.
const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='

// Bumped on every speak/stop, so a clip that finishes loading after the learner
// has moved on doesn't play over the next step.
let generation = 0

// Say a phrase. Automatic playback respects mute; a tap on a speaker button
// passes `force`, since that's the learner asking to hear it.
export function speak(phonetic: string | undefined, force = false): void {
  stopSpeaking()
  const file = clipFor(phonetic)
  if (!file || (getMuted() && !force)) return
  const mine = generation
  // Fetched rather than streamed, so the service worker's cached copy works
  // offline (Safari's range requests don't mix well with cached responses).
  void fetch(`${import.meta.env.BASE_URL}audio/${file}`)
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(res.statusText))))
    .then((blob) => {
      if (mine !== generation) return
      const el = getPlayer()
      if (el.src.startsWith('blob:')) URL.revokeObjectURL(el.src)
      el.src = URL.createObjectURL(blob)
      return el.play()
    })
    .catch(() => {
      // offline with no cached copy, or playback blocked — stay silent
    })
}

export function stopSpeaking(): void {
  generation++
  if (player && !player.paused) player.pause()
}

// Create the player (and its unlock listener) before the first lesson opens.
export function primeAudio(): void {
  getPlayer()
}
