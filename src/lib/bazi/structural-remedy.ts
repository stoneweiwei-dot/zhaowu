import { HIDDEN, tenGod } from "@/lib/bazi/calendar";
import type { Chart } from "@/lib/bazi/types";

export type StructuralRemedyStatus = "clear" | "provisional" | "insufficient";

export type StructuralRemedy = {
  status: StructuralRemedyStatus;
  disease: string;
  medicine: string;
  bridge: string | null;
  evidence: string[];
};

type GodGroup = "resource" | "peer" | "output" | "wealth" | "officer";

const GROUP_LABEL: Record<GodGroup, string> = {
  resource: "印星",
  peer: "比劫",
  output: "食傷",
  wealth: "財星",
  officer: "官殺",
};

function groupOf(god: string): GodGroup | null {
  if (god === "正印" || god === "偏印") return "resource";
  if (god === "比肩" || god === "劫財" || god === "日主") return "peer";
  if (god === "食神" || god === "傷官") return "output";
  if (god === "正財" || god === "偏財") return "wealth";
  if (god === "正官" || god === "七殺") return "officer";
  return null;
}

function evidenceCounts(chart: Chart): Record<GodGroup, number> {
  const counts: Record<GodGroup, number> = { resource: 0, peer: 0, output: 0, wealth: 0, officer: 0 };
  for (const pillar of chart.pillars.filter((item) => item.ready !== false)) {
    if (pillar.key !== "day" && pillar.gan) {
      const group = groupOf(tenGod(chart.dayMaster, pillar.gan));
      if (group) counts[group] += 2;
    }
    const mainQi = HIDDEN[pillar.zhi]?.[0];
    if (mainQi) {
      const group = groupOf(tenGod(chart.dayMaster, mainQi));
      if (group) counts[group] += 1;
    }
  }
  return counts;
}

function visibleGods(chart: Chart): string[] {
  return chart.pillars
    .filter((pillar) => pillar.ready !== false && pillar.key !== "day" && Boolean(pillar.gan))
    .map((pillar) => tenGod(chart.dayMaster, pillar.gan));
}

function tendency(chart: Chart): "strong" | "weak" | "balanced" {
  const text = chart.strength?.tendency ?? "";
  if (/旺|強|强/.test(text)) return "strong";
  if (/弱/.test(text)) return "weak";
  return "balanced";
}

function rankEvidence(counts: Record<GodGroup, number>): string {
  return (Object.entries(counts) as [GodGroup, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([group]) => GROUP_LABEL[group])
    .join("、");
}

/**
 * 子平病藥／通關 layer.
 * This is deliberately structural: it starts from month/strength and observable
 * ten-god channels. It never turns a single element count into a lucky-element prescription.
 */
export function analyzeStructuralRemedy(chart: Chart): StructuralRemedy {
  const counts = evidenceCounts(chart);
  const visible = visibleGods(chart);
  const state = tendency(chart);
  const hasSeal = counts.resource > 0;
  const hasOutput = counts.output > 0;
  const hasWealth = counts.wealth > 0;
  const hasOfficer = counts.officer > 0;
  const hasKill = visible.includes("七殺") || chart.pillars.some((pillar) => (HIDDEN[pillar.zhi] ?? []).some((stem) => tenGod(chart.dayMaster, stem) === "七殺"));
  const evidence = [
    `旺衰基線：${chart.strength?.tendency ?? "未定"}。`,
    `可見十神通道由強到弱：${rankEvidence(counts)}（只作結構比對，不作百分比喜忌）。`,
  ];

  if (state === "weak" && counts.officer >= 3) {
    if (hasSeal) {
      return {
        status: "clear",
        disease: "官殺壓身，日主承載不足",
        medicine: "先取印星承接官殺之氣，再由印生身；這是結構上的化殺生身，不是簡單補某一五行。",
        bridge: "官殺 → 印 → 日主",
        evidence: [...evidence, "原局官殺壓力已見，同時有印星可作承接通道。"],
      };
    }
    return {
      status: "provisional",
      disease: "官殺壓身，日主承載不足",
      medicine: "病位先定在官殺壓力；原局未見足夠印星承接，因此只標需要『化殺／扶身』，不虛構已存在的通關鏈。",
      bridge: null,
      evidence: [...evidence, "官殺壓力已見，但原局印星承接不足。"],
    };
  }

  if (state === "weak" && counts.output >= 3) {
    return {
      status: hasSeal ? "clear" : "provisional",
      disease: "食傷洩身偏重",
      medicine: hasSeal
        ? "以印星約束過洩並回生日主，先恢復承載，再談食傷生財。"
        : "先控制過度洩出、保住日主承載；原局未見足夠印星，不把通關條件說滿。",
      bridge: hasSeal ? "印 → 日主 → 食傷" : null,
      evidence: [...evidence, `食傷結構偏重${hasSeal ? "，且印星通道已見" : "，但印星通道不足"}。`],
    };
  }

  if (state === "weak" && counts.wealth >= 3) {
    return {
      status: "provisional",
      disease: "財星耗身偏重",
      medicine: "先看比劫與印星能否提高承載，再論任財；不得因財星多就直接判富或直接補財。",
      bridge: counts.peer > 0 || hasSeal ? "印／比劫 → 日主 → 財" : null,
      evidence: [...evidence, "財星耗身條件較突出，需先核對日主承載。"],
    };
  }

  if (state === "strong" && counts.resource + counts.peer > counts.output + counts.wealth + counts.officer + 1) {
    if (hasOutput) {
      return {
        status: "clear",
        disease: "印比偏聚，氣機容易壅滯",
        medicine: hasWealth
          ? "先以食傷疏泄，再由食傷生財承接，形成從日主向外流通的路徑。"
          : "先以食傷疏泄，使旺氣有出口；財星承接是否成立再看原局與歲運，不預設。",
        bridge: hasWealth ? "日主 → 食傷 → 財" : "日主 → 食傷",
        evidence: [...evidence, `印比偏聚，同時${hasOutput ? "已見食傷出口" : "未見穩定食傷出口"}。`],
      };
    }
    return {
      status: "provisional",
      disease: "印比偏聚，氣機容易壅滯",
      medicine: "病位先定在印比壅滯；原局食傷出口不足，等待歲運引出時再判是否形成有效疏泄。",
      bridge: null,
      evidence: [...evidence, "印比偏聚，但原局未見穩定食傷出口。"],
    };
  }

  if (hasKill && hasSeal) {
    return {
      status: "clear",
      disease: "七殺壓力需要被有序承接",
      medicine: "原局已見印星承接七殺的路徑；是否足以稱成格，仍須月令、透干、根氣與受制情況共同確認。",
      bridge: "七殺 → 印 → 日主",
      evidence: [...evidence, "七殺與印星同時入局，殺印相生的通關路徑可見。"],
    };
  }

  if (hasKill && hasOutput) {
    return {
      status: "provisional",
      disease: "七殺形成約束壓力",
      medicine: "食傷制殺的路徑已見，但要分食神與傷官、強弱與位置，不把『有食傷』直接等同制殺成功。",
      bridge: "食傷 → 制官殺",
      evidence: [...evidence, "七殺與食傷同時入局，存在制殺路徑。"],
    };
  }

  return {
    status: "insufficient",
    disease: "未見足以單獨定性的主要結構病位",
    medicine: "維持月令—格局—旺衰—制化的順序，待更明確的失衡或歲運引動再定病藥；不為了湊答案硬指定用神。",
    bridge: null,
    evidence,
  };
}
