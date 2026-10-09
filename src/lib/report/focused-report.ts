import type { AnalysisResult, AppLocale, Chart, Reading } from "@/lib/bazi/types";
import { composeCustomerAnswer } from "@/lib/report/customer-answer";
import { toTraditionalCustomerText } from "@/lib/report/reading-locale";
import { customerCopy, customerDirectAnswer } from "@/lib/report/customer-copy";
import { inspectAnswerRequirements } from "@/lib/core/answer-contract";
import { pickTravelDestinations } from "@/lib/bazi/forecast";
import { buildCosmicProfile, isCosmicSymbolicQuestion } from "@/lib/symbolic/cosmic-profile";
import { analyzeStructure, isStructureQuestion } from "@/lib/bazi/structure";
import { buildBodyAttentionLines } from "@/lib/report/body-attention";
import { deriveGuardianBeast } from "@/lib/report/guardian-beast";
import { buildCycleOverlayLines } from "@/lib/report/cycle-overlay";
import { buildOwnerCognitionReportLines } from "@/lib/report/owner-cognition-lines";
import {
  buildPersonalReportNarrative,
  renderPersonalReportNarrativeText,
  type PersonalReportNarrative,
} from "@/lib/report/personal-narrative";

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
  narrative?: PersonalReportNarrative;
  evidence: ReportSectionEvidence;
};

