import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LIFE_VIEW_CURATED_ARTICLES } from "@/lib/life-view-curated";
import { LIFE_VIEW_LONG_FORM_ARTICLES } from "@/lib/life-view-long-form";
import { LIFE_VIEW_SHORT_FORM_ARTICLES } from "@/lib/life-view-short-form";

// 「觀世錄」沒有文章數量上限。內容可持續新增；首頁只折疊顯示方式，不截斷資料。
const ARTICLES = [...LIFE_VIEW_LONG_FORM_ARTICLES, ...LIFE_VIEW_SHORT_FORM_ARTICLES, ...LIFE_VIEW_CURATED_ARTICLES];
ARTICLES.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function LifeViewHomeSection() {
  const { locale } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const latest = ARTICLES[0] ?? null;

  const copy = useMemo(() => {
    if (locale === "en") {
      return {
        kicker: "STONE · NOTES",
        title: "Zhaowu · Notes on Life",
        lead: "Latest note first. Open the section to browse all published notes.",
        latest: "Latest",
        all: "All notes",
        collapse: "Show less",
        read: "Read",
        empty: "Articles will be added here over time.",
      };
    }
    if (locale === "zh-Hans") {
      return {
        kicker: "STONE · 观世",
        title: "昭梧 · 观世录",
        lead: "首页只看最新一篇；点开这里查看全部已发布文章。",
        latest: "最新",
        all: "全部文章",
        collapse: "收起",
        read: "阅读全文",
        empty: "文章会在这里持续更新。",
      };
    }
    return {
      kicker: "STONE · 觀世",
      title: "昭梧 · 觀世錄",
      lead: "首頁只看最新一篇；點開這裡查看全部已發布文章。",
      latest: "最新",
      all: "全部文章",
      collapse: "收起",
      read: "閱讀全文",
      empty: "文章會在這裡持續更新。",
    };
  }, [locale]);

  if (!latest) {
    return <section id="life-view" className="rounded-2xl border border-line/80 bg-[#fbf5e9] px-5 py-5"><p className="text-sm text-ink-mute">{copy.empty}</p></section>;
  }

  const latestParagraph = latest.body[locale].split(/\n\n+/)[0] ?? "";
  const visibleArticles = showAll ? ARTICLES : [latest];

  return (
    <section id="life-view" className="scroll-mt-20 rounded-2xl border border-line/80 bg-[#fbf5e9] px-5 py-5 shadow-[0_10px_28px_rgba(86,62,31,0.06)] sm:px-7">
      <button
        type="button"
        onClick={() => { setShowAll((value) => !value); setOpenId(null); }}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={showAll}
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-medium tracking-[0.22em] text-cinnabar">{copy.kicker}</span>
          <span className="mt-1 block font-display text-2xl tracking-[0.07em] text-ink">{copy.title}</span>
          <span className="mt-1 block text-xs leading-5 text-ink-mute">{copy.lead}</span>
        </span>
        <span className="shrink-0 text-lg text-cinnabar" aria-hidden>{showAll ? "−" : "+"}</span>
      </button>

      <div className="mt-4 border-t border-line/70">
        {visibleArticles.map((article, index) => {
          const paragraphs = article.body[locale].split(/\n\n+/);
          const isOpen = openId === article.id;
          return (
            <article key={article.id} className={`${index ? "border-t border-line/60" : ""} py-4`}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : article.id)}
                className="flex w-full items-start justify-between gap-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="min-w-0">
                  <span className="text-[10px] font-semibold tracking-[0.14em] text-cinnabar">{index === 0 ? copy.latest : article.publishedAt}</span>
                  <strong className="mt-1 block font-display text-lg font-semibold leading-7 text-ink">{article.title[locale]}</strong>
                  {!showAll && !isOpen ? <span className="mt-2 line-clamp-2 block text-sm leading-6 text-ink-soft">{latestParagraph}</span> : null}
                </span>
                <span className="shrink-0 pt-1 text-sm text-cinnabar">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen ? (
                <div className="mt-4 border-l border-cinnabar/20 pl-4 text-[15px] leading-8 text-ink">
                  <time className="mb-3 block text-xs text-ink-mute" dateTime={article.publishedAt}>{article.publishedAt}</time>
                  {paragraphs.map((paragraph, paragraphIndex) => <p key={`${article.id}-${paragraphIndex}`} className={paragraphIndex ? "mt-4" : ""}>{paragraph}</p>)}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <button type="button" onClick={() => { setShowAll((value) => !value); setOpenId(null); }} className="mt-1 text-xs font-medium tracking-[0.08em] text-cinnabar">
        {showAll ? copy.collapse : `${copy.all} ›`}
      </button>
    </section>
  );
}
