import type { Chart, Element } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";

export type ReportVisualTab = "overview" | "day-master" | "season" | "elements";

export type VisualElementRow = {
  element: Element;
  label: string;
  percent: number;
};

export type ReportVisualModel = {
  dayMaster: {
    stem: string;
    title: string;
    element: Element;
    elementLabel: string;
    yinYang: "陰" | "陽";
    yinYangLabel: string;
    visualKey: string;
    imagePath: string;
    imageAlt: string;
    keywords: string[];
    summary: string;
    heavenImage: string;
  };
  season: {
    branch: string;
    title: string;
    seasonLabel: string;
    visualKey: string;
    imagePath: string;
    imageAlt: string;
    startTerm: string;
    endTerm: string;
    summary: string;
  };
  elements: {
    rows: VisualElementRow[];
    strengthLabel: string;
    usefulLabel: string;
    useful: string;
    restraintLabel: string;
    restraint: string;
    provisional: boolean;
    note: string;
  };
};

type DayMeta = {
  element: Element;
  yinYang: "陰" | "陽";
  visualKey: string;
  heaven: Record<Locale, string>;
  keywords: Record<Locale, string[]>;
  summary: Record<Locale, string>;
};

const DAY_META: Record<string, DayMeta> = {
  甲: {
    element: "木", yinYang: "陽", visualKey: "jia-wood",
    heaven: { "zh-Hant": "春木青陽", "zh-Hans": "春木青阳", en: "upright spring growth" },
    keywords: { "zh-Hant": ["生發", "直進", "守節", "承擔"], "zh-Hans": ["生发", "直进", "守节", "承担"], en: ["growth", "direction", "principle", "responsibility"] },
    summary: { "zh-Hant": "甲木取象如挺立之木，重方向與骨架；遇事常先確立原則，再向外生長。", "zh-Hans": "甲木取象如挺立之木，重方向与骨架；遇事常先确立原则，再向外生长。", en: "This pattern is upright and growth-oriented: establish direction first, then build steadily outward." },
  },
  乙: {
    element: "木", yinYang: "陰", visualKey: "yi-wood",
    heaven: { "zh-Hant": "花木柔條", "zh-Hans": "花木柔条", en: "flexible living growth" },
    keywords: { "zh-Hant": ["柔韌", "適應", "細緻", "連結"], "zh-Hans": ["柔韧", "适应", "细致", "连接"], en: ["flexibility", "adaptation", "detail", "connection"] },
    summary: { "zh-Hant": "乙木取象如花藤柔枝，力量不在硬推，而在順勢、連結與持續調整。", "zh-Hans": "乙木取象如花藤柔枝，力量不在硬推，而在顺势、连接与持续调整。", en: "This pattern works through flexibility, connection and repeated adjustment rather than force." },
  },
  丙: {
    element: "火", yinYang: "陽", visualKey: "bing-fire",
    heaven: { "zh-Hant": "日輪晴光", "zh-Hans": "日轮晴光", en: "open daylight" },
    keywords: { "zh-Hant": ["明朗", "主動", "外放", "照應"], "zh-Hans": ["明朗", "主动", "外放", "照应"], en: ["clarity", "initiative", "expression", "warmth"] },
    summary: { "zh-Hant": "丙火取象如日光，傾向把事情照亮、說明與推進；狀態好時行動直接而有感染力。", "zh-Hans": "丙火取象如日光，倾向把事情照亮、说明与推进；状态好时行动直接而有感染力。", en: "This pattern tends to make things visible and move them forward, with direct action and clear expression." },
  },
  丁: {
    element: "火", yinYang: "陰", visualKey: "ding-fire",
    heaven: { "zh-Hant": "燈火星明", "zh-Hans": "灯火星明", en: "focused lamplight" },
    keywords: { "zh-Hant": ["專注", "細察", "內照", "持續"], "zh-Hans": ["专注", "细察", "内照", "持续"], en: ["focus", "observation", "insight", "continuity"] },
    summary: { "zh-Hant": "丁火取象如燈燭微明，重在集中、辨識與持續照見細節，不以聲勢取勝。", "zh-Hans": "丁火取象如灯烛微明，重在集中、辨识与持续照见细节，不以声势取胜。", en: "This pattern is concentrated rather than loud, noticing detail and sustaining attention over time." },
  },
  戊: {
    element: "土", yinYang: "陽", visualKey: "wu-earth",
    heaven: { "zh-Hant": "高山厚土", "zh-Hans": "高山厚土", en: "mountain stability" },
    keywords: { "zh-Hant": ["穩定", "承擔", "邊界", "厚實"], "zh-Hans": ["稳定", "承担", "边界", "厚实"], en: ["stability", "responsibility", "boundaries", "substance"] },
    summary: { "zh-Hant": "戊土取象如山地，重承載、秩序與邊界；通常先求站穩，再處理變化。", "zh-Hans": "戊土取象如山地，重承载、秩序与边界；通常先求站稳，再处理变化。", en: "This pattern favours stability, structure and clear boundaries before responding to change." },
  },
  己: {
    element: "土", yinYang: "陰", visualKey: "ji-earth",
    heaven: { "zh-Hant": "田園沃壤", "zh-Hans": "田园沃壤", en: "cultivated earth" },
    keywords: { "zh-Hant": ["包容", "務實", "滋養", "整合"], "zh-Hans": ["包容", "务实", "滋养", "整合"], en: ["practicality", "support", "cultivation", "integration"] },
    summary: { "zh-Hant": "己土取象如可耕之地，擅長收納零散條件、整理資源，再慢慢養成熟。", "zh-Hans": "己土取象如可耕之地，擅长收纳零散条件、整理资源，再慢慢养成熟。", en: "This pattern gathers scattered conditions, organises resources and develops them patiently." },
  },
  庚: {
    element: "金", yinYang: "陽", visualKey: "geng-metal",
    heaven: { "zh-Hant": "礦鐵鋒刃", "zh-Hans": "矿铁锋刃", en: "ore, iron and a decisive edge" },
    keywords: { "zh-Hant": ["果決", "整頓", "原則", "效率"], "zh-Hans": ["果决", "整顿", "原则", "效率"], en: ["decisiveness", "order", "principle", "efficiency"] },
    summary: { "zh-Hant": "庚金取象重礦鐵、鋒刃、切分與整頓；弦月或殘月的鋒稜可借作庚氣視覺，但不把月亮本體判作庚金，也不據月相判旺衰。", "zh-Hans": "庚金取象重矿铁、锋刃、切分与整顿；弦月或残月的锋棱可借作庚气视觉，但不把月亮本体判作庚金，也不据月相判旺衰。", en: "Geng Metal is shown through ore, iron, edges and decisive cutting. A crescent or waning edge may be borrowed as a visual metaphor, but lunar phase is not used to judge Metal strength." },
  },
  辛: {
    element: "金", yinYang: "陰", visualKey: "xin-metal",
    heaven: { "zh-Hant": "珠玉月華", "zh-Hans": "珠玉月华", en: "jade, pearl and moonlight" },
    keywords: { "zh-Hant": ["精準", "審美", "分辨", "克制"], "zh-Hans": ["精准", "审美", "分辨", "克制"], en: ["precision", "taste", "discernment", "restraint"] },
    summary: { "zh-Hant": "辛金本象取珠玉精金，視覺延伸以月輪、月華表其清冷精微；滿月重清輝與圓成，眉月重初露，弦月與殘月可兼見庚的鋒稜。月相只作命象表現，不據出生月相判金旺衰。", "zh-Hans": "辛金本象取珠玉精金，视觉延伸以月轮、月华表其清冷精微；满月重清辉与圆成，眉月重初露，弦月与残月可兼见庚的锋棱。月相只作命象表现，不据出生月相判金旺衰。", en: "Xin Metal keeps its classical pearl-and-jade core, with the moon and moonlight used as a visual extension for cool refinement. Full, young, crescent and waning forms vary the imagery only; lunar phase never determines Metal strength." },
  },
  壬: {
    element: "水", yinYang: "陽", visualKey: "ren-water",
    heaven: { "zh-Hant": "江河雲海", "zh-Hans": "江河云海", en: "rivers and open water" },
    keywords: { "zh-Hant": ["開闊", "流動", "應變", "連結"], "zh-Hans": ["开阔", "流动", "应变", "连接"], en: ["range", "movement", "adaptation", "connection"] },
    summary: { "zh-Hant": "壬水取象如江河大川，思路常向外延展；優勢在流動、連結與因勢調整。", "zh-Hans": "壬水取象如江河大川，思路常向外延展；优势在流动、连接与因势调整。", en: "This pattern has range and movement, linking information and adjusting quickly as conditions change." },
  },
  癸: {
    element: "水", yinYang: "陰", visualKey: "gui-water",
    heaven: { "zh-Hant": "雨露溪泉", "zh-Hans": "雨露溪泉", en: "rain, mist and springs" },
    keywords: { "zh-Hant": ["細膩", "滲透", "觀察", "醞釀"], "zh-Hans": ["细腻", "渗透", "观察", "酝酿"], en: ["subtlety", "absorption", "observation", "development"] },
    summary: { "zh-Hant": "癸水取象如雨露細流，善於觀察微小變化、吸收資訊，再在內部慢慢形成判斷。", "zh-Hans": "癸水取象如雨露细流，善于观察微小变化、吸收信息，再在内部慢慢形成判断。", en: "This pattern notices small changes, absorbs information and lets a judgement form gradually." },
  },
};

