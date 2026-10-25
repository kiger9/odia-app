// Odia script for the book's phonetic spellings, word by word — so any phrase
// built from these words, curated or generated, can be shown in script and
// spoken aloud. A phrase converts only if every one of its words is listed;
// anything else stays phonetic-only (and silent).
//
// DRAFT: written without a workbook to copy from. Have an Odia speaker check it.
// Where the spoken form the book teaches differs from formal spelling, the
// spoken form wins, since this is also what the audio is recorded from:
// Tåme → ତମେ (formal: ତୁମେ).

const WORDS: Record<string, string> = {
  // Lesson 1 — To Be (åchi)
  mu: 'ମୁଁ',
  tåme: 'ତମେ',
  apånå: 'ଆପଣ',
  se: 'ସେ',
  ame: 'ଆମେ',
  semane: 'ସେମାନେ',
  åchi: 'ଅଛି',
  åchå: 'ଅଛ',
  åchånti: 'ଅଛନ୍ତି',
  åchu: 'ଅଛୁ',
  ghåre: 'ଘରେ',
  // names the practice generator uses in lesson 1
  rahul: 'ରାହୁଲ',
  mitu: 'ମିତୁ',
  rabi: 'ରବି',
}

export function toScript(phonetic: string): string | undefined {
  const out: string[] = []
  for (const word of phonetic.trim().split(/\s+/)) {
    const script = WORDS[word.toLowerCase().replace(/[?!.,;:“”"]/g, '')]
    if (!script) return undefined
    out.push(script)
  }
  return out.join(' ') + (/\?\s*$/.test(phonetic) ? '?' : '')
}
