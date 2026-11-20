import type { AnalysisResult, AppLocale } from "@/lib/bazi/types";

type LocalizedText = Record<AppLocale, string>;

type CultivationEnvironmentTheme = {
  id:
    | "mind-shapes-use-of-environment"
    | "compassion-non-harm"
    | "family-roots"
    | "speech-humility-respect"
    | "habits-project-into-space"
    | "release-binary-attachment"
    | "family-separate-lessons"
    | "wu-wei-with-action";
  title: LocalizedText;
  advice: LocalizedText;
};

/**
 * Owner-curated 「修心與環境」 advice layer.
 * This is a report-writing / reflection module only. It never changes BaZi or Ziwei calculation truth.
 */
export const CULTIVATION_ENVIRONMENT_GUIDANCE = {
  id: "ZW-CULTIVATION-ENVIRONMENT-GUIDANCE-1.0",
  masterPrinciple: {
    "zh-Hant": "真正需要調整的，不只是一個方位，而是人與環境、家人、言語、萬物之間的長期關係。外局可調，內心亦須調；風水可以作參考，但不能取代人的選擇、行動與現實處理。",
    "zh-Hans": "真正需要调整的，不只是一个方位，而是人与环境、家人、言语、万物之间的长期关系。外局可调，内心亦须调；风水可以作参考，但不能取代人的选择、行动与现实处理。",
    en: "What may need adjustment is not only a direction or a room, but the long-term relationship between you, your environment, family, words and daily habits. Feng shui can be a reference, but it cannot replace choices, action or practical problem-solving.",
  } satisfies LocalizedText,
  themes: [
    {
      id: "mind-shapes-use-of-environment",
      title: { "zh-Hant": "境隨心轉", "zh-Hans": "境随心转", en: "Mindset and environment" },
      advice: {
        "zh-Hant": "修心與環境｜外在格局會影響生活，但不是唯一決定因素。先看自己的情緒、作息與行為是否讓一個空間更好用；能改動環境就改，不能改時先調整使用方式與日常節奏。",
        "zh-Hans": "修心与环境｜外在格局会影响生活，但不是唯一决定因素。先看自己的情绪、作息与行为是否让一个空间更好用；能改动环境就改，不能改时先调整使用方式与日常节奏。",
        en: "Reflection | Your surroundings can affect daily life, but they are not the only factor. Look at whether your mood, routines and behaviour make the space easier or harder to live in; change the space where practical, and change how you use it where it is not.",
      },
    },
    {
      id: "compassion-non-harm",
      title: { "zh-Hant": "慈悲／不傷生", "zh-Hans": "慈悲／不伤生", en: "Compassion and reducing harm" },
      advice: {
        "zh-Hant": "修心與環境｜慈悲先落在「少製造不必要的傷害」：對人、動物與環境保留餘地，能不傷就不傷，能減少浪費與破壞就減少。這是生活選擇，不拿來交換財運或保證福報。",
        "zh-Hans": "修心与环境｜慈悲先落在“少制造不必要的伤害”：对人、动物与环境保留余地，能不伤就不伤，能减少浪费与破坏就减少。这是生活选择，不拿来交换财运或保证福报。",
        en: "Reflection | Put compassion into reducing unnecessary harm: leave more room for people, animals and the environment, and reduce avoidable waste or damage. Treat this as a way of living, not as a bargain for money, luck or guaranteed rewards.",
      },
    },
    {
      id: "family-roots",
      title: { "zh-Hant": "孝親／根源關係", "zh-Hans": "孝亲／根源关系", en: "Family roots" },
      advice: {
        "zh-Hant": "修心與環境｜父母與原生家庭會留下很深的關係底色。能尊重、能關心就去做，但孝親不等於失去界線；真正穩定的家庭關係，是在關心彼此的同時，也允許成年人各自做選擇。",
        "zh-Hans": "修心与环境｜父母与原生家庭会留下很深的关系底色。能尊重、能关心就去做，但孝亲不等于失去边界；真正稳定的家庭关系，是在关心彼此的同时，也允许成年人各自做选择。",
        en: "Reflection | Parents and early family relationships can shape us deeply. Respect and care where you genuinely can, but family duty does not require losing your boundaries; stable adult relationships also leave room for each person to make their own choices.",
      },
    },
    {
      id: "speech-humility-respect",
      title: { "zh-Hant": "口德、謙卑、敬物", "zh-Hans": "口德、谦卑、敬物", en: "Speech, humility and respect" },
      advice: {
        "zh-Hant": "修心與環境｜口德不是把情緒吞回去，而是少用羞辱、惡言和傲慢把衝突越推越大。把不滿說成具體需求與界線；對人與物多一點尊重，也是在減少自己生活裡無謂的耗損。",
        "zh-Hans": "修心与环境｜口德不是把情绪吞回去，而是少用羞辱、恶言和傲慢把冲突越推越大。把不满说成具体需求与边界；对人与物多一点尊重，也是在减少自己生活里无谓的耗损。",
        en: "Reflection | Good speech does not mean swallowing your feelings. It means avoiding humiliation, contempt and needless escalation; turn frustration into a clear need or boundary, and use respect to reduce avoidable friction in daily life.",
      },
    },
    {
      id: "habits-project-into-space",
      title: { "zh-Hant": "相由心生／習慣投射", "zh-Hans": "相由心生／习惯投射", en: "Habits leave traces" },
      advice: {
        "zh-Hant": "修心與環境｜字跡、物件擺放、房間整潔與長期生活方式，可以當作習慣和當下狀態留下的線索，而不是性格或命運的診斷。若空間一直讓你更亂、更累，就先從一個可維持的小習慣改起。",
        "zh-Hans": "修心与环境｜字迹、物件摆放、房间整洁与长期生活方式，可以当作习惯和当下状态留下的线索，而不是性格或命运的诊断。若空间一直让你更乱、更累，就先从一个可维持的小习惯改起。",
        en: "Reflection | Handwriting, clutter, object placement and home routines can be clues to habits and current state, but they are not diagnoses of personality or destiny. If your space repeatedly makes life more chaotic or tiring, start with one small routine you can actually maintain.",
      },
    },
    {
      id: "release-binary-attachment",
      title: { "zh-Hant": "二元執念／放下分別心", "zh-Hans": "二元执念／放下分别心", en: "Loosening rigid attachment" },
      advice: {
        "zh-Hant": "修心與環境｜不要急著把眼前的一切只分成贏或輸、順或逆、得到或失去。先承認現況，再看哪一部分值得改、哪一部分需要接受；放下分別心不是沒有立場，而是不讓單一得失綁住全部判斷。",
        "zh-Hans": "修心与环境｜不要急着把眼前的一切只分成赢或输、顺或逆、得到或失去。先承认现况，再看哪一部分值得改、哪一部分需要接受；放下分别心不是没有立场，而是不让单一得失绑住全部判断。",
        en: "Reflection | Try not to reduce the whole situation to win or lose, good or bad, gain or loss. See what is actually happening, then separate what is worth changing from what needs accepting; loosening attachment does not mean having no standards.",
      },
    },
    {
      id: "family-separate-lessons",
      title: { "zh-Hant": "家人各自課題", "zh-Hans": "家人各自课题", en: "Each person carries their own part" },
      advice: {
        "zh-Hant": "修心與環境｜家人的人生不是你一個人能代替完成的。能提醒、能支持的做到即可；若對方仍作出自己的選擇，就把責任還給對方，不必用「替他承擔一切」來證明關心。",
        "zh-Hans": "修心与环境｜家人的人生不是你一个人能代替完成的。能提醒、能支持的做到即可；若对方仍作出自己的选择，就把责任还给对方，不必用“替他承担一切”来证明关心。",
        en: "Reflection | You cannot live a family member's life for them. Offer useful support and speak clearly, but when another adult makes their own choice, let the responsibility remain with them rather than proving care by carrying everything yourself.",
      },
    },
    {
      id: "wu-wei-with-action",
      title: { "zh-Hant": "無為不妄為", "zh-Hans": "无为不妄为", en: "Act without forcing" },
      advice: {
        "zh-Hant": "修心與環境｜無為不是不做，而是不在時機、條件與現實都不支持時反覆硬推。先把能做的準備做好，觀察回饋；需要進就進，需要停就停，不用靠焦慮製造更多動作。",
        "zh-Hans": "修心与环境｜无为不是不做，而是不在时机、条件与现实都不支持时反复硬推。先把能做的准备做好，观察反馈；需要进就进，需要停就停，不用靠焦虑制造更多动作。",
        en: "Reflection | Non-forcing is not passivity. Prepare what you can, watch the real feedback, and do not keep pushing simply because uncertainty makes you anxious; move when conditions support it and stop when more force is only creating waste.",
      },
    },
  ] satisfies CultivationEnvironmentTheme[],
  guards: [
    "風水、方位、物件與環境象徵只可作輔助建議，不得反向修改八字／紫微 Calculation Truth。",
    "不得宣稱杯盤桌椅或物件會聽見人的話、具有可驗證的意識。",
    "不得宣稱殺生會直接導致財福消失、破財或其他可確定的超自然報應。",
    "不得以孝親為理由要求當事人留在傷害、控制或失衡關係裡。",
    "不得用字跡、凌亂、物件擺法或住宅狀態診斷心理疾病、人格或命運。",
    "任何環境或修心建議不得取代住宅安全、醫療、法律、財務與關係中的現實處理。",
    "每份報告最多調用兩條修心／命理建議，並入既有總體概括，不新增第三層或新的 report session。",
  ],
} as const;

