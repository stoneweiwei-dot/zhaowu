import { dayGanzhi } from "@/lib/bazi/calendar";
import { stemElement, type WuXing } from "@/lib/element-colors";
import type { Locale } from "@/lib/i18n";

export type DailyColorId = "qingyun" | "jianghua" | "kunning" | "liujin" | "hanxu";

export type DailyColorCopy = {
  name: string;
  elementLabel: string;
  colorsLabel: string;
  keywords: string;
  quote: string;
  description: string;
  englishExplain: string;
  wantLabel: string;
};

export type DailyColorState = {
  id: DailyColorId;
  element: WuXing;
  ink: string;
  swatches: readonly string[];
  copy: Record<Locale, DailyColorCopy>;
};

export const DAILY_COLOR_STATES: readonly DailyColorState[] = [
  {
    id: "qingyun",
    element: "木",
    ink: "#4d7567",
    swatches: ["#2f6b5a", "#5a8a78", "#8aa89a"],
    copy: {
      "zh-Hant": {
        name: "青雲",
        elementLabel: "木",
        colorsLabel: "青、綠",
        keywords: "力量・生發・向上",
        quote: "當你需要力量的時候，穿青雲。",
        description: "把心力收回到自己，用青與綠提醒向上的力氣。這是日常色彩提示，不是改運保證。",
        englishExplain: "Qingyun · Wood — Energy / Growth / Momentum",
        wantLabel: "想提氣",
      },
      "zh-Hans": {
        name: "青云",
        elementLabel: "木",
        colorsLabel: "青、绿",
        keywords: "力量・生发・向上",
        quote: "当你需要力量的时候，穿青云。",
        description: "把心力收回到自己，用青与绿提醒向上的力气。这是日常色彩提示，不是改运保证。",
        englishExplain: "Qingyun · Wood — Energy / Growth / Momentum",
        wantLabel: "想提气",
      },
      en: {
        name: "Qingyun",
        elementLabel: "Wood",
        colorsLabel: "Cyan, green",
        keywords: "Energy · Growth · Momentum",
        quote: "When you need strength, wear Qingyun.",
        description: "Use cyan and green as a cue to gather energy and move upward. This is a daily colour prompt, not a promise to change luck.",
        englishExplain: "Qingyun · Wood — Energy / Growth / Momentum",
        wantLabel: "Want lift",
      },
    },
  },
  {
    id: "jianghua",
    element: "火",
    ink: "#9b4a45",
    swatches: ["#b23a2f", "#c45b3a", "#8a3d6a"],
    copy: {
      "zh-Hant": {
        name: "絳華",
        elementLabel: "火",
        colorsLabel: "紅、絳、紫",
        keywords: "發光・表達・熱情",
        quote: "當你想要發光的時候，穿絳華。",
        description: "用紅、絳、紫提醒自己把話說清楚、把溫度帶出來。這是狀態提示，不是招財口訣。",
        englishExplain: "Jianghua · Fire — Radiance / Expression / Passion",
        wantLabel: "想發光",
      },
      "zh-Hans": {
        name: "绛华",
        elementLabel: "火",
        colorsLabel: "红、绛、紫",
        keywords: "发光・表达・热情",
        quote: "当你想要发光的时候，穿绛华。",
        description: "用红、绛、紫提醒自己把话说清楚、把温度带出来。这是状态提示，不是招财口诀。",
        englishExplain: "Jianghua · Fire — Radiance / Expression / Passion",
        wantLabel: "想发光",
      },
      en: {
        name: "Jianghua",
        elementLabel: "Fire",
        colorsLabel: "Red, crimson, violet",
        keywords: "Radiance · Expression · Passion",
        quote: "When you want to shine, wear Jianghua.",
        description: "Use red, crimson and violet as a cue for presence and warmth. This is a state prompt, not a wealth charm.",
        englishExplain: "Jianghua · Fire — Radiance / Expression / Passion",
        wantLabel: "Want radiance",
      },
    },
  },
  {
    id: "kunning",
    element: "土",
    ink: "#9a7b59",
    swatches: ["#b06a2b", "#c4843a", "#8b6a4a"],
    copy: {
      "zh-Hant": {
        name: "坤寧",
        elementLabel: "土",
        colorsLabel: "黃、赭、棕",
        keywords: "放鬆・安定・修復",
        quote: "當你累了想放鬆的時候，穿坤寧。",
        description: "用黃、赭、棕把節奏放慢，回到比較穩的位置。這是休息提示，不是必須遵守的穿著律令。",
        englishExplain: "Kunning · Earth — Rest / Stability / Recovery",
        wantLabel: "想放鬆",
      },
      "zh-Hans": {
        name: "坤宁",
        elementLabel: "土",
        colorsLabel: "黄、赭、棕",
        keywords: "放松・安定・修复",
        quote: "当你累了想放松的时候，穿坤宁。",
        description: "用黄、赭、棕把节奏放慢，回到比较稳的位置。这是休息提示，不是必须遵守的穿着律令。",
        englishExplain: "Kunning · Earth — Rest / Stability / Recovery",
        wantLabel: "想放松",
      },
      en: {
        name: "Kunning",
        elementLabel: "Earth",
        colorsLabel: "Yellow, ochre, brown",
        keywords: "Rest · Stability · Recovery",
        quote: "When you are tired and want to relax, wear Kunning.",
        description: "Use yellow, ochre and brown as a cue to slow down and settle. This is a rest prompt, not a dress code.",
        englishExplain: "Kunning · Earth — Rest / Stability / Recovery",
        wantLabel: "Want rest",
      },
    },
  },
  {
    id: "liujin",
    element: "金",
    ink: "#ad8949",
    swatches: ["#f4f1e8", "#c4b07a", "#9a8a68"],
    copy: {
      "zh-Hant": {
        name: "鎏金",
        elementLabel: "金",
        colorsLabel: "白、金、銀",
        keywords: "清晰・收斂・決斷",
        quote: "當你需要清晰的時候，穿鎏金。",
        description: "用白、金、銀收斂雜訊，把重點留在眼前。這是清晰提示，不是古籍規定的情緒制服。",
        englishExplain: "Liujin · Metal — Clarity / Focus / Decision",
        wantLabel: "想清晰",
      },
      "zh-Hans": {
        name: "鎏金",
        elementLabel: "金",
        colorsLabel: "白、金、银",
        keywords: "清晰・收敛・决断",
        quote: "当你需要清晰的时候，穿鎏金。",
        description: "用白、金、银收敛杂讯，把重点留在眼前。这是清晰提示，不是古籍规定的情绪制服。",
        englishExplain: "Liujin · Metal — Clarity / Focus / Decision",
        wantLabel: "想清晰",
      },
      en: {
        name: "Liujin",
        elementLabel: "Metal",
        colorsLabel: "White, gold, silver",
        keywords: "Clarity · Focus · Decision",
        quote: "When you need clarity, wear Liujin.",
        description: "Use white, gold and silver as a cue to reduce noise and decide. This is a clarity prompt, not an ancient dress rule.",
        englishExplain: "Liujin · Metal — Clarity / Focus / Decision",
        wantLabel: "Want clarity",
      },
    },
  },
  {
    id: "hanxu",
    element: "水",
    ink: "#587383",
    swatches: ["#1d2a33", "#355a73", "#4d738c"],
    copy: {
      "zh-Hant": {
        name: "涵虛",
        elementLabel: "水",
        colorsLabel: "黑、藍",
        keywords: "靜心・沉澱・回神",
        quote: "當你想要靜心的時候，穿涵虛。",
        description: "用黑與藍把聲音調低，留一點空白給自己。這是靜心提示，不是保證改運的顏色。",
        englishExplain: "Hanxu · Water — Stillness / Reflection / Reset",
        wantLabel: "想靜心",
      },
      "zh-Hans": {
        name: "涵虚",
        elementLabel: "水",
        colorsLabel: "黑、蓝",
        keywords: "静心・沉淀・回神",
        quote: "当你想要静心的时候，穿涵虚。",
        description: "用黑与蓝把声音调低，留一点空白给自己。这是静心提示，不是保证改运的颜色。",
        englishExplain: "Hanxu · Water — Stillness / Reflection / Reset",
        wantLabel: "想静心",
      },
      en: {
        name: "Hanxu",
        elementLabel: "Water",
        colorsLabel: "Black, blue",
        keywords: "Stillness · Reflection · Reset",
        quote: "When you want a quieter mind, wear Hanxu.",
        description: "Use black and blue as a cue to lower the volume and reset. This is a stillness prompt, not a guaranteed luck colour.",
        englishExplain: "Hanxu · Water — Stillness / Reflection / Reset",
        wantLabel: "Want stillness",
      },
    },
  },
] as const;

