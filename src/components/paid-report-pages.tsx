import { useI18n } from "@/lib/i18n";
import type { ReportSection } from "@/lib/report/focused-report";
import { ReportDragonSticker } from "@/components/report-dragon-sticker";

const COPY = {
  "zh-Hant": {
    title: "完整報告",
    lead: "只保留真正影響這一問的結論、時間與下一步",
    artAlt: "昭梧東方吉祥意象",
    kicker: "ZHAOWU · 東方吉祥紋樣 × 人生節奏",
    marksAria: "昭梧吉祥紋樣",
    basisDetails: "命理依據（展開查看）",
  },
  "zh-Hans": {
    title: "完整报告",
    lead: "只保留真正影响这一问的结论、时间与下一步",
    artAlt: "昭梧东方吉祥意象",
    kicker: "ZHAOWU · 东方吉祥纹样 × 人生节奏",
    marksAria: "昭梧吉祥纹样",
    basisDetails: "命理依据（展开查看）",
  },
  en: {
    title: "Full report",
    lead: "Clear, practical guidance for this question",
    artAlt: "Zhaowu East Asian auspicious visual",
    kicker: "ZHAOWU · PERSONAL GUIDANCE",
    marksAria: "Zhaowu auspicious motifs",
    basisDetails: "Background notes",
  },
} as const;

const SECTION_TITLES = {
  "zh-Hant": {
    conclusion: "直接結論",
    basis: "命理依據",
    timing: "時間與節奏",
    action: "下一步",
    relationship: "關係條件",
  },
  "zh-Hans": {
    conclusion: "直接结论",
    basis: "命理依据",
    timing: "时间与节奏",
    action: "下一步",
    relationship: "关系条件",
  },
  en: {
    conclusion: "Bottom line",
    basis: "What matters",
    timing: "Timing",
    action: "What to do next",
    relationship: "What to look for",
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

const ENGLISH_TECHNICAL = /\b(?:bazi|four pillars?|day master|month command|month branch|heavenly stems?|earthly branches?|ten[- ]year cycle|luck pillar|useful god|favourable element|favorable element|seven killings?|direct resource|indirect resource|output star|wealth star|companion star|jia|yi|bing|ding|wu|ji|geng|xin|ren|gui|zi|chou|yin|mao|chen|si|wei|shen|you|xu|hai)\b/i;

function normalizeReportLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function visibleLines(section: ReportSection, locale: "zh-Hant" | "zh-Hans" | "en", timingLines: Set<string>) {
  const unique = section.body.filter((line, lineIndex, body) => {
    const normalized = normalizeReportLine(line);
    return Boolean(normalized) && body.findIndex((candidate) => normalizeReportLine(candidate) === normalized) === lineIndex;
  });
  const noTimingDuplicate = section.key === "basis"
    ? unique.filter((line) => !timingLines.has(normalizeReportLine(line)))
    : unique;
  const safe = locale === "en" ? noTimingDuplicate.filter((line) => !ENGLISH_TECHNICAL.test(line)) : noTimingDuplicate;
  return safe.map((line) => line.trim()).filter(Boolean);
}

export function FocusedReportSections({ sections }: { sections: ReportSection[] }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const timingLines = new Set(
    sections
      .filter((section) => section.key === "timing")
      .flatMap((section) => section.body)
      .map(normalizeReportLine)
      .filter(Boolean),
  );

  const prepared = sections
    .map((section) => ({ section, body: visibleLines(section, locale, timingLines) }))
    .filter((item) => item.body.length > 0);

  // English customers never see a translated Bazi-basis section. The English report is a separate plain-language product.
  const mainSections = prepared.filter(({ section }) => section.key !== "basis");
  const basis = locale === "en" ? null : prepared.find(({ section }) => section.key === "basis") ?? null;

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

      <div className="zhaowu-auspicious-rail border-b border-line/60 bg-[#f1e4c8] px-4 py-3">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2 sm:grid-cols-8" aria-label={copy.marksAria}>
          {REPORT_ORNAMENTS.map((mark) => (
            <figure key={mark.src} className="flex min-w-0 flex-col items-center gap-1.5">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-[#a97c3d]/40 bg-[#f8edd5] shadow-[0_6px_16px_rgba(83,55,23,.10)]">
                <img src={mark.src} alt="" aria-hidden className="h-12 w-12 object-contain" onError={(event) => { event.currentTarget.hidden = true; }} />
              </span>
              <figcaption className="text-[9px] tracking-[0.08em] text-[#745326]">{mark.label[locale]}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-7">
        {mainSections.map(({ section, body }, index) => {
          const ornament = REPORT_ORNAMENTS[index % REPORT_ORNAMENTS.length];
          const localizedTitle = SECTION_TITLES[locale][section.key] ?? section.title;
          return (
            <article key={`${section.key}-${index}`} className="zhaowu-report-section rounded-xl border border-line bg-paper/70 p-4 sm:p-5">
              <img src={ornament.src} alt="" aria-hidden className="zhaowu-report-ornament" onError={(event) => { event.currentTarget.hidden = true; }} />
              <div className="zhaowu-report-section-heading">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#b08a49]/40 bg-[#ead8b6] font-display text-sm text-[#744d22]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h4 className="font-display text-xl leading-8 tracking-[0.03em] text-ink">{localizedTitle}</h4>
                </div>
                <ReportDragonSticker section={section} />
              </div>
              <div className="zhaowu-report-section-body mt-3 space-y-3 text-sm leading-7 text-ink-soft">
                {body.map((line, lineIndex) => <p key={lineIndex} className="whitespace-pre-line">{line}</p>)}
              </div>
            </article>
          );
        })}

        {basis ? (
          <details className="zhaowu-report-basis rounded-xl border border-[#b28d54]/30 bg-[#ead9b8]/48 px-4 py-3">
            <summary className="cursor-pointer font-display text-sm tracking-[0.05em] text-[#79562d]">{copy.basisDetails}</summary>
            <div className="mt-3 space-y-2 border-t border-[#b28d54]/20 pt-3 text-xs leading-6 text-ink-soft">
              {basis.body.map((line, index) => <p key={index}>{line}</p>)}
            </div>
          </details>
        ) : null}
      </div>
    </section>
  );
}

/** Legacy export name kept temporarily so old imports do not hard-fail during deployment transitions. */
export const PaidReportPages = FocusedReportSections;
