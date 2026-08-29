import type { Chart } from "@/lib/bazi/types";

export const PANEL_ATTRS = ["精", "炅", "神", "武", "術", "護", "寶", "遁", "廣", "察"] as const;
export type PanelAttr = (typeof PANEL_ATTRS)[number];

export const DAO_ARTS = ["仙", "醫", "命", "相", "卜"] as const;
export const FO_ARTS = ["禅", "悉", "觀", "聞", "識"] as const;
export const WU_ARTS = ["巫", "祝", "鬼", "妖", "契"] as const;

export type MethodSchool = "dao" | "fo" | "wu";

export type CharacterPanel = {
  title: string;
  dayMaster: string;
  school: MethodSchool;
  scores: Record<PanelAttr, number>;
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

function pickSchool(chart: Chart, bag: Record<string, number>): MethodSchool {
  const useful = chart.useful[0];
  if (useful === "金" || useful === "水") return "dao";
  if (useful === "火") return "wu";
  if (useful === "土" || useful === "木") return "fo";
  const print = god(bag, "正印", "偏印");
  const kill = god(bag, "七殺", "七杀");
  const injury = god(bag, "傷官", "伤官");
  if (kill >= print && kill >= injury) return "wu";
  if (print >= injury) return "fo";
  return "dao";
}

export function buildCharacterPanel(chart: Chart): CharacterPanel {
  const bag = countGods(chart);
  const dayPct = chart.elementPercents[chart.dayMasterElement] ?? 0;
  const water = chart.elementPercents["水"] ?? 0;
  const fire = chart.elementPercents["火"] ?? 0;
  const wood = chart.elementPercents["木"] ?? 0;
  const ling = chart.strength.deLing ? 2 : 0;
  const di = chart.strength.deDi ? 1 : 0;
  const shi = chart.strength.deShi ? 1 : 0;
  const strong = /強|强/.test(chart.strength.tendency) ? 1 : 0;

  const scores = {
    精: clampScore(4 + god(bag, "比肩") + dayPct / 20 + di + strong),
    炅: clampScore(4 + dayPct / 16 + ling + shi),
    神: clampScore(4 + god(bag, "正印", "偏印")),
    武: clampScore(4 + god(bag, "七殺", "七杀") * 1.4 + fire / 25),
    術: clampScore(4 + god(bag, "食神", "傷官", "伤官")),
    護: clampScore(4 + god(bag, "正印") * 1.4 + god(bag, "偏印")),
    寶: clampScore(4 + god(bag, "正財", "正财", "偏財", "偏财")),
    遁: clampScore(4 + god(bag, "劫財", "劫财") + water / 20),
    廣: clampScore(4 + god(bag, "正官") * 1.3 + wood / 25),
    察: clampScore(4 + god(bag, "傷官", "伤官") * 1.3 + god(bag, "食神") * 0.6),
  } satisfies Record<PanelAttr, number>;

  const dayPillar = chart.pillars.find((col) => col.key === "day");
  const title = dayPillar?.nayin?.trim() || `${chart.dayMaster}${chart.dayMasterElement}`;

  return {
    title,
    dayMaster: `${chart.dayMaster}${chart.dayMasterElement}`,
    school: pickSchool(chart, bag),
    scores,
    total: PANEL_ATTRS.reduce((sum, key) => sum + scores[key], 0),
  };
}
