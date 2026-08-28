import { useI18n } from "@/lib/i18n";
import type { ReportSection } from "@/lib/report/focused-report";
import { ReportDragonSticker } from "@/components/report-dragon-sticker";

const COPY = {
  "zh-Hant": {
    title: "完整報告",
    lead: "一份完整總結，接著單獨標出身體需要注意的地方",
    artAlt: "昭梧天龍八部與東方吉祥意象",
    kicker: "ZHAOWU · 東方吉祥紋樣 × 命理敘事",
    marksAria: "昭梧吉祥紋樣",
  },
  "zh-Hans": {
    title: "完整报告",
    lead: "一份完整总结，接着单独标出身体需要注意的地方",
    artAlt: "昭梧天龙八部与东方吉祥意象",
    kicker: "ZHAOWU · 东方吉祥纹样 × 命理叙事",
    marksAria: "昭梧吉祥纹样",
  },
  en: {
    title: "Full report",
    lead: "One complete summary, followed by the body areas worth watching",
    artAlt: "Zhaowu Tianlong and East Asian auspicious visual",
    kicker: "ZHAOWU · AUSPICIOUS MOTIFS × DESTINY NARRATIVE",
    marksAria: "Zhaowu auspicious motifs",
  },
} as const;

const SECTION_TITLES = {
  "zh-Hant": {
    summary: "總體概括",
    body: "身體需要注意",
    conclusion: "總體概括",
    basis: "命理依據",
    timing: "時間與節奏",
    action: "現實行動",
    relationship: "關係條件",
  },
  "zh-Hans": {
    summary: "总体概括",
    body: "身体需要注意",
    conclusion: "总体概括",
    basis: "命理依据",
    timing: "时间与节奏",
    action: "现实行动",
    relationship: "关系条件",
  },
  en: {
    summary: "Overall summary",
    body: "Body areas to watch",
    conclusion: "Overall summary",
    basis: "Chart basis",
    timing: "Timing and rhythm",
    action: "Practical action",
    relationship: "Relationship conditions",
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

function normalizeReportLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function uniqueLines(lines: string[]): string[] {
  return lines.filter((line, index, body) => {
    const normalized = normalizeReportLine(line);
    return Boolean(normalized) && body.findIndex((candidate) => normalizeReportLine(candidate) === normalized) === index;
  });
}

function normalizeDisplaySections(sections: ReportSection[]): ReportSection[] {
  if (sections.some((section) => section.key === "summary" || section.key === "body")) return sections;
  if (!sections.length) return [];
  return [{
    ...sections[0],
    sectionNo: 1,
    pageNo: 1,
    key: "summary",
    body: uniqueLines(sections.flatMap((section) => section.body)),
  }];
}

export function FocusedReportSections({ sections }: { sections: ReportSection[] }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const visibleSections = normalizeDisplaySections(sections);

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
        {visibleSections.map((section, index) => {
          const ornament = REPORT_ORNAMENTS[index % REPORT_ORNAMENTS.length];
          const localizedTitle = SECTION_TITLES[locale][section.key] ?? section.title;
          const visibleBody = uniqueLines(section.body);

          return (
            <article key={section.key} className="zhaowu-report-section rounded-xl border border-line bg-paper/70 p-4 sm:p-5">
              <img src={ornament.src} alt="" aria-hidden className="zhaowu-report-ornament" onError={(event) => { event.currentTarget.hidden = true; }} />
              <div className="zhaowu-report-section-heading">
                <h4 className="font-display text-xl leading-8 tracking-[0.03em] text-ink">{localizedTitle}</h4>
                <ReportDragonSticker section={section} />
              </div>
              <div className="zhaowu-report-section-body mt-3 space-y-3 text-sm leading-7 text-ink-soft">
                {visibleBody.map((line, lineIndex) => <p key={lineIndex} className="whitespace-pre-line">{line}</p>)}
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
