/**
 * 昭梧报告生成逻辑补丁
 * 目标：修复「信用分／天赋／适合的工作」答非所问、直断缺失、散文绕话
 *
 * 原则（站主 2026-10-08）：客人问了什么，就尽可能得到对应的答案。
 * - 问题与答案的主体必须一致：问的是别人，不能用本人命盘冒充作答。
 * - 复合问题（例如「天赋是什么、适合做什么工作」）每一问都要有答案。
 * - 问到专项（例如「音乐才华」「适合创业吗」）要明确回应该专项，不能只丢通用模板。
 *
 * 接入点：customer-answer-hotfix.ts（已接入，统一走 buildContractAnswer）
 */

import type { Chart, QuestionKind, Reading } from "@/lib/bazi/types";
import { isJobFitQuestion, isTalentQuestion } from "@/lib/core/answer-contract";

// ─────────────────────────────────────────────
// 1. 问题分类
// ─────────────────────────────────────────────

// 天赋 / 工作适配的判定词只在 core/answer-contract.ts 维护一份，这里转出，避免两处漂移。
export { isJobFitQuestion, isTalentQuestion };

const CREDIT_RE =
  /(信用分|信用評分|信用评分|信用評級|信用评级|信用額度|信用额度|徵信|征信|信貸|信贷|還款能力|还款能力|信用紀錄|信用记录|信用(?:好|壞|坏|差|高|低|等級|等级|狀況|状况|怎麼樣|怎么样|如何|夠不夠|够不够|可靠)|拒貸|拒贷|(?:貸款|贷款|房貸|房贷|車貸|车贷).{0,6}(?:批|過不過|过不过|通過|通过|被拒|下得來|下得来|順利|顺利)|credit\s*(?:score|rating|history))/i;

const LOAN_RE = /(拒貸|拒贷|貸款|贷款|房貸|房贷|車貸|车贷|信貸|信贷|批核|獲批|获批|批不批|過不過|过不过)/;

export function isCreditQuestion(question: string): boolean {
  return CREDIT_RE.test(question);
}

/**
 * 在 inferQuestionKind 里优先调用：
 * if (isCreditQuestion(q)) return "money";
 * if (isTalentQuestion(q)) return "self";
 * if (isJobFitQuestion(q)) return "career";
 */
export function forceQuestionKind(question: string, fallback: QuestionKind): QuestionKind {
  if (isCreditQuestion(question)) return "money";
  if (isTalentQuestion(question)) return "self";
  if (isJobFitQuestion(question)) return "career";
  return fallback;
}

// 问的是别人（孩子、伴侣、朋友……）而不是提问者本人：这张盘读不出对方的答案。
const THIRD_PARTY_NOUN =
  "孩子|小孩|兒子|儿子|女兒|女儿|子女|老公|老婆|丈夫|妻子|太太|先生|男友|女友|對象|对象|伴侶|伴侣|前任|父母|爸爸|媽媽|妈妈|父親|父亲|母親|母亲|兄弟|姐妹|姊妹|弟弟|妹妹|哥哥|姐姐|朋友|同事|老闆|老板|合作夥伴|合作伙伴|客戶|客户|員工|员工|學生|学生";
const THIRD_PARTY_RE = new RegExp(
  `(${THIRD_PARTY_NOUN})(?:的?(?:天賦|天赋|才華|才华|強項|强项|信用|工作|職業|职业)|(?:有(?:什麼|什么|沒有|没有|無)?|會|会|能|適合|适合|擅長|擅长|信用|是否|可以))`,
);
const THIRD_PARTY_PRONOUN_RE = /(?<![其他])([他她])(?:的|有|會|会|能|適|适|是)/;
const OWN_SUBJECT_RE =
  /(?:我(?:的)?(?:天賦|天赋|才華|才华|強項|强项|信用|工作|職業|职业|適合|适合|擅長|擅长|有沒有|有没有|會不會|会不会)|本人|自己)/;

