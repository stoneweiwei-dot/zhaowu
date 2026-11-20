import type { AppLocale, Chart, Pillar, Reading, RelationPref } from "./types";

export type KinshipRole = "parents" | "father" | "mother" | "siblings" | "partner" | "children";
export type KinshipEvidenceLevel = "direct" | "supported" | "palace-only" | "unknown";

type PlacementSource = "stem" | "hidden";

export type KinshipPlacement = {
  pillar: Pillar["key"];
  source: PlacementSource;
  tenGod: string;
  stem: string;
  branch: string;
  structuralWeight: number;
};

export type KinshipBranchSignal = {
  anchorPillar: Pillar["key"];
  otherPillar: Pillar["key"];
  anchorBranch: string;
  otherBranch: string;
  relations: string[];
};

export type KinshipAssessment = {
  role: KinshipRole;
  targetGods: string[];
  palaceKeys: Pillar["key"][];
  placements: KinshipPlacement[];
  branchSignals: KinshipBranchSignal[];
  level: KinshipEvidenceLevel;
  usesGenderedTraditionalMapping: boolean;
  summary: string;
};

const ROLE_KEYWORDS: Array<{ role: KinshipRole; keys: string[] }> = [
  { role: "parents", keys: ["父母", "爸媽", "爸妈", "雙親", "双亲"] },
  { role: "father", keys: ["父親", "父亲", "爸爸", "老爸", "父星"] },
  { role: "mother", keys: ["母親", "母亲", "媽媽", "妈妈", "老媽", "老妈", "母星"] },
  { role: "siblings", keys: ["兄弟", "姐妹", "姊妹", "手足", "哥哥", "弟弟", "姐姐", "妹妹"] },
  { role: "children", keys: ["子女", "孩子", "兒子", "儿子", "女兒", "女儿", "生育", "小孩"] },
  { role: "partner", keys: ["配偶", "伴侶", "伴侣", "婚姻", "結婚", "结婚", "丈夫", "妻子", "老公", "老婆", "男友", "女友", "對象", "对象", "戀愛", "恋爱"] },
];

const PALACE_KEYS: Record<KinshipRole, Pillar["key"][]> = {
  parents: ["year", "month"],
  father: ["year", "month"],
  mother: ["year", "month"],
  siblings: ["month", "year"],
  partner: ["day"],
  children: ["time"],
};

const PALACE_WEIGHT: Record<KinshipRole, Record<Pillar["key"], number>> = {
  parents: { year: 3, month: 3, day: 1, time: 0.5 },
  father: { year: 3, month: 3, day: 1, time: 0.5 },
  mother: { year: 3, month: 3, day: 1, time: 0.5 },
  siblings: { year: 2, month: 3, day: 1, time: 1 },
  partner: { year: 0.5, month: 1, day: 4, time: 1.5 },
  children: { year: 0.5, month: 1, day: 1.5, time: 4 },
};

const LIU_HE = new Set(["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"]);
const LIU_CHONG = new Set(["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"]);
const LIU_HAI = new Set(["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"]);
const ZI_XING = new Set(["辰辰", "午午", "酉酉", "亥亥"]);
const XIANG_XING = new Set(["子卯", "寅巳", "巳申", "寅申", "丑未", "未戌", "丑戌"]);

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("");
}

function relationTags(a: string, b: string): string[] {
  if (!a || !b) return [];
  const direct = `${a}${b}`;
  const reverse = `${b}${a}`;
  const tags: string[] = [];
  if (LIU_HE.has(direct) || LIU_HE.has(reverse)) tags.push("合");
  if (LIU_CHONG.has(direct) || LIU_CHONG.has(reverse)) tags.push("沖");
  if (LIU_HAI.has(direct) || LIU_HAI.has(reverse)) tags.push("害");
  if (ZI_XING.has(direct) || XIANG_XING.has(direct) || XIANG_XING.has(reverse)) tags.push("刑");
  return [...new Set(tags)];
}

function pillar(chart: Chart, key: Pillar["key"]): Pillar | null {
  return chart.pillars.find((item) => item.key === key && item.ready !== false && item.ganZhi !== "未定") ?? null;
}

