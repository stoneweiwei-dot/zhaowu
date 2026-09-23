import type { AppLocale, Chart, Element } from "@/lib/bazi/types";

export const CULTIVATION_PATHS = [
  "sword", "array", "artifact", "alchemy", "talisman", "body", "beast", "ghost", "soul",
] as const;

export type CultivationPath = (typeof CULTIVATION_PATHS)[number];

export type CultivationDimension = {
  key: "root" | "insight" | "foundation" | "sense" | "mind" | "fortune";
  label: string;
  score: number;
};

export type CultivationPathScore = {
  key: CultivationPath;
  label: string;
  score: number;
};

export type SectFit = {
  name: string;
  peak: string;
  score: number;
  status: string;
};

export type CultivationDestiny = {
  version: "cultivation_destiny_v1";
  primaryElement: Element;
  secondaryElement: Element;
  trigram: string;
  zodiac: string;
  rootName: string;
  rootGrade: string;
  rootScore: number;
  specialAffinity: string;
  identity: string;
  sect: string;
  peak: string;
  tokenMaterial: string;
  mainPath: CultivationPathScore;
  supportPath: CultivationPathScore;
  unsuitablePaths: CultivationPathScore[];
  elements: Array<{ element: Element; label: string; percent: number; level: number }>;
  dimensions: CultivationDimension[];
  paths: CultivationPathScore[];
  sectFits: SectFit[];
  partner: string;
  opportunity: string;
  trial: string;
  dao: string;
  commonRoute: string;
  upperRoute: string;
  extremeRoute: string;
  finalReading: string;
  ziweiNote: string;
  evidenceNote: string;
};

const ELEMENTS: Element[] = ["木", "火", "土", "金", "水"];

const ELEMENT_NAME: Record<Element, { "zh-Hant": string; "zh-Hans": string; en: string }> = {
  木: { "zh-Hant": "青木", "zh-Hans": "青木", en: "Wood" },
  火: { "zh-Hant": "離炎", "zh-Hans": "离炎", en: "Fire" },
  土: { "zh-Hant": "坤元", "zh-Hans": "坤元", en: "Earth" },
  金: { "zh-Hant": "玄金", "zh-Hans": "玄金", en: "Metal" },
  水: { "zh-Hant": "玄淵", "zh-Hans": "玄渊", en: "Water" },
};

const TRIGRAM: Record<Element, { "zh-Hant": string; "zh-Hans": string; en: string }> = {
  木: { "zh-Hant": "震卦", "zh-Hans": "震卦", en: "Zhen trigram" },
  火: { "zh-Hant": "離卦", "zh-Hans": "离卦", en: "Li trigram" },
  土: { "zh-Hant": "坤卦", "zh-Hans": "坤卦", en: "Kun trigram" },
  金: { "zh-Hant": "乾卦", "zh-Hans": "乾卦", en: "Qian trigram" },
  水: { "zh-Hant": "坎卦", "zh-Hans": "坎卦", en: "Kan trigram" },
};

const PATH_LABEL: Record<CultivationPath, { "zh-Hant": string; "zh-Hans": string; en: string }> = {
  sword: { "zh-Hant": "劍修", "zh-Hans": "剑修", en: "Sword" },
  array: { "zh-Hant": "陣修", "zh-Hans": "阵修", en: "Formations" },
  artifact: { "zh-Hant": "器修", "zh-Hans": "器修", en: "Artifacts" },
  alchemy: { "zh-Hant": "丹修", "zh-Hans": "丹修", en: "Alchemy" },
  talisman: { "zh-Hant": "符修", "zh-Hans": "符修", en: "Talismans" },
  body: { "zh-Hant": "體修", "zh-Hans": "体修", en: "Body" },
  beast: { "zh-Hant": "御獸", "zh-Hans": "御兽", en: "Beast-taming" },
  ghost: { "zh-Hant": "鬼修", "zh-Hans": "鬼修", en: "Ghost path" },
  soul: { "zh-Hant": "神魂修", "zh-Hans": "神魂修", en: "Soul" },
};