export function detectThirdParty(question: string): string | null {
  if (OWN_SUBJECT_RE.test(question)) return null;
  const noun = THIRD_PARTY_RE.exec(question);
  if (noun) return noun[1];
  const pronoun = THIRD_PARTY_PRONOUN_RE.exec(question);
  return pronoun ? pronoun[1] : null;
}

// 天赋题里的专项：「音乐才华」「天赋适合创业吗」。抓不干净就不抓，宁可不识别也不乱认。
const FOCUS_REJECT_RE = /[我你妳他她有是什麼什么哪嗎吗到底怎麼怎么如何這这那該该某還还或和跟與与]/;
const STARTUP_RE = /創業|创业|做生意|生意|開店|开店|副業|副业/;
const FOCUS_STOP = new Set(["先天", "天生", "生來", "生来", "真正", "具體", "具体", "自己", "本身", "哪方面"]);

function cleanFocus(raw: string): string | null {
  let f = raw.replace(/(?:方面|領域|领域)?的?$/, "").trim();
  // 「孩子的老師」→「老師」：職業名稱前面的修飾語不是要問的職業本身。
  if (f.includes("的")) f = f.slice(f.lastIndexOf("的") + 1);
  if (f.length < 2 || f.length > 8) return null;
  if (FOCUS_REJECT_RE.test(f) || FOCUS_STOP.has(f)) return null;
  return f;
}

export function extractTalentFocus(question: string): string | null {
  const after =
    /(?:天賦|天赋|才華|才华|強項|强项).{0,4}?(?:適合|适合|能不能|可不可以|能否|夠不夠|够不够|可以)(?:做|當|当|從事|从事|去|走)?([\u4e00-\u9fff]{2,8}?)(?:嗎|吗|[?？]|$)/.exec(
      question,
    );
  if (after) {
    const f = cleanFocus(after[1]);
    if (f) return f;
  }
  const before = /^(.*?)(?:天賦|天赋|才華|才华)/.exec(question);
  if (before) {
    const head = before[1].replace(/^.*(?:我的|我有沒有|我有没有|我有無|我有|有沒有|有没有|有無)/, "");
    const f = cleanFocus(head);
    if (f) return f;
  }
  return null;
}

// 具体职业题：「我適合當老師嗎」「適合做設計嗎」。「還是／和」之類的選擇題交給原有的二選一流程。
export function extractJobFocus(question: string): string | null {
  const m =
    /(?:適合|适合)(?:我)?(?:去)?(?:當|当|做|從事|从事|成為|成为|擔任|担任)([\u4e00-\u9fff]{2,8}?)(?:的工作)?(?:嗎|吗|[?？]|$)/.exec(
      question,
    );
  return m ? cleanFocus(m[1]) : null;
}

// ─────────────────────────────────────────────
// 2. 天赋画像（按月令十神）
// ─────────────────────────────────────────────

type TalentProfile = {
  ability: string;
  manifestations: string;
  /** 具体职业方向：客人问「适合做什么工作」时要看到的是可对号入座的职业，而不是抽象描述。 */
  roles: string;
};

