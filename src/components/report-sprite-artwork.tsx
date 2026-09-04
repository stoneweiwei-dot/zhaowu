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

  useEffect(() => setFailed(false), [assetKey]);

  const useFallback = !asset || failed;
  const src = useFallback ? FALLBACK_SRC : asset.src;
  const style = useFallback
    ? undefined
    : {
        width: `${asset.count * 100}%`,
        left: `${asset.index * -100}%`,
      };

  return (
    <figure className={`zhaowu-sprite-artwork ${compact ? "is-compact" : ""}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`zhaowu-sprite-image ${useFallback ? "is-fallback" : ""}`}
        style={style}
        onError={() => {
          if (!useFallback) setFailed(true);
        }}
      />
      {useFallback ? <figcaption>{fallbackText}</figcaption> : null}
    </figure>
  );
}
