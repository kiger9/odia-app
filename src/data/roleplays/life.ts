// Roleplays for the "life" chapter (see ../roleplays.ts for the format and rules).
// Words available: everything up to life.ts — feelings (Mote … laguchi, Mu khusi
// åchi), likes (bhålå laguchi / laguni), meals, and khaibi/khaibå/khaibu.

import type { Roleplay } from '../roleplays'

export const LIFE: Roleplay[] = [
  {
    id: 'life-hungry',
    chapter: 'life',
    title: 'Hungry?',
    scene: 'It is nearly dinner time.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Tåmåku bhokå laguchi-ki?', en: 'Are you hungry?  (informal)' },
      { who: 'child', od: 'Hå, mote båhut bhokå laguchi', en: 'Yes, I feel very hungry' },
      { who: 'parent', od: 'Pizza khaibå-ki?', en: 'Will you eat pizza?' },
      { who: 'child', od: 'Hå, mote pizza bhålå laguchi!', en: 'Yes, I like pizza!' },
      { who: 'parent', od: 'Aså khaibå!', en: 'Let’s eat!' },
    ],
  },
  {
    id: 'life-hot-day',
    chapter: 'life',
    title: 'A hot day',
    scene: 'The child comes in from playing in the sun.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Mote gåråm laguchi', en: 'I feel hot' },
      { who: 'parent', od: 'Tåmåku soså laguchi-ki?', en: 'Are you thirsty?  (informal)' },
      { who: 'child', od: 'Hå, morå pani dårkar', en: 'Yes, I need water' },
      { who: 'parent', od: 'Mu pani anuchi', en: 'I am bringing water' },
      { who: 'child', od: 'Dhånyåvad!', en: 'Thank you!' },
    ],
  },
  {
    id: 'life-cold',
    chapter: 'life',
    title: 'Cold outside',
    scene: 'The child is playing outside on a chilly evening.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåmåku thånda laguchi-ki?', en: 'Are you cold?  (informal)' },
      { who: 'child', od: 'Hå, mote thånda laguchi', en: 'Yes, I feel cold' },
      { who: 'parent', od: 'Bhitårå-ku aså', en: 'Come inside' },
      { who: 'child', od: 'Mu khirå pibi', en: 'I will drink milk' },
      { who: 'parent', od: 'Mu khirå anuchi', en: 'I am bringing milk' },
    ],
  },
  {
    id: 'life-sad',
    chapter: 'life',
    title: 'Feeling sad',
    scene: 'The child is sitting alone and looks unhappy.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåme dukhi åchå-ki?', en: 'Are you sad?  (informal)' },
      { who: 'child', od: 'Hå, mu dukhi åchi', en: 'Yes, I am sad' },
      { who: 'parent', od: 'Rahul asuchi', en: 'Rahul is coming' },
      { who: 'child', od: 'Mu Rahul-sangåre khelibi!', en: 'I will play with Rahul!' },
      { who: 'parent', od: 'Tåme ebe khusi åchå-ki?', en: 'Are you happy now?  (informal)' },
      { who: 'child', od: 'Hå, mu båhut khusi åchi!', en: 'Yes, I am very happy!' },
    ],
  },
  {
    id: 'life-breakfast',
    chapter: 'life',
    title: 'Breakfast',
    scene: 'It is morning, and breakfast is on the table.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Jolokia khaibå-ki?', en: 'Will you eat breakfast?' },
      { who: 'child', od: 'Hå, mote bhokå laguchi', en: 'Yes, I feel hungry' },
      { who: 'parent', od: 'Kådåli khaibå-ki?', en: 'Will you eat a banana?' },
      { who: 'child', od: 'Na, mote kådåli bhålå laguni', en: 'No, I don’t like bananas' },
      { who: 'parent', od: 'Tåme kånå khaibå?', en: 'What will you eat?  (informal)' },
      { who: 'child', od: 'Mu ambå khaibi', en: 'I will eat a mango' },
    ],
  },
  {
    id: 'life-eat-with-me',
    chapter: 'life',
    title: 'Eat with me',
    scene: 'The child sits down at the table for dinner.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Tåme mo-sangåre khaibå-ki?', en: 'Will you eat with me?  (informal)' },
      { who: 'parent', od: 'Hå, mu tåmå-sangåre khaibi', en: 'Yes, I will eat with you' },
      { who: 'child', od: 'Ame kånå khaibu?', en: 'What will we eat?' },
      { who: 'parent', od: 'Ame machå khaibu', en: 'We will eat fish' },
      { who: 'child', od: 'Mote machå bhålå laguchi!', en: 'I like fish!' },
    ],
  },
  {
    id: 'life-eating-out',
    chapter: 'life',
    title: 'Going out to eat',
    scene: 'The family is getting ready to go out.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Ame kouthiki jauchu?', en: 'Where are we going?' },
      { who: 'parent', od: 'Ame khaiba-ku jauchu', en: 'We are going to eat' },
      { who: 'child', od: 'Bapa be asibe-ki?', en: 'Will dad come too?' },
      { who: 'parent', od: 'Hå, bapa be asibe', en: 'Yes, dad will come too' },
      { who: 'child', od: 'Mu båhut khusi åchi!', en: 'I am very happy!' },
    ],
  },
]
