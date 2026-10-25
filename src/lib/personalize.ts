// Replace the {name} placeholder (used in the "your name" lesson) with the
// learner's own name, everywhere it appears in a step (strings + token arrays).
// Notes and explanations are rendered as HTML, so there the name is escaped.

const HTML_FIELDS = new Set(['note', 'why'])

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

export function personalize<T>(value: T, name: string, html = false): T {
  if (typeof value === 'string')
    return value.replace(/\{name\}/g, html ? escapeHtml(name) : name) as unknown as T
  if (Array.isArray(value)) return value.map((v) => personalize(v, name, html)) as unknown as T
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const k in value)
      out[k] = personalize((value as Record<string, unknown>)[k], name, html || HTML_FIELDS.has(k))
    return out as T
  }
  return value
}
