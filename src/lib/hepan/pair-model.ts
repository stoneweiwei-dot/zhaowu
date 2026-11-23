import { analyzeBranchRelations } from "@/lib/bazi/branch-relations";
import { ELEMENT_CONTROLS, ELEMENT_GENERATES } from "@/lib/bazi/constants";
import type { Chart, Element } from "@/lib/bazi/types";

/**
 * Hepan 合盤・緣分指數 model (draft PR, no merge/deploy).
 *
 * One scoring system exists today: bazi. Every other live system
 * (ziwei, numerology, western, vedic, 一掌經, 七政, 手相) has a real
 * single-person engine on the site but NO pair method in code or in any
 * instruction Shi has given, so each of them is reported as pending and
 * contributes nothing to the index. Nothing is scored by invention,
 * nothing is silently scored zero, and a pending system never drags
 * the index down.
 *
 * Bazi pair method (defined for this page, from the engine's own tables
 * and 《昭梧命理分析統一指令》):
 *  - 日主生剋: the two day-master elements, via ELEMENT_GENERATES /
 *    ELEMENT_CONTROLS. 相生 85, 比和 70, 相剋 45.
 *  - 日支關係: the two day branches, via analyzeBranchRelations plus a
 *    half-triple check (two members of a 三合/三會 trio). Headline is the
 *    highest-scoring relation found; EVERY relation found is listed as
 *    evidence. 六合 90, 半三合/半三會 80, 六沖 40, 相刑/自刑 45,
 *    六害 50, 相破 55, 無關係 60. 六合只論牽制收束, 不直接判合化;
 *    沖先論引動對立, 不等於必凶 (spec line 150 + branch-relations cautions).
 *  - 五行互補: how much each person's elemental surplus covers the
 *    other's deficit, from chart.elementPercents (even share = 20%).
 *    No deficit on either side means nothing to complement: neutral 60,
 *    not 100.
 * Bazi sub-score = mean of the three readings, rounded.
 *
 * 緣分指數 (headline): weighted average of the sub-scores of systems
 * that HAVE rules. Base weights: bazi 50%, the remaining 50% split
 * equally among the other systems that have rules. Weights are
 * renormalized over the systems actually present, and the applied
 * weights are shown on the page. Today only bazi has rules, so the
 * index equals the bazi sub-score and the page says so.
 *
 * Scores are 契合順暢度 (how smoothly the two charts meet), not a
 * verdict. No single verdict like 天生一對 is ever produced; the page
 * labels the index 僅供參考 and flags disagreements instead of hiding
 * them behind one number.
 */

export type HepanReadingId = "day-master" | "day-branch" | "elements";

export type HepanReading = {
  id: HepanReadingId;
  /** zh-Hant title; the page renders chrome copy per locale, evidence stays zh-Hant. */
  title: string;
  /** 0-100 integer. */
  score: number;
  /** Evidence lines naming the actual pillars/elements. */
  evidence: string[];
  /** Method caution shown under the score. */
  note: string;
};

export type HepanBazi = {
  readings: HepanReading[];
  subScore: number;
  dayMasterA: string;
  dayMasterB: string;
  dayBranchA: string;
  dayBranchB: string;
};

export type HepanSystemId =
  | "bazi"
  | "ziwei"
  | "numerology"
  | "western"
  | "vedic"
  | "yizhangjing"
  | "qizheng"
  | "palm";

export type HepanSystemSection = {
  id: HepanSystemId;
  title: string;
  status: "scored" | "pending";
  /** null when pending: a pending system has no score at all, not zero. */
  score: number | null;
  /** Applied weight in the composite after renormalization; null when pending. */
  weight: number | null;
  /** Why it is scored, or plainly why it has no hepan method yet. */
  detail: string;
  readings?: HepanReading[];
};

export type HepanIndex = {
  index: number;
  bazi: HepanBazi;
  systems: HepanSystemSection[];
  appliedWeights: { system: HepanSystemId; weight: number }[];
  formula: string;
  /** Disagreements to show, never hidden behind the headline number. */
  conflicts: string[];
  presentCount: number;
};

const EVEN_SHARE = 20;

const DAY_MASTER_SCORES = { generates: 85, same: 70, controls: 45 } as const;

const BRANCH_SCORES: Record<string, number> = {
  六合: 90,
  半三合: 80,
  半三會: 80,
  六沖: 40,
  相刑: 45,
  自刑: 45,
  六害: 50,
  相破: 55,
};

