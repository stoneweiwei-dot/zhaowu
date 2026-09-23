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

const COPY = {
  "zh-Hant": {
    title: "補充重點",
    lead: "只保留會影響你判斷的重點；推演依據與技術細節收在最下方備註。",
    kicker: "ZHAOWU · PERSONAL ANALYSIS",
    questionKicker: "YOUR QUESTION",
    questionTitle: "你這次問的是",
    answerTitle: "先給答案",
    confidence: "依據狀態",
    variable: "最大變數",
    reasons: "為什麼",
    risks: "要防什麼",
    timing: "什麼時候",
    actions: "現在怎麼做",
    chart: "命盤基礎",
    chartLead: "排盤資料只作判斷底座；先看結論，再按需要展開術理。",
    hidden: "藏干",
    currentCycle: "目前大運",
    timeUnknown: "時辰未定",
    detail: "判斷備註",
    body: "身體需要留意",
    detailLead: "命盤依據、推演過程與其餘補充放在這裡；想看再展開。",
    keyPoints: "只看重點",
  },
  "zh-Hans": {
    title: "补充重点",
    lead: "只保留会影响你判断的重点；推演依据与技术细节收在最下方备注。",
    kicker: "ZHAOWU · PERSONAL ANALYSIS",
    questionKicker: "YOUR QUESTION",
    questionTitle: "你这次问的是",
    answerTitle: "先给答案",
    confidence: "依据状态",
    variable: "最大变量",
    reasons: "为什么",
    risks: "要防什么",
    timing: "什么时候",
    actions: "现在怎么做",
    chart: "命盘基础",
    chartLead: "排盘资料只作判断底座；先看结论，再按需要展开术理。",
    hidden: "藏干",
    currentCycle: "目前大运",
    timeUnknown: "时辰未定",
    detail: "判断备注",
    body: "身体需要留意",
    detailLead: "命盘依据、推演过程与其余补充放在这里；想看再展开。",
    keyPoints: "只看重点",
  },
  en: {
    title: "Key supporting points",
    lead: "Only the points that may change your decision stay prominent. Reasoning and technical detail move to the notes at the bottom.",
    kicker: "ZHAOWU · PERSONAL ANALYSIS",
    questionKicker: "YOUR QUESTION",
    questionTitle: "What you asked",
    answerTitle: "The answer first",
    confidence: "Evidence status",
    variable: "Biggest variable",
    reasons: "Why",
    risks: "What to watch",
    timing: "When",
    actions: "What to do now",
    chart: "Chart basics",
    chartLead: "The chart is the evidence base, not the opening speech. Read the answer first, then expand the technical detail if useful.",
    hidden: "Hidden stems",
    currentCycle: "Current long cycle",
    timeUnknown: "Birth time unconfirmed",
    detail: "Reasoning notes",
    body: "Body areas to watch",
    detailLead: "Chart evidence, reasoning process and extra detail live here. Open only if useful.",
    keyPoints: "Key points only",
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
        <p>ZHAOWU · CHART</p>
        <h4 id="zhaowu-chart-snapshot-title">{copy.chart}</h4>
        <span>{copy.chartLead}</span>
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
        <small>{copy.detailLead}</small>
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
        <p className="zhaowu-report-kicker">{copy.kicker}</p>
        <h3 id="focused-report-title" className="zhaowu-report-title">{copy.title}</h3>
        <p className="zhaowu-report-lead">{copy.lead}</p>
      </header>

      {result ? <PrioritySummary result={result} locale={locale} /> : null}

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
            <small>{copy.detailLead}</small>
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
