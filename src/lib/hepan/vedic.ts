import type { Gender } from "@/lib/bazi/types";
import type { HepanReading, HepanSystemSection } from "./pair-model";

/**
 * Vedic astrology reference section (approved by Shi 2026-11-24, 全批）.
 *
 * There is NO Guna Milan engine on the site: the vedic module defines
 * only single-person D1/D12/Dasha, and Shi has confirmed she has no
 * pair data anywhere. This section is computed from the two people's
 * sidereal Moon sign + birth nakshatra (from the site's own Astronomy
 * Engine longitudes minus the Lahiri ayanamsa — see
 * src/lib/hepan/ephemeris.ts) with the standard North Indian
 * Ashtakoot (Guna Milan) 36-point method. Thresholds from the
 * approved draft: 18 可接受、24 好、28 很好.
 *
 * Tables (standard published Ashtakoota; the scoring rules are the
 * textbook ones, not Shi's — the page says so, and the whole table
 * set is marked 待 Shi 確認 alongside the numerology matrix):
 *  - Varna (1): Moon sign → Brahmin (water) 4 > Kshatriya (fire) 3 >
 *    Vaishya (earth) 2 > Shudra (air) 1. Point when the groom's rank
 *    is equal to or higher than the bride's.
 *  - Vashya (2): Moon sign (+ degree for Sagittarius/Capricorn,
 *    split at 15°) → five groups, bride row × groom column grid.
 *    One asymmetric cell (Manava bride + Keeta groom 1, reverse 0).
 *  - Tara (3): count nakshatras both ways, mod 9; remainders 3/5/7
 *    (Vipat/Pratyak/Vadha) bad. Both good 3, one good 1.5, none 0.
 *  - Yoni (4): same animal 4, great-enemy pair 0, otherwise 2
 *    (neutral). SIMPLIFICATION, stated on the page: the classical
 *    scale also has friendly 3 / unfriendly 1, which need the full
 *    14×14 animal-affinity matrix; this first version does not apply
 *    those two grades.
 *  - Graha Maitri (5): the two Moon-sign lords in the standard 7×7
 *    friendship table (half points included; Saturn row completed by
 *    symmetry: Saturn–Venus 5 mutual friends, Saturn–Saturn 5).
 *  - Gana (6): same gana 6, Deva–Manushya 4, any Rakshasa against a
 *    non-Rakshasa 0 (Pramitakshara 6/4/0).
 *  - Bhakoot (7): Moon-sign distance 2/12, 5/9 or 6/8 → 0, else 7.
 *  - Nadi (8): different nadi 8, same nadi 0 (Nadi dosha — flagged,
 *    never written as a verdict).
 *
 * GENDER DIRECTION — Varna and Vashya are directional in the classical
 * method (groom vs bride). When the two genders give a groom and a
 * bride (one male, one female), the classical direction is used. When
 * they do not (same gender or unspecified), Varna scores 1 only on
 * equal ranks, and the one asymmetric Vashya cell takes the lower
 * value (0); the section says so. Tara, Yoni, Graha Maitri, Gana,
 * Bhakoot and Nadi are direction-independent.
 *
 * NO BIRTH TIME — the vedic module's own rule is followed: without a
 * time, D1/D12/Dasha are refused and only whole-day-stable planet
 * signs are kept. So without a time there is no nakshatra: only the
 * four sign-based kutas are computed (Varna 1 + Vashya 2 + Graha
 * Maitri 5 + Bhakoot 7 = 15 max), the total is shown out of 15, and
 * the whole section is marked 低置信. The 18/24/28 thresholds apply
 * only to a full /36 total. If even the Moon sign is not stable
 * across the day, the section is unavailable.
 *
 * The /36 total is this system's own sub-score (with its own
 * thresholds); it is NOT merged into the headline index and no
 * cross-system reference total is computed.
 */

const SIGN_NAMES = [
  "白羊", "金牛", "雙子", "巨蟹", "獅子", "處女",
  "天秤", "天蠍", "射手", "摩羯", "水瓶", "雙魚",
] as const;