const PATH_BASE: Record<Element, Record<CultivationPath, number>> = {
  木: { sword: 6, array: 6, artifact: 5, alchemy: 7, talisman: 9, body: 5, beast: 9, ghost: 3, soul: 7 },
  火: { sword: 8, array: 6, artifact: 6, alchemy: 9, talisman: 7, body: 7, beast: 5, ghost: 2, soul: 6 },
  土: { sword: 6, array: 8, artifact: 9, alchemy: 7, talisman: 6, body: 9, beast: 6, ghost: 4, soul: 5 },
  金: { sword: 9, array: 7, artifact: 9, alchemy: 5, talisman: 7, body: 7, beast: 4, ghost: 3, soul: 7 },
  水: { sword: 6, array: 9, artifact: 6, alchemy: 6, talisman: 8, body: 4, beast: 6, ghost: 5, soul: 9 },
};

const SECTS: Array<{ element: Element; path: CultivationPath; names: Record<AppLocale, string>; peaks: Record<AppLocale, string> }> = [
  { element: "水", path: "array", names: { "zh-Hant": "太微天機宗", "zh-Hans": "太微天机宗", en: "Taiwei Tianji Sect" }, peaks: { "zh-Hant": "玄機峰", "zh-Hans": "玄机峰", en: "Xuanji Peak" } },
  { element: "金", path: "sword", names: { "zh-Hant": "太白劍宗", "zh-Hans": "太白剑宗", en: "Taibai Sword Sect" }, peaks: { "zh-Hant": "洗劍峰", "zh-Hans": "洗剑峰", en: "Sword-Washing Peak" } },
  { element: "木", path: "talisman", names: { "zh-Hant": "青梧道宗", "zh-Hans": "青梧道宗", en: "Qingwu Dao Sect" }, peaks: { "zh-Hant": "萬象峰", "zh-Hans": "万象峰", en: "Wanxiang Peak" } },
  { element: "火", path: "alchemy", names: { "zh-Hant": "赤霄丹宗", "zh-Hans": "赤霄丹宗", en: "Chixiao Alchemy Sect" }, peaks: { "zh-Hant": "丹霞峰", "zh-Hans": "丹霞峰", en: "Danxia Peak" } },
  { element: "土", path: "body", names: { "zh-Hant": "崑嶽玄門", "zh-Hans": "昆岳玄门", en: "Kunyue Gate" }, peaks: { "zh-Hant": "鎮嶽峰", "zh-Hans": "镇岳峰", en: "Zhenyue Peak" } },
];

const VALID_MBTI = new Set([
  "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
]);

