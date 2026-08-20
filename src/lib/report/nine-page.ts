import type { AnalysisResult, Chart, QuestionKind, Reading } from "@/lib/bazi/types";
import type { MethodProtocol } from "@/lib/core/types";

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

function isReadyPillar(col: Chart["pillars"][number]): boolean {
  return col.ready !== false && col.ganZhi !== "未定" && Boolean(col.gan);
}

function hasMultiTopicAnswer(reading: Reading): boolean {
  return /分開回答|分开回答|分開排|分开排/.test(reading.directAnswer);
}

function primaryTopic(kind: QuestionKind, reading: Reading): string {
  switch (kind) {
    case "career": return reading.work;
    case "love": return reading.love;
    case "money": return reading.money;
    case "health": return reading.body;
    case "home": return reading.home;
    case "choice":
    case "timing":
    case "past": return reading.directAnswer;
    case "self":
    default: return reading.rhythm;
  }
}

function page4Body(question: string, reading: Reading): string[] {
  if (hasMultiTopicAnswer(reading)) {
    return [
      reading.directAnswer,
      "这题包含多个领域，报告继续分开写；不拿一个领域的月份、性格或结论去代替另一个领域。",
      "核对标准：每个领域都必须能回到原问题中的对应部分。",
    ];
  }

  switch (reading.kind) {
    case "career":
      return [
        `主课题｜${reading.work}`,
        `底层节奏｜${reading.rhythm}`,
        "核对点：职位、责任、输出方式、收入与退出成本是否真的符合这条判断。",
      ];
    case "love":
      return [
        `主课题｜${reading.love}`,
        `底层节奏｜${reading.rhythm}`,
        "核对点：对方是否主动、是否安排下一次见面、关系是否被说清楚；不靠猜心补剧情。",
      ];
    case "money":
      return [
        `主课题｜${reading.money}`,
        `底层节奏｜${reading.rhythm}`,
        "核对点：收入结构、固定支出、风险承载、退出条件；不把财运等同于某个标的一定上涨。",
      ];
    case "health":
      return [
        `主课题｜${reading.body}`,
        `底层节奏｜${reading.rhythm}`,
        "核对点：症状、频率、睡眠、检查与医生意见；命理只看生活压力与节奏，不作诊断。",
      ];
    case "home":
      return [
        `主课题｜${reading.home}`,
        `底层节奏｜${reading.rhythm}`,
        "核对点：真实住宅还要看平面图、坐向、采光与道路；出生盘不单独替现实房屋下风水结论。",
      ];
    case "timing":
      return [
        reading.directAnswer,
        "时间题只认已经计算出来的目标年／月份排序；不再拿“现在就是窗口”之类通用句替代应期。",
        "排序是窗口比较，不是保证某件事一定在某月发生。",
      ];
    case "choice":
      return [
        reading.directAnswer,
        "选择题必须把两个选项放在同一组现实标准下比较；没有分别提供的条件，就不假装已经替两边算完。",
      ];
    case "past":
      return [
        reading.directAnswer,
        "前世题只保留已排出的一掌经宫位与六道结果，不追加没有来源的故事。",
      ];
    case "self":
    default:
      return [
        `主课题｜${primaryTopic(reading.kind, reading)}`,
        "核对点：拿最近三次真实事件验证；对不上就删，不为了凑版面硬解释。",
      ];
  }
}

function page6Body(reading: Reading): string[] {
  switch (reading.kind) {
    case "career":
      return [
        `现实落点｜${reading.work}`,
        "把职位、收入、成长空间、责任与退出成本放在同一张表；命盘只负责补充承载与节奏。",
      ];
    case "love":
      return [
        `现实落点｜${reading.love}`,
        "关系判断只认可验证行为：联系、见面、承诺、边界与是否持续投入。",
      ];
    case "money":
      return [
        `现实落点｜${reading.money}`,
        "先看现金流、风险上限与退出条件；命盘不替代财务或投资分析。",
      ];
    case "health":
      return [
        `现实落点｜${reading.body}`,
        "已有痛、失眠、掉力或持续症状就看医生；报告不提供医疗诊断和保证日期。",
      ];
    case "home":
      return [
        `现实落点｜${reading.home}`,
        "真要落到房屋与空间，再补平面图、坐向、采光、道路与真实居住条件。",
      ];
    case "timing":
      return [
        "现实落点｜先把报告给出的较顺月份与现实条件叠加：假期、预算、工作、机票、对方时间或具体事件条件。",
        "月份排序只用于缩小窗口，不把整年切成绝对好坏。",
      ];
    case "choice":
      return [
        "现实落点｜两个选项统一用同一套标准比较：收益、成本、责任、距离、风险与退出条件。",
        "无法量化或没有资料的部分明确留白，不用命盘替事实补空。",
      ];
    case "past":
      return [
        "现实落点｜只把已排出的宫位当作自我观察线索，不用它给现实关系或重大决定背书。",
      ];
    case "self":
    default:
      return [
        `现实落点｜${reading.rhythm}`,
        "用最近三次真实事件核对这条模式，再决定要不要保留。",
      ];
  }
}

