import { useMemo } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import { LIFE_VIEW_ARTICLES } from "@/lib/life-view";
import { LIFE_VIEW_FILE_ARTICLES } from "@/lib/life-view-from-files";
import { LIFE_VIEW_PRACTICE_ARTICLES } from "@/lib/life-view-practice-manual";

const ARTICLES = [...LIFE_VIEW_PRACTICE_ARTICLES, ...LIFE_VIEW_FILE_ARTICLES, ...LIFE_VIEW_ARTICLES];

type ArticleArt = {
  src: string;
  alt: Record<Locale, string>;
};

/**
 * "觀世錄" illustration system.
 * These images deliberately share one visual language: vertical 9:16,
 * aged-paper Chinese illustrated manuscript / comic treatment, restrained
 * mineral colour, and STONE 原創 watermarking. New awakening essays should
 * stay inside this same art family rather than introducing unrelated styles.
 */
const ARTICLE_ART: Record<string, ArticleArt> = {
  "break-the-deadlock": {
    src: "/images/life-view/courage-rebirth.webp",
    alt: {
      "zh-Hant": "勇氣、執行力與絕境重生的古畫漫畫圖",
      "zh-Hans": "勇气、执行力与绝境重生的古画漫画图",
      en: "Illustrated manuscript about courage, action and renewal after a dead end",
    },
  },
  "awakening-and-reality": {
    src: "/images/life-view/clear-awakening.webp",
    alt: {
      "zh-Hant": "覺醒不是神秘化世界，而是看清自己的古畫漫畫圖",
      "zh-Hans": "觉醒不是神秘化世界，而是看清自己的古画漫画图",
      en: "Illustrated manuscript about awakening as clear seeing rather than mystification",
    },
  },
  "belief-and-world": {
    src: "/images/life-view/belief-world.webp",
    alt: {
      "zh-Hant": "信念如何改變注意、解讀與選擇的古畫漫畫圖",
      "zh-Hans": "信念如何改变注意、解读与选择的古画漫画图",
      en: "Illustrated manuscript about how beliefs shape attention, interpretation and choices",
    },
  },
  "five-pillars-of-practice": {
    src: "/images/life-view/clear-awakening.webp",
    alt: {
      "zh-Hant": "認知、心境、情緒、關係與行動五支柱的古畫漫畫圖",
      "zh-Hans": "认知、心境、情绪、关系与行动五支柱的古画漫画图",
      en: "Illustrated manuscript for the five pillars of clearer living",
    },
  },
  "frequency-is-not-the-entrance": {
    src: "/images/life-view/belief-world.webp",
    alt: {
      "zh-Hant": "進入複雜世界仍不丟掉自己的古畫漫畫圖",
      "zh-Hans": "进入复杂世界仍不丢掉自己的古画漫画图",
      en: "Illustrated manuscript about staying centred while entering a complex world",
    },
  },
  "sensitivity-needs-boundaries": {
    src: "/images/life-view/clear-awakening.webp",
    alt: {
      "zh-Hant": "敏感、覺察與邊界的古畫漫畫圖",
      "zh-Hans": "敏感、觉察与边界的古画漫画图",
      en: "Illustrated manuscript about sensitivity, awareness and boundaries",
    },
  },
  "love-reveals-the-unfinished-self": {
    src: "/images/life-view/clear-awakening.webp",
    alt: {
      "zh-Hant": "關係照見自己、愛而不失去自己的古畫漫畫圖",
      "zh-Hans": "关系照见自己、爱而不失去自己的古画漫画图",
      en: "Illustrated manuscript about intimacy revealing the self without losing oneself",
    },
  },
};

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

      {ARTICLES.length ? (
        <div className="mt-6 divide-y divide-line/70 border-y border-line/70">
          {ARTICLES.map((article) => {
            const art = ARTICLE_ART[article.id];

            return (
              <details key={article.id} className="group py-5">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-start gap-4">
                    {art ? (
                      <img
                        src={art.src}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        className="h-28 w-[63px] shrink-0 rounded-xl border border-line/70 object-cover shadow-[0_6px_18px_rgba(86,62,31,0.10)] sm:h-32 sm:w-[72px]"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
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

                {art ? (
                  <figure className="mt-5 rounded-[1.5rem] border border-line/70 bg-[#f5eddf] p-2 shadow-[0_12px_30px_rgba(86,62,31,0.08)] sm:p-3">
                    <img
                      src={art.src}
                      alt={art.alt[locale]}
                      loading="lazy"
                      decoding="async"
                      className="mx-auto block h-auto w-full max-w-[380px] rounded-[1.15rem]"
                    />
                  </figure>
                ) : null}

                <div className="mt-5 space-y-4 border-l border-cinnabar/25 pl-4 text-[15px] leading-8 text-ink">
                  {article.body[locale].split(/\n\n+/).map((paragraph, index) => (
                    <p key={`${article.id}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 border-t border-line/70 pt-5 text-sm tracking-[0.04em] text-ink-mute">{copy.empty}</p>
      )}
    </section>
  );
}
