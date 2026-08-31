import type { AnalysisResult, AppLocale } from "@/lib/bazi/types";
import { buildCultivationEnvironmentAdviceLines } from "@/lib/report/cultivation-environment-advice";

type AdvicePack = Record<AppLocale, readonly string[]>;

export type MindAdviceComicDirective = {
  format: "9:16";
  bilingual: true;
  style: string;
  sourcePolicy: string;
  libraryCrossReference: string;
  watermark: string;
};

/**
 * Visual policy for report-side mind/body/spirit advice illustrations.
 * The comic is explanatory only: it visualises the selected advice and must never
 * alter calculation truth, the reading result, or the meaning of the advice.
 */
export const MIND_ADVICE_COMIC_DIRECTIVE: MindAdviceComicDirective = {
  format: "9:16",
  bilingual: true,
  style:
    "溫暖米白／淡宣紙底、乾淨黑色手繪線條、低飽和藍橙扁平人物、簡潔小漫畫／科普信息圖；人物表情與日常場景直接承載建議，不走寫實、3D、商業仙俠或高飽和海報感；留白充足，手機閱讀優先。",
  sourcePolicy:
    "先從本檔已命中的身心靈／開悟建議中取核心意思，再轉成一個可視化的日常情境。不得為了畫面反過來修改命理解讀，不新增宿命、醫療或超自然斷言。",
  libraryCrossReference:
    "生成前交叉引用昭梧既有圖庫：優先找與該次報告主題、情緒、關係／身體／行動／自我議題相符的既有圖像語義；有合適素材可引用其象徵與構圖語彙，沒有才生成新漫畫。避免重複同一構圖。",
  watermark: "STONE 原創；位於安全區內，清楚可見但不搶正文。",
};

const GENERAL: AdvicePack = {
  "zh-Hant": [
    "命理建議｜煩惱仍會來，但不必跟著它走；平靜不是沒有雜念，而是知道念頭在，仍能把心收回當下。",
    "很多答案都要自己尋找。修心不在遠處，塞車、排隊、洗碗或事情受阻時，能看見自己的反應，就是日常的功課。",
  ],
  "zh-Hans": [
    "命理建议｜烦恼仍会来，但不必跟着它走；平静不是没有杂念，而是知道念头在，仍能把心收回当下。",
    "很多答案都要自己寻找。修心不在远处，塞车、排队、洗碗或事情受阻时，能看见自己的反应，就是日常的功课。",
  ],
  en: [
    "Reflection | Stress and difficult thoughts can still show up. The goal is not to erase them, but to notice them without letting them run the whole day.",
    "You will not get every answer from someone else. Everyday delays, chores and setbacks are useful places to notice your reactions and choose your next step more calmly.",
  ],
};

const RELATIONSHIP: AdvicePack = {
  "zh-Hant": [
    "命理建議｜關係不是用來證明自己值得被愛；靠近時真誠，放開時守住邊界，在靠近與放開之間學會慈悲。",
    "不要要求對方永遠明白你。先看懂自己的需要、恐懼和底線；原諒也不等於允許同樣的傷害再次發生。",
  ],
  "zh-Hans": [
    "命理建议｜关系不是用来证明自己值得被爱；靠近时真诚，放开时守住边界，在靠近与放开之间学会慈悲。",
    "不要要求对方永远明白你。先看懂自己的需要、恐惧和底线；原谅也不等于允许同样的伤害再次发生。",
  ],
  en: [
    "Reflection | A relationship is not proof that you are worthy of love. Be open when closeness is mutual, and keep your boundaries when it is time to step back.",
    "Do not expect another person to understand you automatically. Know your own needs, fears and limits first; forgiveness also does not mean allowing the same harm again.",
  ],
};

