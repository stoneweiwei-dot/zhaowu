import type { AppLocale } from "@/lib/bazi/types";
import type { FiveElement, FunctionalTrainingResult } from "@/lib/report/five-element-functional-training";

export type ChakraKey = "root" | "sacral" | "solarPlexus" | "heart" | "throat" | "thirdEye" | "crown";

export const CHAKRA_CONFIG = {
  root: { color: "red", "zh-Hant": "海底輪", "zh-Hans": "海底轮", en: "Root Chakra", themes: ["stability", "security", "physical grounding"] },
  sacral: { color: "orange", "zh-Hant": "生殖輪", "zh-Hans": "生殖轮", en: "Sacral Chakra", themes: ["emotion", "creativity", "relational flow"] },
  solarPlexus: { color: "yellow", "zh-Hant": "太陽神經叢", "zh-Hans": "太阳神经丛", en: "Solar Plexus Chakra", themes: ["will", "agency", "action"] },
  heart: { color: "green", alternateColor: "pink", "zh-Hant": "心輪", "zh-Hans": "心轮", en: "Heart Chakra", themes: ["connection", "compassion", "relationships"] },
  throat: { color: "blue", "zh-Hant": "喉輪", "zh-Hans": "喉轮", en: "Throat Chakra", themes: ["communication", "expression", "clarity"] },
  thirdEye: { color: "indigo", "zh-Hant": "眉心輪", "zh-Hans": "眉心轮", en: "Third Eye Chakra", themes: ["insight", "observation", "discernment"] },
  crown: { color: "violet", alternateColor: "white", "zh-Hant": "頂輪", "zh-Hans": "顶轮", en: "Crown Chakra", themes: ["meaning", "belief", "spiritual perspective"] },
} as const;

export type AuraBlueprint = {
  version: "ZW-AURA-SYMBOLIC-1.0";
  symbolicOnly: true;
  primaryColor: string;
  secondaryColors: string[];
  accentColor?: string;
  baseColor: string;
  chakraThemes: {
    chakra: ChakraKey;
    emphasis: "primary" | "secondary" | "support" | "quiet";
    interpretation: string;
  }[];
  naturalStrength: string;
  likelyDrainPoint: string;
  currentDevelopmentTheme: string;
  missionLine: string;
  disclaimer: string;
};

type AuraMapping = {
  primaryColor: string;
  secondaryColors: string[];
  accentColor: string;
  baseColor: string;
  chakras: [ChakraKey, ChakraKey, ChakraKey];
};

const AURA_BY_ELEMENT: Record<FiveElement, AuraMapping> = {
  wood: { primaryColor: "green", secondaryColors: ["blue", "yellow"], accentColor: "gold", baseColor: "ivory", chakras: ["heart", "throat", "solarPlexus"] },
  fire: { primaryColor: "yellow", secondaryColors: ["orange", "red"], accentColor: "gold", baseColor: "ivory", chakras: ["solarPlexus", "sacral", "root"] },
  earth: { primaryColor: "yellow", secondaryColors: ["red", "green"], accentColor: "gold", baseColor: "ivory", chakras: ["root", "solarPlexus", "heart"] },
  metal: { primaryColor: "blue", secondaryColors: ["indigo", "white"], accentColor: "gold", baseColor: "ivory", chakras: ["throat", "thirdEye", "root"] },
  water: { primaryColor: "indigo", secondaryColors: ["blue", "violet"], accentColor: "silver", baseColor: "ivory", chakras: ["thirdEye", "throat", "crown"] },
};

const COLOR_LABELS: Record<string, Record<AppLocale, string>> = {
  red: { "zh-Hant": "紅", "zh-Hans": "红", en: "red" },
  orange: { "zh-Hant": "橙", "zh-Hans": "橙", en: "orange" },
  yellow: { "zh-Hant": "黃", "zh-Hans": "黄", en: "yellow" },
  green: { "zh-Hant": "綠", "zh-Hans": "绿", en: "green" },
  pink: { "zh-Hant": "粉", "zh-Hans": "粉", en: "pink" },
  blue: { "zh-Hant": "藍", "zh-Hans": "蓝", en: "blue" },
  indigo: { "zh-Hant": "靛藍", "zh-Hans": "靛蓝", en: "indigo" },
  violet: { "zh-Hant": "紫", "zh-Hans": "紫", en: "violet" },
  white: { "zh-Hant": "白", "zh-Hans": "白", en: "white" },
  gold: { "zh-Hant": "金", "zh-Hans": "金", en: "gold" },
  silver: { "zh-Hant": "銀", "zh-Hans": "银", en: "silver" },
  ivory: { "zh-Hant": "米白", "zh-Hans": "米白", en: "ivory" },
};

export function auraColorLabel(color: string, locale: AppLocale): string {
  return COLOR_LABELS[color]?.[locale] ?? color;
}

export function chakraLabel(chakra: ChakraKey, locale: AppLocale): string {
  return CHAKRA_CONFIG[chakra][locale];
}

