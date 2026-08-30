import type { AppLocale, Chart, Element } from "@/lib/bazi/types";

export type GuardianBeast = {
  name: string;
  englishName: string;
  element: Element;
  keywords: string[];
  rationale: string;
  shortLine: string;
};

const COPY = {
  "zh-Hant": {
    木: ["青鸞", "Azure Luan", ["生發", "遠志", "清敏"]],
    火: ["朱雀", "Vermilion Bird", ["顯發", "決斷", "光明"]],
    土: ["麒麟", "Qilin", ["承載", "穩定", "守成"]],
    金: ["白澤", "Bai Ze", ["辨識", "規則", "洞察"]],
    水: ["應龍", "Yinglong", ["流動", "深潛", "應變"]],
  },
  "zh-Hans": {
    木: ["青鸾", "Azure Luan", ["生发", "远志", "清敏"]],
    火: ["朱雀", "Vermilion Bird", ["显发", "决断", "光明"]],
    土: ["麒麟", "Qilin", ["承载", "稳定", "守成"]],
    金: ["白泽", "Bai Ze", ["辨识", "规则", "洞察"]],
    水: ["应龙", "Yinglong", ["流动", "深潜", "应变"]],
  },
  en: {
    木: ["Azure Luan", "Azure Luan", ["growth", "long view", "sensitivity"]],
    火: ["Vermilion Bird", "Vermilion Bird", ["expression", "decisiveness", "visibility"]],
    土: ["Qilin", "Qilin", ["stability", "support", "continuity"]],
    金: ["Bai Ze", "Bai Ze", ["discernment", "structure", "insight"]],
    水: ["Yinglong", "Yinglong", ["adaptation", "depth", "movement"]],
  },
} as const;

function chooseElement(chart: Chart): Element {
  return chart.useful?.[0] ?? chart.dayMasterElement ?? "水";
}

export function deriveGuardianBeast(chart: Chart, locale: AppLocale = "zh-Hans"): GuardianBeast {
  const element = chooseElement(chart);
  const [name, englishName, keywords] = COPY[locale][element];
  const month = chart.monthBranch ?? "未定";
  const dayMasterElement = chart.dayMasterElement ?? element;
  const dm = `${chart.dayMaster ?? ""}${dayMasterElement}`;
  const usefulList = chart.useful ?? [];
  const useful = usefulList.length ? usefulList.join("、") : dayMasterElement;

  const rationale = locale === "en"
    ? `This symbolic beast is selected from the chart's working element (${element}), read together with the ${dm} Day Master, the ${month} month branch and the chart's useful elements (${useful}). It is a visual metaphor for the chart, not a supernatural claim.`
    : locale === "zh-Hant"
      ? `此瑞獸以命局目前優先使用的「${element}」為主軸，再合看日主 ${dm}、月令 ${month} 與喜用 ${useful}。它是命局結構的象徵化圖像，不是把生肖直接換成神獸，也不是超自然斷言。`
      : `此瑞兽以命局目前优先使用的「${element}」为主轴，再合看日主 ${dm}、月令 ${month} 与喜用 ${useful}。它是命局结构的象征化图像，不是把生肖直接换成神兽，也不是超自然断言。`;

  const shortLine = locale === "en"
    ? `${name} · ${keywords.join(" · ")}`
    : `${name}｜${keywords.join("・")}`;

  return { name, englishName, element, keywords: [...keywords], rationale, shortLine };
}
