import { FOLKLORE_ARTICLE, FOLKLORE_SOURCES } from "@/lib/life-view-long-form/cai-sheng-zhe-ge-20261116";
import { useDisplayLanguage, intlTagFor } from "@/lib/display-language";
import { customerChrome, translateCustomerChrome, translateChromeObject } from "@/lib/customer-chrome";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { StellarLifeCycleInteractive } from "@/components/stellar-life-cycle-interactive";
import { ShanhaijingStarBeastsSection } from "@/components/shanhaijing-star-beasts-section";
import { Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";
import { LIFE_VIEW_ARTICLES, type LifeViewArticle } from "@/lib/life-view";
import { LIFE_VIEW_FILE_ARTICLES } from "@/lib/life-view-from-files";
import { LIFE_VIEW_PRACTICE_ARTICLES } from "@/lib/life-view-practice-manual";
import { LIFE_VIEW_20260831_ARTICLES } from "@/lib/life-view-20260831";
import { LIFE_VIEW_20260903_ARTICLES } from "@/lib/life-view-20260903";
import { LIFE_VIEW_20260903_LATE_ARTICLES } from "@/lib/life-view-20260903-late";
import { LIFE_VIEW_CURATED_ARTICLES } from "@/lib/life-view-curated";
import { LIFE_VIEW_LONG_FORM_ARTICLES } from "@/lib/life-view-long-form";
import { EMOTIONAL_INTELLIGENCE_FOUR_PRACTICES_ARTICLE } from "@/lib/life-view-long-form/emotional-intelligence-four-practices-20261112";
import { THREE_AGES_SPIRITUAL_WORLD_LONG_FORM } from "@/lib/life-view-long-form/three-ages-spiritual-world";
import { LIFE_VIEW_SHORT_FORM_ARTICLES } from "@/lib/life-view-short-form";
import { DAO_SELF_MASTERY_LONG_FORM } from "@/lib/life-view-long-form/dao-self-mastery";
import { THREE_TEACHINGS_CULTIVATION_LONG_FORM } from "@/lib/life-view-long-form/three-teachings-cultivation";
import { INNER_FENGSHUI_LONG_FORM } from "@/lib/life-view-long-form/inner-fengshui";
import { BAZI_HEALTH_SYMBOLISM_LONG_FORM } from "@/lib/life-view-long-form/bazi-health-symbolism";
import { SHUSHU_ENDS_IN_CHOICE_ARTICLE } from "@/lib/life-view-long-form/shushu-ends-in-choice";
import { AFTER_MIRACLES_PRACTICE_LONG_FORM } from "@/lib/life-view-long-form/after-miracles-practice";
import { SEE_BREAK_RETURN_LONG_FORM } from "@/lib/life-view-long-form/see-break-return";
import { TIME_IS_IT_FASTER_LONG_FORM } from "@/lib/life-view-long-form/time-is-it-faster";
import { A_DAY_WITH_INCENSE_LONG_FORM } from "@/lib/life-view-long-form/a-day-with-incense";
import { ABHIDHAMMA_THIRTY_ONE_PLANES } from "@/lib/life-view-long-form/abhidhamma-thirty-one-planes";
import { SEVEN_CULTURAL_ATLASES_20261023 } from "@/lib/life-view-long-form/seven-cultural-atlases-20261023";
import { fetchLifeViewCounts, incrementLifeViewCount, type LifeViewCounts } from "@/lib/life-view-views";
import { fetchArticleOverrides, applyArticleOverrides, type ArticleOverride } from "@/lib/article-overrides";
import { useAuthState } from "@/lib/auth/provider";
import { ownerData } from "@/lib/owner-data-client";

const trImageOpenLabel = (_locale: Locale) => customerChrome("開啟高清原圖", "打开高清原图", "Open original full-size image");

type ContentKind = "article" | "short-note";

type IllustratedArticle = LifeViewArticle & {
  contentKind?: ContentKind;
  illustrations?: Array<{
    src: string;
    afterParagraph: number;
    alt: Record<Locale, string>;
    display?: "wide" | "portrait";
  }>;
};

type LifeViewHomeSectionProps = {
  archiveMode?: boolean;
};

// Explicit allowlist: superseded drafts stay unpublished. See docs/RESTORE-ARTICLES-20261112.md.
const RESTORED_ORPHAN_IDS = new Set([
  "world-as-mirror-not-physics",
  "money-needs-order-not-anxiety",
  "five-elements-as-movement",
  "frequency-is-not-the-entrance",
  "sensitivity-needs-boundaries",
  "love-reveals-the-unfinished-self",
  "capacity-is-real-energy",
  "follow-the-flow-not-surrender",
  "five-pillars-of-practice",
  "break-the-deadlock",
  "belief-and-world",
  "relationships-and-boundaries",
  "long-term-practice",
]);

const RESTORED_ORPHAN_ARTICLES = [
  ...LIFE_VIEW_ARTICLES,
  ...LIFE_VIEW_FILE_ARTICLES,
  ...LIFE_VIEW_PRACTICE_ARTICLES,
  ...LIFE_VIEW_20260831_ARTICLES,
  ...LIFE_VIEW_20260903_ARTICLES,
  ...LIFE_VIEW_20260903_LATE_ARTICLES,
].filter((article) => RESTORED_ORPHAN_IDS.has(article.id));

const LONG_ARTICLES: IllustratedArticle[] = [
  FOLKLORE_ARTICLE,
  EMOTIONAL_INTELLIGENCE_FOUR_PRACTICES_ARTICLE,
  SEVEN_CULTURAL_ATLASES_20261023,
  ABHIDHAMMA_THIRTY_ONE_PLANES,
  A_DAY_WITH_INCENSE_LONG_FORM,
  TIME_IS_IT_FASTER_LONG_FORM,
  SEE_BREAK_RETURN_LONG_FORM,
  AFTER_MIRACLES_PRACTICE_LONG_FORM,
  SHUSHU_ENDS_IN_CHOICE_ARTICLE,
  BAZI_HEALTH_SYMBOLISM_LONG_FORM,
  INNER_FENGSHUI_LONG_FORM,
  DAO_SELF_MASTERY_LONG_FORM,
  THREE_AGES_SPIRITUAL_WORLD_LONG_FORM,
  THREE_TEACHINGS_CULTIVATION_LONG_FORM,
  ...LIFE_VIEW_LONG_FORM_ARTICLES,
  ...LIFE_VIEW_CURATED_ARTICLES,
  ...RESTORED_ORPHAN_ARTICLES,
].map((article) => ({ ...article, contentKind: "article" as const }));

const SHORT_NOTES: IllustratedArticle[] = LIFE_VIEW_SHORT_FORM_ARTICLES.map((article) => ({
  ...article,
  contentKind: "short-note" as const,
}));

// 文章區只收文章與觀點短札。命理教學／術語知識另由「昭梧 · 命理小知識」承載。
export const ARTICLE_CATALOG: IllustratedArticle[] = [...LONG_ARTICLES, ...SHORT_NOTES];
ARTICLE_CATALOG.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const READING_MAP_GROUPS = [
  {
    label: { "zh-Hant": "觀心與理解", "zh-Hans": "观心与理解", en: "Self-awareness" },
    ids: ["emotional-intelligence-four-practices-20261112", "world-as-mirror-not-physics", "belief-and-world", "break-the-deadlock"],
  },
  {
    label: { "zh-Hant": "人際與界線", "zh-Hans": "人际与边界", en: "Relationships & boundaries" },
    ids: ["frequency-is-not-the-entrance", "sensitivity-needs-boundaries", "love-reveals-the-unfinished-self", "relationships-and-boundaries"],
  },
  {
    label: { "zh-Hant": "現實與行動", "zh-Hans": "现实与行动", en: "Practical choices" },
    ids: ["capacity-is-real-energy", "five-pillars-of-practice", "long-term-practice"],
  },
  {
    label: { "zh-Hant": "五行與趨勢", "zh-Hans": "五行与趋势", en: "Five Elements & timing" },
    ids: ["five-elements-as-movement", "follow-the-flow-not-surrender", "money-needs-order-not-anxiety"],
  },
] as const;

// Thumbnails are editorial cues: use an article's own art only when it depicts
// the subject. Entries without matching art use a restrained topic glyph.
const ARTICLE_THUMBNAILS: Record<string, { src: string; alt: string }> = {
  "emotional-intelligence-four-practices-20261112": { src: "/articles/face-mind-cultivation-2026-09-14.webp", alt: "觀心與修習" },
  "bazi-health-symbolism": { src: "/articles/bazi-health-five-phases.svg", alt: "五行與身體象徵" },
  "a-day-with-incense": { src: "/today/almanac-mist-v1.webp", alt: "香事與日常" },
  "time-is-it-really-faster": { src: "/articles/time-objective-subjective.webp", alt: "時間" },
  "see-break-return": { src: "/articles/stone-cause-and-action.webp", alt: "因果與行動" },
  "seven-cultural-atlases-20261023": { src: "/articles/stone-cultural-atlas-01.png", alt: "文化圖譜" },
  "abhidhamma-thirty-one-planes": { src: "/articles/abhidhamma-31-realms-overview.svg", alt: "三十一界" },
  "face-mind-cultivation": { src: "/articles/face-mind-cultivation-2026-09-14.webp", alt: "面相與修心" },
  "civilization-timeline-2025-2030-cross-analysis": { src: "/articles/civilization-timeline-2025-2030-stone-original.png", alt: "文明時間線" },
};

function articleThumbnail(article: IllustratedArticle) {
  const mapped = ARTICLE_THUMBNAILS[article.id];
  if (mapped) return { ...mapped, kind: "image" as const };
  // Own illustration is suitable by default only when explicitly present; the
  // remaining uncatalogued pieces are text-led reflections, represented by a
  // simple glyph instead of borrowed artwork.
  if (article.illustrations?.[0]?.src) return { src: article.illustrations[0].src, alt: "", kind: "image" as const };
  return { src: "", alt: "", kind: "icon" as const };
}

function TopicThumbnail({ article, compact = false }: { article: IllustratedArticle; compact?: boolean }) {
  const thumb = articleThumbnail(article);
  const size = compact ? "h-14 w-12" : "h-20 w-16 sm:h-24 sm:w-[4.5rem]";
  return thumb.kind === "image" ? (
    <img src={thumb.src} alt={thumb.alt} width={941} height={1672} loading="lazy" decoding="async" className={`${size} shrink-0 rounded-lg object-cover`} />
  ) : (
    <span aria-hidden="true" className={`${size} flex shrink-0 items-center justify-center rounded-lg border border-cinnabar/20 bg-cream font-display text-xl text-cinnabar`}>
      {article.id.includes("five-elements") || article.id.includes("money-needs") ? "五" : article.id.includes("boundar") || article.id.includes("sensitivity") || article.id.includes("relationship") ? "界" : article.id.includes("practice") || article.id.includes("effort") ? "行" : "觀"}
    </span>
  );
}

export function LifeViewHomeSection({ archiveMode = false }: LifeViewHomeSectionProps) {
  const { locale } = useI18n();
  const { language } = useDisplayLanguage();
  const { user } = useAuthState();
  const isOwner = user?.isOwner === true;
  const [overrides, setOverrides] = useState<ArticleOverride[] | null>(null);
  const [articlesError, setArticlesError] = useState(false);
  const [showAll, setShowAll] = useState(archiveMode);
  const [openId, setOpenId] = useState<string | null>(null);
  const [viewCounts, setViewCounts] = useState<LifeViewCounts>({});
  const countedThisVisit = useRef(new Set<string>());
  const contents = useMemo(() => overrides === null ? [] : applyArticleOverrides(ARTICLE_CATALOG, overrides), [overrides]);
  const latest = contents[0] ?? null;
  async function removeArticle(id: string) {
    const article = contents.find((item) => item.id === id);
    if (!article || !window.confirm(locale === "en" ? `Remove “${article.title[locale]}” from public articles?` : `將「${article.title[locale]}」從公開文章下架？可在後台還原。`)) return;
    try {
      const result = await ownerData<{ article: ArticleOverride }>("article.archive", { id, archived: true });
      setOverrides((current) => [...(current ?? []).filter((row) => row.id !== id), result.article]);
      setOpenId(null);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Article removal failed");
    }
  }

  useEffect(() => {
    let active = true;
    void fetchArticleOverrides().then((rows) => { if (active) setOverrides(rows); })
      .catch(() => { if (active) setArticlesError(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchLifeViewCounts().then((counts) => { if (!cancelled) setViewCounts(counts); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  function shouldCountArticleOpen(articleId: string) {
    if (countedThisVisit.current.has(articleId)) return false;
    countedThisVisit.current.add(articleId);
    try {
      const key = `zhaowu.life-view.viewed.${articleId}`;
      if (window.sessionStorage.getItem(key) === "1") return false;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Private browsing / storage restrictions must not block reading or counting.
    }
    return true;
  }

  function toggleArticle(articleId: string, isOpen: boolean) {
    setOpenId(isOpen ? null : articleId);
    if (isOpen || !shouldCountArticleOpen(articleId)) return;
    void incrementLifeViewCount(articleId).then((count) => {
      if (count == null) return;
      setViewCounts((current) => ({ ...current, [articleId]: count }));
    }).catch(() => undefined);
  }

  const viewsLabel = (articleId: string) => {
    const count = viewCounts[articleId] ?? 0;
    const formatted = new Intl.NumberFormat(intlTagFor(language)).format(count);
    if (language !== "en" && language !== "zh-Hant" && language !== "zh-Hans") return `${formatted} ${translateCustomerChrome(language, "views")}`;
    return locale === "en" ? `${formatted} views` : locale === "zh-Hans" ? `已浏览 ${formatted}` : `已瀏覽 ${formatted}`;
  };

  const baseCopy = useMemo(() => {
    if (locale === "en") {
      return {
        kicker: "STONE · ARTICLES",
        title: "Zhaowu · Articles",
        lead: archiveMode
          ? "Essays and reflective short notes live here. BaZi teaching cards are kept separately under Zhaowu · BaZi Knowledge."
          : "Latest piece first. Open Articles for the full archive of essays and short notes.",
        latest: "Latest",
        all: "All essays & short notes",
        collapse: "Show less",
        read: "Read",
        archive: "Open Articles",
        article: "Article",
        shortNote: "Short note",
        quizCta: "Take the Five-Element Strength Overdrive test",
        empty: "Articles will be added here over time.",
      };
    }
    if (locale === "zh-Hans") {
      return {
        kicker: "STONE · 文章",
        title: "昭梧 · 文章",
        lead: archiveMode
          ? "文章与短札都收在这里；八字教学、术语与方法另列在「昭梧 · 命理小知识」。"
          : "首页先看最新内容；所有文章与短札都收在文章。",
        latest: "最新",
        all: "全部文章与短札",
        collapse: "收起",
        read: "阅读全文",
        archive: "进入文章",
        article: "文章",
        shortNote: "短札",
        quizCta: "做五行优势内耗测验",
        empty: "文章会在这里持续更新。",
      };
    }
    return {
      kicker: "STONE · 文章",
      title: "昭梧 · 文章",
      lead: archiveMode
        ? "文章與短札都收在這裡；八字教學、術語與方法另列在「昭梧 · 命理小知識」。"
        : "首頁先看最新內容；所有文章與短札都收在文章。",
      latest: "最新",
      all: "全部文章與短札",
      collapse: "收起",
      read: "閱讀全文",
      archive: "進入文章",
      article: "文章",
      shortNote: "短札",
      quizCta: "做五行優勢內耗測驗",
      empty: "文章會在這裡持續更新。",
    };
  }, [archiveMode, locale]);
  const copy = translateChromeObject(language, baseCopy);

  if (!latest) {
    return (
      <section id="life-view" className="rounded-2xl border border-line/80 bg-paper px-5 py-5">
        <p role="status" className="text-sm text-ink-mute">{articlesError
          ? customerChrome("文章暫時無法載入。", "文章暂时无法加载。", "Articles are temporarily unavailable.")
          : overrides === null ? customerChrome("文章載入中…", "文章加载中…", "Loading articles…") : copy.empty}</p>
      </section>
    );
  }
  const latestParagraph = latest.body[locale].split(/\n\n+/)[0] ?? "";
  const visibleArticles = archiveMode || showAll ? contents : [latest];

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

      {(archiveMode || showAll) ? (
        <nav aria-label={customerChrome("觀世錄閱讀地圖", "观世录阅读地图", "Articles reading map")} className="mt-5 border-y border-line/70 py-5">
          <p className="font-display text-xl text-ink">{customerChrome("觀世錄 · 閱讀地圖", "观世录 · 阅读地图", "Notes on Life · Reading map")}</p>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{customerChrome("按主題選讀本次整理的文章；其餘原有篇章仍保留於完整文章目錄。", "按主题选读本次整理的文章；其余原有篇章仍保留在完整目录。", "Explore the newly restored essays by theme; the full archive remains below.")}</p>
          <div className="mt-5 grid gap-x-9 gap-y-6 sm:grid-cols-2">
            {READING_MAP_GROUPS.map((group) => (
              <div key={group.label.en} className="border-t border-cinnabar/20 pt-3">
                <h3 className="font-display text-lg text-ink">{group.label[locale]}</h3>
                <ul className="mt-2 space-y-2">
                  {group.ids.map((id) => {
                    const target = contents.find((item) => item.id === id);
                    if (!target) return null;
                    return (
                      <li key={id}>
                        <a
                          className="flex min-h-[68px] items-center gap-3 rounded-xl border border-line/70 bg-[#fffaf1]/85 p-2.5 text-sm leading-6 text-ink-soft shadow-sm transition hover:border-cinnabar/35 focus-visible:outline-2 focus-visible:outline-offset-2"
                          href={`#article-${id}`}
                          onClick={(event) => {
                            event.preventDefault();
                            setOpenId(id);
                            document.getElementById(`article-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                        >
                          <TopicThumbnail article={target} compact />
                          <span className="min-w-0"><strong className="block font-medium text-ink">{target.title[locale]}</strong><span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-ink-mute">{target.summary?.[locale] ?? target.body[locale].split(/\n\n+/)[0]}</span></span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      ) : null}

      <div className="mt-4 border-t border-line/70">
        {visibleArticles.map((article, index) => {
          const paragraphs = article.body[locale].split(/\n\n+/);
          const isOpen = openId === article.id;
          const kindLabel = article.contentKind === "short-note" ? copy.shortNote : copy.article;

          return (
            <article key={article.id} id={`article-${article.id}`} className={`${index ? "border-t border-line/60" : ""} scroll-mt-24 py-2`}>
              <button
                type="button"
                onClick={() => toggleArticle(article.id, isOpen)}
                className="flex w-full min-h-[104px] items-center gap-3 rounded-xl border border-line/70 bg-[#fffaf1]/85 p-3 text-left shadow-sm transition hover:border-cinnabar/35 focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-4 sm:p-4"
                aria-expanded={isOpen}
              >
                <TopicThumbnail article={article} />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-cinnabar">
                    <span>{index === 0 ? copy.latest : article.publishedAt}</span>
                    <span className="rounded-full border border-line bg-cream px-2 py-0.5 tracking-[0.08em] text-ink-mute">{kindLabel}</span>
                  </span>
                  <span className="mt-1 flex items-start justify-between gap-3">
                    <strong className="min-w-0 font-display text-[1.05rem] font-semibold leading-6 text-ink sm:text-lg">{article.title[locale]}</strong>
                  </span>
                  {!isOpen ? (
                    <span className="mt-2 line-clamp-2 block text-sm leading-6 text-ink-soft">{article.summary?.[locale] || (index === 0 ? latestParagraph : paragraphs[0])}</span>
                  ) : null}
                </span>
                <span className="shrink-0 pt-1 text-sm text-cinnabar">{isOpen ? "−" : "+"}</span>
              </button>

              {isOwner ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href={`/account?view=articles&edit=${encodeURIComponent(article.id)}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-xs text-ink">{locale === "en" ? "Edit" : locale === "zh-Hans" ? "编辑" : "編輯"}</a>
                  <button type="button" onClick={() => void removeArticle(article.id)} className="min-h-11 rounded-full border border-cinnabar/30 px-4 text-xs text-cinnabar">{locale === "en" ? "Remove" : locale === "zh-Hans" ? "删除" : "刪除"}</button>
                </div>
              ) : null}
              {isOpen ? (
                <div className="mt-4 border-l border-cinnabar/20 pl-4 text-[15px] leading-8 text-ink">
                  <div className="mb-3 flex items-center justify-between gap-3 text-xs text-ink-mute"><time dateTime={article.publishedAt}>{article.publishedAt}</time></div>
                  {article.id === "stellar-life-cycle-interactive" ? <StellarLifeCycleInteractive /> : null}
                  {paragraphs.map((paragraph, paragraphIndex) => {
                    const illustration = article.illustrations?.find((item) => item.afterParagraph === paragraphIndex + 1);
                    return (
                      <Fragment key={`${article.id}-${paragraphIndex}`}>
                        <p className={paragraphIndex ? "mt-4" : ""}>{paragraph}</p>
                        {illustration ? (
                          <figure className={article.id === "impermanence-life-20261030"
                            ? "mx-auto my-6 w-full max-w-[540px] overflow-hidden bg-paper"
                            : illustration.display === "wide"
                            ? "mx-auto my-6 w-full max-w-[640px] overflow-hidden rounded-2xl border border-line/70 bg-paper shadow-[0_8px_24px_rgba(86,62,31,0.06)]"
                            : "mx-auto my-6 w-[72%] max-w-[300px] overflow-hidden rounded-[28px] border border-line/70 bg-paper shadow-[0_8px_24px_rgba(86,62,31,0.06)]"}>
                            <a href={illustration.src} target="_blank" rel="noopener noreferrer" aria-label={trImageOpenLabel(locale)} className="block cursor-zoom-in">
                            <img
                              src={illustration.src}
                              alt={illustration.alt[locale]}
                              loading="lazy"
                              decoding="async"
                              className="block h-auto w-full"
                              width={article.id === "impermanence-life-20261030" ? 900 : undefined}
                              height={article.id === "impermanence-life-20261030" ? 1600 : undefined}
                              onError={(event) => {
                                event.currentTarget.classList.add("life-view-broken-image");
                                const figure = event.currentTarget.closest("figure");
                                if (figure) figure.classList.add("life-view-broken-image");
                              }}
                            />
                            </a>
                          </figure>
                        ) : null}
                      </Fragment>
                    );
                  })}
                  {article.id === FOLKLORE_ARTICLE.id ? (
                    <section className="mt-6 border-t border-line/70 pt-4" aria-label={locale === "en" ? "Sources" : locale === "zh-Hans" ? "资料来源" : "資料來源"}>
                      <h3 className="font-semibold">{locale === "en" ? "Sources" : locale === "zh-Hans" ? "资料来源" : "資料來源"}</h3>
                      <ul className="mt-2 list-disc pl-5">
                        {FOLKLORE_SOURCES.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="break-words text-cinnabar underline underline-offset-4">{source.label}</a></li>)}
                      </ul>
                    </section>
                  ) : null}
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

      {archiveMode ? <ShanhaijingStarBeastsSection /> : null}

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
