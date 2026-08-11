// The spaced-repetition scheduler. This is the whole reason the real app exists:
// it decides WHEN each word should come back so you review it right before you'd
// forget it. We use ts-fsrs (a proven, well-tested implementation) so we don't
// have to invent the memory math ourselves.

import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs'

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }))

// The four ways a learner can rate how well they recalled a card.
export { Rating }
export type { Card, Grade }

// A brand-new card is due immediately, so it appears in the first session.
export function newCard(now: Date): Card {
  return createEmptyCard(now)
}

// Given the previous card state, the moment of review, and how well it went,
// return the updated card (which carries the next due date inside it).
export function review(card: Card, now: Date, grade: Grade): Card {
  return scheduler.next(card, now, grade).card
}
