import { useI18n } from "@/lib/i18n";
import type { NinePage } from "@/lib/report/nine-page";

const COPY = {
  "zh-Hant": {
    title: "完整報告",
    page: "頁",
  },
  "zh-Hans": {
    title: "完整报告",
    page: "页",
  },
  en: {
    title: "Full report",
    page: "Page",
  },
} as const;

export function PaidReportPages({ pages }: { pages: NinePage[] }) {
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <section className="seal-border rounded-[1.5rem] bg-cream/95 p-5 sm:p-7" aria-labelledby="paid-nine-title">
      <h3 id="paid-nine-title" className="font-display text-2xl tracking-[0.04em] text-ink">{copy.title}</h3>

      <div className="mt-5 space-y-4">
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
