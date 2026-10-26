// Roleplays for the "num" chapter (see ../roleplays.ts for the format and rules).
// Plain numbers for money, weights, minutes and years (dås tånka, dui kilo,
// panch minit-re, chå bårså); -ta numbers for counting things and for the
// clock (tinita biscuit, charita bajila); keteta? = how many? Words the lessons
// don't teach are in ../words/roleplays/num.ts (or another chapter's list).

import type { Roleplay } from '../roleplays'

export const NUM: Roleplay[] = [
  {
    id: 'num-biscuits',
    chapter: 'num',
    title: 'Sharing biscuits',
    scene: 'The parent hands over a packet of biscuits for the two brothers.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Ei niå, chåta biscuit. Rabi-sange bhagå kårå', en: 'Here, six biscuits. Share them with Rabi' },
      { who: 'child', od: 'Mu keteta paibi?', en: 'How many do I get?' },
      { who: 'parent', od: 'Tinita tåmårå, tinita Rabi-rå', en: 'Three for you, three for Rabi' },
      { who: 'child', od: 'Morå charita dårkar!', en: 'I want four!' },
      { who: 'parent', od: 'Na, tinita!', en: 'No, three!' },
    ],
  },
  {
    id: 'num-balloon',
    chapter: 'num',
    title: 'A balloon at the fair',
    scene: 'At the fair, the child spots a balloon seller and checks their pocket money.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Bapa, sei balloon-ta kete tånka?', en: 'Dad, how much is that balloon?' },
      { who: 'parent', od: 'Dås tånka', en: 'Ten rupees' },
      { who: 'child', od: 'Mopakhåre panch tånka åchi', en: 'I have five rupees on me' },
      { who: 'parent', od: 'Håu, mu au panch tånka dåuchi', en: 'Okay, I’ll give the other five' },
      { who: 'child', od: 'Dhånyåvad, Bapa!', en: 'Thank you, Dad!' },
    ],
  },
  {
    id: 'num-school-bus',
    chapter: 'num',
    title: 'The bus is coming',
    scene: 'The child is eating breakfast slowly and the school bus is nearly due.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Jåldi khaå. Bus panch minit-re asibå', en: 'Eat quickly. The bus comes in five minutes' },
      { who: 'child', od: 'Mu au gote ruti khaibi', en: 'I want one more roti' },
      { who: 'parent', od: 'Såmåyå nahi. Tiffin-re duita ruti åchi', en: 'There’s no time! There are two rotis in your lunchbox' },
      { who: 'child', od: 'Håu, Ma. Mu jauchi!', en: 'Okay, Mom. I’m off!' },
    ],
  },
  {
    id: 'num-birthday',
    chapter: 'num',
    title: 'Birthday',
    scene: 'The child wakes up on their birthday.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Aji tåmårå jånmådinå. Tåmårå kete bårså hela?', en: 'It’s your birthday today! How old are you now?' },
      { who: 'child', od: 'Morå chå bårså hela!', en: 'I’m six now!' },
      { who: 'parent', od: 'Tåme ebe bådå pila!', en: 'You’re a big kid now!' },
      { who: 'child', od: 'Cake åchi-ki?', en: 'Is there a cake?' },
      { who: 'parent', od: 'Hå, gote båhut bådå cake!', en: 'Yes, a really big cake!' },
    ],
  },
  {
    id: 'num-market-bag',
    chapter: 'num',
    title: 'Back from the market',
    scene: 'Dad comes back from the market and the child looks in the bag.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Bapa, kånå anilå?', en: 'Dad, what did you bring?' },
      { who: 'parent', od: 'Dui kilo machå, au dåsta kådåli', en: 'Two kilos of fish, and ten bananas' },
      { who: 'child', od: 'Mu duita kådåli khaibi!', en: 'I’m going to eat two bananas!' },
      { who: 'parent', od: 'Na, gote khaå. Shighrå bhatå khaibå', en: 'No, eat one. You’ll have dinner soon' },
      { who: 'child', od: 'Håu, gote!', en: 'Okay, one!' },
    ],
  },
  {
    id: 'num-tv',
    chapter: 'num',
    title: 'Five more minutes',
    scene: 'The child is watching TV after school.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Rahul, charita bajila. TV bånd kårå', en: 'Rahul, it’s four o’clock. Turn off the TV' },
      { who: 'child', od: 'Au panch minit, Ma!', en: 'Five more minutes, Mom!' },
      { who: 'parent', od: 'Håu, panch minit. Tapåre homework', en: 'Okay, five minutes. Then homework' },
      { who: 'child', od: 'Håu, Ma!', en: 'Okay, Mom!' },
    ],
  },
  {
    id: 'num-set-table',
    chapter: 'num',
    title: 'Setting the table',
    scene: 'The child helps set the table for dinner; Grandma is coming too.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Ma, keteta thali anibi?', en: 'Mom, how many plates should I bring?' },
      { who: 'parent', od: 'Panchta. Aai be asuchånti', en: 'Five. Grandma is coming too' },
      { who: 'child', od: 'Panchta thali, panchta glass?', en: 'Five plates and five glasses?' },
      { who: 'parent', od: 'Hå. Båhut bhålå!', en: 'Yes. Well done!' },
    ],
  },
]
