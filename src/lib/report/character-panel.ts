import type { Chart } from "@/lib/bazi/types";

export const PANEL_ATTRS = ["精", "炅", "神", "武", "術", "護", "寶", "遁", "廣", "察"] as const;
export type PanelAttr = (typeof PANEL_ATTRS)[number];

export const DAO_ARTS = ["仙", "醫", "命", "相", "卜"] as const;
export const FO_ARTS = ["禎", "悉", "觀", "聞", "識"] as const;
export const WU_ARTS = ["巫", "祝", "鬼", "妖", "契"] as const;
export const ALL_ARTS = [...DAO_ARTS, ...FO_ARTS, ...WU_ARTS] as const;
export type ArtKey = (typeof ALL_ARTS)[number];
export type MethodSchool = "dao" | "fo" | "wu";

export type CharacterPanel = {
  title: string;
  dayMaster: string;
  school: MethodSchool;
  scores: Record<PanelAttr, number>;
  artScores: Record<ArtKey, number>;
  total: number;
};

function clampScore(n: number): number {
  return Math.max(1, Math.min(10, Math.round(n)));
}

function countGods(chart: Chart): Record<string, number> {
  const bag: Record<string, number> = {};
  for (const col of chart.pillars) {
    if (!col.ready) continue;
    if (col.key !== "day" && col.shiShenGan && col.shiShenGan !== "日主") {
      bag[col.shiShenGan] = (bag[col.shiShenGan] ?? 0) + 2;
    }
    for (const hidden of col.hide) {
      if (!hidden.shiShen || hidden.shiShen === "日主") continue;
      bag[hidden.shiShen] = (bag[hidden.shiShen] ?? 0) + 1;
    }
  }
  return bag;
}

function god(bag: Record<string, number>, ...names: string[]): number {
  return names.reduce((sum, name) => sum + (bag[name] ?? 0), 0);
}

function elementShare(chart: Chart, element: string): number {
  return (chart.elementPercents[element] ?? 0) / 20;
}

export function buildCharacterPanel(chart: Chart): CharacterPanel {
  const bag = countGods(chart);
  const dayPct = chart.elementPercents[chart.dayMasterElement] ?? 0;
  const ling = chart.strength.deLing ? 2 : 0;
  const di = chart.strength.deDi ? 1 : 0;
  const shi = chart.strength.deShi ? 1 : 0;
  const strong = /強|强/.test(chart.strength.tendency) ? 1 : 0;
  const weak = /弱/.test(chart.strength.tendency) ? 1 : 0;

  const bi = god(bag, "比肩");
  const jie = god(bag, "劫財", "劫财");
  const shiShen = god(bag, "食神");
  const shang = god(bag, "傷官", "伤官");
  const zhengCai = god(bag, "正財", "正财");
  const pianCai = god(bag, "偏財", "偏财");
  const zhengGuan = god(bag, "正官");
  const qiSha = god(bag, "七殺", "七杀");
  const zhengYin = god(bag, "正印");
  const pianYin = god(bag, "偏印");

  const scores = {
    精: clampScore(3 + bi * 1.2 + dayPct / 18 + di + strong),
    炅: clampScore(3 + dayPct / 14 + ling + shi + elementShare(chart, "水")),
    神: clampScore(3 + zhengYin * 1.3 + pianYin),
    武: clampScore(3 + qiSha * 1.4 + elementShare(chart, "火")),
    術: clampScore(3 + shiShen * 1.2 + shang),
    護: clampScore(3 + zhengYin * 1.4 + pianYin + (weak ? 1 : 0)),
    寶: clampScore(3 + zhengCai + pianCai * 1.1),
    遁: clampScore(3 + jie * 1.2 + elementShare(chart, "水")),
    廣: clampScore(3 + zhengGuan * 1.3 + elementShare(chart, "木")),
    察: clampScore(3 + shang * 1.3 + shiShen * 0.6),
  } satisfies Record<PanelAttr, number>;

  const artScores = {
    仙: clampScore(3 + pianYin * 1.3 + bi + elementShare(chart, "金")),
    醫: clampScore(3 + shiShen * 1.3 + zhengYin + elementShare(chart, "水")),
    命: clampScore(3 + zhengGuan * 1.3 + zhengYin),
    相: clampScore(3 + shang * 1.2 + pianYin),
    卜: clampScore(3 + shiShen + zhengGuan + elementShare(chart, "水")),
    禎: clampScore(3 + zhengYin * 1.4 + pianYin),
    悉: clampScore(3 + shiShen * 1.4),
    觀: clampScore(3 + zhengYin * 1.2 + shang),
    聞: clampScore(3 + pianYin * 1.4),
    識: clampScore(3 + shang * 1.3 + shiShen),
    巫: clampScore(3 + qiSha * 1.3 + pianYin),
    祝: clampScore(3 + zhengYin + zhengGuan),
    鬼: clampScore(3 + qiSha * 1.5),
    妖: clampScore(3 + jie * 1.2 + shang),
    契: clampScore(3 + pianCai * 1.2 + qiSha),
  } satisfies Record<ArtKey, number>;

  const schoolTotals: Record<MethodSchool, number> = {
    dao: DAO_ARTS.reduce((sum, key) => sum + artScores[key], 0),
    fo: FO_ARTS.reduce((sum, key) => sum + artScores[key], 0),
    wu: WU_ARTS.reduce((sum, key) => sum + artScores[key], 0),
  };
  const useful = chart.useful[0];
  let school: MethodSchool = "dao";
  if (schoolTotals.fo >= schoolTotals.dao && schoolTotals.fo >= schoolTotals.wu) school = "fo";
  if (schoolTotals.wu >= schoolTotals.dao && schoolTotals.wu >= schoolTotals.fo) school = "wu";
  if (useful === "金" || useful === "水") school = schoolTotals.dao >= schoolTotals.wu - 2 ? "dao" : school;
  if (useful === "火") school = schoolTotals.wu >= schoolTotals.fo - 2 ? "wu" : school;
  if (useful === "土" || useful === "木") school = schoolTotals.fo >= schoolTotals.dao - 2 ? "fo" : school;

  const dayPillar = chart.pillars.find((col) => col.key === "day");
  const title = dayPillar?.nayin?.trim() || `${chart.dayMaster}${chart.dayMasterElement}`;

  return {
    title,
    dayMaster: `${chart.dayMaster}${chart.dayMasterElement}`,
    school,
    scores,
    artScores,
    total: PANEL_ATTRS.reduce((sum, key) => sum + scores[key], 0),
  };
}

export function isActiveArt(score: number): boolean {
  return score >= 6;
}