/** Spec static priority (line 150): 三會 > 三合 > 半三合 > 六合 > 六沖 > 刑害破. Tie-break only. */
const BRANCH_RANK: Record<string, number> = {
  三會: 0,
  三合: 1,
  半三合: 2,
  半三會: 2,
  六合: 3,
  六沖: 4,
  相刑: 5,
  自刑: 5,
  六害: 6,
  相破: 7,
};

/** Same trios as branch-relations.ts TRIPLE_RELATIONS; kept local so this
 *  module never edits the engine. The test cross-checks them against
 *  analyzeBranchRelations full-triple detection. */
const SAN_HE: { branches: [string, string, string]; transformation: string }[] = [
  { branches: ["申", "子", "辰"], transformation: "水" },
  { branches: ["亥", "卯", "未"], transformation: "木" },
  { branches: ["寅", "午", "戌"], transformation: "火" },
  { branches: ["巳", "酉", "丑"], transformation: "金" },
];
const SAN_HUI: { branches: [string, string, string]; transformation: string }[] = [
  { branches: ["寅", "卯", "辰"], transformation: "木" },
  { branches: ["巳", "午", "未"], transformation: "火" },
  { branches: ["申", "酉", "戌"], transformation: "金" },
  { branches: ["亥", "子", "丑"], transformation: "水" },
];

export const HEPAN_PENDING_REASONS: Record<Exclude<HepanSystemId, "bazi">, string> = {
  ziwei:
    "紫微斗數的夫妻宮與四化是單人命盤的現象驗證層；站內沒有定義兩人合盤的對照方法，本欄不計分。需要站主的紫微合盤指令才會加入。",
  numerology:
    "生命靈數目前只有單人計算；站內沒有兩人合盤的配對規則，本欄不計分。需要站主的靈數合盤指令才會加入。",
  western:
    "西方占星模組指令只定義了單人全盤落宮統計與行星相位，沒有雙人合盤（synastry）方法，本欄不計分。需要站主的西占合盤指令才會加入。",
  vedic:
    "吠陀模組指令只定義了單人 D1／D12／Dasha，沒有雙人婚配對照方法，本欄不計分。需要站主的吠陀合盤指令才會加入。",
  yizhangjing:
    "達摩一掌經是單人前世今生文化層；站內沒有兩人合盤方法，本欄不計分。需要站主的一掌經合盤指令才會加入。",
  qizheng:
    "七政四餘是單人星盤系統；站內沒有兩人合盤方法，本欄不計分。需要站主的七政合盤指令才會加入。",
  palm:
    "手相是單人掌宮呈現；站內沒有兩人合盤方法，本欄不計分。需要站主的手相合盤指令才會加入。",
};

export const HEPAN_SYSTEM_TITLES: Record<HepanSystemId, string> = {
  bazi: "八字",
  ziwei: "紫微斗數",
  numerology: "生命靈數",
  western: "西方占星",
  vedic: "印度占星",
  yizhangjing: "達摩一掌經",
  qizheng: "七政四餘",
  palm: "手相",
};

/** Base weights in the composite. Bazi 50%; the other 50% is split equally
 *  among the other systems that HAVE rules. */
const BASE_WEIGHTS: Record<HepanSystemId, number> = {
  bazi: 0.5,
  ziwei: 0.5 / 7,
  numerology: 0.5 / 7,
  western: 0.5 / 7,
  vedic: 0.5 / 7,
  yizhangjing: 0.5 / 7,
  qizheng: 0.5 / 7,
  palm: 0.5 / 7,
};

function dayPillar(chart: Chart) {
  const pillar = chart.pillars.find((p) => p.key === "day");
  if (!pillar || !pillar.ready) throw new Error("hepan: day pillar is not ready");
  return pillar;
}

