import type { AppLocale, Chart, QuestionKind, Reading } from "@/lib/bazi/types";
import { customerCopy } from "@/lib/report/customer-copy";
import { detectQaIntent, directAnswerCoversQuestion } from "@/lib/qa/answer-quality";

function tr(locale: AppLocale | undefined, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function sentences(value: string) {
  return (customerCopy(value).match(/[^。！？!?]+[。！？!?]?/g) ?? [customerCopy(value)])
    .map((item) => item.trim())
    .filter(Boolean);
}

function compact(value: string, question: string) {
  const parts = sentences(value);
  const seen = new Set<string>();
  const unique = parts.filter((part) => {
    const key = part.replace(/[\s，,、。！？!?；;：:（）()「」『』]/g, "").toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const multiTopic = /(感情.*工作|工作.*感情|工作.*財|工作.*财|財.*工作|财.*工作|感情.*財|感情.*财|財.*感情|财.*感情)/.test(question);
  return unique.slice(0, multiTopic ? 8 : 5).join("");
}

function topicBody(kind: QuestionKind, reading: Reading) {
  switch (kind) {
    case "career": return reading.work;
    case "love": return reading.love;
    case "money": return reading.money;
    case "health": return reading.body;
    case "home": return reading.home;
    case "timing": return reading.rhythm;
    case "past": return reading.lastLine;
    default: return reading.rhythm;
  }
}

function honestFallback(kind: QuestionKind, reading: Reading, locale?: AppLocale) {
  const body = compact(topicBody(kind, reading), "");
  const prefix = tr(
    locale,
    "這一題目前沒有足夠的針對性證據支持更精確的結論，所以不補無關模板。能可靠回答到的是：",
    "这一题目前没有足够的针对性证据支持更精确的结论，所以不补无关模板。能可靠回答到的是：",
    "The current evidence is not specific enough for a more precise conclusion, so unrelated template material is omitted. What can be supported is: ",
  );
  return `${prefix}${body}`;
}

/**
 * Final customer-facing QA gate.
 * It never recalculates the chart. It only prevents an answer that missed the
 * user's actual question from being padded with unrelated material.
 */
export function enforceQuestionRelevance(
  question: string,
  chart: Chart,
  reading: Reading,
  locale?: AppLocale,
): Reading {
  void chart;
  const kind = detectQaIntent(question, reading.kind);
  const cleaned = compact(reading.directAnswer, question);
  const directAnswer = directAnswerCoversQuestion(question, cleaned)
    ? cleaned
    : honestFallback(kind, reading, locale);

  return {
    ...reading,
    kind,
    directAnswer,
    action: compact(reading.action, question),
  };
}
