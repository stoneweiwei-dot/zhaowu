/**
 * Customer-facing first-screen answer composer (zh-Hant).
 *
 * Presentation layer only. It never recalculates the chart and adds no new
 * judgement: every verdict below is derived from values the engine already
 * produced (distinctTimingSummary = the same year/month ranking used by the
 * timing answer; chart.strength.tendency = the same 旺/弱 split that
 * interpret()/leanChoice() already branch on; STEM_TELL / BRANCH_TELL and the
 * five-element money lines are existing owner material). What changes is how it
 * is said: answer first, reason in plain words, timing last, no jargon.
 *
 * Special question types that already have dedicated, question-specific
 * answers (talent, job fit, 格局, 用神, 身強弱, travel, pets, legal, fertility,
 * named relatives, purpose, cosmic, past life, A/B comparison, multi-topic…)
 * are left untouched: composeCustomerAnswer() returns null for them.
 */
import { distinctTimingSummary, type TimingYearSummary } from "@/lib/bazi/forecast-safe";
import type { ForecastTopic } from "@/lib/bazi/forecast";
import { BRANCH_TELL, STEM_TELL } from "@/lib/bazi/interpret";
import { isStructureQuestion } from "@/lib/bazi/structure";
import type { AnalysisResult, Chart, Element } from "@/lib/bazi/types";
import { inspectAnswerRequirements, isJobFitQuestion, isTalentQuestion } from "@/lib/core/answer-contract";
import { toTraditionalCustomerText } from "@/lib/report/reading-locale";
import { isCosmicSymbolicQuestion } from "@/lib/symbolic/cosmic-profile";

type Topic = "career" | "money" | "love" | "health" | "home" | "self";
type Grade = "up" | "mixed" | "down";
type Form = "when" | "yesno" | "choice" | "open";

const SPECIAL_RE = /(格局|成格|破格|用神|喜用|取用|忌神|身強|身强|身弱|旺衰|強弱|强弱|病藥|病药|紫微|六十甲子|納音|纳音|三垣|命宮|命宫|胎元|身宮|身宫|五行.{0,8}(屬性|属性|主導|主导|分布|比例|占比|能量)|哪個五行|哪个五行|前世|前三世|六道|輪迴|轮回|一掌經|一掌经|為何而生|为何而生|為什麼而生|为什么而生|使命|宿命|人生角色|潛意識|潜意识|真實的自己|真实的自己|度假|旅行|旅遊|旅游|出行|出國玩|目的地|機票|机票|行程|寵物|宠物|養貓|养猫|養狗|养狗|官司|訴訟|诉讼|律師|律师|法院|仲裁|懷孕|怀孕|受孕|備孕|备孕|生孩子|生育|父母|爸爸|媽媽|妈妈|母親|母亲|父親|父亲|兄弟|姐妹|姊妹|朋友|同事|貴人|贵人|小人|股票|基金|ETF|加密|比特幣|比特币|彩票|彩券|號碼|号码|手術|手术|治療|治疗|停藥|停药|癌|時辰.{0,6}(不知|未知|不確定)|不知道.{0,8}時辰)/i;
const AB_RE = /A\s*[：:].+?B\s*[：:]|還是|还是|或者|二選一|二选一|選哪|选哪/s;
const WHEN_FORM_RE = /(什麼時候|什么时候|何時|何时|哪年|哪一年|哪月|幾月|几月|多久|時機|时机|幾歲|几岁)/;
const CHOICE_FORM_RE = /(該不該|该不该|要不要|值不值得|是否應該|是否应该|有沒有必要|有没有必要)/;
const YESNO_FORM_RE = /(嗎|吗|能不能|會不會|会不会|可不可以|適不適合|适不适合|有沒有|有没有|行不行|好不好)[？?]?$|^(?:我)?(?:能|會|会|可以|適合|适合)/;
const YEAR_WORD_RE = /(今年|明年|後年|后年|這幾年|这几年|未來|未来|20\d{2})/;

const TOPIC_RES: [Topic, RegExp][] = [
  ["home", /(家宅|搬家|房子|住宅|店面|風水|风水|買屋|买屋|買房|买房|住哪|坐向|搬到|移居|移民)/],
  ["health", /(健康|身體|身体|生病|病痛|失眠|睡不著|睡不着|體力|体力|累)/],
  ["love", /(感情|戀愛|恋爱|愛情|爱情|交往|正緣|正缘|婚姻|結婚|结婚|伴侶|伴侣|桃花|復合|复合|分手|緣分|缘分|男友|女友|另一半|對象|对象|曖昧|暧昧|脫單|脱单)/],
  ["career", /(工作|職業|职业|事業|事业|轉職|转职|跳槽|離職|离职|辭職|辞职|升遷|升迁|升職|升职|加薪|職場|职场|公司|職位|职位|上班|面試|面试|創業|创业|老闆|老板|offer|學業|学业|考試|考试|升學|升学|留學|留学|研究所|讀書|读书|證照|证照)/i],
  ["money", /(財運|财运|財務|财务|錢|钱|收入|投資|投资|理財|理财|債務|债务|存錢|存钱|發財|发财|賺|赚|虧|亏)/],
];

