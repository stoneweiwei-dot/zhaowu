import { buildTimingAnswer, buildTravelDestinationAnswer, type ForecastTopic } from "@/lib/bazi/forecast";
import type { Chart, QuestionKind, Reading } from "@/lib/bazi/types";

export type AnswerRequirements = {
  asksWhen: boolean;
  asksWhere: boolean;
  asksCompare: boolean;
  asksTravel: boolean;
  asksMedicalTiming: boolean;
  asksInvestmentPick: boolean;
  targetYears: number[];
  targetMonths: number[];
};

type SpecialTopic = "relation" | "legal" | "pet" | "fertility" | null;

const WHEN_RE = /(什麼時候|什么时候|何時|何时|哪年|哪一年|哪月|幾月|几月|日期|多久|幾年|几年|時機|时机|窗口|應期|应期|今年|明年|後年|后年|上半年|下半年|年初|年底|季度|季|近期|最近)/;
const WHERE_RE = /(去哪|去哪里|去哪裡|哪個城市|哪个城市|哪個國家|哪个国家|哪個地方|哪个地方|哪裡最好|哪里最好|什麼方向|什么方向|哪個方向|哪个方向|住哪|搬去哪)/;
const COMPARE_RE = /(還是|还是|或者|二選一|二选一|哪一個|哪一个|哪個比較|哪个比较|選哪|选哪|比較好|比较好|該不該|该不该|要不要)/;
const TRAVEL_RE = /(度假|旅行|旅遊|旅游|出行|出國|出国|出境|機票|机票|行程|目的地|旅居|vacation|travel|trip)/i;
const MEDICAL_RE = /(手術|手术|治療|治疗|停藥|停药|用藥|用药|復原|恢复|康復|康复|懷孕|怀孕|受孕|備孕|备孕|生育|生孩子|孩子|病|痛|癌|醫生|医生|醫療|医疗)/;
const INVESTMENT_RE = /(股票|基金|ETF|加密|虛擬幣|虚拟币|比特幣|比特币|期權|期权|彩票|彩券|號碼|号码|買哪|买哪|賣哪|卖哪)/i;
const LEGAL_RE = /(官司|訴訟|诉讼|法律|律師|律师|法院|仲裁|糾紛|纠纷|合約糾紛|合同纠纷|判決|判决|起訴|起诉)/;
const PET_RE = /(寵物|宠物|養貓|养猫|養狗|养狗|適合養|适合养|貓咪|猫咪|狗狗)/;
const FERTILITY_RE = /(懷孕|怀孕|受孕|備孕|备孕|生育|生孩子|要孩子|有孩子)/;
const RELATION_RE = /(父母|爸爸|媽媽|妈妈|母親|母亲|父親|父亲|家人|兄弟|姐妹|姊妹|朋友|友情|人際|人际|同事|合作夥伴|合作伙伴|客戶|客户|貴人|贵人|小人)/;

const PAST_TOPIC_RE = /(前世|前三世|六道|輪迴|轮回|一掌經|一掌经|三世因果)/;
const HOME_TOPIC_RE = /(家宅|搬家|房子|住宅|店面|風水|风水|買屋|买屋|買房|买房|住哪|坐向|戶型|户型)/;
const HEALTH_TOPIC_RE = /(健康|病|痛|醫療|医疗|手術|手术|失眠|身體|身体|復原|恢复|康復|康复|睡不著|睡不着|懷孕|怀孕|受孕|備孕|备孕|生育)/;
const LOVE_TOPIC_RE = /(感情|戀愛|恋爱|愛情|爱情|交往|正緣|正缘|婚姻|結婚|结婚|伴侶|伴侣|桃花|復合|复合|分手|緣分|缘分|喜歡|喜欢|男友|女友|約會|约会|曖昧|暧昧|對象|对象)/;
const CAREER_TOPIC_RE = /(工作|職業|职业|事業|事业|轉職|转职|跳槽|離職|离职|辭職|辞职|升遷|升迁|升職|升职|職場|职场|公司|職位|职位|上班|面試|面试|創業|创业|老闆|老板|offer|薪水|薪資|薪资|工資|工资|學業|学业|學習|学习|考試|考试|升學|升学|留學|留学|學校|学校|大學|大学|研究所|博士|證照|证照)/i;
const MONEY_TOPIC_RE = /(財運|财运|財務|财务|錢|钱|收入|投資|投资|理財|理财|債務|债务|存錢|存钱|虧|亏|賺|赚|股票|基金|ETF|加密|比特幣|比特币)/i;

const TOPIC_LABEL: Partial<Record<ForecastTopic, string>> = {
  love: "感情",
  career: "工作／事業／學業",
  money: "財務",
  health: "身心節奏",
  home: "家宅",
  self: "個人節奏",
  travel: "旅行",
};

