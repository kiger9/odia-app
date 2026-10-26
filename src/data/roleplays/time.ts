// Roleplays for the "time" chapter (see ../roleplays.ts for the format and rules).
// Words available: everything — now with aji / kali / gåtå kali, shighrå, jåldi,
// kebe? and the full set of future forms.

import type { Roleplay } from '../roleplays'

export const TIME: Roleplay[] = [
  {
    id: 'time-tomorrow',
    chapter: 'time',
    title: 'What will we do tomorrow?',
    scene: 'Saturday evening, and the child wants to know the plan.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Kali ame kånå kåribu?', en: 'What will we do tomorrow?' },
      { who: 'parent', od: 'Kali råbibar. Ame Puri jibu', en: 'Tomorrow is Sunday. We’ll go to Puri' },
      { who: 'child', od: 'Ame såmudrå dekhibu-ki?', en: 'Will we see the sea?' },
      { who: 'parent', od: 'Hå, ame bali-re khelibu', en: 'Yes, we’ll play in the sand' },
      { who: 'child', od: 'Mu båhut khusi åchi!', en: 'I’m so happy!' },
    ],
  },
  {
    id: 'time-when-dad',
    chapter: 'time',
    title: 'When will dad come?',
    scene: 'Dinner is ready, but dad is not home yet.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Ma, Bapa kebe asibe?', en: 'Mom, when will dad come?' },
      { who: 'parent', od: 'Bapa shighrå asibe', en: 'Dad will be here soon' },
      { who: 'child', od: 'Kintu mote båhut bhokå laguchi', en: 'But I’m really hungry' },
      { who: 'parent', od: 'Tike åpekhya kårå. Ame Bapa-nkå-sangåre khaibu', en: 'Wait a little. We’ll eat with dad' },
      { who: 'child', od: 'Bapa asigåle!', en: 'Dad’s here!' },
    ],
  },
  {
    id: 'time-bus',
    chapter: 'time',
    title: 'The school bus',
    scene: 'A school morning, and the child is still at the door.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Rabi, jåldi kårå. Bus shighrå asibå', en: 'Rabi, hurry up. The bus will be here soon' },
      { who: 'child', od: 'Ruhå, jota pindhuchi', en: 'Wait, I’m putting on my shoes' },
      { who: 'parent', od: 'Jåldi aså. Tiffin nelå-ki?', en: 'Come quickly. Did you take your lunch box?' },
      { who: 'child', od: 'Hå, neli. Mu jauchi, Ma!', en: 'Yes, I did. Bye, mom!' },
    ],
  },
  {
    id: 'time-grandma-came',
    chapter: 'time',
    title: 'Grandma came last night',
    scene: 'The child wakes up to news of a visitor.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Gåtå kali rati Aai asile', en: 'Grandma came last night' },
      { who: 'child', od: 'Aai kouthi åchånti?', en: 'Where is grandma?' },
      { who: 'parent', od: 'Se bågicha-re åchånti', en: 'She’s in the garden' },
      { who: 'child', od: 'Aai kete dinå råhibe?', en: 'How many days will grandma stay?' },
      { who: 'parent', od: 'Aji au kali råhibe', en: 'She’ll stay today and tomorrow' },
      { who: 'child', od: 'Mu Aai-nkå-sangåre khelibi!', en: 'I’m going to play with grandma!' },
    ],
  },
  {
    id: 'time-birthday',
    chapter: 'time',
    title: 'Birthday tomorrow',
    scene: 'The night before the child’s birthday.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Ma, kali morå jånmådinå!', en: 'Mom, tomorrow is my birthday!' },
      { who: 'parent', od: 'Hå, mu jane. Kali kånå khaibå?', en: 'Yes, I know. What do you want to eat tomorrow?' },
      { who: 'child', od: 'Cake au pizza!', en: 'Cake and pizza!' },
      { who: 'parent', od: 'Thik åchi. Kiye kiye asibe?', en: 'Okay. Who’s coming?' },
      { who: 'child', od: 'Rahul, Mitu au Gopal asibe', en: 'Rahul, Mitu and Gopal will come' },
    ],
  },
  {
    id: 'time-play-later',
    chapter: 'time',
    title: 'Play with me!',
    scene: 'Dad is busy working when the child comes over.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Bapa, mo-sangåre khelibå-ki?', en: 'Dad, will you play with me?' },
      { who: 'parent', od: 'Ebe nuhe, mu kamå kåruchi', en: 'Not now, I’m working' },
      { who: 'child', od: 'Tåme kebe khelibå?', en: 'When will you play?  (informal)' },
      { who: 'parent', od: 'Shighrå. Dås minit påre', en: 'Soon. In ten minutes' },
      { who: 'child', od: 'Thik åchi, jåldi asibå!', en: 'Okay, come quickly!' },
    ],
  },
  {
    id: 'time-school-today',
    chapter: 'time',
    title: 'How was school?',
    scene: 'The child has just come home from school.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Aji school-re kånå kårilå?', en: 'What did you do at school today?' },
      { who: 'child', od: 'Ame bahare football khelilu', en: 'We played football outside' },
      { who: 'parent', od: 'Tåme goal kårilå-ki?', en: 'Did you score a goal?' },
      { who: 'child', od: 'Hå, mu duita goal kårili!', en: 'Yes, I scored two goals!' },
      { who: 'parent', od: 'Båhut badhiya!', en: 'Great job!' },
    ],
  },
  {
    id: 'time-bath',
    chapter: 'time',
    title: 'Bath time',
    scene: 'The child is playing and does not want a bath.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Mitu, jåldi gadhoiba-ku jaå', en: 'Mitu, go and have your bath, quickly' },
      { who: 'child', od: 'Mu påre gadhoibi', en: 'I’ll have it later' },
      { who: 'parent', od: 'Na, ebe jaå. Gåtå kali be gadhoi nåthilå', en: 'No, go now. You didn’t have a bath yesterday either' },
      { who: 'child', od: 'Thik åchi, mu jauchi', en: 'Okay, I’m going' },
    ],
  },
]
