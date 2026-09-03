import type { AnalysisResult, AppLocale } from "@/lib/bazi/types";

type LocalizedAdvice = Record<AppLocale, string>;

type PracticalCultivationThemeId =
  | "inner-over-form"
  | "bounded-kindness"
  | "concrete-plan"
  | "adversity-mirror"
  | "having-not-possessing"
  | "inner-outer-balance";

type PracticalCultivationTheme = {
  id: PracticalCultivationThemeId;
  advice: LocalizedAdvice;
};

/**
 * Owner-approved practical cultivation layer distilled from the 2026-09-04
 * DeepSeek screenshot digest. This is a reflection/report-writing layer only.
 * It must never change deterministic BaZi/Ziwei calculation truth.
 */
export const PRACTICAL_CULTIVATION_GUIDANCE = {
  id: "ZW-PRACTICAL-CULTIVATION-GUIDANCE-1.0",
  sourceLayer: "OWNER_MATERIAL",
  themes: [
    {
      id: "inner-over-form",
      advice: {
        "zh-Hant": "命理建議｜真正要修的不是形式，而是遇事時自己的反應。念經、行善或做儀式都不能代替反省；先看這件事讓你起了什麼執著、怨氣或評判，再決定下一步。",
        "zh-Hans": "命理建议｜真正要修的不是形式，而是遇事时自己的反应。念经、行善或做仪式都不能代替反省；先看这件事让你起了什么执着、怨气或评判，再决定下一步。",
        en: "Reflection | Practice is not mainly about rituals or appearances; it is about how you respond when something is difficult. Notice the attachment, resentment or judgement that has been triggered, then choose the next practical step.",
      },
    },
    {
      id: "bounded-kindness",
      advice: {
        "zh-Hant": "命理建議｜你的問題未必是不夠善良，而可能是善良缺少界線。能幫的可以幫，但不要把替別人承擔後果當成慈悲；說清楚你願意做到哪裡，也說清楚哪一部分要由對方自己負責。",
        "zh-Hans": "命理建议｜你的问题未必是不够善良，而可能是善良缺少边界。能帮的可以帮，但不要把替别人承担后果当成慈悲；说清楚你愿意做到哪里，也说清楚哪一部分要由对方自己负责。",
        en: "Reflection | The issue may not be a lack of kindness, but kindness without boundaries. Help where it is reasonable, but do not confuse carrying another person's consequences with compassion; be clear about what you will do and what remains their responsibility.",
      },
    },
    {
      id: "concrete-plan",
      advice: {
        "zh-Hant": "命理建議｜知道問題不等於已經改變。把最容易故態復萌的情境先寫清楚，替自己設一個很小但可執行的應對：下次同樣情況出現時先做什麼、停止什麼，再看結果調整。",
        "zh-Hans": "命理建议｜知道问题不等于已经改变。把最容易故态复萌的情境先写清楚，替自己设一个很小但可执行的应对：下次同样情况出现时先做什么、停止什么，再看结果调整。",
        en: "Reflection | Knowing the pattern is not the same as changing it. Identify the situation where you are most likely to fall back into the old response, then set one small rule for what to do first, what to stop, and what result to review afterwards.",
      },
    },
    {
      id: "adversity-mirror",
      advice: {
        "zh-Hant": "命理建議｜順的時候不容易看見自己的慣性，卡住、被拒絕或失去控制時反而最清楚。把逆境當成照見反應模式的鏡子，不必把苦難神聖化；看見模式後仍要處理現實問題。",
        "zh-Hans": "命理建议｜顺的时候不容易看见自己的惯性，卡住、被拒绝或失去控制时反而最清楚。把逆境当成照见反应模式的镜子，不必把苦难神圣化；看见模式后仍要处理现实问题。",
        en: "Reflection | Your automatic patterns are often easiest to see when plans fail, you are rejected or control is limited. Use the setback as information rather than romanticising suffering, and still deal with the real-world problem in front of you.",
      },
    },
    {
      id: "having-not-possessing",
      advice: {
        "zh-Hant": "命理建議｜真正耗人的不一定是沒有，而是得到之後仍然害怕失去。關係、金錢與成果可以珍惜，但不要把「必須永遠屬於我」變成唯一安全感；先分清珍惜、需要與控制。",
        "zh-Hans": "命理建议｜真正耗人的不一定是没有，而是得到之后仍然害怕失去。关系、金钱与成果可以珍惜，但不要把“必须永远属于我”变成唯一安全感；先分清珍惜、需要与控制。",
        en: "Reflection | What drains you may not be lacking something, but fearing its loss once you have it. Value relationships, money and achievements without making permanent possession your only source of security; separate care, need and control.",
      },
    },
    {
      id: "inner-outer-balance",
      advice: {
        "zh-Hant": "命理建議｜只向內反省，容易把所有責任都算在自己身上；只向外行動，又可能反覆帶著同一套習氣。先調整自己的反應，再處理外在的人、事、制度與資源，兩邊缺一不可。",
        "zh-Hans": "命理建议｜只向内反省，容易把所有责任都算在自己身上；只向外行动，又可能反复带着同一套习气。先调整自己的反应，再处理外在的人、事、制度与资源，两边缺一不可。",
        en: "Reflection | Looking only inward can turn every problem into self-blame, while acting only outward can repeat the same pattern. Adjust your own response and also deal with the people, systems, resources and practical conditions involved.",
      },
    },
  ] satisfies PracticalCultivationTheme[],
  guards: [
    "只作 OWNER_MATERIAL／現代實踐性建議，不得標成經典原文或 CALC_TRUTH。",
    "不得把疾病、災禍、貧困、關係傷害或其他現實困境歸因為業障、前世、能量或心念不正。",
    "不得把神通、天眼、接靈、地魂、乩身、通靈或所謂科學證明寫入客戶事實性結論。",
    "不得用修行、忍耐、慈悲或放下要求當事人停留在傷害、控制或不安全的關係與環境。",
    "健康、法律、財務與安全問題仍以相應的現實專業處理為準。",
    "每次最多輸出兩條，併入既有摘要，不新增 report session、卡片層或計算流程。",
  ],
} as const;

