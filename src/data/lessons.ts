// AUTO-PORTED from the prototype (prototype/index.html) — content is byte-for-byte
// identical, so the book's phonetic spellings (åchånti, ghåre, …) are preserved exactly.
// Regenerate with scratchpad/extract.mjs if the prototype's lessons change.
//
// A lesson is a list of steps; each step's `t` field is its exercise type.
// The `odia` field is the book's Latin phonetic spelling (shown large when teaching);
// `script` (optional) is the Odia script shown small beneath it.

export type StepType = 'intro' | 'choice' | 'match' | 'assemble' | 'cloze' | 'type'

export interface Step {
  t: StepType
  odia?: string          // phonetic phrase (intro cards) — the big headline
  script?: string        // optional Odia script, shown small beneath the phonetic
  gloss?: string         // English meaning / hint
  note?: string          // HTML explanation on intro cards
  q?: string             // question / instruction
  show?: string          // a phrase shown with the question
  opts?: Array<string | { a: string }> // choice: [{a}], cloze: [string]
  ans?: number | string | string[]     // index (choice/cloze) | text (type) | tokens (assemble)
  alts?: string[]        // accepted alternative typings
  why?: string           // HTML explanation shown after answering
  pairs?: [string, string][] // match pairs [phonetic, english]
  dir?: 'en'             // assemble direction: build English (default: build Odia)
  dist?: string[]        // distractor tiles (assemble)
  pre?: string           // cloze: text before the blank
  post?: string          // cloze: text after the blank
}

export interface Lesson {
  id: string
  title: string
  sub?: string
  items: Step[]
}

export interface Chapter {
  key: string
  title: string
  blurb: string
  lessons: string[]
}

