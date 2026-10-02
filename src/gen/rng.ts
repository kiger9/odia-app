// Small randomness helpers for the exercise generator. Everything takes an
// explicit `rng` so a run can be reproduced from a seed when testing.

export type Rng = () => number

// mulberry32 — a tiny, fast, seedable PRNG.
export function makeRng(seed = Math.floor(Math.random() * 2 ** 32)): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function chance(rng: Rng, p: number): boolean {
  return rng() < p
}
