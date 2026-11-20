import type { SkyImpactCard } from "./sky-events";

/**
 * Presentation-only metadata for the weekly sky digest ("星辰形象" layout).
 * Kept apart from the astronomy data in sky-events.ts on purpose: nothing here
 * is a fact about the sky, it only decides how an already-verified card is
 * grouped and framed. Cards without an entry fall back to a grade-based tone,
 * and a week without a theme simply renders no theme block.
 */
export type SkyTone = "high" | "mid" | "shift";
export type SkyTri = { "zh-Hant": string; "zh-Hans": string; en: string };

const TONE_BY_CARD_ID: Record<string, SkyTone> = {
  "sun-trine-uranus-2026-09-28": "shift",
  "mercury-into-scorpio-2026-10-01": "shift",
  "mars-square-mercury-2026-10-02": "mid",
  "mars-trine-neptune-2026-10-02": "shift",
  "mars-opposite-pluto-2026-10-03": "high",
  "saturn-opposition-2026-10-04": "high"
};

export function getSkyCardTone(card: Pick<SkyImpactCard, "id" | "grade">): SkyTone {
  return TONE_BY_CARD_ID[card.id] ?? (card.grade === "A" ? "high" : "mid");
}

const WEEK_THEME_BY_RANGE: Record<string, SkyTri> = {
  "2026-09-28/2026-10-04": {
    "zh-Hant": "9/28 太陽三分天王星起步，10/1 水星進入天蠍，10/2–10/3 火星連續與水星、海王星、冥王星成相，10/4 土星衝日收束。天文事實可由星曆驗證；占星象徵是檢視結構的語言，不是命運因果。",
    "zh-Hans": "9/28 太阳三分天王星起步，10/1 水星进入天蝎，10/2–10/3 火星连续与水星、海王星、冥王星成相，10/4 土星冲日收束。天文事实可由星历验证；占星象征是检视结构的语言，不是命运因果。",
    en: "The week opens on 9/28 with Sun trine Uranus, Mercury enters Scorpio on 10/1, Mars then aspects Mercury, Neptune and Pluto across 10/2–10/3, and Saturn's opposition to the Sun closes it on 10/4. The astronomy is verifiable against an ephemeris; the astrology is a symbolic language for examining structure, not a claim of fate."
  }
};

export function getSkyWeekRange(cards: ReadonlyArray<Pick<SkyImpactCard, "date">>): { start: string; end: string } | null {
  if (cards.length === 0) return null;
  const dates = cards.map((card) => card.date).sort();
  return { start: dates[0], end: dates[dates.length - 1] };
}

export function getSkyWeekTheme(cards: ReadonlyArray<Pick<SkyImpactCard, "date">>): SkyTri | null {
  const range = getSkyWeekRange(cards);
  if (!range) return null;
  return WEEK_THEME_BY_RANGE[`${range.start}/${range.end}`] ?? null;
}

/** Compare calendar dates in the editorial timezone, including readers outside Australia. */
export function isSkyReportArchived(end: string | undefined, now = new Date()): boolean {
  if (!end) return false;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const today = ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
  return today > end;
}