const MONTH_META: Record<string, { visualKey: string; season: Record<Locale, string>; start: Record<Locale, string>; end: Record<Locale, string> }> = {
  寅: { visualKey: "yin-spring", season: { "zh-Hant": "初春", "zh-Hans": "初春", en: "early spring" }, start: { "zh-Hant": "立春", "zh-Hans": "立春", en: "Start of Spring" }, end: { "zh-Hant": "驚蟄", "zh-Hans": "惊蛰", en: "Awakening of Insects" } },
  卯: { visualKey: "mao-spring", season: { "zh-Hant": "仲春", "zh-Hans": "仲春", en: "mid spring" }, start: { "zh-Hant": "驚蟄", "zh-Hans": "惊蛰", en: "Awakening of Insects" }, end: { "zh-Hant": "清明", "zh-Hans": "清明", en: "Clear and Bright" } },
  辰: { visualKey: "chen-spring", season: { "zh-Hant": "暮春", "zh-Hans": "暮春", en: "late spring" }, start: { "zh-Hant": "清明", "zh-Hans": "清明", en: "Clear and Bright" }, end: { "zh-Hant": "立夏", "zh-Hans": "立夏", en: "Start of Summer" } },
  巳: { visualKey: "si-summer", season: { "zh-Hant": "初夏", "zh-Hans": "初夏", en: "early summer" }, start: { "zh-Hant": "立夏", "zh-Hans": "立夏", en: "Start of Summer" }, end: { "zh-Hant": "芒種", "zh-Hans": "芒种", en: "Grain in Ear" } },
  午: { visualKey: "wu-summer", season: { "zh-Hant": "仲夏", "zh-Hans": "仲夏", en: "mid summer" }, start: { "zh-Hant": "芒種", "zh-Hans": "芒种", en: "Grain in Ear" }, end: { "zh-Hant": "小暑", "zh-Hans": "小暑", en: "Minor Heat" } },
  未: { visualKey: "wei-summer", season: { "zh-Hant": "長夏", "zh-Hans": "长夏", en: "late summer" }, start: { "zh-Hant": "小暑", "zh-Hans": "小暑", en: "Minor Heat" }, end: { "zh-Hant": "立秋", "zh-Hans": "立秋", en: "Start of Autumn" } },
  申: { visualKey: "shen-autumn", season: { "zh-Hant": "初秋", "zh-Hans": "初秋", en: "early autumn" }, start: { "zh-Hant": "立秋", "zh-Hans": "立秋", en: "Start of Autumn" }, end: { "zh-Hant": "白露", "zh-Hans": "白露", en: "White Dew" } },
  酉: { visualKey: "you-autumn", season: { "zh-Hant": "仲秋", "zh-Hans": "仲秋", en: "mid autumn" }, start: { "zh-Hant": "白露", "zh-Hans": "白露", en: "White Dew" }, end: { "zh-Hant": "寒露", "zh-Hans": "寒露", en: "Cold Dew" } },
  戌: { visualKey: "xu-autumn", season: { "zh-Hant": "暮秋", "zh-Hans": "暮秋", en: "late autumn" }, start: { "zh-Hant": "寒露", "zh-Hans": "寒露", en: "Cold Dew" }, end: { "zh-Hant": "立冬", "zh-Hans": "立冬", en: "Start of Winter" } },
  亥: { visualKey: "hai-winter", season: { "zh-Hant": "初冬", "zh-Hans": "初冬", en: "early winter" }, start: { "zh-Hant": "立冬", "zh-Hans": "立冬", en: "Start of Winter" }, end: { "zh-Hant": "大雪", "zh-Hans": "大雪", en: "Major Snow" } },
  子: { visualKey: "zi-winter", season: { "zh-Hant": "仲冬", "zh-Hans": "仲冬", en: "mid winter" }, start: { "zh-Hant": "大雪", "zh-Hans": "大雪", en: "Major Snow" }, end: { "zh-Hant": "小寒", "zh-Hans": "小寒", en: "Minor Cold" } },
  丑: { visualKey: "chou-winter", season: { "zh-Hant": "季冬", "zh-Hans": "季冬", en: "late winter" }, start: { "zh-Hant": "小寒", "zh-Hans": "小寒", en: "Minor Cold" }, end: { "zh-Hant": "立春", "zh-Hans": "立春", en: "Start of Spring" } },
};

