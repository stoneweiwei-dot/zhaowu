import { buildTimingAnswer, buildTravelDestinationAnswer, pickTravelDestinations, type ForecastTopic } from "@/lib/bazi/forecast";
import { HIDDEN, tenGod } from "@/lib/bazi/calendar";
import { analyzeStructure, isStructureQuestion } from "@/lib/bazi/structure";
import type { Chart, QuestionKind, Reading } from "@/lib/bazi/types";
import { customerDirectAnswer } from "@/lib/report/customer-copy";

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

const WHEN_RE = /(什麼時候|什么时候|何時|何时|哪年|哪一年|哪月|幾月|几月|日期|多久|幾年|几年|時機|时机|窗口|應期|应期|今年|明年|後年|后年|這個月|这个月|本月|今月|上半年|下半年|年初|年底|季度|季|近期|最近)/;
const WHERE_RE = /(去哪|去哪里|去哪裡|哪個城市|哪个城市|哪個國家|哪个国家|哪個地方|哪个地方|哪裡最好|哪里最好|什麼方向|什么方向|哪個方向|哪个方向|住哪|搬去哪)/;
const COMPARE_RE = /(還是|还是|或者|二選一|二选一|哪一個|哪一个|哪個比較|哪个比较|選哪|选哪|比較好|比较好|該不該|该不该|要不要)/;
const STRENGTH_RE = /(身強|身强|身弱|強弱|强弱|旺衰|日主.{0,8}(強|强|弱)|五行.{0,8}(能量|比例|占比|大小)|能量.{0,8}(大小|強|强|弱))/;
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
const TALENT_RE = /(天賦|天赋|天生擅長|天生擅长|擅長什麼|擅长什么|強項|强项|能力特長|能力特长|優勢能力|优势能力|talent|aptitude|natural\s+strength)/i;
const JOB_FIT_RE = /(適合|适合).{0,8}(什麼|什么|哪種|哪种|哪類|哪类).{0,8}(工作|職業|职业|職位|职位|崗位|岗位)|(適合做|适合做).{0,8}(工作|職業|职业|什麼|什么)|職業方向|职业方向|career\s+fit|what\s+(?:job|career)/i;

export function isTalentQuestion(question: string): boolean {
  return TALENT_RE.test(question);
}

export function isJobFitQuestion(question: string): boolean {
  return JOB_FIT_RE.test(question);
}

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

const SUPPORT_GODS = new Set(["比肩", "劫財", "劫财", "正印", "偏印", "日主"]);
const OUTPUT_GODS = new Set(["食神", "傷官", "伤官"]);
const WEALTH_GODS = new Set(["正財", "正财", "偏財", "偏财"]);
const OFFICER_GODS = new Set(["正官", "七殺", "七杀"]);

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
  if (/(這個月|这个月|本月|今月)/.test(question)) years.push(now);
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
  if (/(這個月|这个月|本月|今月)/.test(question)) months.push(new Date().getMonth() + 1);

  return uniqueSorted(months.filter((m) => m >= 1 && m <= 12));
}

function isRealComparison(question: string): boolean {
  return COMPARE_RE.test(question) && !STRENGTH_RE.test(question);
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
  if (isTalentQuestion(question)) return "self";
  if (isJobFitQuestion(question)) return "career";
  if (STRENGTH_RE.test(question)) return "self";
  if (isRealComparison(question)) return "choice";
  if (HOME_TOPIC_RE.test(question)) return "home";
  if (HEALTH_TOPIC_RE.test(question)) return "health";
  if (LOVE_TOPIC_RE.test(question)) return "love";
  if (CAREER_TOPIC_RE.test(question)) return "career";
  if (MONEY_TOPIC_RE.test(question)) return "money";
  if (WHEN_RE.test(question) || targetYears(question).length > 0 || targetMonths(question).length > 0) return "timing";
  return fallback;
}

