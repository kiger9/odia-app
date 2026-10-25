// Odia script for the book's phonetic spellings, word by word — so any phrase
// built from these words, curated or generated, can be shown in script and
// spoken aloud. A phrase converts only if every one of its words is listed;
// anything else stays phonetic-only (and silent).
//
// DRAFT: written without a workbook to copy from. Have an Odia speaker check it.
// Where the spoken form the book teaches differs from formal spelling, the
// spoken form wins, since this is also what the audio is recorded from:
// Tåme → ତମେ (formal: ତୁମେ); likewise tåmårå → ତମର (formal: ତୁମର) and
// gote → ଗୋଟେ (formal: ଗୋଟିଏ).

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
  // Lesson 2 — How Are You? (kemiti, bhålå, nahi)
  kemiti: 'କେମିତି',
  bhålå: 'ଭଲ',
  båhut: 'ବହୁତ',
  nahi: 'ନାହିଁ',
  nahanti: 'ନାହାନ୍ତି',
  ebe: 'ଏବେ',
  tike: 'ଟିକେ',
  // Lesson 3 — I Have (morå, tarå, åchi-ki)
  morå: 'ମୋର',
  tåmårå: 'ତମର',
  tarå: 'ତାର',
  apånånkårå: 'ଆପଣଙ୍କର',
  mopakhåre: 'ମୋ ପାଖରେ',
  gote: 'ଗୋଟେ',
  båhi: 'ବହି',
  ghårå: 'ଘର',
  gadi: 'ଗାଡ଼ି',
  gai: 'ଗାଈ',
  pen: 'ପେନ୍',
  'åchi-ki': 'ଅଛି କି',
  åchiki: 'ଅଛି କି', // written without the hyphen in one lesson card
  hå: 'ହଁ',
  na: 'ନା',
  // names the practice generator uses in lesson 1
  rahul: 'ରାହୁଲ',
  mitu: 'ମିତୁ',
  rabi: 'ରବି',
}

export function toScript(phonetic: string): string | undefined {
  const out: string[] = []
  for (const word of phonetic.trim().split(/\s+/)) {
    if (word === '·') {
      out.push('·') // "Morå · Tåmårå · Tarå": several words on one card
      continue
    }
    const key = word.toLowerCase().replace(/[?!.,;:“”"]/g, '')
    if (!key) continue // a stray "?" written apart from its sentence
    const script = WORDS[key]
    if (!script) return undefined
    out.push(script + (word.endsWith(',') ? ',' : '')) // keep the pause in "Na, …"
  }
  if (!out.length) return undefined
  return out.join(' ') + (/\?\s*$/.test(phonetic) ? '?' : '')
}