const BODY: AdvicePack = {
  "zh-Hant": [
    "命理建議｜平靜不是沒有雜念或不適，而是能與它們共存，不讓焦慮替你做全部判斷。",
    "生氣、煩躁或疲憊時，先照顧自己，再處理外面的事；身體症狀仍以實際醫療檢查為準。",
  ],
  "zh-Hans": [
    "命理建议｜平静不是没有杂念或不适，而是能与它们共存，不让焦虑替你做全部判断。",
    "生气、烦躁或疲惫时，先照顾自己，再处理外面的事；身体症状仍以实际医疗检查为准。",
  ],
  en: [
    "Reflection | Calm does not mean having no difficult thoughts or discomfort. It means making room for them without letting anxiety make every decision for you.",
    "When you are angry, overloaded or exhausted, look after yourself first, then deal with the outside problem. Ongoing or worsening physical symptoms still need proper medical assessment.",
  ],
};

const ACTION: AdvicePack = {
  "zh-Hant": [
    "命理建議｜很多答案不是等別人給，而是在行動中自己找出來；先做一個能驗證的小步，再根據結果調整。",
    "修心不必離開日常。塞車、排隊、洗碗、工作受阻時，能不被一時情緒牽著走，就是在練穩定。",
  ],
  "zh-Hans": [
    "命理建议｜很多答案不是等别人给，而是在行动中自己找出来；先做一个能验证的小步，再根据结果调整。",
    "修心不必离开日常。塞车、排队、洗碗、工作受阻时，能不被一时情绪牵着走，就是在练稳定。",
  ],
  en: [
    "Reflection | Many answers become clear through action, not by waiting for someone else to give you certainty. Take one small testable step, then adjust from what actually happens.",
    "You do not need to leave ordinary life to become steadier. Traffic, queues, chores and work setbacks are all chances to practise responding without being dragged by the first emotion.",
  ],
};

const SELF: AdvicePack = {
  "zh-Hant": [
    "命理建議｜煩惱仍會來，但你不必跟著它走；能看見自己的念頭、情緒和執著，就已經從被它控制走向有選擇。",
    "很多答案要自己找。允許曾經走錯、看錯和不完美，不再用今天的自己反覆審判過去。",
  ],
  "zh-Hans": [
    "命理建议｜烦恼仍会来，但你不必跟着它走；能看见自己的念头、情绪和执着，就已经从被它控制走向有选择。",
    "很多答案要自己找。允许曾经走错、看错和不完美，不再用今天的自己反复审判过去。",
  ],
  en: [
    "Reflection | Difficult thoughts can still return, but you do not have to follow them. Noticing your own reactions gives you more choice about what happens next.",
    "Some answers have to be worked out for yourself. Allow for past mistakes and imperfect judgement without using what you know today to keep punishing who you were then.",
  ],
};

function advicePack(result: AnalysisResult): AdvicePack {
  const question = result.question;
  const kind = result.reading.kind;

  if (kind === "love" || /感情|關係|关系|伴侶|伴侣|婚姻|戀愛|恋爱|relationship|partner|love|marriage/i.test(question)) {
    return RELATIONSHIP;
  }
  if (kind === "health" || /健康|身體|身体|睡眠|焦慮|焦虑|health|body|sleep|stress|anxiety/i.test(question)) {
    return BODY;
  }
  if (kind === "self" || kind === "past" || /自己|內耗|内耗|執念|执念|過去|过去|self|past|identity/i.test(question)) {
    return SELF;
  }
  if (["career", "money", "home", "timing", "choice"].includes(kind)) {
    return ACTION;
  }
  return GENERAL;
}

/**
 * Compact owner-curated reflection copy for the existing summary block.
 * The targeted 「修心與環境」 module gets first refusal when the question clearly matches it.
 * This never creates a new report session and never overrides the calculated reading.
 */
export function buildMindAdviceLines(result: AnalysisResult): string[] {
  const targeted = buildCultivationEnvironmentAdviceLines(result);
  if (targeted?.length) return targeted.slice(0, 2);
  const locale = result.locale ?? "zh-Hans";
  return [...advicePack(result)[locale]].slice(0, 2);
}