function tr(locale: AppLocale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function clamp(value: number, min = 1, max = 10) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function westernZodiac(month: number, day: number, locale: AppLocale) {
  const cutoffs: Array<[number, string, string, string]> = [
    [20, "摩羯座", "摩羯座", "Capricorn"], [19, "水瓶座", "水瓶座", "Aquarius"],
    [20, "雙魚座", "双鱼座", "Pisces"], [20, "牡羊座", "白羊座", "Aries"],
    [21, "金牛座", "金牛座", "Taurus"], [21, "雙子座", "双子座", "Gemini"],
    [23, "巨蟹座", "巨蟹座", "Cancer"], [23, "獅子座", "狮子座", "Leo"],
    [23, "處女座", "处女座", "Virgo"], [23, "天秤座", "天秤座", "Libra"],
    [22, "天蠍座", "天蝎座", "Scorpio"], [22, "射手座", "射手座", "Sagittarius"],
  ];
  const current = cutoffs[month - 1];
  const previous = cutoffs[(month + 10) % 12];
  const chosen = day >= current[0] ? current : previous;
  return locale === "en" ? chosen[3] : locale === "zh-Hans" ? chosen[2] : chosen[1];
}

function gradeOf(score: number, locale: AppLocale) {
  if (score >= 9) return tr(locale, "天品", "天品", "Heaven-grade");
  if (score >= 8) return tr(locale, "極品", "极品", "Extreme-grade");
  if (score >= 6) return tr(locale, "上品", "上品", "Upper-grade");
  if (score >= 4) return tr(locale, "中品", "中品", "Middle-grade");
  if (score >= 3) return tr(locale, "下品", "下品", "Lower-grade");
  return tr(locale, "殘品", "残品", "Fragmentary");
}

function sectStatus(score: number, rootScore: number, locale: AppLocale) {
  if (score >= 9 && rootScore >= 8) return tr(locale, "親傳", "亲传", "Direct disciple");
  if (score >= 8) return tr(locale, "核心", "核心", "Core");
  if (score >= 6) return tr(locale, "內門", "内门", "Inner");
  if (score >= 5) return tr(locale, "外門", "外门", "Outer");
  if (score >= 4) return tr(locale, "不合", "不合", "Poor fit");
  return tr(locale, "拒收", "拒收", "Rejected");
}

function identityFrom(score: number, locale: AppLocale) {
  if (score >= 9) return tr(locale, "親傳弟子", "亲传弟子", "Direct disciple");
  if (score >= 8) return tr(locale, "核心弟子", "核心弟子", "Core disciple");
  if (score >= 6) return tr(locale, "內門弟子", "内门弟子", "Inner disciple");
  return tr(locale, "外門弟子", "外门弟子", "Outer disciple");
}

function affinity(primary: Element, secondary: Element, dual: boolean, locale: AppLocale) {
  if (!dual) return tr(locale, "一脈顯化", "一脉显化", "Single-root manifestation");
  const key = primary + secondary;
  const reverse = secondary + primary;
  const table: Record<string, [string, string, string]> = {
    "水金": ["金水映神", "金水映神", "Metal–Water clarity"], "金水": ["金水映神", "金水映神", "Metal–Water clarity"],
    "水木": ["水木相涵", "水木相涵", "Water–Wood circulation"], "木水": ["水木相涵", "水木相涵", "Water–Wood circulation"],
    "木火": ["木火通明", "木火通明", "Wood–Fire illumination"], "火木": ["木火通明", "木火通明", "Wood–Fire illumination"],
    "火土": ["火土成器", "火土成器", "Fire–Earth forging"], "土火": ["火土成器", "火土成器", "Fire–Earth forging"],
    "土金": ["土金鑄器", "土金铸器", "Earth–Metal forging"], "金土": ["土金鑄器", "土金铸器", "Earth–Metal forging"],
  };
  const value = table[key] ?? table[reverse] ?? ["雙行共振", "双行共振", "Dual-element resonance"];
  return locale === "en" ? value[2] : locale === "zh-Hans" ? value[1] : value[0];
}

function tokenMaterial(primary: Element, secondary: Element, locale: AppLocale) {
  const base: Record<Element, [string, string, string]> = {
    木: ["青玉靈木", "青玉灵木", "jade-inlaid spiritwood"],
    火: ["赤玉火銅", "赤玉火铜", "red jade and fire-bronze"],
    土: ["黃玉玄石", "黄玉玄石", "yellow jade and dark stone"],
    金: ["烏金白玉", "乌金白玉", "dark metal and white jade"],
    水: ["玄黑寒玉", "玄黑寒玉", "black cold jade"],
  };
  const accent: Record<Element, [string, string, string]> = {
    木: ["青絲嵌紋", "青丝嵌纹", "jade-green inlay"],
    火: ["朱砂金線", "朱砂金线", "cinnabar-gold inlay"],
    土: ["古金山紋", "古金山纹", "antique-gold mountain inlay"],
    金: ["銀絲星軌", "银丝星轨", "silver star-track inlay"],
    水: ["墨銀水紋", "墨银水纹", "ink-silver water inlay"],
  };
  const a = base[primary];
  const b = accent[secondary];
  if (locale === "en") return a[2] + " with " + b[2];
  return (locale === "zh-Hans" ? a[1] + " · " + b[1] : a[0] + " · " + b[0]);
}

function pairRoot(primary: Element, secondary: Element, dual: boolean, locale: AppLocale) {
  const p = ELEMENT_NAME[primary][locale];
  if (!dual) return locale === "en" ? p + " spirit root" : p + "靈根";
  const s = ELEMENT_NAME[secondary][locale];
  return locale === "en" ? p + "–" + s + " dual spirit root" : p + s + "雙靈根";
}

function partnerElement(primary: Element): Element {
  const mother: Record<Element, Element> = { 木: "水", 火: "木", 土: "火", 金: "土", 水: "金" };
  return mother[primary];
}

function elementShadow(element: Element, locale: AppLocale) {
  const table: Record<Element, [string, string, string]> = {
    木: ["枝路過多 易散其志", "枝路过多 易散其志", "Too many branches can scatter direction."],
    火: ["火勢過急 易耗其元", "火势过急 易耗其元", "Excess speed can burn through reserves."],
    土: ["守成過重 易困於局", "守成过重 易困于局", "Over-stability can turn into stagnation."],
    金: ["裁斷過剛 易失轉圜", "裁断过刚 易失转圜", "Excess rigidity can remove useful flexibility."],
    水: ["思流過深 易久困心城", "思流过深 易久困心城", "Deep analysis can become a closed loop."],
  };
  const v = table[element];
  return locale === "en" ? v[2] : locale === "zh-Hans" ? v[1] : v[0];
}

function mbtiModifiers(mbtiRaw: string | undefined) {
  const mbti = (mbtiRaw ?? "").trim().toUpperCase();
  const out: Partial<Record<CultivationPath, number>> = {};
  if (!VALID_MBTI.has(mbti)) return { mbti: "", paths: out, insight: 0, mind: 0 };
  if (mbti.includes("N")) { out.soul = (out.soul ?? 0) + 0.7; }
  if (mbti.includes("T")) { out.artifact = (out.artifact ?? 0) + 0.6; }
  if (mbti.includes("J")) { out.array = (out.array ?? 0) + 0.7; }
  if (mbti.includes("F")) { out.talisman = (out.talisman ?? 0) + 0.5; out.beast = (out.beast ?? 0) + 0.4; }
  if (mbti.includes("E")) { out.sword = (out.sword ?? 0) + 0.4; }
  if (mbti.includes("P")) { out.beast = (out.beast ?? 0) + 0.4; }
  return {
    mbti,
    paths: out,
    insight: (mbti.includes("N") ? 0.5 : 0) + (mbti.includes("T") ? 0.5 : 0),
    mind: (mbti.includes("I") ? 0.5 : 0) + (mbti.includes("J") ? 0.5 : 0),
  };
}

export function deriveCultivationDestiny(input: {
  chart: Chart;
  birthMonth: number;
  birthDay: number;
  locale?: AppLocale;
  mbti?: string;
}): CultivationDestiny {
  const locale = input.locale ?? "zh-Hant";
  const chart = input.chart;
  const sorted = ELEMENTS
    .map((element) => ({ element, percent: Number(chart.elementPercents[element] ?? 0) }))
    .sort((a, b) => b.percent - a.percent || ELEMENTS.indexOf(a.element) - ELEMENTS.indexOf(b.element));
  const primary = sorted[0]?.element ?? chart.dayMasterElement;
  const secondary = sorted[1]?.element ?? chart.dayMasterElement;
  const topPct = sorted[0]?.percent ?? 0;
  const secondPct = sorted[1]?.percent ?? 0;
  const dual = secondPct >= 15 && secondPct >= topPct * 0.62;

  let rootScore = 4;
  if (!chart.timeUnknown) rootScore += 1;
  if (topPct >= 30) rootScore += 1;
  if (secondPct >= 18) rootScore += 1;
  if (topPct >= 45 && secondPct >= 20) rootScore += 1;
  if (topPct >= 55 && secondPct >= 20 && !chart.timeUnknown) rootScore += 1;
  if (chart.timeUnknown) rootScore = Math.min(rootScore, 5);
  rootScore = clamp(rootScore);

  const mbti = mbtiModifiers(input.mbti);
  const paths = CULTIVATION_PATHS.map((key) => {
    const base =
      PATH_BASE[primary][key] * 0.55 +
      PATH_BASE[secondary][key] * 0.25 +
      PATH_BASE[chart.dayMasterElement][key] * 0.2 +
      (mbti.paths[key] ?? 0);
    return { key, label: PATH_LABEL[key][locale], score: clamp(base) };
  }).sort((a, b) => b.score - a.score || CULTIVATION_PATHS.indexOf(a.key) - CULTIVATION_PATHS.indexOf(b.key));

  const mainPath = paths[0];
  const supportPath = paths.find((item) => item.key !== mainPath.key) ?? paths[1];
  const unsuitablePaths = [...paths].sort((a, b) => a.score - b.score).slice(0, 2);

  const elementLevel = (element: Element) => {
    const percent = Number(chart.elementPercents[element] ?? 0);
    return clamp(1 + (percent / Math.max(topPct, 1)) * 8);
  };
  const elements = ELEMENTS.map((element) => ({
    element,
    label: ELEMENT_NAME[element][locale],
    percent: Number(chart.elementPercents[element] ?? 0),
    level: elementLevel(element),
  }));

  const pct = (el: Element) => Number(chart.elementPercents[el] ?? 0);
  const activeElements = elements.filter((item) => item.percent > 0).length;
  const dimensions: CultivationDimension[] = [
    { key: "root", label: tr(locale, "靈根", "灵根", "Spirit root"), score: rootScore },
    { key: "insight", label: tr(locale, "悟性", "悟性", "Insight"), score: clamp(4.5 + (pct("水") + pct("金")) / 28 + mbti.insight) },
    { key: "foundation", label: tr(locale, "根骨", "根骨", "Foundation"), score: clamp(4 + (pct("土") + pct("金")) / 30) },
    { key: "sense", label: tr(locale, "神識", "神识", "Spirit sense"), score: clamp(4 + (pct("水") + pct("木")) / 27) },
    { key: "mind", label: tr(locale, "心性", "心性", "Mind"), score: clamp(4.5 + (pct("土") + pct("水")) / 32 + mbti.mind) },
    { key: "fortune", label: tr(locale, "氣運", "气运", "Fortune"), score: clamp(4 + activeElements * 0.45 + (chart.timeUnknown ? 0 : 0.5)) },
  ];

  const sectFits = SECTS.map((sect) => {
    const pathScore = paths.find((item) => item.key === sect.path)?.score ?? 5;
    const elementFactor = 3 + (pct(sect.element) / Math.max(topPct, 1)) * 6;
    const score = clamp(pathScore * 0.6 + elementFactor * 0.4);
    return { name: sect.names[locale], peak: sect.peaks[locale], score, status: sectStatus(score, rootScore, locale) };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const chosenSect = sectFits[0];
  const identity = identityFrom(chosenSect.score, locale);
  const partnerEl = partnerElement(primary);
  const partner = tr(
    locale,
    ELEMENT_NAME[partnerEl]["zh-Hant"] + "系靈根較易與你的主脈形成生助 配以心性清醒 邊界穩定者為佳",
    ELEMENT_NAME[partnerEl]["zh-Hans"] + "系灵根较易与你的主脉形成生助 配以心性清醒 边界稳定者为佳",
    ELEMENT_NAME[partnerEl].en + "-leaning roots pair naturally with your main current; steady boundaries and clear judgement matter more than labels",
  );

  const opportunity = tr(
    locale,
    "最大機緣在於把" + mainPath.label + "的長處做成可重複的本領 由一技入道",
    "最大机缘在于把" + mainPath.label + "的长处做成可重复的本领 由一技入道",
    "Your strongest opening comes from turning " + mainPath.label.toLowerCase() + " into a repeatable craft rather than chasing every path.",
  );
  const trial = elementShadow(primary, locale);
  const dao = tr(
    locale,
    "先定其局 再動其鋒 以所長立身 不以虛名定命",
    "先定其局 再动其锋 以所长立身 不以虚名定命",
    "Read the field first, then act; build on a real strength rather than a grand title.",
  );

  const commonRoute = tr(
    locale,
    identity + "起步 以" + mainPath.label + "為主 " + supportPath.label + "為輔 穩定積累",
    identity + "起步 以" + mainPath.label + "为主 " + supportPath.label + "为辅 稳定积累",
    "Begin at " + identity + " level, major in " + mainPath.label + " with " + supportPath.label + " as support.",
  );
  const upperRoute = tr(
    locale,
    "若主修評級能落實為實戰與傳承 可入" + chosenSect.peak + "核心序列",
    "若主修评级能落实为实战与传承 可入" + chosenSect.peak + "核心序列",
    "If the main-path aptitude is converted into proven skill, a core place at " + chosenSect.peak + " becomes plausible.",
  );
  const extremeRoute = tr(
    locale,
    "極途只作世界觀上限 若靈根與心性同時成熟 方可自成一脈 不保證抵達",
    "极途只作世界观上限 若灵根与心性同时成熟 方可自成一脉 不保证抵达",
    "The extreme route is only a fictional ceiling: if root and discipline mature together, an independent lineage is possible, not guaranteed.",
  );

  const finalReading = tr(
    locale,
    "此命以" + ELEMENT_NAME[primary]["zh-Hant"] + "為先 " + ELEMENT_NAME[secondary]["zh-Hant"] + "相隨 宜走" + mainPath.label + "之正途 其長不在蠻力 而在把判斷化成可反覆驗證的能力",
    "此命以" + ELEMENT_NAME[primary]["zh-Hans"] + "为先 " + ELEMENT_NAME[secondary]["zh-Hans"] + "相随 宜走" + mainPath.label + "之正途 其长不在蛮力 而在把判断化成可反复验证的能力",
    "This profile is led by " + ELEMENT_NAME[primary].en + " with " + ELEMENT_NAME[secondary].en + " secondary. Its best fictional path is " + mainPath.label + "; the edge is repeatable judgement, not brute force.",
  );

  const ziweiNote = chart.timeUnknown
    ? tr(locale, "時辰未定 紫微旁證不啟動 不補造命身宮", "时辰未定 紫微旁证不启动 不补造命身宫", "Birth time is unknown, so Ziwei side evidence is not generated.")
    : tr(locale, "紫微層保留為旁證位 本趣味測驗不另起未校驗紫微盤 不讓跨流派資料反改八字主判", "紫微层保留为旁证位 本趣味测验不另起未校验紫微盘 不让跨流派资料反改八字主判", "Ziwei remains a side-evidence slot here; this fun test does not create an unverified Ziwei chart or let it rewrite the BaZi result.");

  const evidenceNote = tr(
    locale,
    "靈根與宗門是仙俠世界觀轉譯 主軸只讀既有八字與五行資料 八卦按主五行取象 星座與自填 MBTI 僅作低權重性格修飾 不改正式命盤",
    "灵根与宗门是仙侠世界观转译 主轴只读既有八字与五行资料 八卦按主五行取象 星座与自填 MBTI 仅作低权重性格修饰 不改正式命盘",
    "Spirit roots and sects are fictional worldbuilding. The main layer reads the existing BaZi/Five-Element chart; trigram symbolism follows the leading element, while zodiac and optional self-reported MBTI only add low-weight flavour and never change the formal chart.",
  );

  return {
    version: "cultivation_destiny_v1",
    primaryElement: primary,
    secondaryElement: secondary,
    trigram: TRIGRAM[primary][locale],
    zodiac: westernZodiac(input.birthMonth, input.birthDay, locale),
    rootName: pairRoot(primary, secondary, dual, locale),
    rootGrade: gradeOf(rootScore, locale),
    rootScore,
    specialAffinity: affinity(primary, secondary, dual, locale),
    identity,
    sect: chosenSect.name,
    peak: chosenSect.peak,
    tokenMaterial: tokenMaterial(primary, secondary, locale),
    mainPath,
    supportPath,
    unsuitablePaths,
    elements,
    dimensions,
    paths,
    sectFits,
    partner,
    opportunity,
    trial,
    dao,
    commonRoute,
    upperRoute,
    extremeRoute,
    finalReading,
    ziweiNote,
    evidenceNote,
  };
}
