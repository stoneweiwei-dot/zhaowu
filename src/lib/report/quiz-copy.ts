import type { Locale } from "@/lib/i18n";

export function quizTitle(locale: Locale) {
  if (locale === "en") return "Life paper";
  if (locale === "zh-Hans") return "人生试卷";
  return "人生試卷";
}

export function quizLead(locale: Locale) {
  if (locale === "en") {
    return "Write the question you actually want answered, then add birth details. You get the answer first; the full report comes after.";
  }
  if (locale === "zh-Hans") {
    return "把真正想问的事直接写下，再填出生资料。交卷后先给答案，再生成完整报告。";
  }
  return "把真正想問的事直接寫下，再填出生資料。交卷後先給答案，再生成完整報告。";
}

export function quizSubmit(locale: Locale, busy: boolean) {
  if (busy) {
    if (locale === "en") return "Reading your paper…";
    if (locale === "zh-Hans") return "正在阅卷…";
    return "正在閱卷…";
  }
  if (locale === "en") return "Hand in the paper";
  return "交卷，看答案";
}

export function quizResultKicker(locale: Locale) {
  if (locale === "en") return "Your paper result";
  return "卷面答案";
}
