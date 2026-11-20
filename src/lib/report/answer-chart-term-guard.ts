/**
 * Chart-notation leak guard for AI-rewritten customer text.
 *
 * Deterministic calculation and AI explanation are separate layers: the engine owns the chart and
 * the model may only restate what it was handed. The existing guards cover jargon *names*
 * (日主/月令/用神…), fabricated digits and relative years — but not the chart's own notation.
 * A rewrite could still emit "你的命局是壬辰年" or "你是壬水的底子": no banned term, no new digit,
 * no Simplified character, so every content check passed and a stem/branch claim the engine never
 * made reached the customer.
 *
 * This mirrors `hasUnsupportedNumbers`: restating notation that was supplied is allowed,
 * introducing notation that was not is rejected.
 *
 * Matching is deliberately narrow, because the individual characters are ordinary words in
 * Traditional Chinese (子, 午, 未, 申, 辰, 甲…). Only notation shapes count:
 *
 *   1. a stem immediately followed by a branch — the 60 pillars (壬辰, 辛酉, 甲子…);
 *   2. a stem bound to its own element (壬水, 甲木, 庚金…);
 *   3. two branches bound by a relation verb (辰酉合, 子午沖…).
 *
 * None of these sequences occur in ordinary prose, so the false-positive cost is effectively zero
 * while the chart stays the engine's to state.
 */

const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";

const PATTERNS = [
  /** The 60 pillars: a stem directly followed by a branch. */
  new RegExp(`[${STEMS}][${BRANCHES}]`, "g"),
  /** A stem named together with its own element. */
  /甲木|乙木|丙火|丁火|戊土|己土|庚金|辛金|壬水|癸水/g,
  /** Two branches joined by a relation verb: 辰酉合, 子午沖, 寅巳刑… */
  new RegExp(`[${BRANCHES}][${BRANCHES}][合沖冲刑害破會会]`, "g"),
];

function notationIn(text: string): string[] {
  const value = String(text ?? "");
  return PATTERNS.flatMap((pattern) => value.match(pattern) ?? []);
}

/**
 * True when customer-facing text states the chart in stem/branch notation that the deterministic
 * sources never supplied. Only the engine may assert the chart; a rewrite that reaches for this
 * notation on its own is rejected and the deterministic answer is kept.
 */
export function hasUnsupportedChartTerms(output: string, sources: string[]): boolean {
  const found = notationIn(output);
  if (!found.length) return false;
  const allowed = new Set(sources.flatMap(notationIn));
  return found.some((term) => !allowed.has(term));
}
