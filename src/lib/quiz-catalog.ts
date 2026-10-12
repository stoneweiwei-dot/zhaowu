import type { Locale } from "@/lib/i18n";

/**
 * Every standalone quiz on the site. The home "Explore" panel and the /fun-tests hub both list from here,
 * so a quiz added to one can no longer be missing from the other (scripts/quiz-catalog.test.mjs guards the home list).
 * `inline: true` = the quiz runs inside /fun-tests itself (?test=…) instead of on its own route.
 */
export type QuizEntry = {
  id: string;
  href: string;
  inline?: boolean;
  text: Record<Locale, { title: string; hint: string }>;
};

export const QUIZ_CATALOG: readonly QuizEntry[] = [
  {
    id: "divine-affinity",
    href: "/quiz/divine-affinity",
    text: {
      "zh-Hant": { title: "仙佛淵源本緣測試", hint: "16 題從魂格、象徵脈象、天命六層交叉判讀" },
      "zh-Hans": { title: "仙佛渊源本缘测试", hint: "16 题从魂格、象征脉象、天命六层交叉判读" },
      en: { title: "Divine Affinity Scan", hint: "16 questions across Soul Pattern, Celestial Mandate" },
    },
  },
  {
    id: "cultivation-destiny",
    href: "/quiz/cultivation-destiny",
    text: {
      "zh-Hant": { title: "修仙命格靈測", hint: "推演靈根宗門道途並生成個人九比十六命測圖" },
      "zh-Hans": { title: "修仙命格灵测", hint: "推演灵根宗门道途并生成个人九比十六命测图" },
      en: { title: "Cultivation Destiny Dossier", hint: "spirit root, sect, paths + personal 9:16 dossier image" },
    },
  },
  {
    id: "earth-online",
    href: "/fun-tests/earth-online",
    text: {
      "zh-Hant": { title: "地球 Online · 古籍攻略", hint: "8 道題看你現在卡在哪一關，推薦古籍" },
      "zh-Hans": { title: "地球 Online · 古籍攻略", hint: "8 道题看你现在卡在哪一关，推荐古籍" },
      en: { title: "Earth Online · Classics Guide", hint: "8 questions to match your stuck point with a Chinese classic" },
    },
  },
  {
    id: "animal",
    href: "/fun-tests?test=animal",
    inline: true,
    text: {
      "zh-Hant": { title: "內在動物 × 命局瑞獸", hint: "看現在常用的人格策略與本能反應" },
      "zh-Hans": { title: "内在动物 × 命局瑞兽", hint: "看现在常用的人格策略与本能反应" },
      en: { title: "Inner Animal × Guardian Beast", hint: "current personality strategy and instinctive response" },
    },
  },
  {
    id: "element",
    href: "/fun-tests?test=element",
    inline: true,
    text: {
      "zh-Hant": { title: "五行功能測驗", hint: "看現在主觀上最想加強哪一種功能" },
      "zh-Hans": { title: "五行功能测验", hint: "看现在主观上最想加强哪一种功能" },
      en: { title: "Five-Element Function Test", hint: "which function you currently want to strengthen" },
    },
  },
  {
    id: "six-realms",
    href: "/quiz/six-realms",
    text: {
      "zh-Hant": { title: "六道習氣測驗", hint: "看目前最明顯的日常慣性" },
      "zh-Hans": { title: "六道习气测验", hint: "看目前最明显的日常惯性" },
      en: { title: "Six Realms Habit Test", hint: "which everyday habit pattern is strongest now" },
    },
  },
  {
    id: "five-element-overdrive",
    href: "/quiz/five-element-overdrive",
    text: {
      "zh-Hant": { title: "五行優勢內耗測驗", hint: "10 個日常情境，看你最容易把哪一種優勢用成內耗" },
      "zh-Hans": { title: "五行优势内耗测验", hint: "10 个日常情境，看你最容易把哪一种优势用成内耗" },
      en: { title: "Five-Element Overuse Test", hint: "10 everyday situations: which strength you overuse into friction" },
    },
  },
];
