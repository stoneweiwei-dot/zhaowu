import type { AnalysisResult } from "@/lib/bazi/types";
import { finalizeReading } from "@/lib/report/final-reading";

export const CURRENT_ENGINE_VERSION = "ZW-ENGINE-2026.08.24-P0.2";

export type VersionedAnalysisResult = AnalysisResult & {
  engineVersion?: string;
};

const ELEMENTS = ["木", "火", "土", "金", "水"] as const;

function normalizedElementPercents(result: AnalysisResult): AnalysisResult["chart"]["elementPercents"] {
  const current = result.chart.elementPercents;
  const currentTotal = Object.values(current ?? {}).reduce((sum, value) => sum + Number(value || 0), 0);
  if (currentTotal > 0.01) return current;

  const total = ELEMENTS.reduce((sum, key) => sum + Number(result.chart.elements?.[key] ?? 0), 0);
  if (total <= 0) return current;

  return Object.fromEntries(
    ELEMENTS.map((key) => [key, Math.round((Number(result.chart.elements?.[key] ?? 0) / total) * 1000) / 10]),
  ) as AnalysisResult["chart"]["elementPercents"];
}

export function needsStoredAnalysisUpgrade(result: VersionedAnalysisResult | null | undefined): boolean {
  return Boolean(result && result.engineVersion !== CURRENT_ENGINE_VERSION);
}

/**
 * One-time migration for persisted deterministic readings created by an older engine.
 * It never rebuilds the birth chart from guessed inputs. It only:
 *  - repairs legacy derived percentages when the stored chart already contains counts;
 *  - reapplies the current answer contract to the exact stored question/chart;
 *  - stamps the canonical engine version so later reads stay immutable.
 */
export function upgradeStoredAnalysis(result: VersionedAnalysisResult): VersionedAnalysisResult {
  if (!needsStoredAnalysisUpgrade(result)) return result;

  const chart = {
    ...result.chart,
    elementPercents: normalizedElementPercents(result),
  };
  const reading = finalizeReading(result.question, chart, result.reading);

  return {
    ...result,
    chart,
    reading,
    engineVersion: CURRENT_ENGINE_VERSION,
  };
}
