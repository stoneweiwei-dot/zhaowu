import type { Locale } from "@/lib/i18n";
import type { QizhengBody, QizhengResult } from "@/lib/qizheng/engine";

export type QizhengPlainSection = {
  key: "temperament" | "mind" | "relationship" | "action" | "growth" | "habit";
  title: string;
  body: string;
};

export type QizhengPlainSummary = {
  version: "zhaowu_qizheng_plain_summary_v1";
  title: string;
  lead: string;
  sections: QizhengPlainSection[];
  closing: string;
  internalEvidence: string[];
};

type BranchTone = "fire" | "earth" | "metal" | "water" | "wood";

const BRANCH_TONE: Record<string, BranchTone> = {
  寅: "wood", 卯: "wood", 辰: "earth", 巳: "fire", 午: "fire", 未: "earth",
  申: "metal", 酉: "metal", 戌: "earth", 亥: "water", 子: "water", 丑: "earth",
};

const TONE_COPY: Record<Locale, Record<BranchTone, { gift: string; shadow: string; pace: string }>> = {
  "zh-Hant": {
    wood: { gift: "重視生長與開路，越能看見可能性，越有行動力", shadow: "容易同時開太多方向，後段收束要刻意", pace: "先試出路，再逐步定形" },
    fire: { gift: "反應直接、帶動力強，能快速讓事情有溫度與方向", shadow: "急時容易先表態後整理，情緒退得比話慢", pace: "先點火，再用節奏守住成果" },
    earth: { gift: "務實、能承擔，擅長把抽象想法落成可執行的安排", shadow: "責任抓得太緊時，容易把別人的份也扛在身上", pace: "先確認邊界，再穩定累積" },
    metal: { gift: "判斷俐落、重標準，能在複雜中很快抓到關鍵", shadow: "壓力大時容易變得過度挑剔，對自己尤其嚴格", pace: "先刪去雜訊，再精準出手" },
    water: { gift: "感受細、觀察深，擅長讀懂氣氛與尚未說出口的變化", shadow: "想得太深時容易反覆推演，行動會被不確定感拖慢", pace: "先看清局勢，再選最省力的入口" },
  },
  "zh-Hans": {
    wood: { gift: "重视成长与开路，越能看见可能性，越有行动力", shadow: "容易同时开太多方向，后段收束要刻意", pace: "先试出路，再逐步定形" },
    fire: { gift: "反应直接、带动力强，能快速让事情有温度与方向", shadow: "急时容易先表态后整理，情绪退得比话慢", pace: "先点火，再用节奏守住成果" },
    earth: { gift: "务实、能承担，擅长把抽象想法落成可执行的安排", shadow: "责任抓得太紧时，容易把别人的份也扛在身上", pace: "先确认边界，再稳定累积" },
    metal: { gift: "判断利落、重标准，能在复杂中很快抓到关键", shadow: "压力大时容易变得过度挑剔，对自己尤其严格", pace: "先删去杂讯，再精准出手" },
    water: { gift: "感受细、观察深，擅长读懂气氛与尚未说出口的变化", shadow: "想得太深时容易反复推演，行动会被不确定感拖慢", pace: "先看清局势，再选最省力的入口" },
  },
  en: {
    wood: { gift: "you grow through exploration and become more decisive when you can see future possibilities", shadow: "too many openings can make the final stretch harder to close", pace: "test a path, then give it shape" },
    fire: { gift: "you respond directly and can quickly give a situation momentum and warmth", shadow: "under pressure, words may arrive before feelings have settled", pace: "spark movement, then protect it with rhythm" },
    earth: { gift: "you are practical, dependable, and good at turning ideas into workable arrangements", shadow: "responsibility can become over-responsibility when boundaries blur", pace: "set the boundary, then build steadily" },
    metal: { gift: "you judge cleanly, value standards, and can find the essential point in complexity", shadow: "pressure can turn discernment into harsh self-criticism", pace: "remove noise, then act precisely" },
    water: { gift: "you notice atmosphere and unspoken change with unusual depth", shadow: "deep reflection can become repeated forecasting that delays action", pace: "read the field, then choose the lightest entry" },
  },
};

