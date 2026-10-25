// Roleplays for the "pasttense" chapter (see ../roleplays.ts for the format and rules).
// Words available: start … cmd, plus pasttense.ts (-ili/-ilå/-ila/-ilu/-ile,
// gåli/gålå/…, the I-forms of -uthili and -ithili, kåri deli/delå, badhiya).
// Past questions here use kånå/kouthi/kouthiki/kemiti: no past "-ki" forms
// (khailå-ki …) are taught yet.

import type { Roleplay } from '../roleplays'

export const PASTTENSE: Roleplay[] = [
  {
    id: 'pasttense-lunch',
    chapter: 'pasttense',
    title: 'What did you eat?',
    scene: 'After lunch, the child asks the parent about it.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Tåme kånå khailå?', en: 'What did you eat?  (informal)' },
      { who: 'parent', od: 'Mu bhatå khaili', en: 'I ate rice' },
      { who: 'child', od: 'Mu be bhatå khaili', en: 'I ate rice too' },
      { who: 'parent', od: 'Tåme kånå piilå?', en: 'What did you drink?  (informal)' },
      { who: 'child', od: 'Mu khirå piili', en: 'I drank milk' },
      { who: 'parent', od: 'Båhut badhiya!', en: 'Great!' },
    ],
  },
  {
    id: 'pasttense-rahuls-house',
    chapter: 'pasttense',
    title: 'Back from Rahul’s',
    scene: 'The child comes home in the evening.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåme kouthiki gålå?', en: 'Where did you go?  (informal)' },
      { who: 'child', od: 'Mu Rahul-rå ghårå-ku gåli', en: 'I went to Rahul’s house' },
      { who: 'parent', od: 'Bhatå dårkar-ki?', en: 'Do you want rice?' },
      { who: 'child', od: 'Na, mu Rahul-rå ghåre khaithili', en: 'No, I had eaten at Rahul’s house' },
      { who: 'parent', od: 'Tåme kånå khailå?', en: 'What did you eat?  (informal)' },
      { who: 'child', od: 'Ame machå khailu', en: 'We ate fish' },
    ],
  },
  {
    id: 'pasttense-gopal-came',
    chapter: 'pasttense',
    title: 'Gopal came over',
    scene: 'The parent comes home from work and the child tells what happened.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Gopal asila', en: 'Gopal came' },
      { who: 'parent', od: 'Gopal kouthi åchi?', en: 'Where is Gopal?' },
      { who: 'child', od: 'Gopal ghårå-ku gåla', en: 'Gopal went home' },
      { who: 'parent', od: 'Tåme kånå kårilå?', en: 'What did you do?  (informal)' },
      { who: 'child', od: 'Ame bahare khelilu', en: 'We played outside' },
    ],
  },
  {
    id: 'pasttense-elephant',
    chapter: 'pasttense',
    title: 'I saw an elephant!',
    scene: 'The child runs in, excited about something on the road.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Mu hati dekhili!', en: 'I saw an elephant!' },
      { who: 'parent', od: 'Tåme kouthi dekhilå?', en: 'Where did you see it?  (informal)' },
      { who: 'child', od: 'Mu måndirå-ku jauthili', en: 'I was going to the temple' },
      { who: 'parent', od: 'Ame be hati dekhilu', en: 'We saw an elephant too' },
      { who: 'child', od: 'Hati båhut bådå!', en: 'The elephant is so big!' },
    ],
  },
  {
    id: 'pasttense-did-it',
    chapter: 'pasttense',
    title: 'You did it!',
    scene: 'The child finishes a puzzle and shows it off.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Mu kåri deli!', en: 'I did it!' },
      { who: 'parent', od: 'Båhut badhiya!', en: 'Great job!' },
      { who: 'child', od: 'Bapa help kårile', en: 'Dad helped' },
      { who: 'parent', od: 'Na, tåme kåri delå!', en: 'No, you did it!  (informal)' },
      { who: 'child', od: 'Dhånyåvad!', en: 'Thank you!' },
    ],
  },
  {
    id: 'pasttense-market-trip',
    chapter: 'pasttense',
    title: 'Back from the market',
    scene: 'The parent comes in with a full bag; the child stayed home with Grandma.',
    you: 'parent',
    lines: [
      { who: 'child', od: 'Tåme kouthiki gålå?', en: 'Where did you go?  (informal)' },
      { who: 'parent', od: 'Ame market-ku gålu', en: 'We went to the market' },
      { who: 'child', od: 'Tåme kånå anilå?', en: 'What did you bring?  (informal)' },
      { who: 'parent', od: 'Mu ambå anili', en: 'I brought mangoes' },
      { who: 'child', od: 'Ambå mitha-ki?', en: 'Are the mangoes sweet?' },
      { who: 'parent', od: 'Hå, båhut mitha', en: 'Yes, very sweet' },
    ],
  },
  {
    id: 'pasttense-good-morning',
    chapter: 'pasttense',
    title: 'How did you sleep?',
    scene: 'The child comes into the kitchen in the morning.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Subha såkalå!', en: 'Good morning!' },
      { who: 'child', od: 'Subha såkalå!', en: 'Good morning!' },
      { who: 'parent', od: 'Tåme kemiti soilå?', en: 'How did you sleep?  (informal)' },
      { who: 'child', od: 'Mu båhut bhålå soili', en: 'I slept very well' },
    ],
  },
  {
    id: 'pasttense-grandma-came',
    chapter: 'pasttense',
    title: 'Grandma came',
    scene: 'The parent gets home and the child has news.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Aai asile', en: 'Grandma came' },
      { who: 'parent', od: 'Aai kånå anile?', en: 'What did Grandma bring?' },
      { who: 'child', od: 'Aai phulå anile', en: 'Grandma brought flowers' },
      { who: 'parent', od: 'Tåme kånå kårilå?', en: 'What did you do?  (informal)' },
      { who: 'child', od: 'Ame ambå khailu', en: 'We ate mangoes' },
    ],
  },
]
