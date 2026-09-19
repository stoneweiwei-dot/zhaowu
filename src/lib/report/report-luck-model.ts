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
      subtitle: "Your calculated periods and current year.",
      currentLabel: "Current period",
      annualLabel: "Current year",
      timelineLabel: "Calculated timeline",
      unknownTimeNote: chart.timeUnknown
        ? "Birth time is unknown, so the start of long timing periods is intentionally left unconfirmed."
        : null,
      boundaryNote: "These periods are traditional reference points, not guaranteed outcomes.",
    };
  }

  const hans = locale === "zh-Hans";
  return {
    periods,
    current,
    annualStemBranch: chart.currentYear || "—",
    timingAvailable,
    title: hans ? "运之书" : "運之書",
    subtitle: hans ? "各阶段的起止年份。" : "各階段的起止年份。",
    currentLabel: hans ? "目前大运" : "目前大運",
    annualLabel: hans ? "当前流年" : "當前流年",
    timelineLabel: hans ? "实际运期时间线" : "實際運期時間線",
    unknownTimeNote: chart.timeUnknown
      ? hans
        ? "出生时辰未知，因此大运起运时间继续留白，不用视觉模板补猜。"
        : "出生時辰未知，因此大運起運時間繼續留白，不用視覺模板補猜。"
      : null,
    boundaryNote: hans
      ? "年份供传统分析参考，不代表事情必然发生。"
      : "年份供傳統分析參考，不代表事情必然發生。",
  };
}
