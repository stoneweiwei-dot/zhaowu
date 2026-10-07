import { FormEvent, useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BackgroundMusic } from "@/components/background-music";
import { askSiteGuide, defaultSiteGuide, type SiteGuideAnswer, type SiteGuideRoute } from "@/lib/site-guide";
import { useI18n, type Locale } from "@/lib/i18n";

type UtilityPanel = "music" | "guide" | null;

function go(route: SiteGuideRoute) {
  if (route === "/#analysisForm") {
    if (window.location.pathname !== "/") window.location.assign("/#analysisForm");
    else document.getElementById("analysisForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      report: "Destiny Book",
      today: "Today",
      tests: "Explore",
      history: "My history",
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
      report: "命书分析",
      today: "今日运势",
      tests: "趣味测验",
      history: "我的记录",
    };
  }
  return {
    music: "音樂",
    guide: "導覽",
    close: "關閉",
    title: "網站導覽",
    placeholder: "例如：帶我去看完整報告",
    ask: "詢問",
    report: "命書分析",
    today: "今日運勢",
    tests: "趣味測驗",
    history: "我的紀錄",
  };
}

export function SiteUtilityDock() {
  const { locale } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const copy = copyFor(locale);
  const [panel, setPanel] = useState<UtilityPanel>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<SiteGuideAnswer>(() => defaultSiteGuide(locale));

  useEffect(() => {
    setAnswer(defaultSiteGuide(locale));
  }, [locale]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setBusy(true);
    try {
      const next = await askSiteGuide(message, locale, pathname);
      setAnswer(next);
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
        <BackgroundMusic />
      </section>

      <section className="zhaowu-site-utility-panel zhaowu-site-guide-panel" data-utility-panel="guide" hidden={panel !== "guide"} aria-label={copy.title}>
        <div className="zhaowu-site-utility-panel-head">
          <strong>{copy.title}</strong>
          <button type="button" onClick={() => setPanel(null)} aria-label={copy.close}>×</button>
        </div>

        <div className="zhaowu-site-guide-shortcuts" aria-label={copy.title}>
          <button type="button" onClick={() => go("/#analysisForm")}>{copy.report}</button>
          <button type="button" onClick={() => window.location.assign("/#today")}>{copy.today}</button>
          <button type="button" onClick={() => window.location.assign("/fun-tests")}>{copy.tests}</button>
          <button type="button" onClick={() => go("/history")}>{copy.history}</button>
        </div>

        <div className="zhaowu-site-guide-answer" aria-live="polite">
          <p>{answer.reply}</p>
          {answer.route && answer.cta ? (
            <button type="button" onClick={() => answer.route && go(answer.route)}>
              {answer.cta}<span aria-hidden="true"> →</span>
            </button>
          ) : null}
        </div>

        <form onSubmit={submit} className="zhaowu-site-guide-form">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={400}
            placeholder={copy.placeholder}
            aria-label={copy.placeholder}
          />
          <button type="submit" disabled={busy || !input.trim()}>{busy ? "…" : copy.ask}</button>
        </form>
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
