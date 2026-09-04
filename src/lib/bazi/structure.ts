import { HIDDEN, tenGod } from "@/lib/bazi/calendar";
import { analyzeBranchRelations, natalBranchPoints, summarizeBranchRelations, type BranchRelation } from "@/lib/bazi/branch-relations";
import { analyzeStructuralRemedy, type StructuralRemedy } from "@/lib/bazi/structural-remedy";
import type { Chart } from "@/lib/bazi/types";

const STRUCTURE_QUESTION_RE = /(八字|命局|命盤|命盘)?\s*(是|屬於|属于|算|走)?\s*(什麼|什么|哪一種|哪一种)?\s*(格局|格)|(格局|立格|成格|破格|殺印相生|杀印相生|食神制殺|食神制杀|傷官配印|伤官配印)/;

const STRUCTURE_BY_TEN_GOD: Record<string, string> = {
  正官: "正官格",
  七殺: "七殺格",
  正印: "正印格",
  偏印: "偏印格",
  正財: "正財格",
  偏財: "偏財格",
  食神: "食神格",
  傷官: "傷官格",
  比肩: "建祿格",
  劫財: "月刃格",
};

export type StructureSummary = {
  label: string;
  monthMainStem: string;
  monthTenGod: string;
  established: boolean;
  supportingPattern: string | null;
  branchRelations: BranchRelation[];
  remedy: StructuralRemedy;
  evidenceLines: string[];
  directAnswer: string;
};

export function isStructureQuestion(question: string): boolean {
  return STRUCTURE_QUESTION_RE.test(question.replace(/\s+/g, ""));
}

/**
 * 子平 structure summary in a fixed order:
 * 月令 → 立格 → 可見制化 → 地支作用 → 病藥／通關.
 * Transformation and auspicious-event claims remain conservative unless the
 * current engine has enough evidence to support them.
 */
export function analyzeStructure(chart: Chart): StructureSummary {
  const monthPillar = chart.pillars.find((pillar) => pillar.key === "month");
  const monthMainStem = HIDDEN[chart.monthBranch]?.[0] ?? monthPillar?.gan ?? "未定";
  const monthTenGod = monthMainStem === "未定" ? "未定" : tenGod(chart.dayMaster, monthMainStem);
  const label = STRUCTURE_BY_TEN_GOD[monthTenGod] ?? `${monthTenGod}格`;
  const visible = chart.pillars
    .filter((pillar) => pillar.ready !== false && pillar.key !== "day" && Boolean(pillar.gan))
    .map((pillar) => ({ stem: pillar.gan, god: tenGod(chart.dayMaster, pillar.gan), key: pillar.key }));
  const exposedMonthQi = visible.some((item) => item.stem === monthMainStem);
  const hasOfficer = visible.some((item) => item.god === "正官" || item.god === "七殺");
  const hasSeal = visible.some((item) => item.god === "正印" || item.god === "偏印");
  const hasOutput = visible.some((item) => item.god === "食神" || item.god === "傷官");
  const hasKill = visible.some((item) => item.god === "七殺");

  let supportingPattern: string | null = null;
  if ((monthTenGod === "正印" || monthTenGod === "偏印") && hasOfficer && hasSeal) {
    supportingPattern = "殺印相生";
  } else if (monthTenGod === "七殺" && hasOutput) {
    supportingPattern = "食神制殺的可見條件";
  } else if (monthTenGod === "傷官" && hasSeal) {
    supportingPattern = "傷官配印的可見條件";
  } else if (hasKill && hasSeal) {
    supportingPattern = "殺印相生的可見主線";
  }

  const branchRelations = analyzeBranchRelations(natalBranchPoints(chart));
  const remedy = analyzeStructuralRemedy(chart);
  const exposureText = exposedMonthQi
    ? `月令主氣${monthMainStem}${monthTenGod}透干，立格依據清楚。`
    : `月令主氣為${monthMainStem}${monthTenGod}，但未直接透干，因此先按「${label}方向」判，不把成格程度說滿。`;
  const visibleText = visible.length
    ? `天干可見：${visible.map((item) => `${item.stem}${item.god}`).join("、")}。`
    : "其餘天干資訊不足，不追加複合格局。";
  const supportText = supportingPattern ? `同時可見${supportingPattern}。` : "目前不追加第二個複合格局名稱。";
  const relationText = `地支作用：${summarizeBranchRelations(branchRelations)}。合、三合、三會只先記結構條件，不自動等同合化。`;
  const remedyText = `病藥層：${remedy.disease}；${remedy.medicine}${remedy.bridge ? ` 通關鏈：${remedy.bridge}。` : ""}`;
  const opening = exposedMonthQi ? `你的八字以「${label}」立格` : `你的八字以「${label}方向」為主`;
  const directAnswer = `直接答案：${opening}${supportingPattern ? `，並以「${supportingPattern}」為主要結構` : ""}。${exposureText}${visibleText}${relationText}${remedyText}這回答的是原局格局，不拿身強身弱、五行百分比或性格描述代替。`;

  return {
    label,
    monthMainStem,
    monthTenGod,
    established: exposedMonthQi,
    supportingPattern,
    branchRelations,
    remedy,
    evidenceLines: [
      `月令：${chart.monthBranch}；月令主氣：${monthMainStem}${monthTenGod}。`,
      exposureText,
      visibleText,
      supportText,
      relationText,
      remedyText,
      ...remedy.evidence,
    ],
    directAnswer,
  };
}
