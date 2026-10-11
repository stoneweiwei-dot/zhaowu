import type { AnalysisResult } from "@/lib/bazi/types";
import { ReportSpriteArtwork } from "@/components/report-sprite-artwork";
import { useI18n, type Locale } from "@/lib/i18n";
import { getReportVisualAsset } from "@/lib/report/report-visual-assets";
import { buildReportVisualModel } from "@/lib/report/report-visual-model";
import "./day-stem-portrait.css";

/** Visual names only. This catalogue never supplies chart or fortune judgements. */
const STEM_ENGLISH: Record<string, string> = {
  甲: "Jia · Yang Wood",
  乙: "Yi · Yin Wood",
  丙: "Bing · Yang Fire",
  丁: "Ding · Yin Fire",
  戊: "Wu · Yang Earth",
  己: "Ji · Yin Earth",
  庚: "Geng · Yang Metal",
  辛: "Xin · Yin Metal",
  壬: "Ren · Yang Water",
  癸: "Gui · Yin Water",
};

const COPY: Record<Locale, {
  eyebrow: string;
  heading: string;
  imageNote: string;
  artworkUnavailable: string;
}> = {
  "zh-Hant": {
    eyebrow: "昭梧 · 十天干靈象",
    heading: "日主靈象",
    imageNote: "此為天干本象的視覺比喻；實際命局仍依月令、格局、根氣與制化判斷。",
    artworkUnavailable: "插畫暫無法顯示，命書文字與推算結果不受影響。",
  },
  "zh-Hans": {
    eyebrow: "昭梧 · 十天干灵象",
    heading: "日主灵象",
    imageNote: "这是天干本象的视觉比喻；实际命局仍依月令、格局、根气与制化判断。",
    artworkUnavailable: "插画暂无法显示，命书文字与推算结果不受影响。",
  },
  en: {
    eyebrow: "ZHAOWU · TEN STEMS",
    heading: "Your day-stem portrait",
    imageNote: "This is symbolic artwork, not a verdict. The full reading still depends on the birth season and how the chart works together.",
    artworkUnavailable: "Artwork unavailable. Your chart and written reading are unaffected.",
  },
};

/**
 * This is a report-only placement, not a homepage mascot or a parallel reading engine.
 * Until the newly approved character artwork is committed, the reviewed ten-stem
 * report mother images remain the source. Never substitute reference-site screenshots.
 */
export function DayStemPortrait({ result }: { result: AnalysisResult }) {
  const { locale } = useI18n();
  if (!result?.chart) return null;
  const model = buildReportVisualModel(result.chart, locale);
  const stem = model.dayMaster.stem;
  const english = STEM_ENGLISH[stem];
  if (!english) return null;
  const art = getReportVisualAsset("day-master", model.dayMaster.visualKey);
  const isYin = model.dayMaster.yinYang === "陰";
  const copy = COPY[locale];

  return (
    <section className={`zhaowu-day-stem-portrait ${isYin ? "is-yin" : "is-yang"}`} aria-label={copy.heading}>
      <header className="zhaowu-day-stem-portrait__head">
        <span className="zhaowu-day-stem-portrait__eyebrow">{copy.eyebrow}</span>
        <h5>
          <strong lang="zh">{stem}</strong>
          <span>{copy.heading}</span>
        </h5>
        <p lang="en">{english}</p>
      </header>
      <ReportSpriteArtwork
        asset={art}
        alt={`${stem} · ${english} · ${model.dayMaster.imageAlt}`}
        fallbackText={copy.artworkUnavailable}
        compact
      />
      <div className="zhaowu-day-stem-portrait__caption">
        <p className="zhaowu-day-stem-portrait__nature">{model.dayMaster.heavenImage}</p>
        <p>{model.dayMaster.keywords.join(" · ")}</p>
        <small>{copy.imageNote}</small>
      </div>
    </section>
  );
}