const REPORT_TITLES: Record<AppLocale, {
  verdict: string;
  action: string;
  basis: string;
  report: string;
}> = {
  "zh-Hant": {
    verdict: "核心直斷",
    action: "近期建議",
    basis: "核心依據",
    report: "昭梧｜專屬簡明報告"
  },
  "zh-Hans": {
    verdict: "核心直斷",
    action: "近期建議",
    basis: "核心依據",
    report: "昭梧｜专属简明报告"
  },
  en: {
    verdict: "Core insight",
    action: "Next steps",
    basis: "Foundation",
    report: "Zhaowu | Personal insight report"
  },
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

const BASIS_LABEL_HANT = "命理依據｜以下是這份判斷背後的盤面細節，想深入了解再看；上面的回答已經是結論。";

function chineseSummaryLines(result: AnalysisResult): string[] {
  const { question, chart, reading } = result;
  const req = inspectAnswerRequirements(question);
  const structureQuestion = isStructureQuestion(question);
  const showCycle = req.asksWhen || ["timing", "career", "love", "money", "home"].includes(reading.kind);
  const composed = composeCustomerAnswer(result);
  if (composed) {
    // Plain answer + next step first; every chart-level detail (R6.2.x
    // governance text included) stays in the report, grouped under one basis
    // label after the answer instead of interleaved with it.
    return dedupeLines([
      composed.answer,
      `下一步｜${composed.nextAction}`,
      ...composed.detail,
      BASIS_LABEL_HANT,
      `命盤落點：日主 ${chart.dayMaster}${chart.dayMasterElement}，月令 ${chart.monthBranch}。`,
      chart.currentDayun && !structureQuestion && showCycle ? `當前階段：${chart.currentDayun.ganZhi}大運（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）。` : "",
      chart.timeUnknown ? "出生時間未確定，因此不把時柱與大運起運當作硬結論依據。" : "",
      customerCopy(reading.rhythm),
    ]);
  }
  const lines = [
    customerDirectAnswer(question, reading.directAnswer),
    `命盘落点：日主 ${chart.dayMaster}${chart.dayMasterElement}，月令 ${chart.monthBranch}。`,
    chart.currentDayun && !structureQuestion && showCycle ? `当前阶段：${chart.currentDayun.ganZhi}大运（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）。` : "",
    chart.timeUnknown ? "出生时间未确定，因此本次不把时柱与大运起运当作硬结论依据；所有依赖时柱的细节都降级，不补造结论。" : "",
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
  if (isCosmicSymbolicQuestion(result.question)) return cosmicSummaryLines(result);
  const locale = result.locale ?? "zh-Hans";
  const core = locale === "en"
    ? englishSummaryLines(result)
    : chineseSummaryLines(result);
  const req = inspectAnswerRequirements(result.question);
  const showCycle = req.asksWhen || ["timing", "career", "love", "money", "home"].includes(result.reading.kind);
  const cognition = buildOwnerCognitionReportLines(result.chart, result.locale ?? "zh-Hans");
  const lines = dedupeLines(showCycle ? [...core, ...cognition, ...buildCycleOverlayLines(result)] : [...core, ...cognition]);
  // zh-Hant reports must not leak the Simplified source strings above.
  return locale === "zh-Hant" ? lines.map(toTraditionalCustomerText) : lines;
}

/** Three-section streamlined report: verdict + action + basis. */
export function composeFocusedReport(result: AnalysisResult): ReportSection[] {
  const locale = result.locale ?? "zh-Hans";
  const titles = REPORT_TITLES[locale];
  const { question, chart, reading } = result;
  const req = inspectAnswerRequirements(question);

  // Section 1: Core verdict — direct answer + current cycle context
  const verdict = summaryLines(result);

  // Section 2: Action items — next steps, timing, practical guidance
  const actionLines: string[] = [];
  const structureQuestion = isStructureQuestion(question);

  if (!structureQuestion) {
    actionLines.push(customerCopy(reading.action));
  }

  // Add timing context if relevant
  if (req.asksWhen || ["timing", "career", "love", "money", "home"].includes(reading.kind)) {
    if (chart.currentDayun) {
      actionLines.push(
        locale === "en"
          ? `Current ten-year phase: ${chart.currentDayun.startYear}–${chart.currentDayun.endYear}.`
          : locale === "zh-Hant"
          ? `當前十年週期：${chart.currentDayun.ganZhi}（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）。`
          : `当前十年周期：${chart.currentDayun.ganZhi}（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）。`
      );
    }
  }

  // Add specific guidance by question type
  if (req.asksTravel) {
    const names = travelNames(question, chart);
    const exec = locale === "en"
      ? `Confirm the first option, then book transport and housing. Keep only one backup destination.`
      : locale === "zh-Hant"
      ? `先定第一選項，再訂交通和住宿；備選只留一個。`
      : `先定第一选项，再订交通和住宿；备选只留一个。`;
    actionLines.push(exec);
  } else if (reading.kind === "career" && !structureQuestion) {
    const careerGuide = locale === "en"
      ? "Put job title, income, growth space, responsibility and exit cost on the same table; advance only what's most worth it."
      : locale === "zh-Hant"
      ? "把職位、收入、成長空間、責任和退出成本放在同一張表；只推進最值得的一條。"
      : "把职位、收入、成长空间、责任和退出成本放在同一张表；只推进最值得的一条。";
    actionLines.push(careerGuide);
  } else if (reading.kind === "money") {
    const moneyGuide = locale === "en"
      ? "Define risk cap, cash flow and exit terms first; then weigh the return potential."
      : locale === "zh-Hant"
      ? "先寫清風險上限、現金流和退出條件，再考慮收益空間。"
      : "先写清风险上限、现金流和退出条件，再考虑收益空间。";
    actionLines.push(moneyGuide);
  } else if (reading.kind === "health") {
    const healthGuide = locale === "en"
      ? "Stabilize sleep, rhythm and physical load first; see a doctor if symptoms persist, worsen or limit activity."
      : locale === "zh-Hant"
      ? "先穩定睡眠、作息與身體負荷；不適持續、加重或影響活動時及時就醫。"
      : "先稳定睡眠、作息与身体负荷；不适持续、加重或影响活动时及时就医。";
    actionLines.push(healthGuide);
  } else if (reading.kind === "love") {
    const loveGuide = locale === "en"
      ? "Judge the relationship by consistent contact, actual plans, clear commitment and respected boundaries."
      : locale === "zh-Hant"
      ? "關係只看持續聯繫、實際見面、明確承諾和邊界；沒有這些，就不要靠解釋補關係。"
      : "关系只看持续联系、实际见面、明确承诺和边界；没有这些，就不要靠解释补关系。";
    actionLines.push(loveGuide);
  }

  // Section 3: Basis — chart details and evidence
  const basisLines: string[] = [];

  // Chart fundamentals
  const EN_ELEMENT: Record<string, string> = { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" };
  const chartLabel = locale === "en"
    ? `Chart anchor: a ${EN_ELEMENT[chart.dayMasterElement] ?? "balanced"} day, read against the season of birth.`
    : locale === "zh-Hant"
    ? `命盤落點：日主 ${chart.dayMaster}${chart.dayMasterElement}，月令 ${chart.monthBranch}。`
    : `命盘落点：日主 ${chart.dayMaster}${chart.dayMasterElement}，月令 ${chart.monthBranch}。`;
  basisLines.push(chartLabel);

  // Data quality note
  if (chart.timeUnknown) {
    const timeNote = locale === "en"
      ? "Birth time is not confirmed; conclusions depending on the hour are approximate."
      : locale === "zh-Hant"
      ? "出生時間未確定；依賴時柱的結論降級為參考。"
      : "出生时间未确定；依赖时柱的结论降级为参考。";
    basisLines.push(timeNote);
  }

  // Guardian beast (symbolic lens); English keeps the report free of CJK glyphs.
  const beastLine = guardianLine(chart, locale);
  if (locale !== "en" || !/[\u3400-\u9fff]/.test(beastLine)) basisLines.push(beastLine);

  return [
    {
      sectionNo: 1,
      pageNo: 1,
      key: "summary",
      title: titles.verdict,
      body: verdict,
      narrative: buildPersonalReportNarrative(result),
      evidence: {
        facts: ["final reading", "question-relevant chart facts", "owner-material five-element functional lens", "four-storehouse teaching labels when present", "original chart + relevant Dayun / annual timing when requested"],
        conditions: ["Only question-specific content is kept", "Cycle overlay is included only when time-relevant"],
        limits: ["No unrelated topic filler", "Five-element cognition is symbolic/customer-language only", "Storehouse labels do not imply automatic activation"],
        checks: ["Direct answer appears once", "No internal chain-of-thought"],
      },
    },
    {
      sectionNo: 2,
      pageNo: 2,
      key: "action",
      title: titles.action,
      body: dedupeLines(actionLines),
      evidence: {
        facts: ["reading.action", "current Dayun context when relevant", "question-specific guidance"],
        conditions: ["Guidance targets immediate next steps and practical boundaries"],
        limits: ["Not medical advice, legal advice or investment advice", "No timeline guarantee"],
        checks: ["Actionable steps are concrete", "Timing is approximate or conditional"],
      },
    },
    {
      sectionNo: 3,
      pageNo: 3,
      key: "basis",
      title: titles.basis,
      body: dedupeLines(basisLines),
      evidence: {
        facts: ["four-pillar chart", "day master and month order", "guardian beast symbolic lens"],
        conditions: ["Data quality is noted; conclusions adjust if birth time is absent"],
        limits: ["No full structural analysis; references the main reading instead"],
        checks: ["Chart details are shown", "Data quality is transparent"],
      },
    },
  ];
}

export function renderFocusedReportText(sections: ReportSection[], locale: AppLocale = "zh-Hans"): string {
  const title = REPORT_TITLES[locale].report;
  const blocks = sections.map((section) => {
    const narrative = section.narrative ? renderPersonalReportNarrativeText(section.narrative) : "";
    return `${section.title}\n\n${[section.body.join("\n\n"), narrative].filter(Boolean).join("\n\n")}`;
  });
  return [title, ...blocks].join("\n\n");
}

export function composeFocusedReportText(result: AnalysisResult): string {
  return renderFocusedReportText(composeFocusedReport(result), result.locale ?? "zh-Hans");
}
