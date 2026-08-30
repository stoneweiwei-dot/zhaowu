import { yearMonthPillars } from "@/lib/bazi/calendar";
import type { AnalysisResult, AppLocale, Chart, DayunPeriod, Element } from "@/lib/bazi/types";
import { inspectAnswerRequirements } from "@/lib/core/answer-contract";

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
  木: { "zh-Hant": "定方向、讓成長真正發生", "zh-Hans": "定方向、让成长真正发生", en: "direction and sustainable growth" },
  火: { "zh-Hant": "集中行動、表達與顯化", "zh-Hans": "集中行动、表达与显化", en: "focused action and visibility" },
  土: { "zh-Hant": "承載、落地與建立穩定節奏", "zh-Hans": "承载、落地与建立稳定节奏", en: "grounding and stable execution" },
  金: { "zh-Hant": "立界線、定標準與做取捨", "zh-Hans": "立界线、定标准与做取舍", en: "boundaries, standards and selection" },
  水: { "zh-Hant": "保留流動性、資訊與選項", "zh-Hans": "保留流动性、信息与选项", en: "flexibility, information and options" },
};

const ELEMENT_EN: Record<Element, string> = {
  木: "growth",
  火: "action",
  土: "grounding",
  金: "boundaries",
  水: "flow",
};

type RelationKind = "clash" | "combine" | "harm";

function relation(a: string, b: string): RelationKind | null {
  if (!a || !b) return null;
  if (CLASH[a] === b) return "clash";
  if (COMBINE[a] === b) return "combine";
  if (HARM[a] === b) return "harm";
  return null;
}

function relationLabel(kind: RelationKind, locale: AppLocale): string {
  if (locale === "en") return kind;
  if (locale === "zh-Hant") return kind === "clash" ? "沖" : kind === "combine" ? "合" : "害";
  return kind === "clash" ? "冲" : kind === "combine" ? "合" : "害";
}

function createdYear(result: AnalysisResult): number {
  const parsed = new Date(result.createdAt);
  return Number.isFinite(parsed.getTime()) ? parsed.getUTCFullYear() : new Date().getUTCFullYear();
}

function targetYear(result: AnalysisResult): number {
  const requested = inspectAnswerRequirements(result.question).targetYears[0];
  return requested ?? createdYear(result);
}

function dayunAt(chart: Chart, year: number): DayunPeriod | null {
  const periods = Array.isArray(chart.dayun) ? chart.dayun : [];
  return periods.find((period) => year >= period.startYear && year <= period.endYear)
    ?? (chart.currentDayun && year >= chart.currentDayun.startYear && year <= chart.currentDayun.endYear ? chart.currentDayun : null);
}

function functionalElement(chart: Chart): Element | null {
  if (chart.usefulProvisional) return null;
  const drain = chart.drain ?? [];
  return (chart.useful ?? []).find((element) => !drain.includes(element)) ?? null;
}

/**
 * Customer-facing timing overlay. It never recalculates the natal chart or luck-cycle direction.
 * It consumes the canonical Chart, then reads original chart -> target Dayun -> target annual year.
 */
export function buildCycleOverlayLines(result: AnalysisResult): string[] {
  const locale = result.locale ?? "zh-Hans";
  const chart = result.chart;
  if (chart.timeUnknown) return [];

  const year = targetYear(result);
  const dayun = dayunAt(chart, year);
  if (!dayun) return [];

  const yearGanZhi = yearMonthPillars(new Date(Date.UTC(year, 6, 1, 12))).year;
  const dayunBranch = dayun.ganZhi[1] ?? "";
  const yearBranch = yearGanZhi[1] ?? "";
  const dayunYearRelation = relation(dayunBranch, yearBranch);
  const natalBranches = Array.from(new Set((chart.pillars ?? [])
    .filter((pillar) => pillar.ready)
    .map((pillar) => pillar.zhi)
    .filter(Boolean)));
  const natalHits = natalBranches
    .map((branch) => ({ branch, kind: relation(yearBranch, branch) }))
    .filter((item): item is { branch: string; kind: RelationKind } => Boolean(item.kind));

  const lines: string[] = [];

  if (locale === "en") {
    lines.push(`Timing overlay: birth pattern → the ${dayun.startYear}–${dayun.endYear} phase → ${year}.`);
    if (dayunYearRelation) {
      lines.push(`The long-term phase and ${year} form a ${relationLabel(dayunYearRelation, locale)} pattern. Read this first as change, restructuring or activation — not as an automatic good-or-bad verdict.`);
    }
    if (natalHits.length) {
      lines.push(`${year} also activates ${natalHits.length} relationship${natalHits.length === 1 ? "" : "s"} already present in the birth pattern. The annual year is therefore read together with the long-term phase, not in isolation.`);
    }
  } else {
    const trad = locale === "zh-Hant";
    lines.push(`${trad ? "歲運疊加" : "岁运叠加"}：原局 → ${dayun.ganZhi}${trad ? "大運" : "大运"}（${dayun.startYear}–${dayun.endYear}）→ ${year}年${yearGanZhi}。`);
    if (dayunYearRelation) {
      lines.push(`${trad ? "大運" : "大运"}${dayunBranch}${trad ? "與流年" : "与流年"}${yearBranch}${trad ? "形成" : "形成"}${relationLabel(dayunYearRelation, locale)}；先判為「動／重整／引動」，不能直接翻譯成吉或凶。`);
    }
    if (natalHits.length) {
      lines.push(`${trad ? "流年同時引動原局" : "流年同时引动原局"}：${natalHits.map((hit) => `${yearBranch}${hit.branch}${relationLabel(hit.kind, locale)}`).join("、")}；年度判讀必須把原局、大運、流年放在同一層看。`);
    }
  }

  const element = functionalElement(chart);
  if (!element) {
    lines.push(locale === "en"
      ? "Five-element advice is not hard-labelled while the balancing conclusion remains provisional; the annual year alone is never treated as a remedy."
      : locale === "zh-Hant"
        ? "五行功能暫不硬判：喜用／病藥仍待覆核時，不得只看流年五行就叫客人補某一行。"
        : "五行功能暂不硬判：喜用／病药仍待复核时，不得只看流年五行就叫客人补某一行。"
    );
    return lines;
  }

  lines.push(locale === "en"
    ? `Current functional emphasis: ${ELEMENT_EN[element]} — ${ELEMENT_FUNCTION[element][locale]}. Recalculate when the long-term phase or annual year changes.`
    : `${locale === "zh-Hant" ? "當前功能重點" : "当前功能重点"}：${element}｜${ELEMENT_FUNCTION[element][locale]}。大運或流年更換後必須重新計算，不沿用上一年的固定補法。`
  );

  return lines;
}
