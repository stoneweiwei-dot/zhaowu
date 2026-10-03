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
 * Contract (docs/FOCUSED-REPORT.md §1): the first screen is at most 3 sentences
 * (counted by 。). Anything longer goes to `detail` for the full report. Months
 * that have already passed are never offered as timing windows.
 *
 * Special question types that already have dedicated, question-specific
 * answers (talent, job fit, 格局, 用神, 身強弱, travel, pets, legal, fertility,
 * named relatives, purpose, cosmic, past life, A/B comparison, multi-topic…)
 * are left untouched: composeCustomerAnswer() returns null for them.
 */
import { distinctTimingSummary, type TimingYearSummary } from "@/lib/bazi/forecast-safe";
import { analyzeForecastYear, type ForecastTopic } from "@/lib/bazi/forecast";
import { BRANCH_TELL, STEM_TELL } from "@/lib/bazi/interpret";
import { isStructureQuestion } from "@/lib/bazi/structure";
import type { AnalysisResult, Chart, Element } from "@/lib/bazi/types";
import { inspectAnswerRequirements, isJobFitQuestion, isTalentQuestion } from "@/lib/core/answer-contract";
import { matchIntent, type Intent } from "@/lib/report/answer-intents";
import { toTraditionalCustomerText } from "@/lib/report/reading-locale";
import { isCosmicSymbolicQuestion } from "@/lib/symbolic/cosmic-profile";

type Topic = "career" | "money" | "love" | "health" | "home" | "self";
type Grade = "up" | "mixed" | "down";
type Form = "when" | "yesno" | "choice" | "open";

const SPECIAL_RE = /(格局|成格|破格|用神|喜用|取用|忌神|身強|身强|身弱|旺衰|強弱|强弱|病藥|病药|紫微|六十甲子|納音|纳音|三垣|命宮|命宫|胎元|身宮|身宫|五行.{0,8}(屬性|属性|主導|主导|分布|比例|占比|能量)|哪個五行|哪个五行|前世|前三世|六道|輪迴|轮回|一掌經|一掌经|為何而生|为何而生|為什麼而生|为什么而生|使命|宿命|人生角色|潛意識|潜意识|真實的自己|真实的自己|度假|旅行|旅遊|旅游|出行|出國玩|目的地|機票|机票|行程|寵物|宠物|養貓|养猫|養狗|养狗|官司|訴訟|诉讼|律師|律师|法院|仲裁|懷孕|怀孕|受孕|備孕|备孕|生孩子|生育|父母|爸爸|媽媽|妈妈|母親|母亲|父親|父亲|兄弟|姐妹|姊妹|朋友|同事|貴人|贵人|小人|針對|针对|霸凌|欺負|欺负|PUA|合夥|合伙|犯太歲|犯太岁|太歲|太岁|股票|基金|ETF|加密|比特幣|比特币|彩票|彩券|號碼|号码|手術|手术|治療|治疗|停藥|停药|癌|時辰.{0,6}(不知|未知|不確定)|不知道.{0,8}時辰)/i;
const AB_RE = /A\s*[：:].+?B\s*[：:]|還是|还是|或者|二選一|二选一|選哪|选哪/s;
const WHEN_FORM_RE = /(什麼時候|什么时候|何時|何时|哪年|哪一年|哪月|幾月|几月|多久|時機|时机|幾歲|几岁)/;
const CHOICE_FORM_RE = /(該不該|该不该|要不要|值不值得|是否應該|是否应该|有沒有必要|有没有必要)/;
const YESNO_FORM_RE = /(嗎|吗|能不能|會不會|会不会|可不可以|適不適合|适不适合|有沒有|有没有|行不行|好不好)[？?]?$|^(?:我)?(?:能|會|会|可以|適合|适合)/;
const YEAR_WORD_RE = /(今年|明年|後年|后年|這幾年|这几年|未來|未来|最近|近期|這陣子|这阵子|20\d{2})/;

