import type { Chart, DayunPeriod } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";

export type ReportLuckPeriod = {
  ganZhi: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  current: boolean;
};

export type ReportLuckModel = {
  periods: ReportLuckPeriod[];
  current: ReportLuckPeriod | null;
  annualStemBranch: string;
  timingAvailable: boolean;
  title: string;
  subtitle: string;
  currentLabel: string;
  annualLabel: string;
  timelineLabel: string;
  unknownTimeNote: string | null;
  boundaryNote: string;
};

function normalizePeriod(period: DayunPeriod): ReportLuckPeriod {
  return {
    ganZhi: period.ganZhi,
    startYear: period.startYear,
    endYear: period.endYear,
    startAge: period.startAge,
    endAge: period.endAge,
    current: Boolean(period.current),
  };
}

export function buildReportLuckModel(chart: Chart, locale: Locale): ReportLuckModel {
  const periods = (chart.dayun ?? []).map(normalizePeriod);
  const currentSource = chart.currentDayun ?? chart.dayun?.find((period) => period.current) ?? null;
  const current = currentSource ? normalizePeriod(currentSource) : null;
  const timingAvailable = !chart.timeUnknown && periods.length > 0;

  if (locale === "en") {
    return {
      periods,
      current,
      annualStemBranch: chart.currentYear || "—",
      timingAvailable,
      title: "Timing map",
      subtitle: "Calculated periods and the current year, shown without adding a second prediction layer.",
      currentLabel: "Current period",
      annualLabel: "Current year",
      timelineLabel: "Calculated timeline",
      unknownTimeNote: chart.timeUnknown
        ? "Birth time is unknown, so the start of long timing periods is intentionally left unconfirmed."
        : null,
      boundaryNote: "These dates come from the existing chart calculation. Interpretation stays in the main report; this visual layer does not invent extra outcomes.",
    };
  }

  const hans = locale === "zh-Hans";
  return {
    periods,
    current,
    annualStemBranch: chart.currentYear || "—",
    timingAvailable,
    title: hans ? "运之书" : "運之書",
    subtitle: hans ? "只呈现排盘已经算出的运期与当年，不另造一套预测。" : "只呈現排盤已經算出的運期與當年，不另造一套預測。",
    currentLabel: hans ? "目前大运" : "目前大運",
    annualLabel: hans ? "当前流年" : "當前流年",
    timelineLabel: hans ? "实际运期时间线" : "實際運期時間線",
    unknownTimeNote: chart.timeUnknown
      ? hans
        ? "出生时辰未知，因此大运起运时间继续留白，不用视觉模板补猜。"
        : "出生時辰未知，因此大運起運時間繼續留白，不用視覺模板補猜。"
      : null,
    boundaryNote: hans
      ? "年份与起止年龄直接来自现有排盘结果；具体吉凶与行动建议仍以完整报告为准，视觉层不自行加断语。"
      : "年份與起止年齡直接來自現有排盤結果；具體吉凶與行動建議仍以完整報告為準，視覺層不自行加斷語。",
  };
}
