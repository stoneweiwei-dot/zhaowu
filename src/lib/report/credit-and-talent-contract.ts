/**
 * 昭梧报告生成逻辑补丁
 * 目标：修复「信用分／天赋」答非所问、直断缺失、散文绕话
 *
 * 接入点：
 * - answer-contract.ts 的 inferQuestionKind / applyAnswerContract
 * - direct-answer-guard.ts
 * - question-relevance-guard.ts
 * - customer-answer-hotfix.ts（已接入）
 */

import type { Chart, QuestionKind, Reading } from "@/lib/bazi/types";

// ─────────────────────────────────────────────
// 1. 问题分类增强
// ─────────────────────────────────────────────

const CREDIT_RE =
  /(信用分|信用評分|信用评级|信用額度|信用额度|徵信|征信|信貸|信贷|還款能力|还款能力|信用紀錄|信用记录|credit\s*score|credit\s*rating)/i;

const TALENT_RE =
  /(天賦|天赋|天生擅長|天生擅长|擅長什麼|擅长什么|強項|强项|能力特長|能力特长|優勢能力|优势能力|talent|aptitude|natural\s+strength)/i;

const JOB_FIT_RE =
  /(適合|适合).{0,8}(什麼|什么|哪種|哪种|哪類|哪类).{0,8}(工作|職業|职业|職位|职位|崗位|岗位)|(適合做|适合做).{0,8}(工作|職業|职业|什麼|什么)|職業方向|职业方向|career\s+fit|what\s+(?:job|career)/i;

export function isCreditQuestion(question: string): boolean {
  return CREDIT_RE.test(question);
}

export function isTalentQuestion(question: string): boolean {
  return TALENT_RE.test(question);
}

export function isJobFitQuestion(question: string): boolean {
  return JOB_FIT_RE.test(question);
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

// ─────────────────────────────────────────────
// 2. 天赋画像（按月令十神）
// ─────────────────────────────────────────────

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

function monthTenGod(chart: Chart): string {
  const monthPillar = chart.pillars.find((pillar) => pillar.key === "month");
  return monthPillar?.hide[0]?.shiShen || monthPillar?.shiShenGan || "";
}

function talentAnswer(chart: Chart): string {
  const god = monthTenGod(chart);
  const profile = TALENT_BY_TEN_GOD[god];
  if (!profile) {
    return "直接結論：目前結構證據不足以可靠列出具體天賦，本題先留白，不拿格局名稱或性格模板硬湊能力。";
  }
  return `直接結論：較有盤面依據的天賦是「${profile.ability}」。常見表現在${profile.manifestations}。這是命理推論，仍要用實際作品與外部回饋驗證。`;
}

// ─────────────────────────────────────────────
// 3. 信用分专用回答
// ─────────────────────────────────────────────

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

function creditAnswer(chart: Chart, _question: string): string {
  const { level, reason } = creditLevelFromChart(chart);
  if (level === "條件不足") {
    return `直接結論：本題資料不足以給出可靠信用分判斷。${reason}`;
  }
  const action =
    level === "偏高"
      ? "現在可做：維持穩定還款與收入證明，避免短時間內多頭申請。"
      : level === "偏低"
        ? "現在可做：先清高息負債、固定還款日、控制新申請次數，用 3–6 個月還款紀錄拉回節奏。"
        : "現在可做：核對收入穩定性與負債比，把還款自動化，避免臨時透支。";

  return `直接結論：就命盤節奏看，你的信用承載偏向「${level}」。${reason}${action}命盤只看財務節奏與承壓，不能替代銀行徵信分數。`;
}

// ─────────────────────────────────────────────
// 4. 统一直断生成
// ─────────────────────────────────────────────

export function buildSpecialDirectAnswer(
  question: string,
  chart: Chart,
  _reading: Reading,
): string | null {
  if (isCreditQuestion(question)) return creditAnswer(chart, question);
  if (isTalentQuestion(question)) return talentAnswer(chart);
  if (isJobFitQuestion(question)) {
    const god = monthTenGod(chart);
    const profile = TALENT_BY_TEN_GOD[god];
    if (!profile) {
      return "直接結論：現有資料不足以可靠列出適合的工作類型，先不硬套職業。";
    }
    return `直接結論：較適合優先看的工作類型是${profile.manifestations}。這些方向比較符合目前能可靠讀出的工作方式。先選責任清楚、能持續累積成果的職位，再對照收入與退出成本。`;
  }
  return null;
}

// ─────────────────────────────────────────────
// 5. 答案结构强制器
// ─────────────────────────────────────────────

export type StructuredAnswer = {
  direct: string;
  rating: "⭐" | "🔮" | "😐" | "💔";
  ratingText: string;
  reasons: [string, string, string];
  action: string;
  timing?: string;
};

const RATING_MAP: Record<CreditLevel, { symbol: StructuredAnswer["rating"]; text: string }> = {
  偏高: { symbol: "⭐", text: "可以做" },
  中等: { symbol: "🔮", text: "能做，但要等時機／穩節奏" },
  偏低: { symbol: "😐", text: "待觀察，條件尚未齊" },
  條件不足: { symbol: "😐", text: "待觀察，條件尚未齊" },
};

export function structureCreditAnswer(chart: Chart): StructuredAnswer {
  const { level, reason } = creditLevelFromChart(chart);
  const rating = RATING_MAP[level];
  return {
    direct: `命盤不能推算銀行信用分；若只看財務節奏，目前偏向「${level}」。`,
    rating: rating.symbol,
    ratingText: rating.text,
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

export function structureTalentAnswer(chart: Chart): StructuredAnswer {
  const god = monthTenGod(chart);
  const profile = TALENT_BY_TEN_GOD[god];
  if (!profile) {
    return {
      direct: "目前結構證據不足以可靠列出具體天賦。",
      rating: "😐",
      ratingText: "待觀察，條件尚未齊",
      reasons: ["現有出生資料不足以穩定定位主要能力取向。", "不拿性格模板硬湊能力。", "需補完整出生資料後再判。"],
      action: "先補齊出生時辰與城市，再重問天賦。",
    };
  }
  return {
    direct: `較有盤面依據的天賦是「${profile.ability}」。`,
    rating: "⭐",
    ratingText: "可以做",
    reasons: [
      "出生月所呈現的主要能力取向與這類能力一致。",
      `常見表現：${profile.manifestations}。`,
      "需用實際作品與外部回饋驗證，不能只靠命盤認定。",
    ],
    action: `優先把時間投在「${profile.manifestations}」相關的可交付成果上，用 30–90 天作品驗證。`,
  };
}

export function renderStructuredAnswer(a: StructuredAnswer): string {
  const reasons = a.reasons.map((r, i) => `${i + 1}. ${r}`).join("");
  const timing = a.timing ? `時機：${a.timing}` : "";
  return [
    `直接結論：${a.direct}`,
    `可成指數：${a.rating} ${a.ratingText}`,
    `三個主要原因：${reasons}`,
    `現在應該做什麼：${a.action}`,
    timing,
  ]
    .filter(Boolean)
    .join("");
}
