import { analyzeBranchRelations } from "@/lib/bazi/branch-relations";
import { ELEMENT_CONTROLS, ELEMENT_GENERATES } from "@/lib/bazi/constants";
import type { Chart, Element } from "@/lib/bazi/types";
import type { PalmReading } from "@/lib/core/types";
import { calculateQizheng, type QizhengResult } from "@/lib/qizheng/engine";
import { normalizeZiweiCalendarBirth } from "@/lib/ziwei/calendar-normalization";
import { buildZiweiCoreChart, type ZiweiCoreChart } from "@/lib/ziwei/core";
import { ZHAOWU_ZIWEI_CALCULATION_PROFILE } from "@/lib/ziwei/profiles";
import { palmFromChart } from "@/lib/yizhangjing/engine";

/**
 * Hepan 合盤・緣分指數 model (draft PR, no merge/deploy).
 *
 * One scoring system exists today: bazi. Three more systems are shown
 * as qualitative對照 (displayed from their own engines, never scored):
 * ziwei (夫妻宮主星 + 生年四化), 一掌經 (四宮星曜 + 六道),
 * 七政 (宮主制 method + the honest engine limitation). The remaining
 * four (numerology, western, vedic, palm) have a real single-person
 * engine on the site but NO pair method in code or in any instruction
 * Shi has given, so each is reported as pending and contributes
 * nothing to the index. Nothing is scored by invention, nothing is
 * silently scored zero, and a pending system never drags the index down.
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
 * that HAVE rules. Base weights follow 《九頁綜合命理商業報告指令
 * V1.0》 (Shi, 2026-11-23): bazi 70%, ziwei 20%, 一掌經 10%;
 * every other system has NO weight in that document and stays
 * qualitative-only. Why 70/20/10 is NOT applied to the number today:
 * the 70/20/10 in that document is a report-content proportion, and
 * it is applied here only to systems WITH a defined pair score. Ziwei
 * and 一掌經 have no pair score defined (the same document bans
 * 軟件評分）, so they contribute nothing and the weights renormalize
 * over the systems actually scored. Today only bazi is scored, so the
 * index equals the bazi sub-score and the page says so. Applying
 * 70/20/10 to the headline while ziwei/一掌經 are unscored would
 * misstate the index (it would claim a 70% bazi share of a number
 * that is 100% bazi by renormalization). When a system gains a
 * defined pair score, its base weight applies as written.
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
  status: "scored" | "qualitative" | "pending";
  /** null when pending or qualitative: only a scored system has a score. */
  score: number | null;
  /** Applied weight in the composite after renormalization; null when pending or qualitative. */
  weight: number | null;
  /** Why it is scored, or plainly why it has no hepan method yet. */
  detail: string;
  readings?: HepanReading[];
  /** Detail lines for qualitative sections (side-by-side data, method, framing). */
  lines?: string[];
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

/** Still pending: no pair method in code or in any instruction from Shi. */
export const HEPAN_PENDING_REASONS: Record<"numerology" | "western" | "vedic" | "palm", string> = {
  numerology:
    "生命靈數目前只有單人計算；站內沒有兩人合盤的配對規則，本欄不計分。需要站主的靈數合盤指令才會加入。",
  western:
    "西方占星模組指令只定義了單人全盤落宮統計與行星相位，沒有雙人合盤（synastry）方法，本欄不計分。需要站主的西占合盤指令才會加入。",
  vedic:
    "吠陀模組指令只定義了單人 D1／D12／Dasha，沒有雙人婚配對照方法，本欄不計分。需要站主的吠陀合盤指令才會加入。",
  palm:
    "手相是單人掌宮呈現；站內沒有兩人合盤方法，本欄不計分。需要站主的手相合盤指令才會加入。",
};

/** Fallback when buildHepanIndex is called without the qualitative
 *  sections (e.g. in tests): the three systems are pending, not scored. */
