import type { AnalysisResult, AppLocale, Chart, Reading } from "@/lib/bazi/types";
import { customerCopy, customerDirectAnswer } from "@/lib/report/customer-copy";
import { inspectAnswerRequirements } from "@/lib/core/answer-contract";
import { pickTravelDestinations } from "@/lib/bazi/forecast";
import { buildCosmicProfile, isCosmicSymbolicQuestion } from "@/lib/symbolic/cosmic-profile";
import { analyzeStructure, isStructureQuestion } from "@/lib/bazi/structure";
import { buildBodyAttentionLines } from "@/lib/report/body-attention";
import { buildMindAdviceLines } from "@/lib/report/mind-advice";
import { deriveGuardianBeast } from "@/lib/report/guardian-beast";
import { buildCycleOverlayLines } from "@/lib/report/cycle-overlay";

export type ReportSectionEvidence = {
  facts: string[];
  conditions: string[];
  limits: string[];
  checks: string[];
};

export type ReportSectionKey =
  | "summary"
  | "body"
  | "conclusion"
  | "basis"
  | "timing"
  | "action"
  | "relationship";

export type ReportSection = {
  sectionNo: number;
  /** Legacy storage alias only. New UI must use section language, never page language. */
  pageNo: number;
  key: ReportSectionKey;
  title: string;
  body: string[];
  optional?: boolean;
  evidence: ReportSectionEvidence;
};

const REPORT_TITLES: Record<AppLocale, { summary: string; body: string; report: string }> = {
  "zh-Hant": { summary: "總體概括", body: "身體需要注意", report: "昭梧｜專屬完整報告" },
  "zh-Hans": { summary: "总体概括", body: "身体需要注意", report: "昭梧｜专属完整报告" },
  en: { summary: "Overall summary", body: "Body areas to watch", report: "Zhaowu | Personal full report" },
};

function normalizeLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const normalized = normalizeLine(line);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(line.trim());
  }
  return out;
}

function travelNames(question: string, chart: Chart): string[] {
  const req = inspectAnswerRequirements(question);
  return pickTravelDestinations(chart, req.targetYears[0], req.targetMonths).map((place) => place.name);
}

function hasMultiTopicAnswer(reading: Reading): boolean {
  return /分開回答|分开回答|分開排|分开排/.test(reading.directAnswer);
}

function topicLines(question: string, reading: Reading, chart: Chart): string[] {
  const req = inspectAnswerRequirements(question);
  if (isStructureQuestion(question)) return analyzeStructure(chart).evidenceLines;

  if (req.asksTravel) {
    const names = travelNames(question, chart);
    return [
      `本题只看出行：主选 ${names[0]}，备选 ${names[1]}、${names[2]}。`,
      "判断重点放在出行窗口、转场负担与现实可执行性，不混入无关的人格或财务段落。",
    ];
  }

  if (hasMultiTopicAnswer(reading)) {
    return [
      { match: /工作|事業|事业|職業|职业|學業|学业/, label: "工作", value: reading.work },
      { match: /財務|财务|金錢|金钱|收入|投資|投资/, label: "财务", value: reading.money },
      { match: /感情|關係|关系|伴侶|伴侣|婚姻/, label: "关系", value: reading.love },
      { match: /健康|身體|身体|睡眠/, label: "身心", value: reading.body },
      { match: /住|房|搬家|居家/, label: "居住", value: reading.home },
    ]
      .filter((topic) => topic.match.test(question))
      .map((topic) => `${topic.label}｜${customerCopy(topic.value)}`)
      .filter((line) => !line.endsWith("｜"));
  }

  switch (reading.kind) {
    case "career": return [customerCopy(reading.work)];
    case "money": return [customerCopy(reading.money)];
    case "health": return [customerCopy(reading.body)];
    case "home": return [customerCopy(reading.home)];
    case "past": return [customerCopy(reading.rhythm)];
    case "self": return [];
    case "timing": return ["这题只保留与时间窗口有关的判断，不额外扩写工作、感情或财务。"];
    case "choice": return ["这题只比较选项本身的方向、代价和退出难度，不为了凑内容加入旁支主题。"];
    case "love": return [customerCopy(reading.love)];
    default: return [];
  }
}

function guardianLine(chart: Chart, locale: AppLocale): string {
  const beast = deriveGuardianBeast(chart, locale);
  if (locale === "en") return `Chart guardian beast: ${beast.name}. ${beast.keywords.join(", ")}.`;
  if (locale === "zh-Hant") return `命局瑞獸｜${beast.name}：${beast.keywords.join("、")}。${beast.rationale}`;
  return `命局瑞兽｜${beast.name}：${beast.keywords.join("、")}。${beast.rationale}`;
}