function scoreDayMaster(a: Chart, b: Chart): HepanReading {
  const ea = a.dayMasterElement;
  const eb = b.dayMasterElement;
  const evidence = [
    `甲：${a.dayMaster}${ea}；乙：${b.dayMaster}${eb}`,
  ];
  if (ea === eb) {
    return {
      id: "day-master",
      title: "日主生剋",
      score: DAY_MASTER_SCORES.same,
      evidence: [...evidence, `兩人日主同屬${ea}，比和：氣性相近，相處平穩，差異要靠其他位置來補。`],
      note: "比和不是加分也不是扣分：同氣相求，磨合少，互補也少。",
    };
  }
  if (ELEMENT_GENERATES[ea] === eb) {
    return {
      id: "day-master",
      title: "日主生剋",
      score: DAY_MASTER_SCORES.generates,
      evidence: [...evidence, `${ea}生${eb}：甲的日主生乙的日主，甲多付出、乙多承接。`],
      note: "相生論流動方向：付出多的一方也需要被看見，單向付出久了會失衡。",
    };
  }
  if (ELEMENT_GENERATES[eb] === ea) {
    return {
      id: "day-master",
      title: "日主生剋",
      score: DAY_MASTER_SCORES.generates,
      evidence: [...evidence, `${eb}生${ea}：乙的日主生甲的日主，乙多付出、甲多承接。`],
      note: "相生論流動方向：付出多的一方也需要被看見，單向付出久了會失衡。",
    };
  }
  const controller = ELEMENT_CONTROLS[ea] === eb ? "甲" : "乙";
  const controlled = controller === "甲" ? "乙" : "甲";
  return {
    id: "day-master",
    title: "日主生剋",
    score: DAY_MASTER_SCORES.controls,
    evidence: [...evidence, `${ea}剋${eb}：${controller}的日主剋${controlled}的日主，一方管得住另一方。`],
    note: "相剋不是不合：剋是管束與成形，有制才有結構；只論誰剋誰，不判誰對誰錯。",
  };
}

function halfTriple(a: string, b: string): { kind: "半三合" | "半三會"; transformation: string } | null {
  for (const trio of SAN_HE) {
    if (trio.branches.includes(a) && trio.branches.includes(b)) {
      return { kind: "半三合", transformation: trio.transformation };
    }
  }
  for (const trio of SAN_HUI) {
    if (trio.branches.includes(a) && trio.branches.includes(b)) {
      return { kind: "半三會", transformation: trio.transformation };
    }
  }
  return null;
}

function scoreDayBranch(a: Chart, b: Chart): HepanReading {
  const branchA = dayPillar(a).zhi;
  const branchB = dayPillar(b).zhi;
  const relations = analyzeBranchRelations([
    { id: "a:day", branch: branchA, source: "natal", label: "甲日支" },
    { id: "b:day", branch: branchB, source: "natal", label: "乙日支" },
  ]);
  const half = halfTriple(branchA, branchB);
  const evidence = [`甲日支${branchA}；乙日支${branchB}`];
  for (const relation of relations) {
    evidence.push(`${relation.label}：${relation.caution}`);
  }
  if (half) {
    evidence.push(
      `${half.kind}${half.transformation}局條件未全：日支只見其中兩支，成局還缺一支與月令、透干、根氣支持。`,
    );
  }

  const candidates: { kind: string; score: number }[] = relations.map((relation) => ({
    kind: relation.kind,
    score: BRANCH_SCORES[relation.kind] ?? 60,
  }));
  if (half) candidates.push({ kind: half.kind, score: BRANCH_SCORES[half.kind] });
  if (!candidates.length) {
    return {
      id: "day-branch",
      title: "日支六合／三合／沖",
      score: 60,
      evidence: [...evidence, "兩日支之間無六合、三合、沖、刑、害、破：沒有直接拉扯，也沒有現成助力。"],
      note: "無關係就是中性：日支不拉不扯，相處的順與逆由日主與五行去看。",
    };
  }
  candidates.sort(
    (x, y) => y.score - x.score || (BRANCH_RANK[x.kind] ?? 99) - (BRANCH_RANK[y.kind] ?? 99),
  );
  const headline = candidates[0];
  return {
    id: "day-branch",
    title: "日支六合／三合／沖",
    score: headline.score,
    evidence: [
      ...evidence,
      `主關係：${headline.kind}（${headline.score}分）。同現的其他關係一併列在上面，不隱藏。`,
    ],
    note:
      headline.kind === "六合"
        ? "六合只論牽制、收束與互相改變，不直接判合化。"
        : headline.kind === "六沖"
          ? "沖先論位置被引動、對立與位移；沖不等於必凶，也不等於一定開庫。"
          : "關係只論結構傾向，不直接外推具體事件。",
  };
}

