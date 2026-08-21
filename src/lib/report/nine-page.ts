import type { AnalysisResult, Chart, QuestionKind, Reading } from "@/lib/bazi/types";

export type NinePageEvidence = {
  facts: string[];
  conditions: string[];
  limits: string[];
  checks: string[];
};

export type NinePage = {
  pageNo: number;
  key: string;
  title: string;
  body: string[];
  evidence: NinePageEvidence;
};


function customerCopy(value: string): string {
  const text = value
    .trim()
    .replace(/調候粗候選[^。！？!?]*[。！？!?]?/g, "")
    .replace(/调候粗候选[^。！？!?]*[。！？!?]?/g, "")
    .replace(/此為旺衰底盤[^。！？!?]*[。！？!?]?/g, "")
    .replace(/此为旺衰底盘[^。！？!?]*[。！？!?]?/g, "")
    .replace(/[，,；;]\s*不再用通用性格句代替答案/g, "。")
    .replace(/[，,；;]\s*不把它包裝成必然事件或保證日期/g, "。")
    .replace(/[，,；;]\s*不把它包装成必然事件或保证日期/g, "。");

  const internalCopy =
    /全站回答契約|全站回答契约|本頁只使用|本页只使用|排序依據|排序依据|月份名稱只是|月份名称只是|命理月以節氣|命理月以节气|通用句|資料未接入|资料未接入|尚未完成|待覆核|待覆核|不是完整子平|不是喜用神|方法透明|報告編號|报告编号|隱藏算法|隐藏算法/;

  return (text.match(/[^。！？!?]+[。！？!?]?/g) ?? [text])
    .map((part) => part.trim())
    .filter((part) => part && !internalCopy.test(part))
    .join("");
}

function customerDirectAnswer(question: string, answer: string): string {
  let text = answer.trim();
  const quotedQuestion = question.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  text = text.replace(new RegExp(`^你[問问]的是[「“"]?${quotedQuestion}[」”"]?[。．.]?\\s*`), "");
  text = text.replace(/^先直接回答(?:時間|时间)?[：:]\s*/, "");
  return customerCopy(text) || "请先从报告列出的重点开始，再结合你的现实条件作决定。";
}

function isReadyPillar(col: Chart["pillars"][number]): boolean {
  return col.ready !== false && col.ganZhi !== "未定" && Boolean(col.gan);
}

function hasMultiTopicAnswer(reading: Reading): boolean {
  return /分開回答|分开回答|分開排|分开排/.test(reading.directAnswer);
}

function page4Body(question: string, reading: Reading): string[] {
  if (hasMultiTopicAnswer(reading)) {
    const topics = [
      { match: /工作|事業|事业|職業|职业|學業|学业/, label: "工作重点", value: reading.work },
      { match: /財務|财务|金錢|金钱|收入|投資|投资/, label: "财务重点", value: reading.money },
      { match: /感情|關係|关系|伴侶|伴侣|婚姻/, label: "关系重点", value: reading.love },
      { match: /健康|身體|身体|睡眠/, label: "身心重点", value: reading.body },
      { match: /住|房|搬家|居家/, label: "居住重点", value: reading.home },
    ]
      .filter((topic) => topic.match.test(question))
      .map((topic) => `${topic.label}｜${customerCopy(topic.value)}`)
      .filter((line) => !line.endsWith("｜"));
    return [...topics, "建议分别处理这些问题，先推进现实条件最清楚的一项。"];
  }

  switch (reading.kind) {
    case "career":
      return [customerCopy(reading.work)];
    case "love":
      return [customerCopy(reading.love), "重点看对方是否持续联系、主动安排见面，并愿意把关系说清楚。"];
    case "money":
      return [customerCopy(reading.money), "决定前先确认现金流、可承受损失和退出条件。"];
    case "health":
      return [customerCopy(reading.body), "如果不适持续、加重或影响睡眠与活动，请及时就医检查。"];
    case "home":
      return [customerCopy(reading.home), "最终选择同时考虑采光、通勤、预算与实际居住感受。"];
    case "timing":
      return ["把报告列出的较顺月份与假期、预算、工作安排及同行人的时间一起确认。"];
    case "choice":
      return ["把两个选项按收益、成本、风险与退出难度放在同一张表比较。"];
    case "past":
      return [customerCopy(reading.rhythm)];
    case "self":
    default:
      return ["留意自己在压力下反复出现的选择模式，再决定最值得改变的一处。"];
  }
}