const TOPIC_NOUN: Record<Topic, string> = {
  career: "工作", money: "財運", love: "感情", health: "身體", home: "搬遷和居住上的變動", self: "整體運勢",
};

const MONEY_STYLE: Record<Element, string> = {
  木: "你賺錢靠的是信用：少承諾、多兌現，條件說到做到，資源和訂單自然會來。",
  火: "你賺錢靠的是人情和帶動力：把關係經營熱，結果和資源會跟著來。",
  土: "你賺錢要靠多留後路：多客戶、多管道、多收入來源，別因為怕變動就把財路鎖死。",
  金: "你賺錢要守住本業：可以重效率、重利益，但別為了短期好處犧牲專業和承諾。",
  水: "你賺錢要靠露面和連結：把資訊和判斷力拿出來跟人互動、成交，不要只分析不行動。",
};

function tr(value: string): string {
  return toTraditionalCustomerText(value);
}

function detectTopics(question: string): Topic[] {
  return TOPIC_RES.filter(([, re]) => re.test(question)).map(([topic]) => topic);
}

function formOf(question: string): Form {
  if (WHEN_FORM_RE.test(question)) return "when";
  if (CHOICE_FORM_RE.test(question)) return "choice";
  if (YESNO_FORM_RE.test(question.trim())) return "yesno";
  return "open";
}

function gradeOf(score: number): Grade {
  if (score >= 3) return "up";
  if (score <= -3) return "down";
  return "mixed";
}

function yearWord(year: number): string {
  const now = new Date().getFullYear();
  if (year === now) return "今年";
  if (year === now + 1) return "明年";
  if (year === now + 2) return "後年";
  return `${year}年`;
}

function months(list: number[]): string {
  return list.map((m) => `${m}月`).join("、");
}

function isStrong(chart: Chart): boolean {
  return chart.strength.tendency.includes("旺");
}

function stemParts(chart: Chart): { gift: string; risk: string } {
  const raw = tr(STEM_TELL[chart.dayMaster] ?? "");
  const [gift, risk] = raw.split(/；|;/).map((part) => part.trim());
  return {
    gift: (gift ?? "").replace(/。$/, ""),
    risk: (risk ?? "").replace(/^風險是/, "").replace(/。$/, ""),
  };
}

function verdict(topic: Topic, form: Form, grade: Grade, y: string, chart: Chart): string {
  const strong = isStrong(chart);
  if (form === "choice") {
    const move = strong && grade !== "down";
    const yearPart = grade === "up" ? `${y}${TOPIC_NOUN[topic]}也推得動` : grade === "down" ? `但${y}${TOPIC_NOUN[topic]}阻力偏大` : `只是${y}不是整年都順`;
    return move
      ? `偏向可以動。你的底子偏滿，比起一直忍著，更需要把力氣用出去；${yearPart}，所以重點是挑對時間、先想好退路。`
      : `偏向先不急著動。${strong ? "" : "你的底子承載偏弱，先把手上穩定的資源顧好比較重要；"}${yearPart}，真要動就小步試，不要一次全押。`;
  }
  switch (topic) {
    case "career":
      if (grade === "up") return `可以，${y}工作上推得動，適合主動爭取。`;
      if (grade === "down") return `${y}工作上先別急著大動，阻力偏大；真要動，先把下一步準備好。`;
      return `可以，但${y}工作上不是整年都順，關鍵在挑對月份出手。`;
    case "money":
      if (grade === "up") return `有機會，${y}財運推得動，不過比較像靠穩定產出累積起來，不是一夜暴富。`;
      if (grade === "down") return `${y}財運阻力偏大，先守住現金流，不適合冒進投資或擴張。`;
      return `有進帳的機會，但${y}財運不是全年都順，賺錢要挑時機、守好風險。`;
    case "love":
      if (grade === "up") return `${y}感情這條線是動的，有機會往前走一步。`;
      if (grade === "down") return `${y}感情這條線阻力比較大，先別急著定下來，多看對方實際怎麼做。`;
      return `${y}感情有機會，但不會一路順，要看對方實際的投入，不能只靠感覺。`;
    case "health":
      if (grade === "up") return `${y}身體整體負擔不重，照正常節奏維持就好。`;
      if (grade === "down") return `${y}身體的消耗比較大，要主動減量、早點休息。`;
      return `${y}身體有起伏，不算大問題，但有幾個月要特別放慢。`;
    case "home":
      if (grade === "up") return `${y}適合動，搬遷、換環境比較推得動。`;
      if (grade === "down") return `${y}先不急著搬，變動的阻力比較大，能緩就緩。`;
      return `${y}可以動，但要挑時間，別急著一次定案。`;
    default:
      if (grade === "up") return `${y}整體是推得動的一年，適合把想做的事往前推。`;
      if (grade === "down") return `${y}整體阻力比較大，適合守、整理和準備，不適合硬衝。`;
      return `${y}整體屬於有起伏的一年，不是不能做，而是要挑時間、分輕重。`;
  }
}

