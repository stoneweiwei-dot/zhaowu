import { Fragment, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";
import type { LifeViewArticle } from "@/lib/life-view";
import { LIFE_VIEW_CURATED_ARTICLES } from "@/lib/life-view-curated";
import { LIFE_VIEW_LONG_FORM_ARTICLES } from "@/lib/life-view-long-form";
import { THREE_AGES_SPIRITUAL_WORLD_LONG_FORM } from "@/lib/life-view-long-form/three-ages-spiritual-world";
import { LIFE_VIEW_SHORT_FORM_ARTICLES } from "@/lib/life-view-short-form";
import { DAO_SELF_MASTERY_LONG_FORM } from "@/lib/life-view-long-form/dao-self-mastery";
import { THREE_TEACHINGS_CULTIVATION_LONG_FORM } from "@/lib/life-view-long-form/three-teachings-cultivation";
import { INNER_FENGSHUI_LONG_FORM } from "@/lib/life-view-long-form/inner-fengshui";
import { BAZI_HEALTH_SYMBOLISM_LONG_FORM } from "@/lib/life-view-long-form/bazi-health-symbolism";
import { SHUSHU_ENDS_IN_CHOICE_ARTICLE } from "@/lib/life-view-long-form/shushu-ends-in-choice";

type ContentKind = "article" | "short-note";

type IllustratedArticle = LifeViewArticle & {
  contentKind?: ContentKind;
  illustrations?: Array<{
    src: string;
    afterParagraph: number;
    alt: Record<Locale, string>;
  }>;
};

type LifeViewHomeSectionProps = {
  archiveMode?: boolean;
};

const LONG_ARTICLES: IllustratedArticle[] = [
  SHUSHU_ENDS_IN_CHOICE_ARTICLE,
  BAZI_HEALTH_SYMBOLISM_LONG_FORM,
  INNER_FENGSHUI_LONG_FORM,
  DAO_SELF_MASTERY_LONG_FORM,
  THREE_AGES_SPIRITUAL_WORLD_LONG_FORM,
  THREE_TEACHINGS_CULTIVATION_LONG_FORM,
  ...LIFE_VIEW_LONG_FORM_ARTICLES,
  ...LIFE_VIEW_CURATED_ARTICLES,
].map((article) => ({ ...article, contentKind: "article" as const }));

const SHORT_NOTES: IllustratedArticle[] = LIFE_VIEW_SHORT_FORM_ARTICLES.map((article) => ({
  ...article,
  contentKind: "short-note" as const,
}));

// 觀世錄只收文章與觀點短札。命理教學／術語知識另由「昭梧 · 命理小知識」承載。
const CONTENTS: IllustratedArticle[] = [...LONG_ARTICLES, ...SHORT_NOTES];
CONTENTS.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function LifeViewHomeSection({ archiveMode = false }: LifeViewHomeSectionProps) {
  const { locale } = useI18n();
  const [showAll, setShowAll] = useState(archiveMode);
  const [openId, setOpenId] = useState<string | null>(null);
  const latest = CONTENTS[0] ?? null;

  const copy = useMemo(() => {
    if (locale === "en") {
      return {
        kicker: "STONE · NOTES",
        title: "Zhaowu · Notes on Life",
        lead: archiveMode
          ? "Essays and reflective short notes live here. BaZi teaching cards are kept separately under Zhaowu · BaZi Knowledge."
          : "Latest piece first. Open 觀世錄 for the full archive of essays and reflective short notes.",
        latest: "Latest",
        all: "All essays & short notes",
        collapse: "Show less",
        read: "Read",
        archive: "Open 觀世錄",
        article: "Article",
        shortNote: "Short note",
        quizCta: "Take the Five-Element Strength Overdrive test",
        empty: "Articles will be added here over time.",
      };
    }
    if (locale === "zh-Hans") {
      return {
        kicker: "STONE · 观世",
        title: "昭梧 · 观世录",
        lead: archiveMode
          ? "这里只收文章与观世短札；八字教学、术语与方法统一另列在「昭梧 · 命理小知识」。"
          : "首页先看最新内容；完整文章与观世短札都收在观世录。",
        latest: "最新",
        all: "全部文章与短札",
        collapse: "收起",
        read: "阅读全文",
        archive: "进入观世录",
        article: "文章",
        shortNote: "短札",
        quizCta: "做五行优势内耗测验",
        empty: "文章会在这里持续更新。",
      };
    }
    return {
      kicker: "STONE · 觀世",
      title: "昭梧 · 觀世錄",
      lead: archiveMode
        ? "這裡只收文章與觀世短札；八字教學、術語與方法統一另列在「昭梧 · 命理小知識」。"
        : "首頁先看最新內容；完整文章與觀世短札都收在觀世錄。",
      latest: "最新",
      all: "全部文章與短札",
      collapse: "收起",
      read: "閱讀全文",
      archive: "進入觀世錄",
      article: "文章",
      shortNote: "短札",
      quizCta: "做五行優勢內耗測驗",
      empty: "文章會在這裡持續更新。",
    };
  }, [archiveMode, locale]);

  if (!latest) {
    return (
      <section id="life-view" className="rounded-2xl border border-line/80 bg-paper px-5 py-5">
        <p className="text-sm text-ink-mute">{copy.empty}</p>
      </section>
    );
  }

  const latestParagraph = latest.body[locale].split(/\n\n+/)[0] ?? "";
  const visibleArticles = archiveMode || showAll ? CONTENTS : [latest];

  const header = (
    <span className="min-w-0">
      <span className="block text-[10px] font-medium tracking-[0.22em] text-cinnabar">{copy.kicker}</span>
      <span className="mt-1 block font-display text-2xl tracking-[0.07em] text-ink">{copy.title}</span>
      <span className="mt-1 block text-xs leading-5 text-ink-mute">{copy.lead}</span>
    </span>
  );

  return (
    <section id="life-view" className="scroll-mt-20 rounded-2xl border border-line/80 bg-paper px-5 py-5 shadow-[0_10px_28px_rgba(86,62,31,0.06)] sm:px-7">
      {archiveMode ? (
        <div className="flex w-full items-start justify-between gap-4 text-left">{header}</div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setShowAll((value) => !value);
            setOpenId(null);
          }}
          className="flex w-full items-center justify-between gap-4 text-left"
          aria-expanded={showAll}
        >
          {header}
          <span className="shrink-0 text-lg text-cinnabar" aria-hidden>{showAll ? "−" : "+"}</span>
        </button>
      )}

      <div className="mt-4 border-t border-line/70">
        {visibleArticles.map((article, index) => {
          const paragraphs = article.body[locale].split(/\n\n+/);
          const isOpen = openId === article.id;
          const kindLabel = article.contentKind === "short-note" ? copy.shortNote : copy.article;

          return (
            <article key={article.id} className={`${index ? "border-t border-line/60" : ""} py-4`}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : article.id)}
                className="flex w-full items-start justify-between gap-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-cinnabar">
                    <span>{index === 0 ? copy.latest : article.publishedAt}</span>
                    <span className="rounded-full border border-line bg-cream px-2 py-0.5 tracking-[0.08em] text-ink-mute">{kindLabel}</span>
                  </span>
                  <strong className="mt-1 block font-display text-[1.05rem] font-semibold leading-6 text-ink sm:text-lg">{article.title[locale]}</strong>
                  {!archiveMode && !showAll && !isOpen ? (
                    <span className="mt-2 line-clamp-2 block text-sm leading-6 text-ink-soft">{latestParagraph}</span>
                  ) : null}
                </span>
                <span className="shrink-0 pt-1 text-sm text-cinnabar">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen ? (
                <div className="mt-4 border-l border-cinnabar/20 pl-4 text-[15px] leading-8 text-ink">
                  <time className="mb-3 block text-xs text-ink-mute" dateTime={article.publishedAt}>{article.publishedAt}</time>
                  {paragraphs.map((paragraph, paragraphIndex) => {
                    const illustration = article.illustrations?.find((item) => item.afterParagraph === paragraphIndex + 1);
                    return (
                      <Fragment key={`${article.id}-${paragraphIndex}`}>
                        <p className={paragraphIndex ? "mt-4" : ""}>{paragraph}</p>
                        {illustration ? (
                          <figure className="mx-auto my-6 w-[72%] max-w-[300px] overflow-hidden rounded-[28px] border border-line/70 bg-paper shadow-[0_8px_24px_rgba(86,62,31,0.06)]">
                            <img
                              src={illustration.src}
                              alt={illustration.alt[locale]}
                              loading="lazy"
                              decoding="async"
                              className="block h-auto w-full"
                              onError={(event) => {
                                event.currentTarget.classList.add("life-view-broken-image");
                                const figure = event.currentTarget.closest("figure");
                                if (figure) figure.classList.add("life-view-broken-image");
                              }}
                            />
                          </figure>
                        ) : null}
                      </Fragment>
                    );
                  })}
                  {article.id === "strength-overdrive-five-elements" ? (
                    <Link to="/quiz/five-element-overdrive" className="mt-6 inline-flex min-h-11 items-center rounded-full border border-cinnabar/30 bg-cream px-5 py-2 text-sm font-medium text-cinnabar">
                      {copy.quizCta} →
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {!archiveMode ? (
        <div className="zhaowu-guanshilu-teaser mt-3">
          <button
            type="button"
            onClick={() => {
              setShowAll((value) => !value);
              setOpenId(null);
            }}
            className="text-xs font-medium tracking-[0.08em] text-cinnabar"
          >
            {showAll ? copy.collapse : `${copy.all} ›`}
          </button>
          <Link to="/knowledge" className="text-xs font-medium tracking-[0.08em] text-cinnabar">{copy.archive} ›</Link>
        </div>
      ) : null}
    </section>
  );
}