const THEME_MAP = new Map(
  PRACTICAL_CULTIVATION_GUIDANCE.themes.map((theme) => [theme.id, theme]),
);

function selectThemeIds(result: AnalysisResult): PracticalCultivationThemeId[] {
  const question = String(result.question ?? "");
  const kind = result.reading.kind;
  const ids: PracticalCultivationThemeId[] = [];
  const add = (id: PracticalCultivationThemeId) => {
    if (!ids.includes(id)) ids.push(id);
  };

  if (
    kind === "love" ||
    /感情|關係|关系|伴侶|伴侣|婚姻|家人|付出|幫忙|帮忙|善良|界線|边界|縱容|纵容|relationship|partner|marriage|family|boundary|overgiv/i.test(question)
  ) {
    add("bounded-kindness");
  }

  if (
    ["career", "money", "timing", "choice"].includes(kind) ||
    /改變|改变|拖延|三分鐘|三分钟|計畫|计划|行動|行动|執行|执行|卡住|選擇|选择|工作|事業|事业|career|money|plan|action|procrastinat|stuck|choice/i.test(question)
  ) {
    add("concrete-plan");
  }

  if (
    kind === "self" ||
    kind === "past" ||
    /修心|修行|反省|懺悔|忏悔|我執|我执|嗔|嫉妒|怨|評判|评判|念經|念经|法會|法会|儀式|仪式|self|reflection|resent|jealous|ritual/i.test(question)
  ) {
    add("inner-over-form");
  }

  if (
    /逆境|低谷|失敗|失败|受阻|被拒|挫折|不順|不顺|壓力|压力|setback|failure|rejection|blocked|pressure/i.test(question)
  ) {
    add("adversity-mirror");
  }

  if (
    /占有|失去|捨不得|舍不得|執念|执念|欲望|控制|一定要|離不開|离不开|possess|loss|attachment|control/i.test(question)
  ) {
    add("having-not-possessing");
  }

  if (
    /都是我的錯|都是我的错|全怪自己|只怪自己|外在|環境|环境|制度|資源|资源|self.?blame|environment|system|resources/i.test(question)
  ) {
    add("inner-outer-balance");
  }

  return ids;
}

export function buildPracticalCultivationAdviceLines(
  result: AnalysisResult,
): string[] | null {
  const locale = result.locale ?? "zh-Hans";
  const lines = selectThemeIds(result)
    .map((id) => THEME_MAP.get(id)?.advice[locale] ?? "")
    .filter(Boolean)
    .slice(0, 2);

  return lines.length ? lines : null;
}
