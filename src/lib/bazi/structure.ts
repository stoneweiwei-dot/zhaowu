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

export type StructureCompletion = {
  grade: "G0" | "G1" | "G2" | "G3" | "G4";
  label: "格局未定" | "格局方向" | "成格有條件" | "成格可用" | "結構完成度高";
  capacity: "未定" | "局部結構／容量有限" | "主結構完整／容量中等" | "結構容量大／完成度高";
  reasons: string[];
};

export type StructureSummary = {
  label: string;
  monthMainStem: string;
  monthTenGod: string;
  established: boolean;
  supportingPattern: string | null;
  branchRelations: BranchRelation[];
  remedy: StructuralRemedy;
  completion: StructureCompletion;
  evidenceLines: string[];
  directAnswer: string;
};

export function isStructureQuestion(question: string): boolean {
  return STRUCTURE_QUESTION_RE.test(question.replace(/\s+/g, ""));
}

function hasDirectDamageToMonth(branchRelations: BranchRelation[], monthBranch: string): boolean {
  return branchRelations.some((relation) => {
    const text = JSON.stringify(relation);
    return text.includes(monthBranch) && /沖|冲|刑|破/.test(text);
  });
}

function completionOf(params: {
  established: boolean;
  supportingPattern: string | null;
  remedy: StructuralRemedy;
  exposedMonthQi: boolean;
  directMonthDamage: boolean;
}): StructureCompletion {
  const { established, supportingPattern, remedy, exposedMonthQi, directMonthDamage } = params;
  const reasons: string[] = [];

  if (!established && !exposedMonthQi) {
    reasons.push("月令主氣未直接透干，先保留格局方向，不把成格程度說滿。"];
  }

  if (directMonthDamage) reasons.push("月令相關地支存在直接沖／刑／破，結構穩定度需要降級。"];
  if (supportingPattern) reasons.push(`可見第二層做功主線：${supportingPattern}。`);
  if (remedy.status === "clear") reasons.push("病藥／通關鏈已有可見結構支持。"];
  if (remedy.status === "provisional") reasons.push("病藥方向可見，但根、路或承接條件尚未完全成立。"];
  if (remedy.status === "insufficient") reasons.push("目前沒有足夠證據把病藥說滿。"];

  if (!established) {
    return { grade: "G1", label: "格局方向", capacity: "局部結構／容量有限", reasons };
  }

  if (directMonthDamage || remedy.status === "provisional" || remedy.status === "insufficient") {
    return { grade: "G2", label: "成格有條件", capacity: "局部結構／容量有限", reasons };
  }

  if (supportingPattern && remedy.status === "clear") {
    return { grade: "G4", label: "結構完成度高", capacity: "結構容量大／完成度高", reasons };
  }

  return { grade: "G3", label: "成格可用", capacity: "主結構完整／容量中等", reasons };
}

/**
 * R6.1 子平 structure summary（網站 runtime 版）：
 * 月令 → 立格 → 可見制化 → 地支作用 → 病藥／通關 → 結構完成度／容量。
 *
 * 注意：G0–G4 只評結構完成度，不等同財富、地位或人的高低。
 * 從格／化氣／專旺的最終確認仍由上層 R6.1 Gate 負責；此函式不因字面組合自動判真化或真從。
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
  const hasWealth = visible.some((item) => item.god === "正財" || item.god === "偏財");

  let supportingPattern: string | null = null;
  if ((monthTenGod === "正印" || monthTenGod === "偏印") && hasOfficer && hasSeal) {
    supportingPattern = "殺印相生";
  } else if (monthTenGod === "七殺" && hasOutput) {
    supportingPattern = "食神制殺的可見條件";
  } else if (monthTenGod === "傷官" && hasSeal) {
    supportingPattern = "傷官配印的可見條件";
  } else if ((monthTenGod === "正官" || monthTenGod === "七殺") && hasSeal) {
    supportingPattern = "官殺配印的可見主線";
  } else if ((monthTenGod === "正官" || monthTenGod === "七殺") && hasWealth) {
    supportingPattern = "財生官殺的可見主線";
  } else if ((monthTenGod === "食神" || monthTenGod === "傷官") && hasWealth) {
    supportingPattern = "食傷生財的可見主線";
  } else if (hasKill && hasSeal) {
    supportingPattern = "殺印相生的可見主線";
  }

  const branchRelations = analyzeBranchRelations(natalBranchPoints(chart));
  const remedy = analyzeStructuralRemedy(chart);
  const directMonthDamage = hasDirectDamageToMonth(branchRelations, chart.monthBranch);
  const completion = completionOf({
    established: exposedMonthQi,
    supportingPattern,
    remedy,
    exposedMonthQi,
    directMonthDamage,
  });

  const exposureText = exposedMonthQi
    ? `月令主氣${monthMainStem}${monthTenGod}透干，立格依據清楚。`
    : `月令主氣為${monthMainStem}${monthTenGod}，但未直接透干，因此先按「${label}方向」判，不把成格程度說滿。`;
  const visibleText = visible.length
    ? `天干可見：${visible.map((item) => `${item.stem}${item.god}`).join("、")}。`
    : "其餘天干資訊不足，不追加複合格局。";
  const supportText = supportingPattern ? `第二層可見${supportingPattern}。` : "目前不追加第二個複合格局名稱。";
  const relationText = `地支作用：${summarizeBranchRelations(branchRelations)}。合、三合、三會只先記結構條件，不自動等同合化。`;
  const remedyText = `病藥層：${remedy.disease}；${remedy.medicine}${remedy.bridge ? ` 通關鏈：${remedy.bridge}。` : ""}`;
  const opening = exposedMonthQi ? `以「${label}」立格` : `以「${label}方向」為主`;
  const directAnswer = `直接答案：這個命局${opening}${supportingPattern ? `，第二層做功以「${supportingPattern}」為主` : ""}；目前結構判為「${completion.label}」，容量為「${completion.capacity}」。這裡的容量只指格局完成度，不等於財富、地位或人的高低。`;

  return {
    label,
    monthMainStem,
    monthTenGod,
    established: exposedMonthQi,
    supportingPattern,
    branchRelations,
    remedy,
    completion,
    evidenceLines: [
      `月令：${chart.monthBranch}；月令主氣：${monthMainStem}${monthTenGod}。`,
      exposureText,
      visibleText,
      supportText,
      relationText,
      remedyText,
      ...completion.reasons,
      ...remedy.evidence,
    ],
    directAnswer,
  };
}
