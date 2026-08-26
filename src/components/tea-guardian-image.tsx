import { useEffect, useState } from "react";
import { galleryPublicUrl, resolvePrimaryGalleryAssets } from "@/lib/gallery-assets";

export function TeaGuardianImage({ teaId, fallback, alt, className }: { teaId: string; fallback?: string | null; alt: string; className: string }) {
  const [src, setSrc] = useState<string | null>(fallback || null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    void resolvePrimaryGalleryAssets("tea-guardian", [teaId]).then((rows) => {
      if (!active) return;
      const asset = rows[teaId];
      setSrc(asset ? galleryPublicUrl(asset.storage_path) : (fallback || null));
    }).catch(() => {
      if (active) setSrc(fallback || null);
    });
    return () => { active = false; };
  }, [fallback, teaId]);

  if (!src || failed) {
    return (
      <div className={`${className} grid place-items-center bg-paper-deep/75 p-4 text-center`} role="img" aria-label={alt}>
        <span className="font-display text-sm tracking-[0.12em] text-ink-mute">{alt}</span>
      </div>
    );
  }

  return <img src={src} alt={alt} loading="lazy" className={className} onError={() => setFailed(true)} />;
}
