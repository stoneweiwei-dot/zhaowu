import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n, type Locale } from "@/lib/i18n";

type OwnerGroup = "backgrounds" | "reports" | null;
function tr(locale: Locale, hant: string, hans: string, en: string) { if (locale === "en") return en; return locale === "zh-Hans" ? hans : hant; }
function accountPath() { return typeof window !== "undefined" && (window.location.pathname === "/account" || window.location.pathname.startsWith("/account/")); }

export function OwnerConsoleOrganizer() {
  const { locale } = useI18n();
  const { user, session } = useCurrentUserState();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [backgroundSection, setBackgroundSection] = useState<HTMLElement | null>(null);
  const [reportsSection, setReportsSection] = useState<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState<OwnerGroup>(null);
  const dataOnline = Boolean(session);

  const c = useMemo(() => ({
    title: tr(locale, "站主管理分組", "站主管理分组", "Owner management"),
    lead: tr(locale, "可用功能直接操作；依賴資料服務的舊面板若暫停會明確標示，不再出現按了沒反應。", "可用功能直接操作；依赖数据服务的旧面板若暂停会明确标示，不再出现按了没反应。", "Available tools work directly. Legacy data-service panels are explicitly marked unavailable instead of leaving dead controls."),
    audio: tr(locale, "背景音樂", "背景音乐", "Background music"),
    audioLead: tr(locale, "自動轉碼、壓縮、上傳、切換", "自动转码、压缩、上传、切换", "Optimize, upload, switch"),
    backgrounds: tr(locale, "首頁背景", "首页背景", "Homepage backgrounds"),
    backgroundsLead: tr(locale, "輪播、固定壁紙、上傳", "轮播、固定壁纸、上传", "Rotation, wallpaper, upload"),
    loginVisuals: tr(locale, "登入動畫", "登录动画", "Login visuals"),
    loginVisualsLead: tr(locale, "素材與管理狀態", "素材与管理状态", "Assets and management status"),
    gallery: tr(locale, "總圖庫", "总图库", "Gallery"),
    galleryLead: tr(locale, "品牌素材可查看；資料操作按服務狀態", "品牌素材可查看；数据操作按服务状态", "Brand assets remain viewable; data actions follow service status"),
    reports: tr(locale, "客戶報告", "客户报告", "Customer reports"),
    reportsLead: tr(locale, "搜尋、查看、管理", "搜索、查看、管理", "Search, review, manage"),
    unavailable: tr(locale, "資料服務暫停", "数据服务暂停", "Data service paused"),
    close: tr(locale, "收起目前分組", "收起当前分组", "Collapse current group"),
    open: tr(locale, "打開", "打开", "Open"),
  }), [locale]);

  useEffect(() => {
    if (!user?.isOwner) { setPortalTarget(null); setBackgroundSection(null); setReportsSection(null); return; }
    let disposed = false;
    const sync = () => {
      if (disposed || !accountPath()) { setPortalTarget(null); setBackgroundSection(null); setReportsSection(null); return; }
      const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
      const ownerHeader = sections.find((section) => section.textContent?.includes("OWNER CONSOLE")) ?? null;
      const backgrounds = sections.find((section) => section !== ownerHeader && section.textContent?.includes("BACKGROUND LIBRARY")) ?? null;
      const reports = sections.find((section) => section !== ownerHeader && section.textContent?.includes("REPORTS")) ?? null;
      setPortalTarget(ownerHeader && ownerHeader.isConnected ? ownerHeader : null);
      setBackgroundSection(backgrounds && backgrounds.isConnected ? backgrounds : null);
      setReportsSection(reports && reports.isConnected ? reports : null);
    };
    sync(); const observer = new MutationObserver(sync); observer.observe(document.body, { childList: true, subtree: true }); window.addEventListener("popstate", sync);
    return () => { disposed = true; observer.disconnect(); window.removeEventListener("popstate", sync); };
  }, [user?.isOwner]);

  useEffect(() => {
    if (!user?.isOwner || !accountPath() || !dataOnline) return;
    if (backgroundSection && backgroundSection !== portalTarget) backgroundSection.hidden = expanded !== "backgrounds";
    if (reportsSection && reportsSection !== portalTarget) reportsSection.hidden = expanded !== "reports";
    return () => { if (backgroundSection && backgroundSection !== portalTarget) backgroundSection.hidden = false; if (reportsSection && reportsSection !== portalTarget) reportsSection.hidden = false; };
  }, [expanded, backgroundSection, reportsSection, portalTarget, user?.isOwner, dataOnline]);

  if (!user?.isOwner || !portalTarget || !accountPath()) return null;

  const openGroup = (group: Exclude<OwnerGroup, null>, section: HTMLElement | null) => {
    if (!dataOnline) return;
    const next = expanded === group ? null : group; setExpanded(next);
    if (next && section && section !== portalTarget) window.setTimeout(() => section.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  };
  const openAudio = () => document.querySelector<HTMLButtonElement>("[data-owner-background-music-manager]")?.click();
  const disabledClass = "cursor-not-allowed border-line bg-paper/35 opacity-55";

  return createPortal(
    <section data-owner-console-dashboard className="mt-5 rounded-[1.4rem] border border-line/80 bg-paper/42 p-4 sm:p-5">
      <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] tracking-[0.24em] text-cinnabar">OWNER · CONTROL</p><h2 className="mt-1 font-display text-xl text-ink">{c.title}</h2><p className="mt-1 max-w-xl text-xs leading-5 text-ink-mute">{c.lead}</p></div>{expanded ? <button type="button" className="shrink-0 rounded-full border border-line bg-cream/80 px-3 py-2 text-[11px] text-ink-soft" onClick={() => setExpanded(null)}>{c.close}</button> : null}</div>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        <button type="button" onClick={openAudio} className="min-h-[92px] rounded-2xl border border-cinnabar/20 bg-cream/72 p-3 text-left shadow-[0_10px_28px_rgba(76,55,33,0.05)] transition active:scale-[0.99]"><span className="block text-[10px] tracking-[0.16em] text-cinnabar">AUDIO</span><span className="mt-2 block font-display text-base text-ink">{c.audio}</span><span className="mt-1 block text-[11px] leading-4 text-ink-mute">{c.audioLead}</span></button>
        <button type="button" disabled={!dataOnline} aria-pressed={expanded === "backgrounds"} onClick={() => openGroup("backgrounds", backgroundSection)} className={`min-h-[92px] rounded-2xl border p-3 text-left shadow-[0_10px_28px_rgba(76,55,33,0.05)] transition ${!dataOnline ? disabledClass : expanded === "backgrounds" ? "border-wood/35 bg-wood/10" : "border-line bg-cream/72"}`}><span className="block text-[10px] tracking-[0.16em] text-wood">HOME</span><span className="mt-2 block font-display text-base text-ink">{c.backgrounds}</span><span className="mt-1 block text-[11px] leading-4 text-ink-mute">{dataOnline ? c.backgroundsLead : c.unavailable}</span></button>
        <a href="/gallery#login-visuals" className="min-h-[92px] rounded-2xl border border-line bg-cream/72 p-3 text-left shadow-[0_10px_28px_rgba(76,55,33,0.05)] transition active:scale-[0.99]"><span className="block text-[10px] tracking-[0.16em] text-cinnabar">LOGIN</span><span className="mt-2 block font-display text-base text-ink">{c.loginVisuals}</span><span className="mt-1 block text-[11px] leading-4 text-ink-mute">{c.loginVisualsLead}</span></a>
        <a href="/gallery" className="min-h-[92px] rounded-2xl border border-line bg-cream/72 p-3 text-left shadow-[0_10px_28px_rgba(76,55,33,0.05)] transition active:scale-[0.99]"><span className="block text-[10px] tracking-[0.16em] text-wood">GALLERY</span><span className="mt-2 block font-display text-base text-ink">{c.gallery}</span><span className="mt-1 block text-[11px] leading-4 text-ink-mute">{c.galleryLead}</span></a>
        <button type="button" disabled={!dataOnline} aria-pressed={expanded === "reports"} onClick={() => openGroup("reports", reportsSection)} className={`min-h-[92px] rounded-2xl border p-3 text-left shadow-[0_10px_28px_rgba(76,55,33,0.05)] transition ${!dataOnline ? disabledClass : expanded === "reports" ? "border-cinnabar/30 bg-cinnabar/5" : "border-line bg-cream/72"}`}><span className="block text-[10px] tracking-[0.16em] text-cinnabar">REPORTS</span><span className="mt-2 block font-display text-base text-ink">{c.reports}</span><span className="mt-1 block text-[11px] leading-4 text-ink-mute">{dataOnline ? c.reportsLead : c.unavailable}</span></button>
      </div>
      <p className="mt-3 text-right text-[10px] tracking-[0.12em] text-ink-mute">{dataOnline ? `${c.open} · ${expanded === "backgrounds" ? c.backgrounds : expanded === "reports" ? c.reports : "—"}` : c.unavailable}</p>
    </section>,
    portalTarget,
  );
}
