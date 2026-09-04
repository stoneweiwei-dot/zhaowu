import type { Chart } from "@/lib/bazi/types";

export type BranchRelationKind = "六合" | "六沖" | "六害" | "相破" | "相刑" | "自刑" | "三合" | "三會";

export type BranchPoint = {
  id: string;
  branch: string;
  source?: "natal" | "dayun" | "year" | "month" | string;
  label?: string;
};

export type BranchRelation = {
  kind: BranchRelationKind;
  label: string;
  branches: string[];
  participants: BranchPoint[];
  transformation: string | null;
  caution: string;
};

export const TOMB_BRANCHES = new Set(["辰", "戌", "丑", "未"]);

const PAIR_RELATIONS: Array<{ kind: Exclude<BranchRelationKind, "自刑" | "三合" | "三會">; pair: [string, string]; transformation?: string }> = [
  { kind: "六合", pair: ["子", "丑"], transformation: "土" },
  { kind: "六合", pair: ["寅", "亥"], transformation: "木" },
  { kind: "六合", pair: ["卯", "戌"], transformation: "火" },
  { kind: "六合", pair: ["辰", "酉"], transformation: "金" },
  { kind: "六合", pair: ["巳", "申"], transformation: "水" },
  { kind: "六合", pair: ["午", "未"], transformation: "土" },
  { kind: "六沖", pair: ["子", "午"] },
  { kind: "六沖", pair: ["丑", "未"] },
  { kind: "六沖", pair: ["寅", "申"] },
  { kind: "六沖", pair: ["卯", "酉"] },
  { kind: "六沖", pair: ["辰", "戌"] },
  { kind: "六沖", pair: ["巳", "亥"] },
  { kind: "六害", pair: ["子", "未"] },
  { kind: "六害", pair: ["丑", "午"] },
  { kind: "六害", pair: ["寅", "巳"] },
  { kind: "六害", pair: ["卯", "辰"] },
  { kind: "六害", pair: ["申", "亥"] },
  { kind: "六害", pair: ["酉", "戌"] },
  { kind: "相破", pair: ["子", "酉"] },
  { kind: "相破", pair: ["卯", "午"] },
  { kind: "相破", pair: ["辰", "丑"] },
  { kind: "相破", pair: ["未", "戌"] },
  { kind: "相破", pair: ["寅", "亥"] },
  { kind: "相破", pair: ["巳", "申"] },
  { kind: "相刑", pair: ["子", "卯"] },
  { kind: "相刑", pair: ["寅", "巳"] },
  { kind: "相刑", pair: ["巳", "申"] },
  { kind: "相刑", pair: ["申", "寅"] },
  { kind: "相刑", pair: ["丑", "戌"] },
  { kind: "相刑", pair: ["戌", "未"] },
  { kind: "相刑", pair: ["未", "丑"] },
];

const SELF_PUNISH = new Set(["辰", "午", "酉", "亥"]);

const TRIPLE_RELATIONS: Array<{ kind: "三合" | "三會"; branches: [string, string, string]; transformation: string }> = [
  { kind: "三合", branches: ["申", "子", "辰"], transformation: "水" },
  { kind: "三合", branches: ["亥", "卯", "未"], transformation: "木" },
  { kind: "三合", branches: ["寅", "午", "戌"], transformation: "火" },
  { kind: "三合", branches: ["巳", "酉", "丑"], transformation: "金" },
  { kind: "三會", branches: ["寅", "卯", "辰"], transformation: "木" },
  { kind: "三會", branches: ["巳", "午", "未"], transformation: "火" },
  { kind: "三會", branches: ["申", "酉", "戌"], transformation: "金" },
  { kind: "三會", branches: ["亥", "子", "丑"], transformation: "水" },
];

function pairMatches(a: string, b: string, pair: [string, string]): boolean {
  return (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]);
}

function cautionFor(kind: BranchRelationKind, transformation?: string): string {
  if (kind === "六合") return `先論牽制、收束與互相改變；${transformation ? `雖有向${transformation}的傳統化氣方向，` : ""}不得只憑六合直接判合化。`;
  if (kind === "三合" || kind === "三會") return `完整支組已見，但是否真正成${transformation ?? "局"}仍須月令、透干、根氣、制化與病藥共同支持。`;
  if (kind === "六沖") return "先論位置被引動、對立與位移；沖不等於必凶，也不等於四庫必然開庫。";
  if (kind === "六害") return "先論暗中牽扯、配合成本與細節阻滯，不直接外推具體事件。";
  if (kind === "相刑" || kind === "自刑") return "先論內部摩擦、反覆或耗損；刑不直接等同災禍。";
  return "先論結構鬆動與不穩定，不直接外推具體事件。";
}

function relationKey(kind: BranchRelationKind, participants: BranchPoint[]): string {
  return `${kind}:${participants.map((point) => point.id).sort().join("|")}`;
}

export function analyzeBranchRelations(points: BranchPoint[]): BranchRelation[] {
  const valid = points.filter((point) => point.branch && point.id);
  const out: BranchRelation[] = [];
  const seen = new Set<string>();

  const push = (relation: BranchRelation) => {
    const key = relationKey(relation.kind, relation.participants);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(relation);
  };

  for (let i = 0; i < valid.length; i += 1) {
    for (let j = i + 1; j < valid.length; j += 1) {
      const a = valid[i];
      const b = valid[j];
      if (a.branch === b.branch && SELF_PUNISH.has(a.branch)) {
        push({
          kind: "自刑",
          label: `${a.branch}${a.branch}自刑`,
          branches: [a.branch, b.branch],
          participants: [a, b],
          transformation: null,
          caution: cautionFor("自刑"),
        });
      }
      for (const rule of PAIR_RELATIONS) {
        if (!pairMatches(a.branch, b.branch, rule.pair)) continue;
        push({
          kind: rule.kind,
          label: `${rule.pair.join("")}${rule.kind}`,
          branches: [...rule.pair],
          participants: [a, b],
          transformation: rule.transformation ?? null,
          caution: cautionFor(rule.kind, rule.transformation),
        });
      }
    }
  }

  for (const rule of TRIPLE_RELATIONS) {
    const participants = rule.branches.map((branch) => valid.find((point) => point.branch === branch));
    if (participants.some((point) => !point)) continue;
    const exact = participants as BranchPoint[];
    push({
      kind: rule.kind,
      label: `${rule.branches.join("")}${rule.kind}${rule.transformation}局條件`,
      branches: [...rule.branches],
      participants: exact,
      transformation: rule.transformation,
      caution: cautionFor(rule.kind, rule.transformation),
    });
  }

  const order: Record<BranchRelationKind, number> = { 六沖: 0, 相刑: 1, 自刑: 2, 六害: 3, 相破: 4, 六合: 5, 三合: 6, 三會: 7 };
  return out.sort((a, b) => order[a.kind] - order[b.kind] || a.label.localeCompare(b.label, "zh-Hant"));
}

export function natalBranchPoints(chart: Chart): BranchPoint[] {
  return chart.pillars
    .filter((pillar) => pillar.ready !== false && Boolean(pillar.zhi))
    .map((pillar) => ({ id: `natal:${pillar.key}`, branch: pillar.zhi, source: "natal", label: pillar.label }));
}

export function summarizeBranchRelations(relations: BranchRelation[], limit = 8): string {
  if (!relations.length) return "原局未見需要額外標出的刑、沖、合、害、破、完整三合／三會或自刑。";
  return relations.slice(0, limit).map((relation) => relation.label).join("、");
}

export function isTombBranch(branch: string): boolean {
  return TOMB_BRANCHES.has(branch);
}