const ELEMENT_LABEL: Record<Locale, Record<Element, string>> = {
  "zh-Hant": { 木: "木", 火: "火", 土: "土", 金: "金", 水: "水" },
  "zh-Hans": { 木: "木", 火: "火", 土: "土", 金: "金", 水: "水" },
  en: { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" },
};

function joinElements(elements: Element[], locale: Locale): string {
  if (!elements.length) return locale === "en" ? "Not confirmed" : locale === "zh-Hans" ? "未确认" : "未確認";
  return elements.map((element) => ELEMENT_LABEL[locale][element]).join(locale === "en" ? " · " : "、");
}

function dayTitle(stem: string, element: Element, locale: Locale) {
  if (locale === "en") return `Core pattern · ${ELEMENT_LABEL.en[element]}`;
  return `${locale === "zh-Hans" ? "日主" : "日主"}·${stem}`;
}

function seasonTitle(branch: string, locale: Locale) {
  if (locale === "en") return "Birth season";
  return `${locale === "zh-Hans" ? "月令" : "月令"}·${branch}月`;
}

function strengthLabel(chart: Chart, locale: Locale) {
  const tendency = chart.strength?.tendency?.trim();
  if (!tendency) return locale === "en" ? "Overall balance: not confirmed" : locale === "zh-Hans" ? "整体强弱：未确认" : "整體強弱：未確認";
  if (locale === "en") return "Overall balance: calculated from the chart";
  return `${locale === "zh-Hans" ? "整体强弱" : "整體強弱"}：${tendency}`;
}

export function buildReportVisualModel(chart: Chart, locale: Locale): ReportVisualModel {
  const dayMeta = DAY_META[chart.dayMaster] ?? DAY_META.甲;
  const monthMeta = MONTH_META[chart.monthBranch] ?? MONTH_META.寅;
  const elements = (["木", "火", "土", "金", "水"] as Element[]).map((element) => ({
    element,
    label: ELEMENT_LABEL[locale][element],
    percent: Math.max(0, Math.round(Number(chart.elementPercents?.[element] ?? 0))),
  }));

  const provisional = Boolean(chart.usefulProvisional);
  const note = locale === "en"
    ? provisional
      ? "Element percentages are a visual reference only. The current favourable-element result is provisional and must not be treated as a final judgement."
      : "Element percentages are a visual reference only. The judgement also uses season, roots, stems and circulation."
    : locale === "zh-Hans"
      ? provisional
        ? "五行比例只作气势可视化参考；当前喜用结果仍属暂定，不作为最终判断。"
        : "五行比例只作气势可视化参考；判断同时看月令、根气、透干与流通。"
      : provisional
        ? "五行比例只作氣勢可視化參考；當前喜用結果仍屬暫定，不作為最終判斷。"
        : "五行比例只作氣勢可視化參考；判斷同時看月令、根氣、透干與流通。";

  const seasonSummary = locale === "en"
    ? `Your birth month falls in the ${monthMeta.season.en} interval, from ${monthMeta.start.en} to ${monthMeta.end.en}. This card describes the seasonal context used by the chart rather than reducing it to a simple four-season label.`
    : locale === "zh-Hans"
      ? `你的出生月令落在${monthMeta.season["zh-Hans"]}，节气区间由${monthMeta.start["zh-Hans"]}至${monthMeta.end["zh-Hans"]}。这一页呈现排盘采用的时令背景，不只用“春夏秋冬”粗分。`
      : `你的出生月令落在${monthMeta.season["zh-Hant"]}，節氣區間由${monthMeta.start["zh-Hant"]}至${monthMeta.end["zh-Hant"]}。這一頁呈現排盤採用的時令背景，不只用「春夏秋冬」粗分。`;

  return {
    dayMaster: {
      stem: chart.dayMaster,
      title: dayTitle(chart.dayMaster, dayMeta.element, locale),
      element: dayMeta.element,
      elementLabel: ELEMENT_LABEL[locale][dayMeta.element],
      yinYang: dayMeta.yinYang,
      yinYangLabel: locale === "en" ? (dayMeta.yinYang === "陽" ? "Yang" : "Yin") : dayMeta.yinYang,
      visualKey: dayMeta.visualKey,
      imagePath: `/report-visuals/day-master/${dayMeta.visualKey}.webp`,
      imageAlt: locale === "en" ? `${ELEMENT_LABEL.en[dayMeta.element]} symbolic landscape` : `${chart.dayMaster}${dayMeta.element}命象圖`,
      keywords: dayMeta.keywords[locale],
      summary: dayMeta.summary[locale],
      heavenImage: dayMeta.heaven[locale],
    },
    season: {
      branch: chart.monthBranch,
      title: seasonTitle(chart.monthBranch, locale),
      seasonLabel: monthMeta.season[locale],
      visualKey: monthMeta.visualKey,
      imagePath: `/report-visuals/month/${monthMeta.visualKey}.webp`,
      imageAlt: locale === "en" ? `${monthMeta.season.en} seasonal landscape` : `${chart.monthBranch}月${monthMeta.season[locale]}時令圖`,
      startTerm: monthMeta.start[locale],
      endTerm: monthMeta.end[locale],
      summary: seasonSummary,
    },
    elements: {
      rows: elements,
      strengthLabel: strengthLabel(chart, locale),
      usefulLabel: locale === "en" ? "Favourable tendency" : locale === "zh-Hans" ? "喜用参考" : "喜用參考",
      useful: joinElements(chart.useful ?? [], locale),
      restraintLabel: locale === "en" ? "Use with restraint" : locale === "zh-Hans" ? "需节制" : "需節制",
      restraint: joinElements(chart.drain ?? [], locale),
      provisional,
      note,
    },
  };
}
