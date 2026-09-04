import { useMemo } from "react";
import type { AnalysisResult } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { buildReportLuckModel } from "@/lib/report/report-luck-model";
import { getLuckVisualAsset } from "@/lib/report/report-visual-assets";
import { ReportSpriteArtwork } from "@/components/report-sprite-artwork";

function periodAge(locale: "zh-Hant" | "zh-Hans" | "en", startAge: number, endAge: number) {
  if (locale === "en") return `age ${startAge}–${endAge}`;
  return `${startAge}–${endAge}${locale === "zh-Hans" ? "岁" : "歲"}`;
}

function periodYears(startYear: number, endYear: number) {
  return `${startYear}–${endYear}`;
}

export function ReportLuckBook({ result }: { result: AnalysisResult }) {
  const { locale } = useI18n();
  const model = useMemo(() => buildReportLuckModel(result.chart, locale), [result.chart, locale]);
  const currentAsset = model.current && model.timingAvailable ? getLuckVisualAsset(model.current.ganZhi) : null;
  const annualAsset = getLuckVisualAsset(model.annualStemBranch);
  const imageFallback = locale === "en"
    ? "The matching timing artwork did not load. Timing and report text are unaffected."
    : locale === "zh-Hans"
      ? "运势母图未载入，时间线与报告文字不受影响。"
      : "運勢母圖未載入，時間線與報告文字不受影響。";

  return (
    <section className="zhaowu-luck-book" aria-labelledby="zhaowu-luck-book-title">
      <header className="zhaowu-luck-head">
        <p>ZHAOWU · {locale === "en" ? "TIMING MAP" : locale === "zh-Hans" ? "运之书" : "運之書"}</p>
        <h4 id="zhaowu-luck-book-title">{model.title}</h4>
        <span>{model.subtitle}</span>
      </header>

      <div className="zhaowu-luck-current-grid">
        <article className="zhaowu-luck-current-card">
          <span>{model.currentLabel}</span>
          {model.current && model.timingAvailable ? (
            <>
              <b>{model.current.ganZhi}</b>
              <p>{periodYears(model.current.startYear, model.current.endYear)}</p>
              <small>{periodAge(locale, model.current.startAge, model.current.endAge)}</small>
            </>
          ) : (
            <>
              <b>—</b>
              <p>{model.unknownTimeNote ?? (locale === "en" ? "No current period is available from this chart." : locale === "zh-Hans" ? "当前排盘没有可用的大运时间。" : "目前排盤沒有可用的大運時間。")}</p>
            </>
          )}
        </article>

        <article className="zhaowu-luck-current-card is-year">
          <span>{model.annualLabel}</span>
          <b>{model.annualStemBranch}</b>
          <p>{locale === "en" ? "Year layer from the existing chart" : locale === "zh-Hans" ? "沿用现有排盘的当年层" : "沿用現有排盤的當年層"}</p>
        </article>
      </div>

      {currentAsset || annualAsset ? (
        <div className="zhaowu-luck-visual-grid" aria-label={locale === "en" ? "Symbolic timing artwork" : locale === "zh-Hans" ? "运势意象图" : "運勢意象圖"}>
          {currentAsset && model.current ? (
            <article className="zhaowu-luck-visual-card">
              <span>{model.currentLabel} · {model.current.ganZhi}</span>
              <ReportSpriteArtwork asset={currentAsset} alt={`${model.currentLabel} ${model.current.ganZhi}`} fallbackText={imageFallback} compact />
            </article>
          ) : null}
          {annualAsset ? (
            <article className="zhaowu-luck-visual-card">
              <span>{model.annualLabel} · {model.annualStemBranch}</span>
              <ReportSpriteArtwork asset={annualAsset} alt={`${model.annualLabel} ${model.annualStemBranch}`} fallbackText={imageFallback} compact />
            </article>
          ) : null}
        </div>
      ) : null}

      <div className="zhaowu-luck-timeline-block">
        <div className="zhaowu-luck-timeline-head">
          <h5>{model.timelineLabel}</h5>
          <span>{model.timingAvailable ? (locale === "en" ? `${model.periods.length} periods` : `${model.periods.length}${locale === "zh-Hans" ? "步" : "步"}`) : "—"}</span>
        </div>

        {model.timingAvailable ? (
          <div className="zhaowu-luck-timeline" role="list" aria-label={model.timelineLabel}>
            {model.periods.map((period) => (
              <article key={`${period.ganZhi}-${period.startYear}`} role="listitem" className={`zhaowu-luck-period ${period.current ? "is-current" : ""}`}>
                <i aria-hidden="true" />
                <b>{period.ganZhi}</b>
                <span>{periodYears(period.startYear, period.endYear)}</span>
                <small>{periodAge(locale, period.startAge, period.endAge)}</small>
                {period.current ? <em>{locale === "en" ? "NOW" : locale === "zh-Hans" ? "当前" : "當前"}</em> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="zhaowu-luck-unavailable">
            <p>{model.unknownTimeNote ?? (locale === "en" ? "Timing periods are not available for this chart." : locale === "zh-Hans" ? "此命盘暂没有可用的大运时间线。" : "此命盤暫沒有可用的大運時間線。")}</p>
          </div>
        )}
      </div>

      <p className="zhaowu-luck-boundary">{model.boundaryNote}</p>
      <p className="zhaowu-luck-watermark" aria-hidden="true">STONE 原創</p>
    </section>
  );
}
