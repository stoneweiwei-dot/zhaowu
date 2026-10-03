import type { AnalysisResult } from "@/lib/bazi/types";
import { buildDecisionReportModel } from "@/lib/report/decision-report-model";

export type IllustratedSceneType = "workshop" | "crossing" | "courtyard" | "open-road";
export type IllustratedDestinyScene = {
  sourceClaim: string;
  sourceEvidence: string[];
  sceneType: IllustratedSceneType;
  visualMetaphor: string;
  caption: string;
  confidence: "medium" | "limited";
};

/**
 * One-way translation from the existing decision model to an optional picture.
 * This module does not edit the chart or calculate metaphysical conclusions.
 */
export function buildIllustratedDestiny(result: AnalysisResult): IllustratedDestinyScene | null {
  const model = buildDecisionReportModel(result);
  const sourceClaim = model.nextAction.trim();
  const directAnswer = model.directAnswer.trim();
  if (!sourceClaim || !directAnswer || model.confidence === "limited") return null;

  const confidence = result.chart.timeUnknown ? "limited" : "medium";
  if (confidence === "limited") return null;

  const sceneType: IllustratedSceneType = model.contract.kind === "career"
    ? "workshop"
    : model.contract.kind === "love"
      ? "crossing"
      : model.contract.kind === "home"
        ? "courtyard"
        : "open-road";
  const visualMetaphor: Record<IllustratedSceneType, string> = {
    workshop: "A traveller carries a finished scroll toward an open doorway.",
    crossing: "Two quiet figures meet across a narrow garden bridge.",
    courtyard: "A small figure pauses at a courtyard gate before choosing a path.",
    "open-road": "A small traveller follows a clear path through a quiet landscape.",
  };
  const sourceEvidence = [directAnswer, ...model.reasons, ...model.actions]
    .map((line) => line.trim())
    .filter((line, index, all) => line.length > 0 && all.indexOf(line) === index);
  if (!sourceEvidence.includes(sourceClaim)) sourceEvidence.push(sourceClaim);

  return {
    sourceClaim,
    sourceEvidence,
    sceneType,
    visualMetaphor: visualMetaphor[sceneType],
    caption: sourceClaim,
    confidence,
  };
}
