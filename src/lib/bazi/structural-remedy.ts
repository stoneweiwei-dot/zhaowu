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

function visibleGods(chart: Chart): string[] {
  return chart.pillars
    .filter((pillar) => pillar.ready !== false && pillar.key !== "day" && Boolean(pillar.gan))
    .map((pillar) => tenGod(chart.dayMaster, pillar.gan));
}

function rootedGods(chart: Chart): string[] {
  const out = new Set<string>();
  for (const pillar of chart.pillars.filter((item) => item.ready !== false)) {
    for (const stem of HIDDEN[pillar.zhi] ?? []) out.add(tenGod(chart.dayMaster, stem));
  }
  return [...out];
}

function hasGroup(gods: string[], group: GodGroup): boolean {
  return gods.some((god) => groupOf(god) === group);
}

function monthGroup(chart: Chart): GodGroup | null {
  const mainQi = HIDDEN[chart.monthBranch]?.[0];
  if (!mainQi) return null;
  return groupOf(tenGod(chart.dayMaster, mainQi));
}

function tendency(chart: Chart): "stable" | "weak" | "unresolved" {
  const text = chart.strength?.tendency ?? "";
  if (/偏弱|根援不足|承載偏弱/.test(text)) return "weak";
  if (/承載偏穩|不弱|有根有援/.test(text)) return "stable";
  return "unresolved";
}

function channelEvidence(chart: Chart) {
  const visible = visibleGods(chart);
  const rooted = rootedGods(chart);
  const month = monthGroup(chart);
  const visibleGroups = [...new Set(visible.map(groupOf).filter((x): x is GodGroup => Boolean(x)))];
  const rootedGroups = [...new Set(rooted.map(groupOf).filter((x): x is GodGroup => Boolean(x)))];
  return { visible, rooted, month, visibleGroups, rootedGroups };
}

function present(groups: GodGroup[], group: GodGroup): boolean {
  return groups.includes(group);
}

function groupText(groups: GodGroup[]): string {
  return groups.length ? groups.map((group) => GROUP_LABEL[group]).join("、") : "未見明確通道";
}

/**
 * R6.2.1 子平病藥／通關 layer.
 * 不以十神出現次數、五行百分比或「票數最高」直接定病藥。
 * 判斷只使用月令主氣、透干通道、地支根氣、承載狀態與可見制化路徑。
 */
export function analyzeStructuralRemedy(chart: Chart): StructuralRemedy {
  const channels = channelEvidence(chart);
  const state = tendency(chart);
  const month = channels.month;
  const hasVisible = (group: GodGroup) => present(channels.visibleGroups, group);
  const hasRoot = (group: GodGroup) => present(channels.rootedGroups, group);
  const has = (group: GodGroup) => hasVisible(group) || hasRoot(group);
  const hasSeal = has("resource");
  const hasOutput = has("output");
  const hasWealth = has("wealth");
  const hasOfficer = has("officer");
  const hasKill = channels.visible.includes("七殺") || channels.rooted.includes("七殺");
  const evidence = [
    `承載基線：${chart.strength?.tendency ?? "未定"}。`,
    `月令主氣功能：${month ? GROUP_LABEL[month] : "未定"}。`,
    `透干通道：${groupText(channels.visibleGroups)}；根氣通道：${groupText(channels.rootedGroups)}。`,
    "以上只記是否成立與是否有路，不按出現次數排名。",
  ];

  // 先處理月令直接形成的壓力，再看其他可見通道；不以數量大小搶優先級。
  if (state === "weak" && (month === "officer" || hasOfficer)) {
    if (hasSeal) {
      return {
        status: hasVisible("resource") || hasRoot("resource") ? "clear" : "provisional",
        disease: "官殺壓身，日主承載不足",
        medicine: "先查印星能否真正承接官殺，再由印生身；只有印有根、有路且未被有效破壞時，才可把化殺生身說滿。",
        bridge: "官殺 → 印 → 日主",
        evidence: [...evidence, "官殺壓力與印星承接條件同時可見。"],
      };
    }
    return {
      status: "provisional",
      disease: "官殺壓身，日主承載不足",
      medicine: "病位先定在官殺壓力；原局未見可靠印星承接，只標記需要化殺／扶身，不虛構通關已完成。",
      bridge: null,
      evidence: [...evidence, "官殺通道成立，但印星承接條件不足。"],
    };
  }

  if (state === "weak" && (month === "output" || hasOutput)) {
    return {
      status: hasSeal ? "clear" : "provisional",
      disease: "食傷洩身而承載不足",
      medicine: hasSeal
        ? "先核對印星是否有根、有路，可約束過洩並回生日主；承載恢復後才談食傷生財。"
        : "先控制過度輸出並保住承載；原局未見可靠印星，不把制化條件說滿。",
      bridge: hasSeal ? "印 → 日主 → 食傷" : null,
      evidence: [...evidence, `月令／可見通道指向食傷，${hasSeal ? "印星承接亦可見" : "但印星承接不足"}。`],
    };
  }

  if (state === "weak" && (month === "wealth" || hasWealth)) {
    return {
      status: "provisional",
      disease: "財星耗身而承載不足",
      medicine: "先核對印比是否能提高承載，再論任財；不得因財星出現多就直接判富，也不得把補財當解法。",
      bridge: has("peer") || hasSeal ? "印／比劫 → 日主 → 財" : null,
      evidence: [...evidence, "月令／可見通道指向財，需先核對日主能否承擔。"],
    };
  }

  if (state === "stable" && (month === "resource" || month === "peer") && (has("resource") || has("peer"))) {
    if (hasOutput) {
      return {
        status: "clear",
        disease: "印比聚而需要出口",
        medicine: hasWealth
          ? "以已有食傷作出口，再查食傷是否能有路生財；只有兩段都有效時才形成完整外流鏈。"
          : "以食傷疏泄使氣有出口；財星承接未成立時，不預設下一段一定生財。",
        bridge: hasWealth ? "日主 → 食傷 → 財" : "日主 → 食傷",
        evidence: [...evidence, "月令偏印比，且原局可見食傷出口。"],
      };
    }
    return {
      status: "provisional",
      disease: "印比聚而出口不足",
      medicine: "先確認歲運能否引出真正有根、有路的食傷；未形成出口前，不用單一五行補法代替結構判斷。",
      bridge: null,
      evidence: [...evidence, "月令偏印比，但原局未見可靠食傷出口。"],
    };
  }

  if (hasKill && hasSeal) {
    return {
      status: "provisional",
      disease: "七殺形成壓力，需要有序承接",
      medicine: "殺印相生的候選路徑已出現；是否真正成立，仍要回月令、印根、透干、有路與破格條件核對。",
      bridge: "七殺 → 印 → 日主",
      evidence: [...evidence, "七殺與印星同時入局，僅建立候選制化鏈，不因同時出現就宣告成格。"],
    };
  }

  if (hasKill && hasOutput) {
    return {
      status: "provisional",
      disease: "七殺形成約束壓力",
      medicine: "食傷制殺的候選路徑已見，但必須分食神／傷官、位置、根氣、有路與是否反傷官星，不能以同時出現直接判制殺成功。",
      bridge: "食傷 → 制官殺",
      evidence: [...evidence, "七殺與食傷同時入局，只能建立制殺候選。"],
    };
  }

  return {
    status: "insufficient",
    disease: "未見足以單獨定性的主要結構病位",
    medicine: "維持月令 → 調候 → 根氣透藏與有路 → 格局 → 病藥 → 流通 → 承載的順序；證據不足時不為了完整性硬指定用神。",
    bridge: null,
    evidence,
  };
}