/** Nakshatra display names: the site's English order (Ashwini first).
 * No Chinese name set is used here on purpose — the Chinese 二十八宿
 * (28 mansions) is a different system from the Indian 27 nakshatras,
 * so transliterating them would mislabel the stars. */
const NAKSHATRA_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
  "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha",
  "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha",
  "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
] as const;

export type VedicMoon = {
  /** Sidereal Moon sign, 0 = Aries … 11 = Pisces. */
  sign: number;
  /** Moon degree within its sign, 0–30 (needed for the Vashya split). */
  degreeInSign: number;
  /** Birth nakshatra index 0–26 (Ashwini first); null when no birth time. */
  nakshatra: number | null;
  /** True when the Moon sign is stable across the whole day. */
  signReliable: boolean;
};

export type VedicPairInput =
  | {
      available: true;
      a: VedicMoon;
      b: VedicMoon;
      genderA: Gender;
      genderB: Gender;
      /** True when either birth time is unknown: whole section is low-confidence. */
      lowConfidence: boolean;
    }
  | { available: false; reason: string };

type Lord = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";

/** Moon-sign lords, sign index 0 = Aries. */
const SIGN_LORDS: Lord[] = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];

/** Varna rank by Moon sign: Brahmin 4, Kshatriya 3, Vaishya 2, Shudra 1. */
const VARNA_RANK = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4];
const VARNA_NAMES = ["", "首陀羅", "吠舍", "剎帝利", "婆羅門"];
const LORD_NAMES: Record<Lord, string> = {
  Sun: "太陽",
  Moon: "月亮",
  Mars: "火星",
  Mercury: "水星",
  Jupiter: "木星",
  Venus: "金星",
  Saturn: "土星",
};

/** Vashya groups: 0 Chatushpada, 1 Manava, 2 Jalachara, 3 Vanachara, 4 Keeta. */
function vashyaGroup(sign: number, degreeInSign: number): number {
  if (sign === 8) return degreeInSign < 15 ? 1 : 0; // Sagittarius: 0–15° Manava, 15–30° Chatushpada
  if (sign === 9) return degreeInSign < 15 ? 0 : 2; // Capricorn: 0–15° Chatushpada, 15–30° Jalachara
  if (sign === 0 || sign === 1) return 0; // Aries, Taurus
  if (sign === 2 || sign === 5 || sign === 6 || sign === 10) return 1; // Gemini, Virgo, Libra, Aquarius
  if (sign === 3 || sign === 11) return 2; // Cancer, Pisces
  if (sign === 4) return 3; // Leo
  return 4; // Scorpio
}

const VASHYA_NAMES = ["四足", "人形", "水生", "野獸", "蟲類"];

/** Bride row × groom column (AstroReads grid; one asymmetric cell: Manava×Keeta 1, Keeta×Manava 0). */
const VASHYA_GRID: number[][] = [
  [2, 1, 1, 0, 1],
  [1, 2, 0.5, 0, 1],
  [1, 0.5, 2, 1, 1],
  [0, 0, 1, 2, 0],
  [1, 0, 1, 0, 2],
];

const LORD_INDEX: Record<Lord, number> = {
  Sun: 0,
  Moon: 1,
  Mars: 2,
  Mercury: 3,
  Jupiter: 4,
  Venus: 5,
  Saturn: 6,
};

/** Standard 7×7 Graha Maitri table (rows/cols: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn). */
const GRAHA_MAITRI: number[][] = [
  [5, 5, 5, 4, 5, 0, 0],
  [5, 5, 4, 1, 4, 0.5, 0.5],
  [5, 4, 5, 0.5, 5, 3, 0.5],
  [4, 1, 0.5, 5, 0.5, 5, 4],
  [5, 4, 5, 0.5, 5, 0.5, 3],
  [0, 0.5, 3, 5, 0.5, 5, 5],
  [0, 0.5, 0.5, 4, 3, 5, 5],
];

