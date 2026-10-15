import { useI18n, type Locale } from "@/lib/i18n";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

/**
 * Closing card under a finished report: the same saved birth record opens six
 * further independent readings. Every chip is a real link (the old card only
 * scrolled to a collapsed form and therefore did nothing after a result).
 */
export function DeepReadingHeroCard() {
  const { locale } = useI18n();
  const readings: [string, string][] = [
    ["/ziwei", tr(locale, "紫微斗數", "紫微斗数", "Zi Wei")],
    ["/qizheng", tr(locale, "七政四餘", "七政四余", "Qi Zheng")],
    ["/astrology", tr(locale, "西洋占星", "西洋占星", "Western")],
    ["/indian-astrology", tr(locale, "印度占星", "印度占星", "Indian")],
    ["/yizhangjing", tr(locale, "一掌經", "一掌经", "Palm Scripture")],
    ["/numerology", tr(locale, "生命靈數", "生命灵数", "Numerology")],
  ];

  return (
    <section className="zhaowu-home-stage zw-deep-card" data-deep-reading-card>
      <img src="/deep-reading-song-mineral.webp" className="zw-deep-card__art" loading="lazy" decoding="async" alt="" aria-hidden="true" />
      <div className="zw-deep-card__body">
        <span className="zw-deep-card__kicker">{tr(locale, "深度解讀", "深度解读", "GO DEEPER")}</span>
        <h2 className="zw-deep-card__title">{tr(locale, "同一份生辰，再看六種命理", "同一份生辰，再看六种命理", "Six more readings from the same birth record")}</h2>
        <p className="zw-deep-card__lead">{tr(locale, "不用重填資料，點選即開。", "不用重填资料，点选即开。", "No need to re-enter anything — tap to open.")}</p>
        <nav className="zw-deep-card__links" aria-label={tr(locale, "六種命理專卷", "六种命理专卷", "Six readings")}>
          {readings.map(([href, label]) => <a key={href} href={href}>{label}<span aria-hidden>→</span></a>)}
        </nav>
      </div>
    </section>
  );
}
