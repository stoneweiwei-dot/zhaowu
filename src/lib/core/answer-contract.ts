import type { Chart, QuestionKind, Reading } from "@/lib/bazi/types";

export type AnswerRequirements = {
  asksWhen: boolean;
  asksWhere: boolean;
  asksCompare: boolean;
  asksTravel: boolean;
  asksMedicalTiming: boolean;
  asksInvestmentPick: boolean;
  targetYears: number[];
};

const WHEN_RE = /(什麼時候|什么时候|何時|何时|哪年|哪一年|哪月|幾月|几月|日期|多久|幾年|几年|時機|时机|窗口|應期|应期)/;
const WHERE_RE = /(去哪|去哪里|去哪裡|哪個城市|哪个城市|哪個國家|哪个国家|哪個地方|哪个地方|哪裡最好|哪里最好|什麼方向|什么方向|哪個方向|哪个方向|住哪|搬去哪)/;
const COMPARE_RE = /(還是|还是|或者|二選一|二选一|哪一個|哪一个|哪個比較|哪个比较|選哪|选哪|比較好|比较好)/;
const TRAVEL_RE = /(度假|旅行|旅遊|旅游|出行|出國|出国|出境|機票|机票|行程|目的地|旅居|vacation|travel|trip)/i;
const MEDICAL_RE = /(手術|手术|治療|治疗|停藥|停药|用藥|用药|復原|恢复|康復|康复|懷孕|怀孕|受孕|病|痛|癌|醫生|医生|醫療|医疗)/;
const INVESTMENT_RE = /(股票|基金|ETF|加密|虛擬幣|虚拟币|比特幣|比特币|期權|期权|彩票|彩券|號碼|号码|買哪|买哪|賣哪|卖哪)/;

function cleanQuestion(question: string): string {
  const q = question.trim().replace(/\s+/g, " ");
  return q.length > 120 ? `${q.slice(0, 120)}…` : q;
}

function targetYears(question: string): number[] {
  const hits = question.match(/(?:19|20|21)\d{2}/g) ?? [];
  return [...new Set(hits.map(Number).filter((n) => n >= 1900 && n <= 2199))];
}

export function inspectAnswerRequirements(question: string): AnswerRequirements {
  const asksTravel = TRAVEL_RE.test(question);
  const asksWhen = WHEN_RE.test(question) || targetYears(question).length > 0;
  return {
    asksWhen,
    asksWhere: WHERE_RE.test(question),
    asksCompare: COMPARE_RE.test(question),
    asksTravel,
    asksMedicalTiming: MEDICAL_RE.test(question) && asksWhen,
    asksInvestmentPick: INVESTMENT_RE.test(question),
    targetYears: targetYears(question),
  };
}

function temporalBoundary(question: string, chart: Chart, req: AnswerRequirements): string {
  const q = cleanQuestion(question);
  const years = req.targetYears.length ? req.targetYears.join("、") : "你問的目標時間";
  return [
    `你問的是「${q}」。`,
    `這題要真正回答時間，必須計算 ${years} 的流年／流月作用鏈，而不是把目前的原局性格句當成應期。`,
    `目前這個結果只保存當前流年干支「${chart.currentYear}」與原局資料，沒有目標年份逐月結果，所以現在不能負責任地給出具體月份、日期，或斷言某一年一定適合／不適合。`,
  ].join("");
}

function destinationBoundary(question: string, req: AnswerRequirements): string {
  const q = cleanQuestion(question);
  return [
    `你問的是「${q}」。`,
    "要回答「去哪裡最好」或比較兩個目的地，至少要有候選地點、經緯度／季節、實際行程條件，以及已完成的取用或專項遷移規則。",
    "目前引擎沒有目的地比較模組，所以不能憑出生盤直接說某個國家、城市或方向一定最好。",
    req.asksCompare ? "如果是在兩個目的地之間二選一，現在也不能用旺衰強弱硬選其中一個。" : "",
  ].filter(Boolean).join("");
}

function medicalTimingBoundary(question: string): string {
  const q = cleanQuestion(question);
  return `你問的是「${q}」。健康恢復、手術、治療、停藥或受孕時間不能由命盤替代醫療判斷；目前引擎也沒有醫療預後模型，因此不能給保證式日期。若症狀持續、惡化或涉及治療安排，先以醫生的診斷與時間表為準。`;
}

