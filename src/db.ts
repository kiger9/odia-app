// The on-device progress store. Everything a learner does is written here
// immediately, into the browser's built-in IndexedDB storage (via Dexie, a
// friendlier wrapper). That's what lets you close the app, reopen it tomorrow,
// and find your progress — and your due reviews — exactly where you left them.

import Dexie, { type Table } from 'dexie'
import type { Card } from './srs'

export interface Progress {
  lexemeId: string // which word this tracks (primary key)
  due: number // when it's next due, as a timestamp (indexed, so we can find due cards fast)
  reviews: number // how many times it's been reviewed
  card: Card // the full ts-fsrs scheduling state
  updatedAt: number
}

class OdiaDB extends Dexie {
  progress!: Table<Progress, string>

  constructor() {
    super('odia-app')
    this.version(1).stores({
      progress: 'lexemeId, due',
    })
  }
}

export const db = new OdiaDB()

// Ask the browser to keep our data safe from automatic eviction. On iOS Safari
// this reduces the chance progress gets cleared to reclaim space.
export async function requestPersistentStorage(): Promise<void> {
  if (navigator.storage?.persist) {
    await navigator.storage.persist()
  }
}
