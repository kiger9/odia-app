// Odia script for the words of the Past Tense chapter (see ../script.ts).
//
// Person endings, the same on every verb (as the book teaches):
//   -ili ଇଲି (I) · -ilå ଇଲ (you, informal) · -ila ଇଲା (he/she)
//   -ilu ଇଲୁ (we) · -ile ଇଲେ (you respectful / they)
// "was ...-ing" is the root + -uthili ଉଥିଲି, "had ...-ed" the root + -ithili ଇଥିଲି,
// with the same five endings. Verbs in other chapters' files (kårili, soila,
// dekhilå ...) are not repeated here.

export const PASTTENSE: Record<string, string> = {
  // Lesson: Past — I (-ili) and the other persons
  // asiba (come)
  asili: 'ଆସିଲି',
  asilå: 'ଆସିଲ',
  asila: 'ଆସିଲା',
  asilu: 'ଆସିଲୁ',
  asile: 'ଆସିଲେ',
  // khaiba (eat)
  khaili: 'ଖାଇଲି',
  khailå: 'ଖାଇଲ',
  khaila: 'ଖାଇଲା',
  khailu: 'ଖାଇଲୁ',
  khaile: 'ଖାଇଲେ',
  // dekhiba (see)
  dekhili: 'ଦେଖିଲି',
  dekhila: 'ଦେଖିଲା',
  dekhilu: 'ଦେଖିଲୁ',
  dekhile: 'ଦେଖିଲେ',
  // kariba (do) — kårili, kårilå, kårila are in futuretense.ts
  kårile: 'କରିଲେ',
  kårilu: 'କରିଲୁ',
  // jiba (go) — irregular past gål-: "not jili but gåli"
  gåli: 'ଗଲି',
  gålå: 'ଗଲ',
  gåla: 'ଗଲା',
  gålu: 'ଗଲୁ',
  gåle: 'ଗଲେ',
  // kheliba (play)
  khelili: 'ଖେଳିଲି',
  khelilå: 'ଖେଳିଲ',
  khelila: 'ଖେଳିଲା',
  khelilu: 'ଖେଳିଲୁ',
  khelile: 'ଖେଳିଲେ',
  // piiba (drink)
  piili: 'ପିଇଲି',
  piilå: 'ପିଇଲ',
  piila: 'ପିଇଲା',
  piilu: 'ପିଇଲୁ',
  piile: 'ପିଇଲେ',
  // soiba (sleep) — soila is in futuretense.ts
  soili: 'ଶୋଇଲି',
  soilå: 'ଶୋଇଲ',
  soilu: 'ଶୋଇଲୁ',
  soile: 'ଶୋଇଲେ',
  // aniba (bring)
  anili: 'ଆଣିଲି',
  anilå: 'ଆଣିଲ',
  anila: 'ଆଣିଲା',
  anilu: 'ଆଣିଲୁ',
  anile: 'ଆଣିଲେ',
  // råhiba (stay)
  råhili: 'ରହିଲି',
  råhilå: 'ରହିଲ',
  råhila: 'ରହିଲା',
  råhilu: 'ରହିଲୁ',
  råhile: 'ରହିଲେ',

  // Lesson: Past progressive — was ...-ing (-uthili)
  asuthili: 'ଆସୁଥିଲି',
  khauthili: 'ଖାଉଥିଲି',
  kåruthili: 'କରୁଥିଲି',
  jauthili: 'ଯାଉଥିଲି',
  dekhuthili: 'ଦେଖୁଥିଲି',
  piuthili: 'ପିଉଥିଲି',
  southili: 'ଶୋଉଥିଲି', // sleep drops the connecting u in the present (soichi) but not here
  anuthili: 'ଆଣୁଥିଲି',
  råhuthili: 'ରହୁଥିଲି',
  // kheluthili is in futuretense.ts

  // Lesson: Past perfect — had ...-ed (-ithili)
  asithili: 'ଆସିଥିଲି',
  khaithili: 'ଖାଇଥିଲି',
  kårithili: 'କରିଥିଲି',
  jaithili: 'ଯାଇଥିଲି',
  dekhithili: 'ଦେଖିଥିଲି',
  khelithili: 'ଖେଳିଥିଲି',
  soithili: 'ଶୋଇଥିଲି',
  anithili: 'ଆଣିଥିଲି',
  råhithili: 'ରହିଥିଲି',

  // Lesson: You Did It! (kåri + the past of deba "to give")
  kåri: 'କରି', // having done
  deli: 'ଦେଲି',
  delå: 'ଦେଲ',
  dela: 'ଦେଲା',
  delu: 'ଦେଲୁ',
  dele: 'ଦେଲେ',
  badhiya: 'ବଢ଼ିଆ', // great, excellent
  dhånyåvad: 'ଧନ୍ୟବାଦ', // thank you
}