function investmentBoundary(question: string): string {
  const q = cleanQuestion(question);
  return `你問的是「${q}」。目前命理引擎只能談財務節奏與風險承載，不能負責任地替你指定某一檔股票、基金、加密資產、彩票或買賣時點，也不會把命盤當收益保證。`;
}

function homeLocationBoundary(question: string, chart: Chart): string {
  const q = cleanQuestion(question);
  const useful = chart.usefulProvisional
    ? "而且正式取用尚未完成，連出生盤生活取象都不能下最終方位。"
    : "即使正式取用已完成，真實住宅仍需平面圖、坐向、採光與周邊道路資料。";
  return `你問的是「${q}」。出生盤不能單獨回答哪一間房、哪個城市或哪個方位最好。${useful}`;
}

function actionFor(kind: QuestionKind, req: AnswerRequirements): string {
  if (req.asksMedicalTiming) {
    return "先把症狀、持續時間、已做檢查與醫生建議列清楚；醫療時間由醫療資料決定，不用命盤替代。";
  }
  if (req.asksTravel && (req.asksWhen || req.asksWhere || req.asksCompare)) {
    return "先固定要比較的年份／月份與 2–3 個候選目的地；在目標年流月和目的地比較模組完成前，不用目前這份報告替你訂票或否定整個年份。";
  }
  if (req.asksWhen) {
    return "先固定你要判斷的事件與目標年份／月份；等目標年流月作用鏈算出來，再談應期，不用通用性格句代替時間答案。";
  }
  if (req.asksInvestmentPick) {
    return "先列可承受虧損、資金期限與退出條件；命盤只作風險節奏參考，不替你指定標的。";
  }
  switch (kind) {
    case "love":
      return "把你真正要核對的關係事件寫成一件可驗證的事：是否主動聯絡、是否約定下一次見面、是否把關係說清楚。";
    case "career":
      return "把職涯問題縮成一個可比較決策：職位、收入、成長、退出成本各寫一欄，再用已接入的命局資料判斷承載。";
    case "money":
      return "先列主收入、固定支出、可承受風險和退出成本；沒有數字前不開新的高風險線。";
    case "health":
      return "把最困擾你的症狀、頻率與生活節奏記錄下來；持續或加重就就醫，命盤只看節奏，不作診斷。";
    case "home":
      return "如果問真實住宅，補平面圖、坐向、採光與周邊道路；沒有這些資料就不做風水結論。";
    case "choice":
      return "把兩個選項的現實條件列成同一張表，再只服務被選中的一條；不能比較的資料就明確留白。";
    case "past":
      return "只核對已排出的四宮與你能驗證的人生經驗；不追加沒有來源的前世故事。";
    case "timing":
      return "先固定事件與目標時間範圍；沒有流年流月計算就不給應期。";
    case "self":
    default:
      return "挑一個你最常重複的行為模式，用最近三次真實事件去核對；對不上就不要硬套。";
  }
}

export function applyAnswerContract(question: string, chart: Chart, reading: Reading): Reading {
  const req = inspectAnswerRequirements(question);
  let directAnswer = reading.directAnswer;

  if (req.asksMedicalTiming) {
    directAnswer = medicalTimingBoundary(question);
  } else if (req.asksTravel && req.asksWhen) {
    directAnswer = `${temporalBoundary(question, chart, req)}${req.asksWhere || req.asksCompare ? destinationBoundary(question, req) : ""}`;
  } else if (req.asksTravel && (req.asksWhere || req.asksCompare)) {
    directAnswer = destinationBoundary(question, req);
  } else if (req.asksWhen) {
    directAnswer = temporalBoundary(question, chart, req);
  } else if (req.asksInvestmentPick) {
    directAnswer = investmentBoundary(question);
  } else if (reading.kind === "home" && req.asksWhere) {
    directAnswer = homeLocationBoundary(question, chart);
  }

  return {
    ...reading,
    directAnswer,
    action: actionFor(reading.kind, req),
  };
}
