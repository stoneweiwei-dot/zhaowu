import type { Locale } from "@/lib/i18n";
import { BRAND_UI_CATALOG, BRAND_UI_GROUPS } from "@/lib/brand-ui-catalog";

function titleFor(locale: Locale, item: (typeof BRAND_UI_CATALOG)[number]) {
  return locale === "en" ? item.titleEn : locale === "zh-Hans" ? item.titleHans : item.titleHant;
}

function purposeFor(locale: Locale, item: (typeof BRAND_UI_CATALOG)[number]) {
  return locale === "en" ? item.purposeEn : locale === "zh-Hans" ? item.purposeHans : item.purposeHant;
}

export function BrandUiLibrary({ locale }: { locale: Locale }) {
  const copy = locale === "en"
    ? { eyebrow: "BUILT-IN BRAND UI", title: "Zhaowu design system", lead: "Locked pine / sun / moon / mountain / cloud assets. Gourd is a special auspicious mark only and never replaces the primary logo. One screen uses at most two decorative motifs.", using: "in use", spare: "library only", day: "day", night: "night", both: "day / night" }
    : locale === "zh-Hans"
      ? { eyebrow: "内置品牌美术", title: "昭梧设计系统", lead: "锁定松、日、月、山、云资产。葫芦只作吉祥功能标，不抢主 Logo。同一画面最多使用两种装饰母题。", using: "正在使用", spare: "仅库存", day: "日", night: "夜", both: "日／夜" }
      : { eyebrow: "內置品牌美術", title: "昭梧設計系統", lead: "鎖定松、日、月、山、雲資產。葫蘆只作吉祥功能標，不搶主 Logo。同一畫面最多使用兩種裝飾母題。", using: "正在使用", spare: "僅庫存", day: "日", night: "夜", both: "日／夜" };

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

      {BRAND_UI_GROUPS.map((group) => {
        const items = BRAND_UI_CATALOG.filter((item) => item.group === group.id);
        if (!items.length) return null;
        const heading = locale === "en" ? group.en : locale === "zh-Hans" ? group.hans : group.hant;
        return (
          <section key={group.id} className="zhaowu-brand-ui-library__section" data-brand-section={group.id}>
            <h2 className="zhaowu-brand-ui-library__section-title">{heading}</h2>
            <div className="zhaowu-brand-ui-library__grid">
              {items.map((item) => (
                <article key={item.key} className="zhaowu-brand-ui-library__asset" data-brand-group={item.group} data-in-use={item.inUse ? "true" : "false"}>
                  <div className={`zhaowu-brand-ui-library__preview${item.theme === "night" ? " is-night" : ""}`}>
                    <img src={item.publicPath} alt={titleFor(locale, item)} loading="lazy" decoding="async" />
                  </div>
                  <div className="zhaowu-brand-ui-library__meta">
                    <strong>{titleFor(locale, item)}</strong>
                    <small>{purposeFor(locale, item)}</small>
                    <small>{item.theme === "night" ? copy.night : item.theme === "day" ? copy.day : copy.both} · {item.inUse ? copy.using : copy.spare}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}