function chakraInterpretation(chakra: ChakraKey, locale: AppLocale): string {
  const copy: Record<ChakraKey, Record<AppLocale, string>> = {
    root: { "zh-Hant": "用穩定、作息與現實承載作為視覺主題。", "zh-Hans": "用稳定、作息与现实承载作为视觉主题。", en: "A visual theme for stability, routine and practical grounding." },
    sacral: { "zh-Hant": "用創造、情緒流動與關係互動作為視覺主題。", "zh-Hans": "用创造、情绪流动与关系互动作为视觉主题。", en: "A visual theme for creativity, emotional flow and relationships." },
    solarPlexus: { "zh-Hant": "用意志、啟動與自主行動作為視覺主題。", "zh-Hans": "用意志、启动与自主行动作为视觉主题。", en: "A visual theme for agency, activation and deliberate action." },
    heart: { "zh-Hant": "用連結、包容與有邊界的關係作為視覺主題。", "zh-Hans": "用连接、包容与有边界的关系作为视觉主题。", en: "A visual theme for connection, compassion and healthy relational space." },
    throat: { "zh-Hant": "用說清楚、表達與界線溝通作為視覺主題。", "zh-Hans": "用说清楚、表达与界线沟通作为视觉主题。", en: "A visual theme for clear expression, communication and stated boundaries." },
    thirdEye: { "zh-Hant": "用觀察、洞察與辨別作為視覺主題。", "zh-Hans": "用观察、洞察与辨别作为视觉主题。", en: "A visual theme for observation, insight and discernment." },
    crown: { "zh-Hant": "用意義、信念與更長線的視角作為視覺主題。", "zh-Hans": "用意义、信念与更长线的视角作为视觉主题。", en: "A visual theme for meaning, belief and a longer-term perspective." },
  };
  return copy[chakra][locale];
}

function missionLine(element: FiveElement, locale: AppLocale): string {
  const lines: Record<FiveElement, Record<AppLocale, string>> = {
    wood: { "zh-Hant": "把方向變成持續生長，不同時開五條路。", "zh-Hans": "把方向变成持续生长，不同时开五条路。", en: "Turn direction into sustained growth instead of opening five paths at once." },
    fire: { "zh-Hant": "把已經具備的內容真正啟動、表達並交付。", "zh-Hans": "把已经具备的内容真正启动、表达并交付。", en: "Turn what is already ready into visible action and delivery." },
    earth: { "zh-Hant": "先把生活與責任接穩，再承接下一層變化。", "zh-Hans": "先把生活与责任接稳，再承接下一层变化。", en: "Stabilise daily life and responsibility before taking on the next layer." },
    metal: { "zh-Hant": "用清楚邊界與取捨，把注意力留給真正重要的事。", "zh-Hans": "用清楚边界与取舍，把注意力留给真正重要的事。", en: "Use clear boundaries and selection to protect attention for what matters." },
    water: { "zh-Hant": "先恢復與觀察，再讓下一步從充足儲備中出發。", "zh-Hans": "先恢复与观察，再让下一步从充足储备中出发。", en: "Recover and observe first, then move from adequate reserves rather than depletion." },
  };
  return lines[element][locale];
}

export function buildAuraBlueprint(training: FunctionalTrainingResult): AuraBlueprint | null {
  const element = training.selectedElement;
  if (!element || training.analysisStatus === "insufficient_data") return null;
  const locale = training.locale;
  const map = AURA_BY_ELEMENT[element];
  const disclaimer = locale === "en"
    ? "This is a symbolic personality and life-theme map based on the report. It is not a medical test, energy measurement, religious ranking or objective chakra diagnosis."
    : locale === "zh-Hant"
      ? "這是依報告主題建立的象徵性人格與人生圖譜，不是醫學檢查、人體能量測量、宗教等級或客觀脈輪診斷。"
      : "这是依报告主题建立的象征性人格与人生图谱，不是医学检查、人体能量测量、宗教等级或客观脉轮诊断。";

  return {
    version: "ZW-AURA-SYMBOLIC-1.0",
    symbolicOnly: true,
    primaryColor: map.primaryColor,
    secondaryColors: map.secondaryColors,
    accentColor: map.accentColor,
    baseColor: map.baseColor,
    chakraThemes: map.chakras.map((chakra, index) => ({
      chakra,
      emphasis: index === 0 ? "primary" : index === 1 ? "secondary" : "support",
      interpretation: chakraInterpretation(chakra, locale),
    })),
    naturalStrength: locale === "en"
      ? `The map centres on ${training.functionalTheme.toLowerCase()} as a usable development theme, not a permanent personality label.`
      : locale === "zh-Hant"
        ? `本圖譜以「${training.functionalTheme}」作為目前可借用的發展主題，不把它寫成固定人格標籤。`
        : `本图谱以“${training.functionalTheme}”作为目前可借用的发展主题，不把它写成固定人格标签。`,
    likelyDrainPoint: training.excessWarning,
    currentDevelopmentTheme: training.freeTextSummary,
    missionLine: missionLine(element, locale),
    disclaimer,
  };
}

export function auraTextSummary(training: FunctionalTrainingResult, aura: AuraBlueprint): string {
  const locale = training.locale;
  const primary = auraColorLabel(aura.primaryColor, locale);
  const secondary = aura.secondaryColors.map((color) => auraColorLabel(color, locale));
  const base = auraColorLabel(aura.baseColor, locale);
  const mainChakra = chakraLabel(aura.chakraThemes[0].chakra, locale);
  if (locale === "en") {
    return `Symbolic aura cue: ${primary} as the main colour, ${secondary.join(" and ")} as supporting colours, with ${base} as the protective base. The main visual theme is ${mainChakra}, used here only to represent ${training.functionalTheme.toLowerCase()}.`;
  }
  if (locale === "zh-Hant") {
    return `象徵靈光提示：主色 ${primary}，輔色 ${secondary.join("、")}，保護底色 ${base}。主要視覺主題放在${mainChakra}，只用來表達「${training.functionalTheme}」這條人生功能線。`;
  }
  return `象征灵光提示：主色 ${primary}，辅色 ${secondary.join("、")}，保护底色 ${base}。主要视觉主题放在${mainChakra}，只用来表达“${training.functionalTheme}”这条人生功能线。`;
}
