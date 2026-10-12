import type { Locale } from "@/lib/i18n";

export type JourneyStep = 1 | 2 | 3;
export const JOURNEY_COPY: Record<Locale, { title: string; steps: readonly [string, string, string]; hints: readonly [string, string, string] }> = {
  "zh-Hant": { title: "三步開始", steps: ["填資料", "看命書", "問問題"], hints: ["填寫出生日期、時間與城市。", "先看免費概要，細節按需要展開。", "選填想問的事；報告可從「我的報告」重看。"] },
  "zh-Hans": { title: "三步开始", steps: ["填资料", "看命书", "问问题"], hints: ["填写出生日期、时间与城市。", "先看免费概要，细节按需要展开。", "选填想问的事；报告可从“我的报告”重看。"] },
  en: { title: "Start in three steps", steps: ["Birth details", "Read your chart", "Ask a question"], hints: ["Enter your birth date, time and city.", "Read the free summary; open details when needed.", "Ask an optional question. Reopen answers from My reports."] },
};

export function currentJourneyStep(hasBirth: boolean, editing: boolean, asking: boolean): JourneyStep {
  return !hasBirth || editing ? 1 : asking ? 3 : 2;
}
