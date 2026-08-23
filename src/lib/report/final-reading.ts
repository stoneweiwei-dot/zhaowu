import { applyAnswerContract } from "@/lib/core/answer-contract";
import type { Chart, Reading } from "@/lib/bazi/types";

function dayBranch(chart: Chart): string {
  return chart.pillars.find((p) => p.key === "day")?.zhi || "—";
}

function flowLine(chart: Chart): string {
  if (!chart.usefulProvisional && chart.useful.length) {
    return `已成立的流通重点落在${chart.useful.join("、")}，需要避免让${chart.drain.join("、") || "耗泄端"}继续失衡。`;
  }
  if (chart.useful.length) {
    return `目前只确认到流通候选${chart.useful.join("、")}，尚不足以把它写成正式喜用神定论。`;
  }
  return "目前不强行指定喜用神，先以月令、旺衰与现实节奏作为落点。";
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
    `旺衰底盘为${chart.strength.tendency}：${chart.strength.summary}`,
    flowLine(chart),
    dayun,
    `因此你的命诰不是“硬撑到底”，而是：保留${chart.dayMaster}${chart.dayMasterElement}的判断力，同时让重要选择有出口、有边界、能复盘；该收时收、该动时动，不用同一种方法扛所有阶段。`,
  ].join(" ");

  return { ...reading, decree };
}