function findBody(chart: QizhengResult, key: QizhengBody["key"]) {
  return chart.bodies.find((body) => body.key === key);
}

function toneOf(body: QizhengBody | undefined): BranchTone {
  return body ? BRANCH_TONE[body.palace] ?? "earth" : "earth";
}

function retroText(locale: Locale, ...bodies: Array<QizhengBody | undefined>) {
  if (!bodies.some((body) => body?.retrograde)) return "";
  if (locale === "en") return " This tendency is more inward than it first appears: you tend to rehearse, revise, or digest it privately before others see the result.";
  if (locale === "zh-Hans") return " 这股倾向更偏向内在运作：你往往会先在心里反复消化、修改，之后才让别人看见结果。";
  return " 這股傾向更偏向內在運作：你往往會先在心裡反覆消化、修改，之後才讓別人看見結果。";
}

function dominantTone(chart: QizhengResult) {
  const keys: QizhengBody["key"][] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];
  const counts = new Map<BranchTone, number>();
  for (const key of keys) {
    const tone = toneOf(findBody(chart, key));
    counts.set(tone, (counts.get(tone) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["earth", 0] as const;
}

function joinTwo(first: string, second: string, locale: Locale) {
  if (locale === "en") return first + "; at the same time, " + second + ".";
  return first + "；同時，" + second + "。";
}

function temperamentText(sun: QizhengBody | undefined, moon: QizhengBody | undefined, locale: Locale) {
  const sunTone = toneOf(sun);
  const moonTone = toneOf(moon);
  const c = TONE_COPY[locale];
  if (sunTone !== moonTone) return joinTwo(c[sunTone].gift, c[moonTone].gift, locale);
  if (locale === "en") return "your outer style and inner emotional rhythm reinforce the same quality: " + c[sunTone].gift + ". This makes the gift especially consistent, and makes its blind spot worth watching.";
  if (locale === "zh-Hans") return "你的外在表现和内在情绪走的是同一种节奏：" + c[sunTone].gift + "。这让优势特别稳定，也代表它的盲点更容易被放大。";
  return "你的外在表現和內在情緒走的是同一種節奏：" + c[sunTone].gift + "。這讓優勢特別穩定，也代表它的盲點更容易被放大。";
}

export function buildQizhengPlainSummary(chart: QizhengResult, locale: Locale): QizhengPlainSummary {
  const sun = findBody(chart, "sun");
  const moon = findBody(chart, "moon");
  const mercury = findBody(chart, "mercury");
  const venus = findBody(chart, "venus");
  const mars = findBody(chart, "mars");
  const jupiter = findBody(chart, "jupiter");
  const saturn = findBody(chart, "saturn");
  const [dominant, dominantCount] = dominantTone(chart);
  const c = TONE_COPY[locale];

  if (locale === "en") {
    return {
      version: "zhaowu_qizheng_plain_summary_v1",
      title: "Your Seven Luminaries reading",
      lead: "This reading focuses on temperament, emotional rhythm, action under pressure, relationships and the way opportunity becomes sustainable.",
      sections: [
        { key: "temperament", title: "Core temperament", body: "At your centre, " + temperamentText(sun, moon, locale) },
        { key: "mind", title: "Thinking and communication", body: "Your mind works best when you can " + c[toneOf(mercury)].pace + ". " + c[toneOf(mercury)].shadow + "." + retroText(locale, mercury) },
        { key: "relationship", title: "Relationships and values", body: "You value people and environments where " + c[toneOf(venus)].gift + ". In closeness, watch for this pattern: " + c[toneOf(venus)].shadow + "." + retroText(locale, venus) },
        { key: "action", title: "Action and pressure", body: "When action is required, you tend to " + c[toneOf(mars)].pace + ". Longer pressure asks you to remember that " + c[toneOf(saturn)].shadow + "." + retroText(locale, mars, saturn) },
        { key: "growth", title: "Growth and opportunity", body: "Opportunity expands when " + c[toneOf(jupiter)].gift + ". Your most reliable growth strategy is to " + c[toneOf(jupiter)].pace + "." + retroText(locale, jupiter) },
        { key: "habit", title: "Your reinforced pattern", body: "The same " + dominant + " rhythm appears in " + dominantCount + " of the seven main indicators, so this habit is reinforced: " + c[dominant].gift + ". Its useful correction is equally clear—" + c[dominant].shadow + "." },
      ],
      closing: "Use the strong rhythm as a talent, not as your only response. The chart becomes most useful when you can choose when to lean into it and when to soften it.",
      internalEvidence: chart.bodies.map((body) => body.key + ":" + body.palace + ":" + String(body.retrograde)),
    };
  }

  const hans = locale === "zh-Hans";
  return {
    version: "zhaowu_qizheng_plain_summary_v1",
    title: hans ? "你的七政命局报告" : "你的七政命局報告",
    lead: hans ? "这份报告专看你的性情底色、情绪节奏、压力反应、关系取向，以及机会怎样才能真正落地。" : "這份報告專看你的性情底色、情緒節奏、壓力反應、關係取向，以及機會怎樣才能真正落地。",
    sections: [
      { key: "temperament", title: "命局性情", body: temperamentText(sun, moon, locale) },
      { key: "mind", title: hans ? "思考与表达" : "思考與表達", body: (hans ? "你的脑子在能够" : "你的腦子在能夠") + c[toneOf(mercury)].pace + (hans ? "时最好用。需要留意的是：" : "時最好用。需要留意的是：") + c[toneOf(mercury)].shadow + "。" + retroText(locale, mercury) },
      { key: "relationship", title: hans ? "关系与选择" : "關係與選擇", body: (hans ? "你会被这种人和环境吸引：" : "你會被這種人和環境吸引：") + c[toneOf(venus)].gift + (hans ? "。进入亲密关系后，要留意：" : "。進入親密關係後，要留意：") + c[toneOf(venus)].shadow + "。" + retroText(locale, venus) },
      { key: "action", title: hans ? "行动与压力" : "行動與壓力", body: (hans ? "需要出手时，你适合" : "需要出手時，你適合") + c[toneOf(mars)].pace + (hans ? "。压力拉长后，真正的功课是：" : "。壓力拉長後，真正的功課是：") + c[toneOf(saturn)].shadow + "。" + retroText(locale, mars, saturn) },
      { key: "growth", title: hans ? "机会与成长" : "機會與成長", body: (hans ? "你的机会会在这时放大：" : "你的機會會在這時放大：") + c[toneOf(jupiter)].gift + (hans ? "。最稳的成长方式是：" : "。最穩的成長方式是：") + c[toneOf(jupiter)].pace + "。" + retroText(locale, jupiter) },
      { key: "habit", title: hans ? "被加强的惯性" : "被加強的慣性", body: (hans ? "七个主要观察点里，有" : "七個主要觀察點裡，有") + dominantCount + (hans ? "个落在同一种节奏，因此这项习性会被加强：" : "個落在同一種節奏，因此這項習性會被加強：") + c[dominant].gift + (hans ? "。它的提醒也很明确：" : "。它的提醒也很明確：") + c[dominant].shadow + "。" },
    ],
    closing: hans ? "把最强的节奏当成天赋，而不是唯一反应。真正有用的地方，是知道什么时候顺势，什么时候主动放松惯性。" : "把最強的節奏當成天賦，而不是唯一反應。真正有用的地方，是知道什麼時候順勢，什麼時候主動放鬆慣性。",
    internalEvidence: chart.bodies.map((body) => body.key + ":" + body.palace + ":" + String(body.retrograde)),
  };
}
