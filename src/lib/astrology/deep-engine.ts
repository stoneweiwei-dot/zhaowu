/**
 * ZHAOWU Western natal interpretation core — independently traceable.
 * Pure functions only. No Supabase, payment logic, storage, or prediction of events.
 * Counts are descriptive, NOT psychological scores or BaZi ten-god equivalents.
 */
import {
  calculateMajorAspects, decoratePosition, elementOfSign, modalityOfSign,
  type ModernPlanetKey, type HouseSystem,
} from "./engine";

export const TEN_PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
] as const satisfies readonly ModernPlanetKey[];

export const HOUSE_GROUPS = {
  A: [1, 8, 9, 12],
  B: [2, 6, 10],
  C: [3, 4, 5, 7, 11],
} as const;

export type WesternQuality = "high" | "medium" | "low";
export type WesternGroup = keyof typeof HOUSE_GROUPS;
export type WesternLocale = "zh-Hant" | "zh-Hans" | "en";
export type WesternPlacement = {
  key: ModernPlanetKey;
  longitude: number;
  retrograde: boolean;
  house: number | null;
  signReliable: boolean;
};
export type WesternInput = {
  placements: WesternPlacement[];
  houseSystem: HouseSystem;
  timeReliability: WesternQuality;
  provenance: "confirmed-minute" | "entered-minute" | "unknown";
  houseFallback?: string;
};
export type WesternDensity = {
  group: WesternGroup;
  houses: readonly number[];
  count: number;
  perHouse: number;
  classicalCount: number;
  occupants: string[];
};
export type WesternAnalysis = {
  computedBodies: number;
  houseCount: number;
  houseSystem: HouseSystem;
  reliability: { planets: WesternQuality; houses: WesternQuality };
  byHouse: number[];
  topHouses: number[];
  densities: WesternDensity[];
  leadingGroup: WesternGroup | null;
  classicalDistribution: { byHouse: number[]; total: number };
  elements: Record<"fire" | "earth" | "air" | "water", number>;
  modalities: Record<"cardinal" | "fixed" | "mutable", number>;
  signUncertain: string[];
  aspects: ReturnType<typeof calculateMajorAspects>;
  warnings: string[];
};

const CLASSICAL = new Set<string>(TEN_PLANETS.slice(0, 7));
const q = (value: number) => ((value % 360) + 360) % 360;

export function analyzeWesternChart(input: WesternInput): WesternAnalysis {
  const warnings: string[] = [];
  const keys = new Set(input.placements.map(p => p.key));
  if (keys.size !== TEN_PLANETS.length ||
      TEN_PLANETS.some(key => !keys.has(key)) ||
      input.placements.length !== TEN_PLANETS.length ||
      input.placements.some(p => !Number.isFinite(p.longitude) ||
        (p.house !== null && (!Number.isInteger(p.house) || p.house < 1 || p.house > 12)))) {
    throw new Error("Ten distinct, finite tropical planetary longitudes are required.");
  }
  const byHouse = Array<number>(12).fill(0);
  const classicalByHouse = Array<number>(12).fill(0);
  const elements: WesternAnalysis["elements"] = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalities: WesternAnalysis["modalities"] = { cardinal: 0, fixed: 0, mutable: 0 };
  const signUncertain: string[] = [];

  for (const p of input.placements) {
    if (p.house !== null) {
      byHouse[p.house - 1]++;
      if (CLASSICAL.has(p.key)) classicalByHouse[p.house - 1]++;
    }
    if (p.signReliable) {
      const si = Math.floor(q(p.longitude) / 30);
      elements[elementOfSign(si)]++;
      modalities[modalityOfSign(si)]++;
    } else signUncertain.push(p.key);
  }
  const houseCount = byHouse.reduce((a, b) => a + b, 0);
  const max = Math.max(...byHouse);
  const topHouses = houseCount ? byHouse.flatMap((n, i) => n === max ? [i + 1] : []) : [];
  const densities = (Object.keys(HOUSE_GROUPS) as WesternGroup[]).map(group => {
    const houses = HOUSE_GROUPS[group];
    const occupants = input.placements.filter(p => p.house !== null &&
      (houses as readonly number[]).includes(p.house)).map(p => p.key);
    return {
      group, houses, occupants,
      count: occupants.length,
      perHouse: occupants.length / houses.length,
      classicalCount: occupants.filter(k => CLASSICAL.has(k)).length,
    };
  });

  const rankedCount = [...densities].sort((a, b) => b.count - a.count);
  const rankedDensity = [...densities].sort((a, b) => b.perHouse - a.perHouse);
  const complete = houseCount === TEN_PLANETS.length && input.timeReliability !== "low" && !input.houseFallback;
  const countLead = rankedCount[0].count > rankedCount[1].count;
  const densityLead = rankedDensity[0].perHouse > rankedDensity[1].perHouse;
  const leadingGroup = complete && countLead && densityLead &&
    rankedCount[0].group === rankedDensity[0].group ? rankedCount[0].group : null;

  if (input.houseFallback) warnings.push("Selected house system was not calculated: " + input.houseFallback);
  if (!complete) warnings.push("House classification withheld: incomplete or low-reliability placements.");
  else if (!leadingGroup) warnings.push("Raw counts and per-house density disagree or tie; no single life theme is asserted.");
  if (signUncertain.length) warnings.push("Zodiac sign crosses the birth-time range: " + signUncertain.join(", "));
  if (input.provenance === "entered-minute") warnings.push("Minute entered but not verified against a birth record: medium confidence only.");
  if (input.provenance === "unknown") warnings.push("Unknown birth time: planetary positions are date-reference values; angles and houses withheld.");

  const aspectPoints = input.placements
    .filter(p => p.signReliable && (input.provenance !== "unknown" || p.key !== "Moon"))
    .map(p => decoratePosition(p.key, p.longitude, p.retrograde));
  const aspects = calculateMajorAspects(aspectPoints);
  return {
    computedBodies: input.placements.length, houseCount, houseSystem: input.houseSystem,
    reliability: {
      planets: input.provenance === "unknown" ? "low" : input.timeReliability,
      houses: complete ? input.timeReliability : "low",
    },
    byHouse, topHouses, densities, leadingGroup,
    classicalDistribution: { byHouse: classicalByHouse, total: classicalByHouse.reduce((a, b) => a + b, 0) },
    elements, modalities, signUncertain, aspects, warnings,
  };
}

