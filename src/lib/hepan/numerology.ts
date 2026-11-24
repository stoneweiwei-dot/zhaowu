import type { HepanCivilInput, HepanReading, HepanSystemSection } from "./pair-model";

/**
 * Numerology reference section (approved by Shi 2026-11-24, 全批）.
 *
 * There is no numerology engine on the site and Shi has no numerology
 * instruction file at all (not even single-person). This section is
 * computed from the birth dates only, with the generic Pythagorean
 * life-path system — NOT Shi's original rule, and labelled so on the
 * page. The score is a compatibility heuristic （合盤啟發式）, 僅供參考：
 * it is a 分項參考 only and is NEVER merged into the headline index
 * (see buildHepanIndex: only bazi is scored).
 *
 * Life path: sum every digit of YYYYMMDD, reduce by digit-summing
 * until 1–9, stopping early on a master number 11/22/33. A master
 * number is scored as its reduction (11→2, 22→4, 33→6) and the master
 * trait is noted separately, never scored twice.
 */

export type LifePath = {
  /** 1–9, or 11/22/33 for a master number. */
  value: number;
  /** True when value is a master number. */
  master: boolean;
  /** The number actually used for the matrix lookup (master reduced). */
  reduced: number;
};

function digitSum(n: number): number {
  return String(n)
    .split("")
    .reduce((sum, d) => sum + Number(d), 0);
}

export function lifePathNumber(input: {
  year: number;
  month: number;
  day: number;
}): LifePath {
  const digits = `${input.year}${String(input.month).padStart(2, "0")}${String(input.day).padStart(2, "0")}`;
  let n = digits.split("").reduce((sum, d) => sum + Number(d), 0);
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = digitSum(n);
  }
  const master = n === 11 || n === 22 || n === 33;
  return { value: n, master, reduced: master ? digitSum(n) : n };
}

/**
 * 9×9 compatibility matrix, completed from the common Pythagorean
 * grouping (standard grouping logic). MATRIX PENDING SHI'S CONFIRMATION:
 * the group rule below is the generic textbook grouping, not Shi's rule.
 * The page and the section detail both say so.
 *
 * Groups: A {1, 3, 5, 7} 主動／表達／探索； B {2, 4, 8} 穩定／務實／
 * 結構； C {6, 9} 關懷／理想／服務.
 * Same group → 相合 85. A–C or B–C (different groups, complementary
 * rhythm) → 中性 65. A–B (drive meets structure, most friction) →
 * 磨合 45. The same number is the same group, so it scores 相合 85,
 * with a note that shared rhythm amplifies both strengths and blind
 * spots.
 */
export const NUMEROLOGY_GROUPS: Record<number, "A" | "B" | "C"> = {
  1: "A",
  3: "A",
  5: "A",
  7: "A",
  2: "B",
  4: "B",
  8: "B",
  6: "C",
  9: "C",
};

export type NumerologyTier = "相合" | "中性" | "磨合";

export function numerologyTier(a: number, b: number): { tier: NumerologyTier; score: number } {
  const ga = NUMEROLOGY_GROUPS[a];
  const gb = NUMEROLOGY_GROUPS[b];
  if (ga === gb) return { tier: "相合", score: 85 };
  if ((ga === "A" && gb === "B") || (ga === "B" && gb === "A")) {
    return { tier: "磨合", score: 45 };
  }
  return { tier: "中性", score: 65 };
}

/** The full 9×9 matrix, derived from the group rule above (not hand-typed). */
export const NUMEROLOGY_MATRIX: Record<number, Record<number, { tier: NumerologyTier; score: number }>> =
  Object.fromEntries(
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map((a) => [
      a,
      Object.fromEntries(
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => [b, numerologyTier(a, b)]),
      ),
    ]),
  ) as Record<number, Record<number, { tier: NumerologyTier; score: number }>>;

function describeLifePath(who: string, path: LifePath): string {
  if (path.master) {
    return `${who}生命靈數 ${path.value}（大師數，計分時按 ${path.reduced} 計，另註大師數特質）。`;
  }
  return `${who}生命靈數 ${path.value}。`;
}

/**
 * Numerology pair section (reference only, never scored into the index).
 * Birth dates are always present on this page (the form requires them),
 * so this section is always computable; only the matrix itself is
 * pending Shi's confirmation.
 */
export function buildNumerologyPairSection(
  civilA: HepanCivilInput,
  civilB: HepanCivilInput,
): HepanSystemSection {
  const pathA = lifePathNumber(civilA);
  const pathB = lifePathNumber(civilB);
  const { tier, score } = numerologyTier(pathA.reduced, pathB.reduced);
  const lines: string[] = [
    describeLifePath("甲", pathA),
    describeLifePath("乙", pathB),
    `相合檔：${tier}（${score}分）。同組相合、異組中性或磨合，只論傾向，不判命定。`,
    "9×9 相容矩陣按常用分組邏輯補全（A 組 1／3／5／7、 B 組 2／4／8、 C 組 6／9；同組相合，A–B 磨合，其餘中性）——矩陣待 Shi 確認。",
    "方法：通用畢達哥拉斯生命靈數體系，不是 Shi 的原創規則。分數為合盤啟發式，僅供參考，不入主指數、不合成總分。",
  ];
  if (pathA.value === pathB.value) {
    lines.push("兩人同數：節奏相同，優點放大、盲點也放大，互補要靠其他位置。");
  }
  const reading: HepanReading = {
    id: "numerology",
    title: "生命靈數相合",
    score,
    evidence: [
      `甲生命靈數 ${pathA.value}${pathA.master ? `（大師數，按 ${pathA.reduced} 計）` : ""}；乙生命靈數 ${pathB.value}${pathB.master ? `（大師數，按 ${pathB.reduced} 計）` : ""}`,
      `相合檔：${tier}（${score}分）。`,
    ],
    note: "分數為合盤啟發式，僅供參考；矩陣待 Shi 確認。",
  };
  return {
    id: "numerology",
    title: "生命靈數",
    status: "reference",
    score,
    weight: null,
    detail:
      "生命靈數分項參考（通用畢達哥拉斯體系）：只給分項，不入主指數，不合成總分。矩陣待 Shi 確認。",
    readings: [reading],
    lines,
  };
}
