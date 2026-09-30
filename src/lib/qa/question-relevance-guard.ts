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
  // 這條「最終客戶端把關」原本一律只留前 5 句（明確同時點名兩個領域才給 8
  // 句），但一個帶時間詞的單一主題問題（例如「我這幾年財運如何」）光是把
  // 2 年份的順／不順月份講完就已經用掉 6 句，等於答案裡真正回答「為什麼」
  // 的結構性內容（reading.work／money／body／love／home）永遠排不進前 5
  // 句，在這裡被整段砍掉——句子有沒有被算進 unique 之前就已經去重，這裡只
  // 是把上限訂得比「兩年時機表」本身還短。上限調寬，不改變去重與相關性判
  // 斷邏輯，短答案（≤原上限）完全不受影響。
  return unique.slice(0, multiTopic ? 12 : 9).join("");
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