function page7Guide(chart: Chart, reading: Reading): string[] {
  if (chart.usefulProvisional) {
    return [
      "正式取用尚未完成。",
      "当前只得到流通粗候选，不足以负责任地给出幸运色、方位、时段、宠物、摆设或职业吉凶。此页暂不硬填。",
      `流通粗候选（待覆核）：${chart.useful.join("、") || "—"}　暂不必放大：${chart.drain.join("、") || "—"}`,
      "不要把上面的粗候选叫作喜用神。",
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

function methodLines(protocol?: MethodProtocol): string[] {
  if (!protocol) return ["方法协议未附带。"];
  const cards = [protocol.primary, ...protocol.selected].slice(0, 4);
  return [
    protocol.routingReason,
    ...cards.map((c) => `${c.name}｜${c.status}｜${c.strength}`),
  ];
}

/**
 * 付费九页结构化报告。
 * 关键规则：只消费已经由 answer-contract 校验后的 reading；报告层不得再另写一套旧判断。
 */
export function composeNinePages(result: AnalysisResult): NinePage[] {
  const { question, chart, reading, methodProtocol, palm, id, createdAt } = result;
  const pillars = chart.pillars
    .map((col) =>
      isReadyPillar(col)
        ? `${col.label} ${col.ganZhi}（${col.nayin}／${col.shiShenGan}／十二长生${col.diShi}）`
        : `${col.label} 未定（不伪造午时）`,
    )
    .join("\n");

  const page1: NinePage = {
    pageNo: 1,
    key: "question",
    title: `你真正问的是：${question}`,
    body: [
      reading.directAnswer,
      "本页只使用已经通过全站回答契约的结论；时间、地点、比较、医疗、投资等问题都必须先覆盖原问题本身。",
      "先给结论，再看为什么。",
    ],
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
    `出生地／时区：${chart.cityLabel}／${chart.timezone}`,
    chart.usedTrueSolar && !chart.timeUnknown
      ? `真太阳时：${chart.trueSolarStamp}`
      : chart.timeUnknown
        ? "真太阳时：时辰未定，不作校正"
        : "真太阳时：未套用",
    chart.currentDayun
      ? `当前大运：${chart.currentDayun.ganZhi}（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）`
      : chart.timeUnknown
        ? "大运：时辰未定，起运留白"
        : chart.gender === "unspecified"
          ? "大运：缺性别，整盘起运留白"
          : "大运：未进入可标示区间",
    `胎元 ${chart.taiyuan}　命宫 ${chart.minggong}`,
    chart.provenance,
    "月令按太阳黄经节气取，不按公历月份。",
  ];

  const page2: NinePage = {
    pageNo: 2,
    key: "chart",
    title: "这张盘凭什么这样排",
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
    title: "你整个人生怎么运转",
    body: [
      reading.rhythm,
      `旺衰底盘：${chart.strength.tendency}`,
      chart.strength.summary,
      `得令 ${chart.strength.deLing ? "成立" : "不足"}／得地 ${chart.strength.deDi ? "成立" : "不足"}／得势 ${chart.strength.deShi ? "成立" : "不足"}`,
      "这是当前旺衰底盘，不等于 STONE Core 12 步已经完成。",
    ],
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
    title: reading.kind === "timing" ? "时间窗口为什么这样排" : "这题真正反复出现的课题",
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
    body: [
      "命诰",
      reading.decree,
      "这段命诰只把前面已经成立的判断压缩成一句可记住的话，不新增宫位、星曜或隐藏算法。",
      `昭梧 · 命理档案 ${id}`,
    ],
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
    title: chart.usefulProvisional ? "正式取用尚未完成" : "颜色 · 方位 · 时段",
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
    body: [
      "最高优先行动",
      reading.action,
      chart.currentDayun
        ? `你目前处于 ${chart.currentDayun.ganZhi} 大运（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）`
        : "",
      `流年背景：${chart.currentYear}`,
      "先做这一件，其他建议才有意义。",
    ].filter(Boolean),
    evidence: {
      facts: ["reading.action", "currentDayun", "currentYear"],
      conditions: ["有可靠大运才显示大运句"],
      limits: ["不得声称已经完成完整岁运作用链", "不得用固定七天睡眠模板覆盖不同题目"],
      checks: ["只有一个最高优先行动", "行动必须与第 1 页问题一致"],
    },
  };

  const palmNote =
    reading.kind === "past" && palm
      ? palm.ready
        ? `前世四宫已执行：${palm.palaces.map((x) => `${x.zhi}・${x.star}｜${x.dao}`).join("；")}`
        : `前世盘未齐：缺 ${palm.missing.join("、")}`
      : "";

  const page9: NinePage = {
    pageNo: 9,
    key: "close",
    title: "最后一句 + 方法透明",
    body: [
      reading.lastLine,
      ...methodLines(methodProtocol),
      palmNote,
      `报告编号 ${id} · ${createdAt}`,
    ].filter(Boolean),
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
  return ["昭梧｜付费九页报告（ZW-NINE-1.0）", "", ...blocks].join("\n\n");
}

export function composeNinePageReport(result: AnalysisResult): string {
  return renderNinePageText(composeNinePages(result));
}
