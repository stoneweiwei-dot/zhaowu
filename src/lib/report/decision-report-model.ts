import { buildCustomerAnswer } from "./customer-answer";
import type { AnalysisResult, AppLocale, QuestionKind } from "@/lib/bazi/types";
import { inferQuestionKind, inspectAnswerRequirements, type AnswerRequirements } from "@/lib/core/answer-contract";

export type AnswerMode = "yes-no" | "comparison" | "timing" | "reason" | "forecast" | "action-plan" | "direct";
export type DecisionSectionKey = "reasons" | "risks" | "timing" | "actions";
export type SupportingModuleKey = "chart" | "visual" | "luck" | "body" | "evidence" | "share";

export type QuestionContract = {
  sourceText: string;
  primaryQuestion: string;
  secondaryQuestions: string[];
  providedContext: string[];
  kind: QuestionKind;
  answerMode: AnswerMode;
  requirements: AnswerRequirements;
  decisionTarget: string;
};

export type DecisionReportModel = {
  contract: QuestionContract;
  directAnswer: string;
  confidence: "high" | "medium" | "limited";
  confidenceLabel: string;
  confidenceBasis: string;
  biggestVariable: string;
  reasons: string[];
  risks: string[];
  timing: string[];
  actions: string[];
  sectionOrder: DecisionSectionKey[];
  supportingModules: SupportingModuleKey[];
  validationIssues: string[];
};

const DIRECT_QUESTION_RE = /(嗎|吗|呢|要不要|該不該|该不该|是否|哪個|哪个|哪一|什麼|什么|何時|何时|為什麼|为什么|怎麼|怎么|如何|會不會|会不会|能不能|可不可以|應不應|应不应)/;
const YES_NO_RE = /(要不要|該不該|该不该|是否|能不能|可不可以|應不應|应不应)/;
const EXPLICIT_COMPARE_RE = /(還是|还是|或者|二選一|二选一|A\s*(?:還是|还是|or)\s*B)/i;
const REASON_RE = /(為什麼|为什么|原因|怎麼會|怎么会|根源|癥結|症结)/;
const FORECAST_RE = /(會不會|会不会|未來|未来|結果|结果|發生|发生|走勢|走势|接下來|接下来)/;
const ACTION_RE = /(怎麼做|怎么做|如何做|怎麼辦|怎么办|方案|建議|建议|下一步)/;

function localeOf(result: AnalysisResult): AppLocale {
  return result.locale ?? "zh-Hans";
}

function splitQuestionInput(source: string): { primary: string; secondary: string[]; context: string[] } {
  const cleaned = source.replace(/\r/g, "").trim();
  if (!cleaned) return { primary: "", secondary: [], context: [] };
  const chunks = cleaned
    .split(/(?:\n+|(?<=[？?！!。；;])\s*)/)
    .map((part) => part.trim())
    .filter(Boolean);
  const questions = chunks.filter((part) => /[？?]$/.test(part) || DIRECT_QUESTION_RE.test(part));
  const context = chunks.filter((part) => !questions.includes(part));
  return {
    primary: questions[0] ?? cleaned,
    secondary: questions.slice(1, 4),
    context: context.slice(0, 4),
  };
}

function answerMode(question: string, req: AnswerRequirements): AnswerMode {
  if (EXPLICIT_COMPARE_RE.test(question)) return "comparison";
  if (YES_NO_RE.test(question)) return "yes-no";
  if (req.asksWhen) return "timing";
  if (REASON_RE.test(question)) return "reason";
  if (FORECAST_RE.test(question)) return "forecast";
  if (ACTION_RE.test(question)) return "action-plan";
  return req.asksCompare ? "comparison" : "direct";
}

