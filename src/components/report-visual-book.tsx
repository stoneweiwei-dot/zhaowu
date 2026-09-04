import { useEffect, useMemo, useState } from "react";
import type { AnalysisResult, Element } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { buildReportVisualModel, type ReportVisualTab } from "@/lib/report/report-visual-model";
import { getReportVisualAsset } from "@/lib/report/report-visual-assets";
import { ReportSpriteArtwork } from "@/components/report-sprite-artwork";

const COPY: Record<Locale, {
  kicker: string;
  title: string;
  lead: string;
  overview: string;
  day: string;
  season: string;
  elements: string;
  structure: string;
  structurePending: string;
  imageFallback: string;
  period: string;
  ratio: string;
  active: string;
}> = {
  "zh-Hant": {
    kicker: "ZHAOWU · 命之書",
    title: "命之書",
    lead: "同一套版式，由排盤結果自動替換內容；文字與圖表由網站生成，古畫只負責意象。",
    overview: "總覽",
    day: "日主命象",
    season: "月令時節",
    elements: "五行喜忌",
    structure: "格局病藥",
    structurePending: "正式病藥判定尚未通過完整驗證，暫不以模板猜結果。",
    imageFallback: "母圖載入失敗，已使用宣紙山水備援；文字判定不受影響。",
    period: "節氣區間",
    ratio: "五行氣勢",
    active: "目前閱讀",
  },
  "zh-Hans": {
    kicker: "ZHAOWU · 命之书",
    title: "命之书",
    lead: "同一套版式，由排盘结果自动替换内容；文字与图表由网站生成，古画只负责意象。",
    overview: "总览",
    day: "日主命象",
    season: "月令时节",
    elements: "五行喜忌",
    structure: "格局病药",
    structurePending: "正式病药判定尚未通过完整验证，暂不以模板猜结果。",
    imageFallback: "母图载入失败，已使用宣纸山水备援；文字判断不受影响。",
    period: "节气区间",
    ratio: "五行气势",
    active: "目前阅读",
  },
  en: {
    kicker: "ZHAOWU · VISUAL READING",
    title: "Your visual reading",
    lead: "One interface, filled from your calculated chart. Text and charts are rendered by the site; artwork is symbolic only.",
    overview: "Overview",
    day: "Core nature",
    season: "Birth season",
    elements: "Five-element pattern",
    structure: "Structure & remedy",
    structurePending: "A formal structure-and-remedy result is not shown until that calculation layer has been fully verified.",
    imageFallback: "The matching artwork did not load, so the paper-landscape fallback is shown. Your calculated text is unaffected.",
    period: "Seasonal interval",
    ratio: "Element pattern",
    active: "Current view",
  },
};

const ELEMENT_CLASS: Record<Element, string> = {
  木: "is-wood",
  火: "is-fire",
  土: "is-earth",
  金: "is-metal",
  水: "is-water",
};

const WHEEL_POINTS: Record<Element, { x: number; y: number }> = {
  木: { x: 160, y: 40 },
  火: { x: 264, y: 116 },
  土: { x: 224, y: 240 },
  金: { x: 96, y: 240 },
  水: { x: 56, y: 116 },
};

function FiveElementWheel({ rows, ariaLabel }: { rows: ReturnType<typeof buildReportVisualModel>["elements"]["rows"]; ariaLabel: string }) {
  const generation: Array<[Element, Element]> = [["木", "火"], ["火", "土"], ["土", "金"], ["金", "水"], ["水", "木"]];
  const control: Array<[Element, Element]> = [["木", "土"], ["土", "水"], ["水", "火"], ["火", "金"], ["金", "木"]];

  return (
    <svg className="zhaowu-five-wheel" viewBox="0 0 320 280" role="img" aria-label={ariaLabel}>
      <g className="zhaowu-wheel-generation" aria-hidden="true">
        {generation.map(([from, to]) => <line key={`${from}-${to}`} x1={WHEEL_POINTS[from].x} y1={WHEEL_POINTS[from].y} x2={WHEEL_POINTS[to].x} y2={WHEEL_POINTS[to].y} />)}
      </g>
      <g className="zhaowu-wheel-control" aria-hidden="true">
        {control.map(([from, to]) => <line key={`${from}-${to}`} x1={WHEEL_POINTS[from].x} y1={WHEEL_POINTS[from].y} x2={WHEEL_POINTS[to].x} y2={WHEEL_POINTS[to].y} />)}
      </g>
      {rows.map((row) => {
        const point = WHEEL_POINTS[row.element];
        return (
          <g key={row.element} className={`zhaowu-wheel-node ${ELEMENT_CLASS[row.element]}`} transform={`translate(${point.x} ${point.y})`}>
            <circle r="32" />
            <text className="zhaowu-wheel-name" textAnchor="middle" y="-2">{row.label}</text>
            <text className="zhaowu-wheel-value" textAnchor="middle" y="18">{row.percent}%</text>
          </g>
        );
      })}
    </svg>
  );
}

