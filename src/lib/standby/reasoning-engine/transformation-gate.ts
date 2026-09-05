import type { Confidence, EvidenceGraph, Verdict } from "./types";

export type TransformationGateInput = {
  label: string;
  monthCommandSupport: boolean | null;
  exposedStemSupport: boolean | null;
  rootedSupport: boolean | null;
  guidingSupport: boolean | null;
  brokenByCounterforce: boolean | null;
  graph?: EvidenceGraph;
};

export type TransformationGateResult = {
  label: string;
  verdict: Verdict;
  confidence: Confidence;
  passed: string[];
  failed: string[];
  unknown: string[];
  reason: string;
};

export function evaluateTransformationGate(input: TransformationGateInput): TransformationGateResult {
  const checks = [
    ["月令支持", input.monthCommandSupport],
    ["透干支持", input.exposedStemSupport],
    ["根氣支持", input.rootedSupport],
    ["引化／通關支持", input.guidingSupport],
  ] as const;
  const passed = checks.filter(([, value]) => value === true).map(([label]) => label);
  const failed = checks.filter(([, value]) => value === false).map(([label]) => label);
  const unknown = checks.filter(([, value]) => value === null).map(([label]) => label);

  if (input.brokenByCounterforce === true) {
    return { label: input.label, verdict: "不成立", confidence: "high", passed, failed: [...failed, "存在明確破化／反制"], unknown, reason: "存在直接破化條件，特殊從化不得成立。" };
  }
  if (unknown.length || input.brokenByCounterforce === null) {
    return { label: input.label, verdict: "資料不足", confidence: "unknown", passed, failed, unknown: [...unknown, ...(input.brokenByCounterforce === null ? ["破化條件未定"] : [])], reason: "前置條件尚未核清，不得越過閘門直接定從格／化格／專旺。" };
  }
  if (failed.length) {
    return { label: input.label, verdict: passed.length >= 2 ? "部分成立" : "不成立", confidence: "medium", passed, failed, unknown, reason: "候選結構有支持，但必要條件未齊；只能保留局部傾向。" };
  }
  return { label: input.label, verdict: "成立", confidence: "high", passed, failed, unknown, reason: "月令、透干、根氣與引化條件均通過，且未見明確破化。" };
}
