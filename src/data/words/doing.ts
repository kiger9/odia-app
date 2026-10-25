// Odia script for the words of the Doing & the Market chapter (see ../script.ts).
// Lessons: verbs1, withothers, smallwords, neg, need, market.
// Already in other chapters (not repeated): jauchi/råhuchi (meet), the other
// -uchi verbs, kamå/chesta/help (simpleconj), tånka/kilo/machå/kådåli (num).

export const DOING: Record<string, string> = {
  // Everyday Verbs (verbs1): -uchi endings for bring / stay / come
  anuchi: 'ଆଣୁଛି',
  anuchå: 'ଆଣୁଛ',
  anuchu: 'ଆଣୁଛୁ',
  anuchånti: 'ଆଣୁଛନ୍ତି',
  råhuchå: 'ରହୁଛ',
  råhuchu: 'ରହୁଛୁ',
  råhuchånti: 'ରହୁଛନ୍ତି',
  asuchi: 'ଆସୁଛି',
  asuchå: 'ଆସୁଛ',
  asuchu: 'ଆସୁଛୁ',
  asuchånti: 'ଆସୁଛନ୍ତି',
  // things and people those sentences use
  pani: 'ପାଣି',
  cha: 'ଚା',
  bhatå: 'ଭାତ',
  ambå: 'ଆମ୍ବ',
  phulå: 'ଫୁଲ',
  hati: 'ହାତୀ',
  pilamane: 'ପିଲାମାନେ',
  aai: 'ଆଈ', // grandmother, as the lessons gloss it
  bapa: 'ବାପା',
  // places (pronoun-less place words used in the practice sentences)
  bahare: 'ବାହାରେ',
  bhitåre: 'ଭିତରେ',
  upåre: 'ଉପରେ',
  tåle: 'ତଳେ',
  'ghårå-ku': 'ଘରକୁ',
  'bhitårå-ku': 'ଭିତରକୁ',
  'upårå-ku': 'ଉପରକୁ',
  'baharå-ku': 'ବାହାରକୁ',
  'school-ku': 'ସ୍କୁଲକୁ',
  'måndirå-ku': 'ମନ୍ଦିରକୁ',
  'måndirå-ru': 'ମନ୍ଦିରରୁ',
  'bågicha-ru': 'ବଗିଚାରୁ',
  puri: 'ପୁରୀ',
  // names
  gopal: 'ଗୋପାଳ',
  // yes/no forms of the verbs above (particle written as a separate word)
  'khauchi-ki': 'ଖାଉଛି କି',
  'khauchå-ki': 'ଖାଉଛ କି',
  'khauchånti-ki': 'ଖାଉଛନ୍ତି କି',
  'piuchi-ki': 'ପିଉଛି କି',
  'piuchå-ki': 'ପିଉଛ କି',
  'piuchånti-ki': 'ପିଉଛନ୍ତି କି',
  'jauchi-ki': 'ଯାଉଛି କି',
  'jauchå-ki': 'ଯାଉଛ କି',
  'jauchånti-ki': 'ଯାଉଛନ୍ତି କି',
  'kåruchi-ki': 'କରୁଛି କି',
  'kåruchå-ki': 'କରୁଛ କି',
  'kåruchånti-ki': 'କରୁଛନ୍ତି କି',
  'kheluchi-ki': 'ଖେଳୁଛି କି',
  'kheluchå-ki': 'ଖେଳୁଛ କି',
  'kheluchånti-ki': 'ଖେଳୁଛନ୍ତି କି',
  'råhuchi-ki': 'ରହୁଛି କି',
  'råhuchå-ki': 'ରହୁଛ କି',
  'asuchi-ki': 'ଆସୁଛି କି',
  'asuchånti-ki': 'ଆସୁଛନ୍ତି କି',
  'anuchånti-ki': 'ଆଣୁଛନ୍ତି କି',
  'soichånti-ki': 'ଶୋଇଛନ୍ତି କି',

  // With Others (withothers): "with" is a separate word in Odia script
  // (ସଙ୍ଗରେ), so Rahul-sangåre → ରାହୁଲ ସଙ୍ଗରେ; elders: bapa-nkå → ବାପାଙ୍କ
  'rahul-sangåre': 'ରାହୁଲ ସଙ୍ଗରେ',
  'mo-sangåre': 'ମୋ ସଙ୍ଗରେ',
  'tåmå-sangåre': 'ତମ ସଙ୍ଗରେ', // tåmå = the "you" stem in tåmåku; spoken ତମ, not formal ତୁମ
  'bapa-nkå-sangåre': 'ବାପାଙ୍କ ସଙ୍ଗରେ',
  // (khelibå, khaibå, asibå, råhibå, soibå and their -ki forms are the future
  // "you will …" forms defined in the future/time/life chapters)

  // Little Linking Words (smallwords): -rå attaches (Rahul-rå → ରାହୁଲର);
  // -sange (quick speech for -sangåre) is a separate word like -sangåre
  '-rå': 'ର', // the ending "'s", spoken on its own
  '-sange': 'ସଙ୍ଗେ', // the ending "with", spoken on its own
  'rahul-rå': 'ରାହୁଲର',
  'mitu-rå': 'ମିତୁର',
  'rabi-rå': 'ରବିର',
  'kirsten-rå': 'କିର୍ସ୍ଟେନର',
  'aai-nkårå': 'ଆଈଙ୍କର',
  'rahul-sange': 'ରାହୁଲ ସଙ୍ଗେ',
  'mo-sange': 'ମୋ ସଙ୍ଗେ',
  be: 'ବେ', // spoken "be"; written Odia spells it ବି (the lesson says so) — spoken form wins

  // Saying No (neg): verb + -ni
  jauni: 'ଯାଉନି',
  asuni: 'ଆସୁନି',
  khauni: 'ଖାଉନି',
  piuni: 'ପିଉନି',
  anuni: 'ଆଣୁନି',
  kheluni: 'ଖେଳୁନି',
  råhuni: 'ରହୁନି',
  dekhuni: 'ଦେଖୁନି',
  kåruni: 'କରୁନି',
  nuhe: 'ନୁହେଁ',
  mitha: 'ମିଠା',
  kichi: 'କିଛି',

  // I Need, I Want (need)
  dårkar: 'ଦରକାର',
  'dårkar-ki': 'ଦରକାର କି',
  khirå: 'ଖୀର', // glossed "milk" in the lesson
  ei: 'ଏଇ',
  'båhi-ta': 'ବହିଟା',
  au: 'ଆଉ',
  amårå: 'ଆମର',
  semanånkårå: 'ସେମାନଙ୍କର',

  // At the Market (market)
  diå: 'ଦିଅ',
  diåntu: 'ଦିଅନ୍ତୁ',
  kete: 'କେତେ',
  setiki: 'ସେତିକି',
  tau: 'ତଉ', // "Setiki tau" = that's enough; the particle is spoken tau
  dhånyåvad: 'ଧନ୍ୟବାଦ',
  ådha: 'ଅଧା',
  eita: 'ଏଇଟା', // spoken -ଟା, not formal ଏଇଟି
  seita: 'ସେଇଟା',
  'mitha-ki': 'ମିଠା କି',
  'påchilå-ki': 'ପାଚିଲା କି',
}