const TALENT_BY_TEN_GOD: Record<string, TalentProfile> = {
  比肩: {
    ability: "獨立完成與自主判斷",
    manifestations: "自己負責的專案、個人專業、需要清楚邊界與決斷的工作",
    roles: "獨立專業者、自由工作者、技術專家、個人品牌經營",
  },
  劫財: {
    ability: "協作整合與調動資源",
    manifestations: "跨人協作、共同項目、客戶與資源協調",
    roles: "客戶經理與業務、專案協調、合夥型事業、社群營運",
  },
  食神: {
    ability: "把知識、技術或想法整理成穩定輸出",
    manifestations: "教學、內容、服務設計、產品化與流程化",
    roles: "教師與講師、內容創作、服務設計、產品與流程設計",
  },
  傷官: {
    ability: "找出問題並改進、表達與設計解法",
    manifestations: "優化、企劃、創作、顧問與需要自主判斷的工作",
    roles: "設計師、企劃、顧問、創作者、流程優化",
  },
  正財: {
    ability: "穩定執行並把專業轉成可重複成果",
    manifestations: "營運、專業服務、長期客戶、成本與品質管理",
    roles: "營運管理、財務會計、專業服務、長期客戶經營",
  },
  偏財: {
    ability: "辨識機會並連結人與資源",
    manifestations: "開拓、商務合作、多方協調與機會型項目",
    roles: "商務開發、行銷、貿易、資源整合與投資相關工作",
  },
  正官: {
    ability: "在明確標準下承責、組織與落地",
    manifestations: "管理、制度型工作、專業資格與責任清楚的職位",
    roles: "行政與管理職、制度型機構、法務合規、需專業資格的職位",
  },
  七殺: {
    ability: "在壓力與時限下快速抓重點、做決定",
    manifestations: "攻堅、危機處理、競爭環境與結果導向的任務",
    roles: "專案攻堅、危機處理、競爭型銷售、高強度結果導向行業",
  },
  正印: {
    ability: "研究、吸收、整理複雜資訊並建立方法",
    manifestations: "深入學習、研究、教學、知識管理與專業支援",
    roles: "研究、教育與培訓、顧問諮詢、知識管理、出版與文教",
  },
  偏印: {
    ability: "深挖冷門或複雜問題並做專門判斷",
    manifestations: "研究、技術診斷、跨領域整合與高專門化工作",
    roles: "研發、技術診斷、數據分析、跨領域研究、高專門化的技術職位",
  },
};

function monthTenGod(chart: Chart): string {
  const monthPillar = chart.pillars.find((pillar) => pillar.key === "month");
  return monthPillar?.hide[0]?.shiShen || monthPillar?.shiShenGan || "";
}

// ─────────────────────────────────────────────
// 3. 结构化答案
// ─────────────────────────────────────────────

export type StructuredAnswer = {
  direct: string;
  rating: "⭐" | "🔮" | "😐" | "💔";
  ratingText: string;
  /** 评级行的名称。默认「可成指數」；信用、天赋等不是「能不能做」的题目要用贴合题意的名称。 */
  ratingLabel?: string;
  reasons: [string, string, string];
  action: string;
  timing?: string;
};

type CreditLevel = "偏高" | "中等" | "偏低" | "條件不足";

function creditLevelFromChart(chart: Chart): { level: CreditLevel; reason: string } {
  const strength = String(chart.strength?.tendency ?? "");
  const hasFinancialMarker = chart.pillars.some((pillar) =>
    /正財|偏財/.test(pillar.shiShenGan) || pillar.hide.some((item) => /正財|偏財/.test(item.shiShen))
  );

  if (/旺|強|强/.test(strength) && hasFinancialMarker) {
    return {
      level: "偏高",
      reason: "盤面顯示處理資源與壓力的條件相對穩，但現實信用仍以還款紀錄、負債比與收入證明為準。",
    };
  }
  if (/弱/.test(strength) && !hasFinancialMarker) {
    return {
      level: "偏低",
      reason: "盤面顯示財務壓力較容易放大波動，因此更需要保守管理現金流；這不是銀行信用評分。",
    };
  }
  if (!strength) {
    return { level: "條件不足", reason: "現有資料不足以做命理層面的財務節奏判斷，更不能推算銀行信用分。" };
  }
  return {
    level: "中等",
    reason: "盤面沒有足夠理由把財務節奏說成明顯偏高或偏低；實際信用仍取決於還款紀錄、負債比與收入。",
  };
}

const CREDIT_RATING: Record<CreditLevel, { symbol: StructuredAnswer["rating"]; text: string }> = {
  偏高: { symbol: "⭐", text: "穩定" },
  中等: { symbol: "🔮", text: "一般，以實際還款紀錄為準" },
  偏低: { symbol: "😐", text: "偏吃緊，先穩住現金流" },
  條件不足: { symbol: "😐", text: "資料不足，不下判斷" },
};

