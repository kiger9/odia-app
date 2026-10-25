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
  {
    id: 'start-school-bag',
    chapter: 'start',
    title: 'Book and pen',
    scene: 'On the way to school, the parent checks the child has their things.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåmårå båhi åchi-ki?', en: 'Do you have your book?  (informal)' },
      { who: 'child', od: 'Hå, mopakhåre gote båhi åchi', en: 'Yes, I have a book on me' },
      { who: 'parent', od: 'Tåmårå pen åchi-ki?', en: 'Do you have a pen?  (informal)' },
      { who: 'child', od: 'Na, mopakhåre nahi', en: 'No, I don’t have one on me' },
      { who: 'parent', od: 'Mopakhåre gote pen åchi', en: 'I have a pen on me' },
    ],
  },
  {
    id: 'start-welcome-home',
    chapter: 'start',
    title: 'Back from work',
    scene: 'A parent gets home from work. The child greets them and says who is in.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Tåme kemiti åchå?', en: 'How are you?  (informal)' },
      { who: 'parent', od: 'Mu bhålå åchi', en: 'I am fine' },
      { who: 'child', od: 'Rahul ghåre nahi', en: 'Rahul is not at home' },
      { who: 'parent', od: 'Mitu ghåre åchi-ki?', en: 'Is Mitu at home?' },
      { who: 'child', od: 'Hå, Mitu ghåre åchi', en: 'Yes, Mitu is at home' },
    ],
  },
  {
    id: 'start-friend-cow',
    chapter: 'start',
    title: 'Mitu’s cow',
    scene: 'The child has been playing at their friend Mitu’s house. The parent asks about her.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Mitu kemiti åchi?', en: 'How is Mitu?' },
      { who: 'child', od: 'Se båhut bhålå åchi', en: 'She is very well' },
      { who: 'parent', od: 'Tarå gai åchi-ki?', en: 'Does she have a cow?' },
      { who: 'child', od: 'Hå, tarå gote gai åchi', en: 'Yes, she has a cow' },
      { who: 'parent', od: 'Tarå gadi åchi-ki?', en: 'Does she have a car?' },
      { who: 'child', od: 'Na, tarå gadi nahi', en: 'No, she doesn’t have a car' },
    ],
  },
  {
    id: 'start-colds',
    chapter: 'start',
    title: 'Two colds',
    scene: 'Two of the kids have colds. The parent looks in on one of them.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåme kemiti åchå?', en: 'How are you?  (informal)' },
      { who: 'child', od: 'Mu bhålå nahi', en: 'I am not well' },
      { who: 'parent', od: 'Rabi kemiti åchi?', en: 'How is Rabi?' },
      { who: 'child', od: 'Rabi ebe tike bhålå åchi', en: 'Rabi is a little better now' },
    ],
  },
  {
    id: 'start-cousins',
    chapter: 'start',
    title: 'News of the cousins',
    scene: 'The parent has just phoned the cousins. The child asks how they are.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Semane kemiti åchånti?', en: 'How are they?' },
      { who: 'parent', od: 'Semane bhålå åchånti', en: 'They are fine' },
      { who: 'child', od: 'Rabi kemiti åchi?', en: 'How is Rabi?' },
      { who: 'parent', od: 'Rabi båhut bhålå åchi', en: 'Rabi is very well' },
    ],
  },
]