function chineseSummaryLines(result: AnalysisResult): string[] {
  const { question, chart, reading } = result;
  const locale = result.locale ?? "zh-Hans";
  const req = inspectAnswerRequirements(question);
  const structureQuestion = isStructureQuestion(question);
  const lines = [
    customerDirectAnswer(question, reading.directAnswer),
    `命盘落点：日主 ${chart.dayMaster}${chart.dayMasterElement}，月令 ${chart.monthBranch}。`,
    guardianLine(chart, locale),
    chart.currentDayun && !structureQuestion ? `当前阶段：${chart.currentDayun.ganZhi}大运（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）。` : "",
    chart.timeUnknown ? "出生时间未确定，因此本次不把时柱与大运起运当作硬结论依据。" : "",
    ...topicLines(question, reading, chart),
    structureQuestion ? "" : customerCopy(reading.rhythm),
    structureQuestion ? "" : customerCopy(reading.action),
  ];

  if (req.asksTravel) {
    const names = travelNames(question, chart);
    lines.push(`执行顺序：先定 ${names[0]}，再订交通和住宿；备选只留一个。`);
  } else if (reading.kind === "career" && !structureQuestion) {
    lines.push("把职位、收入、成长空间、责任和退出成本放在同一张表里，只推进最值得的一条。 ");
  } else if (reading.kind === "money") {
    lines.push("先写清风险上限、现金流和退出条件，再考虑收益空间。 ");
  } else if (reading.kind === "health") {
    lines.push("先稳定睡眠、作息与身体负荷；不适持续、加重或影响活动时及时就医。 ");
  } else if (reading.kind === "love") {
    lines.push("关系只看持续联系、实际见面、明确承诺和边界；没有这些，就不要靠解释补关系。 ");
  }

  return dedupeLines(lines);
}

function englishTopicBody(reading: Reading): string {
  switch (reading.kind) {
    case "career": return reading.work;
    case "love": return reading.love;
    case "money": return reading.money;
    case "health": return reading.body;
    case "home": return reading.home;
    default: return reading.rhythm;
  }
}

function plainEnglishRhythm(value: string): string {
  return value
    .replace(/Your current ten-year cycle is [^.]+\.\s*/gi, "")
    .replace(/\b(?:Day Master|Month Command|Ten Gods?|BaZi|ten-year cycle|luck cycle)\b/gi, "current pattern")
    .replace(/\s+/g, " ")
    .trim();
}

function englishSummaryLines(result: AnalysisResult): string[] {
  const { question, chart, reading } = result;
  const req = inspectAnswerRequirements(question);
  const lines = [
    reading.directAnswer,
    guardianLine(chart, "en"),
    englishTopicBody(reading),
    plainEnglishRhythm(reading.rhythm),
    reading.action,
    chart.timeUnknown ? "The birth time is not confirmed, so timing that depends on the birth hour is treated as approximate." : "",
  ];

  if (req.asksTravel) {
    const names = travelNames(question, chart);
    if (names.length) lines.push(`Shortlist: ${names.slice(0, 3).join(", ")}. Choose the first option that also works for leave, budget, travel time and visa requirements.`);
  }
  if (reading.kind === "love") {
    lines.push("Judge the relationship by consistent contact, actual plans, clear commitment and respected boundaries.");
  }

  return dedupeLines(lines);
}

function cosmicSummaryLines(result: AnalysisResult): string[] {
  const locale = result.locale ?? "zh-Hans";
  const profile = buildCosmicProfile(result.chart, locale);
  return dedupeLines([
    profile.directAnswer,
    guardianLine(result.chart, locale),
    ...profile.archetypeLines,
    ...profile.dimensionLines,
    ...profile.actionLines,
    profile.disclaimer,
  ]);
}

function summaryLines(result: AnalysisResult): string[] {
  const core = isCosmicSymbolicQuestion(result.question)
    ? cosmicSummaryLines(result)
    : (result.locale ?? "zh-Hans") === "en"
      ? englishSummaryLines(result)
      : chineseSummaryLines(result);
  return dedupeLines([...core, ...buildCycleOverlayLines(result), ...buildMindAdviceLines(result)]);
}

/** New reports keep one overall summary plus one body-attention block; mind advice stays inside the summary. */
export function composeFocusedReport(result: AnalysisResult): ReportSection[] {
  const locale = result.locale ?? "zh-Hans";
  const titles = REPORT_TITLES[locale];
  return [
    {
      sectionNo: 1,
      pageNo: 1,
      key: "summary",
      title: titles.summary,
      body: summaryLines(result),
      evidence: {
        facts: ["final reading", "question-relevant chart facts", "guardian beast symbol", "original chart + target Dayun + target annual year", "timing", "action"],
        conditions: ["All question-specific content and compact topic-matched mind advice are merged into one continuous summary", "Guardian beast is derived from chart element structure and remains symbolic", "Cycle overlay only consumes canonical chart output; it does not recompute luck-cycle direction"],
        limits: ["No unrelated topic filler", "No internal chain-of-thought", "Mind advice never overrides the calculated reading", "Guardian beast is not a supernatural claim", "Provisional useful-element conclusions never become hard five-element remedies"],
        checks: ["Direct answer appears once", "No numbered mini-sections", "Mind advice stays inside summary", "Guardian beast appears once", "Dayun and annual year are read together when birth time is known"],
      },
    },
    {
      sectionNo: 2,
      pageNo: 2,
      key: "body",
      title: titles.body,
      body: buildBodyAttentionLines(result.chart, locale),
      evidence: {
        facts: ["four-pillar earthly branches", "month seasonal weighting", "current long-term cycle branch", "six fixed opposition axes"],
        conditions: ["Earthly branch sets the observation area; paired branches are read as one axis"],
        limits: ["Traditional symbolic body map only", "Not a medical diagnosis", "No unimplemented Zi Wei star or sha-ji layer is invented"],
        checks: ["Seasonal weight is shown", "Medical boundary is explicit"],
      },
    },
  ];
}

export function renderFocusedReportText(sections: ReportSection[], locale: AppLocale = "zh-Hans"): string {
  const title = REPORT_TITLES[locale].report;
  const blocks = sections.map((section) => `${section.title}\n\n${section.body.join("\n\n")}`);
  return [title, ...blocks].join("\n\n");
}

export function composeFocusedReportText(result: AnalysisResult): string {
  return renderFocusedReportText(composeFocusedReport(result), result.locale ?? "zh-Hans");
}