function page6Body(reading: Reading): string[] {
  switch (reading.kind) {
    case "career":
      return ["把职位、收入、成长空间、责任与退出成本放在一起比较，再决定下一步。"];
    case "love":
      return ["以持续联系、实际见面、明确承诺和边界作为关系判断标准。"];
    case "money":
      return ["先定风险上限和退出条件，再考虑收益空间。"];
    case "health":
      return ["先稳定睡眠、作息与身体负荷；已有持续症状就安排专业检查。"];
    case "home":
      return ["实地核对采光、噪音、通勤、预算与居住舒适度后再决定。"];
    case "timing":
      return ["优先准备报告列出的较顺月份，同时保留一个现实可行的备选窗口。"];
    case "choice":
      return ["先排除代价无法承受的选项，再比较长期收益与退出难度。"];
    case "past":
      return ["把结果当作自我观察线索，重点看它能否解释现实中反复出现的模式。"];
    case "self":
    default:
      return ["从最近三次真实经历中找共同点，再决定下一步要改变什么。"];
  }
}

function page7Guide(chart: Chart, reading: Reading): string[] {
  if (chart.usefulProvisional) {
    return [
      "颜色与方位不必刻意追求固定答案。",
      "现阶段更重要的是选择让你精神稳定、行动顺畅、能够长期坚持的环境与安排。",
    ];
  }
  return [
    `较有利颜色：${reading.guide.colors.join("、") || "—"}`,
    `现在不必刻意放大：${reading.guide.avoidColors.join("、") || "—"}`,
    `较有利方位：${reading.guide.directions.favor.join("、") || "—"}`,
    `较适合时段：${reading.guide.hours.favor.join("、") || "—"}`,
    reading.guide.pet ? `宠物取象：${reading.guide.pet}` : "",
  ].filter(Boolean);
}

/**
 * 付费九页结构化报告。
 * 关键规则：只消费已经由 answer-contract 校验后的 reading；报告层不得再另写一套旧判断。
 */
