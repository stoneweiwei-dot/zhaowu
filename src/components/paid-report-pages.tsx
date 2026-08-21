import { Mark } from "@/components/marks";
import { useI18n } from "@/lib/i18n";
import { paidReportStyle } from "@/lib/report/paid-report-style";
import type { NinePage } from "@/lib/report/nine-page";

const PAGE_VISUAL: Record<string, { mark: string; label: string; gradient: string }> = {
  question: { mark: "05", label: "命局總像", gradient: "from-[#d5ad58] via-[#d7c39a] to-[#16372f]" },
  chart: { mark: "brand", label: "四柱命盤", gradient: "from-[#efe5d2] via-[#cdbb98] to-[#8f948a]" },
  rhythm: { mark: "07", label: "內在節奏", gradient: "from-[#1b3e46] via-[#547983] to-[#d8c89f]" },
  themes: { mark: "11", label: "現實映射", gradient: "from-[#bda36e] via-[#9a8d72] to-[#31493f]" },
  decree: { mark: "04", label: "個人命誥", gradient: "from-[#122f2a] via-[#315546] to-[#c29b53]" },
  practice: { mark: "16", label: "行動路徑", gradient: "from-[#6f7c65] via-[#c9b992] to-[#e6d2a5]" },
  guide: { mark: "02", label: "生活取象", gradient: "from-[#ddd1b8] via-[#aeb89d] to-[#697b64]" },
  priority: { mark: "17", label: "此刻所行", gradient: "from-[#b78345] via-[#d4a65c] to-[#303f35]" },
  close: { mark: "brand", label: "收藏終章", gradient: "from-[#eee5d6] via-[#d4c29e] to-[#8f7650]" },
};

const COPY = {
  "zh-Hant": {
    title: "昭梧｜專屬九頁收藏報告",
    lead: "每一頁只承載一個主要結論。命理先成立，視覺再負責把它留下來。",
    swipe: "左右滑動查看 9:16 報告頁",
    trace: "命局證據 → 人生含義 → 視覺象徵",
  },
  "zh-Hans": {
    title: "昭梧｜专属九页收藏报告",
    lead: "每一页只承载一个主要结论。命理先成立，视觉再负责把它留下来。",
    swipe: "左右滑动查看 9:16 报告页",
    trace: "命局证据 → 人生含义 → 视觉象征",
  },
  en: {
    title: "Zhaowu · Nine-page collectible report",
    lead: "One major conclusion per page. The judgement comes first; the visual layer makes it memorable.",
    swipe: "Swipe horizontally through the 9:16 pages",
    trace: "Chart evidence → life meaning → visual symbol",
  },
} as const;

export function PaidReportPages({ pages }: { pages: NinePage[] }) {
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <section className="seal-border overflow-hidden rounded-[1.6rem] bg-[#eee5d5]/95 p-4 sm:p-6" aria-labelledby="paid-nine-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.26em] text-cinnabar">{paidReportStyle.id}</p>
          <h3 id="paid-nine-title" className="mt-2 font-display text-xl tracking-[0.04em] text-ink sm:text-2xl">{copy.title}</h3>
          <p className="mt-2 max-w-2xl text-xs leading-6 text-ink-soft sm:text-sm">{copy.lead}</p>
        </div>
        <p className="rounded-full border border-[#aa8954]/35 bg-cream/70 px-3 py-2 text-[10px] tracking-[0.14em] text-ink-mute">{copy.swipe}</p>
      </div>

      <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
        {pages.map((page) => {
          const visual = PAGE_VISUAL[page.key] ?? PAGE_VISUAL.close;
          return (
            <article
              key={page.key}
              className="relative aspect-[9/16] w-[82vw] max-w-[340px] shrink-0 snap-center overflow-hidden rounded-[1.35rem] border border-[#9c7d4d]/35 bg-[#f7efe1] shadow-[0_18px_45px_rgba(77,56,31,.14)]"
            >
              <div className="absolute inset-x-0 top-0 h-[34%] overflow-hidden border-b border-[#a98b58]/20">
                <div className={`absolute inset-0 bg-gradient-to-br ${visual.gradient}`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(255,235,177,.45),transparent_28%),linear-gradient(to_top,rgba(16,38,33,.18),transparent_55%)]" />
                <Mark id={visual.mark} size={170} eager className="absolute -bottom-8 -right-7 w-36 rotate-6 opacity-50" />
                <Mark id={page.pageNo % 2 === 0 ? "11" : "06"} size={90} className="absolute bottom-3 left-3 w-14 opacity-30" />
                <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[10px] tracking-[0.16em] text-white/90">
                  {String(page.pageNo).padStart(2, "0")}
                </div>
                <p className="absolute bottom-4 left-4 font-display text-base tracking-[0.08em] text-[#fff6df]">{visual.label}</p>
              </div>

              <div className="absolute inset-x-0 bottom-0 top-[34%] flex flex-col px-5 pb-5 pt-5">
                <p className="text-[9px] tracking-[0.2em] text-cinnabar">ZHAOWU · FOUR PILLARS IN ART</p>
                <h4 className="mt-2 font-display text-[1.35rem] leading-8 tracking-[0.04em] text-ink">{page.title}</h4>
                <div className="mt-4 space-y-2.5 overflow-hidden text-[12px] leading-6 text-ink-soft">
                  {page.body.slice(0, 4).map((line, index) => <p key={index}>{line}</p>)}
                </div>
                <div className="mt-auto border-t border-[#aa8954]/25 pt-3">
                  <p className="text-[9px] leading-4 tracking-[0.08em] text-ink-mute">{copy.trace}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-display text-xs tracking-[0.12em] text-ink">昭梧</span>
                    <span className="text-[9px] tracking-[0.12em] text-cinnabar">STONE 原創</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
