import { buildChart } from "@/lib/bazi/chart";
import { SEASON_OF_BRANCH } from "@/lib/bazi/constants";
import type { Element } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";
import type { SharedBirthRecord } from "@/lib/shared-birth";

export type PersonalPaidProfileModel = {
  birthLine: string;
  pillars: Array<{ key: string; label: string; ganZhi: string; ready: boolean }>;
  core: string;
  currentCycle: string;
  relations: string[];
  colors: string[];
  colorSwatches: Array<{ label: string; hex: string }>;
  quietColors: string[];
  quietColorSwatches: Array<{ label: string; hex: string }>;
  materials: string[];
  hours: string[];
  persona: string;
  note: string;
};

const ELEMENT_LABEL: Record<Locale, Record<Element, string>> = {
  "zh-Hant": { 木: "木", 火: "火", 土: "土", 金: "金", 水: "水" },
  "zh-Hans": { 木: "木", 火: "火", 土: "土", 金: "金", 水: "水" },
  en: { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" },
};

const COLORS: Record<Locale, Record<Element, string[]>> = {
  "zh-Hant": {
    木: ["青玉綠", "松針綠", "青灰"],
    火: ["朱砂紅", "珊瑚紅", "暖赭"],
    土: ["岩白", "燕麥", "暖砂"],
    金: ["珍珠白", "銀灰", "淡金"],
    水: ["霧藍", "墨藍", "煙黑"],
  },
  "zh-Hans": {
    木: ["青玉绿", "松针绿", "青灰"],
    火: ["朱砂红", "珊瑚红", "暖赭"],
    土: ["岩白", "燕麦", "暖砂"],
    金: ["珍珠白", "银灰", "淡金"],
    水: ["雾蓝", "墨蓝", "烟黑"],
  },
  en: {
    木: ["jade green", "pine green", "blue-grey"],
    火: ["cinnabar", "coral", "warm ochre"],
    土: ["stone white", "oat", "warm sand"],
    金: ["pearl white", "silver grey", "pale gold"],
    水: ["mist blue", "ink navy", "smoke black"],
  },
};

const ELEMENT_SWATCH: Record<Element, string> = {
  木: "#6f907a",
  火: "#b85f4d",
  土: "#b79a6b",
  金: "#c7c1b4",
  水: "#617b88",
};

const MATERIALS: Record<Locale, Record<Element, string[]>> = {
  "zh-Hant": {
    木: ["青玉", "木質", "竹材"],
    火: ["南紅瑪瑙", "琥珀", "暖金"],
    土: ["黃玉", "陶石", "蜜蠟"],
    金: ["銀飾", "白金", "白玉"],
    水: ["月光石", "黑曜石", "珍珠"],
  },
  "zh-Hans": {
    木: ["青玉", "木质", "竹材"],
    火: ["南红玛瑙", "琥珀", "暖金"],
    土: ["黄玉", "陶石", "蜜蜡"],
    金: ["银饰", "白金", "白玉"],
    水: ["月光石", "黑曜石", "珍珠"],
  },
  en: {
    木: ["green jade", "wood", "bamboo"],
    火: ["red agate", "amber", "warm gold"],
    土: ["yellow jade", "stoneware", "beeswax amber"],
    金: ["silver", "platinum", "white jade"],
    水: ["moonstone", "obsidian", "pearl"],
  },
};

const HOURS: Record<Locale, Record<Element, string[]>> = {
  "zh-Hant": {
    木: ["寅 03–05", "卯 05–07"],
    火: ["巳 09–11", "午 11–13"],
    土: ["辰 07–09", "戌 19–21"],
    金: ["申 15–17", "酉 17–19"],
    水: ["亥 21–23", "子 23–01"],
  },
  "zh-Hans": {
    木: ["寅 03–05", "卯 05–07"],
    火: ["巳 09–11", "午 11–13"],
    土: ["辰 07–09", "戌 19–21"],
    金: ["申 15–17", "酉 17–19"],
    水: ["亥 21–23", "子 23–01"],
  },
  en: {
    木: ["03–05", "05–07"],
    火: ["09–11", "11–13"],
    土: ["07–09", "19–21"],
    金: ["15–17", "17–19"],
    水: ["21–23", "23–01"],
  },
};

const PILLAR_LABELS: Record<Locale, Record<string, string>> = {
  "zh-Hant": { year: "年柱", month: "月柱", day: "日柱", time: "時柱" },
  "zh-Hans": { year: "年柱", month: "月柱", day: "日柱", time: "时柱" },
  en: { year: "Year", month: "Month", day: "Day", time: "Time" },
};

const PERSONA: Record<Locale, Record<Element, string>> = {
  "zh-Hant": { 木: "柔韌生長者", 火: "清晰表達者", 土: "穩定承載者", 金: "鋒利審美者", 水: "冷靜觀察者" },
  "zh-Hans": { 木: "柔韧生长者", 火: "清晰表达者", 土: "稳定承载者", 金: "锋利审美者", 水: "冷静观察者" },
  en: { 木: "adaptive grower", 火: "clear expresser", 土: "steady integrator", 金: "precise curator", 水: "calm observer" },
};

const LIUHE = new Set(["丑子", "亥寅", "戌卯", "辰酉", "巳申", "午未"]);
const CHONG = new Set(["午子", "丑未", "寅申", "卯酉", "戌辰", "亥巳"]);
const HAI = new Set(["子未", "丑午", "寅巳", "卯辰", "亥申", "戌酉"]);
const XING = new Set(["卯子", "寅巳", "寅申", "巳申", "丑戌", "丑未", "戌未"]);
const SELF_XING = new Set(["辰", "午", "酉", "亥"]);
const SANHE = [
  ["申", "子", "辰"],
  ["亥", "卯", "未"],
  ["寅", "午", "戌"],
  ["巳", "酉", "丑"],
] as const;

function pairKey(a: string, b: string) {
  return [a, b].sort().join("");
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function relationLabels(branches: string[], locale: Locale) {
  const labels: string[] = [];
  const counts = new Map<string, number>();
  branches.forEach((branch) => counts.set(branch, (counts.get(branch) ?? 0) + 1));

  for (const [branch, count] of counts) {
    if (count >= 2 && SELF_XING.has(branch)) {
      labels.push(locale === "en" ? `self-punishment · ${branch}` : locale === "zh-Hans" ? `自刑 · ${branch}` : `自刑 · ${branch}`);
    }
  }

  for (let i = 0; i < branches.length; i += 1) {
    for (let j = i + 1; j < branches.length; j += 1) {
      const a = branches[i], b = branches[j], key = pairKey(a, b);
      if (LIUHE.has(key)) labels.push(locale === "en" ? `六合 · ${a}${b}` : `六合 · ${a}${b}`);
      if (CHONG.has(key)) labels.push(locale === "en" ? `clash · ${a}${b}` : locale === "zh-Hans" ? `相冲 · ${a}${b}` : `相沖 · ${a}${b}`);
      if (HAI.has(key)) labels.push(locale === "en" ? `harm · ${a}${b}` : `相害 · ${a}${b}`);
      if (XING.has(key)) labels.push(locale === "en" ? `punishment · ${a}${b}` : `相刑 · ${a}${b}`);
    }
  }

  const set = new Set(branches);
  SANHE.forEach((group) => {
    if (group.every((branch) => set.has(branch))) {
      labels.push(locale === "en" ? `three-harmony · ${group.join("")}` : `三合 · ${group.join("")}`);
    }
  });

  const compact = unique(labels).slice(0, 5);
  if (compact.length) return compact;
  return [locale === "en" ? "No major natal branch interaction highlighted" : locale === "zh-Hans" ? "原局未突出主要合冲刑害" : "原局未突出主要合沖刑害"];
}

function personaFor(element: Element, tendency: string, relations: string[], locale: Locale) {
  const hasFriction = relations.some((line) => /沖|冲|刑|害|clash|punishment|harm/i.test(line));
  if (hasFriction) return locale === "en" ? "boundary manager" : locale === "zh-Hans" ? "边界管理者" : "邊界管理者";
  if (tendency.includes("旺")) return locale === "en" ? "measured executor" : locale === "zh-Hans" ? "收敛执行者" : "收斂執行者";
  if (tendency.includes("弱")) return locale === "en" ? "gentle executor" : locale === "zh-Hans" ? "温和执行者" : "溫和執行者";
  return PERSONA[locale][element];
}

function coreLine(dayMaster: string, element: Element, monthBranch: string, season: string, tendency: string, useful: Element[], locale: Locale) {
  const support = useful.map((item) => ELEMENT_LABEL[locale][item]).join(locale === "en" ? " + " : "、");
  if (locale === "en") {
    return `${dayMaster} · ${ELEMENT_LABEL.en[element]} day master, born under ${monthBranch} (${season}). The chart trends ${tendency}; the current functional emphasis is ${support || ELEMENT_LABEL.en[element]}. This is structural guidance, not a “replace what is missing” rule.`;
  }
  if (locale === "zh-Hans") {
    return `日主${dayMaster}·${element}，生于${monthBranch}月（${season}令），底盘${tendency}。目前功能层偏向以${support || element}承接；这是结构取向，不按“缺什么补什么”处理。`;
  }
  return `日主${dayMaster}·${element}，生於${monthBranch}月（${season}令），底盤${tendency}。目前功能層偏向以${support || element}承接；這是結構取向，不按「缺什麼補什麼」處理。`;
}

export function buildPersonalPaidProfile(birth: SharedBirthRecord, locale: Locale): PersonalPaidProfileModel {
  const chart = buildChart({ ...birth, question: "personal-paid-profile", locale });
  const season = SEASON_OF_BRANCH[chart.monthBranch] ?? "四季";
  const branches = chart.pillars.filter((pillar) => pillar.ready).map((pillar) => pillar.zhi);
  const relations = relationLabels(branches, locale);
  const useful = chart.useful.length ? chart.useful : [chart.dayMasterElement];
  const drain = chart.drain.length ? chart.drain : [];
  const colorSwatches = useful
    .flatMap((element) => COLORS[locale][element].map((label) => ({ label, hex: ELEMENT_SWATCH[element] })))
    .filter((item, index, all) => all.findIndex((candidate) => candidate.label === item.label) === index)
    .slice(0, 4);
  const colors = colorSwatches.map((item) => item.label);
  const quietColorSwatches = drain
    .flatMap((element) => COLORS[locale][element].map((label) => ({ label, hex: ELEMENT_SWATCH[element] })))
    .filter((item, index, all) => all.findIndex((candidate) => candidate.label === item.label) === index)
    .slice(0, 3);
  const quietColors = quietColorSwatches.map((item) => item.label);
  const materials = unique(useful.flatMap((element) => MATERIALS[locale][element])).slice(0, 4);
  const hours = unique(useful.flatMap((element) => HOURS[locale][element])).slice(0, 4);

  const birthLine = birth.timeUnknown
    ? `${birth.year}-${String(birth.month).padStart(2, "0")}-${String(birth.day).padStart(2, "0")} · ${locale === "en" ? "time unknown" : locale === "zh-Hans" ? "时辰未知" : "時辰未知"} · ${birth.city.display}`
    : `${birth.year}-${String(birth.month).padStart(2, "0")}-${String(birth.day).padStart(2, "0")} · ${String(birth.hour).padStart(2, "0")}:${String(birth.minute).padStart(2, "0")} · ${birth.city.display}`;

  const currentCycle = chart.currentDayun
    ? `${chart.currentDayun.ganZhi} · ${chart.currentDayun.startYear}–${chart.currentDayun.endYear}`
    : locale === "en" ? "Not fixed when birth time / sequence is insufficient" : locale === "zh-Hans" ? "资料不足时不强定大运" : "資料不足時不強定大運";

  const note = locale === "en"
    ? "This premium page is generated only from this customer's saved birth record and calculated chart. It never imports the site owner's chart. Colours, materials and time windows are cultural/functional suggestions, not guarantees of luck."
    : locale === "zh-Hans"
      ? "本页只读取这位客户保存的出生资料与计算命盘，不引用站主命盘。颜色、材质与时段属于文化／功能建议，不作改运或吉凶保证。"
      : "本頁只讀取這位客戶保存的出生資料與計算命盤，不引用站主命盤。顏色、材質與時段屬於文化／功能建議，不作改運或吉凶保證。";

  return {
    birthLine,
    pillars: chart.pillars.map((pillar) => ({
      key: pillar.key,
      label: PILLAR_LABELS[locale][pillar.key] ?? pillar.label,
      ganZhi: pillar.ready ? pillar.ganZhi : (locale === "en" ? "unknown" : locale === "zh-Hans" ? "未定" : "未定"),
      ready: pillar.ready,
    })),
    core: coreLine(chart.dayMaster, chart.dayMasterElement, chart.monthBranch, season, chart.strength.tendency, useful, locale),
    currentCycle,
    relations,
    colors,
    colorSwatches,
    quietColors,
    quietColorSwatches,
    materials,
    hours,
    persona: personaFor(chart.dayMasterElement, chart.strength.tendency, relations, locale),
    note,
  };
}
