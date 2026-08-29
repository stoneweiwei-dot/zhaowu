import type { Chart, Element } from "@/lib/bazi/types";
import type { GalleryAsset } from "@/lib/gallery-assets";
import type { GalleryArtKnowledge, GalleryReasonLocale } from "@/lib/gallery-match";

type Theme = "love" | "travel" | "finance" | "health" | "destiny" | "general";

type SymbolMeaning = {
  re: RegExp;
  label: Record<GalleryReasonLocale, string>;
  meaning: Record<GalleryReasonLocale, string>;
};

const LOVE_RE = /(感情|戀愛|恋爱|正緣|正缘|婚姻|伴侶|伴侣|關係|关系|桃花|love|relationship|partner)/i;
const TRAVEL_RE = /(旅行|旅遊|旅游|出行|出國|出国|搬家|城市|國家|国家|方向|度假|假期|行程|旅程|travel|trip|vacation|holiday|journey|tour|move|city|country)/i;
const FINANCE_RE = /(財|财|收入|資源|资源|金錢|金钱|工作|事業|事业|money|finance|income|career|work)/i;
const HEALTH_RE = /(健康|清理|淨化|净化|修復|修复|療癒|疗愈|身體|身体|health|healing|recover|wellbeing)/i;
const DESTINY_RE = /(格局|命格|命局|命理|亮點|亮点|八字|命盤|命盘|自己|性格|人生|destiny|chart|self|life)/i;

const NEED_COPY: Record<Element, Record<GalleryReasonLocale, string>> = {
  木: {
    "zh-Hant": "把事情重新往前推，讓新的可能長出來",
    "zh-Hans": "把事情重新往前推，让新的可能长出来",
    en: "move forward and let new options grow",
  },
  火: {
    "zh-Hant": "把意圖說清楚，真正付諸行動",
    "zh-Hans": "把意图说清楚，真正付诸行动",
    en: "make your intention clear and act on it",
  },
  土: {
    "zh-Hant": "先穩住節奏與承載力",
    "zh-Hans": "先稳住节奏与承载力",
    en: "steady the pace and build a firmer base",
  },
  金: {
    "zh-Hant": "收掉雜訊，做出明確取捨",
    "zh-Hans": "收掉杂讯，做出明确取舍",
    en: "cut through noise and make a clear choice",
  },
  水: {
    "zh-Hant": "保留彈性，讓事情重新流動",
    "zh-Hans": "保留弹性，让事情重新流动",
    en: "stay flexible and let things move again",
  },
};

