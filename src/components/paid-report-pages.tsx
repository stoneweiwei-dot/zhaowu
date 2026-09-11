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
    title: "你的完整分析",
    lead: "先回答你真正問的事，再看依據、風險、時間與下一步。",
    kicker: "ZHAOWU · PERSONAL ANALYSIS",
    questionKicker: "YOUR QUESTION",
    questionTitle: "你這次問的是",
    answerTitle: "先給答案",
    confidence: "判斷把握",
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
    detail: "完整說明",
    body: "身體需要留意",
    detailLead: "以下保留與本題相關的補充，不重複第一屏答案。",
  },
  "zh-Hans": {
    title: "你的完整分析",
    lead: "先回答你真正问的事，再看依据、风险、时间与下一步。",
    kicker: "ZHAOWU · PERSONAL ANALYSIS",
    questionKicker: "YOUR QUESTION",
    questionTitle: "你这次问的是",
    answerTitle: "先给答案",
    confidence: "判断把握",
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
    detail: "完整说明",
    body: "身体需要留意",
    detailLead: "以下保留与本题相关的补充，不重复第一屏答案。",
  },
  en: {
    title: "Your full analysis",
    lead: "Your actual question first, then the reasons, risks, timing and next move.",
    kicker: "ZHAOWU · PERSONAL ANALYSIS",
    questionKicker: "YOUR QUESTION",
    questionTitle: "What you asked",
    answerTitle: "The answer first",
    confidence: "Reading confidence",
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
    detail: "Full explanation",
    body: "Body areas to watch",
    detailLead: "Only question-relevant supporting detail is kept here, without repeating the opening answer.",
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

function DecisionCards({ result, locale }: { result: AnalysisResult; locale: Locale }) {
  const copy = COPY[locale];
  const model = buildDecisionReportModel(result);
  const labels: Record<DecisionSectionKey, string> = {
    reasons: copy.reasons,
    risks: copy.risks,
    timing: copy.timing,
    actions: copy.actions,
  };

  return (
    <>
      <section className="zhaowu-question-contract" data-report-qa={model.validationIssues.length ? "needs-review" : "pass"}>
        <p className="zhaowu-question-kicker">{copy.questionKicker}</p>
        <h4>{copy.questionTitle}</h4>
        <p className="zhaowu-question-text">{model.contract.sourceText}</p>
        <div className="zhaowu-direct-answer">
          <span>{copy.answerTitle}</span>
          <p>{model.directAnswer}</p>
        </div>
        <div className="zhaowu-answer-meta">
          <div><span>{copy.confidence}</span><b>{model.confidenceLabel}</b><small>{model.confidenceBasis}</small></div>
          <div><span>{copy.variable}</span><b>{model.biggestVariable}</b></div>
        </div>
      </section>

      <section className="zhaowu-decision-grid" aria-label={copy.answerTitle}>
        {model.sectionOrder.map((key) => {
          const lines = decisionLines(model, key);
          if (!lines.length) return null;
          return (
            <article key={key} className={`zhaowu-decision-card is-${key}`}>
              <h5>{labels[key]}</h5>
              <ul>{lines.map((line, index) => <li key={`${key}-${index}`}>{line}</li>)}</ul>
            </article>
          );
        })}
      </section>
    </>
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

  if (!content.summary.length && !content.body.length) return null;

  return (
    <section className="zhaowu-focused-report zhaowu-report-continuous-sheet" aria-labelledby="focused-report-title">
      <header className="zhaowu-report-header">
        <p className="zhaowu-report-kicker">{copy.kicker}</p>
        <h3 id="focused-report-title" className="zhaowu-report-title">{copy.title}</h3>
        <p className="zhaowu-report-lead">{copy.lead}</p>
        {timeCorrectionNote(result, locale) ? (
          <p className="zhaowu-time-correction"><strong>{locale === "en" ? "How time was read" : locale === "zh-Hans" ? "时间怎么换算" : "時間怎麼換算"}</strong>{timeCorrectionNote(result, locale)}</p>
        ) : null}
      </header>

      <div className="zhaowu-report-flow">
        {result ? <DecisionCards result={result} locale={locale} /> : null}
        {result ? <ChartSnapshot result={result} locale={locale} /> : null}
      </div>

      {result ? <ReportVisualBook result={result} /> : null}
      {result ? <FiveElementTrainingBlock result={result} /> : null}
      {result && showLuck ? <ReportLuckBook result={result} /> : null}

      <div className="zhaowu-report-flow zhaowu-report-supporting-flow">
        {supportingSummary.length ? (
          <details className="zhaowu-report-detail" open={false}>
            <summary>
              <span>{copy.detail}</span>
              <small>{copy.detailLead}</small>
            </summary>
            <div className="zhaowu-report-copy">
              {supportingSummary.map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
            </div>
          </details>
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

      {result ? <EvidenceGovernancePanel result={result} /> : null}
      {result ? <ReportShareCard result={result} /> : null}
    </section>
  );
}

/** Historical imports render through the same answer-first report view. */
export const PaidReportPages = FocusedReportSections;
