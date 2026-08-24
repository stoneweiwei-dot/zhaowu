import type { AnalysisResult, AppLocale, Chart, Reading } from "@/lib/bazi/types";
import { customerCopy, customerDirectAnswer } from "@/lib/report/customer-copy";
import { inspectAnswerRequirements } from "@/lib/core/answer-contract";
import { pickTravelDestinations } from "@/lib/bazi/forecast";

export type ReportSectionEvidence = {
  facts: string[];
  conditions: string[];
  limits: string[];
  checks: string[];
};

export type ReportSection = {
  sectionNo: number;
  /** Legacy storage alias only. New UI must use sectionNo / section language, never page language. */
  pageNo: number;
  key: "conclusion" | "basis" | "timing" | "action" | "relationship";
  title: string;
  body: string[];
  optional?: boolean;
  evidence: ReportSectionEvidence;
};


const STEM_EN: Record<string, string> = {
  甲: "Jia", 乙: "Yi", 丙: "Bing", 丁: "Ding", 戊: "Wu",
  己: "Ji", 庚: "Geng", 辛: "Xin", 壬: "Ren", 癸: "Gui",
};

const BRANCH_EN: Record<string, string> = {
  子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si",
  午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai",
};

const ELEMENT_EN: Record<string, string> = {
  木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water",
};

function englishGanZhi(value: string): string {
  if (!value || value.length < 2) return "unconfirmed";
  const stem = STEM_EN[value[0]];
  const branch = BRANCH_EN[value[1]];
  return stem && branch ? `${stem}-${branch}` : "unconfirmed";
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

function composeEnglishFocusedReport(result: AnalysisResult): ReportSection[] {
  const { reading, chart } = result;
  const dayMaster = `${STEM_EN[chart.dayMaster] ?? "Unconfirmed"} (${ELEMENT_EN[chart.dayMasterElement] ?? "Element unconfirmed"})`;
  const monthCommand = BRANCH_EN[chart.monthBranch] ?? "Unconfirmed";
  const basis = [
    `Day Master: ${dayMaster}. Month Command: ${monthCommand}.`,
    chart.currentDayun
      ? `Current ten-year cycle: ${englishGanZhi(chart.currentDayun.ganZhi)} (${chart.currentDayun.startYear}–${chart.currentDayun.endYear}).`
      : "",
    chart.timeUnknown
      ? "Birth time is unconfirmed, so the hour pillar and cycle start are not used as hard conclusions."
      : "",
    englishTopicBody(reading),
  ].filter(Boolean);

  const sections: ReportSection[] = [
    {
      sectionNo: 1,
      pageNo: 1,
      key: "conclusion",
      title: "Direct conclusion",
      body: [reading.directAnswer],
      evidence: {
        facts: ["question", "reading.kind", "reading.directAnswer"],
        conditions: ["Answer the original question first"],
        limits: ["Do not add unrelated personality copy"],
        checks: ["No repeated question prefix"],
      },
    },
    {
      sectionNo: 2,
      pageNo: 2,
      key: "basis",
      title: "Chart basis",
      body: Array.from(new Set(basis)),
      evidence: {
        facts: ["dayMaster", "monthBranch", "currentDayun", "topic reading"],
        conditions: ["Keep only evidence relevant to the question"],
        limits: ["Do not expose an internal reasoning chain"],
        checks: ["No unrelated topic sections"],
      },
    },
    {
      sectionNo: 3,
      pageNo: 3,
      key: "timing",
      title: "Timing and rhythm",
      body: [reading.rhythm],
      evidence: {
        facts: ["reading.rhythm", "currentDayun"],
        conditions: ["Use timing as a planning window"],
        limits: ["Do not promise an outcome date"],
        checks: ["Timing must serve the question"],
      },
    },
    {
      sectionNo: 4,
      pageNo: 4,
      key: "action",
      title: "Practical action",
      body: [reading.action],
      evidence: {
        facts: ["reading.action", "reading.kind"],
        conditions: ["Advice must be executable"],
        limits: ["Do not repeat earlier sections"],
        checks: ["Priority action must match the conclusion"],
      },
    },
  ];

  if (reading.kind === "love") {
    sections.push({
      sectionNo: 5,
      pageNo: 5,
      key: "relationship",
      title: "Relationship conditions",
      body: [
        reading.love,
        "Look for consistent contact, concrete plans, explicit commitment, and respected boundaries.",
      ],
      optional: true,
      evidence: {
        facts: ["reading.kind=love", "reading.love"],
        conditions: ["Only shown for relationship questions"],
        limits: ["Do not add this section to unrelated questions"],
        checks: ["Every line must serve the original question"],
      },
    });
  }

  return sections;
}

function hasMultiTopicAnswer(reading: Reading): boolean {
  return /分開回答|分开回答|分開排|分开排/.test(reading.directAnswer);
}

function travelNames(question: string, chart: Chart): string[] {
  const req = inspectAnswerRequirements(question);
  return pickTravelDestinations(chart, req.targetYears[0], req.targetMonths).map((place) => place.name);
}

function topicLines(question: string, reading: Reading, chart: Chart): string[] {
  const req = inspectAnswerRequirements(question);
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
    case "career":
      return [customerCopy(reading.work)];
    case "money":
      return [customerCopy(reading.money)];
    case "health":
      return [customerCopy(reading.body)];
    case "home":
      return [customerCopy(reading.home)];
    case "past":
    case "self":
      return [customerCopy(reading.rhythm)];
    case "timing":
      return ["这题只保留与时间窗口有关的判断，不额外扩写工作、感情或财务。"];
    case "choice":
      return ["这题只比较选项本身的方向、代价和退出难度，不为了凑内容加入旁支主题。"];
    case "love":
      return ["关系题的对象与互动细节放在后面的条件区，本节只保留命盘与当前阶段的依据。"];
    default:
      return [];
  }
}

