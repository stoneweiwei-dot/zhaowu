import { analyzeForecastYear, type ForecastPeriod, type ForecastTopic } from "@/lib/bazi/forecast";
import type { Chart } from "@/lib/bazi/types";

function normalizedMonths(months?: number[]): number[] {
  if (!months?.length) return [];
  return [...new Set(months.map(Number).filter((m) => Number.isInteger(m) && m >= 1 && m <= 12))].sort((a, b) => a - b);
}

function monthLabel(period: ForecastPeriod): string {
  return `${period.month}月（${period.monthGanZhi}；${period.jieStart}→${period.jieEnd}）`;
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

/** Customer timing output: a month can never be both best and caution. */
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
    const periods = scope.length ? forecast.months.filter((period) => scope.includes(period.month)) : forecast.months;
    if (!periods.length) return `${year} 暫無可比較月份。`;

    if (periods.length === 1) {
      const only = periods[0];
      const tone = only.score >= 2 ? "偏順" : only.score <= -2 ? "阻力偏高" : "中性可用";
      return `${yearVerdict(topic, forecast.score, year)}你指定的月份範圍內，${monthLabel(only)} 為${tone}。`;
    }

    const ranked = rankDistinct(periods);
    const best = ranked.best.map(monthLabel).join("、");
    const caution = ranked.caution.map(monthLabel).join("、");
    return [
      yearVerdict(topic, forecast.score, year),
      scope.length ? "你指定的月份範圍內，" : "",
      `較順的窗口：${best || "—"}。`,
      caution ? `較需要保守安排：${caution}。` : "",
    ].filter(Boolean).join("");
  });

  const precision = chart.timeUnknown
    ? "出生時間未確定，本次不使用時柱與大運做滿格推斷。"
    : "月份以節氣交接為邊界；這是節奏排序，不是事件保證。";
  return `${blocks.join(" ")} ${precision}`.trim();
}