export function structureCreditAnswer(chart: Chart, question = ""): StructuredAnswer {
  const { level, reason } = creditLevelFromChart(chart);
  const rating = CREDIT_RATING[level];
  const loan = LOAN_RE.test(question);
  const direct =
    level === "條件不足"
      ? loan
        ? "能否獲批貸款由銀行依徵信紀錄、收入與負債比決定，命盤不能判定，現有資料也不足以判斷財務節奏。"
        : "命盤不能推算銀行信用分，現有資料也不足以判斷財務節奏。"
      : loan
        ? `能否獲批貸款由銀行依徵信紀錄、收入與負債比決定，命盤不能判定；若只看財務節奏，目前偏向「${level}」。`
        : `命盤不能推算銀行信用分；若只看財務節奏，目前偏向「${level}」。`;
  return {
    direct,
    rating: rating.symbol,
    ratingText: rating.text,
    ratingLabel: "財務節奏",
    reasons: [
      reason,
      level === "偏低"
        ? "現金流與壓力波動更容易影響還款穩定性。"
        : "實際銀行分數仍以還款紀錄與負債比為準。",
      "這只是命理層面的財務節奏提示，不能替代徵信系統。",
    ],
    action:
      level === "偏高"
        ? "維持穩定還款與收入證明，避免短期多頭申請。"
        : level === "偏低"
          ? "清高息負債、固定還款日、控制新申請，用 3–6 個月紀錄拉回節奏。"
          : "核對收入穩定性與負債比，還款自動化，避免臨時透支。",
  };
}

const NO_BASIS_REASONS: [string, string, string] = [
  "現有出生資料不足以穩定定位主要能力取向。",
  "不拿性格模板硬湊能力。",
  "需補完整出生資料後再判。",
];

export function structureTalentAnswer(chart: Chart, focus: string | null = null): StructuredAnswer {
  const god = monthTenGod(chart);
  const profile = TALENT_BY_TEN_GOD[god];
  if (!profile) {
    return {
      direct: focus
        ? `目前結構證據不足，無法可靠判斷你在「${focus}」上的天賦。`
        : "目前結構證據不足以可靠列出具體天賦。",
      rating: "😐",
      ratingText: "不足，先不下判斷",
      ratingLabel: "盤面依據",
      reasons: NO_BASIS_REASONS,
      action: "先補齊出生時辰與城市，再重問天賦。",
    };
  }
  // 问到专项时先回应专项：命盘只能读通用能力取向，不能单独证明某个专项，这一点要明说，再给验证办法。
  const startupHint = focus && STARTUP_RE.test(focus) ? `若走創業，較貼合這個能力的起步方向是：${profile.roles}。` : "";
  const direct = focus
    ? `你問的是「${focus}」：命盤能讀到的是通用能力取向「${profile.ability}」，不能單獨證明「${focus}」這個專項；能不能成立，看這個能力能否支撐「${focus}」最核心的工作內容。${startupHint}`
    : `較有盤面依據的天賦是「${profile.ability}」。`;
  return {
    direct,
    rating: "⭐",
    ratingText: focus ? "通用能力有依據，專項需實作驗證" : "明確",
    ratingLabel: "盤面依據",
    reasons: [
      "出生月所呈現的主要能力取向與這類能力一致。",
      `常見表現：${profile.manifestations}。`,
      "需用實際作品與外部回饋驗證，不能只靠命盤認定。",
    ],
    action: focus
      ? `把「${profile.ability}」對照「${focus}」最核心的三項工作內容；吻合的部分用 30–90 天小規模實作驗證，再決定投入多少。`
      : `優先把時間投在「${profile.manifestations}」相關的可交付成果上，用 30–90 天作品驗證。`,
  };
}

