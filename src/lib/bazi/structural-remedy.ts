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

type ChannelEvidence = {
  group: GodGroup;
  visible: boolean;
  rooted: boolean;
  monthCommand: boolean;
};

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
  return chart.pillars
    .filter((pillar) => pillar.ready !== false)
    .flatMap((pillar) => HIDDEN[pillar.zhi] ?? [])
    .map((stem) => tenGod(chart.dayMaster, stem));
}

function groupSet(gods: string[]): Set<GodGroup> {
  const out = new Set<GodGroup>();
  for (const god of gods) {
    const group = groupOf(god);
    if (group) out.add(group);
  }
  return out;
}

function tendency(chart: Chart): "strong" | "weak" | "balanced" {
  const text = chart.strength?.tendency ?? "";
  if (/旺|強|强/.test(text)) return "strong";
  if (/弱/.test(text)) return "weak";
  return "balanced";
}

function monthCommandGod(chart: Chart): string | null {
  const monthBranch = chart.monthBranch
    ?? chart.pillars.find((pillar) => pillar.key === "month" && pillar.ready !== false)?.zhi;
  const mainQi = monthBranch ? HIDDEN[monthBranch]?.[0] : undefined;
  return mainQi ? tenGod(chart.dayMaster, mainQi) : null;
}

function channel(
  group: GodGroup,
  visibleGroups: Set<GodGroup>,
  rootedGroups: Set<GodGroup>,
  monthGroup: GodGroup | null,
): ChannelEvidence {
  return {
    group,
    visible: visibleGroups.has(group),
    rooted: rootedGroups.has(group),
    monthCommand: monthGroup === group,
  };
}

function channelSeen(item: ChannelEvidence) {
  return item.visible || item.rooted || item.monthCommand;
}

/**
 * 「成勢」只採結構條件，不做十神票數或加權分數：
 * - 得月令主氣；或
 * - 天干透出且地支有根。
 *
 * 這不是完整成格判定，只是病藥層判斷某條力量是否足以先進入分析。
 */
function structurallyAnchored(item: ChannelEvidence) {
  return item.monthCommand || (item.visible && item.rooted);
}

function displayGodList(gods: string[]) {
  const unique = [...new Set(gods)];
  return unique.length ? unique.join("、") : "未見明顯通道";
}

/**
 * 子平病藥／通關 layer。
 *
 * 核心約束：
 * 1. 月令為綱，透干與根氣分開判；
 * 2. 不把五行／十神數量、百分比、票數或軟件評分當作力量；
 * 3. 「有路」不等於「有效流通」；只有透根、位置與承載條件能支持時才提高信度；
 * 4. 七殺若真正成勢先論制化，但僅暗藏一點七殺不強行升格成主病。
 */