export function inspectAnswerRequirements(question: string): AnswerRequirements {
  const years = targetYears(question);
  const months = targetMonths(question);
  if (!years.length && months.length) years.push(new Date().getFullYear());
  const asksWhen = WHEN_RE.test(question) || years.length > 0 || months.length > 0;
  const asksTravel = TRAVEL_RE.test(question);
  return {
    asksWhen,
    asksWhere: WHERE_RE.test(question),
    asksCompare: isRealComparison(question),
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
  const topics = detectedTopics(question);
  if (kind === "career" && topics.includes("career")) return "career";
  if (kind === "money" && topics.includes("money")) return "money";
  if (kind === "love" && topics.includes("love")) return "love";
  if (kind === "health" && topics.includes("health")) return "health";
  if (kind === "home" && topics.includes("home")) return "home";
  return topics[0] ?? kind;
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

function godEffect(god: string): { score: number; verb: string } {
  if (SUPPORT_GODS.has(god)) return { score: 1, verb: "扶身" };
  if (OUTPUT_GODS.has(god)) return { score: -1, verb: "泄身" };
  if (WEALTH_GODS.has(god)) return { score: -1, verb: "耗身" };
  if (OFFICER_GODS.has(god)) return { score: -1, verb: "制身" };
  return { score: 0, verb: "中性" };
}

function ganZhiStrengthEffect(gz: string, dayStem: string): { score: number; detail: string } {
  if (!gz || gz.length < 2) return { score: 0, detail: "未定" };
  const gan = gz[0];
  const zhi = gz[1];
  const stemGod = tenGod(dayStem, gan);
  const stemEffect = godEffect(stemGod);
  const hidden = HIDDEN[zhi] ?? [];
  const hiddenEffects = hidden.map((hiddenGan) => {
    const god = tenGod(dayStem, hiddenGan);
    const effect = godEffect(god);
    return { god, effect, text: `${hiddenGan}${god}${effect.verb}` };
  });
  const hiddenDirection = hiddenEffects.reduce((sum, item) => sum + Math.sign(item.effect.score), 0);
  const score = Math.sign(stemEffect.score) + Math.sign(hiddenDirection);
  return {
    score,
    detail: `${gz}：天干${gan}${stemGod}${stemEffect.verb}${hiddenEffects.length ? `；地支${zhi}藏${hiddenEffects.map((x) => x.text).join("、")}` : ""}`,
  };
}

function currentStrengthConclusion(base: string, dayunScore: number, yearScore: number): string {
  const netDirection = Math.sign(dayunScore) + Math.sign(yearScore);
  if (base.includes("旺")) {
    if (netDirection <= -2) return "原局仍屬偏旺；當前大運與流年都偏向泄耗／制約，旺勢被明顯拉回，但不能因此直接判成身弱，也不能只靠歲運改判原局。";
    if (netDirection >= 2) return "原局仍屬偏旺；當前大運與流年又偏向扶身，旺勢更容易被放大。";
    return "原局仍屬偏旺；歲運方向有分歧或力度不足，不改判原局，不能因此直接判成身弱。";
  }
  if (base.includes("弱")) {
    if (netDirection >= 2) return "原局偏弱，當前大運與流年都偏向扶身，承載正在改善，但不因此倒改原局。";
    if (netDirection <= -2) return "原局偏弱，當前大運與流年又偏向泄耗／制約，承載壓力更明顯。";
    return "原局仍以偏弱為底，歲運方向有分歧或力度不足，不改判原局。";
  }
  if (netDirection >= 2) return "原局接近中和，當前歲運整體偏向扶身。";
  if (netDirection <= -2) return "原局接近中和，當前歲運整體偏向泄耗／制約。";
  return "原局接近中和，當前歲運方向不一致，不強行改判。";
}

function strengthAnswer(question: string, chart: Chart): string {
  const dayunGz = chart.currentDayun?.ganZhi ?? "";
  const dayun = ganZhiStrengthEffect(dayunGz, chart.dayMaster);
  const year = ganZhiStrengthEffect(chart.currentYear, chart.dayMaster);
  const dayunLine = chart.currentDayun
    ? `當前大運：${dayun.detail}。`
    : "當前大運未能可靠排出，因此不拿它改判旺衰。";
  const yearLine = `流年：${year.detail}。`;
  return `直接結論：原局日主${chart.dayMaster}${chart.dayMasterElement}的旺衰底盤是「${chart.strength.tendency}」。${currentStrengthConclusion(chart.strength.tendency, dayun.score, year.score)} ${dayunLine}${yearLine}判身強身弱只走月令與根氣 → 大運 → 流年；不再輸出五行計數百分比，也不把數量當旺衰。`;
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

type TalentProfile = {
  ability: string;
  manifestations: string;
};

const TALENT_BY_TEN_GOD: Record<string, TalentProfile> = {
  比肩: { ability: "獨立完成與自主判斷", manifestations: "自己負責的專案、個人專業、需要清楚邊界與決斷的工作" },
  劫財: { ability: "協作整合與調動資源", manifestations: "跨人協作、共同項目、客戶與資源協調" },
  食神: { ability: "把知識、技術或想法整理成穩定輸出", manifestations: "教學、內容、服務設計、產品化與流程化" },
  傷官: { ability: "找出問題並改進、表達與設計解法", manifestations: "優化、企劃、創作、顧問與需要自主判斷的工作" },
  正財: { ability: "穩定執行並把專業轉成可重複成果", manifestations: "營運、專業服務、長期客戶、成本與品質管理" },
  偏財: { ability: "辨識機會並連結人與資源", manifestations: "開拓、商務合作、多方協調與機會型項目" },
  正官: { ability: "在明確標準下承責、組織與落地", manifestations: "管理、制度型工作、專業資格與責任清楚的職位" },
  七殺: { ability: "在壓力與時限下快速抓重點、做決定", manifestations: "攻堅、危機處理、競爭環境與結果導向的任務" },
  正印: { ability: "研究、吸收、整理複雜資訊並建立方法", manifestations: "深入學習、研究、教學、知識管理與專業支援" },
  偏印: { ability: "深挖冷門或複雜問題並做專門判斷", manifestations: "研究、技術診斷、跨領域整合與高專門化工作" },
};

const TALENT_BY_PATTERN: Array<[RegExp, string]> = [
  [/殺印相生|杀印相生|官殺配印|官杀配印/, "另一條可見能力，是在壓力或規則中先吸收資訊，再抓重點、形成判斷"],
  [/食神制殺|食神制杀/, "另一條可見能力，是把壓力拆成步驟，轉成可交付的解法"],
  [/傷官配印|伤官配印/, "另一條可見能力，是用研究與專業基礎支撐改進、表達和設計"],
  [/食傷生財|食伤生财/, "另一條可見能力，是把專業輸出轉成可計價的服務、產品或流程"],
  [/財生官殺|财生官杀/, "另一條可見能力，是先整合資源，再承擔清楚的責任與結果"],
];

function talentParts(chart: Chart) {
  const structure = analyzeStructure(chart);
  const profile = TALENT_BY_TEN_GOD[structure.monthTenGod];
  const pattern = structure.supportingPattern
    ? TALENT_BY_PATTERN.find(([re]) => re.test(structure.supportingPattern))?.[1] ?? ""
    : "";
  return { structure, profile, pattern };
}

function talentAnswer(chart: Chart): string {
  const { structure, profile, pattern } = talentParts(chart);
  if (!profile) {
    return "目前已接入的結構證據不足以可靠列出具體天賦，所以這一題先留白，不拿格局名稱或性格模板硬湊能力。";
  }
  const second = pattern
    ? `常見表現會在${profile.manifestations}；${pattern}。`
    : `常見表現會在${profile.manifestations}。`;
  return `較有盤面依據的天賦，是${profile.ability}。${second}依據是月令主氣的功能落在${structure.monthTenGod}${structure.supportingPattern ? `，並有「${structure.supportingPattern}」這條可見主線` : ""}；這是命理推論，不等同已被現實證明的能力。`;
}

function talentEvidence(chart: Chart): string {
  const { structure, profile, pattern } = talentParts(chart);
  if (!profile) return "目前沒有足夠的針對性結構證據支持更細的能力判斷，因此不補無關模板。";
  return `依據：月令主氣落${structure.monthTenGod}，主要支持「${profile.ability}」；${pattern ? `${pattern}。` : "目前沒有第二條足夠清楚的做功主線，因此不硬加另一項天賦。"}真正是否構成你的強項，仍要以實際作品、學習速度、穩定輸出與外部回饋驗證。`;
}

function jobFitAnswer(chart: Chart): string {
  const { structure, profile, pattern } = talentParts(chart);
  if (!profile) {
    return "目前已接入的結構證據不足以可靠列出適合的工作類型，所以先不拿格局名稱硬套職業。";
  }
  return `較適合優先看的工作類型，是${profile.manifestations}。${pattern ? `${pattern}，因此比起只靠固定流程，更適合有明確問題可解、有成果可交付的職位。` : "先選責任清楚、能持續累積專業成果的職位。"}依據是月令主氣落在${structure.monthTenGod}${structure.supportingPattern ? `，並有「${structure.supportingPattern}」這條可見主線` : ""}；這只回答工作功能與環境，不憑命盤硬指定唯一職業。`;
}

function jobFitEvidence(chart: Chart): string {
  const { structure, profile, pattern } = talentParts(chart);
  if (!profile) return "目前沒有足夠的針對性結構證據支持更細的職業方向，因此不補職業清單。";
  return `依據：月令主氣的功能落${structure.monthTenGod}，對應到工作側是「${profile.ability}」；${pattern ? `${pattern}。` : "沒有第二條足夠清楚的做功主線，所以不再追加職業標籤。"}實際選工作仍要再比較收入、負荷、成長空間、責任與退出成本。`;
}

function topicalAnswer(reading: Reading): string {
  // R6.1: interpret.directAnswer 已經是按原問題生成的主回答，不能再被
  // reading.work / love / money 等「整盤主題摘要」覆蓋。
  return reading.directAnswer;
}

function multiTopicAnswer(question: string, topics: ForecastTopic[], reading: Reading): string {
  const parts = topics.map((topic) => `${TOPIC_LABEL[topic] ?? topic}｜${readingForTopic(topic, reading)}`);
  return `你問的是「${cleanQuestion(question)}」。你明確要求同時看多個領域，所以分開回答：${parts.join("　")}`;
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
  return `你問的是「${cleanQuestion(question)}」。你同時問到多個領域的時間，所以分開排：${parts.join("　")}`;
}

function actionFor(question: string, kind: QuestionKind, req: AnswerRequirements, chart: Chart): string {
  if (isTalentQuestion(question)) {
    return "拿最近三件你做得又快又穩、而且別人會主動找你處理的事，對照上面的能力；沒有現實證據支持的項目先不算天賦。";
  }
  if (isJobFitQuestion(question)) {
    return "把你正在考慮的職位按「工作內容、收入、負荷、成長、決策權、退出成本」逐項對照；只有工作功能吻合而現實條件也過關，才算適合。";
  }
  if (isStructureQuestion(question)) {
    return "先核對主格的月令、透干、根氣、病藥與反證；格局名稱只是結果，不用多個格名堆出專業感。";
  }
  if (STRENGTH_RE.test(question)) {
    return "旺衰只按三層核對：先定原局月令與根氣，再看大運扶泄制化，最後看流年是否把趨勢放大或拉回；不要再用五行個數直接等同身強身弱。";
  }
  if (req.asksMedicalTiming) {
    return "把症狀、持續時間、已做檢查與醫生建議放在同一頁；命盤只補充生活節奏，不代替醫療時間表。";
  }
  if (req.asksTravel) {
    const picks = pickTravelDestinations(chart, req.targetYears[0], req.targetMonths);
    const first = picks[0]?.name ?? "較順目的地";
    const second = picks[1]?.name ?? "備選一";
    const third = picks[2]?.name ?? "備選二";
    const windowText = req.asksWhen ? "報告列出的較順月份" : "最近可以出行的窗口";
    return `現在就訂：主選${first}，備選${second}、${third}。用${windowText}把${first}行程定下來。`;
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
    case "choice": return "先確認這個二選一比較要求是否有兩組可比條件；若沒有，就把兩個選項的收入、距離、責任和退出成本放在同一張表再核對。";
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
  const multiTopic = topics.length > 1;

  // R6.1 默認保留 interpret() 對原問題生成的直接答案；只有明確需要的
  // 專項模組才覆蓋。只要原問題同時點名兩個以上領域，就必須逐項作答，
  // 不能因為缺少「分別／各自」字樣而把其中一個主題吞掉。
  let directAnswer = multiTopic
    ? multiTopicAnswer(question, topics, reading)
    : topicalAnswer(reading);

  if (isTalentQuestion(question)) {
    directAnswer = talentAnswer(chart);
  } else if (isJobFitQuestion(question)) {
    directAnswer = jobFitAnswer(chart);
  } else if (isStructureQuestion(question)) {
    directAnswer = analyzeStructure(chart).directAnswer;
  } else if (STRENGTH_RE.test(question)) {
    directAnswer = strengthAnswer(question, chart);
  } else if (req.asksMedicalTiming) {
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
    const where = buildTravelDestinationAnswer(chart, req.targetYears, {
      months: req.targetMonths,
      question,
    });
    directAnswer = `你問的是「${cleanQuestion(question)}」。先直接回答：${[where, timing].filter(Boolean).join(" ")}`;
  } else if (special === "relation") {
    directAnswer = relationAnswer(question, chart, reading, req);
  } else if (req.asksWhen && multiTopic) {
    directAnswer = multiTopicTimingAnswer(question, chart, topics, req);
  } else if (req.asksWhen) {
    directAnswer = `你問的是「${cleanQuestion(question)}」。先直接回答時間：${buildTimingAnswer(chart, topic, req.targetYears, { months: req.targetMonths })}`;
  } else if (kind === "home" && req.asksWhere) {
    directAnswer = homeLocationAnswer(question, chart, reading);
  } else if (req.asksCompare) {
    directAnswer = reading.directAnswer;
  }

  return {
    ...reading,
    kind,
    directAnswer: customerDirectAnswer(question, directAnswer),
    rhythm: isTalentQuestion(question) ? talentEvidence(chart) : isJobFitQuestion(question) ? jobFitEvidence(chart) : reading.rhythm,
    action: actionFor(question, kind, req, chart),
  };
}
