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

export function answerMatches(input: string, expected: string, alts: string[] = []): boolean {
  const got = normalize(input)
  return [expected, ...alts].some((a) => normalize(a) === got)
}
