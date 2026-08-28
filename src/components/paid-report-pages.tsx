import { useI18n } from "@/lib/i18n";
import type { ReportSection } from "@/lib/report/focused-report";

const COPY = {
  "zh-Hant": {
    title: "完整報告",
    lead: "先看整體結論，再看身體需要留意的地方。",
    kicker: "ZHAOWU · PERSONAL REPORT",
    summary: "總體概括",
    body: "身體需要注意的地方",
  },
  "zh-Hans": {
    title: "完整报告",
    lead: "先看整体结论，再看身体需要留意的地方。",
    kicker: "ZHAOWU · PERSONAL REPORT",
    summary: "总体概括",
    body: "身体需要注意的地方",
  },
  en: {
    title: "Full report",
    lead: "Start with the overall conclusion, then the body areas worth watching.",
    kicker: "ZHAOWU · PERSONAL REPORT",
    summary: "Overall summary",
    body: "Body areas to watch",
  },
} as const;

function normalizeReportLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function uniqueLines(lines: string[]): string[] {
  return lines.filter((line, index, body) => {
    const normalized = normalizeReportLine(line);
    return Boolean(normalized) && body.findIndex((candidate) => normalizeReportLine(candidate) === normalized) === index;
  });
}

function continuousReportContent(sections: ReportSection[]) {
  const summarySection = sections.find((section) => section.key === "summary");
  const bodySection = sections.find((section) => section.key === "body");

  if (summarySection || bodySection) {
    const overflow = sections.filter((section) => section.key !== "summary" && section.key !== "body");
    return {
      summary: uniqueLines([
        ...(summarySection?.body ?? []),
        ...overflow.flatMap((section) => section.body ?? []),
      ]),
      body: uniqueLines(bodySection?.body ?? []),
    };
  }

  return {
    summary: uniqueLines(sections.flatMap((section) => section.body ?? [])),
    body: [],
  };
}

export function FocusedReportSections({ sections }: { sections: ReportSection[] }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const content = continuousReportContent(sections);

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
    </section>
  );
}

/** Legacy export name kept so historical report imports keep rendering through the same one-sheet view. */
export const PaidReportPages = FocusedReportSections;
