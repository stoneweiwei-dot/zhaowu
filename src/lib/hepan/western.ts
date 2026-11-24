import type { HepanReading, HepanSystemSection } from "./pair-model";

/**
 * Western astrology reference section (approved by Shi 2026-11-24, 全批）.
 *
 * There is NO synastry engine on the site: the western module defines
 * only single-person full-chart statistics and aspects
 * (calculateMajorAspects), and Shi has confirmed she has no pair data
 * anywhere. This section is computed from the two people's tropical
 * planet longitudes (from the site's own Astronomy Engine vendor
 * script, the same source the western depth page uses — see
 * src/lib/hepan/ephemeris.ts) with the synastry method Shi approved
 * in 《合盤方法起草稿-待審.md》: five cross-chart items, no total.
 *
 * ORBS — the approved draft orbs, NOT the single-chart engine's:
 * 合相 ±8°、三分相 ±8°、六分相 ±6°、刑相 ±6°、沖相 ±8°.
 * The site's calculateMajorAspects uses different orbs for two of
 * them (sextile 4°, trine 6°); hepan deliberately uses the draft orbs
 * Shi approved, and says so here and on the page.
 *
 * TIERS — a compatibility heuristic （合盤啟發式）, 僅供參考, never a
 * fate judgement: harmonious aspect （合相／三分相／六分相） 85, no
 * aspect within orb 65, hard aspect （刑相／沖相） 45. Hard does not
 * mean bad: a square/opposition is marked 磨合點 (friction to work
 * with), never 凶. No total is computed across the five items and
 * nothing is merged into the headline index.
 *
 * NO BIRTH TIME — the western module's own rule is followed: the Moon
 * moves ~13° a day, so without a known birth time the Moon's sign is
 * only trusted when it is stable across the whole day (00:00–23:59
 * sampling, same as western-depth-section.tsx), and Moon aspects are
 * not judged when it is not (analyzeWesternChart excludes the Moon
 * from aspects when provenance is "unknown"). Houses and angles are
 * never used here: the approved decision is planets-by-sign only,
 * 宮位標「不可用」.
 */

const SIGN_NAMES = [
  "白羊", "金牛", "雙子", "巨蟹", "獅子", "處女",
  "天秤", "天蠍", "射手", "摩羯", "水瓶", "雙魚",
] as const;

export type WesternPlanetKey = "Sun" | "Moon" | "Venus" | "Mars" | "Saturn";

export type WesternPlanetPosition = {
  /** Tropical ecliptic longitude, 0–360. */
  longitude: number;
  /** True when the sign is the same across the sampling window. */
  signReliable: boolean;
};

export type WesternPairPositions = Record<WesternPlanetKey, WesternPlanetPosition>;

export type WesternPairInput =
  | {
      available: true;
      a: WesternPairPositions;
      b: WesternPairPositions;
      /** False when either person's Moon sign is not stable across the day. */
      moonReliable: boolean;
    }
  | { available: false; reason: string };

type AspectTier = "harmonious" | "hard";

type SynastryAspect = {
  type: string;
  angle: number;
  orb: number;
  tier: AspectTier;
};

/** Approved draft orbs (see header): conjunction 8, sextile 6, square 6, trine 8, opposition 8. */
const ASPECTS: { type: string; angle: number; orb: number; tier: AspectTier }[] = [
  { type: "合相", angle: 0, orb: 8, tier: "harmonious" },
  { type: "六分相", angle: 60, orb: 6, tier: "harmonious" },
  { type: "刑相", angle: 90, orb: 6, tier: "hard" },
  { type: "三分相", angle: 120, orb: 8, tier: "harmonious" },
  { type: "沖相", angle: 180, orb: 8, tier: "hard" },
];

const TIER_SCORES: Record<AspectTier, number> = { harmonious: 85, hard: 45 };
const NO_ASPECT_SCORE = 65;

function norm360(n: number): number {
  return ((n % 360) + 360) % 360;
}

function signOf(longitude: number): number {
  return Math.floor(norm360(longitude) / 30);
}

function degreeInSign(longitude: number): number {
  return norm360(longitude) % 30;
}

export function formatWesternPosition(longitude: number): string {
  const lon = norm360(longitude);
  return `${SIGN_NAMES[signOf(lon)]}${degreeInSign(lon).toFixed(1)}°`;
}

