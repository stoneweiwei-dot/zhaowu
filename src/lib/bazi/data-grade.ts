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
import { buildChart } from "./chart";
import { dataGradeNoticeLines } from "../data-grade-copy";
import { effectiveTimeSource } from "./time-source";
import type { AnalyzeInput, BirthTimeSource, Chart } from "./types";

export type { BirthTimeSource };
export { effectiveTimeSource, normalizeTimeSource } from "./time-source";
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

/** Grade a birth record on its own (builds the chart the same way every other caller does). */
export function assessBirthRecord(record: Omit<AnalyzeInput, "question">): DataGradeReport | null {
  try {
    const input: AnalyzeInput = { ...record, question: "" };
    return assessDataGrade(input, effectiveTimeSource(input), buildChart(input));
  } catch {
    return null;
  }
}

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

  return { grade, source: effectiveSource, reasons, parts, nearestJie, notice: dataGradeNoticeLines(grade, reasons, parts, "zh-Hant").join("\n") };
}
