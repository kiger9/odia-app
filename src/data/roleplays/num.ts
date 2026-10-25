// Roleplays for the "num" chapter (see ../roleplays.ts for the format and rules).
// Words available: start.ts + meet.ts + num.ts. Plain numbers for money and
// weights (dås tånka, dui kilo); -ta numbers for counting things (chåta machå).

import type { Roleplay } from '../roleplays'

export const NUM: Roleplay[] = [
  {
    id: 'num-snack-time',
    chapter: 'num',
    title: 'Enough bananas?',
    scene: 'On the way home, the parent phones to check how many kids are in for snack time.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Keteta pila ghåre åchånti?', en: 'How many children are at home?' },
      { who: 'child', od: 'Charita pila åchånti', en: 'There are four children' },
      { who: 'parent', od: 'Keteta kådåli åchi?', en: 'How many bananas are there?' },
      { who: 'child', od: 'Tinita kådåli åchi', en: 'There are three bananas' },
      { who: 'parent', od: 'Mopakhåre chåta kådåli åchi', en: 'I have six bananas on me' },
    ],
  },
  {
    id: 'num-pocket-money',
    chapter: 'num',
    title: 'Pocket money',
    scene: 'Before the fair, the parent asks the kids how much money they have.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåmårå tånka åchi-ki?', en: 'Do you have any money?  (informal)' },
      { who: 'child', od: 'Hå, morå panch tånka åchi', en: 'Yes, I have five rupees' },
      { who: 'parent', od: 'Tarå tånka åchi-ki?', en: 'Does she have any money?' },
      { who: 'child', od: 'Hå, tarå dås tånka åchi', en: 'Yes, she has ten rupees' },
    ],
  },
  {
    id: 'num-fish',
    chapter: 'num',
    title: 'Back from the market',
    scene: 'A parent comes back from the market with a bag. The child peeks inside.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Machå åchi-ki?', en: 'Is there any fish?' },
      { who: 'parent', od: 'Hå, dui kilo machå åchi', en: 'Yes, there are two kilos of fish' },
      { who: 'child', od: 'Keteta machå åchi?', en: 'How many fish are there?' },
      { who: 'parent', od: 'Chåta machå åchi', en: 'There are six fish' },
    ],
  },
  {
    id: 'num-school-bag',
    chapter: 'num',
    title: 'Packing the school bag',
    scene: 'The night before school, the parent helps the child pack their bag.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Tåmårå keteta båhi åchi?', en: 'How many books do you have?  (informal)' },
      { who: 'child', od: 'Morå charita båhi åchi', en: 'I have four books' },
      { who: 'parent', od: 'Tåmårå pen åchi-ki?', en: 'Do you have a pen?  (informal)' },
      { who: 'child', od: 'Hå, morå duita pen åchi', en: 'Yes, I have two pens' },
    ],
  },
  {
    id: 'num-cows',
    chapter: 'num',
    title: 'Counting cows',
    scene: 'Driving past a field, the parent and child count the cows together.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Keteta gai åchi?', en: 'How many cows are there?' },
      { who: 'child', od: 'Ek, dui, tini, chari, panch', en: 'One, two, three, four, five' },
      { who: 'parent', od: 'Ek, dui, tini, chari, panch, chå!', en: 'One, two, three, four, five, six!' },
      { who: 'child', od: 'Chåta gai åchi!', en: 'There are six cows!' },
    ],
  },
  {
    id: 'num-last-bananas',
    chapter: 'num',
    title: 'The last bananas',
    scene: 'A hungry child looks for a snack after school.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Kådåli åchi-ki?', en: 'Are there any bananas?' },
      { who: 'parent', od: 'Hå, duita kådåli åchi', en: 'Yes, there are two bananas' },
      { who: 'child', od: 'Mitu ghåre åchi-ki?', en: 'Is Mitu at home?' },
      { who: 'parent', od: 'Na, Mitu ghåre nahi', en: 'No, Mitu is not at home' },
    ],
  },
]
