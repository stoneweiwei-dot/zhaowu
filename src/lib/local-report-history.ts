import { readSharedBirthRecord, type SharedBirthRecord } from "@/lib/shared-birth";
import type { AnalysisResult } from "@/lib/bazi/types";

const KEY = "zhaowu.report-history.v1";
export const REPORT_HISTORY_EVENT = "zhaowu-report-history-change";
export type LocalReport = { result: AnalysisResult; savedAt: string; cloudSaved?: boolean; birth?: SharedBirthRecord | null };
function storage(target?: Storage) { return target ?? (typeof window === "undefined" ? null : window.localStorage); }
export function readLocalReports(target?: Storage): LocalReport[] {
  try {
    const rows = JSON.parse(storage(target)?.getItem(KEY) || "[]");
    return Array.isArray(rows) ? rows.filter(r => r?.result?.id && r.result.chart && r.result.reading && typeof r.result.question === "string") : [];
  } catch { return []; }
}
function write(rows: LocalReport[], target?: Storage) {
  try {
    const dest = storage(target);
    if (!dest) return false;
    dest.setItem(KEY, JSON.stringify(rows));
    if (typeof window !== "undefined") window.dispatchEvent(new Event(REPORT_HISTORY_EVENT));
    return true;
  } catch { return false; }
}
export function saveLocalReport(result: AnalysisResult, target?: Storage) {
  const rows = readLocalReports(target);
  const old = rows.find(r => r.result.id === result.id);
  return write([{ result, savedAt: old?.savedAt ?? new Date().toISOString(), cloudSaved: old?.cloudSaved, birth: old?.birth ?? (typeof window !== "undefined" ? readSharedBirthRecord() : null) }, ...rows.filter(r => r.result.id !== result.id)], target);
}
export function markReportCloudSaved(id: string, target?: Storage) {
  return write(readLocalReports(target).map(r => r.result.id === id ? { ...r, cloudSaved: true } : r), target);
}
export function removeLocalReport(id: string, target?: Storage) {
  return write(readLocalReports(target).filter(r => r.result.id !== id), target);
}