const TEXT: Record<WesternGroup, Record<WesternLocale, {
  label: string; foundation: string; strengths: string; risks: string; action: string;
}>> = {
  A: {
    "zh-Hant": { label: "內在探索與精神鍛鍊", foundation: "1／8／9／12 宮：自我、深層轉化、信念與獨處", strengths: "適合研究、自我整合、知識深耕及長期精神成長。", risks: "過度內省可能減慢行動；不能只憑落宮推斷焦慮或心理狀態。", action: "為研究設定可交付的作品或實踐節點，保留獨處，也保留外部回饋。" },
    "zh-Hans": { label: "内在探索与精神锻炼", foundation: "1／8／9／12 宫：自我、深层转化、信念与独处", strengths: "适合研究、自我整合、知识深耕及长期精神成长。", risks: "过度内省可能减慢行动；不能只凭落宫推断焦虑或心理状态。", action: "为研究设置可交付的作品或实践节点，保留独处，也保留外部反馈。" },
    en: { label: "Inner inquiry and transformation", foundation: "Houses 1/8/9/12: identity, depth, worldview and solitude", strengths: "A useful lens for research, reflection and sustained inner development.", risks: "Reflection can crowd out action; this is not a diagnosis of mental health.", action: "Turn inquiry into tangible work and seek periodic feedback while preserving solitude." },
  },
  B: {
    "zh-Hant": { label: "資源、工作與社會成就", foundation: "2／6／10 宮：資源、安全感、日常工作與公共角色", strengths: "適合發展專業能力、管理節奏、建立長期可持續的收入結構。", risks: "若將價值感完全綁定產出，可能忽略休息與關係；不保證富裕。", action: "建立技能、財務與工作邊界三套可追蹤指標，不以占星取代財務決策。" },
    "zh-Hans": { label: "资源、工作与社会成就", foundation: "2／6／10 宫：资源、安全感、日常工作与公共角色", strengths: "适合发展专业能力、管理节奏、建立长期可持续的收入结构。", risks: "若将价值感完全绑定产出，可能忽略休息与关系；不保证富裕。", action: "建立技能、财务与工作边界三套可追踪指标，不以占星取代财务决策。" },
    en: { label: "Resources, craft and contribution", foundation: "Houses 2/6/10: resources, daily practice and public role", strengths: "A lens for craft, sustainable routines and long-term professional contribution.", risks: "Productivity can overwhelm rest and relationships; financial results are not guaranteed.", action: "Review skills, finances and workload with measurable real-world evidence." },
  },
  C: {
    "zh-Hant": { label: "關係、表達與群體互動", foundation: "3／4／5／7／11 宮：交流、家、創作、伴侶與社群", strengths: "適合透過交流、合作、作品與群體參與累積經驗。", risks: "過度依附他人回饋可能模糊自主決策；不代表必須結婚或合群。", action: "區分滋養自己的合作與消耗自己的關係，練習清楚的表達與界線。" },
    "zh-Hans": { label: "关系、表达与群体互动", foundation: "3／4／5／7／11 宫：交流、家、创作、伴侣与社群", strengths: "适合通过交流、合作、作品与群体参与积累经验。", risks: "过度依附他人反馈可能模糊自主决策；不代表必须结婚或合群。", action: "区分滋养自己的合作与消耗自己的关系，练习清楚的表达与界线。" },
    en: { label: "Connection, expression and community", foundation: "Houses 3/4/5/7/11: learning, home, creativity, partnership, groups", strengths: "A lens for learning through people, collaboration, creative expression and community.", risks: "External feedback may eclipse independent judgment; no relationship outcome is predetermined.", action: "Invest in reciprocal relationships and maintain clear boundaries and independent goals." },
  },
};

export function westernGroupNarrative(group: WesternGroup, locale: WesternLocale) {
  return TEXT[group][locale];
}
