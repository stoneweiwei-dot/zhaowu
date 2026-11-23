import { HIDDEN, STEMS, tenGod, yearMonthPillars } from "@/lib/bazi/calendar";
import { analyzeBranchRelations, natalBranchPoints } from "@/lib/bazi/branch-relations";
import { analyzeStructuralRemedy, type StructuralRemedy } from "@/lib/bazi/structural-remedy";
import type { Chart, Element, Pillar } from "@/lib/bazi/types";

/**
 * Four report views for #1091 (draft PR, no merge/deploy).
 *
 * Everything here is computed from the chart itself: pillars, ten gods,
 * hidden stems, luck cycles and branch relations. No demo numbers, no
 * placeholders, no scores of any kind — years are the only numbers shown,
 * and they are dates, not ratings. Where the model cannot decide something
 * (full 用神/喜神/忌神/仇神 determination needs the UA1 main chain, which
 * has no module yet), the view says so instead of inventing an answer.
 */

export type TenGodFamily = "比劫" | "食傷" | "財星" | "官殺" | "印星";

export const TEN_GOD_FAMILIES: TenGodFamily[] = ["比劫", "食傷", "財星", "官殺", "印星"];

const GOD_FAMILY: Record<string, TenGodFamily> = {
  比肩: "比劫",
  劫財: "比劫",
  食神: "食傷",
  傷官: "食傷",
  正財: "財星",
  偏財: "財星",
  正官: "官殺",
  七殺: "官殺",
  正印: "印星",
  偏印: "印星",
};

const SEASON_OF_BRANCH: Record<string, "春" | "夏" | "秋" | "冬"> = {
  寅: "春",
  卯: "春",
  辰: "春",
  巳: "夏",
  午: "夏",
  未: "夏",
  申: "秋",
  酉: "秋",
  戌: "秋",
  亥: "冬",
  子: "冬",
  丑: "冬",
};

const GENERATES: Record<Element, Element> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const CONTROLS: Record<Element, Element> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
const ELEMENTS: Element[] = ["木", "火", "土", "金", "水"];

const BRANCH_YIN_YANG: Record<string, "陽" | "陰"> = {
  子: "陽",
  丑: "陰",
  寅: "陽",
  卯: "陰",
  辰: "陽",
  巳: "陰",
  午: "陽",
  未: "陰",
  申: "陽",
  酉: "陰",
  戌: "陽",
  亥: "陰",
};

export type GodOccurrence = {
  god: string;
  element: Element;
  pillar: Pillar["key"];
  /** 透干 (visible stem) or 藏干 (hidden stem). */
  placement: "stem" | "hidden";
  /** Hidden stem sitting in the day branch. */
  daySeat: boolean;
};

export type FamilyFacet = {
  family: TenGodFamily;
  occurrences: GodOccurrence[];
  /** Distinct elements carrying this family in this chart. */
  elements: Element[];
};

function familyOf(god: string): TenGodFamily | null {
  return GOD_FAMILY[god] ?? null;
}

/**
 * Five ten-god families, in a fixed order (never ranked by count — a count
 * is not a strength judgement). The day stem itself is the day master, not
 * a family god, so day-pillar stems are skipped; day-branch hidden stems
 * count, with a stem equal to the day master read as 比肩.
 */
export function buildFamilyFacets(chart: Chart): FamilyFacet[] {
  const byFamily = new Map<TenGodFamily, GodOccurrence[]>();
  const add = (godRaw: string, element: Element, pillar: Pillar["key"], placement: "stem" | "hidden", daySeat: boolean) => {
    const god = godRaw === "日主" ? "比肩" : godRaw;
    const family = familyOf(god);
    if (!family) return;
    const list = byFamily.get(family) ?? [];
    list.push({ god, element, pillar, placement, daySeat });
    byFamily.set(family, list);
  };

  for (const pillar of chart.pillars) {
    if (pillar.ready === false || !pillar.gan) continue;
    if (pillar.key !== "day") add(pillar.shiShenGan, pillar.ganElement, pillar.key, "stem", false);
    for (const hidden of pillar.hide ?? []) {
      add(hidden.shiShen, hidden.element, pillar.key, "hidden", pillar.key === "day");
    }
  }

  return TEN_GOD_FAMILIES.map((family) => {
    const occurrences = byFamily.get(family) ?? [];
    const elements = ELEMENTS.filter((element) => occurrences.some((item) => item.element === element));
    return { family, occurrences, elements };
  });
}

