import type { AnalysisResult, Chart, QuestionKind, Reading } from "@/lib/bazi/types";
import type { MethodProtocol, PalmReading } from "@/lib/core/types";

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

function primaryTopic(kind: QuestionKind, reading: Reading): string {
  switch (kind) {
    case "career":
      return reading.work;
    case "love":
      return reading.love;
    case "money":
      return reading.money;
    case "health":
      return reading.body;
    case "home":
      return reading.home;
    case "choice":
    case "timing":
    case "self":
    case "past":
    default:
      return `${reading.directAnswer}\n\n${reading.rhythm}`;
  }
}

function secondaryTopics(kind: QuestionKind, reading: Reading): string[] {
  const bag: { key: QuestionKind | "work" | "love" | "money" | "body" | "home"; text: string }[] = [
    { key: "career", text: reading.work },
    { key: "love", text: reading.love },
    { key: "money", text: reading.money },
    { key: "health", text: reading.body },
    { key: "home", text: reading.home },
  ];
  return bag
    .filter((x) => x.key !== kind && x.text.trim())
    .slice(0, 2)
    .map((x) => x.text);
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
 * GPT Issue #4 九页母稿 → 结构化页。
 * 前世题仍应优先走 composePalmReport；本函数给非前世付费长文。
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
      "本页依据已排出的子平原局、当前可用岁运信息与本题分类；不是用五行百分比下判。",
      "先给结论，再看为什么。",
    ],
    evidence: {
      facts: ["question", "reading.kind", "reading.directAnswer"],
      conditions: ["选择题必须选边", "前世题第一句必须先给六道 + 主星"],
      limits: ["不调用未接入流派补强结论"],
      checks: ["首屏直接回答原问题", "不得以资料不足／仅供参考开场"],
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
    title: "反复出现的课题",
    body: [
      `主课题：${primaryTopic(reading.kind, reading)}`,
      ...secondaryTopics(reading.kind, reading).map((t, i) => `次课题 ${i + 1}：${t}`),
      "重点不是面面俱到，而是哪种模式最容易重复。",
    ],
    evidence: {
      facts: ["reading.work/love/money/body/home"],
      conditions: ["只展示与问题高度相关内容"],
      limits: ["健康不做医疗诊断", "投资不做收益保证"],
      checks: ["不得为了凑版面生成未有证据的新事件"],
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
    body: [
      reading.action,
      reading.kind === "health" ? "已有痛、失眠、掉力就去看医生。" : "",
      "能验证的行动，比堆更多术语有用。",
    ].filter(Boolean),
    evidence: {
      facts: ["reading.action", "reading.kind"],
      conditions: ["建议必须能在现实执行"],
      limits: ["不得从未定喜用派生职业吉凶、宠物、摆设"],
      checks: ["本页至少出现一个具体动作"],
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
      limits: ["不得声称已经完成完整岁运作用链"],
      checks: ["只有一个最高优先行动"],
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
