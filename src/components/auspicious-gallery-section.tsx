import { useEffect, useMemo, useState } from "react";
import { galleryPublicUrl, listPublicGalleryAssets, type GalleryAsset } from "@/lib/gallery-assets";
import {
  PUBLIC_ATLAS_GROUPS,
  galleryDisplayGroup,
  isPublicAtlasAsset,
  sortGalleryAssets,
  type PublicAtlasGroup,
} from "@/lib/gallery-groups";
import { useI18n } from "@/lib/i18n";

type AtlasFilter = "all" | PublicAtlasGroup;

const INITIAL_VISIBLE = 12;
const LOAD_MORE = 12;

export function AuspiciousGallerySection() {
  const { locale } = useI18n();
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [filter, setFilter] = useState<AtlasFilter>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());
  const [loadFailed, setLoadFailed] = useState(false);

  const copy = useMemo(() => {
    if (locale === "en") {
      return {
        eyebrow: "ZHAOWU · SYMBOLIC ATLAS",
        title: "Zhaowu Auspicious Atlas",
        lead: "A public selection of sacred imagery, Daoist art, guardian beasts, auspicious symbols and destiny-themed works from the Zhaowu archive.",
        note: "Browse by theme, then tap any image to view the original artwork.",
        more: "Show 12 more",
        empty: "No public images are available yet.",
        failed: "The image archive is temporarily unavailable. Your analysis and reports still work normally.",
        groups: {
          all: "All",
          buddhist: "Sacred",
          daoist: "Daoist",
          "guardian-beast": "Guardian beasts",
          auspicious: "Auspicious / Feng shui",
          "report-art": "Destiny art",
        } satisfies Record<AtlasFilter, string>,
      };
    }
    if (locale === "zh-Hans") {
      return {
        eyebrow: "昭梧 · 吉象图鉴",
        title: "昭梧吉象图鉴",
        lead: "从昭梧总图库整理出的圣像、道韵、瑞兽、吉祥与命理意象。以图结缘，按你想看的类型慢慢翻。",
        note: "按主题浏览，点开任一图片即可查看原图。",
        more: "再看 12 张",
        empty: "目前没有可公开展示的图片。",
        failed: "图库暂时无法载入，不影响命理分析与报告。",
        groups: {
          all: "全部",
          buddhist: "圣像",
          daoist: "道韵",
          "guardian-beast": "瑞兽",
          auspicious: "吉祥·风水",
          "report-art": "命理",
        } satisfies Record<AtlasFilter, string>,
      };
    }
    return {
      eyebrow: "昭梧 · 吉象圖鑑",
      title: "昭梧吉象圖鑑",
      lead: "從昭梧總圖庫整理出的聖像、道韻、瑞獸、吉祥與命理意象。以圖結緣，按你想看的類型慢慢翻。",
      note: "按主題瀏覽，點開任一圖片即可查看原圖。",
      more: "再看 12 張",
      empty: "目前沒有可公開展示的圖片。",
      failed: "圖庫暫時無法載入，不影響命理分析與報告。",
      groups: {
        all: "全部",
        buddhist: "聖像",
        daoist: "道韻",
        "guardian-beast": "瑞獸",
        auspicious: "吉祥·風水",
        "report-art": "命理",
      } satisfies Record<AtlasFilter, string>,
    };
  }, [locale]);

  useEffect(() => {
    let alive = true;
    void listPublicGalleryAssets("visual-library")
      .then((rows) => {
        if (!alive) return;
        setAssets(sortGalleryAssets(rows.filter(isPublicAtlasAsset)));
        setLoadFailed(false);
      })
      .catch(() => {
        if (!alive) return;
        setLoadFailed(true);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [filter]);

  const usableAssets = useMemo(
    () => assets.filter((asset) => !failedIds.has(asset.id)),
    [assets, failedIds],
  );

  const counts = useMemo(() => {
    const value: Record<AtlasFilter, number> = {
      all: usableAssets.length,
      buddhist: 0,
      daoist: 0,
      "guardian-beast": 0,
      auspicious: 0,
      "report-art": 0,
    };
    for (const asset of usableAssets) {
      const group = galleryDisplayGroup(asset);
      if (PUBLIC_ATLAS_GROUPS.includes(group as PublicAtlasGroup)) value[group as PublicAtlasGroup] += 1;
    }
    return value;
  }, [usableAssets]);

  const filtered = useMemo(
    () => filter === "all" ? usableAssets : usableAssets.filter((asset) => galleryDisplayGroup(asset) === filter),
    [filter, usableAssets],
  );

  const visible = filtered.slice(0, visibleCount);

  return (
    <section id="auspicious-atlas" className="seal-border overflow-hidden rounded-[1.75rem] bg-cream/90 p-4 shadow-sm sm:p-7" aria-label={copy.title}>
      <header className="max-w-3xl">
        <p className="text-[10px] tracking-[0.3em] text-cinnabar">{copy.eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">{copy.title}</h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.lead}</p>
        <p className="mt-2 text-xs leading-6 text-ink-mute">{copy.note}</p>
      </header>

      <div className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-2" role="tablist" aria-label={copy.title}>
        {(["all", ...PUBLIC_ATLAS_GROUPS] as AtlasFilter[]).map((group) => (
          <button
            key={group}
            type="button"
            role="tab"
            aria-selected={filter === group}
            onClick={() => setFilter(group)}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs transition ${filter === group ? "border-cinnabar/50 bg-cinnabar text-cream" : "border-line bg-paper/70 text-ink-soft"}`}
          >
            {copy.groups[group]} <span className="opacity-70">{counts[group]}</span>
          </button>
        ))}
      </div>

      {loadFailed ? <p className="mt-5 rounded-xl border border-line bg-paper/60 p-4 text-sm text-ink-soft">{copy.failed}</p> : null}
      {!loadFailed && !assets.length ? <p className="mt-5 text-sm text-ink-mute">{copy.empty}</p> : null}

      {visible.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((asset) => {
            const group = galleryDisplayGroup(asset) as PublicAtlasGroup;
            const imageUrl = galleryPublicUrl(asset.storage_path, asset.bucket_id);
            return (
              <article key={asset.id} className="overflow-hidden rounded-2xl border border-line/80 bg-paper/55">
                <a href={imageUrl} target="_blank" rel="noreferrer" className="block" aria-label={`${copy.groups[group]} · ${asset.title}`}>
                  <div className="aspect-[9/16] bg-cream/60 p-1.5">
                    <img
                      src={imageUrl}
                      alt={`${copy.groups[group]} · ${asset.title}`}
                      loading="lazy"
                      decoding="async"
                      onError={() => setFailedIds((current) => {
                        const next = new Set(current);
                        next.add(asset.id);
                        return next;
                      })}
                      className="h-full w-full rounded-xl object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <span className="text-[11px] tracking-[0.16em] text-ink-soft">{copy.groups[group]}</span>
                    <span className="text-[10px] text-ink-mute">STONE</span>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      ) : null}

      {visibleCount < filtered.length ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + LOAD_MORE)}
            className="min-h-11 rounded-full border border-line bg-paper px-5 text-sm text-ink-soft"
          >
            {copy.more}
          </button>
        </div>
      ) : null}
    </section>
  );
}
