import type { AppLocale, Chart, Reading } from "./types";
import { ganzhiLabel } from "./presentation";

function isThreeYuanQuestion(question: string): boolean {
  if (/胎元|身宮|身宫|三垣/.test(question)) return true;
  return /命宮|命宫/.test(question) && !/紫微/.test(question);
}

function localizedReliability(value: Chart["minggongReliability"], locale: AppLocale): string {
  if (locale === "en") {
    if (value === "low-medium") return "low-to-moderate confidence";
    if (value === "low") return "low confidence";
    return "not available";
  }
  if (locale === "zh-Hans") {
    if (value === "low-medium") return "低至中等可信度";
    if (value === "low") return "低可信度";
    return "不作判定";
  }
  if (value === "low-medium") return "低至中等可信度";
  if (value === "low") return "低可信度";
  return "不作判定";
}

export function applyThreeYuanAuxiliaryPolicy(
  question: string,
  chart: Chart,
  reading: Reading,
  localeInput?: AppLocale,
): Reading {
  if (!isThreeYuanQuestion(question)) return reading;
  const locale: AppLocale = localeInput ?? "zh-Hant";
  const askTaiyuan = /胎元/.test(question) || /三垣/.test(question);
  const askMinggong = /命宮|命宫/.test(question) || /三垣/.test(question);
  const askShengong = /身宮|身宫/.test(question) || /三垣/.test(question);

  const taiyuan = ganzhiLabel(chart.taiyuan, locale);
  const minggong = ganzhiLabel(chart.minggong, locale);
  const minggongSolar = ganzhiLabel(chart.minggongSolar ?? chart.minggong, locale);
  const shengong = ganzhiLabel(chart.shengong ?? "未定", locale);
  const reliability = localizedReliability(chart.minggongReliability, locale);
  const monthConflict = Boolean(chart.minggongSolar && chart.minggongSolar !== chart.minggong);

  if (locale === "en") {
    const parts: string[] = [];
    if (askTaiyuan) parts.push(`Tai Yuan: ${taiyuan}`);
    if (askMinggong) {
      parts.push(
        monthConflict
          ? `Life Palace: ${minggong} by the classical lunar-month method; solar-month sensitivity gives ${minggongSolar} (${reliability})`
          : `Life Palace: ${minggong} (${reliability})`,
      );
    }
    if (askShengong) parts.push(`Body Palace: ${shengong} (low-weight auxiliary)`);
    const directAnswer = `${parts.join("; ")}. These are supplementary indicators only and do not override the Four Pillars structure, strength, pattern, remedy logic or useful-element judgement.`;
    const rhythm = `${reading.rhythm}\nAuxiliary rule: Tai Yuan uses month-stem +1 and month-branch +3. The Life Palace uses the classical lunar-month method with a solar-month sensitivity check. The Body Palace follows the “place the body at You” rule; its full stem-branch form is a later fixed research convention. ${chart.threeYuanNote ?? ""}`.trim();
    return { ...reading, directAnswer, rhythm };
  }

  const hans = locale === "zh-Hans";
  const parts: string[] = [];
  if (askTaiyuan) parts.push(`${hans ? "胎元" : "胎元"}：${taiyuan}`);
  if (askMinggong) {
    parts.push(
      monthConflict
        ? `${hans ? "命宫" : "命宮"}：農曆月法 ${minggong}；節令月敏感度為 ${minggongSolar}（${reliability}）`
        : `${hans ? "命宫" : "命宮"}：${minggong}（${reliability}）`,
    );
  }
  if (askShengong) parts.push(`${hans ? "身宫" : "身宮"}：${shengong}（低權重旁證）`);
  const directAnswer = `${parts.join("；")}。這三項只作補證，不得推翻四柱的月令、格局、旺衰、病藥、流通與用神。`;
  const rhythm = `${reading.rhythm}\n三垣旁證規則：胎元固定月干進一、月支進三；命宮採《三命通會》農曆月法並做節令月敏感度校驗；身宮按「逢酉安身」，完整干支只作後世固定研究口徑。${chart.threeYuanNote ?? ""}`;
  return { ...reading, directAnswer, rhythm };
}