const THEMES = new Map(CULTIVATION_ENVIRONMENT_GUIDANCE.themes.map((theme) => [theme.id, theme]));

function textOf(id: CultivationEnvironmentTheme["id"], locale: AppLocale): string {
  return THEMES.get(id)?.advice[locale] ?? "";
}

function selectedThemeIds(result: AnalysisResult): CultivationEnvironmentTheme["id"][] | null {
  const question = String(result.question ?? "");
  const kind = result.reading.kind;

  if (
    kind === "home" ||
    /風水|风水|住宅|住家|房間|房间|空間|空间|環境|环境|整理|收納|收纳|擺放|摆放|方位|居家|feng\s*shui|home|room|space|environment|clutter|declutter/i.test(question)
  ) {
    return ["mind-shapes-use-of-environment", "habits-project-into-space"];
  }

  if (/父母|爸爸|媽媽|妈妈|家人|家庭|原生家庭|孝|親子|亲子|family|parent|mother|father/i.test(question)) {
    return ["family-roots", "family-separate-lessons"];
  }

  if (/吵架|口舌|爭執|争执|衝突|冲突|辱罵|辱骂|惡言|恶言|生氣|生气|傲慢|看不起|argument|conflict|insult|anger|angry|contempt/i.test(question)) {
    return ["speech-humility-respect", "release-binary-attachment"];
  }

  if (/殺生|杀生|傷生|伤生|動物|动物|慈悲|放生|素食|生命|animal|compassion|non.?harm|vegetarian/i.test(question)) {
    return ["compassion-non-harm", "speech-humility-respect"];
  }

  if (/執念|执念|得失|輸贏|输赢|比較|比较|放不下|一定要|非要|順逆|顺逆|attachment|obsess|comparison|win|lose|gain|loss/i.test(question)) {
    return ["release-binary-attachment", "wu-wei-with-action"];
  }

  if (/強求|强求|硬推|時機|时机|等待|控制|逼迫|隨緣|随缘|無為|无为|timing|force|forcing|control|wait|patience/i.test(question)) {
    return ["wu-wei-with-action", "release-binary-attachment"];
  }

  return null;
}

/**
 * Returns at most two owner-curated lines when the question clearly matches this module.
 * Null means the caller should keep its existing generic mind-advice selection.
 */
export function buildCultivationEnvironmentAdviceLines(result: AnalysisResult): string[] | null {
  const ids = selectedThemeIds(result);
  if (!ids) return null;
  const locale = result.locale ?? "zh-Hans";
  return ids.map((id) => textOf(id, locale)).filter(Boolean).slice(0, 2);
}
