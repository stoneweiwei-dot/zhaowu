import type { AnalysisResult, AppLocale, QuestionKind, Reading } from "@/lib/bazi/types";
import { inferQuestionKind, inspectAnswerRequirements, type AnswerRequirements } from "@/lib/core/answer-contract";
import { customerCopy, customerDirectAnswer } from "@/lib/report/customer-copy";

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

function sentenceParts(value: string): string[] {
  const text = customerCopy(value).replace(/\s+/g, " ").trim();
  if (!text) return [];
  return (text.match(/[^。！？!?\.]+[。！？!?\.]?/g) ?? [text])
    .map((part) => part.trim())
    .filter(Boolean);
}

function compactLines(value: string, max = 3, maxChars = 150): string[] {
  return sentenceParts(value)
    .slice(0, max)
    .map((line) => line.length > maxChars ? `${line.slice(0, maxChars - 1).trim()}…` : line);
}

function dedupe(lines: string[]): string[] {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = line.replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function topicSource(reading: Reading, kind: QuestionKind): string {
  switch (kind) {
    case "career": return reading.work;
    case "love": return reading.love;
    case "money": return reading.money;
    case "health": return reading.body;
    case "home": return reading.home;
    case "past": return reading.rhythm;
    case "choice": return reading.rhythm;
    case "timing": return reading.rhythm;
    default: return reading.rhythm;
  }
}

function confidence(result: AnalysisResult, contract: QuestionContract): Pick<DecisionReportModel, "confidence" | "confidenceLabel" | "confidenceBasis"> {
  const locale = localeOf(result);
  const limited = (result.chart.timeUnknown && contract.requirements.asksWhen)
    || contract.requirements.asksMedicalTiming
    || contract.requirements.asksInvestmentPick;
  const medium = result.chart.timeUnknown;
  const level = limited ? "limited" : medium ? "medium" : "high";

  if (locale === "en") {
    return {
      confidence: level,
      confidenceLabel: level === "high" ? "Higher" : level === "medium" ? "Moderate" : "Limited",
      confidenceBasis: limited
        ? "Some of the requested answer depends on information or real-world evidence that this reading cannot safely make exact."
        : medium
          ? "The birth hour is not confirmed, so hour-dependent detail is deliberately downgraded."
          : "The supplied birth data is complete enough for this answer type. This is still guidance, not an event guarantee.",
    };
  }

  const t = locale === "zh-Hant";
  return {
    confidence: level,
    confidenceLabel: level === "high" ? (t ? "較高" : "较高") : level === "medium" ? (t ? "中等" : "中等") : (t ? "受限" : "受限"),
    confidenceBasis: limited
      ? (t ? "本題有部分內容依賴命理無法安全精確化的資料或現實證據，因此主動降級。" : "本题有部分内容依赖命理无法安全精确化的资料或现实证据，因此主动降级。")
      : medium
        ? (t ? "出生時辰未確認，所有依賴時柱的細節都已降級。" : "出生时辰未确认，所有依赖时柱的细节都已降级。")
        : (t ? "出生資料足以支撐本題型的結構判讀；這不等同事件保證。" : "出生资料足以支撑本题型的结构判断；这不等同事件保证。"),
  };
}

function biggestVariable(result: AnalysisResult, contract: QuestionContract): string {
  const locale = localeOf(result);
  if (result.chart.timeUnknown && contract.requirements.asksWhen) {
    return locale === "en" ? "Unconfirmed birth time limits precise timing." : locale === "zh-Hant" ? "出生時辰未確認，精細應期會受限。" : "出生时辰未确认，精细应期会受限。";
  }
  if (contract.requirements.asksMedicalTiming) {
    return locale === "en" ? "Clinical findings and the treating clinician's advice." : locale === "zh-Hant" ? "實際檢查結果與醫療專業判斷。" : "实际检查结果与医疗专业判断。";
  }
  if (contract.requirements.asksInvestmentPick) {
    return locale === "en" ? "Market conditions, downside tolerance and exit rules." : locale === "zh-Hant" ? "市場條件、可承受損失與退出規則。" : "市场条件、可承受损失与退出规则。";
  }
  if (contract.requirements.asksTravel) {
    return locale === "en" ? "Leave, budget, travel time and entry requirements." : locale === "zh-Hant" ? "假期、預算、交通時間與入境條件。" : "假期、预算、交通时间与入境条件。";
  }

  const t = locale === "zh-Hant";
  const map: Record<QuestionKind, string> = locale === "en" ? {
    career: "The real contract, cash flow, responsibility and exit cost.",
    love: "The other person's consistent behaviour, commitment and boundaries.",
    money: "Cash flow, downside tolerance and the actual terms of the decision.",
    health: "Actual symptoms, clinical findings and day-to-day load.",
    choice: "Whether both options are being compared under the same real-world conditions.",
    timing: "Whether the real-world prerequisites are ready when the window arrives.",
    self: "What you repeatedly do in the current environment, not the label itself.",
    past: "This module is symbolic and should not be treated as historical proof.",
    home: "Budget, commute, contract terms and the actual living environment.",
  } : t ? {
    career: "實際合約、現金流、責任邊界與退出成本。", love: "對方持續的實際行動、承諾與邊界。", money: "現金流、可承受損失與交易／合約條件。", health: "真實症狀、檢查結果與日常負荷。",
    choice: "兩個選項是否在同一組現實條件下比較。", timing: "窗口到來時，現實前置條件是否已準備好。", self: "你在當前環境中的重複行動，而不是標籤本身。", past: "本模組屬象徵層，不應當作歷史事實證明。", home: "預算、通勤、合約與實際居住環境。",
  } : {
    career: "实际合同、现金流、责任边界与退出成本。", love: "对方持续的实际行动、承诺与边界。", money: "现金流、可承受损失与交易／合同条件。", health: "真实症状、检查结果与日常负荷。",
    choice: "两个选项是否在同一组现实条件下比较。", timing: "窗口到来时，现实前置条件是否已准备好。", self: "你在当前环境中的重复行动，而不是标签本身。", past: "本模块属象征层，不应当作历史事实证明。", home: "预算、通勤、合同与实际居住环境。",
  };
  return map[contract.kind];
}

function practicalRisk(result: AnalysisResult, contract: QuestionContract): string[] {
  const locale = localeOf(result);
  const t = locale === "zh-Hant";
  const lines: string[] = [];
  if (result.chart.timeUnknown) {
    lines.push(locale === "en"
      ? "Birth-hour-dependent details are not used as hard conclusions."
      : t ? "時辰未確定，所有依賴時柱的內容不得當成硬結論。" : "时辰未确定，所有依赖时柱的内容不得当成硬结论。");
  }
  if (contract.requirements.asksMedicalTiming) {
    lines.push(locale === "en"
      ? "Do not use metaphysical timing to delay or replace clinical care."
      : t ? "不得用命理時間延誤或取代實際醫療。" : "不得用命理时间延误或取代实际医疗。");
  } else if (contract.requirements.asksInvestmentPick) {
    lines.push(locale === "en"
      ? "Do not treat the reading as a security pick, return forecast or loss guarantee."
      : t ? "不得把命理解讀當成投資標的、收益預測或虧損保證。" : "不得把命理解读当成投资标的、收益预测或亏损保证。");
  } else {
    const generic: Record<QuestionKind, string> = locale === "en" ? {
      career: "A direction that fits the chart can still be a poor move if pay, workload or exit terms are bad.",
      love: "Do not use interpretation to explain away inconsistent contact, unclear commitment or crossed boundaries.",
      money: "A favourable period does not remove downside risk, cash-flow pressure or bad contract terms.",
      health: "Traditional body symbolism is an observation aid, not a diagnosis or treatment plan.",
      choice: "If the two options are not compared on the same facts, a forced A/B answer is unreliable.",
      timing: "A useful window is not a deadline or guarantee; prerequisites still matter.",
      self: "Do not turn a structural description into a fixed personality label.",
      past: "Symbolic past-life material is not historical evidence and must not override the main chart judgement.",
      home: "A favourable direction does not override affordability, commute, safety or contract terms.",
    } : t ? {
      career: "即使方向合盤，若薪酬、負荷或退出條件差，仍可能是壞選擇。", love: "不要用命理解釋去替持續失聯、承諾含糊或越界行為找理由。", money: "有利時段不會消除下行風險、現金流壓力或不利條款。", health: "身體象義只作觀察地圖，不是診斷或治療方案。",
      choice: "若兩個選項不是用同一組事實比較，強行二選一不可靠。", timing: "時間窗口不是截止日或保證，現實前置條件仍要成立。", self: "不要把結構描述變成固定人格標籤。", past: "前世象徵材料不是歷史證據，也不能反過來覆蓋子平主判。", home: "方位取象不能凌駕預算、通勤、安全與合約條件。",
    } : {
      career: "即使方向合盘，若薪酬、负荷或退出条件差，仍可能是坏选择。", love: "不要用命理解读替持续失联、承诺含糊或越界行为找理由。", money: "有利时段不会消除下行风险、现金流压力或不利条款。", health: "身体象义只作观察地图，不是诊断或治疗方案。",
      choice: "若两个选项不是用同一组事实比较，强行二选一不可靠。", timing: "时间窗口不是截止日或保证，现实前置条件仍要成立。", self: "不要把结构描述变成固定人格标签。", past: "前世象征材料不是历史证据，也不能反过来覆盖子平主判。", home: "方位取象不能凌驾预算、通勤、安全与合同条件。",
    };
    lines.push(generic[contract.kind]);
  }
  return dedupe(lines).slice(0, 3);
}

function fallbackAction(kind: QuestionKind, locale: AppLocale): string {
  if (locale === "en") {
    const map: Record<QuestionKind, string> = {
      career: "Compare pay, responsibility, growth, workload and exit cost on one page before committing.",
      love: "Judge the next step by consistent contact, actual plans, commitment and respected boundaries.",
      money: "Set the maximum acceptable loss, cash-flow limit and exit rule before acting.",
      health: "Use the reading only as an observation prompt and follow actual symptoms and clinical advice.",
      choice: "Put both options under the same criteria and remove any option that fails a non-negotiable condition.",
      timing: "Prepare the prerequisite now, then act inside the first workable window rather than waiting passively.",
      self: "Pick one recurring pattern to observe for two weeks and judge it by real outcomes.",
      past: "Use the symbolic result as a reflection prompt, not as proof of an historical event.",
      home: "Compare budget, commute, contract and daily living conditions before making the move.",
    };
    return map[kind];
  }
  const t = locale === "zh-Hant";
  const map: Record<QuestionKind, string> = t ? {
    career: "把收入、責任、成長、負荷與退出成本放在同一張表，再決定是否推進。", love: "只看持續聯絡、實際見面、明確承諾與邊界是否成立。", money: "先寫清可承受損失、現金流上限與退出條件，再談收益。", health: "只把命理當觀察提示，症狀與醫療判斷優先。",
    choice: "用同一組條件比較兩個選項，先淘汰踩到不可接受條件的一方。", timing: "先把前置條件準備好，窗口出現時執行，不被動等待。", self: "挑一個反覆出現的模式觀察兩週，用實際結果驗證。", past: "把象徵結果當作自我觀察線索，不當作歷史事實。", home: "把預算、通勤、合約與日常居住條件一起比較後再決定。",
  } : {
    career: "把收入、责任、成长、负荷与退出成本放在同一张表，再决定是否推进。", love: "只看持续联系、实际见面、明确承诺与边界是否成立。", money: "先写清可承受损失、现金流上限与退出条件，再谈收益。", health: "只把命理当观察提示，症状与医疗判断优先。",
    choice: "用同一组条件比较两个选项，先淘汰踩到不可接受条件的一方。", timing: "先把前置条件准备好，窗口出现时执行，不被动等待。", self: "挑一个反复出现的模式观察两周，用实际结果验证。", past: "把象征结果当作自我观察线索，不当作历史事实。", home: "把预算、通勤、合同与日常居住条件一起比较后再决定。",
  };
  return map[kind];
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
  const directFull = customerDirectAnswer(result.question, result.reading.directAnswer);
  const directAnswer = sentenceParts(directFull).slice(0, 2).join(locale === "en" ? " " : "");
  const reasons = compactLines(topicSource(result.reading, contract.kind), 3);
  const timing = contract.requirements.asksWhen || contract.kind === "timing"
    ? compactLines(result.reading.rhythm, 3)
    : [];
  const actions = compactLines(result.reading.action, 3);
  const confidenceState = confidence(result, contract);
  const draft = {
    contract,
    directAnswer: directAnswer || directFull,
    ...confidenceState,
    biggestVariable: biggestVariable(result, contract),
    reasons: reasons.length ? reasons : compactLines(result.reading.rhythm, 2),
    risks: practicalRisk(result, contract),
    timing,
    actions: actions.length ? actions : [fallbackAction(contract.kind, locale)],
    sectionOrder: sectionOrder(contract.answerMode, timing.length > 0),
    supportingModules: supportingModules(contract),
  };
  return { ...draft, validationIssues: validateDecisionReportModel(draft) };
}