function inferKinshipRole(question: string): KinshipRole | null {
  const q = question.trim();
  for (const item of ROLE_KEYWORDS) {
    if (item.keys.some((key) => q.includes(key))) return item.role;
  }
  return null;
}

function traditionalGods(role: KinshipRole, chart: Chart, relation: RelationPref): { gods: string[]; gendered: boolean } {
  if (role === "parents") return { gods: ["偏財", "正印"], gendered: false };
  if (role === "father") return { gods: ["偏財"], gendered: false };
  if (role === "mother") return { gods: ["正印"], gendered: false };
  if (role === "siblings") return { gods: ["比肩", "劫財"], gendered: false };

  if (role === "partner") {
    if (relation === "same" || relation === "any" || chart.gender === "unspecified") {
      return { gods: [], gendered: false };
    }
    if (chart.gender === "male") return { gods: ["正財", "偏財"], gendered: true };
    if (chart.gender === "female") return { gods: ["正官", "七殺"], gendered: true };
    return { gods: [], gendered: false };
  }

  if (role === "children") {
    if (chart.gender === "male") return { gods: ["正官", "七殺"], gendered: true };
    if (chart.gender === "female") return { gods: ["食神", "傷官"], gendered: true };
    return { gods: [], gendered: false };
  }

  return { gods: [], gendered: false };
}

function collectPlacements(chart: Chart, role: KinshipRole, gods: string[]): KinshipPlacement[] {
  if (!gods.length) return [];
  const target = new Set(gods);
  const out: KinshipPlacement[] = [];

  for (const col of chart.pillars) {
    if (col.ready === false || col.ganZhi === "未定") continue;
    const palaceWeight = PALACE_WEIGHT[role][col.key];
    if (col.key !== "day" && target.has(col.shiShenGan)) {
      out.push({
        pillar: col.key,
        source: "stem",
        tenGod: col.shiShenGan,
        stem: col.gan,
        branch: col.zhi,
        structuralWeight: palaceWeight + 1.5,
      });
    }
    for (const hidden of col.hide) {
      if (!target.has(hidden.shiShen)) continue;
      out.push({
        pillar: col.key,
        source: "hidden",
        tenGod: hidden.shiShen,
        stem: hidden.gan,
        branch: col.zhi,
        structuralWeight: palaceWeight + 1,
      });
    }
  }

  return out.sort((a, b) => b.structuralWeight - a.structuralWeight);
}

