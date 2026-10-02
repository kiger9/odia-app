// Replace the {name} placeholder (used in the "your name" lesson) with the
// learner's own name, everywhere it appears in a step (strings + token arrays).
export function personalize<T>(value: T, name: string): T {
  if (typeof value === 'string') return value.replace(/\{name\}/g, name) as unknown as T
  if (Array.isArray(value)) return value.map((v) => personalize(v, name)) as unknown as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const k in value) out[k] = personalize((value as Record<string, unknown>)[k], name)
    return out as T
  }
  return value
}
