import { applyAnswerContract } from "@/lib/core/answer-contract";
import type { Chart, Reading } from "@/lib/bazi/types";

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

/**
 * Build the one customer-facing final Reading used by the front-end, persistence,
 * nine-page report and owner console. No later screen should silently recalculate it.
 */
export function finalizeReading(question: string, chart: Chart, raw: Reading): Reading {
  const reading = applyAnswerContract(question, chart, raw);
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