function decisionTarget(kind: QuestionKind, mode: AnswerMode, locale: AppLocale): string {
  if (locale === "en") {
    const map: Record<QuestionKind, string> = {
      career: "a work or study decision", love: "a relationship decision", money: "a money decision", health: "a health-related practical decision",
      choice: "a choice between options", timing: "the useful timing window", self: "the main pattern to understand", past: "the symbolic past-life question", home: "a home or relocation decision",
    };
    return mode === "timing" ? "the useful timing window" : map[kind];
  }
  const traditional = locale === "zh-Hant";
  const map: Record<QuestionKind, string> = traditional ? {
    career: "工作／事業／學業決策", love: "感情與關係決策", money: "財務決策", health: "健康相關的現實安排",
    choice: "選項取捨", timing: "可執行的時間窗口", self: "目前最值得理解的核心結構", past: "前世今生的象徵問題", home: "居住／搬遷決策",
  } : {
    career: "工作／事业／学业决策", love: "感情与关系决策", money: "财务决策", health: "健康相关的现实安排",
    choice: "选项取舍", timing: "可执行的时间窗口", self: "目前最值得理解的核心结构", past: "前世今生的象征问题", home: "居住／搬迁决策",
  };
  return map[kind];
}

export function buildQuestionContract(question: string, fallbackKind: QuestionKind = "self", locale: AppLocale = "zh-Hans"): QuestionContract {
  const sourceText = question.trim();
  const requirements = inspectAnswerRequirements(sourceText);
  const parsed = splitQuestionInput(sourceText);
  const kind = inferQuestionKind(sourceText, fallbackKind);
  const mode = answerMode(sourceText, requirements);
  return {
    sourceText,
    primaryQuestion: parsed.primary,
    secondaryQuestions: parsed.secondary,
    providedContext: parsed.context,
    kind,
    answerMode: mode,
    requirements,
    decisionTarget: decisionTarget(kind, mode, locale),
  };
}

function sectionOrder(mode: AnswerMode, hasTiming: boolean): DecisionSectionKey[] {
  const base: DecisionSectionKey[] = mode === "timing"
    ? ["timing", "reasons", "risks", "actions"]
    : mode === "reason"
      ? ["reasons", "risks", "timing", "actions"]
      : mode === "action-plan"
        ? ["actions", "reasons", "risks", "timing"]
        : mode === "forecast"
          ? ["reasons", "timing", "risks", "actions"]
          : ["reasons", "risks", "timing", "actions"];
  return hasTiming ? base : base.filter((key) => key !== "timing");
}

function supportingModules(contract: QuestionContract): SupportingModuleKey[] {
  const modules: SupportingModuleKey[] = ["chart", "visual"];
  if (contract.requirements.asksWhen || ["timing", "career", "love", "money", "home"].includes(contract.kind)) modules.push("luck");
  modules.push("body", "evidence", "share");
  return modules;
}

export function validateDecisionReportModel(model: Omit<DecisionReportModel, "validationIssues">): string[] {
  const issues: string[] = [];
  if (!model.contract.primaryQuestion) issues.push("missing-primary-question");
  if (!model.directAnswer.trim()) issues.push("missing-direct-answer");
  if (!model.reasons.length) issues.push("missing-reasons");
  if (!model.actions.length) issues.push("missing-actions");
  if (model.contract.requirements.asksWhen && !model.timing.length) issues.push("timing-question-without-timing");
  if (model.contract.answerMode === "comparison" && !/(偏向|選|选|比較|比较|暫不|暂不|prefer|choose|compare|not enough|cannot)/i.test(model.directAnswer)) {
    issues.push("comparison-without-choice-direction");
  }
  return issues;
}

export function buildDecisionReportModel(result: AnalysisResult): DecisionReportModel {
  const locale = localeOf(result);
  const contract = buildQuestionContract(result.question, result.reading.kind, locale);
  const saved = result.reading.customerAnswer;
  const answer = saved?.version === 1 && saved.question === result.question && saved.locale === locale
    ? saved : buildCustomerAnswer(result.question, result.chart, result.reading, locale);
  const draft = {
    contract,
    directAnswer: answer.direct,
    confidence: "limited" as const,
    confidenceLabel: locale === "en" ? "Not independently verified" : locale === "zh-Hant" ? "未經實證" : "未经实证",
    confidenceBasis: "",
    biggestVariable: "",
    reasons: answer.reasons,
    risks: answer.limits,
    timing: answer.timing,
    actions: answer.actions,
    sectionOrder: sectionOrder(contract.answerMode, answer.timing.length > 0),
    supportingModules: supportingModules(contract),
  };
  return { ...draft, validationIssues: validateDecisionReportModel(draft) };
}
