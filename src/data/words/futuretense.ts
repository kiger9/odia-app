// Odia script for the words of the Future Tense chapter (see ../script.ts).
//
// Future = stem + -bi (I) · -bå (you informal, he/she) · -be (you respectful,
// they) · -bu (we), written the same way for every verb. The book's final "å"
// is the inherent vowel, so -bå is ବ (never ବା). Most plain future forms
// (asibi, khaibå, kåribe, ...) were added to the other chapter files by their
// lanes in the same spelling; only the forms missing there are listed here.
// "-ki" forms are the verb plus a separate କି.

export const FUTURETENSE: Record<string, string> = {
  // -ki questions (informal/he-she -bå, respectful -be)
  'asibå-ki': 'ଆସିବ କି',
  'asibe-ki': 'ଆସିବେ କି',
  'khaibe-ki': 'ଖାଇବେ କି',
  'dekhibå-ki': 'ଦେଖିବ କି',
  'dekhibe-ki': 'ଦେଖିବେ କି',
  'kåribå-ki': 'କରିବ କି',
  'kåribe-ki': 'କରିବେ କି',
  'jibå-ki': 'ଯିବ କି',
  'jibe-ki': 'ଯିବେ କି',
  'khelibe-ki': 'ଖେଳିବେ କି',
  'pibå-ki': 'ପିଇବ କି',
  'pibe-ki': 'ପିଇବେ କି',
  'soibå-ki': 'ଶୋଇବ କି',
  'soibe-ki': 'ଶୋଇବେ କି',
  'anibå-ki': 'ଆଣିବ କି',
  'råhibe-ki': 'ରହିବେ କି',

  // go
  jibi: 'ଯିବି',
  // play
  khelibi: 'ଖେଳିବି',
  khelibu: 'ଖେଳିବୁ',
  // drink (the book's single "i" is the long ପିଇ- of ପିଇଲି, ପିଇବା)
  pibi: 'ପିଇବି',
  pibå: 'ପିଇବ',
  pibe: 'ପିଇବେ',
  pibu: 'ପିଇବୁ',
  // sleep
  soibi: 'ଶୋଇବି',
  soibu: 'ଶୋଇବୁ',
  // bring
  anibi: 'ଆଣିବି',
  // stay
  råhibu: 'ରହିବୁ',

  // Other tenses in these lessons' practice (contrast sentences)
  kårilå: 'କରିଲ', // did (you informal)
  dekhilå: 'ଦେଖିଲ', // saw (you informal)
  kheluthili: 'ଖେଳୁଥିଲି', // was playing

  // Places and things
  bajår: 'ବଜାର', // market
  bågicha: 'ବଗିଚା', // garden
}
