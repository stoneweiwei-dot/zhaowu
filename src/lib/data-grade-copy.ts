import type { DataGrade, DataGradeParts, DataGradeReason } from "@/lib/bazi/data-grade";

export type GradeLocale = "zh-Hant" | "zh-Hans" | "en";

type Copy = {
  label: Record<DataGrade, string>;
  prefix: string;
  timeWithheld: string;
  timeCaveat: string;
  jieInDay: string;
  jieNear: string;
  placeUnverified: string;
  candidateConflict: string;
  closing: string;
  ack: string;
  ackNeeded: string;
  footerTitle: string;
};

const COPY: Record<GradeLocale, Copy> = {
  "zh-Hant": {
    label: {
      A: "A 級：出生時間取自正式紀錄，精確到分鐘",
      B: "B 級：出生時間精確到時辰，未經證件驗證",
      C: "C 級：出生時間未知或僅知大概",
    },
    prefix: "資料可信度",
    timeWithheld: "時柱、命宮、身宮與大運起運不作論斷；本報告僅依年、月、日三柱，不用午時之類的預設值替代。",
    timeCaveat: "與時柱、命宮、身宮相關的結論可信度有限，請以出生紀錄核對後再作定論。",
    jieInDay: "你的出生日當天恰有節氣交接，月柱（若為立春則含年柱）無法在不知時間時確定，已不作論斷。",
    jieNear: "出生時間貼近節氣交接，月柱可能因時間誤差而不同，相關結論附註保留。",
    placeUnverified: "出生地未能確認，未校正真太陽時，時辰邊界附近的判斷可能偏移。",
    candidateConflict: "民用時間與真太陽時落在不同時辰或日界，已列為待驗證候選，定盤須以出生紀錄為準。",
    closing: "我們不以不完整的資料製造虛假的精確。",
    ack: "我已了解資料可信度對報告的影響，並確認繼續。",
    ackNeeded: "請先勾選已了解資料可信度，才能前往付款。",
    footerTitle: "本報告的資料可信度",
  },
  "zh-Hans": {
    label: {
      A: "A 级：出生时间取自正式记录，精确到分钟",
      B: "B 级：出生时间精确到时辰，未经证件验证",
      C: "C 级：出生时间未知或仅知大概",
    },
    prefix: "资料可信度",
    timeWithheld: "时柱、命宫、身宫与大运起运不作论断；本报告仅依年、月、日三柱，不用午时之类的默认值替代。",
    timeCaveat: "与时柱、命宫、身宫相关的结论可信度有限，请以出生记录核对后再作定论。",
    jieInDay: "你的出生日当天恰有节气交接，月柱（若为立春则含年柱）无法在不知时间时确定，已不作论断。",
    jieNear: "出生时间贴近节气交接，月柱可能因时间误差而不同，相关结论附注保留。",
    placeUnverified: "出生地未能确认，未校正真太阳时，时辰边界附近的判断可能偏移。",
    candidateConflict: "民用时间与真太阳时落在不同时辰或日界，已列为待验证候选，定盘须以出生记录为准。",
    closing: "我们不以不完整的资料制造虚假的精确。",
    ack: "我已了解资料可信度对报告的影响，并确认继续。",
    ackNeeded: "请先勾选已了解资料可信度，才能前往付款。",
    footerTitle: "本报告的资料可信度",
  },
  en: {
    label: {
      A: "Grade A: birth time from an official record, to the minute",
      B: "Grade B: birth time known to the two-hour period, not verified against a record",
      C: "Grade C: birth time unknown or only approximate",
    },
    prefix: "Data reliability",
    timeWithheld: "The hour pillar, life palace, body palace and luck-cycle start are not interpreted. This report relies only on the year, month and day pillars and does not substitute a default such as noon.",
    timeCaveat: "Conclusions that depend on the hour pillar, life palace and body palace have limited reliability. Check them against a birth record before treating them as settled.",
    jieInDay: "A solar-term change falls on your birth date, so the month pillar (and the year pillar if it is the start of spring) cannot be fixed without a birth time and is not interpreted.",
    jieNear: "Your birth time is close to a solar-term change, so the month pillar could differ with a small time error. Related conclusions carry a caveat.",
    placeUnverified: "The birthplace could not be confirmed, so true solar time was not corrected. Judgements near a two-hour boundary may shift.",
    candidateConflict: "Civil time and true solar time fall in different two-hour periods or days. Both are listed as candidates to verify; the birth record decides.",
    closing: "We do not manufacture precision from incomplete data.",
    ack: "I understand how data reliability affects this report and want to continue.",
    ackNeeded: "Please tick the box confirming you understand the data reliability before paying.",
    footerTitle: "Data reliability of this report",
  },
};

export function dataGradeLabel(grade: DataGrade, locale: GradeLocale): string {
  return COPY[locale].label[grade];
}

export function dataGradeAckText(locale: GradeLocale) {
  return { ack: COPY[locale].ack, needed: COPY[locale].ackNeeded };
}

export function dataGradeFooterTitle(locale: GradeLocale): string {
  return COPY[locale].footerTitle;
}

/** One line for the headline, then one line per applicable caveat, then the closing line. */
export function dataGradeNoticeLines(
  grade: DataGrade,
  reasons: readonly DataGradeReason[],
  parts: DataGradeParts,
  locale: GradeLocale,
): string[] {
  const c = COPY[locale];
  const open = locale === "en" ? "[" : "【";
  const close = locale === "en" ? "]" : "】";
  const lines = [`${c.prefix}${locale === "en" ? ": " : ""}${open}${c.label[grade]}${close}`];
  if (parts.timePillar === "withheld") lines.push(c.timeWithheld);
  else if (parts.timePillar === "caveat") lines.push(c.timeCaveat);
  if (reasons.includes("jie-within-birth-day")) lines.push(c.jieInDay);
  if (reasons.includes("jie-near-birth-instant")) lines.push(c.jieNear);
  if (reasons.includes("place-unverified")) lines.push(c.placeUnverified);
  if (reasons.includes("true-solar-candidate-conflict")) lines.push(c.candidateConflict);
  lines.push(c.closing);
  return lines;
}