const JOB_ALIASES: Array<[RegExp, string[]]> = [
  [/老師|老师|教師|教师|講師|讲师|導師|导师|教授|教練|教练/, ["教"]],
  [/生意|開店|开店|經商|经商/, ["商務", "貿易", "行銷"]],
  [/作家|寫作|写作|編輯|编辑|記者|记者/, ["內容", "出版", "創作"]],
  [/工程師|工程师|程式|程序員|程序员|研發|研发/, ["研發", "技術"]],
  [/會計|会计|財務|财务/, ["財務", "會計"]],
  [/顧問|顾问|諮詢|咨询/, ["顧問", "諮詢"]],
  [/業務|业务|銷售|销售/, ["業務", "銷售", "客戶"]],
  [/設計|设计/, ["設計"]],
  [/管理/, ["管理"]],
  [/研究/, ["研究"]],
];

function jobStems(focus: string): string[] {
  const stems = [focus];
  for (const [re, list] of JOB_ALIASES) if (re.test(focus)) stems.push(...list);
  return stems;
}

export function structureJobFitAnswer(chart: Chart, focus: string | null = null): StructuredAnswer {
  const god = monthTenGod(chart);
  const profile = TALENT_BY_TEN_GOD[god];
  if (!profile) {
    return {
      direct: focus
        ? `目前結構證據不足，無法可靠判斷你適不適合「${focus}」，先不硬套職業。`
        : "現有資料不足以可靠列出適合的職業方向，先不硬套職業。",
      rating: "😐",
      ratingText: "不足，先不下判斷",
      ratingLabel: "盤面依據",
      reasons: NO_BASIS_REASONS,
      action: "先補齊出生時辰與城市，再重問適合的工作。",
    };
  }
  // 只做「正向」比對：職業名稱（含常見同義說法）落在命盤方向或常見表現裡才說貼合；
  // 對不上時不判不適合，只說明要怎麼驗證。
  const fits = focus ? jobStems(focus).some((stem) => `${profile.roles}${profile.manifestations}`.includes(stem)) : false;
  const startupHint = focus && STARTUP_RE.test(focus) ? `若走創業，較貼合的起步方向是：${profile.roles}。` : "";
  const direct = focus
    ? fits
      ? `你問的是「${focus}」：它落在命盤較貼合的職業方向內（${profile.roles}），可列為優先候選。`
      : `你問的是「${focus}」：命盤較貼合的職業方向是：${profile.roles}。「${focus}」不在命盤能單獨確認的方向內，不能直接說適合；要看它的核心工作內容是否落在「${profile.ability}」的範圍。${startupHint}`
    : `較適合優先看的工作類型是：${profile.roles}。`;
  return {
    direct,
    rating: fits || !focus ? "⭐" : "🔮",
    ratingText: !focus ? "明確" : fits ? "貼合" : "需對照核心工作內容",
    ratingLabel: "盤面依據",
    reasons: [
      `這些方向對應的核心能力是「${profile.ability}」，與出生月呈現的能力取向一致。`,
      `工作內容多半落在：${profile.manifestations}。`,
      "適不適合最後還要對照收入、負荷與退出成本，三者都過關才算。",
    ],
    action: focus
      ? `列出「${focus}」最核心的三項工作內容，對照「${profile.ability}」；吻合再用小規模實作或短期兼職驗證，並一併核對收入、負荷與退出成本。`
      : "把你正在考慮的職位，逐項對照工作內容、收入、負荷、成長、決策權與退出成本；工作功能吻合且現實條件過關，才算適合。",
  };
}

// 以空格分段：下游 normalizeReportLine 會把所有空白（含換行）壓成單一空格，
// 所以不用 \n 假裝換行；每段自帶「名稱：」前綴，空格就足以分開。
export function renderStructuredAnswer(a: StructuredAnswer): string {
  const reasons = a.reasons.map((r, i) => `${i + 1}. ${r}`).join(" ");
  const timing = a.timing ? `時機：${a.timing}` : "";
  return [
    `直接結論：${a.direct}`,
    `${a.ratingLabel ?? "可成指數"}：${a.rating} ${a.ratingText}`,
    `三個主要原因：${reasons}`,
    `現在應該做什麼：${a.action}`,
    timing,
  ]
    .filter(Boolean)
    .join(" ");
}

