// Roleplays for the "cmd" chapter (see ../roleplays.ts for the format and rules).
// Words available: start … doing, plus cmd.ts (Ruhå!, Dekhå!, … nahi, aså/jaå,
// emiti/semiti, khelå, tike/besi). The "let's" forms (Aså jibå, Aså khaibå …)
// and "khai paribå" are not usable here: jibå, khaibå, pibå, khelibå and paribå
// are first listed in later chapters' word lists.

import type { Roleplay } from '../roleplays'

export const CMD: Roleplay[] = [
  {
    id: 'cmd-dont-touch',
    chapter: 'cmd',
    title: 'Don’t touch that',
    scene: 'The child reaches for the hot pan on the stove.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Ruhå!', en: 'Stop!' },
      { who: 'child', od: 'Kånå?', en: 'What?' },
      { who: 'parent', od: 'Seita chuañ nahi', en: 'Don’t touch that' },
      { who: 'child', od: 'Seita kånå?', en: 'What is that?' },
      { who: 'parent', od: 'Seita bipadå', en: 'That is dangerous' },
    ],
  },
  {
    id: 'cmd-come-here',
    chapter: 'cmd',
    title: 'Come here, Mitu',
    scene: 'The parent calls Mitu in from playing.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Mitu, eithiki aså!', en: 'Mitu, come here!' },
      { who: 'child', od: 'Mu kheluchi!', en: 'I am playing!' },
      { who: 'parent', od: 'Ebe aså', en: 'Come now' },
      { who: 'child', od: 'Mu asuchi!', en: 'I am coming!' },
      { who: 'parent', od: 'Dhaudå nahi!', en: 'Don’t run!' },
    ],
  },
  {
    id: 'cmd-go-play',
    chapter: 'cmd',
    title: 'Go play',
    scene: 'The child sees a friend outside and asks to join him.',
    you: 'child',
    lines: [
      { who: 'child', od: 'Rahul bahare kheluchi', en: 'Rahul is playing outside' },
      { who: 'parent', od: 'Jaå, khelå', en: 'Go play' },
      { who: 'child', od: 'Tåme be asuchå-ki?', en: 'Are you coming too?  (informal)' },
      { who: 'parent', od: 'Na, mu kamå kåruchi', en: 'No, I am working' },
      { who: 'child', od: 'Mu jauchi!', en: 'I’m going!' },
      { who: 'parent', od: 'Jagrata thå!', en: 'Be careful!' },
    ],
  },
  {
    id: 'cmd-like-this',
    chapter: 'cmd',
    title: 'Like this',
    scene: 'The child is trying to fold a paper boat.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Tåme kånå kåruchå?', en: 'What are you doing?  (informal)' },
      { who: 'child', od: 'Mu chesta kåruchi', en: 'I am trying' },
      { who: 'parent', od: 'Semiti kårå nahi', en: 'Don’t do it like that' },
      { who: 'child', od: 'Emiti?', en: 'Like this?' },
      { who: 'parent', od: 'Hå, emiti kårå', en: 'Yes, do it like this' },
    ],
  },
  {
    id: 'cmd-thank-you',
    chapter: 'cmd',
    title: 'A little water',
    scene: 'The child comes into the kitchen, thirsty after playing.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Tåmårå kånå dårkar?', en: 'What do you want?  (informal)' },
      { who: 'child', od: 'Morå tike pani dårkar', en: 'I need a little water' },
      { who: 'parent', od: 'Mu pani anuchi', en: 'I am bringing water' },
      { who: 'child', od: 'Dhånyåvad!', en: 'Thank you!' },
      { who: 'parent', od: 'Kichi nuhe', en: 'You’re welcome' },
    ],
  },
  {
    id: 'cmd-grandma-sleeping',
    chapter: 'cmd',
    title: 'Grandma is sleeping',
    scene: 'The kids are racing around the house while Grandma naps.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Dhaudå nahi!', en: 'Don’t run!' },
      { who: 'child', od: 'Ame kheluchu', en: 'We are playing' },
      { who: 'parent', od: 'Aai soichånti', en: 'Grandma is sleeping' },
      { who: 'child', od: 'Ame baharå-ku jauchu', en: 'We are going outside' },
      { who: 'parent', od: 'Hå, jaå, khelå', en: 'Yes, go play' },
    ],
  },
  {
    id: 'cmd-a-little-a-lot',
    chapter: 'cmd',
    title: 'A little or a lot?',
    scene: 'The parent is serving dinner.',
    you: 'child',
    lines: [
      { who: 'parent', od: 'Bhatå besi dårkar-ki?', en: 'Do you want a lot of rice?' },
      { who: 'child', od: 'Na, tike dårkar', en: 'No, I want a little' },
      { who: 'parent', od: 'Machå dårkar-ki?', en: 'Do you want fish?' },
      { who: 'child', od: 'Hå, besi dårkar!', en: 'Yes, I want a lot!' },
      { who: 'parent', od: 'Mu machå anuchi', en: 'I am bringing fish' },
    ],
  },
  {
    id: 'cmd-look-out',
    chapter: 'cmd',
    title: 'Look out!',
    scene: 'The child is at the gate when a cow wanders down the lane.',
    you: 'parent',
    lines: [
      { who: 'parent', od: 'Dekhå!', en: 'Look out!' },
      { who: 'child', od: 'Kånå?', en: 'What?' },
      { who: 'parent', od: 'Gai asuchi', en: 'A cow is coming' },
      { who: 'child', od: 'Gai kouthi åchi?', en: 'Where is the cow?' },
      { who: 'parent', od: 'Gai seithi åchi', en: 'The cow is over there' },
      { who: 'child', od: 'Mu eithi råhuchi', en: 'I am staying here' },
    ],
  },
]