function whenOpener(topic: Topic, summary: TimingYearSummary[]): string {
  const withBest = summary.filter((s) => s.best.length);
  if (!withBest.length) return `${yearWord(summary[0].year)}沒有特別突出的月份，${TOPIC_NOUN[topic]}這件事不建議硬排時間。`;
  const head = topic === "love" ? "感情比較容易有進展的時間" : topic === "health" ? "身體比較穩、適合處理健康安排的時間" : `${TOPIC_NOUN[topic]}上比較容易推進的時間`;
  const parts = withBest.map((s) => `${yearWord(s.year)}的${months(s.best)}`).join("，其次是");
  return `${head}，落在${parts}。這是比較順的窗口，不是保證一定發生。`;
}

function structuralCareer(chart: Chart): string {
  return isStrong(chart)
    ? "可以，但要選對方向。你的底子偏滿，比起被動等安排，更適合主動做事、把成果做出來。"
    : "可以考慮，但不要一個人硬扛。你的底子承載偏弱，比較適合資源、規則和支援都到位的環境。";
}

function structuralMoney(chart: Chart): string {
  return isStrong(chart)
    ? "有機會。你扛得住財，關鍵在有沒有一條穩定、能重複賺錢的路，而不是靠一次運氣。"
    : "有機會，但財來了要扛得住。先求穩、少借錢、少槓桿，比追求一次大賺更重要。";
}

function reason(topic: Topic, result: AnalysisResult, question: string): string {
  const { chart, reading } = result;
  switch (topic) {
    case "career": {
      // Full plain topic text (already localized by finishReading); it ends
      // with the four-point job comparison, which the next step refers to.
      const work = String(reading.work ?? "").trim();
      return work ? `從你的盤來看，你${/^(適合|适合)/.test(work) ? "" : "比較適合"}${work}` : "";
    }
    case "money":
      return MONEY_STYLE[chart.dayMasterElement] ?? "";
    case "love":
      return "感情好不好，不看桃花多不多，要看對方有沒有持續回應你、有沒有實際投入、願不願意把下一步講清楚。";
    case "health": {
      const t = chart.strength.tendency;
      const base = t.includes("旺")
        ? "你的底子偏旺，問題通常不是沒力氣，而是停不下來、消耗過頭。"
        : t.includes("弱")
          ? "你的底子偏弱，比較容易累，恢復要比別人多留時間。"
          : "你的底子還算平衡，規律作息就是最好的保養。";
      return `${base}命盤不能診斷疾病，有持續的不舒服一定先看醫生。`;
    }
    case "home":
      return /(搬到|移居|移民|生活)/.test(question)
        ? "搬到哪裡適不適合，命盤只能看時機和你的節奏；真正決定的，是工作、簽證、生活成本和家人這些現實條件。"
        : "具體一間房子適不適合，要看坐向、採光、道路、動線和你住進去的實際感受，命盤只能看時機。";
    default: {
      const { gift, risk } = stemParts(chart);
      const branch = tr(BRANCH_TELL[chart.pillars.find((p) => p.key === "day")?.zhi ?? ""] ?? "").replace(/。$/, "");
      const asksBlindSpot = /(盲點|盲点|缺點|缺点|弱點|弱点|問題|问题|卡住|迷茫|迷惘|焦慮|焦虑|怎麼辦|怎么办)/.test(question);
      const lines = asksBlindSpot && risk
        ? [`你最容易卡住的地方，是${risk}。`, gift ? `反過來說，你的長處是${gift}，問題通常不在能力，而在怎麼用。` : ""]
        : [gift ? `你的長處是${gift}。` : "", risk ? `要留意的是${risk}。` : ""];
      if (branch) lines.push(`做決定時的習慣：${branch}。`);
      return lines.filter(Boolean).join("");
    }
  }
}