/** Yoni animal per nakshatra (index 0 = Ashwini). */
const YONI_ANIMAL = [
  "horse", "elephant", "goat", "serpent", "serpent", "dog",
  "cat", "goat", "cat", "rat", "rat", "cow",
  "buffalo", "tiger", "buffalo", "tiger", "deer", "deer",
  "dog", "monkey", "mongoose", "monkey", "lion", "horse",
  "lion", "cow", "elephant",
] as const;

const YONI_NAMES: Record<string, string> = {
  horse: "馬",
  elephant: "象",
  goat: "羊",
  serpent: "蛇",
  dog: "犬",
  cat: "貓",
  rat: "鼠",
  cow: "牛",
  buffalo: "水牛",
  tiger: "虎",
  deer: "鹿",
  monkey: "猴",
  mongoose: "獴",
  lion: "獅",
};

/** The seven great-enemy yoni pairs (order-independent). */
const YONI_ENEMIES: [string, string][] = [
  ["horse", "buffalo"],
  ["lion", "elephant"],
  ["goat", "monkey"],
  ["mongoose", "serpent"],
  ["deer", "dog"],
  ["cat", "rat"],
  ["tiger", "cow"],
];

/** Gana per nakshatra: 0 Deva, 1 Manushya, 2 Rakshasa (9 each).
 * Deva: Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Swati, Anuradha,
 * Shravana, Revati. Manushya: Bharani, Rohini, Ardra, Purva Phalguni,
 * Uttara Phalguni, Purva Ashadha, Uttara Ashadha, Purva Bhadrapada,
 * Uttara Bhadrapada. Rakshasa: Krittika, Ashlesha, Magha, Chitra,
 * Vishakha, Jyeshtha, Mula, Dhanishta, Shatabhisha. */
export const GANA = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0,
  2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0,
];
const GANA_NAMES = ["天神", "人", "羅剎"];

/** Nadi per nakshatra: 0 Adi, 1 Madhya, 2 Antya (9 each).
 * Adi: Ashwini, Ardra, Punarvasu, Uttara Phalguni, Hasta, Jyeshtha,
 * Mula, Shatabhisha, Purva Bhadrapada. Madhya: Bharani, Mrigashira,
 * Pushya, Purva Phalguni, Chitra, Anuradha, Purva Ashadha, Dhanishta,
 * Uttara Bhadrapada. Antya: Krittika, Rohini, Ashlesha, Magha, Swati,
 * Vishakha, Uttara Ashadha, Shravana, Revati. */
export const NADI = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0,
  1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2,
];
const NADI_NAMES = ["初脈", "中脈", "末脈"];

/** Groom = the male when exactly one of the two is male; otherwise null (roles undetermined). */
function groomIsA(genderA: Gender, genderB: Gender): boolean | null {
  if (genderA === "male" && genderB === "female") return true;
  if (genderA === "female" && genderB === "male") return false;
  return null;
}

function scoreVarna(a: VedicMoon, b: VedicMoon, groomA: boolean | null): { score: number; note: string } {
  const rankA = VARNA_RANK[a.sign];
  const rankB = VARNA_RANK[b.sign];
  if (groomA === null) {
    return {
      score: rankA === rankB ? 1 : 0,
      note:
        rankA === rankB
          ? `兩人月亮星座同屬${VARNA_NAMES[rankA]}階（${SIGN_NAMES[a.sign]}、${SIGN_NAMES[b.sign]}），記 1 分。未指定男女角色時，異階不記分（傳統以男方不低於女方為吉）。`
          : `甲${VARNA_NAMES[rankA]}階（${SIGN_NAMES[a.sign]}）、乙${VARNA_NAMES[rankB]}階（${SIGN_NAMES[b.sign]}），階不同。未指定男女角色，無法按傳統男方／女方方向判定，記 0 分、僅供參考。`,
    };
  }
  const groomRank = groomA ? rankA : rankB;
  const brideRank = groomA ? rankB : rankA;
  const ok = groomRank >= brideRank;
  return {
    score: ok ? 1 : 0,
    note: ok
      ? `男方${VARNA_NAMES[groomRank]}階不低於女方${VARNA_NAMES[brideRank]}階，記 1 分。`
      : `男方${VARNA_NAMES[groomRank]}階低於女方${VARNA_NAMES[brideRank]}階，記 0 分。`,
  };
}

