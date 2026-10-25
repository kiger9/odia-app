// Roleplays for the "things" chapter (see ../roleplays.ts for the format and rules).

import type { Roleplay } from '../roleplays'

export const THINGS: Roleplay[] = [
  {
    id: 'things-whose-elephant',
    chapter: 'things',
    title: 'Whose elephant?',
    scene: 'Two toy elephants are on the floor, and the child grabs one.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Ei hati-ta morå', en: 'This elephant is mine' },
      { who: 'parent', od: 'Na, sei hati-ta tåmårå', en: 'No, that elephant is yours  (informal)' },
      { who: 'child', od: 'Ei hati-ta nua', en: 'This elephant is new' },
      { who: 'parent', od: 'Seita bådå', en: 'That one is big' },
    ],
  },
  {
    id: 'things-mangoes',
    chapter: 'things',
    title: 'Sweet mangoes',
    scene: 'The parent cuts mangoes for a snack.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Ei ambå-ta båhut mitha', en: 'This mango is very sweet' },
      { who: 'child', od: 'Keteta ambå åchi?', en: 'How many mangoes are there?' },
      { who: 'parent', od: 'Tinita ambå åchi', en: 'There are three mangoes' },
      { who: 'child', od: 'Mu gote ambå khauchi', en: 'I am eating one mango' },
      { who: 'parent', od: 'Rabi gote ambå khauchi', en: 'Rabi is eating one mango' },
    ],
  },
  {
    id: 'things-books',
    chapter: 'things',
    title: 'Your books',
    scene: 'Books are lying on the floor, and the child is busy playing.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Eithiki aså', en: 'Come here' },
      { who: 'child', od: 'Mu kheluchi', en: 'I am playing' },
      { who: 'parent', od: 'Tåmårå båhigudikå eithi åchi', en: 'Your books are here  (informal)' },
      { who: 'child', od: 'Ei båhi-ta nua', en: 'This book is new' },
      { who: 'parent', od: 'Hå, eita nua', en: 'Yes, this one is new' },
    ],
  },
  {
    id: 'things-friends-here',
    chapter: 'things',
    title: 'Friends are here',
    scene: 'Friends arrive to play, and the child tells the parent.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Pilamane eithi åchånti', en: 'The children are here' },
      { who: 'parent', od: 'Keteta pila åchånti?', en: 'How many children are there?' },
      { who: 'child', od: 'Charita pila åchånti', en: 'There are four children' },
      { who: 'parent', od: 'Charita ambå åchi', en: 'There are four mangoes' },
      { who: 'child', od: 'Ame ambå khauchu!', en: 'We are eating mangoes!' },
    ],
  },
  {
    id: 'things-like-this',
    chapter: 'things',
    title: 'Like this',
    scene: 'The child is struggling to fold a paper boat.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Mu chesta kåruchi', en: 'I am trying' },
      { who: 'parent', od: 'Emiti kårå', en: 'Do it like this' },
      { who: 'child', od: 'Mu emiti kåruchi', en: 'I am doing it like this' },
      { who: 'parent', od: 'Eita båhut bhålå', en: 'This is very good' },
    ],
  },
  {
    id: 'things-new-car',
    chapter: 'things',
    title: 'A new car',
    scene: 'The parent comes home with a toy car.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Mitu, eithiki aså', en: 'Mitu, come here' },
      { who: 'child', od: 'Mu kheluchi', en: 'I am playing' },
      { who: 'parent', od: 'Mopakhåre gote gadi åchi', en: 'I have a car with me' },
      { who: 'child', od: 'Ei gadi-ta nua', en: 'This car is new' },
      { who: 'parent', od: 'Ei gadi-ta tåmårå', en: 'This car is yours  (informal)' },
      { who: 'child', od: 'Ei gadi-ta båhut bhålå', en: 'This car is very good' },
    ],
  },
  {
    id: 'things-picture-book',
    chapter: 'things',
    title: 'Picture book',
    scene: 'Parent and child look at a picture book together.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Eita gote hati', en: 'This is an elephant' },
      { who: 'child', od: 'Seita gote gai', en: 'That is a cow' },
      { who: 'parent', od: 'Keteta gai åchi?', en: 'How many cows are there?' },
      { who: 'child', od: 'Panchta gai åchi', en: 'There are five cows' },
      { who: 'parent', od: 'Ei hati-ta båhut bådå', en: 'This elephant is very big' },
    ],
  },
]
