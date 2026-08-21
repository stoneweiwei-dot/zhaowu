import { useI18n } from "@/lib/i18n";
import type { NinePage } from "@/lib/report/nine-page";

const COPY = {
  "zh-Hant": {
    kicker: "完整報告",
    title: "昭梧｜專屬九頁報告",
    lead: "按順序閱讀：先看結論，再看命盤依據與現實行動。全部內容都以可閱讀、可核對的文字呈現。",
    page: "頁",
  },
  "zh-Hans": {
    kicker: "完整报告",
    title: "昭梧｜专属九页报告",
    lead: "按顺序阅读：先看结论，再看命盘依据与现实行动。全部内容都以可阅读、可核对的文字呈现。",
    page: "页",
  },
  en: {
    kicker: "FULL REPORT",
    title: "Zhaowu · Nine-page report",
    lead: "Read in order: conclusion first, then chart context and practical actions. Everything is presented as readable, verifiable text.",
    page: "Page",
  },
} as const;

export function PaidReportPages({ pages }: { pages: NinePage[] }) {
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <section className="seal-border rounded-[1.5rem] bg-cream/95 p-5 sm:p-7" aria-labelledby="paid-nine-title">
      <p className="text-[10px] font-semibold tracking-[0.26em] text-cinnabar">{copy.kicker}</p>
      <h3 id="paid-nine-title" className="mt-2 font-display text-2xl tracking-[0.04em] text-ink">{copy.title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">{copy.lead}</p>

      <div className="mt-6 space-y-4">
        {pages.map((page) => (
          <article key={page.key} className="rounded-xl border border-line bg-paper/45 p-4 sm:p-5">
            <div className="flex items-baseline gap-3">
              <span className="shrink-0 font-display text-xl text-cinnabar">{String(page.pageNo).padStart(2, "0")}</span>
              <p className="text-[10px] tracking-[0.2em] text-ink-mute">{copy.page}</p>
            </div>
            <h4 className="mt-2 font-display text-xl leading-8 tracking-[0.03em] text-ink">{page.title}</h4>
            <div className="mt-3 space-y-3 text-sm leading-7 text-ink-soft">
              {page.body.map((line, index) => <p key={index} className="whitespace-pre-line">{line}</p>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
