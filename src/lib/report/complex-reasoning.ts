import type { AnalysisResult } from "@/lib/bazi/types";
import { analyzeStructure } from "@/lib/bazi/structure";
import { buildQuestionGraph, type QuestionGraph } from "@/lib/qa/complex-question-ontology";
import { buildDecisionReportModel } from "@/lib/report/decision-report-model";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export type ReasoningFact = {
  id: string;
  category: "answer" | "structure" | "timing" | "career" | "love" | "money" | "health" | "home" | "risk" | "action" | "constraint";
  text: string;
};

export type ComplexReasoningRequest = {
  locale: "zh-Hant" | "zh-Hans" | "en";
  graph: QuestionGraph;
  facts: ReasoningFact[];
  draft: { answer: string; next: string };
};

export type ComplexReasoningAnswer = {
  answer: string;
  next: string;
  confidence: "high" | "medium" | "limited";
  evidenceIds: string[];
  coverage: string[];
  limits: string[];
};

const ENDPOINT = `${SUPABASE_URL}/functions/v1/answer-reasoner`;

function compact(value: unknown, max = 700): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function pushFact(facts: ReasoningFact[], id: string, category: ReasoningFact["category"], value: unknown) {
  const text = compact(value);
  if (!text || facts.some((fact) => fact.text === text)) return;
  facts.push({ id, category, text });
}

function buildFacts(result: AnalysisResult): ReasoningFact[] {
  const model = buildDecisionReportModel(result);
  const structure = analyzeStructure(result.chart);
  const facts: ReasoningFact[] = [];

  pushFact(facts, "answer.direct", "answer", model.directAnswer);
  pushFact(facts, "answer.confidence", "constraint", `${model.confidenceLabel}：${model.confidenceBasis}`);
  pushFact(facts, "answer.biggest_variable", "constraint", model.biggestVariable);

  model.reasons.slice(0, 5).forEach((line, index) => pushFact(facts, `reason.${index + 1}`, "answer", line));
  model.risks.slice(0, 4).forEach((line, index) => pushFact(facts, `risk.${index + 1}`, "risk", line));
  model.timing.slice(0, 5).forEach((line, index) => pushFact(facts, `timing.${index + 1}`, "timing", line));
  model.actions.slice(0, 4).forEach((line, index) => pushFact(facts, `action.${index + 1}`, "action", line));

  pushFact(facts, "reading.rhythm", "timing", result.reading.rhythm);
  pushFact(facts, "reading.career", "career", result.reading.work);
  pushFact(facts, "reading.love", "love", result.reading.love);
  pushFact(facts, "reading.money", "money", result.reading.money);
  pushFact(facts, "reading.health", "health", result.reading.body);
  pushFact(facts, "reading.home", "home", result.reading.home);

  pushFact(facts, "structure.primary", "structure", `主結構：${structure.label}；完成度：${structure.completion.label}`);
  pushFact(facts, "structure.remedy", "structure", `主病：${structure.remedy.disease}；對治方向：${structure.remedy.medicine}`);
  structure.evidenceLines.slice(0, 5).forEach((line, index) => pushFact(facts, `structure.evidence.${index + 1}`, "structure", line));

  pushFact(facts, "chart.strength", "structure", `承載：${result.chart.strength.tendency}；${result.chart.strength.summary}`);
  pushFact(
    facts,
    "chart.useful",
    "structure",
    result.chart.usefulProvisional
      ? `正式取用未定；目前只有候選：${result.chart.useful.join("、") || "無"}`
      : `目前可用候選：${result.chart.useful.join("、") || "無"}`,
  );
  if (result.chart.currentDayun) {
    pushFact(
      facts,
      "chart.current_dayun",
      "timing",
      `當前大運：${result.chart.currentDayun.ganZhi}（${result.chart.currentDayun.startYear}–${result.chart.currentDayun.endYear}）`,
    );
  }
  pushFact(facts, "chart.current_year", "timing", `當前流年干支：${result.chart.currentYear}`);
  if (result.chart.timeUnknown) pushFact(facts, "constraint.time_unknown", "constraint", "出生時辰未知；依賴時柱與精細應期的結論必須降級。");

  return facts.slice(0, 40);
}

export function buildComplexReasoningRequest(result: AnalysisResult): ComplexReasoningRequest | null {
  const graph = buildQuestionGraph(result.question, result.reading.kind);
  if (!graph.shouldReason) return null;
  const model = buildDecisionReportModel(result);
  const facts = buildFacts(result);
  if (!facts.length) return null;
  return {
    locale: result.locale ?? "zh-Hant",
    graph,
    facts,
    draft: {
      answer: compact(model.directAnswer, 500),
      next: compact(model.nextAction, 260),
    },
  };
}

const INTERNAL_RE = /(chain[- ]?of[- ]?thought|內部推理|内部推理|思維鏈|思维链|system prompt|developer message|prompt injection)/i;
const CERTAINTY_RE = /(?<!不)(一定會|一定会|百分之百|100%|保證|保证|命中注定)/;
const JARGON_OVERLOAD_RE = /(日主|月令|十神|用神|喜用|七殺|七杀|正印|偏印|正官|偏官|正財|偏財|食神|傷官|比肩|劫財|身強|身弱).{0,25}(日主|月令|十神|用神|喜用|七殺|七杀|正印|偏印|正官|偏官|正財|偏財|食神|傷官|比肩|劫財|身強|身弱)/;

function validAnswer(out: any, req: ComplexReasoningRequest): out is ComplexReasoningAnswer {
  if (!out || typeof out !== "object") return false;
  const answer = compact(out.answer, 800);
  const next = compact(out.next, 300);
  if (!answer || !next) return false;
  const sentenceCount = (answer.match(/[。！？!?]/g) ?? []).length;
  const maxSentences = req.graph.modes.includes("multi-part") ? 5 : 3;
  if (sentenceCount < 1 || sentenceCount > maxSentences || answer.length > 520 || next.length > 180) return false;
  if (INTERNAL_RE.test(answer + next) || CERTAINTY_RE.test(answer + next) || JARGON_OVERLOAD_RE.test(answer + next)) return false;
  if (!["high", "medium", "limited"].includes(out.confidence)) return false;
  if (!Array.isArray(out.evidenceIds) || !out.evidenceIds.length) return false;
  const factIds = new Set(req.facts.map((fact) => fact.id));
  if (out.evidenceIds.some((id: unknown) => typeof id !== "string" || !factIds.has(id))) return false;
  if (!Array.isArray(out.coverage) || !Array.isArray(out.limits)) return false;
  return true;
}

export async function requestComplexReasoning(
  req: ComplexReasoningRequest,
  timeoutMs = 18000,
): Promise<ComplexReasoningAnswer | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
      body: JSON.stringify(req),
    });
    if (!res.ok) return null;
    const out = await res.json();
    if (out?.source !== "reasoner" || !validAnswer(out, req)) return null;
    return {
      answer: compact(out.answer, 800),
      next: compact(out.next, 300),
      confidence: out.confidence,
      evidenceIds: out.evidenceIds,
      coverage: out.coverage.map((item: unknown) => compact(item, 180)).filter(Boolean).slice(0, 8),
      limits: out.limits.map((item: unknown) => compact(item, 180)).filter(Boolean).slice(0, 6),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