export const LESSONS: Lesson[] = [
{ id:'be', title:'To Be — åchi', sub:'I am, you are, they are · 17 steps', items:[
    {t:'intro', odia:'Mu åchi', gloss:'I am', note:'<b>Mu</b> = I. The verb <b>åchi</b> does the work of “am”. Odia has no separate verb for “have” either — you’ll reuse åchi constantly.'},
    {t:'intro', odia:'Tåme åchå', gloss:'You are  (informal)', note:'<b>Tåme</b> = you, for friends and children. Notice the verb changed: <b>åchi → åchå</b>.'},
    {t:'choice', q:'How do you say “I am”?', opts:[{a:'Mu åchi'},{a:'Tåme åchå'},{a:'Ame åchu'}], ans:0},
    {t:'intro', odia:'Apånå åchånti', gloss:'You are  (respectful)', note:'<b>Apånå</b> is the respectful “you” — for elders, strangers, anyone senior. Respectful address always pulls the ending <b>-ånti</b>. When in doubt, use this one: better over-polite than rude.'},
    {t:'choice', q:'You’re speaking to a friend’s father. Which do you say?', opts:[{a:'Tåme åchå'},{a:'Apånå åchånti'},{a:'Apånå åchå'}], ans:1, why:'A senior person gets the respectful form — and <b>apånå</b> must be paired with <b>åchånti</b>, not åchå.'},
    {t:'match', q:'Match the pairs', pairs:[['Mu åchi','I am'],['Tåme åchå','you are (inf.)'],['Apånå åchånti','you are (resp.)'],['Ame åchu','we are']]},
    {t:'intro', odia:'Ame åchu', gloss:'We are', note:'That’s the whole verb: <b>åchi · åchå · åchånti · åchu</b>. Four forms — every other Odia verb copies this same pattern.'},
    {t:'intro', odia:'Mu ghåre åchi', gloss:'I am at home', note:'<b>ghåre</b> = at home. So <b>Mu ghåre åchi</b> = I am at home.'},
    {t:'choice', q:'What does this mean?', show:'Apånå ghåre åchånti', opts:[{a:'You are at home'},{a:'I am at home'},{a:'They are at home'}], ans:0, why:'<b>ghåre</b> = at home. <b>Apånå … åchånti</b> = you, respectfully.'},
    {t:'assemble', q:'Build in Odia: “I am at home”', gloss:'ghåre = at home', ans:['Mu','ghåre','åchi'], dist:['åchånti','Tåme']},
    {t:'cloze', q:'Complete: “You (respectful) are at home”', pre:'Apånå ghåre', post:'', opts:['åchi','åchå','åchånti','åchu'], ans:2, why:'Respectful address → <b>åchånti</b>, every time.'},
    {t:'intro', odia:'Se åchånti', gloss:'He / She is', note:'<b>Se</b> = he or she — Odia uses one word for both. Being respectful: <b>Se åchånti</b>.'},
    {t:'intro', odia:'Semane åchånti', gloss:'They are', note:'<b>Semane</b> = they. <b>Semane åchånti</b> = they are.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Semane ghåre åchånti', ans:['They','are','at','home'], dist:['I','She','is']},
    {t:'choice', q:'What does this mean?', show:'Se åchånti', opts:[{a:'He / she is'},{a:'They are'},{a:'You are'}], ans:0, why:'All three would use <b>åchånti</b> — the pronoun decides. <b>Se</b> = he or she (Odia doesn’t split by gender); “they” needs <i>semane</i>, “you” needs <i>apånå</i>.'},
    {t:'assemble', q:'Build in Odia: “She is at home”  (informal)', gloss:'Se = he / she', ans:['Se','ghåre','åchi'], dist:['åchånti','Mu']},
    {t:'assemble', q:'Build in Odia: “We are at home”', ans:['Ame','ghåre','åchu'], dist:['åchi','Mu','åchånti']},
    {t:'assemble', q:'Build in Odia: “You are at home”  (respectful)', ans:['Apånå','ghåre','åchånti'], dist:['Tåme','åchå','Se']},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Tåme ghåre åchå', ans:['You','are','at','home'], dist:['We','They','is']},
    {t:'type', q:'Type in Odia: “We are”', ans:'Ame åchu', alts:['ame achu']}
  ]},
{ id:'howru', title:'How Are You?', sub:'Greetings & feelings · 15 steps', items:[
    {t:'intro', odia:'Apånå kemiti åchånti?', gloss:'How are you?  (respectful)', note:'<b>kemiti</b> = how. This is the safe, polite greeting for anyone you’d address respectfully — elders, strangers, a shopkeeper. The verb keeps its respectful ending <b>åchånti</b>.'},
    {t:'intro', odia:'Tåme kemiti åchå?', gloss:'How are you?  (informal)', note:'The same question for a friend or a child — informal verb <b>åchå</b>. When you ask with <b>kemiti</b>, the verb never takes the question ending <b>-ki</b>.'},
    {t:'choice', q:'You’re greeting a shopkeeper you don’t know. Which do you say?', opts:[{a:'Apånå kemiti åchånti?'},{a:'Tåme kemiti åchå?'},{a:'Apånå kemiti åchå?'}], ans:0, why:'A stranger gets the respectful form — and <b>apånå</b> pairs with <b>åchånti</b>, not åchå.'},
    {t:'intro', odia:'Mu bhålå åchi', gloss:'I am fine', note:'<b>bhålå</b> = good / well. The everyday reply.'},
    {t:'choice', q:'What does this mean?', show:'Mu bhålå åchi', opts:[{a:'I am fine'},{a:'I am not well'},{a:'How are you?'}], ans:0},
    {t:'intro', odia:'Mu båhut bhålå åchi', gloss:'I am very well', note:'<b>båhut</b> = very. Stack it before an adjective to strengthen it.'},
    {t:'intro', odia:'Mu bhålå nahi', gloss:'I am not well', note:'<b>nahi</b> negates <b>åchi</b>. (Respectfully, <b>åchånti</b> becomes <b>nahanti</b>.)'},
    {t:'choice', q:'How do you say “I am not well”?', opts:[{a:'Mu bhålå nahi'},{a:'Mu bhålå åchi'},{a:'Mu båhut bhålå'}], ans:0},
    {t:'match', q:'Match the pairs', pairs:[['kemiti','how'],['bhålå','well, good'],['båhut','very'],['nahi','not']]},
    {t:'cloze', q:'Complete: “He is not well”  (respectful)', pre:'Se bhålå', post:'', opts:['åchi','nahi','nahanti','åchånti'], ans:2, why:'Respectful address → the negative is <b>nahanti</b> (åchånti’s “not”).'},
    {t:'assemble', q:'Build in Odia: “How is he?”  (informal)', gloss:'Se = he / she', ans:['Se','kemiti','åchi'], dist:['åchånti','Apånå']},
    {t:'choice', q:'What does this mean?', show:'Se ebe tike bhålå åchi', opts:[{a:'She is a little better now'},{a:'She is very well'},{a:'She is not well'}], ans:0, why:'<b>ebe</b> = now, <b>tike</b> = a little.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mitu bhålå nahi', ans:['Mitu','is','not','well'], dist:['very','fine','are'], gloss:'Mitu = a name'},
    {t:'assemble', q:'Build in Odia: “I am very well”', ans:['Mu','båhut','bhålå','åchi'], dist:['nahi','Se']},
    {t:'type', q:'Type in Odia: “I am fine”', ans:'Mu bhålå åchi', alts:['mu bhala achi']}
  ]},
{ id:'have', title:'I Have', sub:'Having things · 15 steps', items:[
    {t:'intro', odia:'Morå gote båhi åchi', gloss:'I have a book', note:'Odia has no verb “to have”. This is literally “<b>Mine one book is</b>.” <b>morå</b> = my/mine, <b>gote</b> = a/one, <b>båhi</b> = book, and the trusty <b>åchi</b> does the rest.'},
    {t:'intro', odia:'Mopakhåre gote båhi åchi', gloss:'I have a book  (on me)', note:'A second kind of having — “<b>Me-near</b> one book is.” Use <b>mopakhåre</b> for something you’ve got with you right now, versus <b>morå</b> for what you own. Both translate “I have a book”.'},
    {t:'choice', q:'You own a house. Which fits?', opts:[{a:'Morå gote ghårå åchi'},{a:'Mopakhåre gote ghårå åchi'},{a:'Morå ghårå nahi'}], ans:0, why:'Ownership → <b>morå</b>. <b>ghårå</b> = house.'},
    {t:'intro', odia:'Morå · Tåmårå · Tarå', gloss:'My · Your (inf) · His/Her', note:'Add <b>-rå</b> to make a pronoun possessive: mo-rå, tåmå-rå, ta-rå. Respectful “your” is <b>apånånkårå</b> — note the <b>-nkå-</b> that marks respect.'},
    {t:'match', q:'Match the pairs', pairs:[['Morå','mine'],['Tåmårå','yours (inf)'],['Tarå','his, hers'],['Apånånkårå','yours (resp)']]},
    {t:'choice', q:'What does this mean?', show:'Tarå gote gadi åchi', opts:[{a:'He has a car'},{a:'I have a car'},{a:'You have a car'}], ans:0, why:'<b>Tarå</b> = his/her; <b>gadi</b> = vehicle/car (the <i>d</i> sounds almost like <i>r</i>).'},
    {t:'intro', odia:'Tåmårå gadi åchi-ki?', gloss:'Do you have a car?  (informal)', note:'Tack <b>-ki</b> onto the end to ask a yes/no question — a spoken question mark.'},
    {t:'cloze', q:'Ask: “Do you (informal) have a book?”', pre:'Tåmårå gote båhi åchi', post:'', opts:['-ki','-re','-ku','nahi'], ans:0, why:'<b>-ki</b> turns the statement into a yes/no question.'},
    {t:'assemble', q:'Build in Odia: “Yes, I have a book”  (you own it)', gloss:'Hå = yes', ans:['Hå','morå','gote','båhi','åchi'], dist:['mopakhåre','nahi']},
    {t:'choice', q:'Ask a respectful “Do you have a car?” — which?', opts:[{a:'Apånånkårå gadi åchi-ki?'},{a:'Tåmårå gadi åchi-ki?'},{a:'Apånånkårå gadi åchi'}], ans:0, why:'Respectful “your” = <b>apånånkårå</b>, and a yes/no question needs <b>-ki</b>.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mopakhåre gote pen åchi', ans:['I','have','a','pen'], dist:['book','you','cow']},
    {t:'cloze', q:'Answer: “No, I don’t have it on me”', pre:'Na, mopakhåre', post:'', opts:['nahi','åchi','åchånti','-ki'], ans:0, why:'<b>nahi</b> = not. Nothing there to “be”, so åchi becomes nahi.', gloss:'Na = no'},
    {t:'assemble', q:'Build in Odia: “She has a cow”  (informal)', gloss:'gai = cow · Tarå = his/her', ans:['Tarå','gote','gai','åchi'], dist:['Morå','nahi']},
    {t:'choice', q:'What does this mean?', show:'Mopakhåre nahi', opts:[{a:'No, I don’t have it'},{a:'Yes, I have it'},{a:'Yes, it is mine'}], ans:0, why:'<b>Mopakhåre nahi</b> = it’s not near me — I don’t have it on me right now.'},
    {t:'type', q:'Type in Odia: “I have a book”  (you own it)', ans:'Morå gote båhi åchi', alts:['mora gote bahi achi']}
  ]},
{ id:'num', title:'Numbers 1–10', sub:'Saying the numbers · 14 steps', items:[
    {t:'intro', odia:'Ek · Dui · Tini', gloss:'One · Two · Three', note:'These are the plain numbers — what you say when reciting, or when talking about amounts: rupees, kilos, hours. Counting actual <i>objects</i> works differently; that’s the next lesson.'},
    {t:'choice', q:'Which one is <b>three</b>?', opts:[{a:'Tini'},{a:'Dui'},{a:'Chari'}], ans:0},
    {t:'intro', odia:'Chari · Panch', gloss:'Four · Five', note:'Halfway. Say them out loud in order: ek, dui, tini, chari, panch.'},
    {t:'match', q:'Match the pairs', pairs:[['Ek','one'],['Dui','two'],['Tini','three'],['Chari','four'],['Panch','five']]},
    {t:'intro', odia:'Chå · Sat · Ath', gloss:'Six · Seven · Eight', note:'<b>Chå</b> and <b>chari</b> sound close — six vs four. Worth slowing down on.'},
    {t:'choice', q:'What does this mean?', show:'Sat', opts:[{a:'Seven'},{a:'Six'},{a:'Nine'}], ans:0},
    {t:'intro', odia:'Nå · Dås', gloss:'Nine · Ten', note:'That’s all ten: ek, dui, tini, chari, panch, chå, sat, ath, nå, dås.'},
    {t:'match', q:'Match the pairs', pairs:[['Chå','six'],['Sat','seven'],['Ath','eight'],['Nå','nine'],['Dås','ten']]},
    {t:'intro', odia:'Dås tånka', gloss:'Ten rupees', note:'Money, weights and time use these plain numbers: <b>dui kilo</b> = 2 kg, <b>tini ghånta</b> = 3 hours, <b>dås tånka</b> = 10 rupees.'},
    {t:'choice', q:'What does this mean?', show:'Dui kilo machå', opts:[{a:'Two kilos of fish'},{a:'Two fish'},{a:'Fish for two rupees'}], ans:0, why:'A weight, not a count of fish — so the plain number <b>dui</b> is right.'},
    {t:'assemble', q:'Build in Odia: “Ten rupees”', gloss:'tånka = rupee', ans:['Dås','tånka'], dist:['Dåsta','Nå']},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Tini ghånta', ans:['Three','hours'], dist:['Four','minutes','Two'], gloss:'ghånta = hour'},
    {t:'assemble', q:'Build in Odia: “Five kilos”', gloss:'kilo = kilo', ans:['Panch','kilo'], dist:['Panchta','Chå']},
    {t:'type', q:'Type in Odia: “nine”', ans:'Nå', alts:['na']}
  ]},
{ id:'count', title:'Counting things', sub:'Numbers with objects · 15 steps', items:[
    {t:'intro', odia:'Gote båhi', gloss:'One book', note:'Now you’re counting <i>things</i>. For one object Odia uses <b>gote</b> rather than <i>ek</i>. <b>båhi</b> = book.'},
    {t:'intro', odia:'Duita · Tinita', gloss:'Two · Three  (counting objects)', note:'Here’s the rule: to count objects, add <b>-ta</b> to the plain number. dui → <b>duita</b>, tini → <b>tinita</b>, chari → <b>charita</b>, dås → <b>dåsta</b>.'},
    {t:'choice', q:'How do you say “three books”?', opts:[{a:'Tinita båhi'},{a:'Tini båhi'},{a:'Båhi tinita'}], ans:0, why:'Objects get the <b>-ta</b> number, and it goes before the noun.'},
    {t:'intro', odia:'Tini kilo machå  ·  Tinita machå', gloss:'Three kilos of fish · Three fish', note:'Same “three”, two jobs. A <b>weight</b> keeps the plain number; <b>individual fish</b> take <b>-ta</b>. This is the distinction to get right.'},
    {t:'choice', q:'Which one means “three fish”?', opts:[{a:'Tinita machå'},{a:'Tini kilo machå'},{a:'Tini tånka machå'}], ans:0, why:'Counting whole fish → <b>tinita</b>. <i>Tini kilo machå</i> is three kilos of it.'},
    {t:'assemble', q:'Build in Odia: “There are three books”', gloss:'åchi = is / are', ans:['Tinita','båhi','åchi'], dist:['Tini','åchånti']},
    {t:'intro', odia:'Keteta?', gloss:'How many?', note:'<b>Keteta kådåli åchi?</b> = “How many bananas are there?” Answer with a <b>-ta</b> number. (For amounts you’d ask <b>kete?</b> — how much.)'},
    {t:'cloze', q:'Answer “Keteta kådåli åchi?” — say <b>two</b>', pre:'', post:'kådåli åchi', opts:['Gote','Duita','Tinita','Dåsta'], ans:1, why:'The noun doesn’t change for plural once a number is there — still just <i>kådåli</i>.', gloss:'kådåli = banana'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Panchta gai åchi', ans:['There','are','five','cows'], dist:['four','books','is'], gloss:'Panchta = five of them'},
    {t:'choice', q:'What does this mean?', show:'Keteta pila åchånti?', opts:[{a:'How many children are there?'},{a:'How much rice is there?'},{a:'Where are the children?'}], ans:0, why:'<b>pila</b> = child. People take <b>åchånti</b>.'},
    {t:'assemble', q:'Build in Odia: “There are ten bananas”', gloss:'kådåli = banana', ans:['Dåsta','kådåli','åchi'], dist:['Dås','åchånti']},
    {t:'assemble', q:'Build in Odia: “How many cows are there?”', gloss:'gai = cow', ans:['Keteta','gai','åchi'], dist:['Kete','Gote']},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Charita båhi åchi', ans:['There','are','four','books'], dist:['five','cows','kilos'], gloss:'Charita = four of them'},
    {t:'cloze', q:'Complete: “There are six bananas”', pre:'', post:'kådåli åchi', opts:['Chå','Chåta','Charita','Chårita'], ans:1, why:'Six bananas are countable objects → <b>chåta</b>.'},
    {t:'type', q:'Type in Odia: “ten”  (counting objects)', ans:'Dåsta', alts:['dasta']}
  ]},
{ id:'comego', title:'Coming & Going', sub:'Going places · 15 steps', items:[
    {t:'intro', odia:'Mu jauchi', gloss:'I am going', note:'<b>jauchi</b> = am going. It takes the same four endings you already know from åchi: jauchi / jauchå / jauchånti / jauchu.'},
    {t:'intro', odia:'Mu asuchi', gloss:'I am coming', note:'<b>asuchi</b> = am coming. Same four endings again — every Odia verb works this way.'},
    {t:'choice', q:'How do you say “I am going”?', opts:[{a:'Mu jauchi'},{a:'Mu asuchi'},{a:'Mu åchi'}], ans:0},
    {t:'intro', odia:'-ku = to · -ru = from · -re = in', gloss:'place endings', note:'Attach these to a place. <b>ghårå</b> (house) → <b>ghårå-ku</b> (to the house), <b>ghårå-ru</b> (from the house), <b>ghåre</b> (in the house).'},
    {t:'intro', odia:'Mu ghårå-ku jauchi', gloss:'I am going home', note:'<b>ghårå-ku</b> = to the house. The place, then the ending, then the verb.'},
    {t:'choice', q:'What does this mean?', show:'Mu bågicha-ru asuchi', opts:[{a:'I am coming from the garden'},{a:'I am going to the garden'},{a:'I am in the garden'}], ans:0, why:'<b>-ru</b> = from; <b>bågicha</b> = garden.'},
    {t:'match', q:'Match the pairs', pairs:[['jauchi','am going'],['asuchi','am coming'],['-ku','to'],['-ru','from']]},
    {t:'cloze', q:'Complete: “They are going to the garden”  (respectful)', pre:'Semane bågicha-ku', post:'', opts:['jauchi','jauchå','jauchånti','jauchu'], ans:2, why:'They (people) take the <b>-ånti</b> ending → <b>jauchånti</b>.', gloss:'bågichaku = to the garden'},
    {t:'assemble', q:'Build in Odia: “I am going to school”', gloss:'school-ku = to school', ans:['Mu','school-ku','jauchi'], dist:['asuchi','jauchånti']},
    {t:'choice', q:'Ask a respectful “Are they coming?” — which?', opts:[{a:'Semane asuchånti-ki?'},{a:'Semane jauchånti-ki?'},{a:'Semane asuchånti'}], ans:0, why:'Coming = <b>asuchånti</b>; <b>-ki</b> makes it a yes/no question.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mitu ghårå-ku jauchi', ans:['Mitu','is','going','home'], dist:['coming','to','from'], gloss:'ghåråku = to the house'},
    {t:'intro', odia:'Ame Bhubaneswar jauchu', gloss:'We are going to Bhubaneswar', note:'For a <b>named city</b>, drop the <b>-ku</b>: not Bhubaneswar-ku, just Bhubaneswar. (<b>jauchu</b> = we are going.)'},
    {t:'cloze', q:'Complete: “We are going to the temple”', pre:'Ame måndirå-ku', post:'', opts:['jauchu','jauchi','jauchå','jauchånti'], ans:0, why:'We → <b>jauchu</b>. <b>måndirå</b> = temple.', gloss:'måndiråku = to the temple'},
    {t:'assemble', q:'Build in Odia: “Are you going to the market?”  (informal)', gloss:'-ku = to · -ki = ?', ans:['Tåme','market-ku','jauchå-ki'], dist:['jauchånti','asuchå']},
    {t:'type', q:'Type in Odia: “I am coming”', ans:'Mu asuchi', alts:['mu asuchi']}
  ]},
{ id:'plural', title:'Singular & Plural', sub:'One and many · 13 steps', items:[
    {t:'intro', odia:'Pila · Pilamane', gloss:'Child · Children', note:'For living beings, add <b>-mane</b> to make a plural. pila (child) → <b>pilamane</b> (children).'},
    {t:'intro', odia:'Båhi · Båhigudikå', gloss:'Book · Books', note:'For things, add <b>-gudikå</b>. båhi (book) → <b>båhigudikå</b> (books).'},
    {t:'choice', q:'How do you say “children”?', opts:[{a:'Pilamane'},{a:'Pilagudikå'},{a:'Pila'}], ans:0, why:'Living beings take <b>-mane</b>.'},
    {t:'choice', q:'How do you say “books”?', opts:[{a:'Båhigudikå'},{a:'Båhimane'},{a:'Båhita'}], ans:0, why:'Things take <b>-gudikå</b> (not -mane, which is for living beings).'},
    {t:'match', q:'Match the pairs', pairs:[['pilamane','children'],['gaimane','cows'],['båhigudikå','books'],['ghårågudikå','houses']]},
    {t:'intro', odia:'Gote kådåli · Dåsta kådåli', gloss:'One banana · Ten bananas', note:'When you give a number, the noun stays singular — no -mane or -gudikå. Only use the plural endings when the amount is unspecified.'},
    {t:'choice', q:'What does this mean?', show:'Pilamane ghåre åchånti', opts:[{a:'The children are at home'},{a:'The child is at home'},{a:'The children are coming'}], ans:0, why:'-mane = plural; ghåre = at home.'},
    {t:'assemble', q:'Build in Odia: “The books are at home”', gloss:'ghåre = at home', ans:['Båhigudikå','ghåre','åchi'], dist:['Båhi','åchånti']},
    {t:'intro', odia:'Gaimane · Gai-gudikå', gloss:'Cows (either way)', note:'Animals sit between people and things — you can use <b>-mane</b> or <b>-gudikå</b>: gaimane or gai-gudikå.'},
    {t:'choice', q:'Which adds the living-being plural to “hati” (elephant)?', opts:[{a:'Hatimane'},{a:'Hatita'},{a:'Hatiku'}], ans:0, why:'Living-being plural = <b>-mane</b>.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Morå båhigudikå ghåre åchi', ans:['My','books','are','at','home'], dist:['child','is','cows']},
    {t:'cloze', q:'Complete: “houses”', pre:'Ghårå', post:'', opts:['-gudikå','-mane','-ta','-ku'], ans:0, why:'Houses are things → <b>-gudikå</b>.', gloss:'Ghårå = house'},
    {t:'type', q:'Type in Odia: “children”', ans:'Pilamane', alts:['pilamane']}
  ]},
{ id:'this', title:'This & That', sub:'This one, that one · 13 steps', items:[
    {t:'intro', odia:'Eita · Seita', gloss:'This (one) · That (one)', note:'<b>Eita</b> = this one, <b>Seita</b> = that one. Eita gote ambå = “This is a mango.”'},
    {t:'choice', q:'What does this mean?', show:'Seita gote ambå', opts:[{a:'That is a mango'},{a:'This is a mango'},{a:'That mango is sweet'}], ans:0, why:'<b>Seita</b> = that one.'},
    {t:'intro', odia:'Ei ambå-ta mitha', gloss:'This mango is sweet', note:'When “this” describes a noun, wrap it: <b>Ei</b> … <b>-ta</b>. For “that”, it’s <b>Sei</b> … -ta. mitha = sweet.'},
    {t:'match', q:'Match the pairs', pairs:[['Eita','this one'],['Seita','that one'],['mitha','sweet'],['ambå','mango']]},
    {t:'choice', q:'How do you say “This one is big”?', opts:[{a:'Eita bådå'},{a:'Seita bådå'},{a:'Ei bådå-ta'}], ans:0, why:'“This one” as a noun = <b>Eita</b>; bådå = big.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Seita nua', ans:['That','one','is','new'], dist:['this','big','old'], gloss:'nua = new'},
    {t:'intro', odia:'Ei hati-ta morå', gloss:'This elephant is mine', note:'The <b>-ta</b> is the “specifying” ending — it points at one particular thing. hati = elephant.'},
    {t:'choice', q:'What does this mean?', show:'Ei hati-ta morå', opts:[{a:'This elephant is mine'},{a:'That elephant is mine'},{a:'This is an elephant'}], ans:0},
    {t:'assemble', q:'Build in Odia: “This is a mango”', gloss:'gote = a / one', ans:['Eita','gote','ambå'], dist:['Seita','mitha']},
    {t:'cloze', q:'Complete: “That mango is sweet”', pre:'', post:'ambå-ta mitha', opts:['Sei','Ei','Seita','Eita'], ans:0, why:'“That” describing a noun = <b>Sei</b> … -ta (not Seita, which stands alone).', gloss:'ambåta = the mango'},
    {t:'assemble', q:'Build in Odia: “That one is new”', gloss:'nua = new', ans:['Seita','nua'], dist:['Eita','bådå']},
    {t:'choice', q:'“This mango is sweet” — which is right?', opts:[{a:'Ei ambå-ta mitha'},{a:'Eita ambå mitha'},{a:'Eita mitha ambå'}], ans:0, why:'Describing a noun → <b>Ei</b> … -ta.'},
    {t:'type', q:'Type in Odia: “that one”', ans:'Seita', alts:['seita']}
  ]},
{ id:'inout', title:'In & Out, Up & Down', sub:'Where things are · 13 steps', items:[
    {t:'intro', odia:'bhitåre · bahare', gloss:'inside · outside', note:'<b>bhitåre</b> = inside, <b>bahare</b> = outside. These say where something <i>is</i>.'},
    {t:'intro', odia:'upåre · tåle', gloss:'up / upstairs · down / downstairs', note:'<b>upåre</b> also means over/above; <b>tåle</b> also means under/below.'},
    {t:'choice', q:'What does this mean?', show:'Se bhitåre åchi', opts:[{a:'She is inside'},{a:'She is outside'},{a:'She is upstairs'}], ans:0},
    {t:'match', q:'Match the pairs', pairs:[['bhitåre','inside'],['bahare','outside'],['upåre','up, above'],['tåle','down, under']]},
    {t:'intro', odia:'bhitårå-ku jauchi', gloss:'going inside', note:'To say you’re <i>going</i> there, add the <b>-ku</b> (to) ending: bhitårå-ku (in), baharå-ku (out), upårå-ku (up), tålå-ku (down).'},
    {t:'choice', q:'How do you say “I am going out”?', opts:[{a:'Mu baharå-ku jauchi'},{a:'Mu bahare åchi'},{a:'Mu bhitårå-ku jauchi'}], ans:0, why:'Going → -ku + jauchi; “out” → baharå.'},
    {t:'assemble', q:'Build in Odia: “They are outside”', gloss:'bahare = outside', ans:['Semane','bahare','åchånti'], dist:['bhitåre','åchi']},
    {t:'cloze', q:'Complete: “I am going upstairs”', pre:'Mu upårå-ku', post:'', opts:['jauchi','jauchå','jauchånti','åchi'], ans:0, why:'I → <b>jauchi</b>.', gloss:'upåråku = up / upstairs'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mu bhitåre åchi', ans:['I','am','inside'], dist:['outside','going','you']},
    {t:'choice', q:'What does this mean?', show:'Semane bahare åchånti', opts:[{a:'They are outside'},{a:'They are inside'},{a:'They are going out'}], ans:0},
    {t:'assemble', q:'Build in Odia: “Are you going inside?”  (informal)', gloss:'-ku = to · -ki = ?', ans:['Tåme','bhitårå-ku','jauchå-ki'], dist:['jauchånti','baharå-ku']},
    {t:'cloze', q:'Complete: “The children are inside”', pre:'Pilamane bhitåre', post:'', opts:['åchånti','åchi','nahi','jauchi'], ans:0, why:'People → <b>åchånti</b>.'},
    {t:'type', q:'Type in Odia: “inside”', ans:'bhitåre', alts:['bhitare']}
  ]},
{ id:'where', title:'Where?', sub:'Asking where · 13 steps', items:[
    {t:'intro', odia:'Kouthi?', gloss:'Where?', note:'<b>Kouthi</b> asks where something <i>is</i>. Båhita kouthi åchi? = “Where is the book?” (båhi + specifying -ta).'},
    {t:'intro', odia:'Kouthiki?', gloss:'Where to?', note:'<b>Kouthiki</b> (or <b>Kuade</b>) asks where you’re <i>going</i>. Tåme kouthiki jauchå? = “Where are you going?”'},
    {t:'choice', q:'What does this mean?', show:'Pilamane kouthi åchånti?', opts:[{a:'Where are the children?'},{a:'Where are the children going?'},{a:'Are the children home?'}], ans:0, why:'kouthi = where (located).'},
    {t:'match', q:'Match the pairs', pairs:[['Kouthi','where is'],['Kouthiki','where to'],['Koutha-ru','where from'],['Såbuthi','everywhere']]},
    {t:'choice', q:'How do you ask “Where are you going?”  (informal)', opts:[{a:'Tåme kouthiki jauchå?'},{a:'Tåme kouthi åchå?'},{a:'Tåme koutha-ru?'}], ans:0, why:'Going → <b>kouthiki</b>.'},
    {t:'intro', odia:'Apånå koutha-ru?', gloss:'Where are you from?  (respectful)', note:'Answer with the place + <b>-ru</b> (from): Mu Bhubaneswar-ru.'},
    {t:'assemble', q:'Build in Odia: “Where is the book?”', gloss:'-ta = the (specific)', ans:['Båhita','kouthi','åchi'], dist:['kouthiki','åchånti']},
    {t:'choice', q:'What does this mean?', show:'Apånå koutha-ru?', opts:[{a:'Where are you from?'},{a:'Where are you going?'},{a:'Where is it?'}], ans:0},
    {t:'intro', odia:'Såbuthi · Kouthi nahi', gloss:'Everywhere · Nowhere', note:'<b>Gaimane såbuthi åchånti</b> = “Cows are everywhere.” <b>Kouthi nahi</b> = nowhere / not anywhere.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Tåme kouthiki jauchå?', ans:['Where','are','you','going'], dist:['from','coming','is']},
    {t:'cloze', q:'Ask: “Where are they going?”  (respectful)', pre:'Semane kouthiki', post:'', opts:['jauchånti','jauchi','jauchå','åchånti'], ans:0, why:'They → <b>jauchånti</b>.'},
    {t:'assemble', q:'Build in Odia: “Where are the children?”', gloss:'kouthi = where', ans:['Pilamane','kouthi','åchånti'], dist:['kouthiki','åchi']},
    {t:'type', q:'Type in Odia: “where?”  (located)', ans:'Kouthi', alts:['kouthi']}
  ]},
{ id:'verbs1', title:'Everyday Verbs', sub:'Eat, drink, bring, stay · 14 steps', items:[
    {t:'intro', odia:'Mu khauchi', gloss:'I am eating', note:'<b>khauchi</b> = am eating. Same four endings: khauchi / khauchå / khauchånti / khauchu.'},
    {t:'intro', odia:'Mu piuchi', gloss:'I am drinking', note:'<b>piuchi</b> = am drinking.'},
    {t:'intro', odia:'Mu anuchi · Mu råhuchi', gloss:'I am bringing · I am staying', note:'<b>anuchi</b> = bringing, <b>råhuchi</b> = staying.'},
    {t:'match', q:'Match the pairs', pairs:[['khauchi','eating'],['piuchi','drinking'],['anuchi','bringing'],['råhuchi','staying']]},
    {t:'intro', odia:'kånå?', gloss:'what?', note:'<b>Tåme kånå khauchå?</b> = “What are you eating?” With <b>kånå</b> (what), the verb takes no -ki.'},
    {t:'choice', q:'What does this mean?', show:'Se ambå khauchi', opts:[{a:'He is eating a mango'},{a:'He is bringing a mango'},{a:'He wants a mango'}], ans:0, why:'ambå = mango; khauchi = eating.'},
    {t:'assemble', q:'Build in Odia: “I am drinking tea”', gloss:'cha = tea', ans:['Mu','cha','piuchi'], dist:['khauchi','anuchi']},
    {t:'choice', q:'How do you say “She is bringing flowers”?  (informal)', opts:[{a:'Se phulå anuchi'},{a:'Se phulå khauchi'},{a:'Se phulå piuchi'}], ans:0, why:'phulå = flower; anuchi = bringing.'},
    {t:'cloze', q:'Complete: “They are eating rice”', pre:'Semane bhatå', post:'', opts:['khauchånti','khauchi','khauchå','piuchånti'], ans:0, why:'They → khauchånti; bhatå = cooked rice.', gloss:'bhatå = rice'},
    {t:'intro', odia:'Mu jauchi! → Mu råhuchi!', gloss:'Bye! → Bye-bye!', note:'When someone leaves they say <b>Mu jauchi!</b> (“I’m going”). You reply <b>Mu råhuchi!</b> (“I’m staying”) — that’s bye-bye.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mu pani piuchi', ans:['I','am','drinking','water'], dist:['eating','tea','he'], gloss:'pani = water'},
    {t:'choice', q:'What does this mean?', show:'Tåme kånå piuchå?', opts:[{a:'What are you drinking?'},{a:'What are you eating?'},{a:'Are you drinking water?'}], ans:0, why:'kånå = what; piuchå = drinking.'},
    {t:'assemble', q:'Build in Odia: “What are you eating?”  (informal)', gloss:'kånå = what', ans:['Tåme','kånå','khauchå'], dist:['piuchå','khauchånti']},
    {t:'type', q:'Type in Odia: “I am eating”', ans:'Mu khauchi', alts:['mu khauchi']}
  ]},
{ id:'neg', title:'Saying No', sub:'Negation · 14 steps', items:[
    {t:'intro', odia:'åchi → nahi', gloss:'is → is not', note:'To negate <b>åchi</b>, use <b>nahi</b>. Rabi ghåre åchi → Rabi ghåre <b>nahi</b> (Rabi is not home).'},
    {t:'intro', odia:'åchånti → nahanti', gloss:'(respectful) is not', note:'The respectful <b>åchånti</b> becomes <b>nahanti</b>.'},
    {t:'choice', q:'How do you say “They are not home”?  (respectful)', opts:[{a:'Semane ghåre nahanti'},{a:'Semane ghåre åchånti'},{a:'Semane ghåre nahi'}], ans:0, why:'Respectful negative → <b>nahanti</b>.'},
    {t:'intro', odia:'verb + ni', gloss:'not (doing)', note:'For action verbs, add <b>-ni</b>. Mu jauchi (going) → Mu <b>jauni</b> (not going). Mu asuni (not coming), Mu khauni (not eating).'},
    {t:'match', q:'Match the pairs', pairs:[['nahi','is not'],['jauni','not going'],['asuni','not coming'],['khauni','not eating']]},
    {t:'choice', q:'What does this mean?', show:'Mu kichi anuni', opts:[{a:'I am not bringing anything'},{a:'I am bringing something'},{a:'I am not coming'}], ans:0, why:'kichi = anything; anuni = not bringing.'},
    {t:'assemble', q:'Build in Odia: “Rabi is not home”', gloss:'ghåre = home', ans:['Rabi','ghåre','nahi'], dist:['åchi','nahanti']},
    {t:'choice', q:'How do you say “Gopal is not coming”?', opts:[{a:'Gopal asuni'},{a:'Gopal asuchi'},{a:'Gopal jauni'}], ans:0, why:'coming = asuchi → not coming = <b>asuni</b>.'},
    {t:'intro', odia:'nuhe', gloss:'it isn’t (identity / quality)', note:'To say something <i>isn’t</i> a certain thing or quality, use <b>nuhe</b>, not nahi. Seu <b>nuhe</b> = it isn’t an apple. Ambå mitha <b>nuhe</b> = the mango isn’t sweet.'},
    {t:'choice', q:'What does this mean?', show:'Ambå mitha nuhe', opts:[{a:'The mango isn’t sweet'},{a:'There’s no mango'},{a:'The mango is sweet'}], ans:0, why:'nuhe negates the quality (mitha = sweet).'},
    {t:'assemble', q:'Build in Odia: “I am not eating rice”', gloss:'bhatå = rice', ans:['Mu','bhatå','khauni'], dist:['khauchi','piuni']},
    {t:'cloze', q:'Complete: “He is not well”  (informal)', pre:'Se bhålå', post:'', opts:['nahi','nahanti','nuhe','ni'], ans:0, why:'Negating åchi (informal) → <b>nahi</b>.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Gopal asuni', ans:['Gopal','is','not','coming'], dist:['going','eating','are'], gloss:'Gopal = a name'},
    {t:'type', q:'Type in Odia: “I am not going”', ans:'Mu jauni', alts:['mu jauni']}
  ]},
{ id:'need', title:'I Need, I Want', sub:'Needs & wants · 13 steps', items:[
    {t:'intro', odia:'Morå pani dårkar', gloss:'I need water', note:'<b>dårkar</b> = need/want. Odia says it oddly: “<b>My</b> need is water.” Use the possessive — morå, tåmårå, tarå.'},
    {t:'intro', odia:'Tåmårå kånå dårkar?', gloss:'What do you want?  (informal)', note:'Respectfully, <b>Apånånkårå kånå dårkar?</b> kånå = what.'},
    {t:'choice', q:'How do you say “I need milk”?', opts:[{a:'Morå khirå dårkar'},{a:'Mu khirå dårkar'},{a:'Morå khirå åchi'}], ans:0, why:'Need uses the possessive — <b>Morå</b> … dårkar. khirå = milk.'},
    {t:'match', q:'Match the pairs', pairs:[['dårkar','need, want'],['khirå','milk'],['pani','water'],['kånå','what']]},
    {t:'choice', q:'What does this mean?', show:'Tarå tånka dårkar', opts:[{a:'He needs money'},{a:'He has money'},{a:'I need money'}], ans:0, why:'Tarå = his; tånka = money.'},
    {t:'assemble', q:'Build in Odia: “I need this book”', gloss:'ei … -ta = this', ans:['Morå','ei','båhi-ta','dårkar'], dist:['tåmårå','åchi']},
    {t:'intro', odia:'Au pani dårkar-ki?', gloss:'Do you want more water?', note:'<b>Au</b> = more. <b>Au nahi</b> = no more.'},
    {t:'choice', q:'What does this mean?', show:'Apånånkårå kånå dårkar?', opts:[{a:'What do you want?'},{a:'What do you have?'},{a:'Where are you going?'}], ans:0, why:'respectful “you” (apånånkårå) + dårkar.'},
    {t:'assemble', q:'Build in Odia: “I need water”', gloss:'dårkar = need', ans:['Morå','pani','dårkar'], dist:['khirå','åchi']},
    {t:'cloze', q:'Say: “I don’t need anything”', pre:'Morå kichi dårkar', post:'', opts:['nahi','ni','nuhe','nahanti'], ans:0, why:'dårkar is negated with <b>nahi</b>. kichi = anything.'},
    {t:'choice', q:'How do you ask a friend “What do you want?”', opts:[{a:'Tåmårå kånå dårkar?'},{a:'Apånånkårå kånå dårkar?'},{a:'Morå kånå dårkar?'}], ans:0, why:'A friend → informal <b>tåmårå</b>.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Morå kichi dårkar nahi', ans:['I','don’t','need','anything'], dist:['want','water','have']},
    {t:'type', q:'Type in Odia: “I need water”', ans:'Morå pani dårkar', alts:['mora pani darkar']}
  ]},
{ id:'market', title:'At the Market', sub:'Shopping phrases · 14 steps', items:[
    {t:'intro', odia:'Diå! · Diåntu!', gloss:'Give!  (inf · resp)', note:'At the market, <b>Diå!</b> = “give” (informal). Politely, <b>Diåntu!</b> Gote kilo diå! = “Give one kilo!”'},
    {t:'intro', odia:'Kete tånka?', gloss:'How much (price)?', note:'<b>Kete tånka?</b> or <b>Kete påisa?</b> = “What’s the price?” tånka = rupees.'},
    {t:'choice', q:'How do you ask a price?', opts:[{a:'Kete tånka?'},{a:'Keteta?'},{a:'Kete bele?'}], ans:0, why:'Price → <b>kete tånka</b>. (keteta = how many; kete bele = at what time)'},
    {t:'match', q:'Match the pairs', pairs:[['Diå','give'],['Kete tånka','what price'],['Setiki tau','enough'],['Dhånyåvad','thank you']]},
    {t:'intro', odia:'Eita diå! · Seita diå!', gloss:'Give this! · Give that!', note:'Point and ask. <b>Setiki tau</b> = that’s enough. <b>Au?</b> = anything more?'},
    {t:'choice', q:'What does this mean?', show:'Ådha kilo diå', opts:[{a:'Give half a kilo'},{a:'Give one kilo'},{a:'Give me that'}], ans:0, why:'ådha = half.'},
    {t:'intro', odia:'Mitha-ki? · Påchilå-ki?', gloss:'Is it sweet? · Is it ripe?', note:'<b>-ki</b> makes the yes/no question. Bhålå! = good. Eita khårap! = this is bad.'},
    {t:'assemble', q:'Build in Odia: “Give one kilo!”', gloss:'gote = one · diå = give', ans:['Gote','kilo','diå'], dist:['Ådha','diåntu']},
    {t:'choice', q:'What does this mean?', show:'Eita bhålå nahi!', opts:[{a:'This is not good!'},{a:'This is good!'},{a:'Is this good?'}], ans:0, why:'bhålå = good; nahi negates it.'},
    {t:'choice', q:'How do you ask “Is it ripe?”', opts:[{a:'Påchilå-ki?'},{a:'Mitha-ki?'},{a:'Bhålå-ki?'}], ans:0, why:'påchilå = ripe. (mitha = sweet)'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Au nahi', ans:['No','more'], dist:['enough','give','yes']},
    {t:'intro', odia:'Dhånyåvad!', gloss:'Thank you!', note:'<b>Båhut dhånyåvad!</b> = thank you very much. Påriba = vegetables, Manså = meat.'},
    {t:'assemble', q:'Build in Odia: “Give this!”', gloss:'Eita = this', ans:['Eita','diå'], dist:['Seita','diåntu']},
    {t:'type', q:'Type in Odia: “thank you”', ans:'Dhånyåvad', alts:['dhanyavad','dhanyabad']}
  ]},
{ id:'commands', title:'Simple Commands', sub:'Telling kids what to do · 17 steps', items:[
    {t:'intro', odia:'Ruhå!', gloss:'Stop!', note:'With children you use the plain, <b>informal</b> command form. <b>Ruhå!</b> = Stop! / Wait! (You may also hear <b>Råhå!</b> = stay.)'},
    {t:'intro', odia:'Dekhå!', gloss:'Look out!', note:'<b>Dekhå!</b> is literally “Look!” — used to warn, “watch out!”'},
    {t:'intro', odia:'Eita bipadå', gloss:'This is dangerous', note:'<b>bipadå</b> = danger, so <b>Eita bipadå</b> = “this is dangerous.” On its own, <b>Bipadå!</b> = “Danger!”'},
    {t:'choice', q:'What does this mean?', show:'Dekhå!', opts:[{a:'Look out!'},{a:'Stop!'},{a:'Come here!'}], ans:0},
    {t:'intro', odia:'Jagrata thå', gloss:'Be careful', note:'<b>Jagrata</b> = alert, <b>thå</b> = stay/be → “stay alert.”'},
    {t:'match', q:'Match the pairs', pairs:[['Ruhå','Stop!'],['Dekhå','Look out!'],['Bipadå','Danger'],['Jagrata thå','Be careful']]},
    {t:'intro', odia:'Seita chuañ nahi', gloss:'Don’t touch that', note:'Add <b>nahi</b> to a command to say “don’t.” chuañ = touch; Seita = that.'},
    {t:'intro', odia:'Dhaudå nahi · Kårå nahi', gloss:'Don’t run · Don’t do it', note:'Same pattern — command + <b>nahi</b>. dhaudå (run), kårå (do).'},
    {t:'choice', q:'How do you say “Don’t run”?', opts:[{a:'Dhaudå nahi'},{a:'Chuañ nahi'},{a:'Kårå nahi'}], ans:0, why:'run = <b>dhaudå</b>.'},
    {t:'assemble', q:'Build in Odia: “Don’t touch that”', gloss:'Seita = that', ans:['Seita','chuañ','nahi'], dist:['Eita','kårå']},
    {t:'intro', odia:'Emiti kårå · Semiti kårå', gloss:'Do it like this · like that', note:'<b>Emiti</b> = like this, <b>Semiti</b> = like that; <b>kårå</b> = do.'},
    {t:'choice', q:'What does this mean?', show:'Semiti kårå', opts:[{a:'Do it like that'},{a:'Do it like this'},{a:'Don’t do it'}], ans:0},
    {t:'intro', odia:'Eithiki aså · Seithiki jaå', gloss:'Come here · Go there', note:'<b>aså</b> = come, <b>jaå</b> = go. eithiki = to here, seithiki = to there.'},
    {t:'assemble', q:'Build in Odia: “Come here”', gloss:'aså = come', ans:['Eithiki','aså'], dist:['Seithiki','jaå']},
    {t:'cloze', q:'Say: “Don’t go there”', pre:'Seithiki jaå', post:'', opts:['nahi','kårå','tike','aså'], ans:0, why:'command + <b>nahi</b> = “don’t”.'},
    {t:'choice', q:'What does this mean?', show:'Eita bhålå nahi', opts:[{a:'This is not good'},{a:'This is good'},{a:'Don’t do it'}], ans:0},
    {t:'type', q:'Type in Odia: “Stop!”', ans:'Ruhå', alts:['ruha']}
  ]},
{ id:'letswords', title:'Let’s… & Everyday Words', sub:'Let’s go, play, eat + small words · 16 steps', items:[
    {t:'intro', odia:'Aså jibå', gloss:'Let’s go', note:'<b>Aså</b> = come; the <b>-ibå</b> ending makes “let’s …”. Aså jibå = “come, let’s go.”'},
    {t:'intro', odia:'Aså khaibå · Aså pibå', gloss:'Let’s eat · Let’s drink', note:'khaibå (eat), pibå (drink) — same “let’s” pattern.'},
    {t:'match', q:'Match the pairs', pairs:[['Aså jibå','Let’s go'],['Aså khaibå','Let’s eat'],['Aså pibå','Let’s drink'],['Aså khelibå','Let’s play']]},
    {t:'intro', odia:'Aså khelibå · Jaå, khelå', gloss:'Let’s play · Go play', note:'<b>khelå</b> = play (a command); <b>khelibå</b> = let’s play.'},
    {t:'choice', q:'How do you say “Let’s eat”?', opts:[{a:'Aså khaibå'},{a:'Aså pibå'},{a:'Aså jibå'}], ans:0},
    {t:'choice', q:'What does this mean?', show:'Aså khelibå', opts:[{a:'Let’s play'},{a:'Let’s go'},{a:'Go play'}], ans:0},
    {t:'intro', odia:'tike · besi', gloss:'a little · a lot', note:'<b>tike</b> = a little bit; <b>besi</b> = a lot / more.'},
    {t:'choice', q:'What does this mean?', show:'besi', opts:[{a:'a lot'},{a:'a little'},{a:'enough'}], ans:0},
    {t:'choice', q:'Which means “a little bit”?', opts:[{a:'tike'},{a:'besi'},{a:'bhålå'}], ans:0},
    {t:'intro', odia:'Eita khai paribå', gloss:'You can eat this', note:'<b>khai paribå</b> = can eat. Eita = this.'},
    {t:'assemble', q:'Build in Odia: “Let’s go”', gloss:'Aså = come', ans:['Aså','jibå'], dist:['khaibå','jaå']},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Eita khai paribå', ans:['You','can','eat','this'], dist:['drink','that','go']},
    {t:'intro', odia:'Kichi nuhe', gloss:'You’re welcome', note:'After “thank you” (Dhånyåvad), the casual reply is <b>Kichi nuhe</b> — literally “it’s nothing.” The formal word for welcome is <b>Swagatam</b>.'},
    {t:'choice', q:'What does this mean?', show:'Kichi nuhe', opts:[{a:'It’s nothing'},{a:'Thank you'},{a:'No more'}], ans:0, why:'<b>Kichi nuhe</b> = “it’s nothing” — the casual “you’re welcome.”'},
    {t:'assemble', q:'Build in Odia: “Let’s eat”', ans:['Aså','khaibå'], dist:['pibå','khelibå']},
    {t:'type', q:'Type in Odia: “a little bit”', ans:'tike', alts:['tike']}
  ]},
{ id:'deixis', title:'Here, There, This & That', sub:'The e- / s- pattern · 15 steps', items:[
    {t:'intro', odia:'eita · seita', gloss:'this · that', note:'<b>eita</b> = this (one), <b>seita</b> = that (one). Notice: <b>e-</b> points at “here/this”, <b>s-</b> at “there/that”. That pattern runs through all of these.'},
    {t:'intro', odia:'eithi · seithi', gloss:'here · there', note:'<b>eithi</b> = here, <b>seithi</b> = there — same e-/s- pattern.'},
    {t:'match', q:'Match the pairs', pairs:[['eita','this'],['seita','that'],['eithi','here'],['seithi','there']]},
    {t:'choice', q:'What does this mean?', show:'seithi', opts:[{a:'there'},{a:'here'},{a:'that'}], ans:0},
    {t:'intro', odia:'emiti · semiti', gloss:'like this · like that', note:'The pattern again — <b>emiti</b> (like this), <b>semiti</b> (like that).'},
    {t:'choice', q:'Which means “here”?', opts:[{a:'eithi'},{a:'seithi'},{a:'eita'}], ans:0},
    {t:'intro', odia:'eithiki · seithiki', gloss:'to here · to there', note:'Add <b>-ki</b> for motion: <b>eithiki aså</b> (come here), <b>seithiki jaå</b> (go there).'},
    {t:'assemble', q:'Build in Odia: “Come here”', gloss:'aså = come', ans:['Eithiki','aså'], dist:['Seithiki','jaå']},
    {t:'choice', q:'What does this mean?', show:'eita', opts:[{a:'this'},{a:'that'},{a:'here'}], ans:0},
    {t:'match', q:'Match the pairs', pairs:[['emiti','like this'],['semiti','like that'],['eithiki','to here'],['seithiki','to there']]},
    {t:'assemble', q:'Build in Odia: “Go there”', gloss:'jaå = go', ans:['Seithiki','jaå'], dist:['Eithiki','aså']},
    {t:'cloze', q:'Complete: “Do it like this”', pre:'', post:'kårå', opts:['Emiti','Semiti','Eita','Seita'], ans:0, why:'like this = <b>emiti</b>.', gloss:'kårå = do (it)'},
    {t:'choice', q:'Which is the “there / that” side of the pattern?', opts:[{a:'seithi, seita'},{a:'eithi, eita'},{a:'seithi, eita'}], ans:0, why:'<b>s-</b> = there / that.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'eithiki aså', ans:['Come','here'], dist:['there','go','this']},
    {t:'type', q:'Type in Odia: “here”', ans:'eithi', alts:['eithi']}
  ]},
{ id:'greetings', title:'Greetings', sub:'Hello, goodbye, good morning · 14 steps', items:[
    {t:'intro', odia:'Namaskar', gloss:'Hello', note:'<b>Namaskar</b> (palms together) is the all-purpose polite greeting — hello <i>and</i> goodbye, any time of day, with anyone you’d address respectfully.'},
    {t:'intro', odia:'Subha såkalå', gloss:'Good morning', note:'<b>Subha</b> = good / auspicious; <b>såkalå</b> = morning.'},
    {t:'intro', odia:'Subha såndhya', gloss:'Good evening', note:'<b>såndhya</b> = evening.'},
    {t:'intro', odia:'Subha ratri', gloss:'Good night', note:'<b>ratri</b> = night (casually, <b>rati</b>).'},
    {t:'match', q:'Match the pairs', pairs:[['Namaskar','Hello'],['Subha såkalå','Good morning'],['Subha såndhya','Good evening'],['Subha ratri','Good night']]},
    {t:'choice', q:'What does this mean?', show:'Subha såkalå', opts:[{a:'Good morning'},{a:'Good evening'},{a:'Good night'}], ans:0},
    {t:'choice', q:'How do you greet someone politely, any time of day?', opts:[{a:'Namaskar'},{a:'Subha ratri'},{a:'Dhånyåvad'}], ans:0, why:'<b>Namaskar</b> works any time — hello or goodbye. (Dhånyåvad = thank you.)'},
    {t:'intro', odia:'Bidåy namaskar', gloss:'Goodbye', note:'For a clear “goodbye,” <b>Bidåy namaskar</b> (bidåy = farewell) — or just <b>Namaskar</b> again.'},
    {t:'choice', q:'What does this mean?', show:'Subha ratri', opts:[{a:'Good night'},{a:'Good morning'},{a:'Goodbye'}], ans:0},
    {t:'intro', odia:'Mu jauchi! · Mu råhuchi!', gloss:'(casual) Bye! · Bye-bye!', note:'Casually, the one leaving says <b>Mu jauchi!</b> (“I’m going”); the one staying replies <b>Mu råhuchi!</b> (“I’m staying”). You met this in Simple Commands.'},
    {t:'assemble', q:'Build in Odia: “Good morning”', gloss:'Subha = good', ans:['Subha','såkalå'], dist:['såndhya','ratri']},
    {t:'choice', q:'What does this mean?', show:'Subha såndhya', opts:[{a:'Good evening'},{a:'Good morning'},{a:'Good night'}], ans:0},
    {t:'assemble', q:'Build in Odia: “Good night”', ans:['Subha','ratri'], dist:['såkalå','såndhya']},
    {t:'type', q:'Type in Odia: “Hello”', ans:'Namaskar', alts:['namaskar','namaskar']}
  ]},
{ id:'names', title:'Names', sub:'Your name & asking others · 14 steps', items:[
    {t:'intro', odia:'namo', gloss:'name', note:'<b>namo</b> = name. Say <b>Morå namo</b> + your name — no verb needed.'},
    {t:'intro', odia:'Morå namo {name}', gloss:'My name is {name}', note:'Literally “My name {name}.” Just <b>Morå namo</b> + your name — no verb needed.'},
    {t:'intro', odia:'Tåmårå namo kånå?', gloss:'What’s your name?  (informal)', note:'<b>kånå</b> = what. Literally “Your name what?”'},
    {t:'intro', odia:'Apånånkårå namo kånå?', gloss:'What’s your name?  (respectful)', note:'Use <b>apånånkårå</b> (respectful “your”) with elders and strangers.'},
    {t:'match', q:'Match the pairs', pairs:[['namo','name'],['kånå','what'],['Morå','my'],['Apånånkårå','your (resp)']]},
    {t:'choice', q:'Ask a friend’s name (informal). Which?', opts:[{a:'Tåmårå namo kånå?'},{a:'Apånånkårå namo kånå?'},{a:'Morå namo kånå?'}], ans:0, why:'A friend → informal <b>tåmårå</b>.'},
    {t:'choice', q:'Ask an elder’s name (respectful). Which?', opts:[{a:'Apånånkårå namo kånå?'},{a:'Tåmårå namo kånå?'},{a:'Tarå namo kånå?'}], ans:0, why:'An elder → respectful <b>apånånkårå</b>.'},
    {t:'assemble', q:'Build in Odia: “My name is {name}”', gloss:'Morå namo = my name', ans:['Morå','namo','{name}'], dist:['kånå','Tåmårå']},
    {t:'choice', q:'What does this mean?', show:'Tåmårå namo kånå?', opts:[{a:'What’s your name?'},{a:'What’s his name?'},{a:'My name is…'}], ans:0},
    {t:'intro', odia:'Tarå namo kånå?', gloss:'What’s his/her name?', note:'<b>Tarå</b> = his/her (informal). Respectfully, <b>Tankårå namo kånå?</b>'},
    {t:'assemble', q:'Build in Odia: “What’s your name?”  (respectful)', gloss:'kånå = what', ans:['Apånånkårå','namo','kånå'], dist:['Tåmårå','Morå']},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Morå namo {name}', ans:['My','name','is','{name}'], dist:['your','what','his']},
    {t:'choice', q:'What does this mean?', show:'Tarå namo kånå?', opts:[{a:'What’s his name?'},{a:'What’s your name?'},{a:'What’s my name?'}], ans:0},
    {t:'type', q:'Type in Odia: “name”', ans:'namo', alts:['nam','nama','na','namo']}
  ]},
{ id:'past', title:'Past Tense — I', sub:'Saying "I did" · 12 steps', items:[
    {t:'intro', odia:'Mu asili', gloss:'I came', note:'The past adds an ending to the verb root. For <b>I</b> it is <b>-ili</b>: <b>Asiba</b> (to come) → <b>Mu asili</b> = I came.'},
    {t:'intro', odia:'Mu khaili', gloss:'I ate', note:'<b>Khaiba</b> (to eat) → <b>Mu khaili</b>. The "I did" ending is always <b>-ili</b>.'},
    {t:'choice', q:'How do you say "I did"?', opts:[{a:'Mu kårili'},{a:'Mu kåruchi'},{a:'Mu kåribi'}], ans:0, why:'<b>-ili</b> = past. (-uchi = present, -ibi = future.)'},
    {t:'intro', odia:'Mu dekhili', gloss:'I saw', note:'<b>Dekhiba</b> (to see) → <b>Mu dekhili</b> = I saw.'},
    {t:'match', pairs:[['Mu asili','I came'],['Mu khaili','I ate'],['Mu dekhili','I saw'],['Mu kårili','I did']]},
    {t:'cloze', q:'Complete: "I ate rice"', pre:'Mu bhatå', post:'', opts:['khaili','khauchi','khaibi'], ans:0, why:'<b>bhatå</b> = rice. Past "ate" = <b>khaili</b>.'},
    {t:'assemble', q:'Build in Odia: "I saw the elephant"', gloss:'hati = elephant', ans:['Mu','hati','dekhili'], dist:['dekhibi','khaili']},
    {t:'cloze', q:'Complete: "I went home"', pre:'Mu ghåre', post:'', opts:['gåli','jauchi','jibi'], ans:0, why:'"Go" is irregular in the past — not "jili" but <b>gåli</b> = went.'},
    {t:'choice', q:'Which means "I saw"?', opts:[{a:'Mu dekhili'},{a:'Mu dekhibi'},{a:'Mu dekhuchi'}], ans:0, why:'<b>-ili</b> = past, so <b>dekhili</b> = saw.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mu ghåre asili', ans:['I','came','home'], dist:['will','went']},
    {t:'type', q:'Type in Odia: "I came"', ans:'Mu asili', alts:['mu asili']},
    {t:'type', q:'Type in Odia: "I ate"', ans:'Mu khaili', alts:['mu khaili']}
  ]},
{ id:'future', title:'Future Tense — I', sub:'Saying "I will" · 12 steps', items:[
    {t:'intro', odia:'Mu asibi', gloss:'I will come', note:'The future adds an ending to the root. For <b>I</b> it is <b>-ibi</b>: <b>Asiba</b> → <b>Mu asibi</b> = I will come.'},
    {t:'intro', odia:'Mu khaibi', gloss:'I will eat', note:'<b>Khaiba</b> → <b>Mu khaibi</b> = I will eat.'},
    {t:'choice', q:'How do you say "I will do"?', opts:[{a:'Mu kåribi'},{a:'Mu kårili'},{a:'Mu kåruchi'}], ans:0, why:'<b>-ibi</b> = future. (-ili = past, -uchi = present.)'},
    {t:'intro', odia:'Mu jibi', gloss:'I will go', note:'<b>Jiba</b> (to go) → <b>Mu jibi</b> = I will go.'},
    {t:'match', pairs:[['Mu asibi','I will come'],['Mu khaibi','I will eat'],['Mu jibi','I will go'],['Mu dekhibi','I will see']]},
    {t:'cloze', q:'Complete: "I will eat rice"', pre:'Mu bhatå', post:'', opts:['khaibi','khaili','khauchi'], ans:0, why:'Future "will eat" = <b>khaibi</b>.'},
    {t:'assemble', q:'Build in Odia: "I will go to the market"', gloss:'bajår = market', ans:['Mu','bajår','jibi'], dist:['gåli','khaibi']},
    {t:'choice', q:'Which means "I will go"?', opts:[{a:'Mu jibi'},{a:'Mu gåli'},{a:'Mu jauchi'}], ans:0, why:'<b>-ibi</b> = future. <b>jibi</b> = will go.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mu asibi', ans:['I','will','come'], dist:['came','go']},
    {t:'cloze', q:'Complete: "I will see"', pre:'Mu', post:'', opts:['dekhibi','dekhili','dekhuchi'], ans:0, why:'Future "will see" = <b>dekhibi</b>.'},
    {t:'type', q:'Type in Odia: "I will come"', ans:'Mu asibi', alts:['mu asibi']},
    {t:'type', q:'Type in Odia: "I will eat"', ans:'Mu khaibi', alts:['mu khaibi']}
  ]},
{ id:'pastprog', title:'Past Progressive — I was doing', sub:'I was ...-ing · 11 steps', items:[
    {t:'intro', odia:'Mu asuthili', gloss:'I was coming', note:'For "I <b>was</b> doing" something, use the root + <b>-uthili</b>. <b>Asiba</b> → <b>Mu asuthili</b> = I was coming.'},
    {t:'intro', odia:'Mu khauthili', gloss:'I was eating', note:'<b>Khaiba</b> → <b>Mu khauthili</b> = I was eating.'},
    {t:'choice', q:'How do you say "I was doing"?', opts:[{a:'Mu karuthili'},{a:'Mu karili'},{a:'Mu karibi'}], ans:0, why:'<b>-uthili</b> = was doing (ongoing past). <b>-ili</b> = did, <b>-ibi</b> = will do.'},
    {t:'intro', odia:'Mu jauthili', gloss:'I was going', note:'<b>Jiba</b> → <b>Mu jauthili</b> = I was going.'},
    {t:'match', pairs:[['Mu asuthili','I was coming'],['Mu khauthili','I was eating'],['Mu jauthili','I was going'],['Mu dekhuthili','I was watching']]},
    {t:'choice', q:'Which means "I was eating"?', opts:[{a:'Mu khauthili'},{a:'Mu khaili'},{a:'Mu khaibi'}], ans:0, why:'<b>khauthili</b> = was eating. (khaili = ate, khaibi = will eat.)'},
    {t:'cloze', q:'Complete: "I was going to the market"', pre:'Mu bajar', post:'', opts:['jauthili','gåli','jibi'], ans:0, why:'"Was going" = <b>jauthili</b>.'},
    {t:'assemble', q:'Build in Odia: "I was eating rice"', gloss:'bhatå = rice', ans:['Mu','bhatå','khauthili'], dist:['khaili','Se']},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mu asuthili', ans:['I','was','coming'], dist:['came','will']},
    {t:'cloze', q:'Ongoing vs done: "I was watching"', pre:'Mu', post:'', opts:['dekhuthili','dekhili','dekhibi'], ans:0, why:'<b>dekhuthili</b> = was watching. <b>dekhili</b> = saw.'},
    {t:'type', q:'Type in Odia: "I was coming"', ans:'Mu asuthili', alts:['mu asuthili']}
  ]},
{ id:'pastperf', title:'Past Perfect — I had done', sub:'I had already ...-ed · 11 steps', items:[
    {t:'intro', odia:'Mu asithili', gloss:'I had come', note:'For "I <b>had</b> done" something before another past moment, use the root + <b>-ithili</b>. <b>Asiba</b> → <b>Mu asithili</b> = I had come.'},
    {t:'intro', odia:'Mu khaithili', gloss:'I had eaten', note:'<b>Khaiba</b> → <b>Mu khaithili</b> = I had eaten.'},
    {t:'choice', q:'How do you say "I had done"?', opts:[{a:'Mu karithili'},{a:'Mu karuthili'},{a:'Mu karili'}], ans:0, why:'<b>-ithili</b> = had done. Compare <b>-uthili</b> = was doing, <b>-ili</b> = did.'},
    {t:'intro', odia:'Mu jaithili', gloss:'I had gone', note:'<b>Jiba</b> → <b>Mu jaithili</b> = I had gone.'},
    {t:'match', pairs:[['Mu asithili','I had come'],['Mu khaithili','I had eaten'],['Mu jaithili','I had gone'],['Mu dekhithili','I had seen']]},
    {t:'choice', q:'Which is "I had eaten"?', opts:[{a:'Mu khaithili'},{a:'Mu khauthili'},{a:'Mu khaili'}], ans:0, why:'<b>-ithili</b> (had) vs <b>-uthili</b> (was ...-ing). So <b>khaithili</b> = had eaten.'},
    {t:'cloze', q:'Complete: "I had gone home"', pre:'Mu ghare', post:'', opts:['jaithili','gåli','jauthili'], ans:0, why:'"Had gone" = <b>jaithili</b>. (gåli = went, jauthili = was going.)'},
    {t:'assemble', q:'Build in Odia: "I had seen the elephant"', gloss:'hati = elephant', ans:['Mu','hati','dekhithili'], dist:['dekhili','Se']},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mu asithili', ans:['I','had','come'], dist:['was','came']},
    {t:'cloze', q:'Complete: "I had done the work"', pre:'Mu kama', post:'', opts:['karithili','karuthili','karili'], ans:0, why:'<b>kama</b> = work. "Had done" = <b>karithili</b>.', gloss:'kama = work'},
    {t:'type', q:'Type in Odia: "I had come"', ans:'Mu asithili', alts:['mu asithili']}
  ]},
{ id:'feel1', title:'How I Feel', sub:'Hungry, cold, happy · 14 steps', items:[
    {t:'intro', odia:'Mote bhokå laguchi', gloss:'I feel hungry', note:'Odia does not say "I have hunger" — it says "to me, hunger feels." <b>Mote</b> = to me, <b>bhokå</b> = hunger, <b>laguchi</b> = feels. And <b>laguchi</b> never changes, whoever is feeling it.'},
    {t:'intro', odia:'Mote soså laguchi', gloss:'I feel thirsty', note:'<b>soså</b> = thirst. Same shape: <b>Mote ___ laguchi</b>.'},
    {t:'intro', odia:'Mote thånda laguchi', gloss:'I feel cold', note:'<b>thånda</b> = cold.'},
    {t:'intro', odia:'Mote gåråm laguchi', gloss:'I feel hot', note:'<b>gåråm</b> = hot / warm.'},
    {t:'choice', q:'What does this mean?', show:'Mote thånda laguchi', opts:[{a:'I feel cold'},{a:'I feel hot'},{a:'I am happy'}], ans:0, why:'<b>thånda</b> = cold.'},
    {t:'match', q:'Match the pairs', pairs:[['Mote bhokå laguchi','I feel hungry'],['Mote soså laguchi','I feel thirsty'],['Mote thånda laguchi','I feel cold'],['Mote gåråm laguchi','I feel hot']]},
    {t:'cloze', q:'Complete: "I feel hungry"', pre:'Mote', post:'laguchi', opts:['bhokå','soså','thånda'], ans:0, why:'hunger = <b>bhokå</b>.'},
    {t:'intro', odia:'Mu khusi åchi', gloss:'I am happy', note:'For emotions, the "be" form is common: <b>Mu khusi åchi</b> = I am happy (<b>khusi</b> = happy).'},
    {t:'intro', odia:'Mu dukhi åchi', gloss:'I am sad', note:'<b>dukhi</b> = sad. <b>Mu dukhi åchi</b> = I am sad.'},
    {t:'choice', q:'What does this mean?', show:'Mu khusi åchi', opts:[{a:'I am happy'},{a:'I am sad'},{a:'I feel cold'}], ans:0, why:'<b>khusi</b> = happy.'},
    {t:'assemble', q:'Build in Odia: "I feel hot"', gloss:'gåråm = hot', ans:['Mote','gåråm','laguchi'], dist:['bhokå','åchi']},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mu dukhi åchi', ans:['I','am','sad'], dist:['happy','feel']},
    {t:'cloze', q:'Complete: "I am happy"', pre:'Mu', post:'åchi', opts:['khusi','dukhi','bhokå'], ans:0, why:'happy = <b>khusi</b>.'},
    {t:'type', q:'Type in Odia: "I feel hungry"', ans:'Mote bhokå laguchi', alts:['mote bhoka laguchi']}
  ]},
{ id:'feel2', title:'How Do You Feel?', sub:'Asking about feelings · 11 steps', items:[
    {t:'intro', odia:'Tåme kemiti åchå?', gloss:'How do you feel?  (informal)', note:'<b>kemiti</b> = how. <b>Tåme kemiti åchå?</b> asks how someone is feeling / doing.'},
    {t:'intro', odia:'Tåmåku bhokå laguchi ki?', gloss:'Are you hungry?', note:'Add <b>ki</b> to make a yes/no question. <b>Tåmåku</b> = to you. "to-you hunger feels?" = Are you hungry?'},
    {t:'intro', odia:'Tåme khusi åchå ki?', gloss:'Are you happy?', note:'For emotions: <b>Tåme khusi åchå ki?</b> = Are you happy?'},
    {t:'choice', q:'How do you ask "Are you hungry?"', opts:[{a:'Tåmåku bhokå laguchi ki?'},{a:'Mote bhokå laguchi'},{a:'Tåme khusi åchå ki?'}], ans:0, why:'<b>ki</b> makes it a question; <b>Tåmåku</b> = to you.'},
    {t:'match', q:'Match the pairs', pairs:[['Tåme kemiti åchå?','How do you feel?'],['Tåmåku bhokå laguchi ki?','Are you hungry?'],['Tåme khusi åchå ki?','Are you happy?']]},
    {t:'intro', odia:'Hå, mote bhokå laguchi', gloss:'Yes, I feel hungry', note:'<b>Hå</b> = yes. Answer a "feeling" question the same way you say it about yourself.'},
    {t:'choice', q:'What does this mean?', show:'Tåme khusi åchå ki?', opts:[{a:'Are you happy?'},{a:'I am happy'},{a:'Are you hungry?'}], ans:0, why:'khusi = happy, ki = the question marker.'},
    {t:'assemble', q:'Build in Odia: "Are you hungry?"', gloss:'ki = the question marker', ans:['Tåmåku','bhokå','laguchi','ki?'], dist:['Mote','åchi']},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Tåme kemiti åchå?', ans:['How','do','you','feel?'], dist:['are','hungry']},
    {t:'cloze', q:'Complete: "Are you happy?"', pre:'Tåme khusi åchå', post:'', opts:['ki?','laguchi','mote'], ans:0, why:'<b>ki</b> turns it into a yes/no question.'},
    {t:'type', q:'Type in Odia: "How do you feel?"  (informal)', ans:'Tåme kemiti åchå?', alts:['tame kemiti acha','tame kemiti acha?']}
  ]},
{ id:'meals', title:'Meal Time', sub:'Eating, breakfast, food · 13 steps', items:[
    {t:'intro', odia:'jolokia', gloss:'breakfast', note:'<b>jolokia</b> = breakfast, the morning meal.'},
    {t:'intro', odia:'bhojono', gloss:'a meal', note:'<b>bhojono</b> = a meal.'},
    {t:'intro', odia:'Ame khaiba-ku jauchu', gloss:'We are going to eat', note:'<b>khaiba</b> = to eat, <b>-ku</b> = to, <b>jauchu</b> = we are going. So <b>khaiba-ku jauchu</b> = going to eat.'},
    {t:'choice', q:'What does this mean?', show:'Ame khaiba-ku jauchu', opts:[{a:'We are going to eat'},{a:'We are eating'},{a:'We will eat'}], ans:0, why:'<b>khaiba-ku jauchu</b> = going to eat.'},
    {t:'match', q:'Match the pairs', pairs:[['jolokia','breakfast'],['bhojono','a meal'],['bhatå','rice'],['machå','fish']]},
    {t:'intro', odia:'eita khai paribå', gloss:'You can eat this', note:'<b>khai paribå</b> = can eat. So <b>eita khai paribå</b> = you can eat this.'},
    {t:'choice', q:'Which means "You can eat this"?', opts:[{a:'eita khai paribå'},{a:'eita khauchu'},{a:'Mu eita khaili'}], ans:0, why:'<b>khai paribå</b> = can eat.'},
    {t:'cloze', q:'Complete: "I ate breakfast"', pre:'Mu jolokia', post:'', opts:['khaili','khaibi','khauchi'], ans:0, why:'Past "ate" = <b>khaili</b>.'},
    {t:'assemble', q:'Build in Odia: "We are going to eat"', gloss:'khaiba-ku = to eat', ans:['Ame','khaiba-ku','jauchu'], dist:['khaili','Se']},
    {t:'cloze', q:'Complete: "I will eat rice"', pre:'Mu bhatå', post:'', opts:['khaibi','khaili','khauchi'], ans:0, why:'Future "will eat" = <b>khaibi</b>.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Mu machå khaili', ans:['I','ate','fish'], dist:['will','rice']},
    {t:'choice', q:'What does this mean?', show:'bhojono', opts:[{a:'a meal'},{a:'breakfast'},{a:'rice'}], ans:0, why:'<b>bhojono</b> = a meal.'},
    {t:'type', q:'Type in Odia: "breakfast"', ans:'jolokia', alts:['jalakhia']}
  ]},
{ id:'pastyou', title:'Past: You (informal)', sub:'Tåme — past tense · 9 steps', items:[
    {t:'intro', odia:'Tåme asilå', gloss:'You came', note:'Past tense for <b>you (informal)</b> uses <b>-ilå</b>: <b>Tåme asilå</b> = you came.'},
    {t:'intro', odia:'Tåme khailå', gloss:'You ate', note:'Same <b>-ilå</b> ending on any verb: <b>Tåme khailå</b>.'},
    {t:'choice', q:'How do you say "You saw"?', opts:[{a:'Tåme dekhilå'},{a:'Mu dekhili'},{a:'Tåme dekhibå'}], ans:0, why:'you (informal) = <b>-ilå</b>: <b>Tåme dekhilå</b>.'},
    {t:'match', pairs:[['Tåme asilå','You came'],['Tåme khailå','You ate'],['Tåme dekhilå','You saw'],['Tåme kårilå','You did']]},
    {t:'cloze', q:'Complete: "You ate rice"', pre:'Tåme bhatå', post:'', opts:['khailå','khaili','khaibå'], ans:0, why:'<b>khailå</b> = you ate.'},
    {t:'assemble', q:'Build in Odia: "You came home"', gloss:'ghåre = at home', ans:['Tåme','ghåre','asilå'], dist:['asili','Mu']},
    {t:'choice', q:'What does this mean?', show:'Tåme asilå', opts:[{a:'You came'},{a:'I came'},{a:'You will come'}], ans:0, why:'<b>Tåme asilå</b> = You came. (<b>Mu asili</b> = I came.)'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Tåme khailå', ans:['You','ate'], dist:['I','will']},
    {t:'type', q:'Type in Odia: "You came"', ans:'Tåme asilå', alts:['tame asila']}
  ]},
{ id:'pasthe', title:'Past: He / She', sub:'Se — past tense · 9 steps', items:[
    {t:'intro', odia:'Se asila', gloss:'He/She came', note:'Past tense for <b>he / she</b> uses <b>-ila</b>: <b>Se asila</b> = he/she came.'},
    {t:'intro', odia:'Se khaila', gloss:'He/She ate', note:'Same <b>-ila</b> ending on any verb: <b>Se khaila</b>.'},
    {t:'choice', q:'How do you say "He/She saw"?', opts:[{a:'Se dekhila'},{a:'Mu dekhili'},{a:'Se dekhibå'}], ans:0, why:'he / she = <b>-ila</b>: <b>Se dekhila</b>.'},
    {t:'match', pairs:[['Se asila','He/She came'],['Se khaila','He/She ate'],['Se dekhila','He/She saw'],['Se kårila','He/She did']]},
    {t:'cloze', q:'Complete: "He/She ate rice"', pre:'Se bhatå', post:'', opts:['khaila','khaili','khaibå'], ans:0, why:'<b>khaila</b> = he/she ate.'},
    {t:'assemble', q:'Build in Odia: "He/She came home"', gloss:'ghåre = at home', ans:['Se','ghåre','asila'], dist:['asili','Mu']},
    {t:'choice', q:'What does this mean?', show:'Se asila', opts:[{a:'He/She came'},{a:'I came'},{a:'He/She will come'}], ans:0, why:'<b>Se asila</b> = He/She came. (<b>Mu asili</b> = I came.)'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Se khaila', ans:['He/She','ate'], dist:['I','will']},
    {t:'type', q:'Type in Odia: "He/She came"', ans:'Se asila', alts:['se asila']}
  ]},
{ id:'pastresp', title:'Past: You (respectful)', sub:'Apånå — past tense · 9 steps', items:[
    {t:'intro', odia:'Apånå asile', gloss:'You came', note:'Past tense for <b>you (respectful)</b> uses <b>-ile</b>: <b>Apånå asile</b> = you came. This form also covers <b>they</b>.'},
    {t:'intro', odia:'Apånå khaile', gloss:'You ate', note:'Same <b>-ile</b> ending on any verb: <b>Apånå khaile</b>.'},
    {t:'choice', q:'How do you say "You saw"?', opts:[{a:'Apånå dekhile'},{a:'Mu dekhili'},{a:'Apånå dekhibe'}], ans:0, why:'you (respectful) = <b>-ile</b>: <b>Apånå dekhile</b>.'},
    {t:'match', pairs:[['Apånå asile','You came'],['Apånå khaile','You ate'],['Apånå dekhile','You saw'],['Apånå kårile','You did']]},
    {t:'cloze', q:'Complete: "You ate rice"', pre:'Apånå bhatå', post:'', opts:['khaile','khaili','khaibe'], ans:0, why:'<b>khaile</b> = you ate.'},
    {t:'assemble', q:'Build in Odia: "You came home"', gloss:'ghåre = at home', ans:['Apånå','ghåre','asile'], dist:['asili','Mu']},
    {t:'choice', q:'What does this mean?', show:'Apånå asile', opts:[{a:'You came'},{a:'I came'},{a:'You will come'}], ans:0, why:'<b>Apånå asile</b> = You came. (<b>Mu asili</b> = I came.)'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Apånå khaile', ans:['You','ate'], dist:['I','will']},
    {t:'type', q:'Type in Odia: "You came"', ans:'Apånå asile', alts:['apana asile']}
  ]},
{ id:'pastwe', title:'Past: We', sub:'Ame — past tense · 9 steps', items:[
    {t:'intro', odia:'Ame asilu', gloss:'We came', note:'Past tense for <b>we</b> uses <b>-ilu</b>: <b>Ame asilu</b> = we came.'},
    {t:'intro', odia:'Ame khailu', gloss:'We ate', note:'Same <b>-ilu</b> ending on any verb: <b>Ame khailu</b>.'},
    {t:'choice', q:'How do you say "We saw"?', opts:[{a:'Ame dekhilu'},{a:'Mu dekhili'},{a:'Ame dekhibu'}], ans:0, why:'we = <b>-ilu</b>: <b>Ame dekhilu</b>.'},
    {t:'match', pairs:[['Ame asilu','We came'],['Ame khailu','We ate'],['Ame dekhilu','We saw'],['Ame kårilu','We did']]},
    {t:'cloze', q:'Complete: "We ate rice"', pre:'Ame bhatå', post:'', opts:['khailu','khaili','khaibu'], ans:0, why:'<b>khailu</b> = we ate.'},
    {t:'assemble', q:'Build in Odia: "We came home"', gloss:'ghåre = at home', ans:['Ame','ghåre','asilu'], dist:['asili','Mu']},
    {t:'choice', q:'What does this mean?', show:'Ame asilu', opts:[{a:'We came'},{a:'I came'},{a:'We will come'}], ans:0, why:'<b>Ame asilu</b> = We came. (<b>Mu asili</b> = I came.)'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Ame khailu', ans:['We','ate'], dist:['I','will']},
    {t:'type', q:'Type in Odia: "We came"', ans:'Ame asilu', alts:['ame asilu']}
  ]},
{ id:'futureyou', title:'Future: You (informal)', sub:'Tåme — future tense · 9 steps', items:[
    {t:'intro', odia:'Tåme asibå', gloss:'You will come', note:'Future tense for <b>you (informal)</b> uses <b>-ibå</b>: <b>Tåme asibå</b> = you will come.'},
    {t:'intro', odia:'Tåme khaibå', gloss:'You will eat', note:'Same <b>-ibå</b> ending on any verb: <b>Tåme khaibå</b>.'},
    {t:'choice', q:'How do you say "You will see"?', opts:[{a:'Tåme dekhibå'},{a:'Mu dekhibi'},{a:'Tåme dekhilå'}], ans:0, why:'you (informal) = <b>-ibå</b>: <b>Tåme dekhibå</b>.'},
    {t:'match', pairs:[['Tåme asibå','You will come'],['Tåme khaibå','You will eat'],['Tåme dekhibå','You will see'],['Tåme kåribå','You will do']]},
    {t:'cloze', q:'Complete: "You will eat rice"', pre:'Tåme bhatå', post:'', opts:['khaibå','khaibi','khailå'], ans:0, why:'<b>khaibå</b> = you will eat.'},
    {t:'assemble', q:'Build in Odia: "You will come home"', gloss:'ghåre = at home', ans:['Tåme','ghåre','asibå'], dist:['asibi','Mu']},
    {t:'choice', q:'What does this mean?', show:'Tåme asibå', opts:[{a:'You will come'},{a:'I will come'},{a:'You came'}], ans:0, why:'<b>Tåme asibå</b> = You will come. (<b>Mu asibi</b> = I will come.)'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Tåme khaibå', ans:['You','will','eat'], dist:['I','ate']},
    {t:'type', q:'Type in Odia: "You will come"', ans:'Tåme asibå', alts:['tame asiba']}
  ]},
{ id:'futurehe', title:'Future: He / She', sub:'Se — future tense · 9 steps', items:[
    {t:'intro', odia:'Se asibå', gloss:'He/She will come', note:'Future tense for <b>he / she</b> uses <b>-ibå</b>: <b>Se asibå</b> = he/she will come. (This is the same <b>-ibå</b> ending as informal "you".)'},
    {t:'intro', odia:'Se khaibå', gloss:'He/She will eat', note:'Same <b>-ibå</b> ending on any verb: <b>Se khaibå</b>.'},
    {t:'choice', q:'How do you say "He/She will see"?', opts:[{a:'Se dekhibå'},{a:'Mu dekhibi'},{a:'Se dekhila'}], ans:0, why:'he / she = <b>-ibå</b>: <b>Se dekhibå</b>.'},
    {t:'match', pairs:[['Se asibå','He/She will come'],['Se khaibå','He/She will eat'],['Se dekhibå','He/She will see'],['Se kåribå','He/She will do']]},
    {t:'cloze', q:'Complete: "He/She will eat rice"', pre:'Se bhatå', post:'', opts:['khaibå','khaibi','khaila'], ans:0, why:'<b>khaibå</b> = he/she will eat.'},
    {t:'assemble', q:'Build in Odia: "He/She will come home"', gloss:'ghåre = at home', ans:['Se','ghåre','asibå'], dist:['asibi','Mu']},
    {t:'choice', q:'What does this mean?', show:'Se asibå', opts:[{a:'He/She will come'},{a:'I will come'},{a:'He/She came'}], ans:0, why:'<b>Se asibå</b> = He/She will come. (<b>Mu asibi</b> = I will come.)'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Se khaibå', ans:['He/She','will','eat'], dist:['I','ate']},
    {t:'type', q:'Type in Odia: "He/She will come"', ans:'Se asibå', alts:['se asiba']}
  ]},
{ id:'futureresp', title:'Future: You (respectful)', sub:'Apånå — future tense · 9 steps', items:[
    {t:'intro', odia:'Apånå asibe', gloss:'You will come', note:'Future tense for <b>you (respectful)</b> uses <b>-ibe</b>: <b>Apånå asibe</b> = you will come. This form also covers <b>they</b>.'},
    {t:'intro', odia:'Apånå khaibe', gloss:'You will eat', note:'Same <b>-ibe</b> ending on any verb: <b>Apånå khaibe</b>.'},
    {t:'choice', q:'How do you say "You will see"?', opts:[{a:'Apånå dekhibe'},{a:'Mu dekhibi'},{a:'Apånå dekhile'}], ans:0, why:'you (respectful) = <b>-ibe</b>: <b>Apånå dekhibe</b>.'},
    {t:'match', pairs:[['Apånå asibe','You will come'],['Apånå khaibe','You will eat'],['Apånå dekhibe','You will see'],['Apånå kåribe','You will do']]},
    {t:'cloze', q:'Complete: "You will eat rice"', pre:'Apånå bhatå', post:'', opts:['khaibe','khaibi','khaile'], ans:0, why:'<b>khaibe</b> = you will eat.'},
    {t:'assemble', q:'Build in Odia: "You will come home"', gloss:'ghåre = at home', ans:['Apånå','ghåre','asibe'], dist:['asibi','Mu']},
    {t:'choice', q:'What does this mean?', show:'Apånå asibe', opts:[{a:'You will come'},{a:'I will come'},{a:'You came'}], ans:0, why:'<b>Apånå asibe</b> = You will come. (<b>Mu asibi</b> = I will come.)'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Apånå khaibe', ans:['You','will','eat'], dist:['I','ate']},
    {t:'type', q:'Type in Odia: "You will come"', ans:'Apånå asibe', alts:['apana asibe']}
  ]},
{ id:'futurewe', title:'Future: We', sub:'Ame — future tense · 9 steps', items:[
    {t:'intro', odia:'Ame asibu', gloss:'We will come', note:'Future tense for <b>we</b> uses <b>-ibu</b>: <b>Ame asibu</b> = we will come.'},
    {t:'intro', odia:'Ame khaibu', gloss:'We will eat', note:'Same <b>-ibu</b> ending on any verb: <b>Ame khaibu</b>.'},
    {t:'choice', q:'How do you say "We will see"?', opts:[{a:'Ame dekhibu'},{a:'Mu dekhibi'},{a:'Ame dekhilu'}], ans:0, why:'we = <b>-ibu</b>: <b>Ame dekhibu</b>.'},
    {t:'match', pairs:[['Ame asibu','We will come'],['Ame khaibu','We will eat'],['Ame dekhibu','We will see'],['Ame kåribu','We will do']]},
    {t:'cloze', q:'Complete: "We will eat rice"', pre:'Ame bhatå', post:'', opts:['khaibu','khaibi','khailu'], ans:0, why:'<b>khaibu</b> = we will eat.'},
    {t:'assemble', q:'Build in Odia: "We will come home"', gloss:'ghåre = at home', ans:['Ame','ghåre','asibu'], dist:['asibi','Mu']},
    {t:'choice', q:'What does this mean?', show:'Ame asibu', opts:[{a:'We will come'},{a:'I will come'},{a:'We came'}], ans:0, why:'<b>Ame asibu</b> = We will come. (<b>Mu asibi</b> = I will come.)'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Ame khaibu', ans:['We','will','eat'], dist:['I','ate']},
    {t:'type', q:'Type in Odia: "We will come"', ans:'Ame asibu', alts:['ame asibu']}
  ]},
{ id:'conjgo', title:'The -i / -å / -u Pattern', sub:'How verbs show who · 12 steps', items:[
    {t:'intro', odia:'Mu jauchi', gloss:'I am going', note:'To say you are <b>doing</b> something right now, add <b>-uchi</b> to the root for <b>I</b>. <b>Jiba</b> (to go) → <b>Mu jauchi</b> = I am going.'},
    {t:'intro', odia:'Tåme jauchå', gloss:'You are going', note:'For <b>you</b>, the ending shifts to an <b>-å</b> sound: <b>Tåme jauchå</b>.'},
    {t:'intro', odia:'Se jauchi', gloss:'He / She is going', note:'<b>He / She</b> uses the same <b>-i</b> sound as "I": <b>Se jauchi</b>.'},
    {t:'intro', odia:'Ame jauchu', gloss:'We are going', note:'For <b>we</b>, the ending is a <b>-u</b> sound: <b>Ame jauchu</b>.'},
    {t:'intro', odia:'Semane jauchånti', gloss:'They are going', note:'For <b>they</b>, use <b>-uchånti</b> — it still ends in an <b>-i</b> sound: <b>Semane jauchånti</b>.'},
    {t:'intro', odia:'-i  å  -u', gloss:'The pattern', note:'It is all in the last sound: <b>-i</b> = I, he/she, they · <b>-å</b> = you · <b>-u</b> = we. You already met this with <b>åchi / åchå / åchu</b> (to be)!'},
    {t:'match', pairs:[['Mu jauchi','I am going'],['Tåme jauchå','You are going'],['Se jauchi','He/She is going'],['Ame jauchu','We are going']]},
    {t:'choice', q:'How do you say "You are going"?', opts:[{a:'Tåme jauchå'},{a:'Mu jauchi'},{a:'Ame jauchu'}], ans:0, why:'<b>you</b> = the <b>-å</b> ending: jauchå.'},
    {t:'cloze', q:'Complete: "We are going"', pre:'Ame', post:'', opts:['jauchu','jauchi','jauchå'], ans:0, why:'<b>we</b> = the <b>-u</b> ending: jauchu.'},
    {t:'choice', q:'What does this mean?', show:'Semane jauchånti', opts:[{a:'They are going'},{a:'We are going'},{a:'You are going'}], ans:0, why:'<b>Semane</b> = they; <b>-uchånti</b> is the "they / respectful" ending.'},
    {t:'assemble', q:'Build in Odia: "They are going home"', gloss:'ghåre = at home', ans:['Semane','ghåre','jauchånti'], dist:['jauchu','Mu']},
    {t:'type', q:'Type in Odia: "I am going"', ans:'Mu jauchi', alts:['mu jauchi']}
  ]},
{ id:'conjeat', title:'Eating', sub:'Eating — all persons · 8 steps', items:[
    {t:'intro', odia:'Mu khauchi', gloss:'I am eating', note:'<b>Khaiba</b> (to eat) → <b>Mu khauchi</b> = i am eating. The <b>-uchi</b> ending = I.'},
    {t:'intro', odia:'Tåme khauchå', gloss:'You are eating', note:'For <b>you</b>, the <b>-å</b> ending: <b>Tåme khauchå</b>.'},
    {t:'choice', q:'How do you say "He/She is eating"?', opts:[{a:'Se khauchi'},{a:'Mu khauchi'},{a:'Semane khauchånti'}], ans:0, why:'He/She uses the <b>-i</b> ending: Se khauchi.'},
    {t:'match', pairs:[['Mu khauchi','I am eating'],['Tåme khauchå','You are eating'],['Se khauchi','He/She is eating'],['Ame khauchu','We are eating']]},
    {t:'cloze', q:'Complete: "We are eating"', pre:'Ame', post:'', opts:['khauchu','khauchi','khauchå'], ans:0, why:'<b>we</b> uses the <b>-u</b> ending: khauchu.'},
    {t:'choice', q:'What does this mean?', show:'Semane khauchånti', opts:[{a:'They are eating'},{a:'I am eating'},{a:'We are eating'}], ans:0, why:'<b>Semane</b> = they.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Se khauchi', ans:['He/She','is','eating'], dist:['I','they']},
    {t:'type', q:'Type in Odia: "I am eating"', ans:'Mu khauchi', alts:['mu khauchi']}
  ]},
{ id:'conjdrink', title:'Drinking', sub:'Drinking — all persons · 8 steps', items:[
    {t:'intro', odia:'Mu piuchi', gloss:'I am drinking', note:'<b>Piba</b> (to drink) → <b>Mu piuchi</b> = i am drinking. The <b>-uchi</b> ending = I.'},
    {t:'intro', odia:'Tåme piuchå', gloss:'You are drinking', note:'For <b>you</b>, the <b>-å</b> ending: <b>Tåme piuchå</b>.'},
    {t:'choice', q:'How do you say "He/She is drinking"?', opts:[{a:'Se piuchi'},{a:'Mu piuchi'},{a:'Semane piuchånti'}], ans:0, why:'He/She uses the <b>-i</b> ending: Se piuchi.'},
    {t:'match', pairs:[['Mu piuchi','I am drinking'],['Tåme piuchå','You are drinking'],['Se piuchi','He/She is drinking'],['Ame piuchu','We are drinking']]},
    {t:'cloze', q:'Complete: "We are drinking"', pre:'Ame', post:'', opts:['piuchu','piuchi','piuchå'], ans:0, why:'<b>we</b> uses the <b>-u</b> ending: piuchu.'},
    {t:'choice', q:'What does this mean?', show:'Semane piuchånti', opts:[{a:'They are drinking'},{a:'I am drinking'},{a:'We are drinking'}], ans:0, why:'<b>Semane</b> = they.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Se piuchi', ans:['He/She','is','drinking'], dist:['I','they']},
    {t:'type', q:'Type in Odia: "I am drinking"', ans:'Mu piuchi', alts:['mu piuchi']}
  ]},
{ id:'conjdo', title:'Doing', sub:'Doing — all persons · 8 steps', items:[
    {t:'intro', odia:'Mu kåruchi', gloss:'I am doing', note:'<b>Kåriba</b> (to do) → <b>Mu kåruchi</b> = i am doing. The <b>-uchi</b> ending = I.'},
    {t:'intro', odia:'Tåme kåruchå', gloss:'You are doing', note:'For <b>you</b>, the <b>-å</b> ending: <b>Tåme kåruchå</b>.'},
    {t:'choice', q:'How do you say "He/She is doing"?', opts:[{a:'Se kåruchi'},{a:'Mu kåruchi'},{a:'Semane kåruchånti'}], ans:0, why:'He/She uses the <b>-i</b> ending: Se kåruchi.'},
    {t:'match', pairs:[['Mu kåruchi','I am doing'],['Tåme kåruchå','You are doing'],['Se kåruchi','He/She is doing'],['Ame kåruchu','We are doing']]},
    {t:'cloze', q:'Complete: "We are doing"', pre:'Ame', post:'', opts:['kåruchu','kåruchi','kåruchå'], ans:0, why:'<b>we</b> uses the <b>-u</b> ending: kåruchu.'},
    {t:'choice', q:'What does this mean?', show:'Semane kåruchånti', opts:[{a:'They are doing'},{a:'I am doing'},{a:'We are doing'}], ans:0, why:'<b>Semane</b> = they.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Se kåruchi', ans:['He/She','is','doing'], dist:['I','they']},
    {t:'type', q:'Type in Odia: "I am doing"', ans:'Mu kåruchi', alts:['mu karuchi']}
  ]},
{ id:'conjsee', title:'Watching', sub:'Watching — all persons · 8 steps', items:[
    {t:'intro', odia:'Mu dekhuchi', gloss:'I am watching', note:'<b>Dekhiba</b> (to watch) → <b>Mu dekhuchi</b> = i am watching. The <b>-uchi</b> ending = I.'},
    {t:'intro', odia:'Tåme dekhuchå', gloss:'You are watching', note:'For <b>you</b>, the <b>-å</b> ending: <b>Tåme dekhuchå</b>.'},
    {t:'choice', q:'How do you say "He/She is watching"?', opts:[{a:'Se dekhuchi'},{a:'Mu dekhuchi'},{a:'Semane dekhuchånti'}], ans:0, why:'He/She uses the <b>-i</b> ending: Se dekhuchi.'},
    {t:'match', pairs:[['Mu dekhuchi','I am watching'],['Tåme dekhuchå','You are watching'],['Se dekhuchi','He/She is watching'],['Ame dekhuchu','We are watching']]},
    {t:'cloze', q:'Complete: "We are watching"', pre:'Ame', post:'', opts:['dekhuchu','dekhuchi','dekhuchå'], ans:0, why:'<b>we</b> uses the <b>-u</b> ending: dekhuchu.'},
    {t:'choice', q:'What does this mean?', show:'Semane dekhuchånti', opts:[{a:'They are watching'},{a:'I am watching'},{a:'We are watching'}], ans:0, why:'<b>Semane</b> = they.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Se dekhuchi', ans:['He/She','is','watching'], dist:['I','they']},
    {t:'type', q:'Type in Odia: "I am watching"', ans:'Mu dekhuchi', alts:['mu dekhuchi']}
  ]},
{ id:'conjwork', title:'Working', sub:'Working — all persons · 8 steps', items:[
    {t:'intro', odia:'Mu kamå kåruchi', gloss:'I am working', note:'<b>Kamå kåriba</b> (to work) → <b>Mu kamå kåruchi</b> = i am working. The <b>-i</b> ending = I.'},
    {t:'intro', odia:'Tåme kamå kåruchå', gloss:'You are working', note:'For <b>you</b>, the <b>-å</b> ending: <b>Tåme kamå kåruchå</b>.'},
    {t:'choice', q:'How do you say "He/She is working"?', opts:[{a:'Se kamå kåruchi'},{a:'Mu kamå kåruchi'},{a:'Semane kamå kåruchånti'}], ans:0, why:'He/She uses the <b>-i</b> ending: Se kamå kåruchi.'},
    {t:'match', pairs:[['Mu kamå kåruchi','I am working'],['Tåme kamå kåruchå','You are working'],['Se kamå kåruchi','He/She is working'],['Ame kamå kåruchu','We are working']]},
    {t:'cloze', q:'Complete: "We are working"', pre:'Ame', post:'', opts:['kamå kåruchu','kamå kåruchi','kamå kåruchå'], ans:0, why:'<b>we</b> uses the <b>-u</b> ending: kamå kåruchu.'},
    {t:'choice', q:'What does this mean?', show:'Semane kamå kåruchånti', opts:[{a:'They are working'},{a:'I am working'},{a:'We are working'}], ans:0, why:'<b>Semane</b> = they.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Se kamå kåruchi', ans:['He/She','is','working'], dist:['I','they']},
    {t:'type', q:'Type in Odia: "I am working"', ans:'Mu kamå kåruchi', alts:['mu kama karuchi']}
  ]},
{ id:'conjplay', title:'Playing', sub:'Playing — all persons · 8 steps', items:[
    {t:'intro', odia:'Mu kheluchi', gloss:'I am playing', note:'<b>Kheliba</b> (to play) → <b>Mu kheluchi</b> = i am playing. The <b>-i</b> ending = I.'},
    {t:'intro', odia:'Tåme kheluchå', gloss:'You are playing', note:'For <b>you</b>, the <b>-å</b> ending: <b>Tåme kheluchå</b>.'},
    {t:'choice', q:'How do you say "He/She is playing"?', opts:[{a:'Se kheluchi'},{a:'Mu kheluchi'},{a:'Semane kheluchånti'}], ans:0, why:'He/She uses the <b>-i</b> ending: Se kheluchi.'},
    {t:'match', pairs:[['Mu kheluchi','I am playing'],['Tåme kheluchå','You are playing'],['Se kheluchi','He/She is playing'],['Ame kheluchu','We are playing']]},
    {t:'cloze', q:'Complete: "We are playing"', pre:'Ame', post:'', opts:['kheluchu','kheluchi','kheluchå'], ans:0, why:'<b>we</b> uses the <b>-u</b> ending: kheluchu.'},
    {t:'choice', q:'What does this mean?', show:'Semane kheluchånti', opts:[{a:'They are playing'},{a:'I am playing'},{a:'We are playing'}], ans:0, why:'<b>Semane</b> = they.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Se kheluchi', ans:['He/She','is','playing'], dist:['I','they']},
    {t:'type', q:'Type in Odia: "I am playing"', ans:'Mu kheluchi', alts:['mu kheluchi']}
  ]},
{ id:'conjsleep', title:'Sleeping', sub:'Sleeping — all persons · 8 steps', items:[
    {t:'intro', odia:'Mu soichi', gloss:'I am sleeping', note:'<b>Soiba</b> (to sleep) → <b>Mu soichi</b> = i am sleeping. The <b>-i</b> ending = I.'},
    {t:'intro', odia:'Tåme soichå', gloss:'You are sleeping', note:'For <b>you</b>, the <b>-å</b> ending: <b>Tåme soichå</b>.'},
    {t:'choice', q:'How do you say "He/She is sleeping"?', opts:[{a:'Se soichi'},{a:'Mu soichi'},{a:'Semane soichånti'}], ans:0, why:'He/She uses the <b>-i</b> ending: Se soichi.'},
    {t:'match', pairs:[['Mu soichi','I am sleeping'],['Tåme soichå','You are sleeping'],['Se soichi','He/She is sleeping'],['Ame soichu','We are sleeping']]},
    {t:'cloze', q:'Complete: "We are sleeping"', pre:'Ame', post:'', opts:['soichu','soichi','soichå'], ans:0, why:'<b>we</b> uses the <b>-u</b> ending: soichu.'},
    {t:'choice', q:'What does this mean?', show:'Semane soichånti', opts:[{a:'They are sleeping'},{a:'I am sleeping'},{a:'We are sleeping'}], ans:0, why:'<b>Semane</b> = they.'},
    {t:'assemble', dir:'en', q:'Translate into English', show:'Se soichi', ans:['He/She','is','sleeping'], dist:['I','they']},
    {t:'type', q:'Type in Odia: "I am sleeping"', ans:'Mu soichi', alts:['mu soichi']}
  ]}]

const LESSON_IDS = new Set(LESSONS.map((l) => l.id))

export const CHAPTERS: Chapter[] = [
  { key:'start', title:'Getting Started', blurb:'Being, greeting, having', lessons:['be','howru','have'] },
  { key:'meet', title:'Meeting People', blurb:'Hello, goodbye, and names', lessons:['greetings','names'] },
  { key:'num', title:'Numbers & Counting', blurb:'The numbers, and how to count', lessons:['num','count'] },
  { key:'simpleconj', title:'Simple Conjugation', blurb:'The -i / -å / -u pattern, verb by verb', lessons:['conjgo','conjeat','conjdrink','conjdo','conjsee','conjwork','conjplay','conjsleep'] },
  { key:'things', title:'Pointing & Plurals', blurb:'One & many, this/that, here/there', lessons:['plural','this','deixis'] },
  { key:'around', title:'Getting Around', blurb:'Coming, going, in & out, where', lessons:['comego','inout','where'] },
  { key:'doing', title:'Doing & the Market', blurb:'Verbs, saying no, needs, buying', lessons:['verbs1','neg','need','market'] },
  { key:'cmd', title:'Simple Commands', blurb:'Commands & everyday phrases for kids', lessons:['commands','letswords'] },
  { key:'pasttense', title:'Past Tense', blurb:'I did → you, he/she, we did', lessons:['past','pastyou','pasthe','pastresp','pastwe','pastprog','pastperf'] },
  { key:'futuretense', title:'Future Tense', blurb:'I will → you, he/she, we will', lessons:['future','futureyou','futurehe','futureresp','futurewe'] },
  { key:'life', title:'Feelings & Meals', blurb:'How you feel, and eating', lessons:['feel1','feel2','meals'] }]
  .map((c) => ({ ...c, lessons: c.lessons.filter((id) => LESSON_IDS.has(id)) }))
  .filter((c) => c.lessons.length)

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
)

export function chapterOf(lessonId: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.lessons.includes(lessonId))
}
