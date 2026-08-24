import { useI18n } from "@/lib/i18n";
import type { ReportSection } from "@/lib/report/focused-report";

const COPY = {
  "zh-Hant": {
    title: "完整報告",
    lead: "只保留與你這一問直接相關的內容",
    artAlt: "昭梧天龍八部與佛教吉祥意象",
  },
  "zh-Hans": {
    title: "完整报告",
    lead: "只保留与你这一问直接相关的内容",
    artAlt: "昭梧天龙八部与佛教吉祥意象",
  },
  en: {
    title: "Full report",
    lead: "Only what directly serves this question",
    artAlt: "Zhaowu Tianlong and Buddhist auspicious visual",
  },
} as const;

const AUSPICIOUS_MARKS = [
  { src: "/emblems/dharma-wheel-emblem.svg", alt: "法輪" },
  { src: "/emblems/lotus-emblem.svg", alt: "蓮花" },
  { src: "/emblems/modern-endless-knot-emblem.svg", alt: "盤長結" },
  { src: "/emblems/modern-conch-emblem.svg", alt: "法螺" },
  { src: "/emblems/modern-golden-fish-emblem.svg", alt: "雙魚" },
  { src: "/emblems/treasure-vase-emblem.svg", alt: "寶瓶" },
  { src: "/emblems/modern-parasol-emblem.svg", alt: "寶傘" },
  { src: "/emblems/modern-victory-banner-emblem.svg", alt: "勝利幢" },
] as const;

export function FocusedReportSections({ sections }: { sections: ReportSection[] }) {
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <section className="zhaowu-focused-report seal-border overflow-hidden rounded-[1.5rem] bg-cream/95" aria-labelledby="focused-report-title">
      <div className="zhaowu-report-visual relative min-h-40 overflow-hidden border-b border-line/70 sm:min-h-48">
        <img
          src="/visuals/tianlong-report-hero.jpg"
          alt={copy.artAlt}
          className="absolute inset-0 h-full w-full object-cover object-[50%_36%]"
        />
        <div className="zhaowu-report-visual-shade absolute inset-0" aria-hidden />
        <div className="relative z-10 flex min-h-40 flex-col justify-end p-5 sm:min-h-48 sm:p-7">
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#d9b66f]">ZHAOWU · 天龍八部 × 佛教八吉祥</p>
          <h3 id="focused-report-title" className="mt-2 font-display text-2xl tracking-[0.05em] text-[#fff8e8] sm:text-3xl">{copy.title}</h3>
          <p className="mt-2 max-w-xl text-xs leading-6 text-[#efe4cf]/85 sm:text-sm">{copy.lead}</p>
        </div>
      </div>

      <div className="zhaowu-auspicious-rail border-b border-line/60 bg-[#f7f0e2] px-4 py-3">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2 sm:grid-cols-8" aria-label="佛教八吉祥">
          {AUSPICIOUS_MARKS.map((mark) => (
            <figure key={mark.src} className="flex min-w-0 flex-col items-center gap-1">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-[#c9a863]/45 bg-[#fffaf0] shadow-[0_5px_14px_rgba(108,77,29,.08)]">
                <img src={mark.src} alt="" aria-hidden className="h-8 w-8 object-contain" />
              </span>
              <figcaption className="text-[9px] tracking-[0.08em] text-[#82663d]">{mark.alt}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-7">
        {sections.map((section) => (
          <article key={section.key} className="zhaowu-report-section rounded-xl border border-line bg-paper/70 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#b08a49]/35 bg-[#f4ead6] font-display text-sm text-[#8a632f]">
                {String(section.sectionNo).padStart(2, "0")}
              </span>
              <h4 className="font-display text-xl leading-8 tracking-[0.03em] text-ink">{section.title}</h4>
            </div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-ink-soft">
              {section.body.map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/** Legacy export name kept temporarily so old imports do not hard-fail during deployment transitions. */
export const PaidReportPages = FocusedReportSections;