const TOPIC_RES: [Topic, RegExp][] = [
  ["home", /((去|到|搬到|移居|前往).{0,6}(日本|韓國|韩国|美國|美国|英國|英国|加拿大|澳洲|新加坡|台灣|台湾|香港|歐洲|欧洲|海外|國外|国外)|家宅|搬家|房子|住宅|店面|風水|风水|買屋|买屋|買房|买房|住哪|坐向|搬到|移居|移民)/],
  ["health", /(健康|身體|身体|生病|病痛|失眠|睡不著|睡不着|體力|体力|累)/],
  ["love", /(同居|冷靜|冷静|已讀|已读|不回我|吃醋|男友|女友|老公|老婆|感情|戀愛|恋爱|愛情|爱情|交往|正緣|正缘|婚姻|結婚|结婚|伴侶|伴侣|桃花|復合|复合|分手|緣分|缘分|男友|女友|另一半|對象|对象|曖昧|暧昧|脫單|脱单)/],
  ["career", /((適合|适合)(當|当|做|從事|从事|學|学|讀|读|選|选)|轉去|转去|科技業|業務|业务|行業|行业|產業|产业|工作|職業|职业|事業|事业|轉職|转职|跳槽|離職|离职|辭職|辞职|升遷|升迁|升職|升职|加薪|職場|职场|公司|職位|职位|上班|面試|面试|創業|创业|老闆|老板|offer|學業|学业|考試|考试|升學|升学|留學|留学|研究所|讀書|读书|證照|证照)/i],
  ["money", /(財運|财运|財務|财务|錢|钱|收入|投資|投资|理財|理财|債務|债务|存錢|存钱|發財|发财|賺|赚|虧|亏)/],
];

// Questions that really are about the person themselves (or ask for the year's luck);
// anything else with no recognised topic gets the honest "chart cannot answer this" frame.
const SELFISH_RE = /(自信|拖延|懶|心軟|內向|外向|膽小|害羞|脾氣|情緒|完美主義|個性|性格|優點|缺點|盲點|長處|特質|天賦|過人|亮點|迷茫|迷惘|焦慮|命好|人生|一生|這輩子|成功|我是.{0,4}人|我是什麼|什麼樣的人|命運|運勢|運氣|運程|流年|八字|命盤)/;

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

function sentences(text: string): string[] {
  return text.split(/(?<=。)/).map((part) => part.trim()).filter(Boolean);
}

function firstSentence(text: string): string {
  return sentences(text)[0] ?? "";
}

const MAX_SENTENCES = 3;

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
  if (form === "choice" && topic !== "career") {
    // The move/stay wording below is about changing jobs. For relationship,
    // health, money, housing and unclassified decisions the chart cannot decide
    // for the person, so say that and give only the timing read.
    const timing = grade === "up" ? "時機上推得動" : grade === "down" ? "時機上阻力偏大，先別急著下決定" : "時機上不是整年都順，先別急著下決定";
    const lead = topic === "love"
      ? "這類感情上的決定，命盤不能替你拍板，要看對方實際怎麼做、你自己能不能接受現在的狀況"
      : topic === "health"
        ? "這類身體上的決定，命盤不能替你拍板，要以醫生的判斷為準"
        : topic === "money"
          ? "這類花錢或投入的決定，命盤不能替你拍板，先算清楚你能承受的最大損失"
          : topic === "home"
            ? "這類居住上的決定，先把頭期款或租金、生活成本和現金流算清楚"
            : "這個決定，命盤不能替你拍板，先把現實條件和最壞情況想清楚";
    return `${lead}，${y}${timing}。`;
  }
  if (form === "choice") {
    const move = strong && grade !== "down";
    const yearPart = grade === "up" ? `${y}${TOPIC_NOUN[topic]}也推得動` : grade === "down" ? `但${y}${TOPIC_NOUN[topic]}阻力偏大` : `只是${y}不是整年都順`;
    return move
      ? `偏向可以動，你的底子偏滿，比起一直忍著，更需要把力氣用出去；${yearPart}，所以重點是挑對時間、先想好退路。`
      : `偏向先不急著動，${strong ? "" : "你的底子偏弱、扛事的餘力比較少，先把手上穩定的資源顧好比較重要；"}${yearPart.replace(/^(只是|但)/, "而且")}，真要動就小步試，不要一次全押。`;
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
  return `${head}，落在${parts}，這只是比較順的窗口，不是保證一定發生。`;
}

