import { analyzeForecastYear, type ForecastPeriod, type ForecastTopic } from "@/lib/bazi/forecast";
import { analyzeCycleChain, cycleChainEvidence } from "@/lib/bazi/cycle-chain";
import type { Chart } from "@/lib/bazi/types";

function normalizedMonths(months?: number[]): number[] {
  if (!months?.length) return [];
  return [...new Set(months.map(Number).filter((m) => Number.isInteger(m) && m >= 1 && m <= 12))].sort((a, b) => a - b);
}

function monthLabel(period: ForecastPeriod): string {
  return `${period.month}月`;
}

function yearVerdict(topic: ForecastTopic, score: number, year: number): string {
  if (topic === "travel") {
    if (score <= -3) return `${year} 整體出行阻力偏高，宜少轉場、留餘量。`;
    if (score >= 3) return `${year} 整體可安排出行，重點仍是選對月份。`;
    return `${year} 可以出行，但不宜把整年一刀切成好或壞。`;
  }
  if (score >= 3) return `${year} 整體推進力較強。`;
  if (score <= -3) return `${year} 整體阻力較高，宜挑窗口。`;
  return `${year} 屬於可做、但要挑月份的年份。`;
}

function rankDistinct(periods: ForecastPeriod[]) {
  const bestCount = periods.length <= 2 ? 1 : periods.length <= 4 ? 2 : Math.min(3, periods.length);
  const best = [...periods].sort((a, b) => b.score - a.score || a.month - b.month).slice(0, bestCount);
  const bestKeys = new Set(best.map((period) => `${period.year}-${period.month}`));
  const caution = [...periods]
    .sort((a, b) => a.score - b.score || a.month - b.month)
    .filter((period) => !bestKeys.has(`${period.year}-${period.month}`))
    .slice(0, Math.min(2, Math.max(0, periods.length - best.length)));
  return { best, caution };
}

function withCycleAdjustment(chart: Chart, topic: ForecastTopic, period: ForecastPeriod): ForecastPeriod {
  const chain = analyzeCycleChain(chart, period.year, period.yearGanZhi, period.monthGanZhi, topic);
  return {
    ...period,
    score: Math.round((period.score + chain.crossLayerAdjustment) * 100) / 100,
    notes: [...period.notes, ...chain.notes.filter((note) => /層：/.test(note)).slice(0, 4)],
  };
}

function adjustedYearScore(chart: Chart, topic: ForecastTopic, baseScore: number, periods: ForecastPeriod[]): number {
  if (!periods.length) return baseScore;
  const delta = periods.reduce((sum, period) => {
    const chain = analyzeCycleChain(chart, period.year, period.yearGanZhi, period.monthGanZhi, topic);
    return sum + chain.crossLayerAdjustment;
  }, 0) / periods.length;
  return Math.round((baseScore + delta) * 10) / 10;
}

/**
 * Customer timing output. A month can never be both best and caution, and the
 * ranking now includes the missing 大運→流年→流月 cross-layer interactions.
 */
export function buildDistinctTimingAnswer(
  chart: Chart,
  topic: ForecastTopic,
  targetYears: number[],
  months?: number[],
): string {
  const now = new Date().getFullYear();
  const years = targetYears.length ? targetYears.slice(0, 3) : [now, now + 1];
  const scope = normalizedMonths(months);

  const blocks = years.map((year) => {
    const forecast = analyzeForecastYear(chart, year, topic);
    const source = scope.length ? forecast.months.filter((period) => scope.includes(period.month)) : forecast.months;
    const periods = source.map((period) => withCycleAdjustment(chart, topic, period));
    if (!periods.length) return `${year} 暫無可比較月份。`;
    const overallScore = adjustedYearScore(chart, topic, forecast.score, periods);

    if (periods.length === 1) {
      const only = periods[0];
      const tone = only.score >= 2 ? "偏順" : only.score <= -2 ? "阻力偏高" : "中性可用";
      const chain = analyzeCycleChain(chart, only.year, only.yearGanZhi, only.monthGanZhi, topic);
      return `${yearVerdict(topic, overallScore, year)}你指定的月份範圍內，${monthLabel(only)} 為${tone}。${cycleChainEvidence(chain)}`;
    }

    const ranked = rankDistinct(periods);
    const best = ranked.best.map(monthLabel).join("、");
    const caution = ranked.caution.map(monthLabel).join("、");
    const anchor = ranked.best[0] ?? periods[0];
    const chain = analyzeCycleChain(chart, anchor.year, anchor.yearGanZhi, anchor.monthGanZhi, topic);
    return [
      yearVerdict(topic, overallScore, year),
      scope.length ? "你指定的月份範圍內，" : "",
      `較順的窗口：${best || "—"}。`,
      caution ? `較需要保守安排：${caution}。` : "",
      cycleChainEvidence(chain),
    ].filter(Boolean).join("");
  });

  const precision = chart.timeUnknown
    ? "出生時間未確定，所以時柱與大運不做滿格推斷，月份判斷會較寬。"
    : "排序依序核對原局、大運、流年、流月；支合只先論牽制，支沖刑害只先論引動與摩擦，不把任何單一關係當作結果保證。";
  return `${blocks.join(" ")} ${precision}`.trim();
}
