// Loosely compare a typed answer to the expected one: ignore case, surrounding
// space, punctuation, and diacritics (so "achu" matches "åchu"). This mirrors the
// prototype's tolerant matching.
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining accent marks
    .replace(/[^a-z0-9 ]/g, '') // drop punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

// Spaces and hyphens are ignored too, so "jauchå-ki", "jauchå ki" and
// "jauchåki" all count as the same answer.
export function answerMatches(input: string, expected: string, alts: string[] = []): boolean {
  const compact = (s: string) => normalize(s.replace(/-/g, ' ')).replace(/ /g, '')
  const got = compact(input)
  return [expected, ...alts].some((a) => compact(a) === got)
}