function scoreVashya(a: VedicMoon, b: VedicMoon, groomA: boolean | null): { score: number; note: string } {
  const groupA = vashyaGroup(a.sign, a.degreeInSign);
  const groupB = vashyaGroup(b.sign, b.degreeInSign);
  // Bride row × groom column. Without roles, the grid is symmetric
  // except Manava–Keeta, where the lower value (0) is taken.
  let score: number;
  let note: string;
  if (groomA === null) {
    const ab = VASHYA_GRID[groupA][groupB];
    const ba = VASHYA_GRID[groupB][groupA];
    score = Math.min(ab, ba);
    note = `甲${VASHYA_NAMES[groupA]}組、乙${VASHYA_NAMES[groupB]}組。未指定男女角色，取雙向較低值 ${score} 分（Manava–Keeta 一格雙向不同：1／0）。`;
  } else {
    const brideGroup = groomA ? groupB : groupA;
    const groomGroup = groomA ? groupA : groupB;
    score = VASHYA_GRID[brideGroup][groomGroup];
    note = `女方${VASHYA_NAMES[brideGroup]}組、男方${VASHYA_NAMES[groomGroup]}組，查表 ${score} 分。`;
  }
  return { score, note };
}

function taraRemainder(from: number, to: number): number {
  const count = (((to - from) % 27) + 27) % 27 + 1;
  const r = count % 9;
  return r === 0 ? 9 : r;
}

function scoreTara(nakA: number, nakB: number): { score: number; note: string } {
  const bad = (r: number) => r === 3 || r === 5 || r === 7;
  const r1 = taraRemainder(nakA, nakB);
  const r2 = taraRemainder(nakB, nakA);
  const good1 = !bad(r1);
  const good2 = !bad(r2);
  const score = (good1 ? 1.5 : 0) + (good2 ? 1.5 : 0);
  return {
    score,
    note: `雙向計數：甲→乙餘 ${r1}（${good1 ? "吉" : "凶：Vipat／Pratyak／Vadha"}）、乙→甲餘 ${r2}（${good2 ? "吉" : "凶"}）；每向吉得 1.5 分，共 ${score} 分。`,
  };
}

function scoreYoni(nakA: number, nakB: number): { score: number; note: string } {
  const animalA = YONI_ANIMAL[nakA];
  const animalB = YONI_ANIMAL[nakB];
  if (animalA === animalB) {
    return { score: 4, note: `兩人同為${YONI_NAMES[animalA]}，記 4 分。` };
  }
  const enemy = YONI_ENEMIES.some(
    ([x, y]) =>
      (x === animalA && y === animalB) || (x === animalB && y === animalA),
  );
  if (enemy) {
    return {
      score: 0,
      note: `${YONI_NAMES[animalA]}與${YONI_NAMES[animalB]}為傳統七對死敵之一，記 0 分。只標傳統分類，不判關係好壞。`,
    };
  }
  return {
    score: 2,
    note: `${YONI_NAMES[animalA]}與${YONI_NAMES[animalB]}：不同種、非死敵，記中性 2 分。本版不分親和 3／疏遠 1 兩檔（需完整 14×14 動物親和表，待 Shi 確認是否補表）。`,
  };
}

function scoreGrahaMaitri(a: VedicMoon, b: VedicMoon): { score: number; note: string } {
  const lordA = SIGN_LORDS[a.sign];
  const lordB = SIGN_LORDS[b.sign];
  const score = GRAHA_MAITRI[LORD_INDEX[lordA]][LORD_INDEX[lordB]];
  return {
    score,
    note: `甲月亮星座${SIGN_NAMES[a.sign]}之主${LORD_NAMES[lordA]}、乙月亮星座${SIGN_NAMES[b.sign]}之主${LORD_NAMES[lordB]}，查行星親和表 ${score} 分。`,
  };
}

