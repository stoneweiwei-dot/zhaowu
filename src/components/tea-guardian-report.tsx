import { TeaGalleryImage } from "@/components/tea-gallery-image";
import type { Chart } from "@/lib/bazi/types";
import type { Locale } from "@/lib/i18n";
import { localizeTea, type TeaProfile } from "@/lib/tea-guardian";

const COPY = {
  "zh-Hant": { imageAlt: "昭梧茶仙守護圖" },
  "zh-Hans": { imageAlt: "昭梧茶仙守护图" },
  en: { imageAlt: "Zhaowu tea guardian artwork" },
} as const;

export function TeaPortraitCard({ tea, label, locale, featured = false }: { tea: TeaProfile; label: string; locale: Locale; featured?: boolean }) {
  const item = localizeTea(tea, locale);
  return (
    <article className={`tea-result-card ${featured ? "is-featured" : ""}`}>
      <div className="tea-result-image-wrap">
        <TeaGalleryImage teaId={tea.id} fallback={item.image} alt={`${COPY[locale].imageAlt}・${item.name}`} className="tea-result-image" />
      </div>
      <div className="tea-result-copy">
        <p className="tea-result-label">{label}</p>
        <h3>{item.name}</h3>
        <p className="tea-result-guardian">{item.guardian}</p>
        <p className="tea-result-meta">{item.origin} · {item.category}</p>
        <p className="tea-result-note">{item.note}</p>
      </div>
    </article>
  );
}

export function TeaGuardianReport({ chart: _chart }: { chart: Chart }) {
  // The embedded report slot is intentionally retired. Tea Guardian remains a
  // standalone experience at /tea-guardian so the paid report stays one sheet.
  return null;
}
