import { FormEvent, useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BackgroundMusic } from "@/components/background-music";
import { askSiteGuide, defaultSiteGuide, type SiteGuideAnswer, type SiteGuideRoute } from "@/lib/site-guide";
import { JOURNEY_COPY } from "@/lib/site-journey";
import { useI18n, type Locale } from "@/lib/i18n";

type UtilityPanel = "music" | "guide" | null;

function go(route: SiteGuideRoute) {
  if (route === "/#birth-form") {
    if (window.location.pathname !== "/") window.location.assign("/#birth-form");
    else window.dispatchEvent(new CustomEvent("zhaowu:open-birth-form"));
    return;
  }
  window.location.assign(route);
}

function copyFor(locale: Locale) {
  if (locale === "en") {
    return {
      music: "Music",
      guide: "Guide",
      close: "Close",
      title: "Site guide",
      placeholder: "For example: take me to my complete report",
      ask: "Ask",
      report: "Create a Destiny Book",
      today: "Today",
      tests: "Explore",
      history: "My reports",
      more: "More features",
      help: "Cannot find something? Ask here",
      notes: "Articles",
      advanced: "Other charts and cultural tools",
    };
  }
  if (locale === "zh-Hans") {
    return {
      music: "音乐",
      guide: "导览",
      close: "关闭",
      title: "网站导览",
      placeholder: "例如：带我去看完整报告",
      ask: "询问",
      report: "建立命书",
      today: "今日黄历",
      tests: "趣味测验",
      history: "我的报告",
      more: "更多功能",
      help: "找不到入口？在这里问",
      notes: "文章",
      advanced: "其他命盘与文化工具",
    };
  }
  return {
    music: "音樂",
    guide: "導覽",
    close: "關閉",
    title: "網站導覽",
    placeholder: "例如：帶我去看完整報告",
    ask: "詢問",
    report: "建立命書",
    today: "今日黃曆",
    tests: "趣味測驗",
    history: "我的報告",
    more: "更多功能",
    help: "找不到入口？在這裡問",
    notes: "文章",
    advanced: "其他命盤與文化工具",
  };
}

export function SiteUtilityDock() {
  const { locale } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const copy = copyFor(locale);
  const journey = JOURNEY_COPY[locale];
  const en = locale === "en", hans = locale === "zh-Hans";
  const moreLinks = [
    ["/#today", copy.today], ["/#quiz", copy.tests], ["/#notes", copy.notes],
  ];
  const advancedLinks = [
    ["/ziwei", en ? "Zi Wei chart" : hans ? "紫微斗数" : "紫微斗數"],
    ["/qizheng", en ? "Seven Luminaries" : hans ? "七政四余" : "七政四餘"],
    ["/astrology", en ? "Western astrology" : "西洋占星"],
    ["/indian-astrology", en ? "Indian astrology" : "印度占星"],
    ["/yizhangjing", en ? "Palm scripture" : hans ? "一掌经" : "一掌經"],
    ["/numerology", en ? "Numerology" : hans ? "生命灵数" : "生命靈數"],
    ["/knowledge", en ? "Cultural knowledge" : hans ? "文化知识" : "文化知識"],
    ["/auspicious-atlas", en ? "Artwork atlas" : hans ? "吉象图鉴" : "吉象圖鑑"],
  ];
  const [panel, setPanel] = useState<UtilityPanel>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState(false);
  const [answer, setAnswer] = useState<SiteGuideAnswer>(() => defaultSiteGuide(locale));

  useEffect(() => {
    setAnswer(defaultSiteGuide(locale));
  }, [locale]);

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
      const next = await askSiteGuide(message, locale, pathname);
      setAnswer(next);
      setAsked(true);
      setInput("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="zhaowu-site-utility-dock" data-site-utility-dock aria-label={locale === "en" ? "Site utilities" : locale === "zh-Hans" ? "网站工具" : "網站工具"}>
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
