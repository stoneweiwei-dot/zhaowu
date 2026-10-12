import { useEffect, useMemo, useState } from "react";
import type { ReportVisualAsset } from "@/lib/report/report-visual-assets";
import { ImageViewer, viewerCopy, type ImageViewerItem } from "@/components/image-viewer";
import { useI18n } from "@/lib/i18n";
import "@/report-visual-assets.css";

const FALLBACK_SRC = "/wallpaper-song.jpg";

type Props = {
  asset: ReportVisualAsset | null;
  alt: string;
  fallbackText: string;
  compact?: boolean;
  gallery?: ImageViewerItem[];
  /** "character" keeps the near-square 720x773 illustration uncropped; default is the 9:16 sprite cell. */
  variant?: "sprite" | "character";
  /** Lets a caller swap to a legacy asset when this one fails to load. */
  onAssetError?: () => void;
};

export function toViewerItem(asset: ReportVisualAsset, alt: string): ImageViewerItem {
  return { id: asset.id, alt, thumbnailUrl: asset.thumbnailUrl, fullImageUrl: asset.fullImageUrl };
}

export function ReportSpriteArtwork({ asset, alt, fallbackText, compact = false, gallery, variant = "sprite", onAssetError }: Props) {
  const { locale } = useI18n();
  const copy = viewerCopy(locale);
  const assetKey = useMemo(
    () => (asset ? `${asset.id}:${asset.thumbnailUrl}:${asset.fullImageUrl}` : "fallback"),
    [asset],
  );
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => setFailed(false), [assetKey]);

  const useFallback = !asset || failed;
  const thumb = useFallback ? FALLBACK_SRC : asset.thumbnailUrl;
  const items = gallery && gallery.length
    ? gallery
    : asset && !useFallback
      ? [toViewerItem(asset, alt)]
      : [];

  return (
    <figure className={`zhaowu-sprite-artwork ${compact ? "is-compact" : ""} ${variant === "character" ? "is-character" : ""}`}>
      {useFallback ? (
        <>
          <img src={FALLBACK_SRC} alt={alt} loading="lazy" decoding="async" className="zhaowu-sprite-image is-fallback" />
          <figcaption>{fallbackText}</figcaption>
        </>
      ) : (
        <button
          type="button"
          className="zhaowu-sprite-open"
          aria-label={`${alt} · ${copy.hint}`}
          onClick={() => {
            const start = Math.max(0, items.findIndex((item) => item.id === asset.id));
            setIndex(start);
            setOpen(true);
          }}
        >
          <img
            src={thumb}
            alt={alt}
            width={variant === "character" ? 720 : 420}
            height={variant === "character" ? 773 : 747}
            loading="lazy"
            decoding="async"
            className="zhaowu-sprite-image is-single"
            onError={() => {
              setFailed(true);
              onAssetError?.();
            }}
          />
          <span className="zhaowu-image-viewer-hint">{copy.hint}</span>
        </button>
      )}
      {open && items.length ? (
        <ImageViewer items={items} index={index} onClose={() => setOpen(false)} onIndexChange={setIndex} />
      ) : null}
    </figure>
  );
}
