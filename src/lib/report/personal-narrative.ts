import type { AnalysisResult, AppLocale, Element, Pillar, QuestionKind } from "@/lib/bazi/types";
import { inspectAnswerRequirements } from "@/lib/core/answer-contract";
import { buildDecisionReportModel } from "@/lib/report/decision-report-model";
import { PAID_REPORT_STYLE_ID } from "@/lib/report/paid-report-style";

export const PAID_REPORT_NARRATIVE_ID = PAID_REPORT_STYLE_ID;

export type NarrativeRoleKey = "world" | "setting" | "self" | "outlet";

export type NarrativeRole = {
  key: NarrativeRoleKey;
  label: string;
  body: string;
};

export type NarrativeEvidence = {
  label: string;
  trace: string;
};

export type PersonalReportNarrative = {
  contractId: typeof PAID_REPORT_NARRATIVE_ID;
  kicker: string;
  heading: string;
  title: string;
  scene: string;
  roles: NarrativeRole[];
  strengthLabel: string;
  strength: string;
  costLabel: string;
  cost: string;
  evidenceHeading: string;
  evidence: NarrativeEvidence[];
  actionLabel: string;
  action: string;
  disclaimer: string;
};

const ELEMENT_EN: Record<Element, string> = {
  木: "Wood",
  火: "Fire",
  土: "Earth",
  金: "Metal",
  水: "Water",
};

const WORLD = {
  "zh-Hant": {
    木: "青岫", 火: "朱霞", 土: "厚原", 金: "素天", 水: "玄澤",
  },
  "zh-Hans": {
    木: "青岫", 火: "朱霞", 土: "厚原", 金: "素天", 水: "玄泽",
  },
  en: {
    木: "Verdant Ridge", 火: "Vermilion Sky", 土: "Earthen Plain", 金: "Silver Sky", 水: "Dark Waters",
  },
} as const;

const SEASON = {
  "zh-Hant": { spring: "春嵐", summer: "長日", autumn: "秋庭", winter: "寒星", earth: "四隅藏界" },
  "zh-Hans": { spring: "春岚", summer: "长日", autumn: "秋庭", winter: "寒星", earth: "四隅藏界" },
  en: { spring: "Spring Mist", summer: "Long Summer Light", autumn: "Autumn Court", winter: "Winter Stars", earth: "The Turning Ground" },
} as const;

const SUBJECT = {
  "zh-Hant": { 木: "青鸞", 火: "朱雀", 土: "麒麟", 金: "白澤", 水: "應龍" },
  "zh-Hans": { 木: "青鸾", 火: "朱雀", 土: "麒麟", 金: "白泽", 水: "应龙" },
  en: { 木: "Azure Luan", 火: "Vermilion Bird", 土: "Qilin", 金: "Bai Ze", 水: "Yinglong" },
} as const;

const ACTION = {
  "zh-Hant": {
    career: "執簡定局", love: "守界相照", money: "持衡聚流", health: "調息守序", choice: "持盤擇路",
    timing: "候時而行", self: "照見本心", past: "回紋成鏡", home: "安位成居",
  },
  "zh-Hans": {
    career: "执简定局", love: "守界相照", money: "持衡聚流", health: "调息守序", choice: "持盘择路",
    timing: "候时而行", self: "照见本心", past: "回纹成镜", home: "安位成居",
  },
  en: {
    career: "Sets the Plan", love: "Keeps the Boundary", money: "Holds the Balance", health: "Guards the Rhythm", choice: "Chooses the Road",
    timing: "Waits, Then Moves", self: "Faces the Mirror", past: "Reads the Returning Pattern", home: "Makes a Place",
  },
} as const;

function localeOf(result: AnalysisResult): AppLocale {
  return result.locale ?? "zh-Hans";
}

function pillar(result: AnalysisResult, key: Pillar["key"]): Pillar | undefined {
  return result.chart.pillars.find((item) => item.key === key);
}

