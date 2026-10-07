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
import { IllustratedDestinyPanel, IllustratedShareCard } from "@/components/illustrated-destiny-panel";

const COPY = {
  "zh-Hant": {
    title: "完整報告",
    summaryTitle: "總體概括",
    moreSummary: "展開完整概括",
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
    visual: "命書圖解",
    visualHint: "先看圖，再決定要不要展開細節。",
    body: "身體需要注意的地方",
    bodyUnavailable: "資料不足，暫不提供身體象義觀察。",
    detailLead: "",
    keyPoints: "重點",
    methodologyStatement: "昭梧採用 STONE R6.2.2 推演體系，以傳統子平法為核心，依次校驗月令、調候、格局、病藥、流通、承載及歲運觸發。古籍依據、現代整理與輔助象意分層處理；無法確認的內容不會強行下斷。",
    methodologyMore: "了解方法",
    methodologyExpanded: "分析先看原局定下的結構，再看大運帶來的十年條件，然後流年觸發當年的具體事件，流月只用來縮小時間範圍。每一層證據都會標記是否確定、屬於較高概率、合理推論，還是暫時無法判定，避免用單一線索得出結論。",
  },
  "zh-Hans": {
    title: "完整报告",
    summaryTitle: "总体概括",
    moreSummary: "展开完整概括",
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
    visual: "命书图解",
    visualHint: "先看图，再决定要不要展开细节。",
    body: "身体需要注意的地方",
    bodyUnavailable: "资料不足，暂不提供身体象义观察。",
    detailLead: "",
    keyPoints: "重点",
    methodologyStatement: "昭梧采用 STONE R6.2.2 推演体系，以传统子平法为核心，依次校验月令、调候、格局、病药、流通、承载及岁运触发。古籍依据、现代整理与辅助象意分层处理；无法确认的内容不会强行下断。",
    methodologyMore: "了解方法",
    methodologyExpanded: "分析先看原局定下的结构，再看大运带来的十年条件，然后流年触发当年的具体事件，流月只用来缩小时间范围。每一层证据都会标记是否确定、属于较高概率、合理推论，还是暂时无法判定，避免用单一线索得出结论。",
  },
  en: {
    title: "Full report",
    summaryTitle: "Overall summary",
    moreSummary: "Show the full summary",
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
    visual: "Illustrated reading",
    visualHint: "Start with the visual summary; open the detail only if you want it.",
    body: "Body areas to watch",
    bodyUnavailable: "There is not enough saved information to provide a symbolic body note.",
    detailLead: "",
    keyPoints: "Key points",
    methodologyStatement: "Zhaowu's readings follow the STONE R6.2.2 method, built on traditional Zi Ping BaZi analysis. Each chart is checked in order — the governing energy of the birth month, seasonal balance, the chart's structure, where it's under strain, how the elements flow and support each other, and how later luck cycles bring things into play. Classical sources, modern interpretation, and supporting symbolism are kept in separate layers, and anything that can't be confirmed is left open rather than forced into an answer.",
    methodologyMore: "How this is worked out",
    methodologyExpanded: "The reading starts with the structure set at birth, then looks at how the current ten-year cycle shapes what's available, then how a given year can trigger something specific, with the month only narrowing the timing further. Each layer of evidence is marked as confirmed, more likely, a reasonable inference, or simply undetermined, so no conclusion rests on a single clue.",
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

/**
 * 2026-09-27 最後一次收口 Task 4：小型方法論披露。
 * 只在「判斷備註」收合層出現，不進主答案畫面；固定一句話聲明 + 可選「了解方法」折疊。
 */
function MethodologyDisclosure({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  return (
    <div className="zhaowu-report-methodology">
      <p className="zhaowu-report-methodology__statement">{copy.methodologyStatement}</p>
      <details className="zhaowu-report-methodology__more">
        <summary>{copy.methodologyMore}</summary>
        <p>{copy.methodologyExpanded}</p>
      </details>
    </div>
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
        <b className="zhaowu-report-stage-no">04</b>
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
        <MethodologyDisclosure locale={locale} />
      </div>
    </details>
  );
}

/** Direct answer + one supporting line stay open; the rest of the overall summary folds. */
const SUMMARY_VISIBLE_LINES = 1;

export function FocusedReportSections({ sections, result }: { sections: ReportSection[]; result?: AnalysisResult }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const content = continuousReportContent(sections, locale);
  const model = result ? buildDecisionReportModel(result) : null;
  const directFull = result ? normalizeReportLine(customerDirectAnswer(result.question, result.reading.directAnswer)) : "";
  const supportingSummary = content.summary.filter((line) => normalizeReportLine(line) !== directFull);
  const showLuck = Boolean(model?.supportingModules.includes("luck"));
  const overviewLines = directFull ? [directFull, ...supportingSummary] : content.summary;
  const fallbackNotes = result ? [] : supportingSummary.slice(3);
  const bodyLines = content.body.length ? content.body : [copy.bodyUnavailable];

  if (!content.summary.length && !content.body.length) return null;

  return (
    <section className="zhaowu-focused-report zhaowu-report-continuous-sheet" aria-labelledby="focused-report-title">
      <header className="zhaowu-report-header">
        {copy.kicker ? <p className="zhaowu-report-kicker">{copy.kicker}</p> : null}
        <h3 id="focused-report-title" className="zhaowu-report-title">{copy.title}</h3>
        {copy.lead ? <p className="zhaowu-report-lead">{copy.lead}</p> : null}
      </header>
      <nav className="zhaowu-focused-progress" aria-label={locale === "en" ? "Report reading order" : locale === "zh-Hans" ? "报告阅读顺序" : "報告閱讀順序"}>
        <span><b>01</b>{copy.summaryTitle}</span>
        <span><b>02</b>{copy.visual}</span>
        <span><b>03</b>{copy.body}</span>
        <span><b>04</b>{copy.detail}</span>
      </nav>

      {overviewLines.length ? (
        <section className="zhaowu-report-summary-block" aria-labelledby="zhaowu-report-summary-title">
          <h4 id="zhaowu-report-summary-title"><span className="zhaowu-report-stage-no">01</span>{copy.summaryTitle}</h4>
          <div className="zhaowu-report-copy">
            {overviewLines.slice(0, SUMMARY_VISIBLE_LINES).map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
          </div>
          {overviewLines.length > SUMMARY_VISIBLE_LINES ? (
            <details className="zhaowu-report-fold" data-report-fold>
              <summary>{copy.moreSummary}</summary>
              <div className="zhaowu-report-copy">
                {overviewLines.slice(SUMMARY_VISIBLE_LINES).map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      {result ? (
        <details className="zhaowu-report-stage-fold" data-report-stage="visual">
          <summary>
            <b className="zhaowu-report-stage-no">02</b>
            <span><strong>{copy.visual}</strong><small>{copy.visualHint}</small></span>
          </summary>
          <div className="zhaowu-report-stage-fold__body">
            <IllustratedDestinyPanel result={result} />
            <IllustratedShareCard result={result} />
            <ReportShareCard result={result} />
          </div>
        </details>
      ) : null}

      <section className="zhaowu-report-body-block">
          <details className="zhaowu-report-fold zhaowu-report-fold--section" data-report-fold>
            <summary><h4><span className="zhaowu-report-stage-no">03</span>{copy.body}</h4></summary>
            <div className="zhaowu-report-copy">
              {bodyLines.map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
            </div>
          </details>
        </section>


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
            <MethodologyDisclosure locale={locale} />
          </div>
        </details>
      ) : null}
    </section>
  );
}

/** Historical imports render through the same answer-first report view. */
export const PaidReportPages = FocusedReportSections;
