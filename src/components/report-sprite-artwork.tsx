import { useEffect, useMemo, useState } from "react";
import type { ReportVisualAsset } from "@/lib/report/report-visual-assets";
import "@/report-visual-assets.css";

const FALLBACK_SRC = "/wallpaper-song.jpg";

type Props = {
  asset: ReportVisualAsset | null;
  alt: string;
  fallbackText: string;
  compact?: boolean;
};

export function ReportSpriteArtwork({ asset, alt, fallbackText, compact = false }: Props) {
  const assetKey = useMemo(
    () => (asset ? `${asset.src}:${asset.index}:${asset.count}` : "fallback"),
    [asset],
  );
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setFailed(false);
    setOpen(false);
  }, [assetKey]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const useFallback = !asset || failed;
  const src = useFallback ? FALLBACK_SRC : asset.src;
  const style = useFallback
    ? undefined
    : {
        width: `${asset.count * 100}%`,
        left: `${asset.index * -100}%`,
      };

  const artwork = (large = false) => (
    <div className={`zhaowu-sprite-frame ${large ? "is-lightbox" : ""}`}>
      <img
        src={src}
        alt={alt}
        loading={large ? "eager" : "lazy"}
        decoding="async"
        className={`zhaowu-sprite-image ${useFallback ? "is-fallback" : ""}`}
        style={style}
        onError={() => {
          if (!useFallback) setFailed(true);
        }}
      />
    </div>
  );

  return (
    <>
      <figure className={`zhaowu-sprite-artwork ${compact ? "is-compact" : ""}`}>
        <button
          type="button"
          className="zhaowu-sprite-open"
          aria-label={`放大查看：${alt}`}
          onClick={() => setOpen(true)}
        >
          {artwork(false)}
          <span className="zhaowu-sprite-open-hint" aria-hidden="true">＋</span>
        </button>
        {useFallback ? <figcaption>{fallbackText}</figcaption> : null}
      </figure>

      {open ? (
        <div
          className="zhaowu-art-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="zhaowu-art-lightbox-close"
            aria-label="關閉大圖"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
          <div
            className="zhaowu-art-lightbox-scroll"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="zhaowu-art-lightbox-image" aria-label={alt}>
              {artwork(true)}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
