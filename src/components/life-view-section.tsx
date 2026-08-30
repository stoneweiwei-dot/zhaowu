import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { LIFE_VIEW_ARTICLES } from "@/lib/life-view";

export function LifeViewSection() {
  const { locale } = useI18n();
  const copy = useMemo(() => {
    if (locale === "en") {
      return {
        kicker: "STONE · NOTES",
        title: "Zhaowu · Notes on Life",
        lead: "Events leave traces; people act from causes. See the pattern, know the timing.",
        empty: "Articles will be added here over time.",
        open: "Read",
      };
    }
    if (locale === "zh-Hans") {
      return {
        kicker: "STONE · 观世",
        title: "昭梧 · 观世录",
        lead: "世事有迹，人心有因；见其势，知其时。",
        empty: "文章会在这里持续更新。",
        open: "阅读全文",
      };
    }
    return {
      kicker: "STONE · 觀世",
      title: "昭梧 · 觀世錄",
      lead: "世事有跡，人心有因；見其勢，知其時。",
      empty: "文章會在這裡持續更新。",
      open: "閱讀全文",
    };
  }, [locale]);

  return (
    <section
      id="life-view"
      className="scroll-mt-20 rounded-[1.75rem] border border-line/80 bg-[#fbf5e9] px-5 py-6 shadow-[0_14px_38px_rgba(86,62,31,0.08)] sm:px-8 sm:py-8"
      aria-labelledby="life-view-title"
    >
      <header className="max-w-2xl">
        <p className="text-[10px] font-medium tracking-[0.24em] text-cinnabar">{copy.kicker}</p>
        <h2 id="life-view-title" className="mt-2 font-display text-2xl tracking-[0.08em] text-ink sm:text-3xl">
          {copy.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft sm:text-[15px]">{copy.lead}</p>
      </header>

      {LIFE_VIEW_ARTICLES.length ? (
        <div className="mt-6 divide-y divide-line/70 border-y border-line/70">
          {LIFE_VIEW_ARTICLES.map((article) => (
            <details key={article.id} className="group py-5">
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <time className="text-[10px] tracking-[0.16em] text-ink-mute" dateTime={article.publishedAt}>
                      {article.publishedAt}
                    </time>
                    <h3 className="mt-1 font-display text-lg leading-7 text-ink">{article.title[locale]}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">{article.summary[locale]}</p>
                  </div>
                  <span className="shrink-0 pt-5 text-xs text-cinnabar group-open:hidden">{copy.open} ＋</span>
                  <span className="hidden shrink-0 pt-5 text-xs text-cinnabar group-open:inline">−</span>
                </div>
              </summary>
              <div className="mt-5 space-y-4 border-l border-cinnabar/25 pl-4 text-[15px] leading-8 text-ink">
                {article.body[locale].split(/\n\n+/).map((paragraph, index) => (
                  <p key={`${article.id}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="mt-6 border-t border-line/70 pt-5 text-sm tracking-[0.04em] text-ink-mute">{copy.empty}</p>
      )}
    </section>
  );
}