const SYMBOLS: SymbolMeaning[] = [
  {
    re: /(馬|马|horse)/i,
    label: { "zh-Hant": "馬", "zh-Hans": "马", en: "horse" },
    meaning: {
      "zh-Hant": "迅速推進、把停住的事重新帶動起來",
      "zh-Hans": "迅速推进、把停住的事重新带动起来",
      en: "forward motion and getting a stalled situation moving again",
    },
  },
  {
    re: /(明王|護法|护法|guardian|protector)/i,
    label: { "zh-Hant": "護法／明王", "zh-Hans": "护法／明王", en: "guardian imagery" },
    meaning: {
      "zh-Hant": "守住界線、清掉阻力，不再被外界牽著走",
      "zh-Hans": "守住界线、清掉阻力，不再被外界牵着走",
      en: "firmer boundaries and clearing what keeps pulling you off course",
    },
  },
  {
    re: /(觀音|观音|菩薩|菩萨|guanyin|bodhisattva)/i,
    label: { "zh-Hant": "觀音／菩薩", "zh-Hans": "观音／菩萨", en: "bodhisattva imagery" },
    meaning: {
      "zh-Hant": "讓力量回到慈悲與穩定，不把行動變成躁進",
      "zh-Hans": "让力量回到慈悲与稳定，不把行动变成躁进",
      en: "keeping strength calm and humane instead of turning it into haste",
    },
  },
  {
    re: /(劍|剑|sword)/i,
    label: { "zh-Hant": "劍", "zh-Hans": "剑", en: "sword" },
    meaning: {
      "zh-Hant": "斷疑、取捨、做出清楚決定",
      "zh-Hans": "断疑、取舍、做出清楚决定",
      en: "cutting through doubt and making a clean decision",
    },
  },
  {
    re: /(火焰|烈火|flame|fire)/i,
    label: { "zh-Hant": "火焰", "zh-Hans": "火焰", en: "flame" },
    meaning: {
      "zh-Hant": "把壓力與混亂收束成意志和行動",
      "zh-Hans": "把压力与混乱收束成意志和行动",
      en: "turning pressure and confusion into focused action",
    },
  },
  {
    re: /(蓮|莲|lotus)/i,
    label: { "zh-Hant": "蓮", "zh-Hans": "莲", en: "lotus" },
    meaning: {
      "zh-Hant": "從混亂裡重新長出秩序與清明",
      "zh-Hans": "从混乱里重新长出秩序与清明",
      en: "regaining clarity and order from a messy situation",
    },
  },
  {
    re: /(龍|龙|dragon)/i,
    label: { "zh-Hant": "龍", "zh-Hans": "龙", en: "dragon" },
    meaning: {
      "zh-Hant": "把分散的力量收回來，準備轉勢",
      "zh-Hans": "把分散的力量收回来，准备转势",
      en: "gathering scattered strength before a change in direction",
    },
  },
  {
    re: /(雲|云|cloud)/i,
    label: { "zh-Hant": "雲", "zh-Hans": "云", en: "cloud" },
    meaning: {
      "zh-Hant": "接受過渡與變動，不急著把一切定死",
      "zh-Hans": "接受过渡与变动，不急着把一切定死",
      en: "allowing transition without forcing everything to be settled immediately",
    },
  },
  {
    re: /(山|mountain)/i,
    label: { "zh-Hant": "山", "zh-Hans": "山", en: "mountain" },
    meaning: {
      "zh-Hant": "定住重心，先穩再動",
      "zh-Hans": "定住重心，先稳再动",
      en: "finding a stable centre before making the next move",
    },
  },
  {
    re: /(水|川|river|water)/i,
    label: { "zh-Hant": "水／川", "zh-Hans": "水／川", en: "water" },
    meaning: {
      "zh-Hant": "順勢調整，讓卡住的地方重新流動",
      "zh-Hans": "顺势调整，让卡住的地方重新流动",
      en: "adapting to conditions and getting stuck areas moving again",
    },
  },
  {
    re: /(月|moon)/i,
    label: { "zh-Hant": "月", "zh-Hans": "月", en: "moon" },
    meaning: {
      "zh-Hant": "把注意力收回內在節奏，不被外界噪音帶走",
      "zh-Hans": "把注意力收回内在节奏，不被外界噪音带走",
      en: "returning attention to your own pace instead of outside noise",
    },
  },
  {
    re: /(結|结|knot)/i,
    label: { "zh-Hant": "結", "zh-Hans": "结", en: "knot" },
    meaning: {
      "zh-Hant": "看清連結、承諾與界線之間的關係",
      "zh-Hans": "看清连接、承诺与界线之间的关系",
      en: "seeing the connection between attachment, commitment and boundaries",
    },
  },
  {
    re: /(鶴|鹤|crane)/i,
    label: { "zh-Hant": "鶴", "zh-Hans": "鹤", en: "crane" },
    meaning: {
      "zh-Hant": "拉高視角，不困在眼前一小段得失裡",
      "zh-Hans": "拉高视角，不困在眼前一小段得失里",
      en: "taking a wider view instead of getting trapped in the immediate outcome",
    },
  },
  {
    re: /(寶瓶|宝瓶|vase)/i,
    label: { "zh-Hant": "寶瓶", "zh-Hans": "宝瓶", en: "vase" },
    meaning: {
      "zh-Hant": "把資源收好、留住，再慢慢累積",
      "zh-Hans": "把资源收好、留住，再慢慢累积",
      en: "holding on to resources and building them steadily",
    },
  },
  {
    re: /(寶|宝|treasure|玉|jade|gold|金)/i,
    label: { "zh-Hant": "寶物／玉石", "zh-Hans": "宝物／玉石", en: "treasure or jade" },
    meaning: {
      "zh-Hant": "辨認真正有價值的東西，不把力氣花在次要處",
      "zh-Hans": "辨认真正有价值的东西，不把力气花在次要处",
      en: "recognising what is genuinely valuable and not wasting effort on the secondary",
    },
  },
];

function detectTheme(question: string): Theme {
  if (LOVE_RE.test(question)) return "love";
  if (TRAVEL_RE.test(question)) return "travel";
  if (FINANCE_RE.test(question)) return "finance";
  if (HEALTH_RE.test(question)) return "health";
  if (DESTINY_RE.test(question)) return "destiny";
  return "general";
}

function semanticText(candidate: { asset: GalleryAsset; knowledge: GalleryArtKnowledge }): string {
  const assetTags = Array.isArray(candidate.asset.tags) ? candidate.asset.tags.map(String) : [];
  return [
    candidate.asset.title,
    candidate.asset.asset_key,
    ...assetTags,
    ...candidate.knowledge.subject_labels,
    ...candidate.knowledge.style_labels,
    ...candidate.knowledge.motifs,
    ...candidate.knowledge.mood_labels,
    candidate.knowledge.summary,
  ].filter(Boolean).join(" ").toLowerCase();
}

