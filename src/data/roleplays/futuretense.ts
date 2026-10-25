// Roleplays for the "futuretense" chapter (see ../roleplays.ts for the format and rules).
// Words available: everything up to futuretense, including the future forms its
// lessons teach (-ibi I · -ibå you/he/she · -ibe respectful/they · -ibu we) and the
// "Aså jibå / khaibå / khelibå" of Simple Commands. No time words yet (kali, kebe: time).

import type { Roleplay } from '../roleplays'

export const FUTURETENSE: Roleplay[] = [
  {
    id: 'futuretense-market',
    chapter: 'futuretense',
    title: 'Off to the market',
    scene: 'The parent is about to go to the market.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Mu bajår jibi', en: 'I will go to the market' },
      { who: 'child', od: 'Mu be asibi!', en: 'I will come too!' },
      { who: 'parent', od: 'Tåmårå kånå dårkar?', en: 'What do you want?  (informal)' },
      { who: 'child', od: 'Morå ambå dårkar', en: 'I want mangoes' },
      { who: 'parent', od: 'Aså jibå!', en: 'Let’s go!' },
    ],
  },
  {
    id: 'futuretense-play-with-me',
    chapter: 'futuretense',
    title: 'Play with me',
    scene: 'The child comes over with a ball.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Tåme mo-sangåre khelibå-ki?', en: 'Will you play with me?  (informal)' },
      { who: 'parent', od: 'Hå, mu khelibi', en: 'Yes, I will play' },
      { who: 'child', od: 'Rahul be asibå-ki?', en: 'Will Rahul come too?' },
      { who: 'parent', od: 'Hå, Rahul be asibå', en: 'Yes, Rahul will come too' },
      { who: 'child', od: 'Aså khelibå!', en: 'Let’s play!' },
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
      { who: 'child', od: 'Hå, mu gai dekhibi!', en: 'Yes, I will see the cows!' },
      { who: 'parent', od: 'Bahare panchta gai åchi', en: 'There are five cows outside' },
      { who: 'child', od: 'Mu baharå-ku jibi!', en: 'I will go outside!' },
      { who: 'parent', od: 'Mu be asibi', en: 'I will come too' },
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
    id: 'futuretense-dad-coming',
    chapter: 'futuretense',
    title: 'Is dad coming?',
    scene: 'The child is waiting for dad in the evening.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Bapa kouthi åchånti?', en: 'Where is dad?' },
      { who: 'parent', od: 'Bapa kamå kåruchånti', en: 'Dad is working' },
      { who: 'child', od: 'Bapa ghåre asibe-ki?', en: 'Will dad come home?' },
      { who: 'parent', od: 'Hå, bapa asibe', en: 'Yes, dad will come' },
      { who: 'child', od: 'Mu bapa-nkå-sangåre khaibi!', en: 'I will eat with dad!' },
    ],
  },
  {
    id: 'futuretense-gopal-dinner',
    chapter: 'futuretense',
    title: 'A friend for dinner',
    scene: 'The child’s friend Gopal may come over for dinner.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Gopal asibå-ki?', en: 'Will Gopal come?' },
      { who: 'parent', od: 'Hå, Gopal asibå', en: 'Yes, Gopal will come' },
      { who: 'child', od: 'Se kånå khaibå?', en: 'What will he eat?' },
      { who: 'parent', od: 'Se machå khaibå', en: 'He will eat fish' },
      { who: 'child', od: 'Mu be machå khaibi!', en: 'I will eat fish too!' },
    ],
  },
  {
    id: 'futuretense-grandmas-house',
    chapter: 'futuretense',
    title: 'To grandma’s house',
    scene: 'The parent is getting ready to visit grandma.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Mu Aai-nkårå ghårå-ku jibi', en: 'I will go to grandma’s house' },
      { who: 'child', od: 'Mu be jibi!', en: 'I will go too!' },
      { who: 'parent', od: 'Ame seithi råhibu', en: 'We will stay there' },
      { who: 'child', od: 'Mu seithi khelibi!', en: 'I will play there!' },
      { who: 'parent', od: 'Aså jibå!', en: 'Let’s go!' },
    ],
  },
]
