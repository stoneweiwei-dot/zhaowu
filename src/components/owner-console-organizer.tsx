import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n, type Locale } from "@/lib/i18n";

type OwnerGroup = "backgrounds" | "reports" | null;

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function accountPath() {
  return typeof window !== "undefined" && (window.location.pathname === "/account" || window.location.pathname.startsWith("/account/"));
}

export function OwnerConsoleOrganizer() {
  const { locale } = useI18n();
  const { user, session } = useCurrentUserState();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [backgroundSection, setBackgroundSection] = useState<HTMLElement | null>(null);
  const [reportsSection, setReportsSection] = useState<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState<OwnerGroup>(null);
  const dataOnline = Boolean(session);

  const c = useMemo(() => ({
    title: tr(locale, "後台管理", "后台管理", "Owner tools"),
    lead: tr(locale, "直接選要管理的內容。工程資訊與診斷預設收起。", "直接选择要管理的内容。工程信息与诊断默认收起。", "Choose what to manage. Engineering details stay collapsed by default."),
    audio: tr(locale, "背景音樂", "背景音乐", "Background music"),
    login: tr(locale, "登入畫面", "登录画面", "Login screen"),
    gallery: tr(locale, "素材圖庫", "素材图库", "Media library"),
    dataTools: tr(locale, "資料功能", "数据功能", "Data tools"),
    backgrounds: tr(locale, "首頁背景", "首页背景", "Homepage backgrounds"),
    reports: tr(locale, "客戶報告", "客户报告", "Customer reports"),
    status: tr(locale, "系統狀態", "系统状态", "System status"),
    online: tr(locale, "全部功能可用", "全部功能可用", "All tools available"),
    partial: tr(locale, "部分資料功能暫停", "部分数据功能暂停", "Some data tools are paused"),
    partialDetail: tr(
      locale,
      "登入、背景音樂與素材入口可正常使用；客戶報告與首頁背景等資料功能暫停，恢復後會自動重新可用。",
      "登录、背景音乐与素材入口可正常使用；客户报告与首页背景等数据功能暂停，恢复后会自动重新可用。",
      "Owner sign-in, music and media remain available. Data-backed reports and homepage backgrounds will return automatically when the data service recovers.",
    ),
    collapse: tr(locale, "收起", "收起", "Collapse"),
  }), [locale]);

  useEffect(() => {
    if (!user?.isOwner) {
      setPortalTarget(null);
      setBackgroundSection(null);
      setReportsSection(null);
      return;
    }
    let disposed = false;
    const sync = () => {
      if (disposed || !accountPath()) {
        setPortalTarget(null);
        setBackgroundSection(null);
        setReportsSection(null);
        return;
      }
      const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
      const ownerHeader = sections.find((section) => section.textContent?.includes("OWNER CONSOLE")) ?? null;
      const backgrounds = sections.find((section) => section !== ownerHeader && section.textContent?.includes("BACKGROUND LIBRARY")) ?? null;
      const reports = sections.find((section) => section !== ownerHeader && section.textContent?.includes("REPORTS")) ?? null;
      setPortalTarget(ownerHeader && ownerHeader.isConnected ? ownerHeader : null);
      setBackgroundSection(backgrounds && backgrounds.isConnected ? backgrounds : null);
      setReportsSection(reports && reports.isConnected ? reports : null);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("popstate", sync);
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("popstate", sync);
    };
  }, [user?.isOwner]);

  useEffect(() => {
    if (!user?.isOwner || !accountPath() || !dataOnline) return;
    if (backgroundSection && backgroundSection !== portalTarget) backgroundSection.hidden = expanded !== "backgrounds";
    if (reportsSection && reportsSection !== portalTarget) reportsSection.hidden = expanded !== "reports";
    return () => {
      if (backgroundSection && backgroundSection !== portalTarget) backgroundSection.hidden = false;
      if (reportsSection && reportsSection !== portalTarget) reportsSection.hidden = false;
    };
  }, [expanded, backgroundSection, reportsSection, portalTarget, user?.isOwner, dataOnline]);

  if (!user?.isOwner || !portalTarget || !accountPath()) return null;

  const openGroup = (group: Exclude<OwnerGroup, null>, section: HTMLElement | null) => {
    if (!dataOnline) return;
    const next = expanded === group ? null : group;
    setExpanded(next);
    if (next && section && section !== portalTarget) {
      window.setTimeout(() => section.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    }
  };

  const openAudio = () => document.querySelector<HTMLButtonElement>("[data-owner-background-music-manager]")?.click();

  return createPortal(
    <section data-owner-console-dashboard className="mt-5 border-t border-line/70 pt-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-cinnabar">OWNER TOOLS</p>
          <h2 className="mt-1 font-display text-2xl text-ink">{c.title}</h2>
          <p className="mt-1 text-sm leading-6 text-ink-soft">{c.lead}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs ${dataOnline ? "border-wood/30 bg-wood/5 text-wood" : "border-line bg-paper/70 text-ink-mute"}`}>
          {dataOnline ? c.online : c.partial}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button type="button" onClick={openAudio} className="min-h-14 rounded-xl border border-line bg-paper/70 px-4 py-3 text-left">
          <span className="block text-[10px] tracking-[0.16em] text-cinnabar">AUDIO</span>
          <span className="mt-1 block font-display text-base text-ink">{c.audio}</span>
        </button>
        <a href="/gallery#login-visuals" className="min-h-14 rounded-xl border border-line bg-paper/70 px-4 py-3 text-left">
          <span className="block text-[10px] tracking-[0.16em] text-cinnabar">LOGIN</span>
          <span className="mt-1 block font-display text-base text-ink">{c.login}</span>
        </a>
        <a href="/gallery" className="min-h-14 rounded-xl border border-line bg-paper/70 px-4 py-3 text-left">
          <span className="block text-[10px] tracking-[0.16em] text-wood">MEDIA</span>
          <span className="mt-1 block font-display text-base text-ink">{c.gallery}</span>
        </a>
      </div>

      <details className="mt-3 rounded-xl border border-line/80 bg-paper/35">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-ink-soft">
          <span>{c.dataTools}</span>
          <span className="text-xs text-ink-mute">{dataOnline ? c.online : c.partial}</span>
        </summary>
        <div className="grid gap-2 border-t border-line/70 p-3 sm:grid-cols-2">
          <button type="button" disabled={!dataOnline} onClick={() => openGroup("backgrounds", backgroundSection)} className="min-h-11 rounded-lg border border-line bg-cream/70 px-4 text-left text-sm text-ink disabled:cursor-not-allowed disabled:opacity-45">
            {c.backgrounds}
          </button>
          <button type="button" disabled={!dataOnline} onClick={() => openGroup("reports", reportsSection)} className="min-h-11 rounded-lg border border-line bg-cream/70 px-4 text-left text-sm text-ink disabled:cursor-not-allowed disabled:opacity-45">
            {c.reports}
          </button>
          {!dataOnline ? <p className="sm:col-span-2 text-xs leading-5 text-ink-mute">{c.partialDetail}</p> : null}
          {expanded ? <button type="button" className="sm:col-span-2 justify-self-start text-xs text-cinnabar" onClick={() => setExpanded(null)}>{c.collapse}</button> : null}
        </div>
      </details>

      <details className="mt-2 rounded-xl border border-line/70 bg-transparent">
        <summary className="cursor-pointer list-none px-4 py-3 text-xs text-ink-mute">{c.status}</summary>
        <p className="border-t border-line/60 px-4 py-3 text-xs leading-5 text-ink-mute">{dataOnline ? c.online : c.partialDetail}</p>
      </details>
    </section>,
    portalTarget,
  );
}