function scoreGana(nakA: number, nakB: number): { score: number; note: string } {
  const ganaA = GANA[nakA];
  const ganaB = GANA[nakB];
  if (ganaA === ganaB) {
    return { score: 6, note: `兩人同為${GANA_NAMES[ganaA]}性，記 6 分。` };
  }
  if ((ganaA === 0 && ganaB === 1) || (ganaA === 1 && ganaB === 0)) {
    return { score: 4, note: `天神性與人性相配，記 4 分（Pramitakshara 6／4／0）。` };
  }
  return {
    score: 0,
    note: `${GANA_NAMES[ganaA]}性與${GANA_NAMES[ganaB]}性相配，羅剎性與非羅剎性相配記 0 分。只標傳統分類，不判人品。`,
  };
}

function scoreBhakoot(a: VedicMoon, b: VedicMoon): { score: number; note: string } {
  const distance = (((b.sign - a.sign) % 12) + 12) % 12 + 1;
  const bad = distance === 2 || distance === 5 || distance === 6 || distance === 8 || distance === 9 || distance === 12;
  return {
    score: bad ? 0 : 7,
    note: bad
      ? `月亮星座相距 ${distance} 宮（2／12、5／9 或 6／8 位），傳統稱 Bhakoot dosha，記 0 分。標注而已，不寫死、不判凶。`
      : `月亮星座相距 ${distance} 宮，不在 2／12、5／9、6／8 之列，記 7 分。`,
  };
}

function scoreNadi(nakA: number, nakB: number): { score: number; note: string } {
  const nadiA = NADI[nakA];
  const nadiB = NADI[nakB];
  if (nadiA === nadiB) {
    return {
      score: 0,
      note: `兩人同為${NADI_NAMES[nadiA]}，傳統稱 Nadi dosha，記 0 分。標注而已，不寫死、不判凶、不作健康診斷。`,
    };
  }
  return { score: 8, note: `甲${NADI_NAMES[nadiA]}、乙${NADI_NAMES[nadiB]}，不同脈，記 8 分。` };
}

function kutaReading(
  id: string,
  title: string,
  score: number,
  max: number,
  evidence: string,
  note: string,
): HepanReading {
  return { id: `vedic-${id}`, title, score, max, evidence: [evidence], note };
}

