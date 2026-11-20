import type { Locale } from "@/lib/i18n";
import type { SpecialistReading } from "@/lib/specialist-reading";

// One customer-facing conclusion per system. Cards, previews and the paywall show this line
// instead of a raw first paragraph, so the reader sees a result rather than a method note and
// the line is short enough not to be cut off mid-sentence by the card's line clamp.

export type HeadlineSystem = "ziwei" | "qizheng" | "western" | "indian" | "palm" | "numerology";

function sentences(text: string) {
  return text.replace(/\s+/g, " ").trim().split(/(?<=[。！？])\s*|(?<=[.!?])\s+/).filter(Boolean);
}

/** Whole sentences only: first sentence, plus the second when both fit the budget. */
export function leadingSentences(text: string, locale: Locale) {
  const limit = locale === "en" ? 170 : 80;
  const parts = sentences(text);
  if (!parts.length) return "";
  let out = parts[0];
  for (const next of parts.slice(1)) {
    const joined = locale === "en" ? `${out} ${next}` : `${out}${next}`;
    if (joined.length > limit) break;
    out = joined;
  }
  return out;
}

function sectionBody(reading: SpecialistReading, title: RegExp) {
  return reading.sections.find((section) => title.test(section.title))?.body ?? "";
}

function firstWord(cell: string | undefined) {
  return (cell ?? "").trim().split(/\s+/)[0] ?? "";
}

function westernHeadline(reading: SpecialistReading, locale: Locale) {
  const tables = reading.sections.filter((section) => section.table);
  const planets = tables.find((section) => section.table!.headers.length === 5);
  const axes = tables.find((section) => section.table!.rows[0]?.[0] === "ASC");
  const sun = firstWord(planets?.table!.rows[0]?.[1]);
  const moon = firstWord(planets?.table!.rows[1]?.[1]);
  const rising = firstWord(axes?.table!.rows[0]?.[1]);
  if (!sun || !moon) return "";

  const sunLine = planets?.table!.rows[0]?.[4] ?? "";
  if (locale === "en") {
    const style = sunLine.match(/expressed in an? (.+?) style/)?.[1];
    return `Sun in ${sun}, Moon in ${moon}${rising ? `, Rising ${rising}` : ""}.${style ? ` Your core identity runs in a ${style} style.` : ""}`;
  }
  const hans = locale === "zh-Hans";
  const quote = sunLine.match(/[「“]([^」”]+)[」”]/)?.[1];
  const head = `${hans ? "太阳" : "太陽"}${sun}、月亮${moon}${rising ? `、上升${rising}` : ""}。`;
  return quote ? `${head}核心意志以「${quote}」${hans ? "的方式表现。" : "的方式表現。"}` : head;
}

/** Static, honest teaser for the karma chart: its result needs the browser-side D60 calculation. */
export function indianKarmaTeaser(locale: Locale) {
  if (locale === "en") return "Your karma chart reads five inherited habits: core reaction, emotion, duty, resources and relationships.";
  if (locale === "zh-Hans") return "你的业力分盘看五种带来的惯性：核心反应、情绪、责任、资源与关系。";
  return "你的業力分盤看五種帶來的慣性：核心反應、情緒、責任、資源與關係。";
}

export function specialistHeadline(system: HeadlineSystem, reading: SpecialistReading | null, locale: Locale) {
  if (system === "indian") return indianKarmaTeaser(locale);
  if (!reading) return "";
  if (system === "western") return westernHeadline(reading, locale) || leadingSentences(reading.lead, locale);
  if (system === "qizheng") {
    const body = sectionBody(reading, /命局性情|Core temperament/i);
    return body ? leadingSentences(body, locale) : leadingSentences(reading.lead, locale);
  }
  if (system === "palm") {
    const body = sectionBody(reading, /離今生最近|离今生最近|closest to the present/i) || reading.sections[0]?.body || "";
    return body ? leadingSentences(body, locale) : leadingSentences(reading.lead, locale);
  }
  if (system === "numerology") return leadingSentences(reading.sections[0]?.body ?? reading.lead, locale);
  return leadingSentences(reading.lead, locale);
}