function basisBody(question: string, reading: Reading, chart: Chart): string[] {
  const body = [
    `命盘落点：日主 ${chart.dayMaster}${chart.dayMasterElement}，月令 ${chart.monthBranch}。`,
    chart.currentDayun
      ? `当前阶段：${chart.currentDayun.ganZhi}大运（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）。`
      : "",
    chart.timeUnknown ? "出生时间未确定，因此本次不把时柱与大运起运当作硬结论依据。" : "",
    ...topicLines(question, reading, chart),
  ].filter(Boolean);

  return Array.from(new Set(body));
}

function timingBody(question: string, reading: Reading, chart: Chart): string[] {
  const req = inspectAnswerRequirements(question);
  if (req.asksTravel) {
    const names = travelNames(question, chart);
    return [
      customerCopy(reading.rhythm),
      `节奏上先锁定主选 ${names[0]}，再把较顺月份与假期、预算、体力和签证一起确认；不要同时铺开三地。`,
    ].filter(Boolean);
  }

  return [customerCopy(reading.rhythm)].filter(Boolean);
}

function actionBody(question: string, reading: Reading, chart: Chart): string[] {
  const req = inspectAnswerRequirements(question);
  const lines = [customerCopy(reading.action)].filter(Boolean);

  if (req.asksTravel) {
    const names = travelNames(question, chart);
    lines.push(`执行顺序：先定 ${names[0]}，再订交通和住宿；备选只留一个。`);
    return lines;
  }

  switch (reading.kind) {
    case "career":
      lines.push("把职位、收入、成长空间、责任和退出成本放在同一张表里，只推进最值得的一条。");
      break;
    case "love":
      lines.push("只看持续联系、实际见面、明确承诺和边界；没有这些，就不要靠解释补关系。 ");
      break;
    case "money":
      lines.push("先写清风险上限、现金流和退出条件，再考虑收益空间。 ");
      break;
    case "health":
      lines.push("先稳定睡眠、作息与身体负荷；不适持续、加重或影响活动时及时就医。 ");
      break;
    case "home":
      lines.push("实地核对采光、噪音、通勤、预算和真实居住感受后再决定。 ");
      break;
    case "choice":
      lines.push("先排除代价无法承受的选项，再比较长期收益与退出难度。 ");
      break;
    case "timing":
      lines.push("把较顺窗口当成准备优先级，不把它当成保证成功的日期。 ");
      break;
    case "past":
      lines.push("把象征结果当成自我观察线索，只保留能解释现实重复模式的部分。 ");
      break;
    default:
      break;
  }

  return lines.map((line) => line.trim()).filter(Boolean);
}

