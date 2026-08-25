import type { AppLocale, Chart, Element, Reading } from "@/lib/bazi/types";

export type CosmicArchetypeId = "sirius" | "lyra" | "arcturus";
export type CosmicDimension = "3D→4D" | "4D" | "4D→5D";

export type CosmicProfile = {
  primary: CosmicArchetypeId;
  secondary: CosmicArchetypeId;
  dimension: CosmicDimension;
  directAnswer: string;
  archetypeLines: string[];
  dimensionLines: string[];
  actionLines: string[];
  disclaimer: string;
};

const COSMIC_RE = /(宇宙|星際|星际|星際種子|星际种子|star\s*seed|starseed|靈魂維度|灵魂维度|靈魂來源|灵魂来源|靈魂原型|灵魂原型|天狼星|sirius|天琴座|lyra|大角星|arcturus|3d|4d|5d|高維|高维|維度|维度|光碼|光码)/i;

const LABELS = {
  sirius: { zhHans: "天狼星 Sirius", zhHant: "天狼星 Sirius", en: "Sirius" },
  lyra: { zhHans: "天琴座 Lyra", zhHant: "天琴座 Lyra", en: "Lyra" },
  arcturus: { zhHans: "大角星 Arcturus", zhHant: "大角星 Arcturus", en: "Arcturus" },
} as const;

const ARCHETYPE_COPY = {
  sirius: {
    zhHans: "系统、技术、守护、理性与直觉之间的桥梁；做事偏快、准、重结构。",
    zhHant: "系統、技術、守護、理性與直覺之間的橋樑；做事偏快、準、重結構。",
    en: "Systems, technique, guardianship, and a bridge between rationality and intuition; fast, precise, structure-led.",
  },
  lyra: {
    zhHans: "起源、创造、自主、开路与审美表达；更强调从无到有与保持自我主轴。",
    zhHant: "起源、創造、自主、開路與審美表達；更強調從無到有與保持自我主軸。",
    en: "Origin, creation, autonomy, pioneering, and aesthetic expression; building from zero while keeping a clear inner axis.",
  },
  arcturus: {
    zhHans: "校准、结构、跨系统整合与优化；更像把复杂东西整理成可执行秩序。",
    zhHant: "校準、結構、跨系統整合與優化；更像把複雜東西整理成可執行秩序。",
    en: "Calibration, structure, cross-system integration, and optimisation; turning complexity into usable order.",
  },
} as const;

const GAN_ELEMENT: Record<string, Element> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

export function isCosmicSymbolicQuestion(question: string): boolean {
  return COSMIC_RE.test(question.trim());
}

function elementWeight(chart: Chart, element: Element): number {
  const pct = Number(chart.elementPercents?.[element] ?? 0);
  if (Number.isFinite(pct) && pct > 0) return pct;
  const raw = Number(chart.elements?.[element] ?? 0);
  return Number.isFinite(raw) ? raw : 0;
}

function archetypeScores(chart: Chart): Record<CosmicArchetypeId, number> {
  const w = elementWeight(chart, "水");
  const m = elementWeight(chart, "金");
  const wood = elementWeight(chart, "木");
  const fire = elementWeight(chart, "火");
  const earth = elementWeight(chart, "土");
  const scores: Record<CosmicArchetypeId, number> = {
    sirius: w * 0.07 + m * 0.055,
    lyra: wood * 0.065 + fire * 0.055,
    arcturus: earth * 0.065 + m * 0.045,
  };

  switch (chart.dayMasterElement) {
    case "水": scores.sirius += 4; scores.arcturus += 1; break;
    case "金": scores.sirius += 2.5; scores.arcturus += 2.5; break;
    case "木": scores.lyra += 4; scores.arcturus += 1; break;
    case "火": scores.lyra += 3.5; scores.sirius += 0.5; break;
    case "土": scores.arcturus += 4; scores.sirius += 0.75; break;
  }

  const dayunStem = chart.currentDayun?.ganZhi?.[0];
  const dayunElement = dayunStem ? GAN_ELEMENT[dayunStem] : undefined;
  if (dayunElement === "水" || dayunElement === "金") scores.sirius += 0.8;
  if (dayunElement === "木" || dayunElement === "火") scores.lyra += 0.8;
  if (dayunElement === "土" || dayunElement === "金") scores.arcturus += 0.8;

  return scores;
}

function topArchetypes(chart: Chart): [CosmicArchetypeId, CosmicArchetypeId] {
  const sorted = Object.entries(archetypeScores(chart))
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id as CosmicArchetypeId);
  return [sorted[0], sorted[1]];
}

function dimensionFor(chart: Chart): CosmicDimension {
  const tendency = chart.strength?.tendency ?? "";
  if (/弱/.test(tendency)) return "3D→4D";
  if (/旺|強|强/.test(tendency)) return "4D→5D";
  return "4D";
}

function label(id: CosmicArchetypeId, locale: AppLocale): string {
  if (locale === "en") return LABELS[id].en;
  return locale === "zh-Hant" ? LABELS[id].zhHant : LABELS[id].zhHans;
}

function copy(id: CosmicArchetypeId, locale: AppLocale): string {
  if (locale === "en") return ARCHETYPE_COPY[id].en;
  return locale === "zh-Hant" ? ARCHETYPE_COPY[id].zhHant : ARCHETYPE_COPY[id].zhHans;
}

