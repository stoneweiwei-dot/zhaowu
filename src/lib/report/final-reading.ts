import { applyAnswerContract } from "@/lib/core/answer-contract";
import type { AppLocale, Chart, QuestionKind, Reading } from "@/lib/bazi/types";
import { applyCustomerAnswerHotfix } from "@/lib/report/customer-answer-hotfix";

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

function englishStem(value: string): string {
  return STEM_EN[value] ?? "Unconfirmed";
}

function englishBranch(value: string): string {
  return BRANCH_EN[value] ?? "Unconfirmed";
}

function englishGanZhi(value: string): string {
  if (!value || value.length < 2) return "unconfirmed cycle";
  const stem = STEM_EN[value[0]];
  const branch = BRANCH_EN[value[1]];
  return stem && branch ? `${stem}-${branch}` : "unconfirmed cycle";
}

function englishStrength(value: string): string {
  if (value.includes("旺")) return "strong";
  if (value.includes("弱")) return "light";
  return "balanced";
}

function englishQuestionKind(question: string, fallback: QuestionKind): QuestionKind {
  if (/\b(work|career|job|role|profession|business|project|study|school|exam)\b/i.test(question)) return "career";
  if (/\b(love|relationship|partner|dating|marriage|romance)\b/i.test(question)) return "love";
  if (/\b(money|finance|income|salary|investment|debt|budget)\b/i.test(question)) return "money";
  if (/\b(health|sleep|body|recovery|medical|treatment|pregnan(?:cy|t))\b/i.test(question)) return "health";
  if (/\b(home|house|apartment|move|moving|property|residence)\b/i.test(question)) return "home";
  if (/\b(choose|choice|compare|versus|\bvs\b|which option)\b/i.test(question)) return "choice";
  if (/\b(when|timing|what time|which month|which year|how soon)\b/i.test(question)) return "timing";
  return fallback;
}

function horizonPhrase(question: string): string {
  if (/next\s+six\s+months/i.test(question)) return "over the next six months";
  if (/next\s+(?:three|3)\s+months/i.test(question)) return "over the next three months";
  if (/next\s+(?:twelve|12)\s+months|next\s+year/i.test(question)) return "over the next year";
  return "in the period you are asking about";
}

function englishAction(kind: QuestionKind): string {
  switch (kind) {
    case "career":
      return "Write down one six-month outcome, its weekly proof of progress, and the work you will stop doing. Review those three items every Friday.";
    case "love":
      return "Track observable reciprocity: consistent contact, concrete plans, clear commitment, and respected boundaries.";
    case "money":
      return "Set the maximum acceptable loss, cash-flow requirement, and exit condition before considering upside.";
    case "health":
      return "Stabilize sleep, routine, and physical load first; seek qualified medical care for persistent, worsening, or activity-limiting symptoms.";
    case "home":
      return "Verify light, noise, commute, budget, layout, and how the space feels in person before deciding.";
    case "choice":
      return "Compare both options against the same five criteria: benefit, cost, responsibility, reversibility, and exit difficulty.";
    case "timing":
      return "Use the requested period as a preparation window, then confirm the decision against real deadlines and constraints.";
    case "past":
      return "Keep only the symbolic observations that match repeated, verifiable patterns in your real life.";
    default:
      return "Test this reading against three recent real events and keep only what remains useful.";
  }
}

