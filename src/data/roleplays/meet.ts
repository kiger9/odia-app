// Roleplays for the "meet" chapter (see ../roleplays.ts for the format and rules).
// Core: greetings at the right moment of the day (Namaskar, Subha såkalå /
// såndhya / ratri, Mu jauchi · Mu råhuchi) and names (… namo kånå?). Words the
// lessons don't teach are in ../words/roleplays/meet.ts (or another chapter's list).

import type { Roleplay } from '../roleplays'

export const MEET: Roleplay[] = [
  {
    id: 'meet-wake-up',
    chapter: 'meet',
    title: 'Wake up!',
    scene: 'On a school morning the parent comes in to wake Mitu.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Subha såkalå, Mitu. Uthå', en: 'Good morning, Mitu! Wake up' },
      { who: 'child', od: 'Subha såkalå, Ma. Mu au tike soibi', en: 'Good morning, Mom. I’ll sleep a bit more' },
      { who: 'parent', od: 'Na, aji school åchi. Jåldi uthå!', en: 'No, there’s school today. Get up quickly!' },
      { who: 'child', od: 'Håu, Ma. Mu uthuchi', en: 'Okay, Mom. I’m getting up' },
    ],
  },
  {
    id: 'meet-friends-mom',
    chapter: 'meet',
    title: 'At the door',
    scene: 'The doorbell rings: it’s Gopal’s mother, come to fetch him. The child opens the door.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Namaskar!', en: 'Hello!' },
      { who: 'parent', od: 'Namaskar. Mu Gopal-rå ma', en: 'Hello! I’m Gopal’s mom' },
      { who: 'child', od: 'Asåntu. Gopal bhitåre kheluchi', en: 'Please come in! Gopal is playing inside' },
      { who: 'parent', od: 'Dhånyåvad. Tåmårå namo kånå?', en: 'Thank you. What’s your name?  (informal)' },
      { who: 'child', od: 'Morå namo Rabi', en: 'My name is Rabi' },
    ],
  },
  {
    id: 'meet-off-to-school',
    chapter: 'meet',
    title: 'Off to school',
    scene: 'The child is rushing out of the door to school.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Ma, mu jauchi!', en: 'Mom, I’m off!' },
      { who: 'parent', od: 'Ruhå. Tåmårå jota kouthi?', en: 'Wait! Where are your shoes?' },
      { who: 'child', od: 'Jota bhitåre åchi', en: 'My shoes are inside' },
      { who: 'parent', od: 'Jåldi pindhå!', en: 'Put them on, quick!' },
      { who: 'child', od: 'Håu. Ebe mu jauchi!', en: 'Okay. Now I’m off!' },
      { who: 'parent', od: 'Håu, mu råhuchi!', en: 'Okay, bye-bye!' },
    ],
  },
  {
    id: 'meet-new-teacher',
    chapter: 'meet',
    title: 'The new teacher',
    scene: 'The child is back from school and the parent asks about the day.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Aji school kemiti thila?', en: 'How was school today?' },
      { who: 'child', od: 'Båhut bhålå. Jåne nua teacher asile', en: 'Great! A new teacher came' },
      { who: 'parent', od: 'Tankå namo kånå?', en: 'What’s her name?' },
      { who: 'child', od: 'Tankå namo Mina Madam', en: 'Her name is Mina Madam' },
      { who: 'parent', od: 'Se kemiti?', en: 'What’s she like?' },
      { who: 'child', od: 'Se båhut bhålå!', en: 'She’s really nice!' },
    ],
  },
  {
    id: 'meet-good-evening',
    chapter: 'meet',
    title: 'Mom’s home',
    scene: 'Mom gets home in the evening and looks for the kids.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Subha såndhya. Mu asili', en: 'Good evening! I’m home' },
      { who: 'child', od: 'Subha såndhya, Ma!', en: 'Good evening, Mom!' },
      { who: 'parent', od: 'Rabi kouthi?', en: 'Where’s Rabi?' },
      { who: 'child', od: 'Rabi upåre åchi. Se pådhuchi', en: 'Rabi is upstairs. He’s studying' },
      { who: 'parent', od: 'Båhut bhålå!', en: 'Very good!' },
    ],
  },
  {
    id: 'meet-new-doll',
    chapter: 'meet',
    title: 'The new doll',
    scene: 'The child shows the parent a doll they were given today.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Båhut sundår putuli. Tarå namo kånå?', en: 'What a pretty doll! What’s her name?' },
      { who: 'child', od: 'Tarå namo Mitu', en: 'Her name is Mitu' },
      { who: 'parent', od: 'Mitu. Tåmårå bhåuni-rå namo be Mitu!', en: 'Mitu! That’s your sister’s name too!' },
      { who: 'child', od: 'Hå. Ei Mitu chotå, sei Mitu bådå', en: 'Yes! This Mitu is little, that Mitu is big' },
    ],
  },
  {
    id: 'meet-good-night',
    chapter: 'meet',
    title: 'Good night, Grandma',
    scene: 'At bedtime the child says good night to Mom, then wants to say it to Grandma too.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Ma, mu soiba-ku jauchi. Subha ratri!', en: 'Mom, I’m going to bed. Good night!' },
      { who: 'parent', od: 'Subha ratri. Aai-nku be kåhå', en: 'Good night! Say it to Grandma too' },
      { who: 'child', od: 'Aai soichånti-ki?', en: 'Is Grandma asleep?' },
      { who: 'parent', od: 'Na, Aai upåre båhi pådhuchånti', en: 'No, Grandma is upstairs reading' },
      { who: 'child', od: 'Håu, mu upårå-ku jauchi', en: 'Okay, I’m going up' },
    ],
  },
]
