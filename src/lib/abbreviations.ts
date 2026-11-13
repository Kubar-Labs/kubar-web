/*
 * Abbreviations (HANDOFF section 8; copy deck 4.1): the first use of each on
 * a page carries its expansion. This finds them in a run of text.
 */
export type AbbreviationMatch = { key: string; index: number; length: number };

function escape(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Longest first, so "GIFT IFIH" wins over "GIFT City"'s "GIFT", "IFSCA" over "IFSC" and "MSME" over "SME". */
export function abbreviationPattern(keys: string[]) {
  const alternatives = [...keys].sort((a, b) => b.length - a.length).map(escape).join("|");
  // A whole word, with an optional plural "s" ("IBUs").
  return new RegExp(`(?<![A-Za-z0-9])(${alternatives})(?=s?(?![A-Za-z0-9]))`, "g");
}

/** The first abbreviation in `text` that hasn't been seen yet on this page. */
export function nextAbbreviation(text: string, pattern: RegExp, seen: Set<string>): AbbreviationMatch | null {
  pattern.lastIndex = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    if (!seen.has(match[1])) return { key: match[1], index: match.index, length: match[1].length };
  }
  return null;
}
