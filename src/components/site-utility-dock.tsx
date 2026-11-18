import { FormEvent, useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BackgroundMusic } from "@/components/background-music";
import { askSiteGuide, defaultSiteGuide, type SiteGuideAnswer, type SiteGuideRoute } from "@/lib/site-guide";
import { JOURNEY_COPY } from "@/lib/site-journey";
import { useDisplayLanguage } from "@/lib/display-language";
import { SITE_LOCALIZATION } from "@/lib/site-localization";

type UtilityPanel = "music" | "guide" | null;

function go(route: SiteGuideRoute) {
  if (route === "/#birth-form") {
    if (window.location.pathname !== "/") window.location.assign("/#birth-form");
    else window.dispatchEvent(new CustomEvent("zhaowu:open-birth-form"));
    return;
  }
  window.location.assign(route);
}

export function SiteUtilityDock() {
  const language = useDisplayLanguage((state) => state.language);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { utility: copy, advanced } = SITE_LOCALIZATION[language];
  const journey = JOURNEY_COPY[language];
  const moreLinks = [
    ["/#today", copy.today], ["/#quiz", copy.tests], ["/#notes", copy.notes],
  ];
  const advancedLinks = [
    ["/ziwei", advanced.ziwei], ["/qizheng", advanced.qizheng],
    ["/astrology", advanced.astrology], ["/indian-astrology", advanced.indian],
    ["/yizhangjing", advanced.palm], ["/numerology", advanced.numerology],
    ["/knowledge", advanced.knowledge], ["/auspicious-atlas", advanced.atlas],
  ];
  const [panel, setPanel] = useState<UtilityPanel>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState(false);
  const [answer, setAnswer] = useState<SiteGuideAnswer>(() => defaultSiteGuide(language));

  useEffect(() => {
    setAnswer(defaultSiteGuide(language));
  }, [language]);

  useEffect(() => {
    const openGuide = () => setPanel("guide");
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setPanel(null); };
    window.addEventListener("zhaowu:open-guide", openGuide);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("zhaowu:open-guide", openGuide);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  useEffect(() => { setPanel(null); setAsked(false); }, [pathname]);
  // `/guide` has no page of its own: vercel.json redirects it to `/?guide=1`, which opens the
  // guide panel once and then cleans the URL. Declared after the pathname effect so it wins on mount.
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("guide") !== "1") return;
      setPanel("guide");
      url.searchParams.delete("guide");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    } catch { /* never block the dock on URL parsing */ }
  }, []);

  function navigate(route: SiteGuideRoute) { setPanel(null); go(route); }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setBusy(true);
    try {
      const next = await askSiteGuide(message, language, pathname);
      setAnswer(next);
      setAsked(true);
      setInput("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="zhaowu-site-utility-dock" data-site-utility-dock aria-label={copy.siteAria}>
      <section className="zhaowu-site-utility-panel" data-utility-panel="music" hidden={panel !== "music"} aria-label={copy.music}>
        <div className="zhaowu-site-utility-panel-head">
          <strong>{copy.music}</strong>
          <button type="button" onClick={() => setPanel(null)} aria-label={copy.close}>×</button>
        </div>
        <BackgroundMusic visible={panel === "music"} />
      </section>

      <section className="zhaowu-site-utility-panel zhaowu-site-guide-panel" data-utility-panel="guide" hidden={panel !== "guide"} aria-label={copy.title}>
        <div className="zhaowu-site-utility-panel-head">
          <strong>{copy.title}</strong>
          <button type="button" onClick={() => setPanel(null)} aria-label={copy.close}>×</button>
        </div>

        <ol className="zw-guide-steps" aria-label={journey.title}>
          {journey.steps.map((step, index) => <li key={step}><strong>{index + 1} · {step}</strong><p>{journey.hints[index]}</p></li>)}
        </ol>
        <div className="zhaowu-site-guide-shortcuts" aria-label={copy.title}>
          <button type="button" onClick={() => navigate("/#birth-form")}>{copy.report}</button>
          <button type="button" onClick={() => navigate("/history")}>{copy.history}</button>
        </div>
        <details className="zw-guide-more">
          <summary>{copy.more}</summary>
          <nav aria-label={copy.more}>{moreLinks.map(([href, label]) => <a href={href} key={href} onClick={() => setPanel(null)}>{label}</a>)}</nav>
          <details><summary>{copy.advanced}</summary><nav aria-label={copy.advanced}>{advancedLinks.map(([href, label]) => <a href={href} key={href} onClick={() => setPanel(null)}>{label}</a>)}</nav></details>
        </details>
        <details className="zw-guide-more">
          <summary>{copy.help}</summary>
          {asked ? <div className="zhaowu-site-guide-answer" aria-live="polite">
            <p>{answer.reply}</p>
            {answer.route && answer.cta ? <button type="button" onClick={() => answer.route && navigate(answer.route)}>{answer.cta}<span aria-hidden="true"> →</span></button> : null}
          </div> : null}
          <form onSubmit={submit} className="zhaowu-site-guide-form">
            <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={400} placeholder={copy.placeholder} aria-label={copy.placeholder} />
            <button type="submit" disabled={busy || !input.trim()}>{busy ? "…" : copy.ask}</button>
          </form>
        </details>
      </section>

      <div className="zhaowu-site-utility-buttons">
        <button
          type="button"
          className={panel === "music" ? "is-active" : ""}
          aria-expanded={panel === "music"}
          onClick={() => setPanel((current) => current === "music" ? null : "music")}
        >
          <span className="zhaowu-site-utility-icon" aria-hidden="true">♪</span>
          <span>{copy.music}</span>
        </button>
        <button
          type="button"
          className={panel === "guide" ? "is-active" : ""}
          aria-expanded={panel === "guide"}
          onClick={() => setPanel((current) => current === "guide" ? null : "guide")}
        >
          <span className="zhaowu-site-utility-icon" aria-hidden="true">◎</span>
          <span>{copy.guide}</span>
        </button>
      </div>
    </aside>
  );
}