export type SeasonalFacet = {
  season: "春" | "夏" | "秋" | "冬";
  monthBranch: string;
  /** 月令主氣十神 (main qi of the month branch). */
  monthGod: string | null;
  dayMasterElement: Element;
  useful: Element[];
  drain: Element[];
  provisional: boolean;
};

export function buildSeasonalFacet(chart: Chart): SeasonalFacet {
  const monthBranch = chart.monthBranch
    ?? chart.pillars.find((pillar) => pillar.key === "month" && pillar.ready !== false)?.zhi
    ?? "";
  const mainQi = monthBranch ? HIDDEN[monthBranch]?.[0] : undefined;
  return {
    season: SEASON_OF_BRANCH[monthBranch] ?? "春",
    monthBranch,
    monthGod: mainQi ? tenGod(chart.dayMaster, mainQi) : null,
    dayMasterElement: chart.dayMasterElement,
    useful: chart.useful,
    drain: chart.drain,
    provisional: chart.usefulProvisional,
  };
}

export type YearlyRow = {
  year: number;
  ganZhi: string;
  /** 年干十神. */
  stemGod: string;
  /** 年支主氣十神. */
  branchGod: string;
  dayun: string;
  dayunStartYear: number;
  dayunEndYear: number;
  isCurrentDayun: boolean;
  isCurrentYear: boolean;
  /** Only relations that involve this year's branch, most severe first. */
  relations: Array<{ kind: string; label: string }>;
};

function yearGanZhi(year: number): string {
  // April 1 is safely past Lichun, so the year pillar is that year's.
  return yearMonthPillars(new Date(Date.UTC(year, 3, 1))).year;
}

/**
 * Current ten-year cycle plus the next one (20 rows at most). The year
 * pillar comes from the engine's own Lichun rule; ten gods come from
 * tenGod(); the luck cycle is looked up in chart.dayun; branch relations
 * are computed against the natal branches and filtered to this year.
 */
export function buildYearlyTable(chart: Chart, nowYear: number = new Date().getFullYear()): YearlyRow[] {
  if (!chart.dayun.length) return [];
  const currentIndex = chart.dayun.findIndex((period) => period.current)
    !== -1
    ? chart.dayun.findIndex((period) => period.current)
    : chart.dayun.findIndex((period) => nowYear >= period.startYear && nowYear <= period.endYear);
  const current = currentIndex !== -1 ? chart.dayun[currentIndex] : chart.dayun[0];
  const next = currentIndex !== -1 ? chart.dayun[currentIndex + 1] : undefined;
  const periods = next ? [current, next] : [current];
  const natalPoints = natalBranchPoints(chart);

  const rows: YearlyRow[] = [];
  for (const period of periods) {
    for (let year = period.startYear; year <= period.endYear; year += 1) {
      const ganZhi = yearGanZhi(year);
      const stem = ganZhi[0];
      const branch = ganZhi[1];
      const mainQi = HIDDEN[branch]?.[0];
      const relations = analyzeBranchRelations([
        ...natalPoints,
        { id: `year:${year}`, branch, source: "year", label: `${year}流年` },
      ])
        .filter((relation) => relation.participants.some((point) => point.id === `year:${year}`))
        .slice(0, 3)
        .map((relation) => ({ kind: relation.kind, label: relation.label }));
      rows.push({
        year,
        ganZhi,
        stemGod: tenGod(chart.dayMaster, stem),
        branchGod: mainQi ? tenGod(chart.dayMaster, mainQi) : "",
        dayun: period.ganZhi,
        dayunStartYear: period.startYear,
        dayunEndYear: period.endYear,
        isCurrentDayun: period === current,
        isCurrentYear: year === nowYear,
        relations,
      });
    }
  }
  return rows;
}

