import { useI18n, type Locale } from "@/lib/i18n";
import type { AnalysisResult } from "@/lib/bazi/types";
import type { ReportSection } from "@/lib/report/focused-report";
import { MindAdviceComic } from "@/components/mind-advice-comic";
import { ReportVisualBook } from "@/components/report-visual-book";
import { ReportLuckBook } from "@/components/report-luck-book";
import { ReportShareCard } from "@/components/report-share-card";

const COPY = {
  "zh-Hant": {
    title: "你的完整分析",
    lead: "只保留跟你這一問有關的結論、時間和下一步。",
    kicker: "ZHAOWU · PERSONAL ANALYSIS",
    summary: "你現在最需要知道的事",
    body: "身體需要留意",
  },
  "zh-Hans": {
    title: "你的完整分析",
    lead: "只保留跟你这一问有关的结论、时间和下一步。",
    kicker: "ZHAOWU · PERSONAL ANALYSIS",
    summary: "你现在最需要知道的事",
    body: "身体需要留意",
  },
  en: {
    title: "Your full analysis",
    lead: "Only the answer, useful timing and practical next steps for your question.",
    kicker: "ZHAOWU · PERSONAL ANALYSIS",
    summary: "What matters now",
    body: "Body areas to watch",
  },
} as const;

const CHINESE_JARGON = /命[盤盘](?:落點|落点|格局)?|命局|日主|月令|大[運运]|流年|流月|十神|正印|偏印|七[殺杀]|官[殺杀]|食神|傷官|伤官|比肩|劫[財财]|喜用神|忌神|五行生克|五行生剋|[殺杀]印相生|旺衰|身[強强]|身弱|刑[沖冲]合害|納音|纳音/;
const ENGLISH_JARGON = /\b(?:bazi|day master|month command|ten gods?|luck cycle|ten-year cycle|destiny|fate|auspicious|metaphys(?:ic|ical|ics)|cosmic|spiritual alignment)\b|chart indicates|elemental balance/gi;

function normalizeReportLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function customerSafeLine(line: string, locale: Locale): string {
  const normalized = normalizeReportLine(line);
  if (!normalized) return "";
  if (locale === "en") {
    if (ENGLISH_JARGON.test(normalized)) return "";
    ENGLISH_JARGON.lastIndex = 0;
    return normalized;
  }
  if (CHINESE_JARGON.test(normalized)) return "";
  return normalized;
}

function uniqueLines(lines: string[], locale: Locale): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const safe = customerSafeLine(line, locale);
    if (!safe || seen.has(safe)) continue;
    seen.add(safe);
    out.push(safe);
  }
  return out;
}

function continuousReportContent(sections: ReportSection[], locale: Locale) {
  const summarySection = sections.find((section) => section.key === "summary");
  const bodySection = sections.find((section) => section.key === "body");

  if (summarySection || bodySection) {
    const overflow = sections.filter((section) => section.key !== "summary" && section.key !== "body");
    return {
      summary: uniqueLines([
        ...(summarySection?.body ?? []),
        ...overflow.flatMap((section) => section.body ?? []),
      ], locale),
      body: uniqueLines(bodySection?.body ?? [], locale),
    };
  }

  return {
    summary: uniqueLines(sections.flatMap((section) => section.body ?? []), locale),
    body: [],
  };
}

export function FocusedReportSections({ sections, result }: { sections: ReportSection[]; result?: AnalysisResult }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const content = continuousReportContent(sections, locale);

  if (!content.summary.length && !content.body.length) return null;

  return (
    <section className="zhaowu-focused-report zhaowu-report-continuous-sheet" aria-labelledby="focused-report-title">
      <header className="zhaowu-report-header">
        <p className="zhaowu-report-kicker">{copy.kicker}</p>
        <h3 id="focused-report-title" className="zhaowu-report-title">{copy.title}</h3>
        <p className="zhaowu-report-lead">{copy.lead}</p>
      </header>

      <div className="zhaowu-report-flow">
        {content.summary.length ? (
          <div className="zhaowu-report-summary-block">
            <h4>{copy.summary}</h4>
            <div className="zhaowu-report-copy">
              {content.summary.map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
            </div>
            {result ? <MindAdviceComic result={result} /> : null}
          </div>
        ) : null}

        {content.body.length ? (
          <div className="zhaowu-report-body-block">
            <h4>{copy.body}</h4>
            <div className="zhaowu-report-copy">
              {content.body.map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
            </div>
          </div>
        ) : null}
      </div>

      {result ? <ReportVisualBook result={result} /> : null}
      {result ? <ReportLuckBook result={result} /> : null}
      {result ? <ReportShareCard result={result} /> : null}
    </section>
  );
}

/** Historical imports render through the same one-sheet view. */
export const PaidReportPages = FocusedReportSections;
