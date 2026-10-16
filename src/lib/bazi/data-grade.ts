/**
 * Birth-data evidence grade (A / B / C).
 *
 * Pure, read-only layer on top of the locked chart engine. It never recalculates or
 * alters a chart: it only reports how far the birth data justifies each part of the
 * output, in line with PATCH 04 "Data Evidence Boundary" (output must not be finer
 * than the known data).
 *
 * Grade meaning
 *   A  birth time from an official record, to the minute
 *   B  birth time remembered / reported, to the shichen (2h) level, not record-verified
 *   C  birth time unknown or only approximate
 *
 * Per-part status
 *   full      engine output is justified by the data
 *   caveat    engine output is shown but must carry an explicit reliability note
 *   withheld  the data cannot support this part; do not present it as a conclusion
 */
import { timezoneOffsetHours } from "./cities";
import { jieqiAround } from "./calendar";
import type { AnalyzeInput, Chart } from "./types";

export type BirthTimeSource = "certificate" | "family-memory" | "estimate" | "unknown";
export type DataGrade = "A" | "B" | "C";
export type PartStatus = "full" | "caveat" | "withheld";

export type DataGradeParts = {
  yearPillar: PartStatus;
  monthPillar: PartStatus;
  dayPillar: PartStatus;
  timePillar: PartStatus;
  dayun: PartStatus;
  minggongShengong: PartStatus;
};

export type DataGradeReason =
  | "time-unknown"
  | "time-estimate"
  | "time-from-memory"
  | "place-unverified"
  | "jie-near-birth-instant"
  | "jie-within-birth-day"
  | "true-solar-candidate-conflict";

export type DataGradeReport = {
  grade: DataGrade;
  source: BirthTimeSource;
  reasons: DataGradeReason[];
  parts: DataGradeParts;
  /** The month-opening solar term closest to the birth instant (known-time charts only). */
  nearestJie: { name: string; minutesAway: number; windowMinutes: number } | null;
  /** Zh-Hant copy for the pre-payment confirmation and the report footer. */
  notice: string;
};

/** Uncertainty window around a month-opening solar term, by how the time is known. */
const JIE_WINDOW_MINUTES: Record<Exclude<BirthTimeSource, "unknown" | "estimate">, number> = {
  certificate: 3,
  "family-memory": 60,
};

function civilToUtcMs(y: number, m: number, d: number, h: number, min: number, tzOffsetHours: number): number {
  return Date.UTC(y, m - 1, d, h, min) - tzOffsetHours * 3_600_000;
}

/** Two-pass offset resolution, identical to the chart engine, so DST edges agree. */
function civilInstantMs(input: AnalyzeInput, hour: number, minute: number): { ms: number; tzOffset: number } {
  const guess = Date.UTC(input.year, input.month - 1, input.day, hour, minute);
  let tz = timezoneOffsetHours(input.city.timezone, new Date(guess));
  tz = timezoneOffsetHours(input.city.timezone, new Date(guess - tz * 3_600_000));
  return { ms: civilToUtcMs(input.year, input.month, input.day, hour, minute, tz), tzOffset: tz };
}

function pickGrade(input: AnalyzeInput, source: BirthTimeSource, placeUnverified: boolean): DataGrade {
  if (input.timeUnknown || source === "unknown" || source === "estimate") return "C";
  if (source === "certificate" && !placeUnverified) return "A";
  return "B";
}