function monthSeason(branch: string): keyof typeof SEASON.en {
  if (/[寅卯]/.test(branch)) return "spring";
  if (/[巳午]/.test(branch)) return "summer";
  if (/[申酉]/.test(branch)) return "autumn";
  if (/[亥子]/.test(branch)) return "winter";
  return "earth";
}

function visualElement(result: AnalysisResult): Element {
  const useful = Array.isArray(result.chart.useful) ? result.chart.useful : [];
  if (!result.chart.usefulProvisional && useful.length) return useful[0];
  const dayMasterElement = result.chart.dayMasterElement;
  return dayMasterElement && dayMasterElement in ELEMENT_EN ? dayMasterElement : "土";
}

function strengthPhrase(result: AnalysisResult, locale: AppLocale): string {
  const tendency = String(result.chart.strength?.tendency ?? "");
  const strong = /強|强|旺/.test(tendency);
  const weak = /弱|衰/.test(tendency);
  if (locale === "en") return strong ? "a strongly supported core" : weak ? "a lightly supported core" : "a mixed support pattern";
  if (locale === "zh-Hant") return strong ? "核心承載偏強" : weak ? "核心承載偏輕" : "核心承載有強弱交錯";
  return strong ? "核心承载偏强" : weak ? "核心承载偏轻" : "核心承载有强弱交错";
}

function firstUseful(lines: string[], fallback: string): string {
  return lines.map((line) => line.trim()).find(Boolean) ?? fallback;
}

function periodEvidence(result: AnalysisResult, locale: AppLocale): NarrativeEvidence | null {
  const req = inspectAnswerRequirements(result.question);
  const relevant = req.asksWhen || ["timing", "career", "love", "money", "home"].includes(result.reading.kind);
  if (!relevant || result.chart.timeUnknown || !result.chart.currentDayun) return null;
  const cycle = result.chart.currentDayun;
  if (locale === "en") {
    return {
      label: "Current period",
      trace: `The active long-period window (${cycle.startYear}–${cycle.endYear}) is checked together with the requested timing; it adjusts emphasis but does not replace the natal pattern.`,
    };
  }
  if (locale === "zh-Hant") {
    return {
      label: "當期校正",
      trace: `目前大運 ${cycle.ganZhi}（${cycle.startYear}–${cycle.endYear}）與本題時間一起覆核；它只調整當期重點，不取代原局。`,
    };
  }
  return {
    label: "当期校正",
    trace: `目前大运 ${cycle.ganZhi}（${cycle.startYear}–${cycle.endYear}）与本题时间一起复核；它只调整当期重点，不取代原局。`,
  };
}

function buildEnglishNarrative(result: AnalysisResult): PersonalReportNarrative {
  const model = buildDecisionReportModel(result);
  const year = pillar(result, "year");
  const month = pillar(result, "month");
  const day = pillar(result, "day");
  const time = pillar(result, "time");
  const element = visualElement(result);
  const season = SEASON.en[monthSeason(result.chart.monthBranch)];
  const world = `${season} over ${WORLD.en[year?.ganElement ?? element]}`;
  const subject = SUBJECT.en[element];
  const actionImage = ACTION.en[result.reading.kind as QuestionKind];
  const title = `${world} · ${subject} ${actionImage}`;
  const timeReady = !result.chart.timeUnknown && Boolean(time?.ready);
  const period = periodEvidence(result, "en");
  const reason = firstUseful(model.reasons, result.reading.rhythm);
  const risk = firstUseful(model.risks, model.biggestVariable);
  const action = firstUseful(model.actions, result.reading.action);

  return {
    contractId: PAID_REPORT_NARRATIVE_ID,
    kicker: "",
    heading: "Scene",
    title,
    scene: `This is one continuous image, not four disconnected pillar cards: ${world} forms the world, ${subject} carries the central tension, and “${actionImage}” turns the reading into a practical movement.`,
    roles: [
      { key: "world", label: "World", body: `The birth-year layer and the ${season.toLowerCase()} seasonal setting create the distance, light and atmosphere. They set context rather than deciding personality on their own.` },
      { key: "setting", label: "Setting", body: `The birth-month layer is read with the full chart and this question about ${model.contract.decisionTarget}; it becomes the place where the issue is actually lived.` },
      { key: "self", label: "Central figure", body: `${subject} is a symbolic stand-in for the core pattern, chosen from the full support pattern and the ${ELEMENT_EN[element]} visual direction—not from zodiac shorthand.` },
      { key: "outlet", label: "Way forward", body: timeReady ? `The birth-hour layer is allowed to shape the movement only after the full chart and the practical action agree.` : `The birth hour is unconfirmed, so the scene does not invent a fixed future object; the outlet comes only from the practical action supported by this reading.` },
    ],
    strengthLabel: "What it can do",
    strength: reason,
    costLabel: "What it can cost",
    cost: risk,
    evidenceHeading: "Basis",
    evidence: [
      { label: "World", trace: `Birth-year elements plus the birth-month seasonal setting → external atmosphere → ${world}.` },
      { label: "Central figure", trace: `${strengthPhrase(result, "en")} plus the full-chart ${ELEMENT_EN[element]} visual direction → way of carrying the issue → ${subject}.` },
      { label: "Movement", trace: `${timeReady ? "Confirmed birth-hour layer plus" : "No birth-hour claim; only"} the question target and the practical action → real-world outlet → ${actionImage}.` },
      ...(period ? [period] : []),
    ],
    actionLabel: "Next step",
    action,
    disclaimer: "The image is supplementary and cannot be used to infer chart structure, useful elements or outcomes in reverse. The written reading is the reference.",
  };
}