export function analyzeStructuralRemedy(chart: Chart): StructuralRemedy {
  const visible = visibleGods(chart);
  const rooted = rootedGods(chart);
  const visibleGroups = groupSet(visible);
  const rootedGroups = groupSet(rooted);
  const monthGod = monthCommandGod(chart);
  const monthGroup = monthGod ? groupOf(monthGod) : null;
  const state = tendency(chart);

  const seal = channel("resource", visibleGroups, rootedGroups, monthGroup);
  const peer = channel("peer", visibleGroups, rootedGroups, monthGroup);
  const output = channel("output", visibleGroups, rootedGroups, monthGroup);
  const wealth = channel("wealth", visibleGroups, rootedGroups, monthGroup);
  const officer = channel("officer", visibleGroups, rootedGroups, monthGroup);

  const killVisible = visible.includes("七殺");
  const killRooted = rooted.includes("七殺");
  const killAtMonthCommand = monthGod === "七殺";
  const killAnchored = killAtMonthCommand || (killVisible && killRooted);

  const evidence = [
    `旺衰承載基線：${chart.strength?.tendency ?? "未定"}。`,
    `月令主氣十神：${monthGod ?? "未定"}；月令只作全局主氣入口，不以數量替代力量。`,
    `天干透出通道：${displayGodList(visible)}。`,
    `地支根氣通道：${displayGodList(rooted)}。`,
    "本層不作百分比喜忌，也不以十神票數或差額替代結構判斷。",
  ];

  if (killAnchored) {
    if (state === "weak" && seal.rooted && (seal.visible || seal.monthCommand)) {
      return {
        status: "clear",
        disease: "官殺壓身，日主承載偏弱；其中七殺已具成勢條件",
        medicine: "印星承接官殺，再轉而生身；原局印星既入局又有根，可先論殺印相生的承接路徑，是否成格仍須回到月令、位置、清濁與受制情況確認。",
        bridge: "官殺 → 印 → 日主",
        evidence: [
          ...evidence,
          `七殺${killAtMonthCommand ? "得月令主氣" : "透出且有根"}，不是僅憑一個藏干判殺旺。`,
          "日主承載基線偏弱，故先把已成勢的官殺落到『官殺壓身』這一承載問題，而不是只停在七殺標籤。",
          "印星有根且進入顯性／月令作用鏈，故可把『有路』提高到較可用的承接判斷。",
        ],
      };
    }

    if (seal.rooted && (seal.visible || seal.monthCommand)) {
      return {
        status: "clear",
        disease: "七殺成勢，先看壓力是否能被有序承接",
        medicine: "原局印星既入局又有根，可先論殺印相生的承接路徑；是否成格仍須回到月令、位置、清濁與受制情況確認。",
        bridge: "七殺 → 印 → 日主",
        evidence: [
          ...evidence,
          `七殺${killAtMonthCommand ? "得月令主氣" : "透出且有根"}，不是僅憑一個藏干判殺旺。`,
          "印星有根且進入顯性／月令作用鏈，故可把『有路』提高到較可用的承接判斷。",
        ],
      };
    }

    if (output.visible && output.rooted) {
      return {
        status: "provisional",
        disease: "七殺成勢，形成約束與壓力",
        medicine: "食傷透出且有根，存在制殺路徑；但仍要分食神／傷官、位置、有情無情以及是否反傷官星，不能把『有食傷』直接等同制殺成功。",
        bridge: "食傷 → 制七殺",
        evidence: [
          ...evidence,
          `七殺${killAtMonthCommand ? "得月令主氣" : "透出且有根"}。`,
          "食傷同時透出且有根，因此只確認制殺路徑存在，效果仍維持條件性。",
        ],
      };
    }

    return {
      status: "provisional",
      disease: "七殺成勢，但制化承接條件尚未完整",
      medicine: "先核對印是否能化、食傷是否能制、比劫是否能承，以及財星是否反而滋殺；在作用鏈未完整前，不把七殺直接判凶，也不虛構已成立的藥。",
      bridge: null,
      evidence: [
        ...evidence,
        `七殺${killAtMonthCommand ? "得月令主氣" : "透出且有根"}，因此依『有殺先論殺』先檢查制化。`,
        "目前未同時確認一條具備根氣與顯性入口的穩定制化鏈。",
      ],
    };
  }

  if (state === "weak" && structurallyAnchored(officer)) {
    if (channelSeen(seal)) {
      return {
        status: seal.rooted ? "clear" : "provisional",
        disease: "官殺壓身，日主承載偏弱",
        medicine: seal.rooted
          ? "印星承接官殺，再轉而生身；仍須檢查印是否受傷、被合鎖或位置失效。"
          : "印星雖已入局但根氣不足，先標示化官殺／扶身方向，不把尚未站穩的通道說成完成。",
        bridge: seal.rooted ? "官殺 → 印 → 日主" : null,
        evidence: [
          ...evidence,
          `官殺${officer.monthCommand ? "得月令" : "透出且有根"}，且日主承載基線偏弱。`,
          `印星${seal.rooted ? "有根" : "根氣不足"}。`,
        ],
      };
    }
    return {
      status: "provisional",
      disease: "官殺壓身，日主承載偏弱",
      medicine: "先確認能否以印承接、比劫分擔或其他有效制化提高承載；原局尚未確認可用藥，不因官殺出現就直接判凶。",
      bridge: null,
      evidence: [...evidence, `官殺${officer.monthCommand ? "得月令" : "透出且有根"}，但尚未確認穩定承接鏈。`],
    };
  }

  if (state === "weak" && structurallyAnchored(output)) {
    return {
      status: seal.rooted && channelSeen(seal) ? "clear" : "provisional",
      disease: "食傷洩身，主要輸出通道超過當前承載",
      medicine: seal.rooted && channelSeen(seal)
        ? "印星有根，可先恢復承載並約束過洩；之後才判食傷能否有效生財。"
        : "先保住日主承載並核對印、比劫是否真正可用；沒有根氣支持時，不把『需要印』寫成『原局已有有效印藥』。",
      bridge: seal.rooted && channelSeen(seal) ? "印 → 日主 → 食傷" : null,
      evidence: [...evidence, `食傷${output.monthCommand ? "得月令" : "透出且有根"}，與偏弱承載形成需要處理的洩身關係。`],
    };
  }

  if (state === "weak" && structurallyAnchored(wealth)) {
    const supportSeen = channelSeen(seal) || channelSeen(peer);
    return {
      status: "provisional",
      disease: "財星耗身，日主承載偏弱",
      medicine: "先核對印與比劫能否提高承載，再談任財；財星成勢本身不等於富，也不能以增加財星作補救。",
      bridge: supportSeen ? "印／比劫 → 日主 → 財" : null,
      evidence: [
        ...evidence,
        `財星${wealth.monthCommand ? "得月令" : "透出且有根"}，且日主承載基線偏弱。`,
        supportSeen ? "原局可見印／比劫支援通道，但是否有效仍須檢查根氣與位置。" : "原局尚未確認穩定支援通道。",
      ],
    };
  }

  const supportAtMonth = seal.monthCommand || peer.monthCommand;
  const outputStable = output.visible && output.rooted;
  if (state === "strong" && supportAtMonth) {
    if (outputStable) {
      const wealthCanReceive = channelSeen(wealth);
      return {
        status: "clear",
        disease: "印比偏聚而日主承載偏強，但已有食傷透根作出口",
        medicine: wealthCanReceive
          ? "食傷透出且有根，可先疏泄，再檢查財星是否能承接輸出；有路仍不等於每一段都已有效。"
          : "食傷透出且有根，可作主要疏泄出口；財星承接是否成立留待原局位置與歲運確認。",
        bridge: wealthCanReceive ? "日主 → 食傷 → 財" : "日主 → 食傷",
        evidence: [
          ...evidence,
          `${GROUP_LABEL[seal.monthCommand ? "resource" : "peer"]}居月令主氣，日主承載基線偏強。`,
          "食傷透出且有根，因此可以確認出口存在；是否後續生財仍另行判斷。",
        ],
      };
    }
    return {
      status: "provisional",
      disease: "印比偏聚而日主承載偏強，氣機容易壅滯",
      medicine: "先找真正能透出且有根的食傷出口，再看財星是否能接續；原局只見藏根或局部訊號時，不把『有食傷』誤寫成有效流通，更不用十神數量差額硬造補法。",
      bridge: null,
      evidence: [
        ...evidence,
        `${GROUP_LABEL[seal.monthCommand ? "resource" : "peer"]}居月令主氣，但未確認透出且有根的食傷出口。`,
        "有根不透只代表潛在通道，不能直接當成已完成的洩秀；故先處理支持／通關條件。",
      ],
    };
  }

  const weaklyPresentKill = killVisible || killRooted;
  return {
    status: "insufficient",
    disease: "未見足以單獨定性的主要結構病位",
    medicine: "維持月令—格局—病藥—流通—承載的順序，待更明確的失衡或歲運引動再定病藥；不為了湊答案硬指定用神。",
    bridge: null,
    evidence: weaklyPresentKill
      ? [...evidence, "原局可見七殺訊號，但未同時滿足得月令或透干有根，因此不把弱訊號升格成『七殺成勢』。"]
      : evidence,
  };
}