function joinList(items: string[], locale: GalleryReasonLocale): string {
  const clean = items.filter(Boolean);
  if (!clean.length) return "";
  if (locale !== "en") return clean.join("、");
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean.at(-1)}`;
}

function themeName(theme: Theme, locale: GalleryReasonLocale): string {
  if (locale === "en") {
    return ({
      love: "relationships",
      travel: "travel or movement",
      finance: "work and money",
      health: "recovery and wellbeing",
      destiny: "your direction and personal pattern",
      general: "what you are dealing with now",
    } as const)[theme];
  }
  if (locale === "zh-Hans") {
    return ({
      love: "感情与关系",
      travel: "旅行与移动",
      finance: "工作与金钱",
      health: "修复与身心状态",
      destiny: "你自己与人生方向",
      general: "你现在问的这件事",
    } as const)[theme];
  }
  return ({
    love: "感情與關係",
    travel: "旅行與移動",
    finance: "工作與金錢",
    health: "修復與身心狀態",
    destiny: "你自己與人生方向",
    general: "你現在問的這件事",
  } as const)[theme];
}

function themeAction(theme: Theme, locale: GalleryReasonLocale): string {
  if (locale === "en") {
    return ({
      love: "see the attraction and the boundaries clearly before deciding whether to move closer",
      travel: "set the direction first, then move; you do not need every detail solved before you start",
      finance: "protect your resources, set priorities, then make the decision",
      health: "return to recovery, pacing and real-world care instead of treating anxiety as the answer",
      destiny: "bring your attention back to yourself, set the direction, then deal with outside noise",
      general: "identify the one thing that matters most, then act on that first",
    } as const)[theme];
  }
  if (locale === "zh-Hans") {
    return ({
      love: "先看清吸引与界线，再决定要不要往前走",
      travel: "先把方向定清楚，再移动，不必一次把所有答案想完",
      finance: "先把资源收好、优先顺序排清楚，再做决定",
      health: "先回到修复、节奏与现实照护，不把焦虑当成答案",
      destiny: "把注意力收回自己，先定方向，再处理外界杂音",
      general: "先把最重要的一件事看清，再处理下一步",
    } as const)[theme];
  }
  return ({
    love: "先看清吸引與界線，再決定要不要往前走",
    travel: "先把方向定清楚，再移動，不必一次把所有答案想完",
    finance: "先把資源收好、優先順序排清楚，再做決定",
    health: "先回到修復、節奏與現實照護，不把焦慮當成答案",
    destiny: "把注意力收回自己，先定方向，再處理外界雜音",
    general: "先把最重要的一件事看清，再處理下一步",
  } as const)[theme];
}

export function explainCustomerDecreeImageChoice(
  chart: Pick<Chart, "useful">,
  question: string,
  candidate: { asset: GalleryAsset; knowledge: GalleryArtKnowledge },
  locale: GalleryReasonLocale,
): string {
  const theme = detectTheme(question);
  const text = semanticText(candidate);
  const symbols = SYMBOLS.filter((symbol) => symbol.re.test(text)).slice(0, 3);
  const labels = symbols.map((symbol) => symbol.label[locale]);
  const meanings = symbols.map((symbol) => symbol.meaning[locale]);
  const needs = [...new Set(chart.useful)].slice(0, 2).map((element) => NEED_COPY[element]?.[locale]).filter(Boolean);

  if (locale === "en") {
    const symbolSentence = labels.length
      ? `Its ${joinList(labels, locale)} imagery points to ${joinList(meanings, locale)}.`
      : "The image carries a steady, focused tone rather than a decorative one.";
    const needSentence = needs.length
      ? `What this reading asks you to recover is the ability to ${joinList(needs, locale)}.`
      : "The point is to make the next step clearer, not to add more noise.";
    return `${symbolSentence} ${needSentence} For ${themeName(theme, locale)}, the message is simple: ${themeAction(theme, locale)}. That is why this image belongs with this reading.`;
  }

  if (locale === "zh-Hans") {
    const symbolSentence = labels.length
      ? `这张图里的${joinList(labels, locale)}，对应的是${joinList(meanings, locale)}。`
      : "这张图的重点不在华丽，而在把这次分析需要的状态收成一个清楚的画面。";
    const needSentence = needs.length
      ? `你这次真正需要拿回来的，是${joinList(needs, locale)}。`
      : "它要提醒你的，是把下一步看清楚，而不是继续增加杂讯。";
    return `${symbolSentence}${needSentence}放回「${themeName(theme, locale)}」这件事，它提醒你：${themeAction(theme, locale)}。所以选这张，是因为它把你现在最需要的状态画了出来。`;
  }

  const symbolSentence = labels.length
    ? `這張圖裡的${joinList(labels, locale)}，對應的是${joinList(meanings, locale)}。`
    : "這張圖的重點不在華麗，而在把這次分析需要的狀態收成一個清楚的畫面。";
  const needSentence = needs.length
    ? `你這次真正需要拿回來的，是${joinList(needs, locale)}。`
    : "它要提醒你的，是把下一步看清楚，而不是繼續增加雜訊。";
  return `${symbolSentence}${needSentence}放回「${themeName(theme, locale)}」這件事，它提醒你：${themeAction(theme, locale)}。所以選這張，是因為它把你現在最需要的狀態畫了出來。`;
}
