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


function firstSentence(value: string): string {
  const text = compact(value, 900);
  if (!text) return "";
  const hit = text.match(/^.*?[。！？!?](?:\s|$)?/);
  return (hit?.[0] ?? text).trim();
}

function dedupeSentences(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const text = firstSentence(item).replace(/\s+/g, " ").trim();
    if (!text) continue;
    const key = text.replace(/[。！？!?\s]/g, "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(/[。！？!?]$/.test(text) ? text : `${text}。`);
  }
  return out;
}

function thirdPartyBoundary(result: AnalysisResult, graph: QuestionGraph): string {
  if (!graph.thirdPartyBoundaryRequired) return "";
  const q = result.question;
  if (/(爸爸|父親|父亲|媽媽|妈妈|母親|母亲|家人|孩子|兒子|儿子|女兒|女儿)/.test(q)) {
    return "這題牽涉家人；你的命盤只能判你自己的承擔、互動與選擇，不能代替對方本人的健康、想法或完整命運。";
  }
  if (/(老闆|老板|主管|同事|合夥人|合伙人|客戶|客户|投資人|投资人)/.test(q)) {
    return "這題牽涉另一個人的決定；沒有對方可靠資料時，只能判你的合作／職場承載與可觀察條件，不能替對方讀心。";
  }
  return "這題牽涉對方；沒有對方可靠資料時，只能判你自己的選擇、節奏與可觀察條件，不能替對方讀心或保證對方會怎麼做。";
}

function highStakesBoundary(graph: QuestionGraph): string {
  const kinds = new Set(graph.highStakesKinds);
  if (kinds.has("medical")) return "醫療結果、手術與用藥必須以檢查和醫生判斷為準，命理只能補充生活負荷與節奏。";
  if (kinds.has("legal")) return "官司與法律結果要看證據、期限、程序與律師意見，命理不能保證勝敗。";
  if (kinds.has("investment") || kinds.has("gambling")) return "投資／博彩不能用命理指定必賺標的、買賣點或號碼；只能談風險承受、現金流與節奏。";
  if (kinds.has("fertility")) return "生育結果與時間要以醫療評估為準，命理不能保證能否或何時懷孕。";
  if (kinds.has("death")) return "不作壽命或死亡時間預測。";
  if (kinds.has("crime")) return "犯罪與刑事結果不能由命盤代替事實、證據與法律程序。";
  return "";
}

function domainLine(result: AnalysisResult, graph: QuestionGraph, domain: string): string {
  switch (domain) {
    case "career":
    case "job_fit":
    case "study":
    case "exam":
    case "business":
    case "entrepreneurship":
    case "workplace_relationship":
    case "client_relationship":
    case "partnership":
    case "negotiation":
      return result.reading.work;
    case "money":
    case "debt":
    case "investment":
      return result.reading.money;
    case "relationship":
    case "marriage":
    case "breakup":
    case "reconciliation":
    case "trust_fidelity":
    case "compatibility":
      return result.reading.love;
    case "health":
    case "medical_timing":
    case "fertility":
      return result.reading.body;
    case "home":
    case "property":
    case "relocation":
    case "migration":
      return result.reading.home;
    case "timing":
    case "event_verification":
      return result.reading.rhythm;
    default:
      return "";
  }
}

export function buildComplexDeterministicAnswer(result: AnalysisResult): { answer: string; next: string } | null {
  const graph = buildQuestionGraph(result.question, result.reading.kind);
  if (!graph.shouldReason) return null;
  const model = buildDecisionReportModel(result);

  const lines: string[] = [model.directAnswer];

  // Cover distinct secondary domains instead of repeating one generic paragraph.
  const priority = [
    "career", "job_fit", "business", "entrepreneurship",
    "money", "debt",
    "relationship", "marriage", "breakup", "reconciliation", "compatibility",
    "home", "property", "relocation", "migration",
    "timing", "health", "fertility",
  ];
  const used = new Set<string>();
  for (const domain of priority) {
    if (!graph.domains.includes(domain as any)) continue;
    const line = domainLine(result, graph, domain);
    const sentence = firstSentence(line);
    const key = sentence.replace(/[。！？!?\s]/g, "");
    if (!sentence || used.has(key)) continue;
    used.add(key);
    lines.push(sentence);
    if (lines.length >= (graph.modes.includes("multi-part") ? 4 : 3)) break;
  }

  if (graph.modes.includes("timing") && model.timing.length) lines.push(model.timing[0]);
  const thirdParty = thirdPartyBoundary(result, graph);
  if (thirdParty) lines.push(thirdParty);
  const highStakes = highStakesBoundary(graph);
  if (highStakes) lines.push(highStakes);

  const max = graph.modes.includes("multi-part") ? 5 : 3;
  const answer = dedupeSentences(lines).slice(0, max).join("");
  const next = compact(model.nextAction || result.reading.action, 180);
  return answer && next ? { answer, next } : null;
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
