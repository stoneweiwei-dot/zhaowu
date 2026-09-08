import type { Locale } from "@/lib/i18n";
import { BRAND_UI_CATALOG } from "@/lib/brand-ui-catalog";

function titleFor(locale: Locale, item: (typeof BRAND_UI_CATALOG)[number]) {
  return locale === "en" ? item.titleEn : locale === "zh-Hans" ? item.titleHans : item.titleHant;
}

export function BrandUiLibrary({ locale }: { locale: Locale }) {
  const copy = locale === "en"
    ? { eyebrow: "BUILT-IN BRAND UI", title: "Zhaowu website art assets", lead: "Production SVG assets derived from the approved pine, sun, moon, mountain and flowing-line system. They are built into the site and are not part of the upload library." }
    : locale === "zh-Hans"
      ? { eyebrow: "内置品牌美术", title: "昭梧网站美术元件", lead: "按已确认的松、日、月、山与流云线条体系整理为可缩放 SVG。它们直接内置于网站，不占用上传图库。" }
      : { eyebrow: "內置品牌美術", title: "昭梧網站美術元件", lead: "按已確認的松、日、月、山與流雲線條體系整理為可縮放 SVG。它們直接內置於網站，不佔用上傳圖庫。" };

  return (
    <section className="seal-border rounded-[1.6rem] bg-cream/95 p-5 sm:p-7" data-owner-brand-ui>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.28em] text-cinnabar">{copy.eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-soft">{copy.lead}</p>
        </div>
        <img src="/brand-ui/logo-primary.svg" alt="昭梧" className="zhaowu-brand-ui-library__hero" width={92} height={92} />
      </div>

      <div className="zhaowu-brand-ui-library__grid mt-5">
        {BRAND_UI_CATALOG.map((item) => (
          <article key={item.key} className="zhaowu-brand-ui-library__asset">
            <div className="zhaowu-brand-ui-library__preview">
              <img src={item.publicPath} alt={titleFor(locale, item)} loading="lazy" decoding="async" />
            </div>
            <div className="zhaowu-brand-ui-library__meta">
              <strong>{titleFor(locale, item)}</strong>
              <small>{item.tags.join(" · ")}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
