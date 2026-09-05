import type { PredictionRecord } from "./types";

export function lockPrediction(record: PredictionRecord): PredictionRecord {
  if (record.locked) return record;
  return { ...record, locked: true };
}

export function reviewPrediction(record: PredictionRecord, outcome: NonNullable<PredictionRecord["outcome"]>, reviewedAt: string): PredictionRecord {
  if (!record.locked) throw new Error("Prediction must be locked before outcome review.");
  if (record.outcome) throw new Error("Prediction outcome is immutable once reviewed.");
  return { ...record, outcome, reviewedAt };
}

export function predictionHitRate(records: PredictionRecord[]) {
  const reviewed = records.filter((item) => item.outcome && item.outcome !== "無法判斷");
  if (!reviewed.length) return { reviewed: 0, hit: 0, partial: 0, miss: 0, weightedRate: null as number | null };
  const hit = reviewed.filter((item) => item.outcome === "命中").length;
  const partial = reviewed.filter((item) => item.outcome === "部分命中").length;
  const miss = reviewed.filter((item) => item.outcome === "未發生").length;
  return { reviewed: reviewed.length, hit, partial, miss, weightedRate: (hit + partial * 0.5) / reviewed.length };
}

export function assertPredictionIntegrity(before: PredictionRecord, after: PredictionRecord) {
  if (!before.locked) return true;
  const protectedKeys: Array<keyof PredictionRecord> = ["id", "createdAt", "targetWindow", "category", "claim", "confidence", "locked"];
  for (const key of protectedKeys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) throw new Error(`Locked prediction field changed: ${String(key)}`);
  }
  if (JSON.stringify(before.conditions) !== JSON.stringify(after.conditions)) throw new Error("Locked prediction conditions changed.");
  if (JSON.stringify(before.evidenceIds) !== JSON.stringify(after.evidenceIds)) throw new Error("Locked prediction evidence changed.");
  return true;
}
