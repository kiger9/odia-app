// Roleplays for the "futuretense" chapter (see ../roleplays.ts for the format and rules).
// Words available: everything up to futuretense, including the future forms its
// lessons teach (-ibi I · -ibå you/he/she · -ibe respectful/they · -ibu we) and the
// "Aså jibå / khaibå / khelibå" of Simple Commands. Time words (kali, kebe,
// shighrå) belong to the next chapters, so these plans have no day attached.

import type { Roleplay } from '../roleplays'

export const FUTURETENSE: Roleplay[] = [
  {
    id: 'futuretense-eat-with-me',
    chapter: 'futuretense',
    title: 'Eat with me',
    scene: 'Dinner is on the table and the child sits down.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Ma, tåme mo-sangåre khaibå-ki?', en: 'Mom, will you eat with me?' },
      { who: 'parent', od: 'Hå, mu tåmå-sangåre khaibi', en: 'Yes, I’ll eat with you' },
      { who: 'child', od: 'Bapa be khaibe-ki?', en: 'Will dad eat too?' },
      { who: 'parent', od: 'Na, Bapa påre khaibe', en: 'No, dad will eat later' },
      { who: 'child', od: 'Thik åchi, aså khaibå!', en: 'Okay, let’s eat!' },
    ],
  },
  {
    id: 'futuretense-market',
    chapter: 'futuretense',
    title: 'What will you bring?',
    scene: 'The parent is putting on shoes to go to the market.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Mu bajår jauchi', en: 'I’m going to the market' },
      { who: 'child', od: 'Mo-pai kånå anibå?', en: 'What will you bring me?' },
      { who: 'parent', od: 'Tåme kånå khaibå?', en: 'What would you like to eat?' },
      { who: 'child', od: 'Mu ambå khaibi', en: 'I’d like mangoes' },
      { who: 'parent', od: 'Thik åchi, mu ambå anibi', en: 'Okay, I’ll bring mangoes' },
    ],
  },
  {
    id: 'futuretense-play-outside',
    chapter: 'futuretense',
    title: 'Playing outside',
    scene: 'The child is heading for the door with a ball.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Ma, mu bahare khelibi', en: 'Mom, I’m going to play outside' },
      { who: 'parent', od: 'Kaha-sangåre khelibå?', en: 'Who will you play with?' },
      { who: 'child', od: 'Rahul-sangåre khelibi', en: 'I’ll play with Rahul' },
      { who: 'parent', od: 'Thik åchi, kintu deri kårå nahi', en: 'Okay, but don’t be late' },
      { who: 'child', od: 'Achha, Ma. Mu jauchi!', en: 'Okay, mom. Bye!' },
    ],
  },
  {
    id: 'futuretense-story',
    chapter: 'futuretense',
    title: 'A bedtime story',
    scene: 'It is bedtime and the child wants a story.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Ma, mote gote gåpå kåhibå-ki?', en: 'Mom, will you tell me a story?' },
      { who: 'parent', od: 'Hå, kåhibi. Bichåna-ku aså', en: 'Yes, I will. Come to bed' },
      { who: 'child', od: 'Mu raja gåpå sunibi', en: 'I want to hear the king story' },
      { who: 'parent', od: 'Thik åchi. Akhi bånd kårå', en: 'Okay. Close your eyes' },
    ],
  },
  {
    id: 'futuretense-grandma-coming',
    chapter: 'futuretense',
    title: 'Grandma is coming',
    scene: 'The parent has just got off the phone with grandma.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Aai asibe!', en: 'Grandma is coming!' },
      { who: 'child', od: 'Båhut badhiya. Aai kånå anibe?', en: 'Great! What will grandma bring?' },
      { who: 'parent', od: 'Tåmå-pai mitha anibe', en: 'She’ll bring sweets for you' },
      { who: 'child', od: 'Aai eithi råhibe-ki?', en: 'Will grandma stay here?' },
      { who: 'parent', od: 'Hå, se eithi råhibe', en: 'Yes, she’ll stay here' },
    ],
  },
  {
    id: 'futuretense-drink',
    chapter: 'futuretense',
    title: 'Something to drink',
    scene: 'The parent is in the kitchen making drinks.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåme kånå pibå?', en: 'What will you drink?  (informal)' },
      { who: 'child', od: 'Mu khirå pibi', en: 'I’ll have milk' },
      { who: 'parent', od: 'Thånda na gåråm?', en: 'Cold or hot?' },
      { who: 'child', od: 'Gåråm, tike chini diå', en: 'Hot, with a little sugar' },
      { who: 'parent', od: 'Thik åchi, mu ani debi', en: 'Okay, I’ll get it for you' },
    ],
  },
  {
    id: 'futuretense-zoo',
    chapter: 'futuretense',
    title: 'A trip to the zoo',
    scene: 'The parent tells the child about a family outing.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Ame Nandankanan jibu', en: 'We’re going to Nandankanan zoo' },
      { who: 'child', od: 'Hati dekhibu-ki?', en: 'Will we see elephants?' },
      { who: 'parent', od: 'Hå, båhut hati dekhibu', en: 'Yes, we’ll see lots of elephants' },
      { who: 'child', od: 'Mu hati-ku kådåli khuaibi!', en: 'I’ll feed an elephant a banana!' },
      { who: 'parent', od: 'Hå, kintu jagrata thå', en: 'Yes, but be careful' },
    ],
  },
  {
    id: 'futuretense-homework',
    chapter: 'futuretense',
    title: 'Help with homework',
    scene: 'The child is stuck on homework at the table.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Bapa, mote tike help kåribå-ki?', en: 'Dad, will you help me a bit?' },
      { who: 'parent', od: 'Hå, kåribi. Kånå kåruchå?', en: 'Yes, I will. What are you doing?' },
      { who: 'child', od: 'Homework. Eita båhut kåstå', en: 'Homework. It’s really hard' },
      { who: 'parent', od: 'Chinta kårå nahi, ame ekåthi kåribu', en: 'Don’t worry, we’ll do it together' },
      { who: 'child', od: 'Dhånyåvad, Bapa!', en: 'Thanks, dad!' },
    ],
  },
]
