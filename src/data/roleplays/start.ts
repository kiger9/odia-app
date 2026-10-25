// Roleplays for the Getting Started chapter (see ../roleplays.ts for the format
// and rules). Words available: start.ts only (be, howru, have lessons).

import type { Roleplay } from '../roleplays'

export const START: Roleplay[] = [
  {
    id: 'start-howru',
    chapter: 'start',
    title: 'Home from school',
    scene: 'A child comes in the door. The parent asks how they are.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Tåme kemiti åchå?', en: 'How are you?  (informal)' },
      { who: 'child', od: 'Mu bhålå åchi', en: 'I am fine' },
      { who: 'parent', od: 'Tåmårå båhi åchi-ki?', en: 'Do you have your book?  (informal)' },
      { who: 'child', od: 'Hå, morå gote båhi åchi', en: 'Yes, I have a book' },
    ],
  },
  {
    id: 'start-whos-home',
    chapter: 'start',
    title: 'Who is home?',
    scene: 'A child comes home and asks who is in.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Rahul ghåre åchi-ki?', en: 'Is Rahul at home?' },
      { who: 'parent', od: 'Na, Rahul ghåre nahi', en: 'No, Rahul is not at home' },
      { who: 'child', od: 'Mitu ghåre åchi-ki?', en: 'Is Mitu at home?' },
      { who: 'parent', od: 'Hå, Mitu ghåre åchi', en: 'Yes, Mitu is at home' },
      { who: 'child', od: 'Tåme kemiti åchå?', en: 'How are you?  (informal)' },
      { who: 'parent', od: 'Mu båhut bhålå åchi', en: 'I am very well' },
    ],
  },
]
