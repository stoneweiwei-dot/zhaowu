import type { Locale } from "@/lib/i18n";

export function quizTitle(locale: Locale) {
  if (locale === "en") return "Life paper";
  if (locale === "zh-Hans") return "人生试卷";
  return "人生試卷";
}

export function quizLead(locale: Locale) {
  if (locale === "en") {
    return "Hand this in like a test: pick a direction, mark your state, write the real question, then add birth details. You get the answer first; the full report comes after.";
  }
  if (locale === "zh-Hans") {
    return "像心理测验一样交卷：先选方向与近况，写下真正想问的事，再填出生资料。交卷后先给答案，再生成完整报告。";
  }
  return "像心理測驗一樣交卷：先選方向與近況，寫下真正想問的事，再填出生資料。交卷後先給答案，再生成完整報告。";
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
