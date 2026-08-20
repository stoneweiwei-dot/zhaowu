import { BRANCH_ELEMENT } from "./constants";
import { tenGod, yearMonthPillars } from "./calendar";
import type { Chart, QuestionKind } from "./types";

export type ForecastTopic = QuestionKind | "travel";

export type ForecastPeriod = {
  year: number;
  month: number;
  yearGanZhi: string;
  monthGanZhi: string;
  score: number;
  notes: string[];
};

export type ForecastYear = {
  year: number;
  yearGanZhi: string;
  score: number;
  best: ForecastPeriod[];
  caution: ForecastPeriod[];
  months: ForecastPeriod[];
  destinationStyle: string;
};

export type ForecastOptions = {
  months?: number[];
  explain?: boolean;
};

const COMBINE: Record<string, string> = {
  子: "丑", 丑: "子", 寅: "亥", 亥: "寅", 卯: "戌", 戌: "卯",
  辰: "酉", 酉: "辰", 巳: "申", 申: "巳", 午: "未", 未: "午",
};

const CLASH: Record<string, string> = {
  子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
  卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
};

const HARM: Record<string, string> = {
  子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅",
  卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉",
};

function readyBranches(chart: Chart): { day: string; month: string; all: string[] } {
  const ready = chart.pillars.filter((p) => p.ready);
  const day = ready.find((p) => p.key === "day")?.zhi ?? "";
  const month = ready.find((p) => p.key === "month")?.zhi ?? chart.monthBranch;
  return { day, month, all: ready.map((p) => p.zhi).filter(Boolean) };
}

function godScore(god: string, topic: ForecastTopic, strong: boolean): number {
  const isWealth = god === "正財" || god === "偏財";
  const isOfficer = god === "正官" || god === "七殺";
  const isOutput = god === "食神" || god === "傷官";
  const isResource = god === "正印" || god === "偏印";
  const isPeer = god === "比肩" || god === "劫財" || god === "日主";

  switch (topic) {
    case "travel":
      if (isOutput) return 3;
      if (isWealth) return 2;
      if (isPeer) return strong ? -1 : 1;
      if (isResource) return strong ? -1 : 1;
      return 0;
    case "love":
      if (isWealth || isOfficer) return 2;
      if (isOutput) return 1;
      if (isPeer) return -1;
      return 0;
    case "career":
      if (isOfficer || isOutput) return 2;
      if (isWealth) return 1;
      if (isResource) return strong ? 0 : 1;
      return 0;
    case "money":
      if (isWealth) return 3;
      if (isOutput) return 2;
      if (isOfficer) return 1;
      if (isPeer) return -1;
      return 0;
    case "home":
      if (isResource) return 2;
      if (isPeer) return 1;
      return 0;
    case "health":
      if (isResource) return strong ? 0 : 1;
      if (isOutput) return 1;
      if (isOfficer) return -1;
      return 0;
    case "self":
      if (isOutput || isResource) return 1;
      return 0;
    default:
      return 0;
  }
}

function relationScore(branch: string, chart: Chart, topic: ForecastTopic): { score: number; notes: string[] } {
  const { day, month, all } = readyBranches(chart);
  let score = 0;
  const notes: string[] = [];

  if (day && COMBINE[branch] === day) {
    score += 3;
    notes.push("與日支六合");
  }
  if (month && COMBINE[branch] === month) {
    score += 2;
    notes.push("與月令六合");
  }
  if (day && CLASH[branch] === day) {
    score += topic === "travel" ? -1 : -3;
    notes.push(topic === "travel" ? "沖日支，動象強但較折騰" : "沖日支");
  }
  if (month && CLASH[branch] === month) {
    score += topic === "travel" ? -1 : -2;
    notes.push("沖月令");
  }
  if (all.some((zhi) => HARM[branch] === zhi)) {
    score -= 1;
    notes.push("有害象，細節較容易卡");
  }

  const sameCount = all.filter((zhi) => zhi === branch).length;
  if (sameCount >= 2) {
    score -= 1;
    notes.push("同支疊加，容易過量");
  }

  return { score, notes };
}

function scoreGanZhi(gz: string, chart: Chart, topic: ForecastTopic): { score: number; notes: string[] } {
  const strong = chart.strength.tendency.includes("旺");
  const god = tenGod(chart.dayMaster, gz[0]);
  const godPart = godScore(god, topic, strong);
  const rel = relationScore(gz[1], chart, topic);
  const notes = [`天干${god}${godPart > 0 ? "有助" : godPart < 0 ? "偏耗" : "中性"}`, ...rel.notes];
  return { score: godPart + rel.score, notes };
}

function targetDayun(chart: Chart, year: number): string | null {
  return chart.dayun.find((d) => year >= d.startYear && year <= d.endYear)?.ganZhi ?? null;
}

function monthDate(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
}

function destinationStyleFrom(best: ForecastPeriod[]): string {
  if (!best.length) return "以休息感強、轉場少的目的地為主。";
  const element = BRANCH_ELEMENT[best[0].monthGanZhi[1]];
  switch (element) {
    case "水":
      return "優先海邊、島嶼、湖區或步調較鬆的濱水城市；行程不要排太滿。";
    case "木":
      return "優先綠意多、可步行、山林或溫和小城型目的地，比純購物趕場更合適。";
    case "火":
      return "優先日照足、文化活動多、能真正放鬆但不悶的城市或海島。";
    case "金":
      return "優先乾爽、秩序清楚、交通好、節奏俐落的城市型目的地。";
    case "土":
    default:
      return "優先溫泉、古城、慢節奏內陸或一地住久一點的行程，少做高密度轉場。";
  }
}

