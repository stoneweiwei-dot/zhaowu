import { useI18n, type Locale } from "@/lib/i18n";
import type { AnalysisResult, Element, Pillar } from "@/lib/bazi/types";
import type { ReportSection } from "@/lib/report/focused-report";
import { customerDirectAnswer } from "@/lib/report/customer-copy";
import { buildDecisionReportModel, type DecisionSectionKey } from "@/lib/report/decision-report-model";
import { ReportVisualBook } from "@/components/report-visual-book";
import { ReportLuckBook } from "@/components/report-luck-book";
import { ReportShareCard } from "@/components/report-share-card";
import { EvidenceGovernancePanel } from "@/components/evidence-governance-panel";
import { FiveElementTrainingBlock } from "@/components/five-element-training-block";
import {
  buildPersonalReportNarrative,
  type PersonalReportNarrative,
} from "@/lib/report/personal-narrative";

const COPY = {
  "zh-Hant": {
    title: "補充",
    lead: "",
    kicker: "",
    questionKicker: "",
    questionTitle: "問題",
    answerTitle: "答案",
    confidence: "依據",
    variable: "關鍵變數",
    reasons: "原因",
    risks: "留意",
    timing: "時間",
    actions: "下一步",
    chart: "四柱",
    chartLead: "",
    hidden: "藏干",
    currentCycle: "目前大運",
    timeUnknown: "時辰未定",
    detail: "附註",
    body: "身體提醒",
    detailLead: "",
    keyPoints: "重點",
  },
  "zh-Hans": {
    title: "补充",
    lead: "",
    kicker: "",
    questionKicker: "",
    questionTitle: "问题",
    answerTitle: "答案",
    confidence: "依据",
    variable: "关键变量",
    reasons: "原因",
    risks: "留意",
    timing: "时间",
    actions: "下一步",
    chart: "四柱",
    chartLead: "",
    hidden: "藏干",
    currentCycle: "目前大运",
    timeUnknown: "时辰未定",
    detail: "附注",
    body: "身体提醒",
    detailLead: "",
    keyPoints: "重点",
  },
  en: {
    title: "More",
    lead: "",
    kicker: "",
    questionKicker: "",
    questionTitle: "Question",
    answerTitle: "Answer",
    confidence: "Basis",
    variable: "Key variable",
    reasons: "Why",
    risks: "Watch",
    timing: "Timing",
    actions: "Next step",
    chart: "Four pillars",
    chartLead: "",
    hidden: "Hidden stems",
    currentCycle: "Current cycle",
    timeUnknown: "Birth time unconfirmed",
    detail: "Notes",
    body: "Body notes",
    detailLead: "",
    keyPoints: "Key points",
  },
} as const;

const CHINESE_JARGON = /命[盤盘](?:落點|落点|格局)?|命局|日主|月令|大[運运]|流年|流月|十神|正印|偏印|七[殺杀]|官[殺杀]|食神|傷官|伤官|比肩|劫[財财]|喜用神|忌神|五行生克|五行生剋|[殺杀]印相生|旺衰|身[強强]|身弱|刑[沖冲]合害|納音|纳音/;
const ENGLISH_JARGON = /\b(?:bazi|day master|month command|ten gods?|luck cycle|ten-year cycle|destiny|fate|auspicious|metaphys(?:ic|ical|ics)|cosmic|spiritual alignment)\b|chart indicates|elemental balance/i;

const ELEMENT_CLASS: Record<Element, string> = {
  木: "is-wood",
  火: "is-fire",
  土: "is-earth",
  金: "is-metal",
  水: "is-water",
};

