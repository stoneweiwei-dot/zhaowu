import type { WuXing } from "@/lib/element-colors";
import type { Locale } from "@/lib/i18n";

export type FiveElementCorrespondenceCopy = {
  name: string;
  motion: string;
  function: string;
  classicalColor: string;
  tone: string;
  qi: string;
  season: string;
  direction: string;
  taste: string;
  zangFu: string;
  body: string;
  emotion: string;
  spirit: string;
  labor: string;
  practice: string;
  overuse: string;
};

export type FiveElementUseState = {
  id:
    | "beneficial_but_insufficient"
    | "beneficial_but_blocked"
    | "already_sufficient"
    | "overactive"
    | "apparently_missing_but_not_to_add"
    | "needs_mother_qi_or_bridging";
  copy: Record<Locale, { title: string; action: string }>;
};

const correspondence = (
  element: WuXing,
  copy: Record<Locale, FiveElementCorrespondenceCopy>,
) => ({ element, copy } as const);

export const FIVE_ELEMENT_CORRESPONDENCES = {
  木: correspondence("木", {
    "zh-Hant": {
      name: "木",
      motion: "向外生發・條達・伸展",
      function: "生長、方向、規劃、疏通",
      classicalColor: "青",
      tone: "角音",
      qi: "風",
      season: "春",
      direction: "東",
      taste: "酸",
      zangFu: "肝・膽",
      body: "筋",
      emotion: "怒",
      spirit: "魂",
      labor: "行",
      practice: "真正需要木時，練的是開始、規劃、伸展與把阻塞說清楚；色彩與聲音只是提醒媒介。",
      overuse: "若木的功能已過旺，就不要再用「更多生長」解決問題，應轉向收斂、承載或完成。",
    },
    "zh-Hans": {
      name: "木",
      motion: "向外生发・条达・伸展",
      function: "生长、方向、规划、疏通",
      classicalColor: "青",
      tone: "角音",
      qi: "风",
      season: "春",
      direction: "东",
      taste: "酸",
      zangFu: "肝・胆",
      body: "筋",
      emotion: "怒",
      spirit: "魂",
      labor: "行",
      practice: "真正需要木时，练的是开始、规划、伸展与把阻塞说清楚；色彩与声音只是提醒媒介。",
      overuse: "若木的功能已过旺，就不要再用“更多生长”解决问题，应转向收敛、承载或完成。",
    },
    en: {
      name: "Wood",
      motion: "Outward growth · extension · flexibility",
      function: "Growth, direction, planning, unblocking",
      classicalColor: "Azure / green",
      tone: "Jue tone",
      qi: "Wind",
      season: "Spring",
      direction: "East",
      taste: "Sour",
      zangFu: "Liver · gallbladder",
      body: "Sinews",
      emotion: "Anger",
      spirit: "Hun",
      labor: "Walking",
      practice: "When Wood is genuinely needed, train starting, planning, extension and clear expression of what is blocked. Colour and sound are cues, not the treatment itself.",
      overuse: "If Wood is already overactive, do not answer the problem with more expansion. Shift toward containment, structure or completion.",
    },
  }),
  火: correspondence("火", {
    "zh-Hant": {
      name: "火",
      motion: "向上炎上・顯化・放光",
      function: "啟動、表達、溫度、影響力",
      classicalColor: "赤",
      tone: "徵音",
      qi: "火",
      season: "夏",
      direction: "南",
      taste: "苦",
      zangFu: "心・小腸",
      body: "脈",
      emotion: "喜",
      spirit: "神",
      labor: "視",
      practice: "真正需要火時，練的是啟動、表達、公開與把溫度帶出來；不是把紅色穿得越多越好。",
      overuse: "若火已過旺，重點是降速、降曝、保留承載，不再靠刺激與加速解決。",
    },
    "zh-Hans": {
      name: "火",
      motion: "向上炎上・显化・放光",
      function: "启动、表达、温度、影响力",
      classicalColor: "赤",
      tone: "徵音",
      qi: "火",
      season: "夏",
      direction: "南",
      taste: "苦",
      zangFu: "心・小肠",
      body: "脉",
      emotion: "喜",
      spirit: "神",
      labor: "视",
      practice: "真正需要火时，练的是启动、表达、公开与把温度带出来；不是把红色穿得越多越好。",
      overuse: "若火已过旺，重点是降速、降曝、保留承载，不再靠刺激与加速解决。",
    },
    en: {
      name: "Fire",
      motion: "Upward rising · visibility · radiance",
      function: "Activation, expression, warmth, influence",
      classicalColor: "Red",
      tone: "Zhi tone",
      qi: "Fire",
      season: "Summer",
      direction: "South",
      taste: "Bitter",
      zangFu: "Heart · small intestine",
      body: "Vessels",
      emotion: "Joy",
      spirit: "Shen",
      labor: "Looking",
      practice: "When Fire is genuinely needed, train activation, expression, visibility and warmth. Wearing more red is not the mechanism.",
      overuse: "If Fire is already overactive, reduce speed and exposure and protect capacity instead of adding more stimulation.",
    },
  }),
  土: correspondence("土", {
    "zh-Hant": {
      name: "土",
      motion: "居中承載・生化・轉化",
      function: "承載、穩定、整合、落地",
      classicalColor: "黃",
      tone: "宮音",
      qi: "濕",
      season: "長夏",
      direction: "中",
      taste: "甘",
      zangFu: "脾・胃",
      body: "肉",
      emotion: "思",
      spirit: "意",
      labor: "坐",
      practice: "真正需要土時，練的是穩定節奏、收尾、整理資源與承載結果；不是把自己變成什麼都扛的人。",
      overuse: "若土已過旺，應避免繼續堆責任與停滯，改做疏通、取捨與流動。",
    },
    "zh-Hans": {
      name: "土",
      motion: "居中承载・生化・转化",
      function: "承载、稳定、整合、落地",
      classicalColor: "黄",
      tone: "宫音",
      qi: "湿",
      season: "长夏",
      direction: "中",
      taste: "甘",
      zangFu: "脾・胃",
      body: "肉",
      emotion: "思",
      spirit: "意",
      labor: "坐",
      practice: "真正需要土时，练的是稳定节奏、收尾、整理资源与承载结果；不是把自己变成什么都扛的人。",
      overuse: "若土已过旺，应避免继续堆责任与停滞，改做疏通、取舍与流动。",
    },
    en: {
      name: "Earth",
      motion: "Centred support · transformation · holding",
      function: "Capacity, stability, integration, completion",
      classicalColor: "Yellow",
      tone: "Gong tone",
      qi: "Dampness",
      season: "Late summer",
      direction: "Centre",
      taste: "Sweet",
      zangFu: "Spleen · stomach",
      body: "Flesh",
      emotion: "Pensiveness",
      spirit: "Yi",
      labor: "Sitting",
      practice: "When Earth is genuinely needed, train steady rhythm, completion, resource organisation and the ability to hold results. It does not mean carrying everything yourself.",
      overuse: "If Earth is overactive, avoid adding more duty or inertia. Use movement, pruning and clearer flow.",
    },
  }),
  金: correspondence("金", {
    "zh-Hant": {
      name: "金",
      motion: "向內收斂・從革・修整",
      function: "結構、界線、取捨、規範",
      classicalColor: "白",
      tone: "商音",
      qi: "燥",
      season: "秋",
      direction: "西",
      taste: "辛",
      zangFu: "肺・大腸",
      body: "皮",
      emotion: "悲",
      spirit: "魄",
      labor: "臥",
      practice: "真正需要金時，練的是界線、刪減、定稿與規則；金不是冷硬，而是把多餘的部分修掉。",
      overuse: "若金已過旺，避免過度切割、苛刻與僵硬，應補回彈性、溫度與流動。",
    },
    "zh-Hans": {
      name: "金",
      motion: "向内收敛・从革・修整",
      function: "结构、界线、取舍、规范",
      classicalColor: "白",
      tone: "商音",
      qi: "燥",
      season: "秋",
      direction: "西",
      taste: "辛",
      zangFu: "肺・大肠",
      body: "皮",
      emotion: "悲",
      spirit: "魄",
      labor: "卧",
      practice: "真正需要金时，练的是界线、删减、定稿与规则；金不是冷硬，而是把多余的部分修掉。",
      overuse: "若金已过旺，避免过度切割、苛刻与僵硬，应补回弹性、温度与流动。",
    },
    en: {
      name: "Metal",
      motion: "Inward contraction · reform · refinement",
      function: "Structure, boundaries, selection, standards",
      classicalColor: "White",
      tone: "Shang tone",
      qi: "Dryness",
      season: "Autumn",
      direction: "West",
      taste: "Pungent",
      zangFu: "Lung · large intestine",
      body: "Skin",
      emotion: "Grief",
      spirit: "Po",
      labor: "Lying down",
      practice: "When Metal is genuinely needed, train boundaries, editing, finishing and standards. Metal is not simply hardness; it is the ability to remove what no longer belongs.",
      overuse: "If Metal is overactive, avoid excessive cutting, severity or rigidity. Restore flexibility, warmth and flow.",
    },
  }),
  水: correspondence("水", {
    "zh-Hant": {
      name: "水",
      motion: "向下潤下・蓄藏・流動",
      function: "儲藏、思考、適應、流動",
      classicalColor: "黑",
      tone: "羽音",
      qi: "寒",
      season: "冬",
      direction: "北",
      taste: "鹹",
      zangFu: "腎・膀胱",
      body: "骨",
      emotion: "恐",
      spirit: "志",
      labor: "立",
      practice: "真正需要水時，練的是留白、觀察、蓄力、轉彎與恢復流動；不是一味退縮或拖延。",
      overuse: "若水已過旺，避免繼續沉潛與分散，應增加方向、界線與可落地的行動。",
    },
    "zh-Hans": {
      name: "水",
      motion: "向下润下・蓄藏・流动",
      function: "储藏、思考、适应、流动",
      classicalColor: "黑",
      tone: "羽音",
      qi: "寒",
      season: "冬",
      direction: "北",
      taste: "咸",
      zangFu: "肾・膀胱",
      body: "骨",
      emotion: "恐",
      spirit: "志",
      labor: "立",
      practice: "真正需要水时，练的是留白、观察、蓄力、转弯与恢复流动；不是一味退缩或拖延。",
      overuse: "若水已过旺，避免继续沉潜与分散，应增加方向、界线与可落地的行动。",
    },
    en: {
      name: "Water",
      motion: "Downward flow · storage · adaptation",
      function: "Storage, reflection, adaptability, flow",
      classicalColor: "Black",
      tone: "Yu tone",
      qi: "Cold",
      season: "Winter",
      direction: "North",
      taste: "Salty",
      zangFu: "Kidney · bladder",
      body: "Bones",
      emotion: "Fear",
      spirit: "Zhi",
      labor: "Standing",
      practice: "When Water is genuinely needed, train space, observation, recovery, adaptability and renewed flow. It does not mean retreating indefinitely.",
      overuse: "If Water is overactive, avoid further withdrawal or diffusion. Add direction, boundaries and concrete action.",
    },
  }),
} as const;

