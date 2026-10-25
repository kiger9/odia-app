// Roleplays for the "futuretense" chapter (see ../roleplays.ts for the format and rules).
// Words available: everything up to futuretense.ts. Of the plain future forms only
// jibi, khelibi(/-bu), pibi(/-bå/-be/-bu), soibi(/-bu), anibi and råhibu are taught
// by now, plus the "-ki" questions (asibe-ki, dekhibå-ki, pibe-ki, anibå-ki, ...).

import type { Roleplay } from '../roleplays'

export const FUTURETENSE: Roleplay[] = [
  {
    id: 'futuretense-market',
    chapter: 'futuretense',
    title: 'Off to the market',
    scene: 'The parent is about to go to the market. The child stays home.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Mu bajår jibi', en: 'I will go to the market' },
      { who: 'child', od: 'Tåme ambå anibå-ki?', en: 'Will you bring mangoes?  (informal)' },
      { who: 'parent', od: 'Hå, mu ambå anibi', en: 'Yes, I will bring mangoes' },
      { who: 'child', od: 'Morå kådåli be dårkar', en: 'I want bananas too' },
      { who: 'parent', od: 'Mu dåsta kådåli anibi', en: 'I will bring ten bananas' },
      { who: 'child', od: 'Dhånyåvad!', en: 'Thank you!' },
    ],
  },
  {
    id: 'futuretense-going-out',
    chapter: 'futuretense',
    title: 'Going out to play',
    scene: 'The child is heading for the door.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåme kouthiki jauchå?', en: 'Where are you going?  (informal)' },
      { who: 'child', od: 'Mu baharå-ku jauchi', en: 'I am going out' },
      { who: 'parent', od: 'Rahul bahare åchi-ki?', en: 'Is Rahul outside?' },
      { who: 'child', od: 'Hå, mu Rahul-sangåre khelibi', en: 'Yes, I will play with Rahul' },
      { who: 'parent', od: 'Jagrata thå!', en: 'Be careful!' },
    ],
  },
  {
    id: 'futuretense-drinks',
    chapter: 'futuretense',
    title: 'Something to drink',
    scene: 'The parent is pouring drinks in the kitchen.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåme pani pibå-ki?', en: 'Will you drink water?  (informal)' },
      { who: 'child', od: 'Na, mu khirå pibi', en: 'No, I will drink milk' },
      { who: 'parent', od: 'Bapa be khirå pibe-ki?', en: 'Will dad drink milk too?' },
      { who: 'child', od: 'Na, bapa cha piuchånti', en: 'No, dad is drinking tea' },
      { who: 'parent', od: 'Aså pibå!', en: 'Let’s drink!' },
    ],
  },
  {
    id: 'futuretense-bedtime',
    chapter: 'futuretense',
    title: 'Time for sleep',
    scene: 'It is late, and the child is still playing.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Tåme soibå-ki?', en: 'Will you go to sleep?  (informal)' },
      { who: 'child', od: 'Na, mu tike khelibi', en: 'No, I will play a little' },
      { who: 'parent', od: 'Mitu soichi', en: 'Mitu is sleeping' },
      { who: 'child', od: 'Mu be soibi', en: 'I will sleep too' },
      { who: 'parent', od: 'Subha ratri!', en: 'Good night!' },
      { who: 'child', od: 'Subha ratri!', en: 'Good night!' },
    ],
  },
  {
    id: 'futuretense-grandmas-house',
    chapter: 'futuretense',
    title: 'To grandma’s house',
    scene: 'The parent is getting ready to visit grandma.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Mu Aai-nkårå ghårå-ku jauchi', en: 'I am going to grandma’s house' },
      { who: 'child', od: 'Mu be jibi!', en: 'I will go too!' },
      { who: 'parent', od: 'Ame seithi råhibu', en: 'We will stay there' },
      { who: 'child', od: 'Mu seithi khelibi', en: 'I will play there' },
      { who: 'parent', od: 'Tåme båhi anibå-ki?', en: 'Will you bring a book?  (informal)' },
      { who: 'child', od: 'Hå, mu båhi anibi', en: 'Yes, I will bring a book' },
    ],
  },
  {
    id: 'futuretense-dad-coming',
    chapter: 'futuretense',
    title: 'Is dad coming?',
    scene: 'The child is waiting for dad in the evening.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Bapa kouthi åchånti?', en: 'Where is dad?' },
      { who: 'parent', od: 'Bapa kamå kåruchånti', en: 'Dad is working' },
      { who: 'child', od: 'Bapa ghåre asibe-ki?', en: 'Will dad come home?' },
      { who: 'parent', od: 'Hå, bapa asuchånti', en: 'Yes, dad is coming' },
      { who: 'child', od: 'Mu bapa-nkå-sangåre khelibi!', en: 'I will play with dad!' },
    ],
  },
  {
    id: 'futuretense-cows',
    chapter: 'futuretense',
    title: 'Cows outside',
    scene: 'Some cows are passing the house.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Tåme gai dekhibå-ki?', en: 'Do you want to see the cows?  (informal)' },
      { who: 'child', od: 'Hå, gai kouthi åchi?', en: 'Yes, where are the cows?' },
      { who: 'parent', od: 'Bahare panchta gai åchi', en: 'There are five cows outside' },
      { who: 'child', od: 'Mu baharå-ku jibi!', en: 'I will go outside!' },
      { who: 'parent', od: 'Mu be asuchi', en: 'I am coming too' },
    ],
  },
]
