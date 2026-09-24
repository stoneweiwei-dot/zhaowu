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
    scene: `${world} sets the atmosphere. ${subject} holds the centre, and “${actionImage}” gives the scene its movement.`,
    roles: [
      { key: "world", label: "World", body: `${world} is the outer setting: the conditions around the issue before your own response is considered.` },
      { key: "setting", label: "Setting", body: `The practical focus is ${model.contract.decisionTarget}; this is where the issue is most likely to be felt in real life.` },
      { key: "self", label: "Centre", body: `${subject} represents the way you are carrying this issue right now.` },
      { key: "outlet", label: "Way forward", body: timeReady ? `The way forward stays with the action already supported by this reading.` : `Birth time is unconfirmed, so the distant details stay open; only the supported next step is kept.` },
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
    disclaimer: "The image is supplementary; the written reading is the reference.",
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
    heading: hant ? "命象" : "命象",
    title,
    scene: hant
      ? `${world}鋪開天地，${subject}居中承勢，「${actionImage}」成為畫面最後的動勢。`
      : `${world}铺开天地，${subject}居中承势，“${actionImage}”成为画面最后的动势。`,
    roles: [
      {
        key: "world",
        label: hant ? "天地底色" : "天地底色",
        body: hant
          ? `${world}是這件事的外部底色：先看環境與時勢，再看你如何承接。`
          : `${world}是这件事的外部底色：先看环境与时势，再看你如何承接。`,
      },
      {
        key: "setting",
        label: hant ? "現實場域" : "现实场域",
        body: hant
          ? `這次的重點落在「${model.contract.decisionTarget}」；場景只保留與現實處境直接有關的部分。`
          : `这次的重点落在“${model.contract.decisionTarget}”；场景只保留与现实处境直接有关的部分。`,
      },
      {
        key: "self",
        label: hant ? "核心主體" : "核心主体",
        body: hant
          ? `${subject}代表你在這個問題裡主要的承載方式。`
          : `${subject}代表你在这个问题里主要的承载方式。`,
      },
      {
        key: "outlet",
        label: hant ? "未來出口" : "未来出口",
        body: timeReady
          ? (hant ? `出口只落在這份判讀已支持的現實行動上。` : `出口只落在这份判读已支持的现实行动上。`)
          : (hant ? `時辰未定，遠期細節不寫死；只保留現在能做的下一步。` : `时辰未定，远期细节不写死；只保留现在能做的下一步。`),
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
    actionLabel: hant ? "下一步" : "下一步",
    action,
    disclaimer: hant
      ? "圖像只作輔助，文字判讀為準。"
      : "图像只作辅助，文字判读为准。",
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