/**
 * Closest major aspect between two longitudes under the approved draft
 * orbs, or null when no major aspect falls within orb. When two aspects
 * both fall within orb (only possible near a boundary), the tighter orb
 * wins.
 */
export function aspectBetween(lonA: number, lonB: number): SynastryAspect | null {
  const sep = Math.abs((((lonA - lonB + 540) % 360) + 360) % 360 - 180);
  let best: SynastryAspect | null = null;
  for (const asp of ASPECTS) {
    const d = Math.abs(sep - asp.angle);
    if (d <= asp.orb && (!best || d < best.orb)) {
      best = { type: asp.type, angle: asp.angle, orb: d, tier: asp.tier };
    }
  }
  return best;
}

function tierScore(aspect: SynastryAspect | null): { score: number; label: string } {
  if (!aspect) return { score: NO_ASPECT_SCORE, label: "無相位" };
  return {
    score: TIER_SCORES[aspect.tier],
    label: `${aspect.type}（容許度 ±${ASPECTS.find((a) => a.type === aspect.type)?.orb}°，實際差 ${aspect.orb.toFixed(1)}°）`,
  };
}

type CrossPair = { nameA: string; lonA: number; nameB: string; lonB: number };

function describeCross(pairs: CrossPair[]): { aspect: SynastryAspect | null; evidence: string } {
  let best: { aspect: SynastryAspect } | null = null;
  const parts: string[] = [];
  for (const pair of pairs) {
    const aspect = aspectBetween(pair.lonA, pair.lonB);
    parts.push(
      `${pair.nameA}${formatWesternPosition(pair.lonA)}—${pair.nameB}${formatWesternPosition(pair.lonB)}：${aspect ? `${aspect.type}（差 ${aspect.orb.toFixed(1)}°）` : "無相位"}`,
    );
    if (aspect && (!best || aspect.orb < best.aspect.orb)) best = { aspect };
  }
  return { aspect: best?.aspect ?? null, evidence: parts.join("；") };
}

function readingFor(
  id: string,
  title: string,
  aspect: SynastryAspect | null,
  evidence: string,
  hardNote: string,
): HepanReading {
  const { score, label } = tierScore(aspect);
  return {
    id: `western-${id}`,
    title,
    score,
    evidence: [evidence, `判定：${label}。`],
    note:
      aspect?.tier === "hard"
        ? `${hardNote}刑沖標磨合點，不判凶：相位只論互動張力，不論好壞命定。`
        : "和諧相位只論相處順暢，不論命定；無相位是中性，不是不合。（合盤啟發式，僅供參考。）",
  };
}

