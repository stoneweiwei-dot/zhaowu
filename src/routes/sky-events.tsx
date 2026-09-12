import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { SKY_EVENTS, SKY_EVENT_CATEGORIES } from "@/lib/sky-events";
import "@/sky-events.css";

export const Route = createFileRoute("/sky-events")({ component: SkyEventsPage });

function SkyEventsPage() {
  const { locale } = useI18n();
  const lang = locale === "en" ? "en" : locale === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const event = SKY_EVENTS[0];
  const ui = locale === "en"
    ? { title: "Recent Sky Events", lead: "Astronomical reality × symbolic astrology", back: "Home", science: "Astronomy layer · verifiable", symbolic: "Astrology layer · symbolic", houses: "Where Scorpio falls in your natal chart", sources: "Sources & verification", watch: "What this desk will publish first", note: "Astronomy and astrology are not presented as the same kind of knowledge. Measurable celestial motion is factual; personal meaning is a symbolic interpretive tradition." }
    : locale === "zh-Hans"
      ? { title: "近日天象", lead: "天文实况 × 星象解读", back: "返回首页", science: "天文层｜可验证事实", symbolic: "占星层｜象征性解读", houses: "天蝎落入本命不同宫位", sources: "资料来源与核验", watch: "本专栏第一时间发布", note: "本站不会把天文学与占星解释混成同一种证据。可测量的天体运动属于事实层；个人意义属于传统占星的象征解释层。" }
      : { title: "近日天象", lead: "天文實況 × 星象解讀", back: "返回首頁", science: "天文層｜可驗證事實", symbolic: "占星層｜象徵性解讀", houses: "天蠍落入本命不同宮位", sources: "資料來源與核驗", watch: "本專欄第一時間發布", note: "本站不會把天文學與占星解讀混成同一種證據。可測量的天體運動屬於事實層；個人意義屬於傳統占星的象徵解讀層。" };

  return (
    <main className="sky-events-page">
      <nav className="sky-events-nav"><Link to="/">← {ui.back}</Link><span>昭梧 · SKY DESK</span></nav>
      <header className="sky-events-hero">
        <span className="sky-events-kicker">CELESTIAL WATCH</span>
        <h1>{ui.title}</h1>
        <p>{ui.lead}</p>
        <div className="sky-events-truth-note">{ui.note}</div>
      </header>

      <section className="sky-events-watch">
        <h2>{ui.watch}</h2>
        <div className="sky-events-category-grid">{SKY_EVENT_CATEGORIES.map((x) => <span key={x}>{x}</span>)}</div>
      </section>

      <article className="sky-event-article">
        <header className="sky-event-title">
          <div className="sky-event-orbit" aria-hidden="true"><span>♀</span></div>
          <div><span className="sky-events-kicker">2026 · VENUS</span><h2>{event.title[lang]}</h2><p>{event.subtitle[lang]}</p></div>
        </header>

        <div className="sky-event-timeline">
          {event.facts.map((fact) => <div key={fact.date}><time>{fact.date}</time><span>{fact.label[lang]}</span></div>)}
        </div>

        <div className="sky-event-two-layers">
          <section className="sky-event-layer science">
            <span className="sky-layer-tag">OBSERVABLE</span><h3>{ui.science}</h3>
            <ul>{event.science[lang].map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          <section className="sky-event-layer symbolic">
            <span className="sky-layer-tag">INTERPRETIVE</span><h3>{ui.symbolic}</h3>
            <ul>{event.interpretation[lang].map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
        </div>

        <section className="sky-event-houses">
          <h3>{ui.houses}</h3>
          <div>{event.houses.map((x) => <article key={x.house}><b>{x.house}</b><span>{x[lang]}</span></article>)}</div>
        </section>

        <footer className="sky-event-sources">
          <h3>{ui.sources}</h3>
          <div>{event.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>)}</div>
        </footer>
      </article>
    </main>
  );
}