function timingLine(summary: TimingYearSummary[]): string {
  return summary.map((s) => {
    const y = yearWord(s.year);
    const good = s.best.length ? `${y}比較順的是${months(s.best)}` : `${y}沒有特別順的月份`;
    const slow = s.caution.length ? `，${months(s.caution)}放慢一點` : "";
    return `${good}${slow}。`;
  }).join("");
}

function nextStep(topic: Topic, form: Form, summary: TimingYearSummary[] | null, question: string): string {
  const first = summary?.find((s) => s.best.length);
  const when = first ? `，時間上優先抓${yearWord(first.year)}${months(first.best.slice(0, 2))}` : "";
  switch (topic) {
    case "career": return `把你正在考慮的機會寫下來，用上面四件事逐項比，最值得的那一個先推進${when}。`;
    case "money": return `先算清楚每月固定支出和你能承受的最大損失，再決定要不要加碼${when}。`;
    case "love": return `接下來只看對方三件事：會不會主動聯絡、會不會安排見面、願不願意把關係講清楚${when}。`;
    case "health": return "先把睡眠和作息固定下來；有持續的不舒服，直接去看醫生。";
    case "home": return /(買房|买房|買屋|买屋|房子|房貸|房贷)/.test(question)
      ? `先算清楚頭期款、每月房貸和緊急預備金，扛得住再挑時間${when}。`
      : `先把搬過去的工作、生活成本和居住條件列清楚，現實條件過關再挑時間${when}。`;
    default: return form === "choice"
      ? `把兩條路的收入、時間、責任、穩定性和退路放在同一張表，先確認最壞情況扛不扛得住${when}。`
      : `挑一件拖最久的事，這週先做出一個看得見的結果${when}。`;
  }
}

export type ComposedCustomerAnswer = { answer: string; nextAction: string };

export function composeCustomerAnswer(result: AnalysisResult): ComposedCustomerAnswer | null {
  const locale = result.locale ?? "zh-Hant";
  if (locale !== "zh-Hant") return null;
  const question = String(result.question ?? "").trim();
  if (!question) return null;
  if (SPECIAL_RE.test(question) || isStructureQuestion(question) || isTalentQuestion(question) || isJobFitQuestion(question) || isCosmicSymbolicQuestion(question)) return null;
  if (/A\s*[：:].+?B\s*[：:]/s.test(question)) return null;

  const topics = detectTopics(question);
  if (topics.length > 1) return null;
  const kind = result.reading.kind;
  if (kind === "past") return null;
  const topic: Topic = topics[0] ?? (["career", "money", "love", "health", "home"].includes(kind) ? kind as Topic : "self");
  const form = formOf(question);
  if (form !== "choice" && AB_RE.test(question)) return null;

  const req = inspectAnswerRequirements(question);
  const explicitTime = form === "when" || YEAR_WORD_RE.test(question) || req.targetMonths.length > 0;
  const forecastTopic: ForecastTopic = topic;
  const years = req.targetYears.length
    ? req.targetYears
    : form === "when" || /這幾年|这几年|未來|未来/.test(question)
      ? [new Date().getFullYear(), new Date().getFullYear() + 1]
      : [new Date().getFullYear()];
  const summary = distinctTimingSummary(result.chart, forecastTopic, years, req.targetMonths);
  const grade = gradeOf(summary[0]?.score ?? 0);
  const y = yearWord(summary[0]?.year ?? new Date().getFullYear());

  let opener: string;
  if (form === "when") {
    opener = whenOpener(topic, summary);
  } else if (!explicitTime && form !== "choice" && topic === "career") {
    opener = structuralCareer(result.chart);
  } else if (!explicitTime && form !== "choice" && topic === "money") {
    opener = structuralMoney(result.chart);
  } else if (!explicitTime && form !== "choice" && topic === "self") {
    opener = "";
  } else {
    opener = verdict(topic, form, grade, y, result.chart);
  }

  const why = reason(topic, result, question);
  const showTiming = explicitTime || form === "choice" || topic === "love" || topic === "health" || topic === "home";
  const cautionParts = summary.filter((s) => s.caution.length).map((s) => `${yearWord(s.year)}${months(s.caution)}`);
  const cautionOnly = cautionParts.length ? `比較不順的是${cautionParts.join("和")}，重要的事盡量避開。` : "";
  const timing = form === "when" ? cautionOnly : showTiming ? timingLine(summary) : "";
  const precision = result.chart.timeUnknown ? "你的出生時間沒有確定，月份只能抓大方向。" : "";

  const answer = [opener, why, timing, precision].map((s) => s.trim()).filter(Boolean).join("");
  if (!answer) return null;
  return { answer, nextAction: nextStep(topic, form, showTiming || form === "when" ? summary : null, question) };
}