export function buildWesternPairSection(input: WesternPairInput): HepanSystemSection {
  const title = "西方占星";
  if (!input.available) {
    return {
      id: "western",
      title,
      status: "reference",
      score: null,
      weight: null,
      detail: `西方占星分項參考暫時無法算出：${input.reason}。本欄不計分、不入主指數。`,
      lines: [
        "方法：synastry 五項（太陽－月亮、金星－火星、金星－金星、月亮－月亮、土星相位），容許度按定案（合相 ±8°、三分相 ±8°、六分相 ±6°、刑相 ±6°、沖相 ±8°）。無出生時間只比行星星座，宮位不可用。",
      ],
    };
  }
  const { a, b, moonReliable } = input;
  const readings: HepanReading[] = [];
  const lines: string[] = [];
  const reliable = (p: WesternPairPositions, key: WesternPlanetKey) => p[key].signReliable;

  // 1. 太陽－月亮 (both directions, closest aspect wins).
  if (moonReliable && reliable(a, "Sun") && reliable(b, "Sun")) {
    const { aspect, evidence } = describeCross([
      { nameA: "甲太陽", lonA: a.Sun.longitude, nameB: "乙月亮", lonB: b.Moon.longitude },
      { nameA: "甲月亮", lonA: a.Moon.longitude, nameB: "乙太陽", lonB: b.Sun.longitude },
    ]);
    readings.push(
      readingFor("sun-moon", "太陽－月亮", aspect, evidence, "太陽與月亮的刑沖是感受與需要的拉扯，"),
    );
  } else {
    lines.push("太陽－月亮：月亮星座全天不穩定（時辰未知），本項不作判定。");
  }

  // 2. 金星－火星 (both directions).
  if (reliable(a, "Venus") && reliable(b, "Venus") && reliable(a, "Mars") && reliable(b, "Mars")) {
    const { aspect, evidence } = describeCross([
      { nameA: "甲金星", lonA: a.Venus.longitude, nameB: "乙火星", lonB: b.Mars.longitude },
      { nameA: "甲火星", lonA: a.Mars.longitude, nameB: "乙金星", lonB: b.Venus.longitude },
    ]);
    readings.push(
      readingFor("venus-mars", "金星－火星", aspect, evidence, "金星與火星的刑沖是吸引與行動節奏的拉扯，"),
    );
  } else {
    lines.push("金星－火星：行星星座不穩定，本項不作判定。");
  }

  // 3. 金星－金星.
  if (reliable(a, "Venus") && reliable(b, "Venus")) {
    const { aspect, evidence } = describeCross([
      { nameA: "甲金星", lonA: a.Venus.longitude, nameB: "乙金星", lonB: b.Venus.longitude },
    ]);
    readings.push(
      readingFor("venus-venus", "金星－金星", aspect, evidence, "兩顆金星的刑沖是喜好與價值觀的拉扯，"),
    );
  } else {
    lines.push("金星－金星：金星星座不穩定，本項不作判定。");
  }

  // 4. 月亮－月亮.
  if (moonReliable) {
    const { aspect, evidence } = describeCross([
      { nameA: "甲月亮", lonA: a.Moon.longitude, nameB: "乙月亮", lonB: b.Moon.longitude },
    ]);
    readings.push(
      readingFor("moon-moon", "月亮－月亮", aspect, evidence, "兩顆月亮的刑沖是情緒節奏的拉扯，"),
    );
  } else {
    lines.push("月亮－月亮：月亮星座全天不穩定（時辰未知），本項不作判定。");
  }

  // 5. 土星相位: closest of Saturn to the other person's Sun/Moon.
  const saturnPairs: CrossPair[] = [];
  if (reliable(a, "Saturn") && reliable(b, "Sun")) {
    saturnPairs.push({ nameA: "甲土星", lonA: a.Saturn.longitude, nameB: "乙太陽", lonB: b.Sun.longitude });
  }
  if (reliable(b, "Saturn") && reliable(a, "Sun")) {
    saturnPairs.push({ nameA: "乙土星", lonA: b.Saturn.longitude, nameB: "甲太陽", lonB: a.Sun.longitude });
  }
  if (moonReliable) {
    if (reliable(a, "Saturn")) {
      saturnPairs.push({ nameA: "甲土星", lonA: a.Saturn.longitude, nameB: "乙月亮", lonB: b.Moon.longitude });
    }
    if (reliable(b, "Saturn")) {
      saturnPairs.push({ nameA: "乙土星", lonA: b.Saturn.longitude, nameB: "甲月亮", lonB: a.Moon.longitude });
    }
  }
  if (saturnPairs.length) {
    const { aspect, evidence } = describeCross(saturnPairs);
    readings.push(
      readingFor(
        "saturn",
        "土星相位",
        aspect,
        evidence,
        "土星相位是責任與界線的拉扯，磨合點不是凶兆：",
      ),
    );
  } else {
    lines.push("土星相位：相關行星星座不穩定，本項不作判定。");
  }

  lines.push(
    "只給五項分項，不計總分、不入主指數、不合成參考總分。和諧記順（85 分）、無相位記中性（65 分）、刑沖標磨合（45 分）：三檔皆為合盤啟發式，僅供參考。宮位與上升不用：無出生時間只比行星星座，宮位標「不可用」。",
  );
  if (!moonReliable) {
    lines.push(
      "其中一人時辰未知：月亮每天走約 13°，月亮相位不作判定（本站西方模組同一規則：時辰未知時月亮排除在相位計算之外）。",
    );
  }
  return {
    id: "western",
    title,
    status: "reference",
    score: null,
    weight: null,
    detail:
      "西方占星分項參考（synastry 五項）：只給分項，不計總分、不入主指數。容許度按定案：合相 ±8°、三分相 ±8°、六分相 ±6°、刑相 ±6°、沖相 ±8°。",
    readings,
    lines,
  };
}
