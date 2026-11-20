import type { AppLocale, Chart, Element } from "@/lib/bazi/types";

type LocalizedText = Record<AppLocale, string>;

type TeaVector = {
  fresh: number;
  floral: number;
  roast: number;
  fruit: number;
  body: number;
  bite: number;
  warmth: number;
};

type TeaFunction = "warm" | "clarify" | "open" | "contain" | "circulate" | "ground" | "settle";

export type TeaProfile = {
  id: string;
  name: LocalizedText;
  origin: LocalizedText;
  category: LocalizedText;
  guardian: LocalizedText;
  note: LocalizedText;
  image: string;
  vector: TeaVector;
  caffeine: number;
  moments: Array<"morning" | "allDay" | "afterMeal" | "evening">;
  functions: Record<TeaFunction, number>;
};

const t = (hant: string, hans: string, en: string): LocalizedText => ({ "zh-Hant": hant, "zh-Hans": hans, en });
const ELEMENT_EN: Record<Element, string> = { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" };

export const TEA_CATALOG: TeaProfile[] = [
  {
    id: "dahongpao", name: t("武夷山大紅袍", "武夷山大红袍", "Wuyi Da Hong Pao"), origin: t("福建・武夷山", "福建・武夷山", "Wuyi Mountains, Fujian"), category: t("武夷岩茶", "武夷岩茶", "Wuyi rock oolong"), guardian: t("岩骨茶仙", "岩骨茶仙", "Guardian of Rock Rhyme"), note: t("岩韻深、焙火明、湯感厚；適合偏愛沉穩與層次的人。", "岩韵深、焙火明、汤感厚；适合偏爱沉稳与层次的人。", "Deep mineral character, clear roast and a layered, full cup."), image: "/tea-guardians/dahongpao.webp",
    vector: { fresh: 1, floral: 3, roast: 5, fruit: 3, body: 5, bite: 3, warmth: 5 }, caffeine: 4, moments: ["morning", "afterMeal"], functions: { warm: 5, clarify: 1, open: 2, contain: 4, circulate: 4, ground: 5, settle: 3 },
  },
  {
    id: "tieguanyin", name: t("安溪鐵觀音", "安溪铁观音", "Anxi Tie Guan Yin"), origin: t("福建・安溪", "福建・安溪", "Anxi, Fujian"), category: t("閩南烏龍", "闽南乌龙", "Southern Fujian oolong"), guardian: t("蘭韻茶仙", "兰韵茶仙", "Guardian of Orchid Aroma"), note: t("蘭香高、口感清圓，適合希望香氣清楚又不過分厚重的人。", "兰香高、口感清圆，适合希望香气清楚又不过分厚重的人。", "High orchid aroma with a rounded, clean body."), image: "/tea-guardians/tieguanyin.webp",
    vector: { fresh: 4, floral: 5, roast: 2, fruit: 3, body: 3, bite: 2, warmth: 3 }, caffeine: 3, moments: ["morning", "allDay"], functions: { warm: 2, clarify: 4, open: 5, contain: 2, circulate: 5, ground: 2, settle: 3 },
  },
  {
    id: "zhengshan-xiaozhong", name: t("武夷正山小種", "武夷正山小种", "Wuyi Zhengshan Xiaozhong"), origin: t("福建・桐木關", "福建・桐木关", "Tongmuguan, Fujian"), category: t("傳統紅茶", "传统红茶", "Traditional black tea"), guardian: t("松煙暖世茶仙", "松烟暖世茶仙", "Guardian of Pine Smoke"), note: t("松煙、桂圓與暖甜感明顯，適合喜歡溫厚煙香的人。", "松烟、桂圆与暖甜感明显，适合喜欢温厚烟香的人。", "Pine smoke, longan-like fruit and a warm, mellow finish."), image: "/tea-guardians/zhengshan-xiaozhong.webp",
    vector: { fresh: 1, floral: 1, roast: 5, fruit: 4, body: 4, bite: 2, warmth: 5 }, caffeine: 4, moments: ["morning", "afterMeal"], functions: { warm: 5, clarify: 1, open: 2, contain: 4, circulate: 3, ground: 5, settle: 4 },
  },
  {
    id: "wuyi-rougui", name: t("武夷肉桂", "武夷肉桂", "Wuyi Rou Gui"), origin: t("福建・武夷山", "福建・武夷山", "Wuyi Mountains, Fujian"), category: t("武夷岩茶", "武夷岩茶", "Wuyi rock oolong"), guardian: t("桂火茶仙", "桂火茶仙", "Guardian of Cassia Fire"), note: t("辛桂香、高揚岩韻與較強骨架，適合要勁度與存在感的人。", "辛桂香、高扬岩韵与较强骨架，适合要劲度与存在感的人。", "A vivid cassia aroma, firm structure and assertive mineral finish."), image: "/tea-guardians/wuyi-rougui.webp",
    vector: { fresh: 1, floral: 3, roast: 5, fruit: 3, body: 5, bite: 4, warmth: 5 }, caffeine: 4, moments: ["morning", "afterMeal"], functions: { warm: 5, clarify: 2, open: 4, contain: 3, circulate: 5, ground: 4, settle: 2 },
  },
  {
    id: "wuyi-shuixian", name: t("武夷水仙", "武夷水仙", "Wuyi Shui Xian"), origin: t("福建・武夷山", "福建・武夷山", "Wuyi Mountains, Fujian"), category: t("武夷岩茶", "武夷岩茶", "Wuyi rock oolong"), guardian: t("老樅茶仙", "老丛茶仙", "Guardian of Old Bushes"), note: t("木質、蘭香與醇厚湯感並重，適合喜歡沉靜耐泡的人。", "木质、兰香与醇厚汤感并重，适合喜欢沉静耐泡的人。", "Woody depth, orchid notes and a calm, lasting body."), image: "/tea-guardians/wuyi-shuixian.webp",
    vector: { fresh: 2, floral: 3, roast: 4, fruit: 2, body: 5, bite: 2, warmth: 4 }, caffeine: 4, moments: ["allDay", "afterMeal"], functions: { warm: 4, clarify: 2, open: 2, contain: 5, circulate: 3, ground: 5, settle: 5 },
  },
  {
    id: "jinjunmei", name: t("桐木關金駿眉", "桐木关金骏眉", "Tongmuguan Jin Jun Mei"), origin: t("福建・桐木關", "福建・桐木关", "Tongmuguan, Fujian"), category: t("芽頭紅茶", "芽头红茶", "Bud black tea"), guardian: t("春陽蜜韻茶仙", "春阳蜜韵茶仙", "Guardian of Honeyed Spring"), note: t("花果蜜香明顯、湯感柔甜，適合喜歡明亮紅茶而不愛煙味的人。", "花果蜜香明显、汤感柔甜，适合喜欢明亮红茶而不爱烟味的人。", "Bright honeyed fruit and a soft, polished black-tea body."), image: "/tea-guardians/jinjunmei.webp",
    vector: { fresh: 2, floral: 4, roast: 2, fruit: 5, body: 4, bite: 2, warmth: 4 }, caffeine: 4, moments: ["morning", "allDay"], functions: { warm: 4, clarify: 3, open: 4, contain: 3, circulate: 4, ground: 3, settle: 3 },
  },
  {
    id: "baihao-yinzhen", name: t("福鼎白毫銀針", "福鼎白毫银针", "Fuding Baihao Yinzhen"), origin: t("福建・福鼎", "福建・福鼎", "Fuding, Fujian"), category: t("白茶", "白茶", "White tea"), guardian: t("霜毫茶仙", "霜毫茶仙", "Guardian of Silver Buds"), note: t("毫香、清甜與輕柔感突出，適合偏愛乾淨細緻的人。", "毫香、清甜与轻柔感突出，适合偏爱干净细致的人。", "Clean silver-bud sweetness with a very light, fine texture."), image: "/tea-guardians/baihao-yinzhen.webp",
    vector: { fresh: 5, floral: 3, roast: 1, fruit: 2, body: 2, bite: 1, warmth: 1 }, caffeine: 3, moments: ["morning", "allDay"], functions: { warm: 1, clarify: 5, open: 3, contain: 2, circulate: 3, ground: 1, settle: 5 },
  },
  {
    id: "bai-mudan", name: t("福鼎白牡丹", "福鼎白牡丹", "Fuding Bai Mudan"), origin: t("福建・福鼎", "福建・福鼎", "Fuding, Fujian"), category: t("白茶", "白茶", "White tea"), guardian: t("玲瓏茶仙", "玲珑茶仙", "Guardian of White Peony"), note: t("花香、鮮甜與葉片厚度平衡，比銀針更有內容但仍清柔。", "花香、鲜甜与叶片厚度平衡，比银针更有内容但仍清柔。", "Floral freshness with more leaf texture than silver-needle white tea."), image: "/tea-guardians/bai-mudan.webp",
    vector: { fresh: 4, floral: 4, roast: 1, fruit: 3, body: 3, bite: 1, warmth: 2 }, caffeine: 3, moments: ["allDay", "evening"], functions: { warm: 1, clarify: 5, open: 4, contain: 3, circulate: 3, ground: 2, settle: 5 },
  },
  {
    id: "fuzhou-jasmine", name: t("福州茉莉花茶", "福州茉莉花茶", "Fuzhou Jasmine Tea"), origin: t("福建・福州", "福建・福州", "Fuzhou, Fujian"), category: t("窨製花茶", "窨制花茶", "Scented jasmine tea"), guardian: t("天香茶仙", "天香茶仙", "Guardian of Hidden Jasmine"), note: t("茉莉幽香清楚、茶體輕快，適合最重視香氣與清新感的人。", "茉莉幽香清楚、茶体轻快，适合最重视香气与清新感的人。", "A lifted jasmine fragrance over a clean, agile tea base."), image: "/tea-guardians/fuzhou-jasmine.webp",
    vector: { fresh: 5, floral: 5, roast: 1, fruit: 2, body: 2, bite: 2, warmth: 1 }, caffeine: 3, moments: ["morning", "allDay"], functions: { warm: 1, clarify: 5, open: 5, contain: 1, circulate: 5, ground: 1, settle: 3 },
  },
  {
    id: "baijiguan", name: t("武夷白雞冠", "武夷白鸡冠", "Wuyi Bai Ji Guan"), origin: t("福建・武夷山", "福建・武夷山", "Wuyi Mountains, Fujian"), category: t("武夷名叢", "武夷名丛", "Wuyi heritage oolong"), guardian: t("雪冠茶仙", "雪冠茶仙", "Guardian of the Pale Crown"), note: t("清甜、草木與輕焙並存，是岩茶中較明亮柔和的一支。", "清甜、草木与轻焙并存，是岩茶中较明亮柔和的一支。", "A brighter rock tea with soft roast, herbs and clean sweetness."), image: "/tea-guardians/baijiguan.webp",
    vector: { fresh: 4, floral: 4, roast: 2, fruit: 2, body: 3, bite: 2, warmth: 2 }, caffeine: 3, moments: ["morning", "allDay"], functions: { warm: 2, clarify: 5, open: 4, contain: 2, circulate: 4, ground: 2, settle: 4 },
  },
  {
    id: "tieluohan", name: t("武夷鐵羅漢", "武夷铁罗汉", "Wuyi Tie Luo Han"), origin: t("福建・武夷山", "福建・武夷山", "Wuyi Mountains, Fujian"), category: t("武夷名叢", "武夷名丛", "Wuyi heritage oolong"), guardian: t("丹岩茶仙", "丹岩茶仙", "Guardian of the Iron Arhat Tea"), note: t("焙火、藥香與厚實岩韻明顯，適合偏愛深沉老派岩茶的人。", "焙火、药香与厚实岩韵明显，适合偏爱深沉老派岩茶的人。", "Deep roast, herbal notes and a dense, old-school mineral body."), image: "/tea-guardians/tieluohan.webp",
    vector: { fresh: 1, floral: 2, roast: 5, fruit: 2, body: 5, bite: 4, warmth: 5 }, caffeine: 4, moments: ["afterMeal"], functions: { warm: 5, clarify: 1, open: 2, contain: 5, circulate: 3, ground: 5, settle: 4 },
  },
  {
    id: "longjing", name: t("西湖龍井", "西湖龙井", "West Lake Longjing"), origin: t("浙江・杭州", "浙江・杭州", "Hangzhou, Zhejiang"), category: t("炒青綠茶", "炒青绿茶", "Pan-fired green tea"), guardian: t("清和茶仙", "清和茶仙", "Guardian of Clear Harmony"), note: t("豆香、嫩鮮與清爽感明確，適合喜歡乾淨俐落綠茶的人。", "豆香、嫩鲜与清爽感明确，适合喜欢干净利落绿茶的人。", "Clean pan-fired freshness with a soft chestnut-like aroma."), image: "/tea-guardians/longjing.webp",
    vector: { fresh: 5, floral: 2, roast: 1, fruit: 2, body: 2, bite: 2, warmth: 1 }, caffeine: 3, moments: ["morning", "allDay"], functions: { warm: 1, clarify: 5, open: 4, contain: 2, circulate: 4, ground: 2, settle: 3 },
  },
  {
    id: "biluochun", name: t("洞庭山碧螺春", "洞庭山碧螺春", "Dongting Biluochun"), origin: t("江蘇・蘇州洞庭山", "江苏・苏州洞庭山", "Dongting Hills, Jiangsu"), category: t("卷曲綠茶", "卷曲绿茶", "Curled green tea"), guardian: t("果木春茶仙", "果木春茶仙", "Guardian of Orchard Spring"), note: t("花果香、嫩鮮與輕盈感兼具，適合喜歡江南細秀氣的人。", "花果香、嫩鲜与轻盈感兼具，适合喜欢江南细秀气的人。", "Fine spring freshness with floral-fruit lift from an orchard landscape."), image: "/tea-guardians/biluochun.webp",
    vector: { fresh: 5, floral: 4, roast: 1, fruit: 4, body: 2, bite: 2, warmth: 1 }, caffeine: 3, moments: ["morning", "allDay"], functions: { warm: 1, clarify: 5, open: 5, contain: 1, circulate: 5, ground: 1, settle: 3 },
  },
  {
    id: "qimen", name: t("祁門工夫紅茶", "祁门工夫红茶", "Keemun Gongfu"), origin: t("安徽・祁門", "安徽・祁门", "Qimen, Anhui"), category: t("工夫紅茶", "工夫红茶", "Gongfu black tea"), guardian: t("祁香茶仙", "祁香茶仙", "Guardian of Keemun Aroma"), note: t("花、果與蜜香細緻，紅茶骨架優雅，適合要香氣也要穩定感的人。", "花、果与蜜香细致，红茶骨架优雅，适合要香气也要稳定感的人。", "Refined floral, fruit and honey notes over an elegant black-tea frame."), image: "/tea-guardians/qimen.webp",
    vector: { fresh: 2, floral: 4, roast: 2, fruit: 5, body: 4, bite: 2, warmth: 4 }, caffeine: 4, moments: ["morning", "allDay"], functions: { warm: 4, clarify: 3, open: 4, contain: 4, circulate: 4, ground: 4, settle: 4 },
  },
  {
    id: "laobanzhang-puer", name: t("老班章古樹生普", "老班章古树生普", "Lao Banzhang Raw Pu'er"), origin: t("雲南・勐海", "云南・勐海", "Menghai, Yunnan"), category: t("古樹生普", "古树生普", "Old-tree raw pu'er"), guardian: t("山野茶王", "山野茶王", "Guardian of Mountain Force"), note: t("苦底、回甘、山野氣與厚度都強，適合能接受勁度與轉化感的人。", "苦底、回甘、山野气与厚度都强，适合能接受劲度与转化感的人。", "Powerful bitterness, returning sweetness and a dense mountain character."), image: "/tea-guardians/laobanzhang-puer.webp",
    vector: { fresh: 3, floral: 2, roast: 1, fruit: 2, body: 5, bite: 5, warmth: 3 }, caffeine: 5, moments: ["morning", "afterMeal"], functions: { warm: 2, clarify: 4, open: 5, contain: 4, circulate: 5, ground: 4, settle: 2 },
  },
  {
    id: "taiping-houkui", name: t("太平猴魁", "太平猴魁", "Taiping Houkui"), origin: t("安徽・黃山猴坑", "安徽・黄山猴坑", "Houkeng, Huangshan, Anhui"), category: t("名優綠茶", "名优绿茶", "Premium green tea"), guardian: t("雲霧茶仙", "云雾茶仙", "Guardian of Mountain Mist"), note: t("蘭香、長葉與清峻感突出，適合喜歡高山綠茶骨架的人。", "兰香、长叶与清峻感突出，适合喜欢高山绿茶骨架的人。", "Orchid lift, long leaves and a clear high-mountain structure."), image: "/tea-guardians/taiping-houkui.webp",
    vector: { fresh: 5, floral: 3, roast: 1, fruit: 2, body: 3, bite: 3, warmth: 1 }, caffeine: 4, moments: ["morning", "allDay"], functions: { warm: 1, clarify: 5, open: 4, contain: 2, circulate: 4, ground: 2, settle: 3 },
  },
];

export type TeaQuizAnswers = {
  aroma?: "floral" | "roast" | "fruit" | "fresh";
  body?: "light" | "balanced" | "full";
  bite?: "soft" | "medium" | "strong";
  warmth?: "cool" | "neutral" | "warm";
  caffeine?: "sensitive" | "normal" | "robust";
  moment?: "morning" | "allDay" | "afterMeal" | "evening";
  intention?: "focus" | "calm" | "comfort" | "explore";
};

export const REQUIRED_TEA_QUIZ_KEYS: Array<keyof TeaQuizAnswers> = ["aroma", "body", "bite", "warmth", "caffeine", "moment", "intention"];

export function teaQuizComplete(answers: TeaQuizAnswers): boolean {
  return REQUIRED_TEA_QUIZ_KEYS.every((key) => Boolean(answers[key]));
}

function distanceScore(actual: number, target: number): number {
  return 5 - Math.abs(actual - target);
}

function tasteScore(tea: TeaProfile, answers: TeaQuizAnswers): number {
  let score = 0;
  let weights = 0;
  if (answers.aroma) {
    const axis = answers.aroma === "floral" ? "floral" : answers.aroma === "roast" ? "roast" : answers.aroma === "fruit" ? "fruit" : "fresh";
    score += tea.vector[axis] * 3;
    weights += 3;
  }
  if (answers.body) {
    score += distanceScore(tea.vector.body, answers.body === "light" ? 1 : answers.body === "balanced" ? 3 : 5) * 2;
    weights += 2;
  }
  if (answers.bite) {
    score += distanceScore(tea.vector.bite, answers.bite === "soft" ? 1 : answers.bite === "medium" ? 3 : 5) * 2;
    weights += 2;
  }
  return weights ? score / weights : 0;
}

function lifestyleScore(tea: TeaProfile, answers: TeaQuizAnswers): number {
  let score = 0;
  let weights = 0;
  if (answers.warmth) {
    score += distanceScore(tea.vector.warmth, answers.warmth === "cool" ? 1 : answers.warmth === "neutral" ? 3 : 5) * 2;
    weights += 2;
  }
  if (answers.caffeine) {
    score += distanceScore(tea.caffeine, answers.caffeine === "sensitive" ? 1 : answers.caffeine === "normal" ? 3 : 5) * 2;
    weights += 2;
  }
  if (answers.moment) {
    score += tea.moments.includes(answers.moment) ? 5 : 2;
    weights += 1;
  }
  if (answers.intention) {
    const functionKey: TeaFunction = answers.intention === "focus" ? "clarify" : answers.intention === "calm" ? "settle" : answers.intention === "comfort" ? "ground" : "open";
    score += tea.functions[functionKey] * 2;
    weights += 2;
  }
  return weights ? score / weights : 0;
}

function elementFunction(element: Element): TeaFunction {
  if (element === "火") return "warm";
  if (element === "木") return "open";
  if (element === "土") return "ground";
  if (element === "金") return "clarify";
  return "settle";
}

type ChartPreference = { targets: Record<TeaFunction, number>; evidence: LocalizedText[] };

function chartPreference(chart: Chart): ChartPreference {
  const targets: Record<TeaFunction, number> = { warm: 1, clarify: 1, open: 1, contain: 1, circulate: 1, ground: 1, settle: 1 };
  const evidence: LocalizedText[] = [];

  for (const element of chart.useful) {
    const fn = elementFunction(element);
    targets[fn] += 2;
    if (element === "火") targets.circulate += 1;
    if (element === "土") targets.contain += 1;
    if (element === "水") targets.clarify += 1;
  }
  if (chart.useful.length) evidence.push(t(
    `流通候選：${chart.useful.join("、")}${chart.usefulProvisional ? "（仍屬候選）" : ""}`,
    `流通候选：${chart.useful.join("、")}${chart.usefulProvisional ? "（仍属候选）" : ""}`,
    `Provisional flow candidates: ${chart.useful.map((element) => ELEMENT_EN[element]).join(", ")}${chart.usefulProvisional ? " (still provisional)" : ""}.`,
  ));

  if (/[亥子丑]/.test(chart.monthBranch)) {
    targets.warm += 3;
    targets.ground += 1;
    evidence.push(t("月令偏寒，茶型優先看溫潤與承托，不等於直接補某個五行。", "月令偏寒，茶型优先看温润与承托，不等于直接补某个五行。", "The Month Command is on the cooler side, so the match favours warmth and steadiness rather than mechanically ‘adding an element’."));
  } else if (/[巳午未]/.test(chart.monthBranch)) {
    targets.clarify += 3;
    targets.settle += 2;
    evidence.push(t("月令偏暖，茶型優先看清和與收斂，避免一味加重焙火。", "月令偏暖，茶型优先看清和与收敛，避免一味加重焙火。", "The Month Command is on the warmer side, so the match favours clarity and restraint over heavier roast."));
  } else if (/[寅卯辰]/.test(chart.monthBranch)) {
    targets.open += 2;
    targets.circulate += 2;
    evidence.push(t("月令偏向生發，茶型優先看香氣展開與流動感。", "月令偏向生发，茶型优先看香气展开与流动感。", "The Month Command leans toward emergence, so the match favours aromatic lift and movement."));
  } else {
    targets.ground += 2;
    targets.contain += 2;
    evidence.push(t("月令偏向收束，茶型優先看穩定、厚度與回味。", "月令偏向收束，茶型优先看稳定、厚度与回味。", "The Month Command leans toward consolidation, so the match favours steadiness, body and finish."));
  }

  if (chart.strength.tendency.includes("偏強") || chart.strength.tendency.includes("身強")) {
    targets.circulate += 2;
    targets.open += 1;
    evidence.push(t("旺衰底盤偏有力，優先選能打開香氣與流動的茶型。", "旺衰底盘偏有力，优先选能打开香气与流动的茶型。", "The strength baseline is more forceful, so the match gives extra weight to lift and circulation."));
  } else if (chart.strength.tendency.includes("偏弱") || chart.strength.tendency.includes("身弱")) {
    targets.ground += 2;
    targets.contain += 1;
    evidence.push(t("旺衰底盤偏弱，優先選較平穩、少刺激的茶型。", "旺衰底盘偏弱，优先选较平稳、少刺激的茶型。", "The strength baseline is more delicate, so the match gives extra weight to steadier, less aggressive profiles."));
  }

  return { targets, evidence };
}

function chartScore(tea: TeaProfile, chart: Chart): number {
  const { targets } = chartPreference(chart);
  return (Object.keys(targets) as TeaFunction[]).reduce((sum, key) => sum + targets[key] * tea.functions[key], 0);
}

function topTea(score: (tea: TeaProfile) => number): TeaProfile {
  return [...TEA_CATALOG].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))[0];
}

export type TeaRecommendation = {
  taste: TeaProfile;
  current: TeaProfile;
  guardian: TeaProfile | null;
  chartEvidence: LocalizedText[];
};

export function recommendTea(answers: TeaQuizAnswers, chart?: Chart | null): TeaRecommendation {
  const taste = topTea((tea) => tasteScore(tea, answers));
  const current = topTea((tea) => tasteScore(tea, answers) * 0.55 + lifestyleScore(tea, answers) * 0.45);
  const preference = chart ? chartPreference(chart) : null;
  const guardian = chart ? topTea((tea) => chartScore(tea, chart) + tasteScore(tea, answers) * 0.35) : null;
  return { taste, current, guardian, chartEvidence: preference?.evidence ?? [] };
}

export function recommendGuardianFromChart(chart: Chart): TeaRecommendation {
  return recommendTea({}, chart);
}

export function localizeTea(tea: TeaProfile, locale: AppLocale) {
  return {
    ...tea,
    name: tea.name[locale],
    origin: tea.origin[locale],
    category: tea.category[locale],
    guardian: tea.guardian[locale],
    note: tea.note[locale],
  };
}