export const FIVE_ELEMENT_USE_STATES: readonly FiveElementUseState[] = [
  {
    id: "beneficial_but_insufficient",
    copy: {
      "zh-Hant": { title: "有利但不足", action: "可以增強，但增的是功能，不是盲目堆顏色或物件。" },
      "zh-Hans": { title: "有利但不足", action: "可以增强，但增的是功能，不是盲目堆颜色或物件。" },
      en: { title: "Useful but insufficient", action: "Strengthen the function itself; do not simply pile on colours or objects." },
    },
  },
  {
    id: "beneficial_but_blocked",
    copy: {
      "zh-Hant": { title: "有利但受阻", action: "先疏通阻塞，再談加強；越補越堵不叫補。" },
      "zh-Hans": { title: "有利但受阻", action: "先疏通阻塞，再谈加强；越补越堵不叫补。" },
      en: { title: "Useful but blocked", action: "Unblock the path first. Adding more into a blockage is not useful strengthening." },
    },
  },
  {
    id: "already_sufficient",
    copy: {
      "zh-Hant": { title: "已經足夠", action: "維持即可，不因喜歡某個五行就繼續加碼。" },
      "zh-Hans": { title: "已经足够", action: "维持即可，不因喜欢某个五行就继续加码。" },
      en: { title: "Already sufficient", action: "Maintain it. Preference for an element is not a reason to keep increasing it." },
    },
  },
  {
    id: "overactive",
    copy: {
      "zh-Hant": { title: "過旺需制衡", action: "做減法、收斂或引流，不再直接強化同一功能。" },
      "zh-Hans": { title: "过旺需制衡", action: "做减法、收敛或引流，不再直接强化同一功能。" },
      en: { title: "Overactive", action: "Reduce, contain or redirect. Do not strengthen the same function again." },
    },
  },
  {
    id: "apparently_missing_but_not_to_add",
    copy: {
      "zh-Hant": { title: "表面缺失但不宜增加", action: "缺字不等於有病；先看命局是否真的需要這個功能。" },
      "zh-Hans": { title: "表面缺失但不宜增加", action: "缺字不等于有病；先看命局是否真的需要这个功能。" },
      en: { title: "Apparently missing, not to add", action: "Absence is not automatically a problem. First establish whether the function is actually needed." },
    },
  },
  {
    id: "needs_mother_qi_or_bridging",
    copy: {
      "zh-Hant": { title: "先要母氣或通關", action: "先處理支持條件與流通，不能把結果端直接硬補上去。" },
      "zh-Hans": { title: "先要母气或通关", action: "先处理支持条件与流通，不能把结果端直接硬补上去。" },
      en: { title: "Needs support or bridging first", action: "Fix support and circulation first rather than forcing the end result directly." },
    },
  },
] as const;

