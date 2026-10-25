// Roleplays for the "meet" chapter (see ../roleplays.ts for the format and rules).
// Words available: start.ts + meet.ts (greetings, names).

import type { Roleplay } from '../roleplays'

export const MEET: Roleplay[] = [
  {
    id: 'meet-good-morning',
    chapter: 'meet',
    title: 'Good morning',
    scene: 'A child wakes up and the parent comes in to say good morning.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Subha såkalå!', en: 'Good morning!' },
      { who: 'child', od: 'Subha såkalå!', en: 'Good morning!' },
      { who: 'parent', od: 'Tåme kemiti åchå?', en: 'How are you?  (informal)' },
      { who: 'child', od: 'Mu båhut bhålå åchi', en: 'I am very well' },
      { who: 'parent', od: 'Mitu kemiti åchi?', en: 'How is Mitu?' },
      { who: 'child', od: 'Mitu bhålå nahi', en: 'Mitu is not well' },
    ],
  },
  {
    id: 'meet-good-night',
    chapter: 'meet',
    title: 'Good night',
    scene: 'At bedtime the child checks that big brother Rabi is back, then says good night.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Rabi ghåre åchi-ki?', en: 'Is Rabi at home?' },
      { who: 'parent', od: 'Hå, Rabi ghåre åchi', en: 'Yes, Rabi is at home' },
      { who: 'child', od: 'Subha ratri!', en: 'Good night!' },
      { who: 'parent', od: 'Subha ratri!', en: 'Good night!' },
    ],
  },
  {
    id: 'meet-name-game',
    chapter: 'meet',
    title: 'The name game',
    scene: 'A parent plays a name game with a toddler, pointing at people in a family photo.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Tåmårå namo kånå?', en: 'What’s your name?  (informal)' },
      { who: 'child', od: 'Morå namo Rabi', en: 'My name is Rabi' },
      { who: 'parent', od: 'Tarå namo kånå?', en: 'What’s his name?' },
      { who: 'child', od: 'Tarå namo Rahul', en: 'His name is Rahul' },
    ],
  },
  {
    id: 'meet-off-to-school',
    chapter: 'meet',
    title: 'Off to school',
    scene: 'The child is heading out of the door to school.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Mu jauchi!', en: 'I’m off!' },
      { who: 'parent', od: 'Tåmårå båhi åchi-ki?', en: 'Do you have your book?  (informal)' },
      { who: 'child', od: 'Hå, mopakhåre åchi', en: 'Yes, I have it on me' },
      { who: 'parent', od: 'Mu råhuchi!', en: 'Bye-bye!' },
    ],
  },
  {
    id: 'meet-good-evening',
    chapter: 'meet',
    title: 'Good evening',
    scene: 'The parent gets home in the evening and finds the child in.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Subha såndhya!', en: 'Good evening!' },
      { who: 'child', od: 'Subha såndhya!', en: 'Good evening!' },
      { who: 'parent', od: 'Tåme kemiti åchå?', en: 'How are you?  (informal)' },
      { who: 'child', od: 'Mu bhålå åchi', en: 'I am fine' },
      { who: 'parent', od: 'Rabi kemiti åchi?', en: 'How is Rabi?' },
      { who: 'child', od: 'Rabi ebe tike bhålå åchi', en: 'Rabi is a little better now' },
    ],
  },
  {
    id: 'meet-baby-cousin',
    chapter: 'meet',
    title: 'The new baby',
    scene: 'The child sees a photo of a new baby cousin and asks about him.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Tarå namo kånå?', en: 'What’s his name?' },
      { who: 'parent', od: 'Tarå namo Rabi', en: 'His name is Rabi' },
      { who: 'child', od: 'Rabi kemiti åchi?', en: 'How is Rabi?' },
      { who: 'parent', od: 'Se båhut bhålå åchi', en: 'He is very well' },
    ],
  },
  {
    id: 'meet-off-to-work',
    chapter: 'meet',
    title: 'Off to work',
    scene: 'The parent is leaving for work, and the child checks they have everything.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Mitu, mu jauchi!', en: 'Mitu, I’m off!' },
      { who: 'child', od: 'Tåmårå pen åchi-ki?', en: 'Do you have your pen?  (informal)' },
      { who: 'parent', od: 'Hå, mopakhåre åchi', en: 'Yes, I have it on me' },
      { who: 'child', od: 'Mu råhuchi!', en: 'Bye-bye!' },
    ],
  },
]