function structuralCareer(chart: Chart): string {
  return isStrong(chart)
    ? "可以，但要選對方向，你的底子偏滿，比起被動等安排，更適合主動做事、把成果做出來。"
    : "可以考慮，但不要一個人硬扛，你的底子偏弱、扛事的餘力比較少，比較適合資源、規則和支援都到位的環境。";
}

function structuralMoney(chart: Chart): string {
  return isStrong(chart)
    ? "有機會，你扛得住財，關鍵在有沒有一條穩定、能重複賺錢的路，而不是靠一次運氣。"
    : "有機會，但財來了要扛得住，先求穩、少借錢、少槓桿，比追求一次大賺更重要。";
}

function reason(topic: Topic, result: AnalysisResult, question: string): string {
  const { chart, reading } = result;
  switch (topic) {
    case "career": {
      // Full plain topic text (already localized by finishReading); it ends
      // with the four-point job comparison, which the next step refers to.
      const work = firstSentence(String(reading.work ?? "").trim());
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
      return `${base.replace(/。$/, "")}；命盤不能診斷疾病，有持續的不舒服一定先看醫生。`;
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

function timingLine(summary: TimingYearSummary[], unknownTime = false): string {
  const body = summary.map((s) => {
    const y = yearWord(s.year);
    const good = s.best.length ? `${y}比較順的是${months(s.best)}` : `${y}沒有特別順的月份`;
    const slow = s.caution.length ? `，${months(s.caution)}放慢一點` : "";
    return `${good}${slow}`;
  }).join("；");
  return `${body}${unknownTime ? "（出生時間未定，月份只抓大方向）" : ""}。`;
}

function nextStep(topic: Topic, form: Form, summary: TimingYearSummary[] | null, question: string): string {
  const first = summary?.find((s) => s.best.length);
  const when = first ? `，時間上優先抓${yearWord(first.year)}${months(first.best.slice(0, 2))}` : "";
  switch (topic) {
    case "career": return `把你正在考慮的機會寫下來，按責任是否清楚、成果看不看得出來、資源夠不夠、退路好不好走這四點逐項比，最值得的那一個先推進${when}。`;
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

// High-stakes decisions: the chart must not nudge the person either way.
const MEDICAL_RE = /(手術|手术|治療|治疗|停藥|停药|化療|化疗|癌)/;
const MARRIAGE_BREAK_RE = /(離婚|离婚|外遇|出軌|出轨|婚外|家暴)/;

function highStakes(question: string): ComposedCustomerAnswer | null {
  if (MEDICAL_RE.test(question)) {
    return {
      answer: "這類身體上的決定，要以醫生的判斷為準，命盤不能替你拍板，也不能取代醫療意見。能參考的只有你近期的節奏，壓力大、消耗大的時候，先把休息和檢查顧好。",
      nextAction: "把醫生建議的方案、風險和替代做法問清楚；拿不定主意時，再找第二位醫生確認。",
      detail: [],
    };
  }
  if (MARRIAGE_BREAK_RE.test(question)) {
    return {
      answer: "婚姻要不要走下去是重大決定，命盤不能替你拍板。命盤只能看時機和你的節奏，真正的依據是對方有沒有實際改變的行動，以及你的安全、居住、經濟和孩子這些現實條件。",
      nextAction: "先把居住、經濟、孩子和相關證據這些現實條件列清楚，必要時找律師或專業輔導；有人身安全疑慮，先找專業協助。",
      detail: [],
    };
  }
  return null;
}

// Old dedicated answers sometimes lead with chart bookkeeping. Customers who did not ask in
// chart terms must never see it on the first screen.
export const LEAK_RE = /月令|格局|(正|偏)?(印|財|财|官|殺|杀|食神|傷官|伤官|比肩|劫財|劫财|建祿|建禄|羊刃)格|十神|七殺|七杀|殺印|杀印|日主|喜用|用神|病藥|病药|承載|承载|制化|透干|藏干|庫氣|结构完成度|結構完成度|六親定位|六亲定位|主看(日柱|年柱|月柱|時柱|时柱)|結構摘要|结构摘要|主格.{0,4}格|完成度|月令.{0,3}[子丑寅卯辰巳午未申酉戌亥]/;
const CHART_TALK_RE = /(格局|成格|用神|喜用|身強|身强|身弱|旺衰|五行|時柱|时柱|日主|月令|八字|命盤|命盘|十神|大運|大运|流年|紫微|納音|纳音|命宮|命宫)/;

export type ComposedCustomerAnswer = { answer: string; nextAction: string; detail: string[] };

function composeIntent(intent: Intent, result: AnalysisResult, question: string): ComposedCustomerAnswer {
  const { chart } = result;
  const req = inspectAnswerRequirements(question);
  const today = new Date();
  const nowYear = today.getFullYear();
  const years = req.targetYears.length ? req.targetYears : formOf(question) === "when" ? [nowYear, nowYear + 1] : [nowYear];
  const from = req.targetMonths.length ? undefined : { year: nowYear, month: today.getMonth() + 1 };
  const summary = distinctTimingSummary(chart, intent.topic, years, req.targetMonths, from);
  const first = summary[0];
  const targetYear = first?.year ?? nowYear;
  const { gift, risk } = stemParts(chart);
  const monthTarget = /下個月|下个月/.test(question) ? (today.getMonth() + 1) % 12 + 1 : today.getMonth() + 1;
  const monthYear = /下個月|下个月/.test(question) && today.getMonth() === 11 ? nowYear + 1 : nowYear;
  const monthRead = intent.id === "luck.month" ? distinctTimingSummary(chart, "self", [monthYear], [monthTarget])[0] : null;
  const ctx = {
    monthLabel: /下個月|下个月/.test(question) ? "下個月" : "這個月",
    monthGrade: gradeOf(monthRead?.score ?? 0),
    chart,
    question,
    y: yearWord(targetYear),
    yearLabel: yearWord(targetYear),
    grade: gradeOf(first?.score ?? 0),
    strong: isStrong(chart),
    gift,
    risk,
    work: firstSentence(String(result.reading.work ?? "")).replace(/。$/, ""),
    yearBranch: analyzeForecastYear(chart, targetYear, intent.topic).yearGanZhi.slice(1, 2),
  };
  const cautionParts = summary.filter((s) => s.caution.length).map((s) => `${yearWord(s.year)}${months(s.caution)}`);
  const timing = intent.timing === "good"
    ? timingLine(summary, chart.timeUnknown)
    : intent.timing === "caution" && cautionParts.length
      ? `比較要放慢、多留恢復時間的是${cautionParts.join("和")}。`
      : "";
  const parts = [tr(intent.lead(ctx)), intent.reason ? tr(intent.reason(ctx)) : "", timing]
    .flatMap((text) => sentences(text).slice(0, 1));
  return { answer: parts.slice(0, MAX_SENTENCES).join(""), nextAction: tr(intent.next(ctx)), detail: [] };
}

export function leakFallback(result: AnalysisResult): ComposedCustomerAnswer | null {
  if ((result.locale ?? "zh-Hant") !== "zh-Hant") return null;
  const question = String(result.question ?? "").trim();
  if (!question || CHART_TALK_RE.test(question)) return null;
  // Dedicated answer types keep their own wording.
  if (isStructureQuestion(question) || isTalentQuestion(question) || isJobFitQuestion(question) || isCosmicSymbolicQuestion(question)) return null;
  const { chart } = result;
  const today = new Date();
  const nowYear = today.getFullYear();
  const summary = distinctTimingSummary(chart, "self", [nowYear], [], { year: nowYear, month: today.getMonth() + 1 });
  const grade = gradeOf(summary[0]?.score ?? 0);
  const answer = [
    "這個問題命盤沒辦法直接給出具體答案，只能看你這段時間的整體節奏。",
    verdict("self", "open", grade, yearWord(nowYear), chart),
    timingLine(summary, chart.timeUnknown),
  ].join("");
  return { answer, nextAction: nextStep("self", "choice", summary, question), detail: [] };
}

export function composeCustomerAnswer(result: AnalysisResult): ComposedCustomerAnswer | null {
  const locale = result.locale ?? "zh-Hant";
  if (locale !== "zh-Hant") return null;
  const question = String(result.question ?? "").trim();
  if (!question) return null;
  const intent = matchIntent(question);
  const suspect = intent?.id === "love.suspect" ? intent : null;
  if (suspect) return composeIntent(suspect, result, question);
  const sensitive = highStakes(question);
  if (sensitive) return sensitive;
  if (intent) return composeIntent(intent, result, question);
  if (SPECIAL_RE.test(question) || isStructureQuestion(question) || isTalentQuestion(question) || isJobFitQuestion(question) || isCosmicSymbolicQuestion(question)) return null;
  if (/A\s*[：:].+?B\s*[：:]/s.test(question)) return null;

  const topics = detectTopics(question);
  // Multi-topic questions keep their dedicated per-topic answer (focused-report contract).
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
  const today = new Date();
  const from = req.targetMonths.length ? undefined : { year: today.getFullYear(), month: today.getMonth() + 1 };
  const summary = distinctTimingSummary(result.chart, forecastTopic, years, req.targetMonths, from);
  const grade = gradeOf(summary[0]?.score ?? 0);
  const y = yearWord(summary[0]?.year ?? new Date().getFullYear());

  const generic = topics.length === 0 && form !== "when" && form !== "choice" && !explicitTime
    && !SELFISH_RE.test(question) && !["career", "money", "love", "health", "home"].includes(kind);
  let opener: string;
  if (form === "when") {
    opener = whenOpener(topic, summary);
  } else if (!explicitTime && form !== "choice" && topic === "career") {
    opener = structuralCareer(result.chart);
  } else if (!explicitTime && form !== "choice" && topic === "money") {
    opener = structuralMoney(result.chart);
  } else if (generic) {
    opener = "這個問題命盤沒辦法直接給出具體答案，只能看你這段時間的整體節奏。";
  } else if (!explicitTime && form !== "choice" && topic === "self") {
    opener = "";
  } else {
    opener = verdict(topic, form, grade, y, result.chart);
  }

  const why = generic ? verdict("self", "open", grade, y, result.chart) : topic === "self" && form === "choice" ? "" : reason(topic, result, question);
  const showTiming = generic || explicitTime || form === "choice" || topic === "love" || topic === "health" || topic === "home";
  const cautionParts = summary.filter((s) => s.caution.length).map((s) => `${yearWord(s.year)}${months(s.caution)}`);
  const cautionOnly = cautionParts.length ? `比較不順的是${cautionParts.join("和")}，重要的事盡量避開。` : "";
  const timing = form === "when" ? cautionOnly : showTiming ? timingLine(summary, result.chart.timeUnknown) : "";

  // Hard cap: opener first, then the timing sentence, and the reason fills what is left.
  const openerParts = sentences(opener);
  const timingParts = sentences(timing).slice(0, 1);
  const room = Math.max(0, MAX_SENTENCES - openerParts.length - timingParts.length);
  const whyParts = sentences(why).slice(0, room);
  const answer = [...openerParts, ...whyParts, ...timingParts].slice(0, MAX_SENTENCES).join("");
  if (!answer) return null;

  const detail: string[] = [];
  if (topic === "career") {
    const fullWork = String(result.reading.work ?? "").trim();
    if (fullWork && sentences(fullWork).length > 1) detail.push(`補充｜${fullWork}`);
  }
  return { answer, nextAction: nextStep(topic, generic ? "choice" : form, showTiming ? summary : null, question), detail };
}
