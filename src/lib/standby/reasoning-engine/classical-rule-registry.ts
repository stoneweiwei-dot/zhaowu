import type { ClassicalRule, Confidence, RuleCondition, RuleEvaluation, Verdict } from "./types";

function splitConditions(conditions: RuleCondition[]) {
  const satisfied = conditions.filter((item) => item.matched === true);
  const missing = conditions.filter((item) => item.matched !== true);
  return { satisfied, missing };
}

function confidenceFrom(rule: ClassicalRule, verdict: Verdict): Confidence {
  if (verdict === "資料不足") return "unknown";
  const known = [...rule.necessary, ...rule.exclusions].filter((item) => item.matched !== null).length;
  const total = rule.necessary.length + rule.exclusions.length;
  if (!total || known / total < 0.6) return "low";
  if (verdict === "成立" && known === total) return "high";
  return "medium";
}

export function evaluateClassicalRule(rule: ClassicalRule): RuleEvaluation {
  const required = rule.necessary.filter((item) => item.required);
  const optional = rule.necessary.filter((item) => !item.required);
  const requiredUnknown = required.some((item) => item.matched === null);
  const requiredFailed = required.some((item) => item.matched === false);
  const exclusionsHit = rule.exclusions.filter((item) => item.matched === true);
  const { satisfied, missing } = splitConditions(rule.necessary);

  let verdict: Verdict;
  if (requiredUnknown) verdict = "資料不足";
  else if (exclusionsHit.length || requiredFailed) verdict = "不成立";
  else if (required.every((item) => item.matched === true) && optional.every((item) => item.matched !== false)) verdict = "成立";
  else verdict = "部分成立";

  return {
    ruleId: rule.id,
    verdict,
    satisfied,
    missing,
    exclusionsHit,
    confidence: confidenceFrom(rule, verdict),
  };
}

/**
 * Standby-only seed registry. It is intentionally not imported by any runtime path.
 * When activated, every classical pattern must be represented as conditions + exclusions,
 * never as a raw keyword hit from a text corpus.
 */
export const standbyClassicalRules: ClassicalRule[] = [];
