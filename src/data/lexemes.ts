// A "lexeme" is one thing to learn — a word or short phrase.
// This is a small SEED deck for Milestone 0: just enough real, everyday Odia to
// prove the spaced-repetition loop works end to end. The full curriculum comes
// later from docs/content-inventory.md; romanization here is provisional and will
// be refined in a native-speaker content pass.

export interface Lexeme {
  id: string
  script: string // Odia script
  phonetic: string // romanized pronunciation
  english: string
  note?: string // optional one-line usage/grammar hint
}

export const LEXEMES: Lexeme[] = [
  { id: 'greet-hello', script: 'ନମସ୍କାର', phonetic: 'namaskāra', english: 'hello / greetings' },
  { id: 'greet-thanks', script: 'ଧନ୍ୟବାଦ', phonetic: 'dhanyabāda', english: 'thank you' },
  { id: 'yes', script: 'ହଁ', phonetic: 'haṃ', english: 'yes' },
  { id: 'no', script: 'ନା', phonetic: 'nā', english: 'no' },
  {
    id: 'iam-well',
    script: 'ମୁଁ ଭଲ ଅଛି',
    phonetic: 'mu bhala achi',
    english: 'I am well',
    note: '“achi” is the verb “to be” — am / is.',
  },
  { id: 'how-are-you', script: 'ତୁମେ କେମିତି ଅଛ?', phonetic: 'tume kemiti achha?', english: 'how are you?' },
  { id: 'water', script: 'ପାଣି', phonetic: 'pāṇi', english: 'water' },
]
