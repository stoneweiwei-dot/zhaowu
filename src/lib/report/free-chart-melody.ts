import type { AppLocale, Chart } from "@/lib/bazi/types";

type RelationKind = "combine" | "clash" | "punish" | "harm";

export type FreeChartMelody = {
  counts: Record<RelationKind, number>;
  dominant: RelationKind | "quiet";
  text: string;
};

const COMBINES = new Set(["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"]);
const CLASHES = new Set(["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"]);
const HARMS = new Set(["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"]);
const SELF_PUNISH = new Set(["辰", "午", "酉", "亥"]);
const TWO_PUNISH = new Set(["子卯"]);
const THREE_PUNISH = [new Set(["寅", "巳", "申"]), new Set(["丑", "戌", "未"])];

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("");
}

function hasPair(set: Set<string>, a: string, b: string): boolean {
  if (set.has(`${a}${b}`) || set.has(`${b}${a}`)) return true;
  return set.has(pairKey(a, b));
}

function countRelations(chart: Chart): Record<RelationKind, number> {
  const branches = chart.pillars.filter((p) => p.ready).map((p) => p.zhi);
  const counts = { combine: 0, clash: 0, punish: 0, harm: 0 };

  for (let i = 0; i < branches.length; i += 1) {
    for (let j = i + 1; j < branches.length; j += 1) {
      const a = branches[i];
      const b = branches[j];
      if (hasPair(COMBINES, a, b)) counts.combine += 1;
      if (hasPair(CLASHES, a, b)) counts.clash += 1;
      if (hasPair(HARMS, a, b)) counts.harm += 1;
      if (hasPair(TWO_PUNISH, a, b)) counts.punish += 1;
      if (a === b && SELF_PUNISH.has(a)) counts.punish += 1;
    }
  }

  for (const triad of THREE_PUNISH) {
    if ([...triad].every((branch) => branches.includes(branch))) counts.punish += 1;
  }
  return counts;
}

function dominantRelation(counts: Record<RelationKind, number>): RelationKind | "quiet" {
  const qualified: Array<[RelationKind, number]> = [
    ["combine", counts.combine >= 3 ? counts.combine : -1],
    ["clash", counts.clash >= 3 ? counts.clash : -1],
    ["punish", counts.punish >= 2 ? counts.punish : -1],
    ["harm", counts.harm >= 2 ? counts.harm : -1],
  ];
  qualified.sort((a, b) => b[1] - a[1]);
  return qualified[0][1] >= 0 ? qualified[0][0] : "quiet";
}

const COPY = {
  "zh-Hant": {
    combine: "命盤主旋律｜關係。四柱中的合較集中，你的人生往往透過連結、合作與關係互動推進。多不代表壞，重點是辨認哪些連結真正滋養你。",
    clash: "命盤主旋律｜變動。四柱中的衝較集中，人生較容易在變化、轉換與重新建立秩序中成長。多不代表壞，重點是學會在變動中保留自己的節奏。",
    punish: "命盤主旋律｜功課。四柱中的刑較集中，某些相似課題可能反覆出現，適合留意自己是否一直用同一種方式回應。多不代表壞，反覆也可以成為修正模式的入口。",
    harm: "命盤主旋律｜邊界。四柱中的害較集中，關係裡的分寸、信任與自我保護值得特別留意。多不代表壞，清楚的邊界反而能讓關係更穩。",
    quiet: "命盤主旋律｜平穩。四柱本身沒有達到合衝刑害的集中門檻，先天結構相對少被單一關係模式主導；真正的起伏仍要結合月令、格局、大運與流年判斷。",
  },
  "zh-Hans": {
    combine: "命盘主旋律｜关系。四柱中的合较集中，你的人生往往通过连接、合作与关系互动推进。多不代表坏，重点是辨认哪些连接真正滋养你。",
    clash: "命盘主旋律｜变动。四柱中的冲较集中，人生较容易在变化、转换与重新建立秩序中成长。多不代表坏，重点是学会在变动中保留自己的节奏。",
    punish: "命盘主旋律｜功课。四柱中的刑较集中，某些相似课题可能反复出现，适合留意自己是否一直用同一种方式回应。多不代表坏，反复也可以成为修正模式的入口。",
    harm: "命盘主旋律｜边界。四柱中的害较集中，关系里的分寸、信任与自我保护值得特别留意。多不代表坏，清楚的边界反而能让关系更稳。",
    quiet: "命盘主旋律｜平稳。四柱本身没有达到合冲刑害的集中门槛，先天结构相对少被单一关系模式主导；真正的起伏仍要结合月令、格局、大运与流年判断。",
  },
  en: {
    combine: "Life pattern | Relationships. Your chart contains a strong concentration of combinations, so connection, cooperation and close relationships often become major channels for growth. More is not automatically better or worse; the quality of the connection matters.",
    clash: "Life pattern | Change. Your chart contains a strong concentration of clashes, so change, transition and rebuilding are recurring growth themes. This is not automatically negative; the key is keeping your footing while circumstances move.",
    punish: "Life pattern | Repeating lessons. Your chart contains a concentration of punishment patterns, so similar situations may recur until you respond differently. Treat repetition as something to observe, not as a sentence about your future.",
    harm: "Life pattern | Boundaries. Your chart contains a concentration of harm patterns, so trust, limits and self-protection deserve extra attention in relationships. Clear boundaries can make connection more stable.",
    quiet: "Life pattern | Relative steadiness. No single combine, clash, punishment or harm pattern reaches the concentration threshold in the natal four pillars. Timing and major life changes still need the wider chart and later cycles to be assessed.",
  },
} as const satisfies Record<AppLocale, Record<RelationKind | "quiet", string>>;

export function buildFreeChartMelody(chart: Chart, locale: AppLocale): FreeChartMelody {
  const counts = countRelations(chart);
  const dominant = dominantRelation(counts);
  return { counts, dominant, text: COPY[locale][dominant] };
}
