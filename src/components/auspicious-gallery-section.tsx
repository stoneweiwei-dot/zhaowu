import { useEffect, useMemo, useState } from "react";
import { galleryPublicUrl, listPublicGalleryAssets, type GalleryAsset } from "@/lib/gallery-assets";
import { isPublicAtlasAsset } from "@/lib/gallery-groups";
import { useI18n } from "@/lib/i18n";

const INITIAL_VISIBLE = 12;
const LOAD_MORE = 12;

export function AuspiciousGallerySection() {
  const { locale } = useI18n();
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set());
  const [loadFailed, setLoadFailed] = useState(false);

  const copy = useMemo(() => {
    if (locale === "en") {
      return {
        eyebrow: "ZHAOWU · SYMBOLIC ATLAS",
        title: "Zhaowu Auspicious Atlas",
        lead: "A public selection of sacred, auspicious, feng shui and destiny-themed imagery from the Zhaowu archive.",
        note: "Tap any image to view the original artwork.",
        card: "Zhaowu symbol",
        mark: "© STONE",
        more: "Show 12 more",
        empty: "No public images are available yet.",
        failed: "The image archive is temporarily unavailable. Your analysis and reports still work normally.",
      };
    }
    if (locale === "zh-Hans") {
      return {
        eyebrow: "昭梧 · 吉象图鉴",
        title: "昭梧吉象图鉴",
        lead: "从昭梧总图库整理出的结缘圣像、吉祥风水与命理意象。以图结缘，按自己的节奏慢慢翻。",
        note: "点开任一图片即可查看原图。",
        card: "昭梧吉象",
        mark: "STONE 原創",
        more: "再看 12 张",
        empty: "目前没有可公开展示的图片。",
        failed: "图库暂时无法载入，不影响命理分析与报告。",
      };
    }
    return {
      eyebrow: "昭梧 · 吉象圖鑑",
      title: "昭梧吉象圖鑑",
      lead: "從昭梧總圖庫整理出的結緣聖像、吉祥風水與命理意象。以圖結緣，按自己的節奏慢慢翻。",
      note: "點開任一圖片即可查看原圖。",
      card: "昭梧吉象",
      mark: "STONE 原創",
      more: "再看 12 張",
      empty: "目前沒有可公開展示的圖片。",
      failed: "圖庫暫時無法載入，不影響命理分析與報告。",
    };
  }, [locale]);

  useEffect(() => {
    let alive = true;
    void listPublicGalleryAssets("visual-library")
      .then((rows) => {
        if (!alive) return;
        setAssets(rows.filter(isPublicAtlasAsset));
        setLoadFailed(false);
      })
      .catch(() => {
        if (!alive) return;
        setLoadFailed(true);
      });
    return () => { alive = false; };
  }, []);

  const usableAssets = useMemo(
    () => assets.filter((asset) => !failedIds.has(asset.id)),
    [assets, failedIds],
  );
  const visible = usableAssets.slice(0, visibleCount);

  return (
    <section id="auspicious-atlas" className="seal-border overflow-hidden rounded-[1.75rem] bg-cream/90 p-4 shadow-sm sm:p-7" aria-label={copy.title}>
      <header className="max-w-3xl">
        <p className="text-[10px] tracking-[0.3em] text-cinnabar">{copy.eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">{copy.title}</h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.lead}</p>
        <p className="mt-2 text-xs leading-6 text-ink-mute">{copy.note}</p>
      </header>

      {loadFailed ? <p className="mt-5 rounded-xl border border-line bg-paper/60 p-4 text-sm text-ink-soft">{copy.failed}</p> : null}
      {!loadFailed && !assets.length ? <p className="mt-5 text-sm text-ink-mute">{copy.empty}</p> : null}

      {visible.length ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((asset) => {
            const imageUrl = galleryPublicUrl(asset.storage_path, asset.bucket_id);
            return (
              <article key={asset.id} className="overflow-hidden rounded-2xl border border-line/80 bg-paper/55">
                <a href={imageUrl} target="_blank" rel="noreferrer" className="block" aria-label={asset.title || copy.card}>
                  <div className="aspect-[9/16] bg-cream/60 p-1.5">
                    <img
                      src={imageUrl}
                      alt={asset.title || copy.card}
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
                    <span className="text-[11px] tracking-[0.12em] text-ink-soft">{copy.card}</span>
                    <span className="text-[10px] text-ink-mute">{copy.mark}</span>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      ) : null}

      {visibleCount < usableAssets.length ? (
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
