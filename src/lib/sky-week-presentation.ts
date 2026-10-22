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
  "saturn-opposition-2026-10-04": "high",
  "sun-into-scorpio-2026-10-23": "shift",
  "sun-venus-conjunction-2026-10-24": "mid",
  "mercury-retrograde-scorpio-2026-10-24": "shift"
};

export function getSkyCardTone(card: Pick<SkyImpactCard, "id" | "grade">): SkyTone {
  return TONE_BY_CARD_ID[card.id] ?? (card.grade === "A" ? "high" : "mid");
}

const WEEK_THEME_BY_RANGE: Record<string, SkyTri> = {
  "2026-10-23/2026-10-24": {
    "zh-Hant": "10/23 太陽進入熱帶黃道天蠍；10/24 太陽合逆行金星、水星於天蠍開始視逆行。以下分開呈現可核對的天文座標與非因果的占星象徵，並按悉尼 AEDT 日期列示。",
    "zh-Hans": "10/23 太阳进入热带黄道天蝎；10/24 太阳合逆行金星、水星于天蝎开始视逆行。以下分开呈现可核对的天文坐标与非因果的占星象征，并按悉尼 AEDT 日期列示。",
    en: "23 Oct: the Sun enters tropical Scorpio. 24 Oct: Sun meets retrograde Venus and Mercury stations retrograde. Verifiable sky coordinates are kept separate from non-causal astrological symbolism; all dates use Sydney AEDT."
  },
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