function scoreElements(a: Chart, b: Chart): HepanReading {
  const pa = a.elementPercents;
  const pb = b.elementPercents;
  const elements = Object.keys(pa) as Element[];
  let covered = 0;
  let maxCover = 0;
  const covers: string[] = [];
  for (const element of elements) {
    const deficitA = Math.max(0, EVEN_SHARE - pa[element]);
    const deficitB = Math.max(0, EVEN_SHARE - pb[element]);
    const surplusA = Math.max(0, pa[element] - EVEN_SHARE);
    const surplusB = Math.max(0, pb[element] - EVEN_SHARE);
    const coverByA = Math.min(surplusA, deficitB);
    const coverByB = Math.min(surplusB, deficitA);
    covered += coverByA + coverByB;
    maxCover += deficitA + deficitB;
    if (coverByA > 0) covers.push(`甲${element}${pa[element]}% 補乙${element}${pb[element]}% 的不足`);
    if (coverByB > 0) covers.push(`乙${element}${pb[element]}% 補甲${element}${pa[element]}% 的不足`);
  }
  const score = maxCover === 0 ? 60 : Math.round((covered / maxCover) * 100);
  const weakestA = elements.reduce((x, y) => (pa[x] <= pa[y] ? x : y));
  const weakestB = elements.reduce((x, y) => (pb[x] <= pb[y] ? x : y));
  const evidence = [
    `甲五行：${elements.map((e) => `${e}${pa[e]}%`).join("、")}`,
    `乙五行：${elements.map((e) => `${e}${pb[e]}%`).join("、")}`,
    ...(covers.length ? covers : ["兩人五行沒有明顯的強補弱：強弱分布相近。"]),
    `甲最弱${weakestA}${pa[weakestA]}%；乙最弱${weakestB}${pb[weakestB]}%。`,
  ];
  return {
    id: "elements",
    title: "五行互補",
    score,
    evidence,
    note:
      maxCover === 0
        ? "兩人五行都接近均分，無所謂誰補誰：中性 60 分，不是滿分。"
        : "互補只算百分比上的強弱對位，不等於性格互補；喜用神的對位另見各自報告。",
  };
}

export function buildBaziPair(a: Chart, b: Chart): HepanBazi {
  const readings = [scoreDayMaster(a, b), scoreDayBranch(a, b), scoreElements(a, b)];
  const subScore = Math.round(readings.reduce((sum, r) => sum + r.score, 0) / readings.length);
  return {
    readings,
    subScore,
    dayMasterA: a.dayMaster,
    dayMasterB: b.dayMaster,
    dayBranchA: dayPillar(a).zhi,
    dayBranchB: dayPillar(b).zhi,
  };
}

export function buildHepanIndex(a: Chart, b: Chart): HepanIndex {
  const bazi = buildBaziPair(a, b);
  const scored: { id: HepanSystemId; score: number }[] = [{ id: "bazi", score: bazi.subScore }];
  const totalBase = scored.reduce((sum, s) => sum + BASE_WEIGHTS[s.id], 0);
  const appliedWeights = scored.map((s) => ({
    system: s.id,
    weight: BASE_WEIGHTS[s.id] / totalBase,
  }));
  const index = Math.round(
    scored.reduce(
      (sum, s) => sum + s.score * (appliedWeights.find((w) => w.system === s.id)?.weight ?? 0),
      0,
    ),
  );
  const systems: HepanSystemSection[] = (Object.keys(HEPAN_SYSTEM_TITLES) as HepanSystemId[]).map(
    (id) => {
      if (id === "bazi") {
        return {
          id,
          title: HEPAN_SYSTEM_TITLES[id],
          status: "scored" as const,
          score: bazi.subScore,
          weight: appliedWeights.find((w) => w.system === "bazi")?.weight ?? null,
          detail: `三項已算：日主生剋、日支關係、五行互補，平均 ${bazi.subScore} 分。`,
          readings: bazi.readings,
        };
      }
      return {
        id,
        title: HEPAN_SYSTEM_TITLES[id],
        status: "pending" as const,
        score: null,
        weight: null,
        detail: HEPAN_PENDING_REASONS[id],
      };
    },
  );
  const conflicts: string[] = [];
  const scores = bazi.readings.map((r) => r.score);
  const spread = Math.max(...scores) - Math.min(...scores);
  if (spread >= 30) {
    const sorted = [...bazi.readings].sort((x, y) => y.score - x.score);
    conflicts.push(
      `八字三項分歧：${sorted.map((r) => `${r.title}${r.score}分`).join("、")}，相差 ${spread} 分——順暢的地方與需要磨合的地方同時存在，不要只看總分。`,
    );
  }
  const formula =
    scored.length === 1
      ? "緣分指數 = Σ（各系統分數 × 權重）；八字 50%，其餘有規則的系統平分 50%。目前只有八字有合盤規則，權重已歸一為八字 100%，指數即八字分數。"
      : "緣分指數 = Σ（各系統分數 × 權重）；八字 50%，其餘有規則的系統平分 50%。";
  return { index, bazi, systems, appliedWeights, formula, conflicts, presentCount: scored.length };
}
