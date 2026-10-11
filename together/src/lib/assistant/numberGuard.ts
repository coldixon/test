/**
 * Number guard: the check that keeps the AI honest.
 *
 * Every recommendation carries a set of `facts`: the numbers the calculation
 * engine produced for it. An explanation (from a template or from a language
 * model) may only contain numbers that appear in those facts. Any other number
 * is rejected and the caller falls back to the template wording.
 */

export type Facts = Record<string, number>;

const MONTH_WORD = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*$/i;

export interface GuardResult {
  ok: boolean;
  /** Numeric tokens found in the text that are not backed by a fact. */
  offending: string[];
  /** Every numeric token the guard checked. */
  found: string[];
}

/** Candidate numeric tokens in free text: "$2.61", "27.99%", "1,117", "200". */
const NUMBER_TOKEN = /(?:\$\s?)?-?\d+(?:,\d{3})*(?:\.\d+)?%?/g;

function normalise(token: string): number | null {
  const cleaned = token.replace(/[$,%\s]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Values that may legitimately appear in an explanation given the facts:
 * each fact, its absolute value, its rounding to whole units, and a
 * percentage form for fractions (0.2799 -> 27.99).
 */
export function allowedValues(facts: Facts): Set<number> {
  const allowed = new Set<number>();
  for (const v of Object.values(facts)) {
    if (!Number.isFinite(v)) continue;
    const abs = Math.abs(v);
    allowed.add(round2(abs));
    allowed.add(Math.round(abs));
    if (abs > 0 && abs < 1) allowed.add(round2(abs * 100)); // fraction as percent
  }
  return allowed;
}

export function guardNumbers(text: string, facts: Facts): GuardResult {
  const allowed = allowedValues(facts);
  const found: string[] = [];
  const offending: string[] = [];
  for (const m of text.matchAll(NUMBER_TOKEN)) {
    const token = m[0].trim();
    const value = normalise(token);
    if (value === null) continue;
    const index = m.index ?? 0;
    // Identifiers, not quantities: card masks and account numbers ("••4412", "#1234", "x8821").
    const prevChar = index > 0 ? text[index - 1] : "";
    if (/[•*#x]/i.test(prevChar)) continue;
    // Dates: a number right after a month name ("Nov 6", "Nov 1–5", "June 2027") or a 4-digit year.
    const beforeText = text.slice(0, index).replace(/\d{1,2}\s?[–-]\s?$/, ""); // "Nov 1–5": look past the range start
    const wordBefore = beforeText.match(/([A-Za-z]+)\.?\s+$/)?.[1] ?? "";
    const isDateDay = MONTH_WORD.test(wordBefore) && !token.startsWith("$") && !token.endsWith("%");
    const isYear = /^\d{4}$/.test(token) && value >= 1990 && value <= 2100;
    if (isDateDay || isYear) continue;
    found.push(token);
    if (!allowed.has(round2(Math.abs(value)))) offending.push(token);
  }
  return { ok: offending.length === 0, offending, found };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