function buildChineseNarrative(result: AnalysisResult, locale: "zh-Hant" | "zh-Hans"): PersonalReportNarrative {
  const model = buildDecisionReportModel(result);
  const year = pillar(result, "year");
  const month = pillar(result, "month");
  const day = pillar(result, "day");
  const time = pillar(result, "time");
  const element = visualElement(result);
  const world = `${SEASON[locale][monthSeason(result.chart.monthBranch)]}${WORLD[locale][year?.ganElement ?? element]}`;
  const subject = SUBJECT[locale][element];
  const actionImage = ACTION[locale][result.reading.kind as QuestionKind];
  const title = `《${world}・${subject}・${actionImage}》`;
  const timeReady = !result.chart.timeUnknown && Boolean(time?.ready);
  const period = periodEvidence(result, locale);
  const reason = firstUseful(model.reasons, result.reading.rhythm);
  const risk = firstUseful(model.risks, model.biggestVariable);
  const action = firstUseful(model.actions, result.reading.action);
  const hant = locale === "zh-Hant";
  const chartFacts = `${year?.ganZhi ?? "—"}／${month?.ganZhi ?? "—"}／${day?.ganZhi ?? "—"}`;

  return {
    contractId: PAID_REPORT_NARRATIVE_ID,
    kicker: "",
    heading: "命象",
    title,
    scene: hant
      ? `這不是把四柱拆成四張卡：${world}成為天地，${subject}承接核心張力，「${actionImage}」把整份判讀收束成一個可落實的動作。`
      : `这不是把四柱拆成四张卡：${world}成为天地，${subject}承接核心张力，“${actionImage}”把整份判读收束成一个可落实的动作。`,
    roles: [
      {
        key: "world",
        label: hant ? "天地底色" : "天地底色",
        body: hant
          ? `年柱與月令共同決定遠景、光線與季節感；它們只交代你所處的外部底色，不單獨替你定性。`
          : `年柱与月令共同决定远景、光线与季节感；它们只交代你所处的外部底色，不单独替你定性。`,
      },
      {
        key: "setting",
        label: hant ? "現實場域" : "现实场域",
        body: hant
          ? `月柱放回整局，再與這次的「${model.contract.decisionTarget}」同讀，轉成問題真正發生的場景；不是用單一十神替人生貼標籤。`
          : `月柱放回整局，再与这次的“${model.contract.decisionTarget}”同读，转成问题真正发生的场景；不是用单一十神替人生贴标签。`,
      },
      {
        key: "self",
        label: hant ? "核心主體" : "核心主体",
        body: hant
          ? `${subject}只是一個視覺主體：它由日柱、${strengthPhrase(result, locale)}與全局的「${element}」視覺方向共同推導，不由生肖或單柱直接換成神獸。`
          : `${subject}只是一个视觉主体：它由日柱、${strengthPhrase(result, locale)}与全局的“${element}”视觉方向共同推导，不由生肖或单柱直接换成神兽。`,
      },
      {
        key: "outlet",
        label: hant ? "未來出口" : "未来出口",
        body: timeReady
          ? (hant ? `時柱只有在整局與現實行動一致後，才用來決定畫面的動勢與法器質地。` : `时柱只有在整局与现实行动一致后，才用来决定画面的动势与法器质地。`)
          : (hant ? `時辰未定，所以畫面不補造固定法器或晚景結論；出口只保留這份報告已支持的現實行動。` : `时辰未定，所以画面不补造固定法器或晚景结论；出口只保留这份报告已支持的现实行动。`),
      },
    ],
    strengthLabel: hant ? "這股力量能做到" : "这股力量能做到",
    strength: reason,
    costLabel: hant ? "同一股力量的代價" : "同一股力量的代价",
    cost: risk,
    evidenceHeading: hant ? "依據" : "依据",
    evidence: [
      {
        label: hant ? "天地" : "天地",
        trace: hant
          ? `年、月、日三柱 ${chartFacts} 與月令 ${result.chart.monthBranch} → 外部氣候與季節重心 → ${world}。`
          : `年、月、日三柱 ${chartFacts} 与月令 ${result.chart.monthBranch} → 外部气候与季节重心 → ${world}。`,
      },
      {
        label: hant ? "主體" : "主体",
        trace: hant
          ? `日柱 ${day?.ganZhi ?? "未定"}＋${strengthPhrase(result, locale)}＋全局視覺方向 ${element} → 承載問題的方式 → ${subject}。`
          : `日柱 ${day?.ganZhi ?? "未定"}＋${strengthPhrase(result, locale)}＋全局视觉方向 ${element} → 承载问题的方式 → ${subject}。`,
      },
      {
        label: hant ? "動作" : "动作",
        trace: timeReady
          ? (hant
            ? `時柱 ${time?.ganZhi}＋本題目標「${model.contract.decisionTarget}」＋已支持的行動 → 未來出口 → ${actionImage}。`
            : `时柱 ${time?.ganZhi}＋本题目标“${model.contract.decisionTarget}”＋已支持的行动 → 未来出口 → ${actionImage}。`)
          : (hant
            ? `時辰未定＋本題目標「${model.contract.decisionTarget}」 → 不從時柱加結論，只保留現實行動 → ${actionImage}。`
            : `时辰未定＋本题目标“${model.contract.decisionTarget}” → 不从时柱加结论，只保留现实行动 → ${actionImage}。`),
      },
      ...(period ? [period] : []),
    ],
    actionLabel: "下一步",
    action,
    disclaimer: hant
      ? "圖像只作輔助，不能反推格局、喜用或吉凶；文字判讀為準。"
      : "图像只作辅助，不能反推格局、喜用或吉凶；文字判读为准。",
  };
}

export function buildPersonalReportNarrative(result: AnalysisResult): PersonalReportNarrative {
  const locale = localeOf(result);
  return locale === "en" ? buildEnglishNarrative(result) : buildChineseNarrative(result, locale);
}

export function renderPersonalReportNarrativeText(narrative: PersonalReportNarrative): string {
  const roleText = narrative.roles.map((role) => `${role.label}｜${role.body}`);
  const evidenceText = narrative.evidence.map((item) => `${item.label}｜${item.trace}`);
  return [
    narrative.heading,
    narrative.title,
    narrative.scene,
    ...roleText,
    `${narrative.strengthLabel}｜${narrative.strength}`,
    `${narrative.costLabel}｜${narrative.cost}`,
    narrative.evidenceHeading,
    ...evidenceText,
    `${narrative.actionLabel}｜${narrative.action}`,
    narrative.disclaimer,
  ].join("\n\n");
}