function englishDirectAnswer(question: string, chart: Chart, kind: QuestionKind): string {
  const context = `Chart context: ${englishStem(chart.dayMaster)} (${ELEMENT_EN[chart.dayMasterElement] ?? "Element unconfirmed"}) Day Master under ${englishBranch(chart.monthBranch)} as Month Command, with a ${englishStrength(chart.strength.tendency)} baseline. Use this as pacing context, not as a guaranteed outcome.`;
  if (/\b(travel|trip|vacation)\b/i.test(question)) {
    return `Prioritize a low-friction itinerary with fewer transfers, a daily recovery block, and explicit budget, transport, and weather buffers. ${context}`;
  }
  switch (kind) {
    case "career":
      return `Prioritize one clearly owned workstream ${horizonPhrase(question)}. Choose the option with a visible deliverable, explicit decision rights, and a manageable workload; do not split attention across several equally urgent tracks. ${context}`;
    case "love":
      return `Prioritize observable reciprocity over interpretation: consistent contact, concrete plans, clear commitment, and respected boundaries. ${context}`;
    case "money":
      return `Prioritize cash-flow resilience and a defined downside before pursuing expansion or return. ${context}`;
    case "health":
      return `Prioritize recovery capacity, sleep, and sustainable load. This reading cannot diagnose a condition or replace medical assessment. ${context}`;
    case "home":
      return `Prioritize the option that works in daily life after you verify light, noise, commute, layout, and total cost in person. ${context}`;
    case "choice":
      return `Prioritize the option whose downside is affordable and whose exit remains workable; compare both choices against the same criteria before deciding. ${context}`;
    case "timing":
      return `Treat the period you named as a planning window, not a promised event date. Prepare the decision, dependencies, and fallback before the window opens. ${context}`;
    case "past":
      return `Use the symbolic reading only as a prompt for patterns you can verify in present life; do not treat it as literal historical proof. ${context}`;
    default:
      return `Prioritize the one decision you can test through observable action now, then review the result before expanding the commitment. ${context}`;
  }
}

function buildEnglishReading(question: string, chart: Chart, source: Reading): Reading {
  const kind = englishQuestionKind(question, source.kind);
  const currentPhase = chart.currentDayun
    ? `Your current ten-year cycle is ${englishGanZhi(chart.currentDayun.ganZhi)} (${chart.currentDayun.startYear}–${chart.currentDayun.endYear}). Treat it as a pacing lens rather than a promise.`
    : "No reliable current ten-year cycle is available, so timing claims should remain provisional.";
  const primaryElement = chart.useful[0] ?? chart.dayMasterElement;
  const colorByElement: Record<string, string> = {
    木: "forest green", 火: "vermilion", 土: "ochre", 金: "soft white", 水: "deep navy",
  };
  const directionByElement: Record<string, string> = {
    木: "east", 火: "south", 土: "centre", 金: "west", 水: "north",
  };

  return {
    ...source,
    kind,
    directAnswer: englishDirectAnswer(question, chart, kind),
    rhythm: `${currentPhase} Keep fewer commitments active at once, protect recovery time, and review progress at a fixed weekly interval.`,
    work: "The useful work pattern is focused ownership, visible output, and a finishable scope. Favor roles where priorities and decision rights are explicit.",
    love: "Judge the relationship through reciprocity, actual time together, explicit commitment, and respected boundaries—not through explanation alone.",
    money: "Protect cash flow first. Define risk capacity, time horizon, and exit conditions before treating possible return as a decision.",
    body: "Use workload, sleep, and recovery as the practical signals. Persistent or worsening symptoms require qualified medical assessment.",
    home: "Treat light, noise, commute, layout, budget, and direct experience of the space as the decisive evidence.",
    action: englishAction(kind),
    decree: `Your chart is anchored by ${englishStem(chart.dayMaster)} as a ${ELEMENT_EN[chart.dayMasterElement] ?? "five-element"} Day Master under ${englishBranch(chart.monthBranch)} as Month Command. Its practical instruction is to preserve clear judgment while giving each important choice an exit, a boundary, and a review point. Move when the evidence is ready; stop when the load exceeds the purpose.`,
    lastLine: "Use this reading as a decision lens, then verify it against real conditions.",
    guide: {
      colors: [colorByElement[primaryElement] ?? "natural neutral tones"],
      avoidColors: ["over-saturated combinations that add visual load"],
      directions: {
        favor: [directionByElement[primaryElement] ?? "the most practical direction"],
        rest: ["the quietest available space"],
      },
      hours: {
        favor: ["your clearest two-hour focus block"],
        drain: ["late hours that reduce next-day recovery"],
      },
      pet: "Choose by space, schedule, health, and care capacity—not by chart symbolism alone.",
    },
  };
}