function collectBranchSignals(chart: Chart, role: KinshipRole): KinshipBranchSignal[] {
  const anchors = PALACE_KEYS[role].map((key) => pillar(chart, key)).filter(Boolean) as Pillar[];
  const known = chart.pillars.filter((item) => item.ready !== false && item.ganZhi !== "未定");
  const seen = new Set<string>();
  const signals: KinshipBranchSignal[] = [];

  for (const anchor of anchors) {
    for (const other of known) {
      if (other.key === anchor.key) continue;
      const relations = relationTags(anchor.zhi, other.zhi);
      if (!relations.length) continue;
      const key = `${anchor.key}:${other.key}:${pairKey(anchor.zhi, other.zhi)}:${relations.join("")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      signals.push({
        anchorPillar: anchor.key,
        otherPillar: other.key,
        anchorBranch: anchor.zhi,
        otherBranch: other.zhi,
        relations,
      });
    }
  }

  return signals;
}

function evidenceLevel(chart: Chart, role: KinshipRole, placements: KinshipPlacement[]): KinshipEvidenceLevel {
  const anchors = PALACE_KEYS[role];
  const anchorReady = anchors.some((key) => Boolean(pillar(chart, key)));
  const anchorHit = placements.some((item) => anchors.includes(item.pillar));
  if (anchorHit) return "direct";
  if (placements.length) return "supported";
  if (anchorReady) return "palace-only";
  return "unknown";
}

function pick<T>(locale: AppLocale | undefined, hant: T, hans: T, en: T): T {
  if (locale === "en") return en;
  if (locale === "zh-Hans") return hans;
  return hant;
}

const ROLE_LABELS: Record<KinshipRole, { hant: string; hans: string; en: string }> = {
  parents: { hant: "父母", hans: "父母", en: "parents" },
  father: { hant: "父親", hans: "父亲", en: "father" },
  mother: { hant: "母親", hans: "母亲", en: "mother" },
  siblings: { hant: "手足", hans: "手足", en: "siblings" },
  partner: { hant: "伴侶", hans: "伴侣", en: "partner" },
  children: { hant: "子女", hans: "子女", en: "children" },
};

const GOD_LABELS: Record<string, { hant: string; hans: string; en: string }> = {
  正印: { hant: "正印", hans: "正印", en: "Direct Resource" },
  偏財: { hant: "偏財", hans: "偏财", en: "Indirect Wealth" },
  正財: { hant: "正財", hans: "正财", en: "Direct Wealth" },
  比肩: { hant: "比肩", hans: "比肩", en: "Peer" },
  劫財: { hant: "劫財", hans: "劫财", en: "Competing Peer" },
  正官: { hant: "正官", hans: "正官", en: "Direct Officer" },
  七殺: { hant: "七殺", hans: "七杀", en: "Seven Killings" },
  食神: { hant: "食神", hans: "食神", en: "Eating God" },
  傷官: { hant: "傷官", hans: "伤官", en: "Hurting Officer" },
};

const PILLAR_LABELS: Record<Pillar["key"], { hant: string; hans: string; en: string }> = {
  year: { hant: "年柱", hans: "年柱", en: "year pillar" },
  month: { hant: "月柱", hans: "月柱", en: "month pillar" },
  day: { hant: "日柱", hans: "日柱", en: "day pillar" },
  time: { hant: "時柱", hans: "时柱", en: "hour pillar" },
};

function labelGod(god: string, locale?: AppLocale): string {
  const item = GOD_LABELS[god];
  if (!item) return god;
  return pick(locale, item.hant, item.hans, item.en);
}

function labelPillar(key: Pillar["key"], locale?: AppLocale): string {
  const item = PILLAR_LABELS[key];
  return pick(locale, item.hant, item.hans, item.en);
}

function labelRole(role: KinshipRole, locale?: AppLocale): string {
  const item = ROLE_LABELS[role];
  return pick(locale, item.hant, item.hans, item.en);
}

function formatAssessment(
  role: KinshipRole,
  chart: Chart,
  relation: RelationPref,
  gods: string[],
  placements: KinshipPlacement[],
  branchSignals: KinshipBranchSignal[],
  level: KinshipEvidenceLevel,
  locale?: AppLocale,
): string {
  const roleLabel = labelRole(role, locale);
  const palace = PALACE_KEYS[role].map((key) => labelPillar(key, locale)).join(pick(locale, "／", "／", "/"));
  const godsText = gods.map((god) => labelGod(god, locale)).join(pick(locale, "、", "、", ", "));
  const placementText = placements
    .slice(0, 4)
    .map((item) => `${labelPillar(item.pillar, locale)}${item.source === "stem" ? pick(locale, "透", "透", " stem ") : pick(locale, "藏", "藏", " hidden ")}${labelGod(item.tenGod, locale)}`)
    .join(pick(locale, "、", "、", "; "));
  const signalText = branchSignals
    .slice(0, 3)
    .map((item) => `${labelPillar(item.anchorPillar, locale)}${item.anchorBranch}—${labelPillar(item.otherPillar, locale)}${item.otherBranch}:${item.relations.join("/")}`)
    .join(pick(locale, "；", "；", "; "));

  if (locale === "en") {
    const starLine = gods.length
      ? `Traditional person-star candidates: ${godsText}.`
      : role === "partner"
        ? `Because the relationship setting is non-gendered or unspecified, no gendered spouse-star is used as the sole judge.`
        : `Gender is insufficient for a traditional person-star mapping.`;
    const evidenceLine = placements.length ? `Observed structure: ${placementText}.` : `No explicit matching person-star is visible in the known natal pillars.`;
    const levelLine = level === "direct"
      ? `The person-star and its relevant palace overlap directly.`
      : level === "supported"
        ? `The person-star exists, but not in the primary ${roleLabel} palace.`
        : level === "palace-only"
          ? `The ${roleLabel} palace exists, but the matching person-star is not explicit.`
          : `The available birth data are insufficient for this role.`;
    const relationLine = signalText ? `Palace interactions: ${signalText}; these are triggers, not automatic good/bad outcomes.` : `No natal clash/combine/harm/punishment signal is used here as an automatic outcome.`;
    return `Kinship locator — ${roleLabel}: primary palace ${palace}. ${starLine} ${evidenceLine} ${levelLine} ${relationLine} This layer locates the person; strength, usefulness, doing-work and event outcome still require the main BaZi structure and luck-cycle layers.`;
  }

  if (locale === "zh-Hans") {
    const starLine = gods.length
      ? `传统人物星候选：${godsText}。`
      : role === "partner"
        ? `关系设定为同性／不限或性别未定，不把性别化配偶星当唯一主判。`
        : `性别资料不足，不强套人物星。`;
    const evidenceLine = placements.length ? `原局可见：${placementText}。` : `已知原局未见明确对应人物星。`;
    const levelLine = level === "direct"
      ? `人物星与主要宫位有直接重合。`
      : level === "supported"
        ? `人物星有出现，但不在${roleLabel}主要宫位。`
        : level === "palace-only"
          ? `${roleLabel}宫位可看，但人物星不显。`
          : `现有出生资料不足以完成此人物定位。`;
    const relationLine = signalText ? `宫位结构另见：${signalText}；合冲刑害只表示关系被牵动，不直接定吉凶。` : `目前不以单一合冲刑害制造人物事件。`;
    return `六亲定位：${roleLabel}。主看${palace}。${starLine}${evidenceLine}${levelLine}${relationLine}这一层只负责定位人物；旺衰、喜忌、做功与具体事件仍交回子平主结构和岁运层。`;
  }

  const starLine = gods.length
    ? `傳統人物星候選：${godsText}。`
    : role === "partner"
      ? `關係設定為同性／不限或性別未定，不把性別化配偶星當唯一主判。`
      : `性別資料不足，不強套人物星。`;
  const evidenceLine = placements.length ? `原局可見：${placementText}。` : `已知原局未見明確對應人物星。`;
  const levelLine = level === "direct"
    ? `人物星與主要宮位有直接重合。`
    : level === "supported"
      ? `人物星有出現，但不在${roleLabel}主要宮位。`
      : level === "palace-only"
        ? `${roleLabel}宮位可看，但人物星不顯。`
        : `現有出生資料不足以完成此人物定位。`;
  const relationLine = signalText ? `宮位結構另見：${signalText}；合沖刑害只表示關係被牽動，不直接定吉凶。` : `目前不以單一合沖刑害製造人物事件。`;
  return `六親定位：${roleLabel}。主看${palace}。${starLine}${evidenceLine}${levelLine}${relationLine}這一層只負責定位人物；旺衰、喜忌、做功與具體事件仍交回子平主結構和歲運層。`;
}

export function evaluateKinship(
  question: string,
  chart: Chart,
  relation: RelationPref = "unset",
  locale?: AppLocale,
): KinshipAssessment | null {
  const role = inferKinshipRole(question);
  if (!role) return null;

  const mapping = traditionalGods(role, chart, relation);
  const placements = collectPlacements(chart, role, mapping.gods);
  const branchSignals = collectBranchSignals(chart, role);
  const level = evidenceLevel(chart, role, placements);

  return {
    role,
    targetGods: mapping.gods,
    palaceKeys: PALACE_KEYS[role],
    placements,
    branchSignals,
    level,
    usesGenderedTraditionalMapping: mapping.gendered,
    summary: formatAssessment(role, chart, relation, mapping.gods, placements, branchSignals, level, locale),
  };
}

export function applyKinshipRuntimePolicy(
  question: string,
  chart: Chart,
  relation: RelationPref,
  reading: Reading,
  locale?: AppLocale,
): Reading {
  const assessment = evaluateKinship(question, chart, relation, locale);
  if (!assessment) return reading;

  const marker = pick(locale, "六親定位：", "六亲定位：", "Kinship locator —");
  if (reading.directAnswer.includes(marker)) return reading;

  const directAnswer = `${assessment.summary} ${reading.directAnswer}`;
  const love = assessment.role === "partner"
    ? `${assessment.summary} ${reading.love}`
    : reading.love;

  return {
    ...reading,
    directAnswer,
    love,
  };
}