export function buildVedicPairSection(input: VedicPairInput): HepanSystemSection {
  const title = "印度占星";
  if (!input.available) {
    return {
      id: "vedic",
      title,
      status: "reference",
      score: null,
      weight: null,
      detail: `印度占星分項參考暫時無法算出：${input.reason}。本欄不計分、不入主指數。`,
      lines: [
        "方法：Guna Milan 北印 36 分制，八項 Kuta（Varna 1、Vashya 2、Tara 3、Yoni 4、Graha Maitri 5、Gana 6、Bhakoot 7、Nadi 8；18 可接受、24 好、28 很好）。時辰不準、月亮星座可能錯時，整項標低置信。",
      ],
    };
  }
  const { a, b, genderA, genderB, lowConfidence } = input;
  const groomA = groomIsA(genderA, genderB);
  const readings: HepanReading[] = [];
  const lines: string[] = [];
  const hasNakshatra = a.nakshatra !== null && b.nakshatra !== null;
  const nakName = (n: number | null) => (n === null ? "未定" : NAKSHATRA_EN[n]);

  lines.push(
    `甲月亮星座${SIGN_NAMES[a.sign]}（恆星黃道 ${a.degreeInSign.toFixed(1)}°）、宿 ${nakName(a.nakshatra)}；乙月亮星座${SIGN_NAMES[b.sign]}（${b.degreeInSign.toFixed(1)}°）、宿 ${nakName(b.nakshatra)}。`,
  );

  const varna = scoreVarna(a, b, groomA);
  readings.push(
    kutaReading("varna", "Varna 階", varna.score, 1, `甲${SIGN_NAMES[a.sign]}、乙${SIGN_NAMES[b.sign]}。`, varna.note),
  );
  const vashya = scoreVashya(a, b, groomA);
  readings.push(
    kutaReading("vashya", "Vashya 親和", vashya.score, 2, `甲${SIGN_NAMES[a.sign]} ${a.degreeInSign.toFixed(1)}°、乙${SIGN_NAMES[b.sign]} ${b.degreeInSign.toFixed(1)}°。`, vashya.note),
  );
  const maitri = scoreGrahaMaitri(a, b);
  readings.push(
    kutaReading("graha-maitri", "Graha Maitri 星主親和", maitri.score, 5, `甲月主${LORD_NAMES[SIGN_LORDS[a.sign]]}、乙月主${LORD_NAMES[SIGN_LORDS[b.sign]]}。`, maitri.note),
  );
  const bhakoot = scoreBhakoot(a, b);
  readings.push(
    kutaReading("bhakoot", "Bhakoot 宮距", bhakoot.score, 7, `甲月亮星座${SIGN_NAMES[a.sign]}、乙月亮星座${SIGN_NAMES[b.sign]}。`, bhakoot.note),
  );

  let denominator = 15;
  if (hasNakshatra) {
    denominator = 36;
    const tara = scoreTara(a.nakshatra as number, b.nakshatra as number);
    readings.push(
      kutaReading("tara", "Tara 星距", tara.score, 3, `甲宿 ${nakName(a.nakshatra)}、乙宿 ${nakName(b.nakshatra)}。`, tara.note),
    );
    const yoni = scoreYoni(a.nakshatra as number, b.nakshatra as number);
    readings.push(
      kutaReading("yoni", "Yoni 動物", yoni.score, 4, `甲宿 ${nakName(a.nakshatra)}（${YONI_NAMES[YONI_ANIMAL[a.nakshatra as number]]}）、乙宿 ${nakName(b.nakshatra)}（${YONI_NAMES[YONI_ANIMAL[b.nakshatra as number]]}）。`, yoni.note),
    );
    const gana = scoreGana(a.nakshatra as number, b.nakshatra as number);
    readings.push(
      kutaReading("gana", "Gana 性情", gana.score, 6, `甲宿 ${nakName(a.nakshatra)}、乙宿 ${nakName(b.nakshatra)}。`, gana.note),
    );
    const nadi = scoreNadi(a.nakshatra as number, b.nakshatra as number);
    readings.push(
      kutaReading("nadi", "Nadi 脈", nadi.score, 8, `甲宿 ${nakName(a.nakshatra)}、乙宿 ${nakName(b.nakshatra)}。`, nadi.note),
    );
  } else {
    lines.push(
      "其中一人時辰未知：本站吠陀模組不算納沙特拉（無時辰時 D1／D12／Dasha 全拒算），只算月亮星座四項（Varna、Vashya、Graha Maitri、Bhakoot，滿分 15），不套用 18／24／28 門檻（只適用於完整 36 分總分）。",
    );
  }

  const total = readings.reduce((sum, r) => sum + r.score, 0);
  const band =
    denominator === 36
      ? total >= 28
        ? "很好（≥28）"
        : total >= 24
          ? "好（24–27.5）"
          : total >= 18
            ? "可接受（18–23.5）"
            : "未達 18 分門檻"
      : "部分計分（滿分 15），不套用 18／24／28 門檻";
  lines.push(
    `Guna Milan 合計 ${total}／${denominator}：${band}。此為印度占星本門的分項合計，只給分項、不入主指數、不合成跨系統總分。${lowConfidence ? "整項低置信：時辰不準，月亮星座可能錯時，納沙特拉以時辰為準。" : ""}`,
  );
  lines.push(
    "計分表為北印傳統計分表（待 Shi 確認）；Nadi dosha 與 Bhakoot dosha 只標注、不寫死、不判凶、不作健康診斷。分數為合盤啟發式，僅供參考。",
  );
  return {
    id: "vedic",
    title,
    status: "reference",
    score: total,
    scoreDenominator: denominator,
    weight: null,
    detail: `印度占星分項參考（Guna Milan 北印 ${denominator} 分制）：合計 ${total}／${denominator}（${band}）。只給分項，不入主指數。${lowConfidence ? "整項低置信。" : ""}`,
    readings,
    lines,
  };
}
