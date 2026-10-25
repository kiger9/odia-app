// Roleplays for the "simpleconj" chapter (see ../roleplays.ts for the format and rules).

import type { Roleplay } from '../roleplays'

export const SIMPLECONJ: Roleplay[] = [
  {
    id: 'simpleconj-whos-home',
    chapter: 'simpleconj',
    title: 'Is Rabi home?',
    scene: 'The parent comes in and asks the child who is at home.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Rabi ghåre åchi-ki?', en: 'Is Rabi at home?' },
      { who: 'child', od: 'Hå, se soichi', en: 'Yes, he is sleeping' },
      { who: 'parent', od: 'Mitu ghåre åchi-ki?', en: 'Is Mitu at home?' },
      { who: 'child', od: 'Hå, se kheluchi', en: 'Yes, she is playing' },
      { who: 'parent', od: 'Tåme kemiti åchå?', en: 'How are you?  (informal)' },
      { who: 'child', od: 'Mu båhut bhålå åchi', en: 'I am very well' },
    ],
  },
  {
    id: 'simpleconj-fish-dinner',
    chapter: 'simpleconj',
    title: 'Fish for dinner',
    scene: 'Dinner is on the table, but one child is still playing.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Ame ebe machå khauchu', en: 'We are eating fish now' },
      { who: 'child', od: 'Mu ebe kheluchi', en: 'I am playing now' },
      { who: 'parent', od: 'Rabi machå khauchi', en: 'Rabi is eating fish' },
      { who: 'child', od: 'Mu khauchi!', en: 'I am eating!' },
    ],
  },
  {
    id: 'simpleconj-bananas',
    chapter: 'simpleconj',
    title: 'Bananas',
    scene: 'The child finds the fruit bowl in the kitchen.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Keteta kådåli åchi?', en: 'How many bananas are there?' },
      { who: 'parent', od: 'Charita kådåli åchi', en: 'There are four bananas' },
      { who: 'child', od: 'Mu duita kådåli khauchi', en: 'I am eating two bananas' },
      { who: 'parent', od: 'Mitu gote kådåli khauchi', en: 'Mitu is eating one banana' },
      { who: 'child', od: 'Rabi gote kådåli khauchi', en: 'Rabi is eating one banana' },
    ],
  },
  {
    id: 'simpleconj-friends-over',
    chapter: 'simpleconj',
    title: 'Friends over',
    scene: 'The child runs in while the parent is at the desk.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Ame kheluchu', en: 'We are playing' },
      { who: 'parent', od: 'Keteta pila åchånti?', en: 'How many children are there?' },
      { who: 'child', od: 'Charita pila åchånti', en: 'There are four children' },
      { who: 'parent', od: 'Mu kamå kåruchi', en: 'I am working' },
    ],
  },
  {
    id: 'simpleconj-bedtime',
    chapter: 'simpleconj',
    title: 'Bedtime',
    scene: 'The parent looks in on the children at night.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Mitu ebe soichi', en: 'Mitu is sleeping now' },
      { who: 'parent', od: 'Tåme kemiti åchå?', en: 'How are you?  (informal)' },
      { who: 'child', od: 'Mu bhålå åchi', en: 'I am fine' },
      { who: 'parent', od: 'Subha ratri', en: 'Good night' },
      { who: 'child', od: 'Subha ratri', en: 'Good night' },
    ],
  },
  {
    id: 'simpleconj-morning',
    chapter: 'simpleconj',
    title: 'Good morning',
    scene: 'The child comes into the kitchen in the morning.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Subha såkalå, Mitu', en: 'Good morning, Mitu' },
      { who: 'child', od: 'Subha såkalå', en: 'Good morning' },
      { who: 'parent', od: 'Tåme kemiti åchå?', en: 'How are you?  (informal)' },
      { who: 'child', od: 'Mu båhut bhålå åchi', en: 'I am very well' },
      { who: 'parent', od: 'Rabi ebe soichi', en: 'Rabi is sleeping now' },
    ],
  },
  {
    id: 'simpleconj-homework',
    chapter: 'simpleconj',
    title: 'Homework',
    scene: 'The child sits down to do homework.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Tåmårå båhi åchi-ki?', en: 'Do you have your book?  (informal)' },
      { who: 'child', od: 'Hå, mopakhåre gote båhi åchi', en: 'Yes, I have a book with me' },
      { who: 'parent', od: 'Mu help kåruchi', en: 'I am helping' },
      { who: 'child', od: 'Na, mu chesta kåruchi', en: 'No, I am trying' },
    ],
  },
]