function relationshipSection(reading: Reading): ReportSection | null {
  if (reading.kind !== "love") return null;
  return {
    sectionNo: 5,
    pageNo: 5,
    key: "relationship",
    title: "关系与对象",
    body: [
      customerCopy(reading.love),
      "观察重点：对方是否持续联系、主动安排见面，并愿意把关系与边界说清楚。",
    ].filter(Boolean),
    optional: true,
    evidence: {
      facts: ["reading.kind=love", "reading.love"],
      conditions: ["只有关系问题才出现"],
      limits: ["不得在职业、财务、健康等无关问题中硬塞关系画像"],
      checks: ["本节必须与用户原问直接相关"],
    },
  };
}

/**
 * 昭梧完整报告：4 个固定核心区 + 最多 1 个文字条件区。
 * 图像模块（个人命诰图）独立于文字结构，由用户主动生成，失败不得阻塞文字报告。
 */
export function composeFocusedReport(result: AnalysisResult): ReportSection[] {
  if (result.locale === "en") return composeEnglishFocusedReport(result);
  const { question, chart, reading } = result;

  const sections: ReportSection[] = [
    {
      sectionNo: 1,
      pageNo: 1,
      key: "conclusion",
      title: "直接结论",
      body: [customerDirectAnswer(question, reading.directAnswer)],
      evidence: {
        facts: ["question", "reading.kind", "reading.directAnswer"],
        conditions: ["第一屏直接回答原问题", "复合问题必须逐项回答"],
        limits: ["不得用无关人格句补字数", "不得调用未接入流派补强结论"],
        checks: ["不得以资料不足／仅供参考开场", "不得重复问题前缀"],
      },
    },
    {
      sectionNo: 2,
      pageNo: 2,
      key: "basis",
      title: "命理依据",
      body: basisBody(question, reading, chart),
      evidence: {
        facts: ["dayMaster", "monthBranch", "currentDayun", "question-specific reading field"],
        conditions: ["只保留与当前问题直接相关的依据"],
        limits: ["不展示内部推理链", "不把未实现的格局／病药／刑冲合害写成已完成"],
        checks: ["删掉任何与原问无关的主题段落"],
      },
    },
    {
      sectionNo: 3,
      pageNo: 3,
      key: "timing",
      title: "时间与节奏",
      body: timingBody(question, reading, chart),
      evidence: {
        facts: ["reading.rhythm", "currentDayun", "travel windows when requested"],
        conditions: ["时间题、出行题必须给可执行窗口；非时间题只讲当前节奏"],
        limits: ["不得承诺必成日期"],
        checks: ["内容必须服务原问题"],
      },
    },
    {
      sectionNo: 4,
      pageNo: 4,
      key: "action",
      title: "现实行动",
      body: actionBody(question, reading, chart),
      evidence: {
        facts: ["reading.action", "reading.kind"],
        conditions: ["建议必须可以在现实中执行"],
        limits: ["不重复前文凑字数"],
        checks: ["最高优先行动与第 1 节结论一致"],
      },
    },
  ];

  const relationship = relationshipSection(reading);
  if (relationship) sections.push(relationship);

  return sections;
}

export function renderFocusedReportText(sections: ReportSection[], locale: AppLocale = "zh-Hans"): string {
  const separator = locale === "en" ? " | " : "｜";
  const blocks = sections.map((section) => [
    `${String(section.sectionNo).padStart(2, "0")}${separator}${section.title}`,
    "",
    ...section.body,
  ].join("\n"));
  const title = locale === "en" ? "Zhaowu | Personal full report" : "昭梧｜专属完整报告";
  return [title, "", ...blocks].join("\n\n");
}

export function composeFocusedReportText(result: AnalysisResult): string {
  return renderFocusedReportText(composeFocusedReport(result), result.locale);
}
