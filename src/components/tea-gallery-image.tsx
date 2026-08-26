import { useEffect, useState } from "react";
import { galleryPublicUrl, resolvePrimaryGalleryAssets } from "@/lib/gallery-assets";

export function TeaGalleryImage({ teaId, fallback, alt, className }: { teaId: string; fallback: string; alt: string; className: string }) {
  const [src, setSrc] = useState(fallback);
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    let alive = true;
    setSrc(fallback);
    setUsingFallback(true);

    void resolvePrimaryGalleryAssets("tea-guardian", [teaId])
      .then((assets) => {
        if (!alive) return;
        const asset = assets[teaId];
        if (!asset) return;
        setSrc(galleryPublicUrl(asset.storage_path, asset.bucket_id));
        setUsingFallback(false);
      })
      .catch(() => undefined);

    return () => { alive = false; };
  }, [fallback, teaId]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!usingFallback && src !== fallback) {
          setSrc(fallback);
          setUsingFallback(true);
        }
      }}
    />
  );
}