export function analyzeForecastYear(chart: Chart, year: number, topic: ForecastTopic): ForecastYear {
  const yearGz = yearMonthPillars(new Date(Date.UTC(year, 6, 1, 12))).year;
  const yearBase = scoreGanZhi(yearGz, chart, topic);
  const dayunGz = targetDayun(chart, year);
  const dayunBase = dayunGz ? scoreGanZhi(dayunGz, chart, topic).score : 0;

  const months: ForecastPeriod[] = [];
  for (let month = 1; month <= 12; month++) {
    const ym = yearMonthPillars(monthDate(year, month));
    const monthPart = scoreGanZhi(ym.month, chart, topic);
    const score = Math.round((monthPart.score * 2 + yearBase.score + dayunBase) * 10) / 10;
    months.push({
      year,
      month,
      yearGanZhi: yearGz,
      monthGanZhi: ym.month,
      score,
      notes: [...monthPart.notes, ...(dayunGz ? [`大運${dayunGz}`] : [])],
    });
  }

  const ranked = [...months].sort((a, b) => b.score - a.score || a.month - b.month);
  const cautionRanked = [...months].sort((a, b) => a.score - b.score || a.month - b.month);
  const yearScore = Math.round((yearBase.score + dayunBase) * 10) / 10;
  const best = ranked.slice(0, 3);
  const caution = cautionRanked.slice(0, 2);

  return {
    year,
    yearGanZhi: yearGz,
    score: yearScore,
    best,
    caution,
    months,
    destinationStyle: destinationStyleFrom(best),
  };
}

function monthList(items: ForecastPeriod[]): string {
  return items.map((x) => `${x.month}月（${x.monthGanZhi}）`).join("、");
}

function yearVerdict(topic: ForecastTopic, f: ForecastYear): string {
  if (topic === "travel") {
    if (f.score <= -3) return `${f.year} 並不是「完全不能出行」，但整體不適合排高密度、連續轉場的旅行。`;
    if (f.score >= 3) return `${f.year} 整體可以出行，而且比平均年份更容易把旅行安排得順。`;
    return `${f.year} 不是整年不適合出行；重點是挑月份，不要把整年一刀切掉。`;
  }
  if (f.score >= 3) return `${f.year} 整體偏順，適合主動推進。`;
  if (f.score <= -3) return `${f.year} 整體壓力較重，適合挑窗口而不是硬衝整年。`;
  return `${f.year} 屬於可做、但要挑月份的年份。`;
}

function normalizedMonths(months?: number[]): number[] {
  if (!months?.length) return [];
  return [...new Set(months.map(Number).filter((m) => Number.isInteger(m) && m >= 1 && m <= 12))].sort((a, b) => a - b);
}

function rankWithin(f: ForecastYear, months?: number[]): { best: ForecastPeriod[]; caution: ForecastPeriod[] } {
  const scope = normalizedMonths(months);
  const source = scope.length ? f.months.filter((m) => scope.includes(m.month)) : f.months;
  const ranked = [...source].sort((a, b) => b.score - a.score || a.month - b.month);
  const caution = [...source].sort((a, b) => a.score - b.score || a.month - b.month);
  return {
    best: ranked.slice(0, Math.min(3, ranked.length)),
    caution: caution.slice(0, Math.min(2, caution.length)),
  };
}

function evidence(items: ForecastPeriod[]): string {
  const first = items[0];
  if (!first) return "";
  const why = first.notes.filter(Boolean).slice(0, 3).join("、");
  return why ? `排序依據：${first.month}月主要見${why}。` : "";
}

function uncertainty(chart: Chart): string {
  if (chart.timeUnknown) {
    return "出生時間未確定，這次不使用時柱與大運做滿格推斷，月份排序只按已知盤面，精度會低一級。";
  }
  return "月份排序是已接入的歲運關係排序，不把它包裝成必然事件或保證日期。";
}

export function buildTimingAnswer(
  chart: Chart,
  topic: ForecastTopic,
  targetYears: number[],
  options: ForecastOptions = {},
): string {
  const now = new Date().getFullYear();
  const years = targetYears.length ? targetYears.slice(0, 3) : [now, now + 1];
  const forecasts = years.map((year) => analyzeForecastYear(chart, year, topic));
  const scope = normalizedMonths(options.months);
  const parts = forecasts.map((f) => {
    const ranked = rankWithin(f, scope);
    const best = monthList(ranked.best);
    const caution = monthList(ranked.caution);
    const scopeText = scope.length ? `你指定的月份範圍內，` : "";
    const why = options.explain === false ? "" : evidence(ranked.best);
    return `${yearVerdict(topic, f)}${scopeText}較順的窗口：${best || "—"}。較容易折騰或阻力偏高：${caution || "—"}。${why}`;
  });
  return `${parts.join(" ")} ${uncertainty(chart)}`.trim();
}

export function buildTravelDestinationAnswer(
  chart: Chart,
  targetYears: number[],
  options: ForecastOptions = {},
): string {
  const year = targetYears[0] ?? new Date().getFullYear();
  const f = analyzeForecastYear(chart, year, "travel");
  const ranked = rankWithin(f, options.months);
  const style = destinationStyleFrom(ranked.best.length ? ranked.best : f.best);
  return `如果你問「去哪裡比較適合」，在沒有指定候選城市的情況下，先看旅行型態：${style}如果你給出 2–3 個具體城市，再做逐一比較；沒有候選地時不亂點名國家。`;
}