export function assessDataGrade(
  input: AnalyzeInput,
  source: BirthTimeSource,
  chart: Pick<Chart, "birthTimeReview" | "locationFallback">,
): DataGradeReport {
  const reasons: DataGradeReason[] = [];
  const placeUnverified = Boolean(chart.locationFallback || input.city.standardTimeFallback);
  const effectiveSource: BirthTimeSource = input.timeUnknown ? "unknown" : source;

  if (effectiveSource === "unknown") reasons.push("time-unknown");
  if (effectiveSource === "estimate") reasons.push("time-estimate");
  if (effectiveSource === "family-memory") reasons.push("time-from-memory");
  if (placeUnverified) reasons.push("place-unverified");

  const grade = pickGrade(input, effectiveSource, placeUnverified);

  let monthRisk = false; // a month-opening term may change the month pillar
  let yearRisk = false; // that term is 立春, which also changes the year pillar
  let nearestJie: DataGradeReport["nearestJie"] = null;

  if (grade === "C") {
    // Unknown/approximate hour: the engine fixes the instant at local noon. Any month-opening
    // term inside the civil day makes the month (and, for 立春, the year) pillar undecidable.
    const { tzOffset } = civilInstantMs(input, 12, 0);
    const dayStart = civilToUtcMs(input.year, input.month, input.day, 0, 0, tzOffset);
    const dayEnd = dayStart + 24 * 3_600_000;
    const { prev, next } = jieqiAround(new Date(dayStart));
    const inDay = [prev, next].find((j) => j.at.getTime() >= dayStart && j.at.getTime() < dayEnd);
    if (inDay) {
      monthRisk = true;
      yearRisk = inDay.name === "立春";
      reasons.push("jie-within-birth-day");
    }
  } else {
    const { ms } = civilInstantMs(input, input.hour, input.minute);
    const { prev, next } = jieqiAround(new Date(ms));
    const window = JIE_WINDOW_MINUTES[effectiveSource as "certificate" | "family-memory"];
    const toPrev = (ms - prev.at.getTime()) / 60_000;
    const toNext = (next.at.getTime() - ms) / 60_000;
    const closest = toPrev <= toNext ? { j: prev, m: toPrev } : { j: next, m: toNext };
    nearestJie = { name: closest.j.name, minutesAway: Math.round(closest.m), windowMinutes: window };
    if (closest.m <= window) {
      monthRisk = true;
      yearRisk = closest.j.name === "立春";
      reasons.push("jie-near-birth-instant");
    }
  }

  const conflict = chart.birthTimeReview.required;
  if (conflict && grade !== "C") reasons.push("true-solar-candidate-conflict");

  const parts: DataGradeParts =
    grade === "C"
      ? {
          yearPillar: yearRisk ? "withheld" : "full",
          monthPillar: monthRisk ? "withheld" : "full",
          dayPillar: "full",
          timePillar: "withheld",
          dayun: "withheld",
          minggongShengong: "withheld",
        }
      : {
          yearPillar: yearRisk ? "caveat" : "full",
          monthPillar: monthRisk ? "caveat" : "full",
          dayPillar: conflict ? "caveat" : "full",
          timePillar: grade === "A" && !conflict ? "full" : "caveat",
          // Start age moves only ~5 days per hour of error; the real risk is the month
          // pillar (which fixes direction and sequence), so dayun follows monthRisk.
          dayun: monthRisk ? "caveat" : "full",
          minggongShengong: grade === "A" && !conflict ? "full" : "caveat",
        };

  return { grade, source: effectiveSource, reasons, parts, nearestJie, notice: buildNotice(grade, reasons, parts) };
}

function buildNotice(grade: DataGrade, reasons: DataGradeReason[], parts: DataGradeParts): string {
  const label: Record<DataGrade, string> = {
    A: "A 級：出生時間取自正式紀錄，精確到分鐘",
    B: "B 級：出生時間精確到時辰，未經證件驗證",
    C: "C 級：出生時間未知或僅知大概",
  };
  const lines = [`資料可信度【${label[grade]}】`];
  if (parts.timePillar === "withheld") {
    lines.push("時柱、命宮、身宮與大運起運不作論斷；本報告僅依年、月、日三柱，不用午時之類的預設值替代。");
  } else if (parts.timePillar === "caveat") {
    lines.push("與時柱、命宮、身宮相關的結論可信度有限，請以出生紀錄核對後再作定論。");
  }
  if (reasons.includes("jie-within-birth-day")) {
    lines.push("你的出生日當天恰有節氣交接，月柱（若為立春則含年柱）無法在不知時間時確定，已不作論斷。");
  }
  if (reasons.includes("jie-near-birth-instant")) {
    lines.push("出生時間貼近節氣交接，月柱可能因時間誤差而不同，相關結論附註保留。");
  }
  if (reasons.includes("place-unverified")) {
    lines.push("出生地未能確認，未校正真太陽時，時辰邊界附近的判斷可能偏移。");
  }
  if (reasons.includes("true-solar-candidate-conflict")) {
    lines.push("民用時間與真太陽時落在不同時辰或日界，已列為待驗證候選，定盤須以出生紀錄為準。");
  }
  lines.push("我們不以不完整的資料製造虛假的精確。");
  return lines.join("\n");
}