const QUALITATIVE_FALLBACK: Record<"ziwei" | "yizhangjing" | "qizheng", string> = {
  ziwei: "本次對照沒有提供紫微資料（需要兩人準確出生時辰與站內紫微設定檔）；本欄不計分。",
  yizhangjing: "本次對照沒有提供一掌經資料；本欄不計分。",
  qizheng: "本站七政引擎不排十二宮，夫妻宮宮主暫時算不出來；本欄不計分。",
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

/** Base weights in the composite, from 《九頁綜合命理商業報告指令 V1.0》
 *  (bazi 70%, ziwei 20%, 一掌經 10%). Systems with no weight in that
 *  document get 0: they stay qualitative-only and never enter the number.
 *  Applied only to systems WITH a defined pair score; see the header
 *  comment for why 70/20/10 is not applied to the headline while
 *  ziwei/一掌經 are unscored. */
export const HEPAN_BASE_WEIGHTS: Record<HepanSystemId, number> = {
  bazi: 0.7,
  ziwei: 0.2,
  numerology: 0,
  western: 0,
  vedic: 0,
  yizhangjing: 0.1,
  qizheng: 0,
  palm: 0,
};

export type HepanCivilInput = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

/** 宮主制, 《五星合格》 as quoted in 《七政四餘盤面深度核驗》:
 *  寅亥歲星木, 卯戌熒惑火, 子丑鎮星土, 辰酉太白金, 巳申辰星水,
 *  午太陽, 未太陰. Pure rule table: which star rules which branch-palace. */
export const QIZHENG_PALACE_LORDS: Record<string, { lord: string; element: string }> = {
  寅: { lord: "歲星", element: "木" },
  亥: { lord: "歲星", element: "木" },
  卯: { lord: "熒惑", element: "火" },
  戌: { lord: "熒惑", element: "火" },
  子: { lord: "鎮星", element: "土" },
  丑: { lord: "鎮星", element: "土" },
  辰: { lord: "太白", element: "金" },
  酉: { lord: "太白", element: "金" },
  巳: { lord: "辰星", element: "水" },
  申: { lord: "辰星", element: "水" },
  午: { lord: "太陽", element: "—" },
  未: { lord: "太陰", element: "—" },
};

function buildZiweiChart(chart: Chart, civil: HepanCivilInput): ZiweiCoreChart | null {
  if (chart.timeUnknown) return null;
  try {
    const normalized = normalizeZiweiCalendarBirth({
      civilDate: {
        year: civil.year,
        month: civil.month,
        day: civil.day,
        hour: civil.hour,
        minute: civil.minute,
      },
      timeConfidence: "certain",
      profile: {
        id: ZHAOWU_ZIWEI_CALCULATION_PROFILE.id,
        lateZiPolicy: ZHAOWU_ZIWEI_CALCULATION_PROFILE.calendar.lateZiPolicy,
        leapMonthPolicy: ZHAOWU_ZIWEI_CALCULATION_PROFILE.calendar.leapMonthPolicy,
        yearBoundary: ZHAOWU_ZIWEI_CALCULATION_PROFILE.calendar.yearBoundary,
      },
    });
    if (!normalized.coreInput) return null;
    return buildZiweiCoreChart(normalized.coreInput, {
      mutagenProfile: ZHAOWU_ZIWEI_CALCULATION_PROFILE.mutagen,
      kuiYueProfile: ZHAOWU_ZIWEI_CALCULATION_PROFILE.kuiYue,
    });
  } catch {
    return null;
  }
}

function spousePalace(chart: ZiweiCoreChart) {
  return chart.palaces.find((p) => p.id === "SPOUSE") ?? null;
}

function starsInBranch(chart: ZiweiCoreChart, branch: string): string[] {
  return Object.entries(chart.majorStars)
    .filter(([, b]) => b === branch)
    .map(([star]) => star);
}

/**
 * Ziwei pair section (qualitative only, never scored).
 *
 * Data comes from the site's own ziwei engine, called exactly the way
 * buildZiweiReading does (profile zhaowu_ziwei_v0.5.2, mutagen
 * south_iztro_v1): 夫妻宮主星 from the fourteen major stars, 生年四化
 * from the year-stem mutagens with each 化 star's palace. Framing
 * follows 《九頁綜合命理商業報告指令 V1.0》 page 7 (phenomenon layer
 * only; the three buckets are a reading guide, not a computed verdict).
 * No numeric sub-score: no doc defines one, and the same instruction
 * bans 軟件評分. The research reports' zw_fullbook_sanhe_v1 profile is
 * NOT in the codebase, so this section does not use it.
 */
export function buildZiweiPairSection(
  chartA: Chart,
  civilA: HepanCivilInput,
  chartB: Chart,
  civilB: HepanCivilInput,
): HepanSystemSection {
  const title = HEPAN_SYSTEM_TITLES.ziwei;
  if (chartA.timeUnknown || chartB.timeUnknown) {
    return {
      id: "ziwei",
      title,
      status: "pending",
      score: null,
      weight: null,
      detail:
        "沒有準確出生時辰，紫微斗數不得使用（《九頁綜合命理商業報告指令 V1.0》）。本欄不計分。",
    };
  }
  const zwA = buildZiweiChart(chartA, civilA);
  const zwB = buildZiweiChart(chartB, civilB);
  if (!zwA || !zwB) {
    return {
      id: "ziwei",
      title,
      status: "pending",
      score: null,
      weight: null,
      detail: "這份出生資料暫時無法排出紫微命盤，本欄不計分。",
    };
  }
  const lines: string[] = [];
  const people: ["甲" | "乙", ZiweiCoreChart][] = [
    ["甲", zwA],
    ["乙", zwB],
  ];
  for (const [who, zw] of people) {
    const spouse = spousePalace(zw);
    if (!spouse) {
      lines.push(`${who}：夫妻宮未在命盤中找到。`);
      continue;
    }
    const stars = starsInBranch(zw, spouse.branch);
    lines.push(
      `${who}夫妻宮在${spouse.branch}（${spouse.stem}）：${stars.length ? `主星${stars.join("、")}` : "無主星"}。`,
    );
    for (const [hua, star] of Object.entries(zw.mutagens)) {
      const branch = zw.majorStars[star];
      const palace = branch ? zw.palaces.find((p) => p.branch === branch) : undefined;
      lines.push(
        `${who}生年${hua}：${star}${palace ? `落${palace.name}宮（${branch}）` : "落宮未在十四主星表內"}。`,
      );
    }
  }
  lines.push(
    "讀法（《九頁綜合命理商業報告指令 V1.0》第七頁）：紫微只作現象層驗證。【與八字一致】指紫微現象與八字結構說到同一處；【紫微補充的新資訊】指主星與四化落宮多出來的場景；【兩套系統觀察角度不同】指兩套系統層面不同、不得強行統一。本欄只列現象，不替你判定是哪一種。",
  );
  lines.push(
    `以站內紫微設定檔 ${ZHAOWU_ZIWEI_CALCULATION_PROFILE.id} 排出（四化 south_iztro_v1；曆法：子時當日、閏月同月、農曆年界）。研究報告提到的 zw_fullbook_sanhe_v1 設定檔尚未寫入站內程式碼，本欄不用它。`,
  );
  return {
    id: "ziwei",
    title,
    status: "qualitative",
    score: null,
    weight: null,
    detail:
      "夫妻宮主星與生年四化並排對照，只作現象層驗證，不計分（同一份指令禁軟件評分，也沒有定義紫微合盤分數）。",
    lines,
  };
}

/**
 * 一掌經 pair section (qualitative only, never scored).
 *
 * Data comes from the site's own palm engine (buildPalm via
 * palmFromChart): each person's 四宮星曜 + 六道, side by side. Framing
 * follows 《九頁綜合命理商業報告指令 V1.0》 page 9: 【一掌經象徵】
 * 【文化象意】【精神課題】 — never verified past-life history. The
 * engine's own boundary line is shown verbatim. No numeric sub-score:
 * no doc defines one, and the same instruction bans 軟件評分.
 */
export function buildPalmPairSection(
  chartA: Chart,
  civilA: HepanCivilInput,
  chartB: Chart,
  civilB: HepanCivilInput,
): HepanSystemSection {
  const title = HEPAN_SYSTEM_TITLES.yizhangjing;
  if (chartA.gender === "unspecified" || chartB.gender === "unspecified") {
    return {
      id: "yizhangjing",
      title,
      status: "pending",
      score: null,
      weight: null,
      detail: "需要兩人的性別才能定四宮順逆，六道先不作判定。本欄不計分。",
    };
  }
  let palmA: PalmReading | null = null;
  let palmB: PalmReading | null = null;
  try {
    palmA = palmFromChart(chartA, civilA);
    palmB = palmFromChart(chartB, civilB);
  } catch {
    palmA = null;
    palmB = null;
  }
  if (!palmA || !palmB || !palmA.palaces.length || !palmB.palaces.length) {
    return {
      id: "yizhangjing",
      title,
      status: "pending",
      score: null,
      weight: null,
      detail: "這份出生資料暫時無法排出一掌經四宮，本欄不計分。",
    };
  }
  const lines: string[] = [];
  const people: ["甲" | "乙", PalmReading][] = [
    ["甲", palmA],
    ["乙", palmB],
  ];
  for (const [who, palm] of people) {
    for (const palace of palm.palaces) {
      lines.push(`${who}${palace.label}${palace.zhi}・${palace.star}（${palace.dao}）：${palace.meaning}。`);
    }
    if (!palm.ready) {
      lines.push(`${who}時宮：因缺出生時辰，不作判定。`);
    }
  }
  lines.push(
    "【一掌經象徵】四宮星曜與六道只作生命象徵；【文化象意】前因／今果／後種是文化敘事；【精神課題】看同一課題在兩人身上如何互相照見——不是已證實的前世歷史。",
  );
  lines.push("此為民俗命理分類，不是可驗證的歷史前世或宗教裁決。");
  return {
    id: "yizhangjing",
    title,
    status: "qualitative",
    score: null,
    weight: null,
    detail:
      "四宮星曜與六道並排對照，只作象徵與精神課題，不計分（同一份指令禁軟件評分，也沒有定義一掌經合盤分數）。",
    lines,
  };
}

/**
 * 七政 pair section (qualitative only, never scored).
 *
 * The honest limitation, stated plainly: the site's 七政 engine
 * (calculateQizheng, profile ZW-QZ-TROPICAL-0.1) computes each body's
 * ecliptic longitude and branch-palace, but it does NOT assign the
 * twelve life palaces (no 命宮/夫妻宮）, so no 夫妻宮宮主 chain can be
 * computed for these two people yet. What the section DOES show is the
 * method itself — the 宮主制 from 《五星合格》 as quoted in
 * 《七政四餘盤面深度核驗》 — and the only relationship reading that
 * document supports (the 宮主 chain, e.g. 夫妻主飛官祿 = 婚姻牽動事業).
 * It never writes 「對方一定有地位和資源」: the same document deletes
 * that sentence as unsupported. No numeric sub-score: the 9-page
 * instruction gives 七政 no weight, and no doc defines a 七政 pair score.
 */
export function buildQizhengPairSection(
  chartA: Chart,
  civilA: HepanCivilInput,
  chartB: Chart,
  civilB: HepanCivilInput,
): HepanSystemSection {
  const title = HEPAN_SYSTEM_TITLES.qizheng;
  const lines: string[] = [
    "宮主制（《五星合格》，見《七政四餘盤面深度核驗》）：寅亥歸歲星木，卯戌歸熒惑火，子丑歸鎮星土，辰酉歸太白金，巳申歸辰星水，午屬太陽，未屬太陰。",
    "七政看關係，唯一有文獻支持的讀法是宮主鏈：夫妻宮在哪個宮 → 宮主是哪顆星 → 宮主落在哪個宮。例如夫妻在亥，宮主歲星，歲星落官祿＝婚姻／合作容易牽動事業（此例出自核驗文件中的單一命盤，不是通用結論）。",
    "本站七政引擎（ZW-QZ-TROPICAL-0.1）目前只算星體黃道位置，不排十二宮，所以兩人的夫妻宮宮主暫時算不出來，本欄不造數。",
    "「對方一定有地位和資源」這句話核驗文件已指出證據不足，本頁不寫。",
  ];
  let qzA: QizhengResult | null = null;
  let qzB: QizhengResult | null = null;
  try {
    qzA = calculateQizheng({ ...civilA, timezone: chartA.timezone, timeUnknown: chartA.timeUnknown });
    qzB = calculateQizheng({ ...civilB, timezone: chartB.timezone, timeUnknown: chartB.timeUnknown });
  } catch {
    qzA = null;
    qzB = null;
  }
  if (!qzA || !qzB) {
    lines.push("其中一人出生時辰不全，七政不排盤（時辰未知時引擎返回空值）。");
  }
  return {
    id: "qizheng",
    title,
    status: "qualitative",
    score: null,
    weight: null,
    detail: "七政沒有十二宮可排，夫妻宮宮主暫時算不出來；本欄只寫方法與限制，不計分。",
    lines,
  };
}

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

export function buildHepanIndex(
  a: Chart,
  b: Chart,
  qualitative?: {
    ziwei?: HepanSystemSection;
    yizhangjing?: HepanSystemSection;
    qizheng?: HepanSystemSection;
  },
): HepanIndex {
  const bazi = buildBaziPair(a, b);
  const scored: { id: HepanSystemId; score: number }[] = [{ id: "bazi", score: bazi.subScore }];
  const totalBase = scored.reduce((sum, s) => sum + HEPAN_BASE_WEIGHTS[s.id], 0);
  const appliedWeights = scored.map((s) => ({
    system: s.id,
    weight: HEPAN_BASE_WEIGHTS[s.id] / totalBase,
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
      if (id === "ziwei" || id === "yizhangjing" || id === "qizheng") {
        const section = qualitative?.[id];
        if (section) return section;
        return {
          id,
          title: HEPAN_SYSTEM_TITLES[id],
          status: "pending" as const,
          score: null,
          weight: null,
          detail: QUALITATIVE_FALLBACK[id],
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
      ? "緣分指數 = Σ（各系統分數 × 權重）；基礎權重按《九頁綜合命理商業報告指令 V1.0》：八字 70%、紫微 20%、一掌經 10%，七政等其餘系統不入權重、只作定性對照。目前只有八字有合盤分數，權重已歸一為八字 100%，指數即八字分數。紫微與一掌經目前只作定性對照、不計分（同一份指令禁軟件評分，也沒有定義合盤分數）。"
      : "緣分指數 = Σ（各系統分數 × 權重）；基礎權重按《九頁綜合命理商業報告指令 V1.0》：八字 70%、紫微 20%、一掌經 10%，按實際計分的系統歸一化。";
  return { index, bazi, systems, appliedWeights, formula, conflicts, presentCount: scored.length };
}
