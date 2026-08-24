import type { AnalysisResult } from "@/lib/bazi/types";
import {
  composeFocusedReport,
  composeFocusedReportText,
  renderFocusedReportText,
  type ReportSection,
  type ReportSectionEvidence,
} from "@/lib/report/focused-report";

/**
 * Legacy compatibility only.
 * New code must import ReportSection / composeFocusedReport from focused-report.ts.
 * This alias exists so historical stored records and older account code remain readable
 * while the active product no longer enforces nine pages.
 */
export type NinePageEvidence = ReportSectionEvidence;
export type NinePage = ReportSection;

/** @deprecated Use composeFocusedReport. Returns 4 core sections + relevant optional sections, never a fixed nine-page product. */
export function composeNinePages(result: AnalysisResult): NinePage[] {
  return composeFocusedReport(result);
}

/** @deprecated Use renderFocusedReportText. */
export function renderNinePageText(pages: NinePage[]): string {
  return renderFocusedReportText(pages);
}

/** @deprecated Use composeFocusedReportText. */
export function composeNinePageReport(result: AnalysisResult): string {
  return composeFocusedReportText(result);
}
