import { useI18n } from "@/lib/i18n";
import type { ReportSection } from "@/lib/report/focused-report";
import { ReportDragonSticker } from "@/components/report-dragon-sticker";

const COPY = {
  "zh-Hant": {
    title: "完整報告",
    lead: "只保留與你這一問直接相關的內容",
    artAlt: "昭梧天龍八部與東方吉祥意象",
    kicker: "ZHAOWU · 東方吉祥紋樣 × 命理敘事",
    marksAria: "昭梧吉祥紋樣",
  },
  "zh-Hans": {
    title: "完整报告",
    lead: "只保留与你这一问直接相关的内容",
    artAlt: "昭梧天龙八部与东方吉祥意象",
    kicker: "ZHAOWU · 东方吉祥纹样 × 命理叙事",
    marksAria: "昭梧吉祥纹样",
  },
  en: {
    title: "Full report",
    lead: "Only what directly serves this question",
    artAlt: "Zhaowu Tianlong and East Asian auspicious visual",
    kicker: "ZHAOWU · AUSPICIOUS MOTIFS × DESTINY NARRATIVE",
    marksAria: "Zhaowu auspicious motifs",
  },
} as const;

const REPORT_ORNAMENTS = [
  { src: "/ornaments/generated/phoenix.webp", label: { "zh-Hant": "鳳儀", "zh-Hans": "凤仪", en: "Phoenix" } },
  { src: "/ornaments/generated/celestial-pearl.webp", label: { "zh-Hant": "星珠", "zh-Hans": "星珠", en: "Celestial pearl" } },
  { src: "/ornaments/generated/lotus.webp", label: { "zh-Hant": "蓮華", "zh-Hans": "莲华", en: "Lotus" } },
  { src: "/ornaments/generated/dragon.webp", label: { "zh-Hant": "雲龍", "zh-Hans": "云龙", en: "Cloud dragon" } },
  { src: "/ornaments/generated/pomegranate.webp", label: { "zh-Hant": "福果", "zh-Hans": "福果", en: "Pomegranate" } },
  { src: "/ornaments/generated/endless-knot.webp", label: { "zh-Hant": "盤長", "zh-Hans": "盘长", en: "Endless knot" } },
  { src: "/ornaments/generated/twin-fish.webp", label: { "zh-Hant": "雙鯉", "zh-Hans": "双鲤", en: "Twin fish" } },
  { src: "/ornaments/generated/crane.webp", label: { "zh-Hant": "雲鶴", "zh-Hans": "云鹤", en: "Crane" } },
] as const;

export function FocusedReportSections({ sections }: { sections: ReportSection[] }) {
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <section className="zhaowu-focused-report seal-border overflow-hidden rounded-[1.5rem] bg-cream/95" aria-labelledby="focused-report-title">
      <div className="zhaowu-report-visual relative min-h-40 overflow-hidden border-b border-line/70 sm:min-h-48">
        <img src="/ornaments/generated/phoenix.webp" alt="" aria-hidden className="zhaowu-report-hero-phoenix" onError={(event) => { event.currentTarget.hidden = true; }} />
        <img src="/ornaments/generated/celestial-pearl.webp" alt="" aria-hidden className="zhaowu-report-hero-pearl" onError={(event) => { event.currentTarget.hidden = true; }} />
        <img src="/ornaments/generated/lotus.webp" alt="" aria-hidden className="zhaowu-report-hero-lotus" onError={(event) => { event.currentTarget.hidden = true; }} />
        <div className="zhaowu-report-visual-shade absolute inset-0" aria-hidden />
        <div className="relative z-10 flex min-h-40 flex-col justify-end p-5 sm:min-h-48 sm:p-7">
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#d9b66f]">{copy.kicker}</p>
          <h3 id="focused-report-title" className="mt-2 font-display text-2xl tracking-[0.05em] text-[#fff8e8] sm:text-3xl">{copy.title}</h3>
          <p className="mt-2 max-w-xl text-xs leading-6 text-[#efe4cf]/85 sm:text-sm">{copy.lead}</p>
        </div>
      </div>

      <div className="zhaowu-auspicious-rail border-b border-line/60 bg-[#f7f0e2] px-4 py-3">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2 sm:grid-cols-8" aria-label={copy.marksAria}>
          {REPORT_ORNAMENTS.map((mark) => (
            <figure key={mark.src} className="flex min-w-0 flex-col items-center gap-1.5">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-[#c9a863]/40 bg-[#fffaf0] shadow-[0_6px_16px_rgba(108,77,29,.08)]">
                <img src={mark.src} alt="" aria-hidden className="h-12 w-12 object-contain" onError={(event) => { event.currentTarget.hidden = true; }} />
              </span>
              <figcaption className="text-[9px] tracking-[0.08em] text-[#82663d]">{mark.label[locale]}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-7">
        {sections.map((section, index) => {
          const ornament = REPORT_ORNAMENTS[index % REPORT_ORNAMENTS.length];
          return (
            <article key={section.key} className="zhaowu-report-section rounded-xl border border-line bg-paper/70 p-4 sm:p-5">
              <img src={ornament.src} alt="" aria-hidden className="zhaowu-report-ornament" onError={(event) => { event.currentTarget.hidden = true; }} />
              <div className="zhaowu-report-section-heading">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#b08a49]/35 bg-[#f4ead6] font-display text-sm text-[#8a632f]">
                    {String(section.sectionNo).padStart(2, "0")}
                  </span>
                  <h4 className="font-display text-xl leading-8 tracking-[0.03em] text-ink">{section.title}</h4>
                </div>
                <ReportDragonSticker section={section} />
              </div>
              <div className="zhaowu-report-section-body mt-3 space-y-3 text-sm leading-7 text-ink-soft">
                {section.body.map((line, lineIndex) => <p key={lineIndex} className="whitespace-pre-line">{line}</p>)}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/** Legacy export name kept temporarily so old imports do not hard-fail during deployment transitions. */
export const PaidReportPages = FocusedReportSections;