const CHINESE_MONTHS: Record<string, number> = {
  一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6,
  七: 7, 八: 8, 九: 9, 十: 10, 十一: 11, 十二: 12,
};

function cleanQuestion(question: string): string {
  const q = question.trim().replace(/\s+/g, " ");
  return q.length > 160 ? `${q.slice(0, 160)}…` : q;
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

function targetYears(question: string): number[] {
  const now = new Date().getFullYear();
  const years = (question.match(/(?:19|20|21)\d{2}/g) ?? [])
    .map(Number)
    .filter((n) => n >= 1900 && n <= 2199);

  if (/(今年|本年)/.test(question)) years.push(now);
  if (/明年/.test(question)) years.push(now + 1);
  if (/(大後年|大后年)/.test(question)) years.push(now + 3);
  else if (/(後年|后年)/.test(question)) years.push(now + 2);
  if (/去年/.test(question)) years.push(now - 1);

  return uniqueSorted(years);
}

function targetMonths(question: string): number[] {
  const months: number[] = [];
  for (const hit of question.matchAll(/(?:^|\D)(1[0-2]|0?[1-9])\s*月/g)) {
    months.push(Number(hit[1]));
  }
  for (const hit of question.matchAll(/(十二|十一|十|[一二三四五六七八九])月/g)) {
    months.push(CHINESE_MONTHS[hit[1]]);
  }

  if (/上半年/.test(question)) months.push(1, 2, 3, 4, 5, 6);
  if (/下半年/.test(question)) months.push(7, 8, 9, 10, 11, 12);
  if (/(第一季度|第1季度|一季度|Q1)/i.test(question)) months.push(1, 2, 3);
  if (/(第二季度|第2季度|二季度|Q2)/i.test(question)) months.push(4, 5, 6);
  if (/(第三季度|第3季度|三季度|Q3)/i.test(question)) months.push(7, 8, 9);
  if (/(第四季度|第4季度|四季度|Q4)/i.test(question)) months.push(10, 11, 12);
  if (/(春天|春季)/.test(question)) months.push(3, 4, 5);
  if (/(夏天|夏季)/.test(question)) months.push(6, 7, 8);
  if (/(秋天|秋季)/.test(question)) months.push(9, 10, 11);
  if (/(冬天|冬季)/.test(question)) months.push(12, 1, 2);
  if (/年初/.test(question)) months.push(1, 2, 3);
  if (/年底/.test(question)) months.push(11, 12);

  return uniqueSorted(months.filter((m) => m >= 1 && m <= 12));
}

function specialTopic(question: string): SpecialTopic {
  if (FERTILITY_RE.test(question)) return "fertility";
  if (LEGAL_RE.test(question)) return "legal";
  if (PET_RE.test(question)) return "pet";
  if (RELATION_RE.test(question) && !LOVE_TOPIC_RE.test(question)) return "relation";
  return null;
}

export function inferQuestionKind(question: string, fallback: QuestionKind = "self"): QuestionKind {
  if (PAST_TOPIC_RE.test(question)) return "past";
  if (HOME_TOPIC_RE.test(question)) return "home";
  if (HEALTH_TOPIC_RE.test(question)) return "health";
  if (LOVE_TOPIC_RE.test(question)) return "love";
  if (CAREER_TOPIC_RE.test(question)) return "career";
  if (MONEY_TOPIC_RE.test(question)) return "money";
  if (COMPARE_RE.test(question)) return "choice";
  if (WHEN_RE.test(question) || targetYears(question).length > 0 || targetMonths(question).length > 0) return "timing";
  return fallback;
}

export function inspectAnswerRequirements(question: string): AnswerRequirements {
  const years = targetYears(question);
  const months = targetMonths(question);
  const asksWhen = WHEN_RE.test(question) || years.length > 0 || months.length > 0;
  const asksTravel = TRAVEL_RE.test(question);
  return {
    asksWhen,
    asksWhere: WHERE_RE.test(question),
    asksCompare: COMPARE_RE.test(question),
    asksTravel,
    asksMedicalTiming: MEDICAL_RE.test(question) && asksWhen,
    asksInvestmentPick: INVESTMENT_RE.test(question),
    targetYears: years,
    targetMonths: months,
  };
}

function detectedTopics(question: string): ForecastTopic[] {
  const topics: ForecastTopic[] = [];
  if (LOVE_TOPIC_RE.test(question)) topics.push("love");
  if (CAREER_TOPIC_RE.test(question)) topics.push("career");
  if (MONEY_TOPIC_RE.test(question)) topics.push("money");
  if (HEALTH_TOPIC_RE.test(question)) topics.push("health");
  if (HOME_TOPIC_RE.test(question)) topics.push("home");
  return topics;
}

function topicFor(question: string, kind: QuestionKind, req: AnswerRequirements): ForecastTopic {
  if (req.asksTravel) return "travel";
  return detectedTopics(question)[0] ?? kind;
}

function readingForTopic(topic: ForecastTopic, reading: Reading): string {
  switch (topic) {
    case "love": return reading.love;
    case "career": return reading.work;
    case "money": return reading.money;
    case "health": return reading.body;
    case "home": return reading.home;
    default: return reading.directAnswer;
  }
}

function medicalTimingAnswer(question: string, reading: Reading): string {
  const q = cleanQuestion(question);
  return `你問的是「${q}」。命理這裡可以看壓力與生活節奏，但不能把恢復、手術、治療、停藥、受孕或生育做成保證日期。就命盤層面，先看的是：${reading.body}；真正的醫療時間仍以檢查與醫生判斷為準。`;
}

function fertilityAnswer(question: string, reading: Reading): string {
  return `你問的是「${cleanQuestion(question)}」。這涉及備孕／生育，命盤不能替代生殖健康評估，也不能保證能否懷孕。命理層面最多只看生活壓力與節奏：${reading.body}；若要做現實決策，以醫療檢查、年齡、用藥與醫生建議為主。`;
}

function legalAnswer(question: string, reading: Reading): string {
  return `你問的是「${cleanQuestion(question)}」。法律／官司結果不能靠命盤代替證據、程序與律師判斷，也不能保證勝敗。命盤最多只補充你目前的承壓與決策節奏：${reading.rhythm}；真正要優先核對的是期限、證據、合約文字和專業法律意見。`;
}

function relationAnswer(question: string, chart: Chart, reading: Reading, req: AnswerRequirements): string {
  const timing = req.asksWhen
    ? `時間節奏可參考：${buildTimingAnswer(chart, "self", req.targetYears, { months: req.targetMonths })}`
    : "";
  return `你問的是「${cleanQuestion(question)}」。這是家人／朋友／同事等非戀愛關係題，不套正緣或桃花模板。先看你自己的互動節奏：${reading.rhythm}${timing ? ` ${timing}` : ""}對方會怎麼選仍取決於對方本人與現實事件，不能由你的命盤單方面替對方下結論。`;
}

function petAnswer(question: string, chart: Chart, reading: Reading): string {
  if (chart.usefulProvisional) {
    return `你問的是「${cleanQuestion(question)}」。目前正式取用尚未完成，所以不從流通粗候選硬推「最適合哪種寵物、哪個顏色」。如果是現實飼養決策，先看居住空間、過敏、作息、照護成本與動物性格。`;
  }
  return `你問的是「${cleanQuestion(question)}」。命理取象只能當偏好參考：${reading.guide.pet}；真正是否適合飼養仍以空間、時間、健康與照護能力為主。`;
}

function investmentAnswer(question: string, reading: Reading): string {
  const q = cleanQuestion(question);
  return `你問的是「${q}」。如果問題是財務節奏，這張盤能回答：${reading.money}；但如果要我直接指定某一檔股票、基金、加密資產或買賣點，命盤不能替代投資分析，也不把任何標的說成必賺。`;
}

function homeLocationAnswer(question: string, chart: Chart, reading: Reading): string {
  const q = cleanQuestion(question);
  const extra = chart.usefulProvisional
    ? "正式取用尚未完成，所以不硬指定東西南北。"
    : "若要精確到住宅，仍要把平面圖、坐向、採光與道路一起看。";
  return `你問的是「${q}」。先回答能回答的部分：${reading.home}${extra}`;
}

function topicalAnswer(question: string, kind: QuestionKind, reading: Reading): string {
  const q = cleanQuestion(question);
  switch (kind) {
    case "love": return `你問的是「${q}」。${reading.love}`;
    case "career": return `你問的是「${q}」。${reading.work}`;
    case "money": return `你問的是「${q}」。${reading.money}`;
    case "health": return `你問的是「${q}」。${reading.body}`;
    case "home": return `你問的是「${q}」。${reading.home}`;
    default: return reading.directAnswer;
  }
}

function multiTopicAnswer(question: string, topics: ForecastTopic[], reading: Reading): string {
  const parts = topics.map((topic) => `${TOPIC_LABEL[topic] ?? topic}｜${readingForTopic(topic, reading)}`);
  return `你問的是「${cleanQuestion(question)}」。這題同時包含多個主題，我分開回答，不把它們混成一句：${parts.join("　")}`;
}

function multiTopicTimingAnswer(
  question: string,
  chart: Chart,
  topics: ForecastTopic[],
  req: AnswerRequirements,
): string {
  const parts = topics.map((topic) => {
    const answer = buildTimingAnswer(chart, topic, req.targetYears, { months: req.targetMonths });
    return `${TOPIC_LABEL[topic] ?? topic}｜${answer}`;
  });
  return `你問的是「${cleanQuestion(question)}」。這題同時問了不同領域的時間，我分開排，不用一個月份套全部：${parts.join("　")}`;
}

function compareNote(kind: QuestionKind, reading: Reading): string {
  const base = kind === "career" ? reading.work
    : kind === "love" ? reading.love
      : kind === "money" ? reading.money
        : kind === "home" ? reading.home
          : reading.directAnswer;
  return `這題同時有二選一／比較要求。命盤可以先給你的承載背景：${base}；但如果兩個選項本身的收入、距離、責任、關係狀態或其他現實條件沒有分開提供，就不能假裝已經比較過兩邊。`;
}

function actionFor(kind: QuestionKind, req: AnswerRequirements): string {
  if (req.asksMedicalTiming) {
    return "把症狀、持續時間、已做檢查與醫生建議放在同一頁；命盤只補充生活節奏，不代替醫療時間表。";
  }
  if (req.asksTravel) {
    return "先用報告挑出的較順月份定旅行窗口；若要精確比較目的地，再放入 2–3 個具體城市，不再用通用性格句代替答案。";
  }
  if (req.asksWhen) {
    return req.targetMonths.length
      ? "先在你指定的月份範圍內比較高低，再把現實條件疊上去；不要拿全年平均替代你真正問的時間段。"
      : "先用報告列出的前三個月份做窗口，再把現實條件疊上去，不再把整年一刀切成好或壞。";
  }
  if (req.asksInvestmentPick) {
    return "把可承受虧損、資金期限與退出條件寫清楚；命盤只看財務節奏，不替你指定標的。";
  }
  switch (kind) {
    case "love": return "只核對一件可驗證的關係事件：對方是否主動、是否安排下一次見面、是否把關係說清楚。";
    case "career": return "把職位、收入、成長、退出成本放在同一張表，再做決策。";
    case "money": return "先列主收入、固定支出、可承受風險與退出成本，再談擴張。";
    case "health": return "把症狀頻率與作息記錄下來；持續或加重就就醫。";
    case "home": return "真實住宅要補平面圖、坐向、採光與周邊道路，不憑一句八字亂定風水。";
    case "choice": return "把兩個選項的現實條件放在同一張表，只比較同一組標準。";
    case "past": return "只核對已排出的四宮，不追加沒有來源的前世故事。";
    default: return "把這個結論拿最近三次真實事件核對，對不上就不要硬套。";
  }
}

export function applyAnswerContract(question: string, chart: Chart, reading: Reading): Reading {
  const req = inspectAnswerRequirements(question);
  const kind = inferQuestionKind(question, reading.kind);
  const topic = topicFor(question, kind, req);
  const topics = detectedTopics(question);
  const special = specialTopic(question);
  let directAnswer = topics.length > 1
    ? multiTopicAnswer(question, topics, reading)
    : topicalAnswer(question, kind, reading);

  if (req.asksMedicalTiming) {
    directAnswer = medicalTimingAnswer(question, reading);
  } else if (special === "fertility") {
    directAnswer = fertilityAnswer(question, reading);
  } else if (special === "legal") {
    directAnswer = legalAnswer(question, reading);
  } else if (special === "pet") {
    directAnswer = petAnswer(question, chart, reading);
  } else if (req.asksInvestmentPick) {
    directAnswer = investmentAnswer(question, reading);
  } else if (req.asksTravel) {
    const timing = req.asksWhen
      ? buildTimingAnswer(chart, "travel", req.targetYears, { months: req.targetMonths })
      : "";
    const where = req.asksWhere || req.asksCompare
      ? buildTravelDestinationAnswer(chart, req.targetYears, { months: req.targetMonths })
      : "";
    const fallback = !timing && !where ? buildTimingAnswer(chart, "travel", req.targetYears, { months: req.targetMonths }) : "";
    directAnswer = `你問的是「${cleanQuestion(question)}」。先直接回答：${[timing, where, fallback].filter(Boolean).join(" ")}`;
  } else if (special === "relation") {
    directAnswer = relationAnswer(question, chart, reading, req);
  } else if (req.asksWhen && topics.length > 1) {
    directAnswer = multiTopicTimingAnswer(question, chart, topics, req);
  } else if (req.asksWhen) {
    directAnswer = `你問的是「${cleanQuestion(question)}」。先直接回答時間：${buildTimingAnswer(chart, topic, req.targetYears, { months: req.targetMonths })}`;
  } else if (kind === "home" && req.asksWhere) {
    directAnswer = homeLocationAnswer(question, chart, reading);
  } else if (req.asksCompare) {
    directAnswer = `你問的是「${cleanQuestion(question)}」。${compareNote(kind, reading)}`;
  }

  return {
    ...reading,
    kind,
    directAnswer,
    action: actionFor(kind, req),
  };
}
