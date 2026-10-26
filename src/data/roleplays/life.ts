// Roleplays for the "life" chapter (see ../roleplays.ts for the format and rules).
// Words available: everything up to life.ts — feelings (Mote … laguchi, Mu khusi
// åchi), likes (bhålå laguchi / laguni), meals, and khaibi/khaibå/khaibu.

import type { Roleplay } from '../roleplays'

export const LIFE: Roleplay[] = [
  {
    id: 'life-sleepy',
    chapter: 'life',
    title: 'Sleepy',
    scene: 'It is eight in the evening and the child is yawning.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Ebe athta bajila. Tåmåku kemiti laguchi?', en: 'It’s eight o’clock. How are you feeling?' },
      { who: 'child', od: 'Mote nidå laguchi', en: 'I’m feeling sleepy' },
      { who: 'parent', od: 'Aså soibå', en: 'Let’s go to bed' },
      { who: 'child', od: 'Subha ratri, Ma!', en: 'Good night, mom!' },
    ],
  },
  {
    id: 'life-fish-or-chicken',
    chapter: 'life',
    title: 'Fish or chicken?',
    scene: 'The parent is about to serve dinner.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Machå khaibå na chicken?', en: 'Do you want to eat fish or chicken?' },
      { who: 'child', od: 'Mu chicken khaibi', en: 'I want to eat chicken' },
      { who: 'parent', od: 'Tåmåku soså be laguchi-ki?', en: 'Are you thirsty too?' },
      { who: 'child', od: 'Na, mote soså laguni', en: 'No, I’m not thirsty' },
    ],
  },
  {
    id: 'life-sweater',
    chapter: 'life',
    title: 'Put on a sweater',
    scene: 'It is a chilly winter evening and the child is shivering.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåmåku thånda laguchi-ki?', en: 'Are you cold?' },
      { who: 'child', od: 'Hå, mote båhut thånda laguchi', en: 'Yes, I’m very cold' },
      { who: 'parent', od: 'Ei sweater-ta pindhå', en: 'Put on this sweater' },
      { who: 'child', od: 'Dhånyåvad, Ma. Ebe bhålå laguchi', en: 'Thanks, mom. That feels better' },
    ],
  },
  {
    id: 'life-dont-like',
    chapter: 'life',
    title: 'I don’t like this',
    scene: 'The child is pushing food around the plate.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Kahiki khauchå nahi?', en: 'Why aren’t you eating?' },
      { who: 'child', od: 'Mote ei tårkari bhålå laguni', en: 'I don’t like this curry' },
      { who: 'parent', od: 'Tike khai dekhå', en: 'Just try a little' },
      { who: 'child', od: 'Na, morå dåhi bhatå dårkar', en: 'No, I want curd rice' },
      { who: 'parent', od: 'Thik åchi, mu dåhi bhatå anuchi', en: 'Okay, I’ll get you curd rice' },
    ],
  },
  {
    id: 'life-hungry',
    chapter: 'life',
    title: 'Hungry after school',
    scene: 'The child comes home from school and heads for the kitchen.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Ma, mote båhut bhokå laguchi', en: 'Mom, I’m really hungry' },
      { who: 'parent', od: 'Bhatå ebe hoini', en: 'The rice isn’t ready yet' },
      { who: 'child', od: 'Tahele mu kånå khaibi?', en: 'Then what can I eat?' },
      { who: 'parent', od: 'Gote kådåli khai paribå', en: 'You can have a banana' },
      { who: 'child', od: 'Thik åchi, dhånyåvad!', en: 'Okay, thanks!' },
    ],
  },
  {
    id: 'life-sad',
    chapter: 'life',
    title: 'Feeling sad',
    scene: 'The child is sitting alone by the window.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Kånå hela, tåme dukhi åchå-ki?', en: 'What’s wrong, are you sad?' },
      { who: 'child', od: 'Hå. Rahul asuni', en: 'Yes. Rahul isn’t coming' },
      { who: 'parent', od: 'Mu tåmå-sangåre khelibi', en: 'I’ll play with you' },
      { who: 'child', od: 'Ebe mu båhut khusi åchi!', en: 'Now I’m really happy!' },
    ],
  },
  {
    id: 'life-breakfast',
    chapter: 'life',
    title: 'Breakfast',
    scene: 'It is morning and the parent is in the kitchen.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Subha såkalå. Jolokia-re kånå khaibå?', en: 'Good morning. What will you have for breakfast?' },
      { who: 'child', od: 'Pauruti au ånda', en: 'Bread and eggs' },
      { who: 'parent', od: 'Ånda bhåja na sijha?', en: 'Fried eggs or boiled?' },
      { who: 'child', od: 'Bhåja. Mote bhåja ånda bhålå laguchi', en: 'Fried. I like fried eggs' },
      { who: 'parent', od: 'Thik åchi, panch minit', en: 'Okay, five minutes' },
    ],
  },
  {
    id: 'life-pitha',
    chapter: 'life',
    title: 'Do you like it?',
    scene: 'The parent has made pitha and offers the child one.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Mu pitha kårichi. Khai dekhå', en: 'I’ve made pitha. Try one' },
      { who: 'child', od: 'Båhut mitha!', en: 'It’s so sweet!' },
      { who: 'parent', od: 'Bhålå laguchi-ki?', en: 'Do you like it?' },
      { who: 'child', od: 'Hå, båhut bhålå laguchi. Au gote diå', en: 'Yes, I love it. Give me one more' },
      { who: 'parent', od: 'Ei niå', en: 'Here you go' },
    ],
  },
]
