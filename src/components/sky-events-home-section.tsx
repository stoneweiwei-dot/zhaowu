import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { SKY_EVENTS } from "@/lib/sky-events";
import "@/sky-events.css";

export function SkyEventsHomeSection() {
  const { locale } = useI18n();
  const item = SKY_EVENTS[0];
  const lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const title = locale === "en" ? "Recent sky events" : locale === "zh-Hans" ? "近日天象" : "近日天象";
  const lead = locale === "en"
    ? "Astronomical facts first; symbolic astrology is shown separately."
    : locale === "zh-Hans"
      ? "先核对天文事实，再把占星象征解释独立呈现。"
      : "先核對天文事實，再把占星象徵解讀獨立呈現。";
  const cta = locale === "en" ? "Open sky-events desk" : locale === "zh-Hans" ? "查看天象专栏" : "查看天象專欄";
  return (
    <section className="sky-events-home" aria-label={title}>
      <header>
        <span className="sky-events-kicker">ASTRONOMY × ASTROLOGY</span>
        <h2>{title}</h2>
        <p>{lead}</p>
      </header>
      <Link to="/sky-events" className="sky-events-feature">
        <div className="sky-events-feature-mark" aria-hidden="true">♀</div>
        <div className="sky-events-feature-copy">
          <div className="sky-events-badges">
            <span className="is-science">{locale === "en" ? "Astronomy verified" : "天文可驗證"}</span>
            <span className="is-symbolic">{locale === "en" ? "Symbolic layer" : "星象象徵層"}</span>
          </div>
          <strong>{item.title[lang]}</strong>
          <small>{item.subtitle[lang]}</small>
          <span className="sky-events-timeline">9/10 → 10/3 Rx → 10/25 → 11/13 D → 12/4 → 1/7</span>
        </div>
        <span className="sky-events-open">{cta} ›</span>
      </Link>
    </section>
  );
}