// ─────────────────────────────────────────────
// 4. 统一入口：一个问题 → 对应的答案
// ─────────────────────────────────────────────

type Topic = "talent" | "job" | "credit";

const TOPIC_LABEL: Record<Topic, string> = { talent: "天賦", job: "適合的工作", credit: "信用" };
const THIRD_PARTY_PHRASE: Record<Topic, (who: string) => string> = {
  talent: (who) => `${who}的天賦`,
  job: (who) => `${who}適合的工作`,
  credit: (who) => `${who}的信用`,
};
const TOPIC_KIND: Record<Topic, QuestionKind> = { talent: "self", job: "career", credit: "money" };

export type ContractAnswer = {
  kind: QuestionKind;
  directAnswer: string;
  action: string;
};

function matchedTopics(question: string): Topic[] {
  const topics: Topic[] = [];
  if (isTalentQuestion(question)) topics.push("talent");
  if (isJobFitQuestion(question)) topics.push("job");
  if (isCreditQuestion(question)) topics.push("credit");
  // 具體職業題（適合當老師嗎）；若同時問天賦，專項已由天賦答案回應，不重複加。
  if (!topics.includes("job") && !topics.includes("talent") && extractJobFocus(question)) topics.push("job");
  return topics;
}

/**
 * 信用／天赋／适合的工作 三类题的唯一入口。不属于这三类返回 null，交还给原有管线。
 * - 问别人：明说这张盘读不出对方，并指出怎么才能问到。
 * - 复合题：每个子题各给一段，不丢题。
 * - 天赋专项：先回应专项，再给通用能力与验证办法。
 */
export function buildContractAnswer(question: string, chart: Chart): ContractAnswer | null {
  const topics = matchedTopics(question);
  if (!topics.length) return null;

  const who = detectThirdParty(question);
  if (who) {
    const phrase = topics.map((t) => THIRD_PARTY_PHRASE[t](who)).join("、");
    return {
      kind: TOPIC_KIND[topics[0]],
      directAnswer:
        `直接結論：這張盤是你本人的盤，讀不出${phrase}。` +
        `要看${phrase}，需要用${who}自己的出生年月日時另排一盤再問。`,
      action: `用${who}的生辰另排一盤，再問同一個問題；想看你和${who}之間的相處或合作，可以改問你們的互動。`,
    };
  }

  const piece = (topic: Topic): StructuredAnswer =>
    topic === "credit"
      ? structureCreditAnswer(chart, question)
      : topic === "job"
        ? structureJobFitAnswer(chart, extractJobFocus(question))
        : structureTalentAnswer(chart, topics.includes("job") ? null : extractTalentFocus(question));

  if (topics.length === 1) {
    const answer = piece(topics[0]);
    return { kind: TOPIC_KIND[topics[0]], directAnswer: renderStructuredAnswer(answer), action: answer.action };
  }

  const pieces = topics.map((topic) => ({ topic, answer: piece(topic) }));
  return {
    kind: TOPIC_KIND[pieces[0].topic],
    directAnswer: pieces.map((p) => `【${TOPIC_LABEL[p.topic]}】${renderStructuredAnswer(p.answer)}`).join(" "),
    action: pieces.map((p) => `${TOPIC_LABEL[p.topic]}：${p.answer.action.replace(/[。.]$/, "")}`).join("；") + "。",
  };
}

/** 向后兼容：只要直断文字。 */
export function buildSpecialDirectAnswer(question: string, chart: Chart, _reading: Reading): string | null {
  return buildContractAnswer(question, chart)?.directAnswer ?? null;
}
