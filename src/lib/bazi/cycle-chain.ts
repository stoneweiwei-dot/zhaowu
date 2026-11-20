import type { Chart, QuestionKind } from "@/lib/bazi/types";
import { analyzeBranchRelations, natalBranchPoints, type BranchPoint, type BranchRelation } from "@/lib/bazi/branch-relations";

export type CycleTopic = QuestionKind | "travel";

export type CycleChain = {
  dayunGanZhi: string | null;
  yearGanZhi: string;
  monthGanZhi: string;
  dayunRelations: BranchRelation[];
  yearRelations: BranchRelation[];
  monthRelations: BranchRelation[];
  crossLayerAdjustment: number;
  notes: string[];
};

function targetDayun(chart: Chart, year: number): string | null {
  return chart.dayun.find((period) => year >= period.startYear && year <= period.endYear)?.ganZhi ?? null;
}

function includesId(relation: BranchRelation, id: string): boolean {
  return relation.participants.some((point) => point.id === id);
}

function layerRelations(points: BranchPoint[], newestId: string): BranchRelation[] {
  return analyzeBranchRelations(points).filter((relation) => includesId(relation, newestId));
}

function dynamicCross(relation: BranchRelation): boolean {
  const sources = new Set(relation.participants.map((point) => point.source));
  if (sources.has("year") && sources.has("dayun")) return true;
  if (sources.has("month") && (sources.has("year") || sources.has("dayun"))) return true;
  return false;
}

function relationAdjustment(relation: BranchRelation, topic: CycleTopic): number {
  switch (relation.kind) {
    case "六合":
      return 0.5;
    case "六沖":
      return topic === "travel" ? -0.5 : -1.5;
    case "六害":
      return -1;
    case "相刑":
      return -1;
    case "自刑":
      return -0.75;
    case "相破":
      return -0.5;
    case "三合":
    case "三會":
    default:
      return 0;
  }
}

function crossAdjustment(relations: BranchRelation[], topic: CycleTopic): number {
  const raw = relations.filter(dynamicCross).reduce((sum, relation) => sum + relationAdjustment(relation, topic), 0);
  return Math.max(-2.5, Math.min(1.5, Math.round(raw * 4) / 4));
}

function compactRelations(relations: BranchRelation[], newestSource: string): string[] {
  const seen = new Set<string>();
  const notes: string[] = [];
  for (const relation of relations) {
    const counterparts = relation.participants
      .filter((point) => point.source !== newestSource)
      .map((point) => `${point.label ?? point.source ?? "原局"}${point.branch}`)
      .join("、");
    const text = `${relation.label}${counterparts ? `（牽動${counterparts}）` : ""}`;
    if (!seen.has(text)) {
      seen.add(text);
      notes.push(text);
    }
  }
  return notes.slice(0, 6);
}

/**
 * Full timing chain: natal → dayun → year → month.
 * Existing forecast scores already compare each dynamic pillar with the natal chart;
 * this layer adds the previously missing dynamic-to-dynamic links and exposes the
 * complete relation evidence. Cross-layer score changes are deliberately bounded.
 */
export function analyzeCycleChain(
  chart: Chart,
  year: number,
  yearGanZhi: string,
  monthGanZhi: string,
  topic: CycleTopic,
): CycleChain {
  const natal = natalBranchPoints(chart);
  const dayunGanZhi = chart.timeUnknown ? null : targetDayun(chart, year);
  const dayunPoint: BranchPoint | null = dayunGanZhi
    ? { id: "dayun", branch: dayunGanZhi[1], source: "dayun", label: `大運${dayunGanZhi}` }
    : null;
  const yearPoint: BranchPoint = { id: "year", branch: yearGanZhi[1], source: "year", label: `流年${yearGanZhi}` };
  const monthPoint: BranchPoint = { id: "month", branch: monthGanZhi[1], source: "month", label: `流月${monthGanZhi}` };

  const dayunPoints = dayunPoint ? [...natal, dayunPoint] : [...natal];
  const yearPoints = [...dayunPoints, yearPoint];
  const monthPoints = [...yearPoints, monthPoint];
  const dayunRelations = dayunPoint ? layerRelations(dayunPoints, "dayun") : [];
  const yearRelations = layerRelations(yearPoints, "year");
  const monthRelations = layerRelations(monthPoints, "month");
  const allDynamicRelations = [...dayunRelations, ...yearRelations, ...monthRelations];
  const crossLayerAdjustment = crossAdjustment(allDynamicRelations, topic);

  const notes = [
    dayunGanZhi ? `大運${dayunGanZhi}` : "大運未納入（出生時間未知或不在已排大運範圍）",
    ...compactRelations(dayunRelations, "dayun").map((item) => `大運層：${item}`),
    ...compactRelations(yearRelations, "year").map((item) => `流年層：${item}`),
    ...compactRelations(monthRelations, "month").map((item) => `流月層：${item}`),
  ];

  return {
    dayunGanZhi,
    yearGanZhi,
    monthGanZhi,
    dayunRelations,
    yearRelations,
    monthRelations,
    crossLayerAdjustment,
    notes,
  };
}

export function cycleChainEvidence(chain: CycleChain): string {
  const route = `${chain.dayunGanZhi ? `大運${chain.dayunGanZhi} → ` : ""}流年${chain.yearGanZhi} → 流月${chain.monthGanZhi}`;
  const relationNotes = chain.notes.filter((note) => /層：/.test(note)).slice(0, 4);
  return `歲運作用鏈：${route}${relationNotes.length ? `；${relationNotes.join("；")}` : "；動態層之間未見需額外標出的刑沖合害破。"}`;
}