const BY_ID: Record<DailyColorId, DailyColorState> = Object.fromEntries(
  DAILY_COLOR_STATES.map((state) => [state.id, state]),
) as Record<DailyColorId, DailyColorState>;

const ELEMENT_TO_ID: Record<WuXing, DailyColorId> = {
  木: "qingyun",
  火: "jianghua",
  土: "kunning",
  金: "liujin",
  水: "hanxu",
};

export function dailyColorById(id: DailyColorId): DailyColorState {
  return BY_ID[id];
}

export function dailyColorByElement(element: WuXing): DailyColorState {
  return BY_ID[ELEMENT_TO_ID[element]];
}

export type DailyColorAlmanacRef = {
  date: Date;
  ganzhi: string;
  dayStem: string;
  element: WuXing | null;
  recommendedId: DailyColorId;
};

export function dailyColorAlmanacRef(now = new Date()): DailyColorAlmanacRef {
  const ganzhi = dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const dayStem = ganzhi.slice(0, 1);
  const element = stemElement(dayStem);
  return {
    date: now,
    ganzhi,
    dayStem,
    element,
    recommendedId: element ? ELEMENT_TO_ID[element] : "kunning",
  };
}

export function formatDailyColorDate(date: Date, locale: Locale): string {
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }
  const weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][date.getDay()];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 · ${weekday}`;
}

export const DAILY_COLOR_PAGE = {
  "zh-Hant": {
    title: "每日穿衣｜五行色彩",
    subtitle: "五種狀態，五種顏色。選對顏色，一週就對了。",
    todaySuit: "今日適合",
    element: "五行",
    mood: "今日狀態",
    colors: "建議顏色",
    openFull: "查看完整建議",
    back: "返回昭梧",
    pick: "也可以先選你現在要的狀態",
    almanacNote: "上方「今日適合」只參考今日日干五行，作為輕量時間提示。",
    userNote: "你隨時可以改選自己要的狀態，不必跟今日參考走。",
    boundary: "這是五行文化 × 穿衣色彩 × 每日狀態指南，不是改運、招財或古籍穿著律令。個人命盤用色仍按命局另判。",
  },
  "zh-Hans": {
    title: "每日穿衣｜五行色彩",
    subtitle: "五种状态，五种颜色。选对颜色，一周就对了。",
    todaySuit: "今日适合",
    element: "五行",
    mood: "今日状态",
    colors: "建议颜色",
    openFull: "查看完整建议",
    back: "返回昭梧",
    pick: "也可以先选你现在要的状态",
    almanacNote: "上方“今日适合”只参考今日日干五行，作为轻量时间提示。",
    userNote: "你随时可以改选自己要的状态，不必跟今日参考走。",
    boundary: "这是五行文化 × 穿衣色彩 × 每日状态指南，不是改运、招财或古籍穿着律令。个人命盘用色仍按命局另判。",
  },
  en: {
    title: "Daily dress | Five-element colour",
    subtitle: "Five states, five colours. Choose the colour that fits the week you want.",
    todaySuit: "Today leans toward",
    element: "Element",
    mood: "Today's state",
    colors: "Suggested colours",
    openFull: "See the full guide",
    back: "Back to Zhaowu",
    pick: "Or choose the state you want right now",
    almanacNote: "“Today leans toward” only uses today's day-stem element as a light timing cue.",
    userNote: "You can change the state at any time. You are not required to follow the daily cue.",
    boundary: "This is a five-element culture × colour × daily-state guide. It does not promise luck, wealth, or an ancient dress rule. Personal BaZi colour use is judged separately.",
  },
} as const;
