import type { AnalysisResult } from "@/lib/bazi/types";

export type EvidenceLevel = "A" | "B" | "C" | "D";
export type EvidenceState = "verified" | "probable" | "disputed" | "symbolic" | "withheld";

export type EvidenceItem = {
  key: string;
  level: EvidenceLevel;
  state: EvidenceState;
  source: "calculated-chart" | "derived-rule" | "auxiliary" | "symbolic";
};

export type EvidenceGovernanceModel = {
  policyVersion: "NEXUS-YUANHAI-V4";
  items: EvidenceItem[];
  hasProvisionalResult: boolean;
  hasWithheldResult: boolean;
};

export function buildEvidenceGovernanceModel(result: AnalysisResult): EvidenceGovernanceModel {
  const chart = result.chart;
  const usefulProvisional = Boolean(chart.usefulProvisional);

  const items: EvidenceItem[] = [
    { key: "birth-chart", level: "A", state: "verified", source: "calculated-chart" },
    { key: "day-master", level: "A", state: "verified", source: "calculated-chart" },
    { key: "month-command", level: "A", state: "verified", source: "calculated-chart" },
    {
      key: "useful-elements",
      level: usefulProvisional ? "C" : "B",
      state: usefulProvisional ? "probable" : "verified",
      source: "derived-rule",
    },
    { key: "formal-structure-remedy", level: "D", state: "withheld", source: "derived-rule" },
    { key: "symbolic-art", level: "D", state: "symbolic", source: "symbolic" },
  ];

  return {
    policyVersion: "NEXUS-YUANHAI-V4",
    items,
    hasProvisionalResult: items.some((item) => item.state === "probable" || item.state === "disputed"),
    hasWithheldResult: items.some((item) => item.state === "withheld"),
  };
}