export function ReportVisualBook({ result }: { result: AnalysisResult }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const model = useMemo(() => buildReportVisualModel(result.chart, locale), [result.chart, locale]);
  const dayAsset = useMemo(() => getReportVisualAsset("day-master", model.dayMaster.visualKey), [model.dayMaster.visualKey]);
  const seasonAsset = useMemo(() => getReportVisualAsset("month", model.season.visualKey), [model.season.visualKey]);
  const [active, setActive] = useState<ReportVisualTab>("overview");

  useEffect(() => setActive("overview"), [result.id]);

  const tabs: Array<{ key: ReportVisualTab; label: string }> = [
    { key: "overview", label: copy.overview },
    { key: "day-master", label: copy.day },
    { key: "season", label: copy.season },
    { key: "elements", label: copy.elements },
  ];

  return (
    <section className="zhaowu-visual-book" aria-labelledby="zhaowu-visual-book-title">
      <div className="zhaowu-visual-book-head">
        <p>{copy.kicker}</p>
        <h4 id="zhaowu-visual-book-title">{copy.title}</h4>
        <span>{copy.lead}</span>
      </div>

      <div className="zhaowu-visual-tabs" role="tablist" aria-label={copy.title}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            className={active === tab.key ? "is-active" : ""}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="zhaowu-visual-stage" role="tabpanel" aria-live="polite">
        {active === "overview" ? (
          <article className="zhaowu-visual-card zhaowu-visual-overview">
            <div className="zhaowu-visual-overview-art" aria-hidden="true" />
            <div className="zhaowu-visual-card-copy">
              <p className="zhaowu-visual-eyebrow">{copy.active}</p>
              <h5>{copy.title}</h5>
              <p>{copy.lead}</p>
            </div>
            <div className="zhaowu-visual-module-grid">
              <button type="button" onClick={() => setActive("day-master")}><b>{copy.day}</b><span>{model.dayMaster.title}</span></button>
              <button type="button" onClick={() => setActive("season")}><b>{copy.season}</b><span>{model.season.seasonLabel}</span></button>
              <button type="button" onClick={() => setActive("elements")}><b>{copy.elements}</b><span>{model.elements.strengthLabel}</span></button>
              <div className="is-disabled" aria-disabled="true"><b>{copy.structure}</b><span>{copy.structurePending}</span></div>
            </div>
          </article>
        ) : null}

        {active === "day-master" ? (
          <article className="zhaowu-visual-card">
            <div className="zhaowu-visual-card-title">
              <p>{copy.day}</p>
              <h5>{model.dayMaster.title}</h5>
            </div>
            <ReportSpriteArtwork asset={dayAsset} alt={model.dayMaster.imageAlt} fallbackText={copy.imageFallback} />
            <p className="zhaowu-visual-summary">{model.dayMaster.summary}</p>
            <div className="zhaowu-visual-tags">{model.dayMaster.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
            <dl className="zhaowu-visual-facts">
              <div><dt>{locale === "en" ? "Polarity" : "陰陽"}</dt><dd>{model.dayMaster.yinYangLabel}</dd></div>
              <div><dt>{locale === "en" ? "Element" : "五行"}</dt><dd>{model.dayMaster.elementLabel}</dd></div>
              <div><dt>{locale === "en" ? "Image" : "在天取象"}</dt><dd>{model.dayMaster.heavenImage}</dd></div>
            </dl>
          </article>
        ) : null}

        {active === "season" ? (
          <article className="zhaowu-visual-card">
            <div className="zhaowu-visual-card-title">
              <p>{copy.season}</p>
              <h5>{model.season.title}</h5>
              <span>{model.season.seasonLabel}</span>
            </div>
            <ReportSpriteArtwork asset={seasonAsset} alt={model.season.imageAlt} fallbackText={copy.imageFallback} />
            <p className="zhaowu-visual-summary">{model.season.summary}</p>
            <div className="zhaowu-season-period">
              <span>{copy.period}</span>
              <b>{model.season.startTerm}</b>
              <i aria-hidden="true">→</i>
              <b>{model.season.endTerm}</b>
            </div>
          </article>
        ) : null}

        {active === "elements" ? (
          <article className="zhaowu-visual-card zhaowu-elements-card">
            <div className="zhaowu-visual-card-title">
              <p>{copy.elements}</p>
              <h5>{copy.ratio}</h5>
              <span>{model.elements.strengthLabel}</span>
            </div>
            <FiveElementWheel rows={model.elements.rows} ariaLabel={copy.ratio} />
            <div className="zhaowu-element-bars" aria-label={copy.ratio}>
              {model.elements.rows.map((row) => (
                <div key={row.element} className={`zhaowu-element-bar ${ELEMENT_CLASS[row.element]}`}>
                  <span>{row.label}</span>
                  <div><i style={{ width: `${Math.min(100, row.percent)}%` }} /></div>
                  <b>{row.percent}%</b>
                </div>
              ))}
            </div>
            <div className="zhaowu-element-judgement">
              <div><span>{model.elements.usefulLabel}</span><b>{model.elements.useful}</b></div>
              <div><span>{model.elements.restraintLabel}</span><b>{model.elements.restraint}</b></div>
            </div>
            <p className={`zhaowu-visual-note ${model.elements.provisional ? "is-provisional" : ""}`}>{model.elements.note}</p>
          </article>
        ) : null}
      </div>

      <p className="zhaowu-visual-watermark" aria-hidden="true">STONE 原創</p>
    </section>
  );
}