export function composeNinePages(result: AnalysisResult): NinePage[] {
  const { question, chart, reading, palm } = result;
  const pillars = chart.pillars
    .map((col) =>
      isReadyPillar(col)
        ? `${col.label} ${col.ganZhi}（${col.nayin}／${col.shiShenGan}／十二长生${col.diShi}）`
        : `${col.label} 暂未确定`,
    )
    .join("\n");

  const page1: NinePage = {
    pageNo: 1,
    key: "question",
    title: "核心结论",
    body: [customerDirectAnswer(question, reading.directAnswer)],
    evidence: {
      facts: ["question", "reading.kind", "reading.directAnswer"],
      conditions: ["首屏必须覆盖用户真正问到的维度", "复合问题必须逐项回答"],
      limits: ["不得用通用人格句填补未计算能力", "不得调用未接入流派补强结论"],
      checks: ["首屏直接回答原问题", "不得以资料不足／仅供参考开场", "不得复制过期专用模板覆盖最新引擎结果"],
    },
  };

  const page2Body = [
    pillars,
    `日主 ${chart.dayMaster}${chart.dayMasterElement}　月令 ${chart.monthBranch}`,
    chart.currentDayun
      ? `当前大运：${chart.currentDayun.ganZhi}（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）`
      : "",
    chart.timeUnknown ? "出生时间尚未确定，因此时柱与大运暂不列入本次判断。" : "",
  ].filter(Boolean);

  const page2: NinePage = {
    pageNo: 2,
    key: "chart",
    title: "命盘概览",
    body: page2Body,
    evidence: {
      facts: ["pillars", "monthBranch", "dayMaster", "timezone", "trueSolar", "dayun"],
      conditions: ["timeUnknown 时，时柱／命宫／大运起运必须留白"],
      limits: ["本页不讨论格局成败、正式病药、从化结论"],
      checks: ["1988-10-04 必须为酉月，不得写戌月"],
    },
  };

  const page3: NinePage = {
    pageNo: 3,
    key: "rhythm",
    title: "你的内在节奏",
    body: [customerCopy(reading.rhythm)].filter(Boolean),
    evidence: {
      facts: ["chart.strength.*", "reading.rhythm"],
      conditions: ["只可称旺衰底盘"],
      limits: ["不得把 useful/drain 写成正式喜用神", "不得写已完成格局／病药／刑冲合害全链"],
      checks: ["全文不得出现「12 步已完成」「最终喜用已定」"],
    },
  };

  const page4: NinePage = {
    pageNo: 4,
    key: "themes",
    title: reading.kind === "timing" ? "如何安排" : hasMultiTopicAnswer(reading) ? "分别来看" : "这件事的重点",
    body: page4Body(question, reading),
    evidence: {
      facts: ["reading.kind", "reading.directAnswer", "reading.rhythm", "对应主题字段"],
      conditions: ["只展示与问题高度相关内容", "多主题问题必须分开"],
      limits: ["不得为了凑版面塞两个无关次课题", "健康不做医疗诊断", "投资不做收益保证"],
      checks: ["职业题不自动塞感情段", "感情题不自动塞财务段", "时间题不得再显示旧的‘尚未补算’模板"],
    },
  };

  const page5: NinePage = {
    pageNo: 5,
    key: "decree",
    title: "个人命诰",
    body: [customerCopy(reading.decree)].filter(Boolean),
    evidence: {
      facts: ["reading.decree", "已成立主判"],
      conditions: ["命诰必须能被第 1–4 页的事实回溯"],
      limits: ["不得加入宇宙灵魂原型、星际种子、阿卡西客观断言等剔除项"],
      checks: ["删掉命诰后，前四页仍能独立成立"],
    },
  };

  const page6: NinePage = {
    pageNo: 6,
    key: "practice",
    title: "怎么把这张盘用到现实里",
    body: page6Body(reading),
    evidence: {
      facts: ["reading.kind", "对应主题字段", "reading.rhythm"],
      conditions: ["建议必须对应本题并能在现实验证"],
      limits: ["不得从未定喜用派生职业吉凶、宠物、摆设", "不得复制第 8 页的同一句行动来凑页数"],
      checks: ["本页解释现实使用方式；第 8 页才给唯一最高优先行动"],
    },
  };

  const page7: NinePage = {
    pageNo: 7,
    key: "guide",
    title: chart.usefulProvisional ? "适合你的生活环境" : "颜色 · 方位 · 时段",
    body: page7Guide(chart, reading),
    evidence: {
      facts: ["usefulProvisional", "guide"],
      conditions: ["只有 usefulProvisional=false 才能输出具体生活取象"],
      limits: ["当前不能把粗候选冒充正式喜用"],
      checks: ["usefulProvisional=true 时不得自动冒出具体幸运色／方位／宠物"],
    },
  };

  const page8: NinePage = {
    pageNo: 8,
    key: "priority",
    title: "现在最该做的一件事",
    body: [customerCopy(reading.action)].filter(Boolean),
    evidence: {
      facts: ["reading.action", "currentDayun", "currentYear"],
      conditions: ["有可靠大运才显示大运句"],
      limits: ["不得声称已经完成完整岁运作用链", "不得用固定七天睡眠模板覆盖不同题目"],
      checks: ["只有一个最高优先行动", "行动必须与第 1 页问题一致"],
    },
  };

  const palmNote =
    reading.kind === "past" && palm?.ready
      ? `前世主题：${palm.palaces.map((x) => `${x.zhi}・${x.star}｜${x.dao}`).join("；")}`
      : "";

  const page9: NinePage = {
    pageNo: 9,
    key: "close",
    title: "给你的最后一句",
    body: [customerCopy(reading.lastLine), palmNote].filter(Boolean),
    evidence: {
      facts: ["reading.lastLine", "methodProtocol", "palm"],
      conditions: ["未接入方法只显示状态，不生成内容"],
      limits: ["不得写假宫位／星曜／相位／Dasha／卦爻／奇门盘"],
      checks: ["方法区最多四卡", "状态词只能三种"],
    },
  };

  return [page1, page2, page3, page4, page5, page6, page7, page8, page9];
}

export function renderNinePageText(pages: NinePage[]): string {
  const blocks = pages.map((p) => {
    const head = `第 ${p.pageNo} 页｜${p.title}`;
    return [head, "", ...p.body].join("\n");
  });
  return ["昭梧｜专属九页报告", "", ...blocks].join("\n\n");
}

export function composeNinePageReport(result: AnalysisResult): string {
  return renderNinePageText(composeNinePages(result));
}
