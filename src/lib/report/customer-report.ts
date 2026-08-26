import type { AnalysisResult, AppLocale, QuestionKind } from "@/lib/bazi/types";
import { composeFocusedReport, type ReportSection } from "@/lib/report/focused-report";
import { customerCopy } from "@/lib/report/customer-copy";

const ENGLISH_TECHNICAL = /\b(?:bazi|four pillars?|day master|month command|month branch|heavenly stems?|earthly branches?|ten[- ]year cycle|luck pillar|useful god|favourable element|favorable element|seven killings?|direct resource|indirect resource|output star|wealth star|companion star|jia|yi|bing|ding|wu|ji|geng|xin|ren|gui|zi|chou|yin|mao|chen|si|wei|shen|you|xu|hai)\b/i;

function cleanEnglish(value: string): string {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const parts = text.match(/[^.!?]+[.!?]?/g) ?? [text];
  return parts
    .map((part) => part.trim())
    .filter((part) => part && !ENGLISH_TECHNICAL.test(part))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueLines(lines: string[], locale: AppLocale): string[] {
  const seen = new Set<string>();
  return lines
    .map((line) => locale === "en" ? cleanEnglish(line) : customerCopy(line))
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      const key = line.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function englishTopic(kind: QuestionKind, result: AnalysisResult): string {
  switch (kind) {
    case "career": return result.reading.work;
    case "love": return result.reading.love;
    case "money": return result.reading.money;
    case "health": return result.reading.body;
    case "home": return result.reading.home;
    case "choice": return result.reading.rhythm;
    case "timing": return result.reading.rhythm;
    default: return result.reading.rhythm;
  }
}

function englishTopicTitle(kind: QuestionKind): string {
  switch (kind) {
    case "career": return "What matters for work";
    case "love": return "What to look for";
    case "money": return "What matters financially";
    case "health": return "What to focus on";
    case "home": return "What matters for the move";
    case "choice": return "How to compare the options";
    case "timing": return "Timing";
    default: return "What matters now";
  }
}

function section(
  no: number,
  key: ReportSection["key"],
  title: string,
  body: string[],
): ReportSection {
  return {
    sectionNo: no,
    pageNo: no,
    key,
    title,
    body,
    evidence: { facts: [], conditions: [], limits: [], checks: [] },
  };
}

function composePlainEnglish(result: AnalysisResult): ReportSection[] {
  const { reading, question } = result;
  const direct = uniqueLines([reading.directAnswer], "en");
  const topic = uniqueLines([englishTopic(reading.kind, result)], "en");
  const timing = uniqueLines([reading.rhythm], "en");
  const action = uniqueLines([reading.action], "en");
  const asksTiming = reading.kind === "timing" || /\b(?:when|timing|which month|which year|how soon|this year|next year|next month|next few months)\b/i.test(question);

  const out: ReportSection[] = [];
  if (direct.length) out.push(section(out.length + 1, "conclusion", "Bottom line", direct));
  if (topic.length && topic[0] !== direct[0]) out.push(section(out.length + 1, reading.kind === "love" ? "relationship" : "basis", englishTopicTitle(reading.kind), topic));
  if (asksTiming && timing.length && !out.some((item) => item.body.some((line) => timing.includes(line)))) {
    out.push(section(out.length + 1, "timing", "Timing", timing));
  }
  if (action.length && !out.some((item) => item.body.some((line) => action.includes(line)))) {
    out.push(section(out.length + 1, "action", "What to do next", action));
  }
  return out.slice(0, 4);
}

function compactChinese(sections: ReportSection[], locale: AppLocale): ReportSection[] {
  const out: ReportSection[] = [];
  const globalSeen = new Set<string>();
  for (const source of sections) {
    const body = uniqueLines(source.body, locale).filter((line) => {
      const key = line.replace(/\s+/g, " ");
      if (globalSeen.has(key)) return false;
      globalSeen.add(key);
      return true;
    });
    if (!body.length) continue;
    out.push({ ...source, sectionNo: out.length + 1, pageNo: out.length + 1, body });
  }
  return out.slice(0, 5);
}

/**
 * Customer presentation is deliberately separate from the internal chart engine.
 * English is written as plain local-language guidance, not as translated Bazi terminology.
 */
export function buildCustomerReportSections(result: AnalysisResult): ReportSection[] {
  const locale = result.locale ?? "zh-Hans";
  if (locale === "en") return composePlainEnglish(result);
  return compactChinese(composeFocusedReport(result), locale);
}

/** The persisted/exportable full-report text must match the same customer-facing sections shown on screen. */
export function composeCustomerReportText(result: AnalysisResult): string {
  const locale = result.locale ?? "zh-Hans";
  const heading = locale === "en"
    ? "ZHAOWU | Personal report"
    : locale === "zh-Hant"
      ? "昭梧｜專屬完整報告"
      : "昭梧｜专属完整报告";
  const body = buildCustomerReportSections(result)
    .map((item) => `${item.title}\n${item.body.join("\n")}`)
    .join("\n\n")
    .trim();
  return `${heading}\n\n${body}`.trim();
}