function phaseText(dimension: CosmicDimension, locale: AppLocale): string {
  if (locale === "en") {
    if (dimension === "3D→4D") return "The symbolic task is moving from survival/structure toward reflection and meaning-making. Stabilise the base before chasing transcendence.";
    if (dimension === "4D→5D") return "The symbolic task is moving from deconstruction toward integration: fewer identity loops, more coherence between insight, action, and service.";
    return "The symbolic task is a 4D integration phase: questioning old narratives, testing meaning, and rebuilding a workable inner framework.";
  }
  const hant = locale === "zh-Hant";
  if (dimension === "3D→4D") return hant
    ? "象徵任務是從生存／結構層轉向覺察與意義層；先穩住現實底盤，再談超越。"
    : "象征任务是从生存／结构层转向觉察与意义层；先稳住现实底盘，再谈超越。";
  if (dimension === "4D→5D") return hant
    ? "象徵任務是從拆解走向整合：減少反覆的身份迴圈，讓洞察、行動與服務真正對齊。"
    : "象征任务是从拆解走向整合：减少反复的身份循环，让洞察、行动与服务真正对齐。";
  return hant
    ? "象徵任務處在 4D 整合期：舊敘事正在被質疑，重點是把新的意義框架落到現實。"
    : "象征任务处在 4D 整合期：旧叙事正在被质疑，重点是把新的意义框架落到现实。";
}

function disclaimer(locale: AppLocale): string {
  if (locale === "en") return "This is Zhaowu's symbolic/New Age archetype module, not an astronomical, scientific, medical, or literal identity claim.";
  if (locale === "zh-Hant") return "此處屬於昭梧的象徵性／新時代靈性原型模組，不是天文、科學、醫療或字面身份認證。";
  return "此处属于昭梧的象征性／新时代灵性原型模块，不是天文、科学、医疗或字面身份认证。";
}

export function buildCosmicProfile(chart: Chart, locale: AppLocale = "zh-Hans"): CosmicProfile {
  const [primary, secondary] = topArchetypes(chart);
  const dimension = dimensionFor(chart);
  const dayun = chart.currentDayun?.ganZhi;

  if (locale === "en") {
    return {
      primary,
      secondary,
      dimension,
      directAnswer: `Within Zhaowu's symbolic soul-origin model, your strongest resonance is ${label(primary, locale)}, with ${label(secondary, locale)} as a secondary archetype. Your current consciousness task reads closer to ${dimension}.`,
      archetypeLines: [
        `${label(primary, locale)} | ${copy(primary, locale)}`,
        `${label(secondary, locale)} | ${copy(secondary, locale)}`,
        `Bazi is used only as a cross-reference here: ${chart.dayMaster} ${chart.dayMasterElement} Day Master, ${chart.monthBranch} Month Command${dayun ? `, current cycle ${dayun}` : ""}.`,
      ],
      dimensionLines: [
        `${dimension} | ${phaseText(dimension, locale)}`,
        "3D/4D/5D are used here as symbolic modes of attention, not as a ranking of human worth or a measurable frequency.",
      ],
      actionLines: [
        "Translate the archetype into observable behaviour: choose one system to improve, one boundary to hold, and one creative or service output to finish.",
        "Keep only the parts that match repeated real-life patterns; discard anything that requires belief to stay convincing.",
      ],
      disclaimer: disclaimer(locale),
    };
  }

  const hant = locale === "zh-Hant";
  return {
    primary,
    secondary,
    dimension,
    directAnswer: hant
      ? `按昭梧的象徵性宇宙靈魂模型，你目前最接近「${label(primary, locale)}」主原型，副原型是「${label(secondary, locale)}」；當前意識任務更接近 ${dimension}。`
      : `按昭梧的象征性宇宙灵魂模型，你目前最接近「${label(primary, locale)}」主原型，副原型是「${label(secondary, locale)}」；当前意识任务更接近 ${dimension}。`,
    archetypeLines: [
      `${label(primary, locale)}｜${copy(primary, locale)}`,
      `${label(secondary, locale)}｜${copy(secondary, locale)}`,
      hant
        ? `八字在這裡只作旁證：日主 ${chart.dayMaster}${chart.dayMasterElement}、月令 ${chart.monthBranch}${dayun ? `、當前 ${dayun} 大運` : ""}；不把星際原型反過來改寫子平主判。`
        : `八字在这里只作旁证：日主 ${chart.dayMaster}${chart.dayMasterElement}、月令 ${chart.monthBranch}${dayun ? `、当前 ${dayun} 大运` : ""}；不把星际原型反过来改写子平主判。`,
    ],
    dimensionLines: [
      `${dimension}｜${phaseText(dimension, locale)}`,
      hant
        ? "3D／4D／5D 在此只代表象徵性的注意力與整合模式，不代表人格高低、靈魂等級或可測量的頻率數值。"
        : "3D／4D／5D 在此只代表象征性的注意力与整合模式，不代表人格高低、灵魂等级或可测量的频率数值。",
    ],
    actionLines: [
      hant
        ? "把原型落到現實：只選一個要優化的系統、一條要守住的邊界，以及一個要完成的創作／服務輸出。"
        : "把原型落到现实：只选一个要优化的系统、一条要守住的边界，以及一个要完成的创作／服务输出。",
      hant
        ? "只保留能與反覆出現的真實經歷互相驗證的部分；需要靠相信才能成立的內容直接丟掉。"
        : "只保留能与反复出现的真实经历互相验证的部分；需要靠相信才能成立的内容直接丢掉。",
    ],
    disclaimer: disclaimer(locale),
  };
}

export function applyCosmicSymbolicReading(
  question: string,
  chart: Chart,
  source: Reading,
  locale: AppLocale = "zh-Hans",
): Reading {
  if (!isCosmicSymbolicQuestion(question)) return source;
  const profile = buildCosmicProfile(chart, locale);
  return {
    ...source,
    kind: "past",
    directAnswer: profile.directAnswer,
    rhythm: profile.dimensionLines.join(" "),
    action: profile.actionLines.join(" "),
    lastLine: profile.disclaimer,
  };
}
