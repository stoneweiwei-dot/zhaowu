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

function isTravelTimingQuestion(question: string): boolean {
  return /度假|旅行|旅遊|旅游|出行|出國|出国|去哪|去哪里|去哪裡|目的地/.test(question);
}

function targetYears(question: string): number[] {
  const matches = question.match(/20\d{2}/g) ?? [];
  return [...new Set(matches.map(Number).filter((year) => year >= 2000 && year <= 2099))];
}

function travelTimingPage1(question: string, chart: Chart): string[] {
  const years = targetYears(question);
  const askedYear = years[0];
  const currentYear = Number(String(chart.currentYear).match(/20\d{2}/)?.[0] ?? new Date().getFullYear());
  const yearLabel = askedYear ? String(askedYear) : "你问的目标年份";
  const yearMismatch = askedYear ? askedYear !== currentYear : false;

  return [
    `这题其实有三个问题：什么时候适合出行、去哪里更合适、${askedYear ? `${askedYear} 年` : "目标年份"}是不是不适合出行。`,
    yearMismatch
      ? `先把最重要的一点说清楚：当前这份结果只带有 ${currentYear} 年的流年背景，并没有完成 ${yearLabel} 的流年 + 流月作用链，所以现在不能负责任地判断「${yearLabel} 全年适不适合出行」，更不能拿 ${currentYear} 的“当前窗口”冒充 ${yearLabel} 的答案。`
      : "先把最重要的一点说清楚：出行题必须看目标年份与月份，不能只凭一句“现在是窗口”下结论。",
    askedYear === 2027
      ? "2027 是丁未年，但只知道“丁未”这两个字，仍不足以断定你全年不宜旅行；必须把丁未流年挂回原局、当前大运，再逐月看冲合刑害与承载，才能回答哪几个月适合、哪几个月应避开。"
      : "不能因为某个流年干支，就直接把整年判成“适合”或“不适合出行”。",
    chart.usefulProvisional
      ? "至于“去哪里最好”：当前正式取用尚未完成，所以不能用未定的喜用神硬推东南西北、颜色或目的地。地点必须等取用与目标年份计算完成后再给。"
      : "至于“去哪里最好”：应在目标年份计算完成后，再把目的地方位、气候与旅行强度挂回你的正式取用，不应先凭印象猜国家。",
  ];
}

function travelTimingPage4(question: string, chart: Chart): string[] {
  const years = targetYears(question);
  const askedYear = years[0];
  return [
    `已知：原局、当前大运状态、当前流年背景。`,
    askedYear ? `还必须补算：${askedYear} 流年与 12 个流月逐月作用。` : "还必须补算：目标年份与 12 个流月逐月作用。",
    "判断顺序应是：先判整年是否适合远行，再排月份；月份出来后，再谈长途 / 短途、海岛 / 城市、寒冷 / 炎热与方向。",
    chart.usefulProvisional
      ? "正式取用未完成前，不生成“最佳方位 / 最佳国家”这类看似精确、其实没有证据的答案。"
      : "目的地建议必须能回溯到正式取用与目标月份，不靠泛泛的五行联想。",
  ];
}

function travelTimingPage8(question: string): string[] {
  const years = targetYears(question);
  const askedYear = years[0];
  return [
    "最高优先行动",
    askedYear
      ? `先完成 ${askedYear} 年流年 + 12 流月计算，再回答“哪几个月去、哪里更适合、哪些月份不建议远行”。`
      : "先确定目标年份，再完成该年流年 + 12 流月计算。",
    "在这一步完成前，不再输出“现在就是窗口”“再等会耗掉热度”这种与原问题无关的通用句。",
  ];
}

/**
 * GPT Issue #4 九页母稿 → 结构化页。
 * 前世题仍应优先走 composePalmReport；本函数给非前世付费长文。
 */
export function composeNinePages(result: AnalysisResult): NinePage[] {
  const { question, chart, reading, methodProtocol, palm, id, createdAt } = result;
  const travelTiming = reading.kind === "timing" && isTravelTimingQuestion(question);
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
    body: travelTiming
      ? travelTimingPage1(question, chart)
      : [
          reading.directAnswer,
          "本页依据已排出的子平原局、当前可用岁运信息与本题分类；不是用五行百分比下判。",
          "先给结论，再看为什么。",
        ],
    evidence: {
      facts: travelTiming
        ? ["question", "targetYear", "chart.currentYear", "currentDayun", "usefulProvisional"]
        : ["question", "reading.kind", "reading.directAnswer"],
      conditions: travelTiming
        ? ["提到未来年份时，必须先有该年流年 + 流月作用链", "地点建议必须晚于正式取用"]
        : ["选择题必须选边", "前世题第一句必须先给六道 + 主星"],
      limits: travelTiming
        ? ["禁止用当前年份模板冒充目标年份答案", "禁止未算流月就给最佳月份", "禁止未定取用就给最佳国家或方位"]
        : ["不调用未接入流派补强结论"],
      checks: travelTiming
        ? ["第一屏必须逐项回应：时间 / 地点 / 目标年份", "不得出现与问题无关的七天习惯模板"]
        : ["首屏直接回答原问题", "不得以资料不足／仅供参考开场"],
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
    title: travelTiming ? "这题真正还缺哪一层计算" : "反复出现的课题",
    body: travelTiming
      ? travelTimingPage4(question, chart)
      : [
          `主课题：${primaryTopic(reading.kind, reading)}`,
          ...secondaryTopics(reading.kind, reading).map((t, i) => `次课题 ${i + 1}：${t}`),
          "重点不是面面俱到，而是哪种模式最容易重复。",
        ],
    evidence: {
      facts: travelTiming ? ["question", "targetYear", "currentYear", "usefulProvisional"] : ["reading.work/love/money/body/home"],
      conditions: travelTiming ? ["出行题先算年份，再算月份，再给地点"] : ["只展示与问题高度相关内容"],
      limits: travelTiming ? ["不得用人格段落填充缺失的岁运计算"] : ["健康不做医疗诊断", "投资不做收益保证"],
      checks: travelTiming ? ["必须清楚写出还缺的计算层"] : ["不得为了凑版面生成未有证据的新事件"],
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
    title: travelTiming ? "下一步只做一件事" : "现在最该做的一件事",
    body: travelTiming
      ? travelTimingPage8(question)
      : [
          "最高优先行动",
          reading.action,
          chart.currentDayun
            ? `你目前处于 ${chart.currentDayun.ganZhi} 大运（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}）`
            : "",
          `流年背景：${chart.currentYear}`,
          "先做这一件，其他建议才有意义。",
        ].filter(Boolean),
    evidence: {
      facts: travelTiming ? ["question", "targetYear"] : ["reading.action", "currentDayun", "currentYear"],
      conditions: travelTiming ? ["先补目标年份与流月计算"] : ["有可靠大运才显示大运句"],
      limits: travelTiming ? ["禁止用七天习惯模板替代出行判断"] : ["不得声称已经完成完整岁运作用链"],
      checks: travelTiming ? ["只保留一个明确下一步：补算目标年份"] : ["只有一个最高优先行动"],
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
