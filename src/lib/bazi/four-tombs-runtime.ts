import { HIDDEN, tenGod } from "@/lib/bazi/calendar";
import type { Chart, Reading } from "@/lib/bazi/types";

const FOUR_TOMBS = new Set(["辰", "戌", "丑", "未"]);
const TOMB_STEM: Record<string, string> = {
  辰: "癸",
  戌: "丁",
  丑: "辛",
  未: "乙",
};
const PILLAR_LABEL: Record<string, string> = {
  year: "年支",
  month: "月支",
  day: "日支",
  time: "時支",
};

const COMPLETE_RELATIONS: { branches: string[]; label: string }[] = [
  { branches: ["申", "子", "辰"], label: "申子辰三合水局條件" },
  { branches: ["寅", "卯", "辰"], label: "寅卯辰三會木局條件" },
  { branches: ["寅", "午", "戌"], label: "寅午戌三合火局條件" },
  { branches: ["申", "酉", "戌"], label: "申酉戌三會金局條件" },
  { branches: ["巳", "酉", "丑"], label: "巳酉丑三合金局條件" },
  { branches: ["亥", "子", "丑"], label: "亥子丑三會水局條件" },
  { branches: ["亥", "卯", "未"], label: "亥卯未三合木局條件" },
  { branches: ["巳", "午", "未"], label: "巳午未三會火局條件" },
];

function readyBranches(chart: Chart): string[] {
  return chart.pillars
    .filter((pillar) => pillar.ready !== false && Boolean(pillar.zhi))
    .map((pillar) => pillar.zhi);
}

export function hasNatalFourTombs(chart: Chart): boolean {
  return readyBranches(chart).some((branch) => FOUR_TOMBS.has(branch));
}

function describePillar(chart: Chart, pillar: Chart["pillars"][number]): string {
  const branch = pillar.zhi;
  const hidden = HIDDEN[branch] ?? [];
  const mainStem = hidden[0] ?? "未定";
  const tombStem = TOMB_STEM[branch] ?? "未定";
  const middle = hidden.filter((stem) => stem !== mainStem && stem !== tombStem);
  const mainGod = mainStem === "未定" ? "未定" : tenGod(chart.dayMaster, mainStem);
  const tombGod = tombStem === "未定" ? "未定" : tenGod(chart.dayMaster, tombStem);
  const middleText = middle.length
    ? `；中餘氣${middle.map((stem) => `${stem}${tenGod(chart.dayMaster, stem)}`).join("、")}`
    : "";
  return `${PILLAR_LABEL[pillar.key] ?? pillar.key}${branch}：本氣${mainStem}${mainGod}${middleText}；庫氣${tombStem}${tombGod}`;
}

function dynamicRelationText(branches: string[]): string[] {
  const set = new Set(branches);
  const out: string[] = [];

  if (set.has("辰") && set.has("戌")) {
    out.push("見辰戌沖：同時檢查土支互耗、庫門鬆動與藏氣重新入局，不直接斷成單純化土或必然開庫。");
  }
  if (set.has("丑") && set.has("未")) {
    out.push("見丑未沖：同時檢查土支互耗、庫門鬆動與藏氣重新入局，不直接斷成單純化土或必然開庫。");
  }
  if (set.has("辰") && set.has("酉")) {
    out.push("見辰酉合：先論收束、牽制與向金的結構條件；若另有自刑、沖刑或歲運引動，不得寫成「鎖死」。");
  }
  if (set.has("卯") && set.has("戌")) {
    out.push("見卯戌合：先論收束、牽制與向火的結構條件，不把六合本身直接等同合化。");
  }
  if (set.has("子") && set.has("丑")) {
    out.push("見子丑合：先論合住與收束，是否化土仍須月令、透干、根氣與全局支持。");
  }
  if (set.has("午") && set.has("未")) {
    out.push("見午未合：化氣方向採審慎政策，優先論協調、牽制與收束，不強斷化氣。");
  }
  if (branches.filter((branch) => branch === "辰").length >= 2) {
    out.push("見雙辰：辰辰自刑造成耗損／鬆動；若同時有辰酉合，必須比較「合的收束」與「自刑的鬆動」，不能只留單一鎖庫敘事。");
  }

  for (const relation of COMPLETE_RELATIONS) {
    if (relation.branches.every((branch) => set.has(branch))) {
      out.push(`見${relation.label}：是否真正成局仍按月令、透干、有根、有引及是否觸及病藥判定。`);
    }
  }

  return out;
}

/**
 * Compact runtime overlay. It does not decide whether a tomb is auspicious;
 * it forces the report to expose the exact branch / hidden-stem / ten-god chain
 * before any real-world interpretation is allowed.
 */
export function buildFourTombsRuntimeText(chart: Chart): string {
  const tombPillars = chart.pillars.filter(
    (pillar) => pillar.ready !== false && FOUR_TOMBS.has(pillar.zhi),
  );
  if (!tombPillars.length) return "";

  const branches = readyBranches(chart);
  const pillarText = tombPillars.map((pillar) => describePillar(chart, pillar)).join("；");
  const dynamics = dynamicRelationText(branches);
  const state = dynamics.length
    ? dynamics.join("")
    : "目前原局只見庫支存在，未見足以單獨成立的沖、六合、完整三合／三會或雙辰自刑；先標「庫在而未動」，待透干與歲運再判。";

  return [
    `【四庫專析】${pillarText}。`,
    "庫氣是十二長生墓庫身份，不是藏干力量排名；本氣十神與庫氣十神分開計算。",
    "「旺者為庫、衰者為墓」看的是被收納五行自身在全局／歲運的旺衰，不是日主身強身弱。",
    state,
    "開庫機制（沖、刑、會拱、透干、歲運引動）與開後結果（喜忌、病藥、承載、流通）分開判；不得由四庫直接推出婚變、失職、疾病、死亡、破產或必發財。",
  ].join("");
}

export function applyFourTombsRuntimePolicy(chart: Chart, reading: Reading): Reading {
  if (!hasNatalFourTombs(chart) || reading.rhythm.includes("【四庫專析】")) return reading;
  const fourTombs = buildFourTombsRuntimeText(chart);
  return fourTombs ? { ...reading, rhythm: [reading.rhythm, fourTombs].filter(Boolean).join(" ") } : reading;
}
