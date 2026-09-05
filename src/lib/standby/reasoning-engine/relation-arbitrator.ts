import type { BranchRelation } from "@/lib/bazi/branch-relations";
import type { Confidence } from "./types";

export type RelationContext = {
  relation: BranchRelation;
  monthCommandSupport: boolean | null;
  exposedStemSupport: boolean | null;
  nearKeyPalace: boolean | null;
  touchesDiseaseOrRemedy: boolean | null;
  activatedByCycle: boolean | null;
};

export type ArbitratedRelation = RelationContext & {
  score: number;
  confidence: Confidence;
  effective: boolean;
  decisiveReason: string;
};

const BASE_WEIGHT: Record<BranchRelation["kind"], number> = {
  三會: 80,
  三合: 70,
  六合: 45,
  六沖: 40,
  相刑: 30,
  自刑: 30,
  六害: 20,
  相破: 20,
};

function add(score: number, value: boolean | null, weight: number) {
  return value === true ? score + weight : value === false ? score - Math.ceil(weight / 2) : score;
}

export function arbitrateRelation(context: RelationContext): ArbitratedRelation {
  let score = BASE_WEIGHT[context.relation.kind] ?? 0;
  score = add(score, context.monthCommandSupport, 20);
  score = add(score, context.exposedStemSupport, 15);
  score = add(score, context.nearKeyPalace, 10);
  score = add(score, context.activatedByCycle, 15);
  // 病藥是最終裁決層，因此權重高於單一靜態關係。
  score = add(score, context.touchesDiseaseOrRemedy, 30);

  const unknownCount = [context.monthCommandSupport, context.exposedStemSupport, context.nearKeyPalace, context.touchesDiseaseOrRemedy, context.activatedByCycle].filter((v) => v === null).length;
  const confidence: Confidence = unknownCount >= 3 ? "low" : unknownCount ? "medium" : "high";
  const effective = score >= 55;
  const decisiveReason = context.touchesDiseaseOrRemedy === true
    ? "此關係直接觸及病藥核心，優先於純靜態排名。"
    : context.activatedByCycle === true
      ? "歲運已把原局關係引動，實際權重高於未啟動的靜態關係。"
      : "目前按月令、透干、位置與靜態結構綜合排序；不把單一合沖直接等同成局或吉凶。";

  return { ...context, score, confidence, effective, decisiveReason };
}

export function rankRelations(contexts: RelationContext[]) {
  return contexts.map(arbitrateRelation).sort((a, b) => b.score - a.score);
}