export type TenGodsPage = {
  pillars: Array<{
    key: Pillar["key"];
    stemGod: string;
    hidden: Array<{ stem: string; god: string; element: Element }>;
  }>;
  remedy: StructuralRemedy;
  useful: Element[];
  drain: Element[];
  provisional: boolean;
  seasonal: SeasonalFacet;
};

/**
 * Ten-gods map for all eight characters plus the structural 病藥 layer.
 * 喜/忌 elements come only from the engine's useful/drain and are marked
 * provisional while usefulProvisional is set. Full 用神/喜神/忌神/仇神
 * determination needs the UA1 main chain, which has no module — the view
 * must say that instead of deciding it.
 */
export function buildTenGodsPage(chart: Chart): TenGodsPage {
  return {
    pillars: chart.pillars
      .filter((pillar) => pillar.ready !== false && Boolean(pillar.gan))
      .map((pillar) => ({
        key: pillar.key,
        stemGod: pillar.key === "day" ? "日主" : pillar.shiShenGan,
        hidden: (pillar.hide ?? []).map((item) => ({
          stem: item.gan,
          god: item.shiShen === "日主" ? "比肩" : item.shiShen,
          element: item.element,
        })),
      })),
    remedy: analyzeStructuralRemedy(chart),
    useful: chart.useful,
    drain: chart.drain,
    provisional: chart.usefulProvisional,
    seasonal: buildSeasonalFacet(chart),
  };
}

export type ShengKeNode = {
  element: Element;
  carriers: Array<{ pillar: Pillar["key"]; placement: "stem" | "branch" }>;
  generates: Element;
  generatedBy: Element;
  controls: Element;
  controlledBy: Element;
};

export type YinYangRow = {
  text: string;
  element: Element;
  yinYang: "陽" | "陰";
};

/**
 * Five-element generating/controlling cycle with this chart's carriers,
 * plus the yin/yang of every stem and branch in the chart.
 */
export function buildShengKeYinYang(chart: Chart): {
  nodes: ShengKeNode[];
  stems: YinYangRow[];
  branches: YinYangRow[];
} {
  const nodes: ShengKeNode[] = ELEMENTS.map((element) => {
    const carriers: ShengKeNode["carriers"] = [];
    for (const pillar of chart.pillars) {
      if (pillar.ready === false || !pillar.gan) continue;
      if (pillar.ganElement === element) carriers.push({ pillar: pillar.key, placement: "stem" });
      if (pillar.zhiElement === element) carriers.push({ pillar: pillar.key, placement: "branch" });
    }
    const generatedBy = ELEMENTS.find((item) => GENERATES[item] === element) ?? element;
    const controlledBy = ELEMENTS.find((item) => CONTROLS[item] === element) ?? element;
    return { element, carriers, generates: GENERATES[element], generatedBy, controls: CONTROLS[element], controlledBy };
  });

  const stems: YinYangRow[] = chart.pillars
    .filter((pillar) => pillar.ready !== false && Boolean(pillar.gan))
    .map((pillar) => ({
      text: pillar.gan,
      element: pillar.ganElement,
      yinYang: STEMS.indexOf(pillar.gan as (typeof STEMS)[number]) % 2 === 0 ? "陽" : "陰",
    }));

  const branches: YinYangRow[] = chart.pillars
    .filter((pillar) => pillar.ready !== false && Boolean(pillar.zhi))
    .map((pillar) => ({
      text: pillar.zhi,
      element: pillar.zhiElement,
      yinYang: BRANCH_YIN_YANG[pillar.zhi] ?? "陰",
    }));

  return { nodes, stems, branches };
}
