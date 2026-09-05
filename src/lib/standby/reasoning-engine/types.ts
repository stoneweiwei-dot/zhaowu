export type StandbyStatus = "standby" | "active";
export type Verdict = "成立" | "部分成立" | "不成立" | "資料不足";
export type Confidence = "high" | "medium" | "low" | "unknown";

export type EvidenceNode = {
  id: string;
  kind: "fact" | "rule" | "inference" | "counterevidence" | "trigger" | "real-world";
  label: string;
  source?: string;
  confidence?: Confidence;
  metadata?: Record<string, string | number | boolean | null>;
};

export type EvidenceEdge = {
  from: string;
  to: string;
  relation: "supports" | "contradicts" | "requires" | "activates" | "maps-to";
};

export type EvidenceGraph = {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
};

export type RuleCondition = {
  id: string;
  label: string;
  required: boolean;
  matched: boolean | null;
  evidenceIds?: string[];
};

export type ClassicalRule = {
  id: string;
  title: string;
  source: string;
  school?: string;
  necessary: RuleCondition[];
  exclusions: RuleCondition[];
  notes?: string[];
};

export type RuleEvaluation = {
  ruleId: string;
  verdict: Verdict;
  satisfied: RuleCondition[];
  missing: RuleCondition[];
  exclusionsHit: RuleCondition[];
  confidence: Confidence;
};

export type PredictionRecord = {
  id: string;
  createdAt: string;
  targetWindow: string;
  category: string;
  claim: string;
  conditions: string[];
  confidence: Confidence;
  evidenceIds: string[];
  locked: boolean;
  outcome?: "命中" | "部分命中" | "未發生" | "無法判斷";
  reviewedAt?: string;
};