export const FIVE_ELEMENT_GUIDE_COPY: Record<Locale, {
  compactTitle: string;
  fullTitle: string;
  fullSubtitle: string;
  function: string;
  motion: string;
  color: string;
  tone: string;
  qi: string;
  season: string;
  direction: string;
  taste: string;
  zangFu: string;
  body: string;
  emotion: string;
  spirit: string;
  labor: string;
  practice: string;
  overuse: string;
  statesTitle: string;
  boundary: string;
}> = {
  "zh-Hant": {
    compactTitle: "這個五行代表什麼",
    fullTitle: "真正怎麼用五行",
    fullSubtitle: "五行不是五種物質，也不是缺什麼補什麼。先看它代表的功能與運動方向，再判斷是要增強、疏通、維持、制衡，還是暫時不要加。",
    function: "核心功能",
    motion: "運動方向",
    color: "五色",
    tone: "五音",
    qi: "五氣",
    season: "五季",
    direction: "五方",
    taste: "五味",
    zangFu: "五臟腑",
    body: "五體",
    emotion: "五志",
    spirit: "五藏",
    labor: "五勞",
    practice: "真正的練法",
    overuse: "用過頭時",
    statesTitle: "先判六種狀態，再決定要不要「補」",
    boundary: "色彩、聲音、方位、飲食與生活物件只作文化／生活映射；個人命盤仍由月令、調候、格局、病藥、制化、承載與流通判斷，不能反過來用這張表決定喜用神。",
  },
  "zh-Hans": {
    compactTitle: "这个五行代表什么",
    fullTitle: "真正怎么用五行",
    fullSubtitle: "五行不是五种物质，也不是缺什么补什么。先看它代表的功能与运动方向，再判断是要增强、疏通、维持、制衡，还是暂时不要加。",
    function: "核心功能",
    motion: "运动方向",
    color: "五色",
    tone: "五音",
    qi: "五气",
    season: "五季",
    direction: "五方",
    taste: "五味",
    zangFu: "五脏腑",
    body: "五体",
    emotion: "五志",
    spirit: "五藏",
    labor: "五劳",
    practice: "真正的练法",
    overuse: "用过头时",
    statesTitle: "先判六种状态，再决定要不要“补”",
    boundary: "色彩、声音、方位、饮食与生活物件只作文化／生活映射；个人命盘仍由月令、调候、格局、病药、制化、承载与流通判断，不能反过来用这张表决定喜用神。",
  },
  en: {
    compactTitle: "What this element actually means",
    fullTitle: "How to use the Five Elements properly",
    fullSubtitle: "The Five Elements are functional patterns, not five substances and not a 'replace whatever is missing' system. First identify the function and movement pattern, then decide whether it needs strengthening, unblocking, maintaining, balancing or no addition.",
    function: "Core function",
    motion: "Movement",
    color: "Five colours",
    tone: "Five tones",
    qi: "Five qi",
    season: "Season",
    direction: "Direction",
    taste: "Taste",
    zangFu: "Zang-fu",
    body: "Body tissue",
    emotion: "Emotion",
    spirit: "Spirit",
    labor: "Classical exertion",
    practice: "What to train",
    overuse: "When overused",
    statesTitle: "Judge the state first; only then decide whether to strengthen it",
    boundary: "Colour, sound, direction, food and objects are cultural or lifestyle mappings only. A personal BaZi judgement still depends on month command, climate, structure, bing-yao, regulation, capacity and circulation. This table cannot determine a useful element by itself.",
  },
};

export function fiveElementCorrespondence(element: WuXing, locale: Locale) {
  return FIVE_ELEMENT_CORRESPONDENCES[element].copy[locale];
}
