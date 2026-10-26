// Roleplays for the Getting Started chapter (see ../roleplays.ts for the format
// and rules). Core: åchi / åchå / åchånti, kemiti, bhålå / nahi, morå /
// tåmårå / tarå + åchi-ki, mopakhåre. Words the lessons don't teach are in
// ../words/roleplays/start.ts (or another chapter's list).

import type { Roleplay } from '../roleplays'

export const START: Roleplay[] = [
  {
    id: 'start-sick-day',
    chapter: 'start',
    title: 'A sick morning',
    scene: 'Rahul is still in bed on a school morning, looking unwell.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Rahul, tåme kemiti åchå?', en: 'Rahul, how are you feeling?  (informal)' },
      { who: 'child', od: 'Mu bhålå nahi, Ma. Mundå bindhuchi', en: 'I’m not well, Mom. My head hurts' },
      { who: 'parent', od: 'Tåmårå jårå åchi-ki?', en: 'Do you have a fever?' },
      { who: 'child', od: 'Na, jårå nahi', en: 'No, no fever' },
      { who: 'parent', od: 'Achha, aji ghåre ruhå', en: 'Okay, stay home today' },
    ],
  },
  {
    id: 'start-dad-home',
    chapter: 'start',
    title: 'Dad’s home',
    scene: 'Dad comes home from work in the evening and the child runs to meet him.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Bapa, tåme kemiti åchå?', en: 'Dad, how are you?  (informal)' },
      { who: 'parent', od: 'Mote tike thåka laguchi. Tåme kemiti åchå?', en: 'I’m a bit tired. How are you?' },
      { who: 'child', od: 'Mu båhut bhålå åchi!', en: 'I’m really good!' },
      { who: 'parent', od: 'Tåmårå homework åchi-ki?', en: 'Do you have homework?' },
      { who: 'child', od: 'Na, aji homework nahi!', en: 'No, no homework today!' },
    ],
  },
  {
    id: 'start-snack',
    chapter: 'start',
    title: 'Anything to eat?',
    scene: 'A hungry child comes into the kitchen after playing.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Ma, mote bhokå laguchi. Kichi åchi-ki?', en: 'Mom, I’m hungry. Is there anything?' },
      { who: 'parent', od: 'Kådåli åchi', en: 'There are bananas' },
      { who: 'child', od: 'Biscuit åchi-ki?', en: 'Are there any biscuits?' },
      { who: 'parent', od: 'Na, biscuit nahi', en: 'No, there are no biscuits' },
      { who: 'child', od: 'Achha, gote kådåli diå', en: 'Okay, give me a banana' },
    ],
  },
  {
    id: 'start-tiffin',
    chapter: 'start',
    title: 'Got everything?',
    scene: 'The child is about to leave for school; the parent checks the bag.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Båhi, pen, såbu åchi-ki?', en: 'Books, pen, have you got everything?' },
      { who: 'child', od: 'Hå, såbu åchi', en: 'Yes, everything’s here' },
      { who: 'parent', od: 'Tiffin åchi-ki?', en: 'And your lunchbox?' },
      { who: 'child', od: 'Na, tiffin nahi', en: 'No, it’s not there' },
      { who: 'parent', od: 'Ei niå, tåmårå tiffin', en: 'Here you go, your lunchbox' },
    ],
  },
  {
    id: 'start-rain',
    chapter: 'start',
    title: 'It’s raining',
    scene: 'It starts to rain just as the child is about to go out.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Ma, bahare bårsa håuchi', en: 'Mom, it’s raining outside' },
      { who: 'parent', od: 'Tåmårå chata åchi-ki?', en: 'Do you have your umbrella?' },
      { who: 'child', od: 'Na, morå chata school-re åchi', en: 'No, my umbrella is at school' },
      { who: 'parent', od: 'Achha, morå chata niå', en: 'Okay, take my umbrella' },
    ],
  },
  {
    id: 'start-grandma',
    chapter: 'start',
    title: 'News from Grandma',
    scene: 'Dad is back from visiting Grandma in the village.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Bapa, Aai kemiti åchånti?', en: 'Dad, how’s Grandma?' },
      { who: 'parent', od: 'Aai båhut bhålå åchånti', en: 'Grandma is very well' },
      { who: 'child', od: 'Aai-nkårå gai kemiti åchi?', en: 'And how’s Grandma’s cow?' },
      { who: 'parent', od: 'Bhålå åchi. Ebe gote chotå bachuri be åchi!', en: 'She’s fine. Now there’s a little calf too!' },
      { who: 'child', od: 'Mu dekhibi!', en: 'I want to see it!' },
    ],
  },
  {
    id: 'start-phone-call',
    chapter: 'start',
    title: 'Dad calls home',
    scene: 'Dad is away for work and phones home; the child picks up.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Hello Mitu. Tåme kemiti åchå?', en: 'Hello, Mitu! How are you?  (informal)' },
      { who: 'child', od: 'Mu bhålå åchi, Bapa. Tåme kemiti åchå?', en: 'I’m fine, Dad. How are you?' },
      { who: 'parent', od: 'Mu be bhålå åchi. Ma kouthi?', en: 'I’m fine too. Where’s Mom?' },
      { who: 'child', od: 'Ma eithi åchånti. Ma, Bapa phone kåruchånti!', en: 'Mom’s right here. Mom, it’s Dad on the phone!' },
    ],
  },
  {
    id: 'start-keys',
    chapter: 'start',
    title: 'Keys and phone',
    scene: 'The family is at the door, about to go out; the child checks Dad has everything.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Bapa, tåmårå chabi åchi-ki?', en: 'Dad, do you have the keys?' },
      { who: 'parent', od: 'Hå, mopakhåre åchi', en: 'Yes, I have them on me' },
      { who: 'child', od: 'Tåmårå phone åchi-ki?', en: 'Do you have your phone?' },
      { who: 'parent', od: 'Na, phone bhitåre åchi', en: 'No, my phone is inside' },
      { who: 'child', od: 'Mu anuchi!', en: 'I’ll get it!' },
    ],
  },
]