function timeCorrectionNote(result: AnalysisResult | undefined, locale: Locale): string | null {
  if (!result?.chart) return null;
  const chart = result.chart;
  const usedSolar = Boolean(chart.usedTrueSolar);
  const south = chart.hemisphere === "S";
  const tz = chart.timezone || "";
  if (!usedSolar && !south) return null;
  if (locale === "en") {
    const bits = [];
    if (usedSolar) bits.push(`True solar time was applied from the birthplace longitude and the equation of time. Civil clock time in ${tz || "the birth timezone"} already follows that day's daylight-saving rule.`);
    if (south) bits.push("Southern-hemisphere season and daylight are read locally; the five-element structure of the chart is not reversed.");
    return bits.join(" ");
  }
  if (locale === "zh-Hans") {
    const bits = [];
    if (usedSolar) bits.push(`这份盘已按出生地经度与均时差换算真太阳时；民用钟点按出生地时区 ${tz || ""} 处理，当天若实行夏令时已一并计入。`);
    if (south) bits.push("南半球只按当地季节与作息理解，不因此反转五行。");
    return bits.join("");
  }
  const bits = [];
  if (usedSolar) bits.push(`這份盤已按出生地經度與均時差換算真太陽時；民用鐘點按出生地時區 ${tz || ""} 處理，當天若實行夏令時已一併計入。`);
  if (south) bits.push("南半球只按當地季節與作息理解，不因此反轉五行。");
  return bits.join("");
}

function normalizeReportLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function customerSafeLine(line: string, locale: Locale): string {
  const normalized = normalizeReportLine(line);
  if (!normalized) return "";
  if (locale === "en") return ENGLISH_JARGON.test(normalized) ? "" : normalized;
  return CHINESE_JARGON.test(normalized) ? "" : normalized;
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

function pillarLabel(pillar: Pillar, locale: Locale): string {
  if (locale === "en") return ({ year: "Year", month: "Month", day: "Day", time: "Time" } as const)[pillar.key];
  if (locale === "zh-Hans") return ({ year: "年柱", month: "月柱", day: "日柱", time: "时柱" } as const)[pillar.key];
  return ({ year: "年柱", month: "月柱", day: "日柱", time: "時柱" } as const)[pillar.key];
}

function ChartSnapshot({ result, locale }: { result: AnalysisResult; locale: Locale }) {
  const copy = COPY[locale];
  const chart = result.chart;
  return (
    <section className="zhaowu-chart-snapshot" aria-labelledby="zhaowu-chart-snapshot-title">
      <div className="zhaowu-section-heading">
        <h4 id="zhaowu-chart-snapshot-title">{copy.chart}</h4>
        {copy.chartLead ? <span>{copy.chartLead}</span> : null}
      </div>

      <div className="zhaowu-pillar-grid">
        {chart.pillars.map((pillar) => {
          const ready = pillar.ready !== false && pillar.ganZhi !== "未定";
          return (
            <article key={pillar.key} className={`zhaowu-pillar-card ${pillar.key === "day" ? "is-day" : ""} ${ready ? "" : "is-pending"}`}>
              <span className="zhaowu-pillar-label">{pillarLabel(pillar, locale)}</span>
              {ready ? (
                <>
                  <b className={`zhaowu-pillar-stem ${ELEMENT_CLASS[pillar.ganElement]}`}>{pillar.gan}</b>
                  <b className={`zhaowu-pillar-branch ${ELEMENT_CLASS[pillar.zhiElement]}`}>{pillar.zhi}</b>
                  {locale === "en" ? null : <small>{pillar.key === "day" ? (locale === "zh-Hant" ? "日主" : "日主") : pillar.shiShenGan}</small>}
                  {pillar.hide?.length ? (
                    <details>
                      <summary>{copy.hidden}</summary>
                      <span>{pillar.hide.map((item) => locale === "en" ? item.gan : `${item.gan}·${item.shiShen}`).join(" · ")}</span>
                    </details>
                  ) : null}
                </>
              ) : <b className="zhaowu-pillar-unset">{copy.timeUnknown}</b>}
            </article>
          );
        })}
      </div>

      <div className="zhaowu-chart-meta">
        <span>{chart.lunarDate}</span>
        {chart.currentDayun && !chart.timeUnknown ? (
          <span><b>{copy.currentCycle}</b>{chart.currentDayun.ganZhi} · {chart.currentDayun.startYear}–{chart.currentDayun.endYear}</span>
        ) : null}
        {chart.timeUnknown ? <span className="is-warning">{copy.timeUnknown}</span> : null}
      </div>
    </section>
  );
}

function decisionLines(model: ReturnType<typeof buildDecisionReportModel>, key: DecisionSectionKey): string[] {
  if (key === "reasons") return model.reasons;
  if (key === "risks") return model.risks;
  if (key === "timing") return model.timing;
  return model.actions;
}

function PrioritySummary({ result, locale }: { result: AnalysisResult; locale: Locale }) {
  const copy = COPY[locale];
  const model = buildDecisionReportModel(result);
  const labels: Record<DecisionSectionKey, string> = {
    reasons: copy.reasons,
    risks: copy.risks,
    timing: copy.timing,
    actions: copy.actions,
  };
  const items = model.sectionOrder
    .map((key) => ({ key, label: labels[key], line: decisionLines(model, key)[0] ?? "" }))
    .filter((item) => item.line)
    .slice(0, 3);

  if (!items.length) return null;
  return (
    <section className="zhaowu-report-priority" aria-label={copy.keyPoints}>
      <p className="zhaowu-report-priority-kicker">{copy.keyPoints}</p>
      <div className="zhaowu-report-priority-list">
        {items.map((item) => (
          <article key={item.key}>
            <strong>{item.label}</strong>
            <p>{item.line}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function NarrativePlate({ narrative }: { narrative: PersonalReportNarrative }) {
  return (
    <section className="zhaowu-report-narrative" aria-labelledby="zhaowu-report-narrative-title">
      <header className="zhaowu-report-narrative__head">
        {narrative.kicker ? <p>{narrative.kicker}</p> : null}
        <h4 id="zhaowu-report-narrative-title">{narrative.heading}</h4>
        <strong>{narrative.title}</strong>
        <span>{narrative.scene}</span>
      </header>

      <div className="zhaowu-report-narrative__roles">
        {narrative.roles.map((role) => (
          <article key={role.key}>
            <h5>{role.label}</h5>
            <p>{role.body}</p>
          </article>
        ))}
      </div>

      <div className="zhaowu-report-narrative__balance">
        <article><h5>{narrative.strengthLabel}</h5><p>{narrative.strength}</p></article>
        <article><h5>{narrative.costLabel}</h5><p>{narrative.cost}</p></article>
      </div>

      <aside className="zhaowu-report-narrative__action">
        <h5>{narrative.actionLabel}</h5>
        <p>{narrative.action}</p>
      </aside>

      <details className="zhaowu-report-narrative__evidence">
        <summary>{narrative.evidenceHeading}</summary>
        <div>
          {narrative.evidence.map((item) => (
            <p key={`${item.label}-${item.trace}`}><strong>{item.label}</strong><span>{item.trace}</span></p>
          ))}
          <small>{narrative.disclaimer}</small>
        </div>
      </details>
    </section>
  );
}

function AnalysisNotes({
  result,
  locale,
  supportingSummary,
  showLuck,
}: {
  result: AnalysisResult;
  locale: Locale;
  supportingSummary: string[];
  showLuck: boolean;
}) {
  const copy = COPY[locale];
  const model = buildDecisionReportModel(result);
  const labels: Record<DecisionSectionKey, string> = {
    reasons: copy.reasons,
    risks: copy.risks,
    timing: copy.timing,
    actions: copy.actions,
  };
  const timeNote = timeCorrectionNote(result, locale);

  return (
    <details className="zhaowu-report-method-notes">
      <summary>
        <span>{copy.detail}</span>
        {copy.detailLead ? <small>{copy.detailLead}</small> : null}
      </summary>
      <div className="zhaowu-report-method-notes__body">
        <div className="zhaowu-answer-meta zhaowu-answer-meta--notes">
          <div><span>{copy.confidence}</span><b>{model.confidenceLabel}</b><small>{model.confidenceBasis}</small></div>
          <div><span>{copy.variable}</span><b>{model.biggestVariable}</b></div>
        </div>

        {timeNote ? (
          <p className="zhaowu-time-correction zhaowu-time-correction--notes">
            <strong>{locale === "en" ? "How time was read" : locale === "zh-Hans" ? "时间怎么换算" : "時間怎麼換算"}</strong>
            {timeNote}
          </p>
        ) : null}

        <div className="zhaowu-report-method-lines">
          {model.sectionOrder.map((key) => {
            const lines = decisionLines(model, key);
            if (!lines.length) return null;
            return (
              <section key={key}>
                <h5>{labels[key]}</h5>
                <ul>{lines.map((line, index) => <li key={`${key}-note-${index}`}>{line}</li>)}</ul>
              </section>
            );
          })}
        </div>

        <ChartSnapshot result={result} locale={locale} />
        <ReportVisualBook result={result} />
        <FiveElementTrainingBlock result={result} />
        {showLuck ? <ReportLuckBook result={result} /> : null}

        {supportingSummary.length ? (
          <div className="zhaowu-report-copy zhaowu-report-copy--notes">
            {supportingSummary.map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
          </div>
        ) : null}

        <EvidenceGovernancePanel result={result} />
      </div>
    </details>
  );
}

export function FocusedReportSections({ sections, result }: { sections: ReportSection[]; result?: AnalysisResult }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const content = continuousReportContent(sections, locale);
  const model = result ? buildDecisionReportModel(result) : null;
  const narrative = sections.find((section) => section.key === "summary")?.narrative
    ?? (result ? buildPersonalReportNarrative(result) : null);
  const directFull = result ? normalizeReportLine(customerDirectAnswer(result.question, result.reading.directAnswer)) : "";
  const supportingSummary = content.summary.filter((line) => normalizeReportLine(line) !== directFull);
  const showLuck = Boolean(model?.supportingModules.includes("luck"));
  const showBody = !model || model.supportingModules.includes("body");
  const fallbackPriority = result ? [] : supportingSummary.slice(0, 3);
  const fallbackNotes = result ? supportingSummary : supportingSummary.slice(3);

  if (!content.summary.length && !content.body.length) return null;

  return (
    <section className="zhaowu-focused-report zhaowu-report-continuous-sheet" aria-labelledby="focused-report-title">
      <header className="zhaowu-report-header">
        {copy.kicker ? <p className="zhaowu-report-kicker">{copy.kicker}</p> : null}
        <h3 id="focused-report-title" className="zhaowu-report-title">{copy.title}</h3>
        {copy.lead ? <p className="zhaowu-report-lead">{copy.lead}</p> : null}
      </header>

      {result ? <PrioritySummary result={result} locale={locale} /> : null}

      {narrative ? <NarrativePlate narrative={narrative} /> : null}

      {fallbackPriority.length ? (
        <section className="zhaowu-report-priority" aria-label={copy.keyPoints}>
          <p className="zhaowu-report-priority-kicker">{copy.keyPoints}</p>
          <div className="zhaowu-report-priority-list">
            {fallbackPriority.map((line, index) => <article key={index}><p>{line}</p></article>)}
          </div>
        </section>
      ) : null}

      {showBody && content.body.length ? (
        <section className="zhaowu-report-body-block">
          <h4>{copy.body}</h4>
          <div className="zhaowu-report-copy">
            {content.body.map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
          </div>
        </section>
      ) : null}

      {result ? <ReportShareCard result={result} /> : null}

      {result ? (
        <AnalysisNotes result={result} locale={locale} supportingSummary={fallbackNotes} showLuck={showLuck} />
      ) : fallbackNotes.length ? (
        <details className="zhaowu-report-method-notes">
          <summary>
            <span>{copy.detail}</span>
            {copy.detailLead ? <small>{copy.detailLead}</small> : null}
          </summary>
          <div className="zhaowu-report-method-notes__body zhaowu-report-copy zhaowu-report-copy--notes">
            {fallbackNotes.map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
          </div>
        </details>
      ) : null}
    </section>
  );
}

/** Historical imports render through the same answer-first report view. */
export const PaidReportPages = FocusedReportSections;
