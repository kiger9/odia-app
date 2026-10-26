// Words the roleplays use beyond what the lessons teach, one file per chapter
// (see ../roleplays.ts). Registered in ../script.ts as "rp-<chapter>" lists.

import { RP_START } from './roleplays/start'
import { RP_MEET } from './roleplays/meet'
import { RP_NUM } from './roleplays/num'
import { RP_SIMPLECONJ } from './roleplays/simpleconj'
import { RP_THINGS } from './roleplays/things'
import { RP_AROUND } from './roleplays/around'
import { RP_DOING } from './roleplays/doing'
import { RP_CMD } from './roleplays/cmd'
import { RP_PASTTENSE } from './roleplays/pasttense'
import { RP_FUTURETENSE } from './roleplays/futuretense'
import { RP_LIFE } from './roleplays/life'
import { RP_TIME } from './roleplays/time'

export const ROLEPLAY_WORD_LISTS: Record<string, Record<string, string>> = {
  'rp-start': RP_START,
  'rp-meet': RP_MEET,
  'rp-num': RP_NUM,
  'rp-simpleconj': RP_SIMPLECONJ,
  'rp-things': RP_THINGS,
  'rp-around': RP_AROUND,
  'rp-doing': RP_DOING,
  'rp-cmd': RP_CMD,
  'rp-pasttense': RP_PASTTENSE,
  'rp-futuretense': RP_FUTURETENSE,
  'rp-life': RP_LIFE,
  'rp-time': RP_TIME,
}
