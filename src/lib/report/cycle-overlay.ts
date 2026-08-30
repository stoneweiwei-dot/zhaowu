import { BRANCH_ELEMENT } from "@/lib/bazi/constants";
import { yearMonthPillars } from "@/lib/bazi/calendar";
import type { AnalysisResult, AppLocale, Chart, Element } from "@/lib/bazi/types";

const CLASH: Record<string, string> = {
  子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
  卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
};

const COMBINE: Record<string, string> = {
  子: "丑", 丑: "子", 寅: "亥", 亥: "寅", 卯: "戌", 戌: "卯",
  辰: "酉", 酉: "辰", 巳: "申", 申: "巳", 午: "未", 未: "午",
};

const HARM: Record<string, string> = {
  子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅",
  卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉",
};

const ELEMENT_FUNCTION: Record<Element, Record<AppLocale, string>> = {
  木: { "zh-Hant": "定方向、讓成長真正發生", "zh-Hans": "定方向、让成长真正发生", en: "set direction and create real growth" },
  火: { "zh-Hant": "集中行動、表達與顯化", "zh-Hans": "集中行动、表达与显化", en: "focus action, expression and visibility" },
  土: { "zh-Hant": "承載、落地與建立穩定節奏", "zh-Hans": "承载、落地与建立稳定节奏", en: "ground, carry and stabilise" },
  金: { "zh-Hant": "立界線、定標準與做取捨", "zh-Hans": "立界线、定标准与做取舍", en: "set boundaries, standards and priorities" },
  水: { "zh-Hant": "保留流動性、資訊與選項", "zh-Hans": "保留流动性、信息与选项", en: "preserve liquidity, information and options" },
};

const ELEMENT_EN: Record<Element, string> = { 木: "growth", 火: "action", 土: "grounding", 金: "boundaries", 水: "flow" };

function relation(a: string, b: string): "clash" | "combine" | "harm" | null {
  if (!a || !b) return null;
  if (CLASH[a] === b) return "clash";
  if (COMBINE[a] === b) return "combine";
  if (HARM[a] === b) return "harm";
  return null;
}

function currentYearFrom(result: AnalysisResult): number {
  const parsed = new Date(result.createdAt);
  return Number.isFinite(parsed.getTime()) ? parsed.getUTCFullYear() : new Date().getUTCFullYear();
}

function branchLabel(kind: "clash" | "combine" | "harm", locale: AppLocale): string {
  if (locale === "en") return kind === "clash" ? "clash" : kind === "combine" ? "combine" : "harm";
  if (locale === "zh-Hant") return kind === "clash" ? "沖" : kind === "combine" ? "合" : "害";
  return kind === "clash" ? "冲" : kind === "combine" ? "合" : "害";
}

function cycleElement(chart: Chart, yearBranch: string): Element | null {
  const useful = chart.useful.filter((element) => !chart.drain.includes(element));
  if (!chart.usefulProvisional && useful.length) return useful[0];
  const yearElement = BRANCH_ELEMENT[yearBranch] as Element | undefined;
  return yearElement ?? null;
}

/** Reads canonical chart output, then overlays natal -> current dayun -> current year. */
export function buildCycleOverlayLines(result: AnalysisResult): string[] {
  const locale = result.locale ?? "zh-Hans";
  const chart = result.chart;
  if (chart.timeUnknown || !chart.currentDayun) return [];

  const year = currentYearFrom(result);
  const yearGz = yearMonthPillars(new Date(Date.UTC(year, 6, 1, 12))).year;
  const dayunGz = chart.currentDayun.ganZhi;
  const dayunBranch = dayunGz[1] ?? "";
  const yearBranch = yearGz[1] ?? "";
  const natalBranches = chart.pillars.filter((pillar) => pillar.ready).map((pillar) => pillar.zhi);
  const dyYear = relation(dayunBranch, yearBranch);
  const natalHits = natalBranches
    .map((branch) => ({ branch, kind: relation(yearBranch, branch) }))
    .filter((item): item is { branch: string; kind: "clash" | "combine" | "harm" } => Boolean(item.kind));

  const lines: string[] = [];
  if (locale === "en") {
    lines.push(`Timing overlay: birth pattern → current phase (${chart.currentDayun.startYear}–${chart.currentDayun.endYear}) → ${year}.`);
    if (dyYear) lines.push(`The current phase and ${year} form a ${branchLabel(dyYear, locale)} pattern. Treat this as a change or activation signal, not an automatic good-or-bad verdict.`);
    if (natalHits.length) lines.push(`The ${year} pattern also activates ${natalHits.length} relationship${natalHits.length === 1 ? "" : "s"} already present in the birth pattern. Read these together with the current phase rather than judging the year alone.`);
  } else {
    const trad = locale === "zh-Hant";
    lines.push(`${trad ? "歲運疊加" : "岁运叠加"}：原局 → ${dayunGz}${trad ? "大運" : "大运"}（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）→ ${year}年${yearGz}。`);
    if (dyYear) lines.push(`${trad ? "大運" : "大运"}${dayunBranch}與${trad ? "流年" : "流年"}${yearBranch}形成${branchLabel(dyYear, locale)}；先判為「動／重整／引動」，不能直接翻譯成吉或凶。`);
    if (natalHits.length) lines.push(`${trad ? "流年同時引動原局" : "流年同时引动原局"}：${natalHits.map((hit) => `${yearBranch}${hit.branch}${branchLabel(hit.kind, locale)}`).join("、")}；年度策略必須把原局、大運、流年放在同一層判讀。`);
  }

  const element = cycleElement(chart, yearBranch);
  if (!element) return lines;

  if (chart.usefulProvisional) {
    lines.push(locale === "en"
      ? "The five-element function is not hard-labelled here because the core balancing conclusion is still provisional; the annual pattern alone is not treated as a remedy."
      : locale === "zh-Hant"
        ? "五行功能暫不硬判：喜用／病藥仍屬待覆核時，不得只看流年五行就叫客人補某一行。"
        : "五行功能暂不硬判：喜用／病药仍属待复核时，不得只看流年五行就叫客人补某一行。"
    );
    return lines;
  }

  lines.push(locale === "en"
    ? `Current functional emphasis: ${ELEMENT_EN[element]} — ${ELEMENT_FUNCTION[element][locale]}. Re-check this whenever the current phase or annual year changes.`
    : `${locale === "zh-Hant" ? "當前功能重點" : "当前功能重点"}：${element}｜${ELEMENT_FUNCTION[element][locale]}。大運或流年更換後必須重新計算，不沿用上一年的固定補法。`
  );
  return lines;
}