function dayBranch(chart: Chart): string {
  return chart.pillars.find((p) => p.key === "day")?.zhi || "—";
}

function readyPillars(chart: Chart): string {
  return chart.pillars
    .filter((col) => col.ready !== false && col.ganZhi !== "未定" && Boolean(col.gan))
    .map((col) => `${col.label}${col.ganZhi}`)
    .join("、");
}

function strengthLine(chart: Chart): string {
  const facts = [
    chart.strength.deLing ? "得令" : "不得令",
    chart.strength.deDi ? "得地" : "不得地",
    chart.strength.deShi ? "得势" : "不得势",
  ].join("、");
  return `旺衰表现为${chart.strength.tendency}（${facts}）。`;
}

function climateLine(chart: Chart): string {
  const zhi = chart.monthBranch;
  if (["亥", "子", "丑"].includes(zhi)) return "月令偏寒，先看能否把火气与出口接上，而不是继续把事闷在夜里。";
  if (["巳", "午", "未"].includes(zhi)) return "月令偏热，先看能否降温、收束，避免把每个机会都烧成过载。";
  if (["寅", "卯", "辰"].includes(zhi)) return "月令偏生发，适合把判断做成可交付的形状，而不是只停留在起势。";
  if (["申", "酉", "戌"].includes(zhi)) return "月令偏收敛，适合把边界与标准立清楚，避免为了完整而拖到过季。";
  return "调候先跟月令走，不另造一套与原局无关的寒暖故事。";
}

function flowLine(chart: Chart): string {
  if (!chart.usefulProvisional && chart.useful.length) {
    return `已成立的流通重点落在${chart.useful.join("、")}，需要避免让${chart.drain.join("、") || "耗泄端"}继续失衡。`;
  }
  if (chart.useful.length) {
    return `目前只确认到流通候选${chart.useful.join("、")}，尚不足以把它写成正式喜用神或病药定论。`;
  }
  return "目前不强行指定喜用神与病药通关，先以月令、旺衰与现实节奏作为落点。";
}

function relationLine(chart: Chart): string {
  const pillars = readyPillars(chart);
  if (!pillars) return "干支关系只按已排定的柱位理解，不补未确认的刑冲合害链。";
  return `已排定的干支为${pillars}；在完整刑冲合害库接入前，不把未计算的合冲刑害写成主判。`;
}

/** One final customer-facing Reading used by UI, persistence and reports. */
export function finalizeReading(
  question: string,
  chart: Chart,
  raw: Reading,
  locale: AppLocale = "zh-Hans",
): Reading {
  const contracted = applyAnswerContract(question, chart, raw);
  const reading = applyCustomerAnswerHotfix(question, chart, contracted);
  if (locale === "en") return buildEnglishReading(question, chart, reading);

  const dayZhi = dayBranch(chart);
  const dayun = chart.currentDayun
    ? `你现在行${chart.currentDayun.ganZhi}大运（${chart.currentDayun.startYear}–${chart.currentDayun.endYear}），所以命诰不能只讲原局，也要把当前阶段的承载方式算进去。`
    : "当前大运没有可靠结果时，不把未确认的岁运硬写进命诰。";

  const decree = [
    `命以${chart.dayMaster}${chart.dayMasterElement}为主，在${chart.monthBranch}月令中成形；日支${dayZhi}是你真正落到日常关系与选择里的位置。`,
    strengthLine(chart),
    climateLine(chart),
    relationLine(chart),
    flowLine(chart),
    dayun,
    `因此你的命诰不是“硬撑到底”，而是：保留${chart.dayMaster}${chart.dayMasterElement}的判断力，同时让重要选择有出口、有边界、能复盘；该收时收、该动时动，不用同一种方法扛所有阶段。`,
  ].join(" ");

  return { ...reading, decree };
}
