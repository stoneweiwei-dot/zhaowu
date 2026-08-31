import { useEffect, useState, type FormEvent } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  askSiteGuide,
  defaultSiteGuide,
  resolveLocalSiteGuide,
  type SiteGuideAnswer,
  type SiteGuideRoute,
} from "@/lib/site-guide";
import { useI18n } from "@/lib/i18n";

const DAILY_AI_LIMIT = 3;
const LIMIT_KEY = "zhaowu.site-guide.calls.v1";

function callBudget() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = JSON.parse(localStorage.getItem(LIMIT_KEY) || "null") as {
      day?: string;
      count?: number;
    } | null;
    return raw?.day === today
      ? { day: today, count: Math.max(0, Number(raw.count) || 0) }
      : { day: today, count: 0 };
  } catch {
    return { day: today, count: 0 };
  }
}

function spendCall() {
  const budget = callBudget();
  try {
    localStorage.setItem(
      LIMIT_KEY,
      JSON.stringify({ day: budget.day, count: budget.count + 1 }),
    );
  } catch {
    // Private browsing may disable storage; navigation still remains available.
  }
}

function go(route: SiteGuideRoute) {
  if (route === "/#analysisForm") {
    if (window.location.pathname !== "/")
      window.location.assign("/#analysisForm");
    else
      document
        .getElementById("analysisForm")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  window.location.assign(route);
}

export function GreenDragonGuide() {
  const { locale } = useI18n();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<SiteGuideAnswer>(() =>
    defaultSiteGuide(locale),
  );

  useEffect(() => {
    setAnswer(defaultSiteGuide(locale));
  }, [locale]);

  const copy =
    locale === "en"
      ? {
          title: "Jade Dragon guide",
          intro:
            "Choose a reading or reopen a report. I will take you straight there.",
          placeholder: "For example: show my previous Zi Wei report",
          ask: "Ask",
          close: "Close guide",
          open: "Open Jade Dragon guide",
          limit:
            "AI questions are limited to three per browser each day. The quick links still work.",
        }
      : locale === "zh-Hans"
        ? {
            title: "青玉小龙导航",
            intro: "选择一种分析，或重看以前的报告，我带你直接前往。",
            placeholder: "例如：我想看以前的紫微报告",
            ask: "问小龙",
            close: "关闭导航",
            open: "打开青玉小龙导航",
            limit: "每个浏览器每天可问 AI 三次；下方快捷入口仍可使用。",
          }
        : {
            title: "青玉小龍導覽",
            intro: "選擇一種分析，或重看以前的報告，我帶你直接前往。",
            placeholder: "例如：我想看以前的紫微報告",
            ask: "問小龍",
            close: "關閉導覽",
            open: "打開青玉小龍導覽",
            limit: "每個瀏覽器每天可問 AI 三次；下方快捷入口仍可使用。",
          };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    const needsAI = resolveLocalSiteGuide(message, locale) === null;
    if (needsAI && callBudget().count >= DAILY_AI_LIMIT) {
      setAnswer({ ...defaultSiteGuide(locale), reply: copy.limit });
      return;
    }
    setBusy(true);
    try {
      const next = await askSiteGuide(message, locale, pathname);
      if (needsAI) spendCall();
      setAnswer(next);
      setInput("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="zhaowu-dragon-guide" data-site-guide>
      {open ? (
        <section
          className="zhaowu-dragon-guide-panel"
          role="dialog"
          aria-label={copy.title}
        >
          <header>
            <span
              className="zhaowu-dragon-guide-avatar is-thinking"
              aria-hidden
            />
            <div>
              <strong>{copy.title}</strong>
              <p>{copy.intro}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={copy.close}
            >
              ×
            </button>
          </header>
          <div className="zhaowu-dragon-guide-answer" aria-live="polite">
            <p>{answer.reply}</p>
            {answer.route && answer.cta ? (
              <button
                type="button"
                onClick={() => answer.route && go(answer.route)}
              >
                {answer.cta}
                <span aria-hidden>→</span>
              </button>
            ) : null}
          </div>
          <div
            className="zhaowu-dragon-guide-shortcuts"
            aria-label={locale === "en" ? "Reading navigation" : locale === "zh-Hans" ? "分析导航" : "分析導覽"}
          >
            <button type="button" onClick={() => go("/#analysisForm")}>
              {locale === "en"
                ? "BaZi"
                : locale === "zh-Hans"
                  ? "八字分析"
                  : "八字分析"}
            </button>
            <button type="button" onClick={() => go("/qizheng")}>
              {locale === "en" ? "Seven Luminaries" : locale === "zh-Hans" ? "七政四余" : "七政四餘"}
            </button>
            <button type="button" onClick={() => go("/yizhangjing")}>
              {locale === "en" ? "Past & Present" : "前世今生"}
            </button>
            <button type="button" onClick={() => go("/ziwei")}>
              {locale === "en" ? "Zi Wei" : locale === "zh-Hans" ? "紫微斗数" : "紫微斗數"}
            </button>
            <button type="button" onClick={() => go("/history")}>
              {locale === "en"
                ? "My history"
                : locale === "zh-Hans"
                  ? "我的记录"
                  : "我的紀錄"}
            </button>
          </div>
          <form onSubmit={submit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={400}
              placeholder={copy.placeholder}
              aria-label={copy.placeholder}
            />
            <button type="submit" disabled={busy || !input.trim()}>
              {busy ? "…" : copy.ask}
            </button>
          </form>
        </section>
      ) : null}
      <button
        className="zhaowu-dragon-guide-trigger"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? copy.close : copy.open}
      >
        <span className="zhaowu-dragon-guide-avatar" aria-hidden />
        <span>
          {locale === "en"
            ? "Guide"
            : locale === "zh-Hans"
              ? "问小龙"
              : "問小龍"}
        </span>
      </button>
    </aside>
  );
}
