import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import {
  deleteReportRecord,
  getReportRecord,
  listReportRecords,
  listOwnerReportPage,
  type ReportListRecord,
  type ReportRecord,
} from "@/lib/bridge/supabase-rest";
import { useI18n, type Locale } from "@/lib/i18n";
import { customerCopy, customerDocument } from "@/lib/report/customer-copy";
import { DecreeImageReason } from "@/components/decree-image-reason";
import { generateDecreeImage, loadExistingDecreeImage } from "@/lib/bridge/decree-image";
import { SUPABASE_STORAGE_WRITES_PAUSED } from "@/lib/storage-write-policy";
import { composeFocusedReport } from "@/lib/report/focused-report";
import type { ReportSection } from "@/lib/report/focused-report";
import { TeaGuardianReport } from "@/components/tea-guardian-report";

const OwnerGalleryManager = lazy(() => import("@/components/owner-gallery-manager").then((m) => ({ default: m.OwnerGalleryManager })));
const OwnerLoginVisualsManager = lazy(() => import("@/components/owner-login-visuals-manager").then((m) => ({ default: m.OwnerLoginVisualsManager })));
const SocialPublisherPage = lazy(() => import("./social").then((m) => ({ default: m.SocialPublisherPage })));
const OwnerThemeSkinsManager = lazy(() => import("@/components/owner-theme-skins-manager").then((m) => ({ default: m.OwnerThemeSkinsManager })));
type ConsoleView = "reports" | "images" | "opening" | "social" | "themes";

export const Route = createFileRoute("/account")({ component: AccountPage });

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function reportLevel(row: Pick<ReportRecord, "status" | "payment_tier">, locale: Locale) {
  if (row.status === "full_ready" || row.payment_tier === "full") return tr(locale, "完整版", "完整版", "Full report");
  if (row.status === "report_ready") return tr(locale, "完整報告", "完整报告", "Full report");
  if (row.status === "engine_ready") return tr(locale, "基礎盤", "基础盘", "Base chart");
  if (row.status === "ready") return tr(locale, "已完成", "已完成", "Ready");
  return tr(locale, "待生成", "待生成", "Pending");
}

function fullText(row: ReportRecord): string | null {
  if (!row.paid_report || typeof row.paid_report !== "object") return null;
  const text = (row.paid_report as Record<string, unknown>).text;
  return typeof text === "string" ? customerDocument(text) : null;
}

function reportGalleryReferenceAssetId(row: ReportRecord): string | null {
  if (!row.visual_profile || typeof row.visual_profile !== "object") return null;
  const value = (row.visual_profile as Record<string, unknown>).galleryReferenceAssetId;
  const id = String(value ?? "").trim();
  return id || null;
}

/**
 * New records may use focused-report naming later; old records use `ninePages`.
 * The old key is read only as storage compatibility and is never surfaced as a product name.
 */
function storedReportSections(row: ReportRecord): ReportSection[] {
  const sources = [row.mother_draft, row.paid_report];
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const record = source as Record<string, unknown>;
    const candidate = record.reportSections ?? record.sections ?? record.ninePages;
    if (!Array.isArray(candidate)) continue;
    return candidate.map((raw, index) => {
      const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const sectionNo = Number(item.sectionNo ?? item.pageNo ?? index + 1);
      return {
        sectionNo,
        pageNo: sectionNo,
        key: String(item.key ?? `legacy-${index}`) as ReportSection["key"],
        title: customerCopy(String(item.title ?? "完整报告")),
        body: Array.isArray(item.body) ? item.body.map((line) => customerCopy(String(line))).filter(Boolean) : [],
        optional: Boolean(item.optional),
        evidence: (item.evidence && typeof item.evidence === "object" ? item.evidence : {
          facts: [], conditions: [], limits: [], checks: [],
        }) as ReportSection["evidence"],
      };
    });
  }
  if (row.engine_snapshot?.chart && row.engine_snapshot?.reading) {
    try { return composeFocusedReport(row.engine_snapshot); } catch { /* Preserve legacy fallback. */ }
  }
  return [];
}

function statusPill(ok: boolean, label: string, pendingLabel: string) {
  return {
    label: ok ? label : pendingLabel,
    className: ok
      ? "border-emerald-700/25 bg-emerald-700/5 text-emerald-800"
      : "border-line bg-paper/55 text-ink-mute",
  };
}

function AccountPage() {
  const { t, locale } = useI18n();
  const { user, session, isPending } = useCurrentUserState();
  const [consoleView, setConsoleView] = useState<ConsoleView>("reports");
  const [visitedViews, setVisitedViews] = useState<Set<ConsoleView>>(() => new Set(["reports"]));
  function selectConsoleView(view: ConsoleView) {
    setConsoleView(view);
    setVisitedViews((previous) => new Set([...previous, view]));
  }
  const [rows, setRows] = useState<ReportListRecord[]>([]);
  const [details, setDetails] = useState<Record<string, ReportRecord | null>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [moreBusy, setMoreBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(true);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [detailBusyId, setDetailBusyId] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportMessages, setReportMessages] = useState<Record<string, string>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  const c = useMemo(() => ({
    ownerTitle: tr(locale, "所有人的報告", "所有人的报告", "All reports"),
    memberTitle: tr(locale, "我的昭梧", "我的昭梧", "My Zhaowu"),
    ownerBadge: tr(locale, "站主", "站主", "Owner"),
    reportsReadError: tr(locale, "報告讀取失敗。", "报告读取失败。", "Could not load reports."),
    reportReadError: tr(locale, "單筆報告讀取失敗。", "单笔报告读取失败。", "Could not load this report."),
    expired: tr(locale, "登入狀態已失效，請重新登入。", "登录状态已失效，请重新登录。", "Your session has expired. Sign in again."),
    birthData: tr(locale, "出生資料", "出生资料", "Birth profile"),
    birthSaved: tr(locale, "已保存", "已保存", "Saved"),
    birthEmpty: tr(locale, "未保存", "未保存", "Not saved"),
    reports: tr(locale, "報告", "报告", "Reports"),
    ownerCount: (n: number) => tr(locale, `目前 ${n} 筆`, `目前 ${n} 笔`, `${n} reports`),
    memberCount: (n: number) => tr(locale, `最近 ${n} 筆，最多顯示 3 筆`, `最近 ${n} 笔，最多显示 3 笔`, `${n} recent reports; up to 3 shown`),
    refreshAll: tr(locale, "刷新後台", "刷新后台", "Refresh console"),
    refreshing: tr(locale, "刷新中…", "刷新中…", "Refreshing…"),
    refreshed: tr(locale, "已刷新", "已刷新", "Refreshed"),
    refreshOne: tr(locale, "刷新這筆", "刷新这笔", "Refresh"),
    customerReports: tr(locale, "所有已上傳的報告", "所有已上传的报告", "All uploaded reports"),
    recentReports: tr(locale, "最近報告", "最近报告", "Recent reports"),
    search: tr(locale, "搜尋 Email / 問題", "搜索 Email / 问题", "Search email / question"),
    empty: tr(locale, "目前沒有已上傳的報告。本機保存的內容請到「我的報告」查看。", "目前没有已上传的报告。本机保存的内容请到“我的报告”查看。", "No uploaded reports yet. Open My reports for results saved on this device."),
    open: tr(locale, "閱讀完整報告", "阅读完整报告", "Read full report"),
    collapse: tr(locale, "收起", "收起", "Collapse"),
    noEmail: tr(locale, "未綁 Email", "未绑定 Email", "No email linked"),
    reportFallback: tr(locale, "昭梧報告", "昭梧报告", "Zhaowu report"),
    chartSummary: tr(locale, "命盤摘要", "命盘摘要", "Chart summary"),
    dayMaster: tr(locale, "日主", "日主", "Day Master"),
    monthCommand: tr(locale, "月令", "月令", "Month command"),
    finalSource: tr(locale, "保存版本", "保存版本", "Saved version"),
    chartDone: tr(locale, "命盤完成", "命盘完成", "Chart ready"),
    chartPending: tr(locale, "命盤待生成", "命盘待生成", "Chart pending"),
    answerDone: tr(locale, "最終答案完成", "最终答案完成", "Final answer ready"),
    answerPending: tr(locale, "最終答案待保存", "最终答案待保存", "Final answer pending"),
    reportDone: tr(locale, "完整報告完成", "完整报告完成", "Full report ready"),
    reportPending: tr(locale, "完整報告待生成", "完整报告待生成", "Full report pending"),
    section: tr(locale, "區", "区", "Section"),
    fullReport: tr(locale, "完整報告", "完整报告", "Full report"),
    noReadable: tr(locale, "這筆記錄尚未保存最終可讀內容。", "这笔记录尚未保存最终可读内容。", "This record does not yet contain a saved final result."),
    copyAnswer: tr(locale, "複製最終答案", "复制最终答案", "Copy final answer"),
    copied: tr(locale, "最終答案已複製。", "最终答案已复制。", "Final answer copied."),
    imageDone: tr(locale, "命誥圖完成", "命诰图完成", "Decree image ready"),
    imageFailed: tr(locale, "命誥圖失敗", "命诰图失败", "Decree image failed"),
    imagePending: tr(locale, "命誥圖待生成", "命诰图待生成", "Decree image pending"),
    generateImage: tr(locale, "生成命誥圖", "生成命诰图", "Generate decree image"),
    viewImage: tr(locale, "查看命誥圖", "查看命诰图", "View decree image"),
    regenerateImage: tr(locale, "重新生成", "重新生成", "Regenerate"),
    generatingImage: tr(locale, "生成中…", "生成中…", "Generating…"),
    imageReady: tr(locale, "命誥圖已生成並刷新。", "命诰图已生成并刷新。", "Decree image generated and refreshed."),
    deleteRecordConfirm: tr(locale, "刪除這筆報告？", "删除这笔报告？", "Delete this report?"),
    deleteRecord: tr(locale, "刪除記錄", "删除记录", "Delete record"),
    select: tr(locale, "選取", "选择", "Select"),
    selectedOne: tr(locale, "已選", "已选", "Selected"),
    batchManage: tr(locale, "批次管理", "批次管理", "Bulk actions"),
    selected: (n: number) => tr(locale, `已選 ${n} 筆`, `已选 ${n} 笔`, `${n} selected`),
    selectAllShown: tr(locale, "全選目前結果", "全选当前结果", "Select all results"),
    clearSelection: tr(locale, "清除選取", "清除选择", "Clear"),
    deleteSelected: tr(locale, "批次刪除", "批量删除", "Delete selected"),
    batchDeleteReportsConfirm: (n: number) => tr(locale, `刪除已選的 ${n} 筆報告？此操作不可復原。`, `删除已选的 ${n} 笔报告？此操作不可恢复。`, `Delete ${n} selected reports? This cannot be undone.`),
    batchReportsDeleted: (n: number) => tr(locale, `已刪除 ${n} 筆報告。`, `已删除 ${n} 笔报告。`, `Deleted ${n} reports.`),
    updateFailed: tr(locale, "更新失敗。", "更新失败。", "Update failed."),
    updated: tr(locale, "更新", "更新", "Updated"),
    manageActions: tr(locale, "管理操作", "管理操作", "Manage actions"),
  }), [locale]);

  async function loadReports() {
    if (!session || !user) {
      setRows([]);
      setBusy(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const page = user.isOwner ? await listOwnerReportPage() : null;
      const nextRows = page ? page.items : await listReportRecords(session, false);
      setNextOffset(page?.nextOffset ?? null);
      setRows(nextRows);
      const ids = new Set(nextRows.map((row) => row.id));
      setSelectedReportIds((current) => current.filter((id) => ids.has(id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : c.reportsReadError);
    } finally {
      setBusy(false);
    }
  }

  async function loadMoreReports() {
    if (nextOffset === null || moreBusy || !user?.isOwner) return;
    setMoreBusy(true);
    try {
      const page = await listOwnerReportPage(nextOffset);
      setRows(previous => [...previous, ...page.items.filter(row => !previous.some(old => old.id === row.id))]);
      setNextOffset(page.nextOffset);
    } catch (err) { setError(err instanceof Error ? err.message : c.reportsReadError); }
    finally { setMoreBusy(false); }
  }

  async function refreshDetail(id: string, silent = false) {
    if (!session) {
      setError(c.expired);
      return null;
    }
    setDetailBusyId(id);
    if (!silent) setReportMessages((prev) => ({ ...prev, [id]: "" }));
    try {
      const detail = await getReportRecord(session, id);
      setDetails((prev) => ({ ...prev, [id]: detail }));
      return detail;
    } catch (err) {
      const message = err instanceof Error ? err.message : c.reportReadError;
      setReportMessages((prev) => ({ ...prev, [id]: message }));
      setDetails((prev) => ({ ...prev, [id]: null }));
      return null;
    } finally {
      setDetailBusyId(null);
    }
  }

  async function refreshAll() {
    if (!session || !user) return;
    setRefreshBusy(true);
    setError(null);
    try {
      await loadReports();
      if (openId) await refreshDetail(openId, true);
      setLastRefreshedAt(new Date());
    } finally {
      setRefreshBusy(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, [session?.access_token, user?.isOwner]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.alias, r.user_email, r.context?.question].some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [query, rows]);

  async function toggleReport(row: ReportListRecord) {
    if (openId === row.id) {
      setOpenId(null);
      return;
    }
    setOpenId(row.id);
    await refreshDetail(row.id);
  }

  async function onReportImage(id: string, force: boolean) {
    if (!session) {
      setReportMessages((prev) => ({ ...prev, [id]: c.expired }));
      return;
    }
    setActionBusyId(id);
    setReportMessages((prev) => ({ ...prev, [id]: "" }));
    try {
      const existing = details[id]?.image_path;
      const out = existing && !force
        ? await loadExistingDecreeImage(session, id)
        : await generateDecreeImage(session, id, force);
      if (out.signedUrl) setImageUrls((prev) => ({ ...prev, [id]: out.signedUrl! }));
      await refreshDetail(id, true);
      await loadReports();
      setReportMessages((prev) => ({ ...prev, [id]: c.imageReady }));
    } catch (err) {
      setReportMessages((prev) => ({ ...prev, [id]: err instanceof Error ? err.message : c.updateFailed }));
      await refreshDetail(id, true);
    } finally {
      setActionBusyId(null);
    }
  }

  async function copyFinalAnswer(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setReportMessages((prev) => ({ ...prev, [id]: c.copied }));
    } catch {
      setReportMessages((prev) => ({ ...prev, [id]: c.updateFailed }));
    }
  }

  async function deleteSelectedReports() {
    if (!session || !user?.isOwner || refreshBusy || !selectedReportIds.length || !window.confirm(c.batchDeleteReportsConfirm(selectedReportIds.length))) return;
    setRefreshBusy(true); setError(null);
    try {
      const ids = [...selectedReportIds];
      for (const id of ids) await deleteReportRecord(session, id);
      setSelectedReportIds([]);
      if (openId && ids.includes(openId)) setOpenId(null);
      setDetails((prev) => {
        const next = { ...prev };
        ids.forEach((id) => delete next[id]);
        return next;
      });
      await loadReports();
      setError(c.batchReportsDeleted(ids.length));
    } catch (err) {
      setError(err instanceof Error ? err.message : c.updateFailed);
    } finally { setRefreshBusy(false); }
  }

  if (isPending) return <div className="mx-auto h-52 max-w-xl animate-pulse rounded-xl bg-cream/70" />;

  if (!user) {
    return (
      <main className="mx-auto max-w-xl">
        <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
          <p className="text-xs tracking-[0.28em] text-cinnabar">ZHAOWU ACCOUNT</p>
          <h1 className="mt-2 font-display text-3xl">{c.memberTitle}</h1>
          <p className="mt-4 text-sm leading-7 text-ink-soft">{tr(locale, "登入或註冊後可保存這台手機的生辰與報告。站主請改用登入頁的「站主」分頁。", "登录或注册后可保存这台手机的生辰与报告。站主请改用登录页的「站主」分页。", "Sign in or create an account to keep this phone's birth record and reports. Owners use the Owner tab on the sign-in page.")}</p>
          <Link to="/login" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-cinnabar px-5 text-cream">{tr(locale, "會員登入／註冊", "会员登录／注册", "Sign in / Register")}</Link>
        </section>
      </main>
    );
  }

  if (user.isOwner && !session) {
    return (
      <main className="mx-auto max-w-3xl space-y-5" data-owner-independent-console>
        <section className="seal-border rounded-[1.35rem] bg-cream/95 p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.22em] text-cinnabar">OWNER CONSOLE</p>
              <h1 className="mt-1 font-display text-3xl">{c.ownerTitle}</h1>

            </div>
            <button type="button" onClick={() => void signOut()} className="shrink-0 rounded-full border border-line bg-paper/70 px-4 py-2 text-xs text-ink-soft">
              {tr(locale, "登出", "登出", "Sign out")}
            </button>
          </div>

        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5" data-owner-console={user.isOwner ? "true" : undefined}>
      <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.28em] text-cinnabar">{user.isOwner ? "OWNER CONSOLE" : "MY ZHAOWU"}</p>
            <h1 className="mt-2 font-display text-3xl">{user.isOwner ? c.ownerTitle : c.memberTitle}</h1>
            <p className="zw-owner-access-note">{tr(locale, "站主權限：可免費查看自己與所有人的完整報告。", "站主权限：可免费查看自己与所有人的完整报告。", "Owner access: read your own and everyone’s complete reports without payment.")}</p>
            <a href="/history" className="underline">{tr(locale, "查看這台裝置的「我的報告」 →", "查看这台设备的“我的报告” →", "My reports on this device →")}</a>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user.isOwner ? <span className="rounded-full border border-cinnabar/30 bg-cinnabar/5 px-3 py-1 text-xs text-cinnabar">{c.ownerBadge}</span> : null}
            <button type="button" disabled={refreshBusy} onClick={() => void refreshAll()} className="rounded-full border border-line bg-paper/70 px-3 py-2 text-xs text-ink-soft disabled:opacity-50">
              {refreshBusy ? c.refreshing : c.refreshAll}
            </button>
          </div>
        </div>
        <div className={`mt-5 grid gap-3 ${user.isOwner ? "" : "sm:grid-cols-2"}`}>
          {!user.isOwner ? (
            <div className="rounded-lg border border-line bg-paper/45 p-4">
              <p className="text-xs tracking-[0.2em] text-ink-mute">{c.birthData}</p>
              <p className="mt-2 text-sm text-ink-soft">{user.birthData ? c.birthSaved : c.birthEmpty}</p>
            </div>
          ) : null}
          <div className="rounded-lg border border-line bg-paper/45 p-4">
            <p className="text-xs tracking-[0.2em] text-ink-mute">{c.reports}</p>
            <p className="mt-2 text-sm text-ink-soft">{user.isOwner ? c.ownerCount(rows.length) : c.memberCount(rows.length)}</p>
            {lastRefreshedAt ? <p className="mt-1 text-[11px] text-ink-mute">{c.refreshed} · {lastRefreshedAt.toLocaleTimeString()}</p> : null}
          </div>
        </div>
      </section>

      {user.isOwner ? (
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="tablist" aria-label={tr(locale, "站主後台分區", "站主后台分区", "Owner console sections")}>
          {([
            ["reports", tr(locale, "報告管理", "报告管理", "Reports")],
            ["images", tr(locale, "背景與圖片", "背景与图片", "Backgrounds and images")],
            ["opening", tr(locale, "開場影片", "开场视频", "Opening video")],
            ["social", "Instagram / Threads"],
            ["themes", tr(locale, "主題皮膚", "主题皮肤", "Theme skins")],
          ] as [ConsoleView, string][]).map(([view, label], index, tabs) => (
            <button key={view} id={`console-tab-${view}`} type="button" role="tab"
              aria-selected={consoleView === view} aria-controls={`console-panel-${view}`}
              tabIndex={consoleView === view ? 0 : -1}
              onClick={() => selectConsoleView(view)}
              onKeyDown={(event) => {
                const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                if (!offset && event.key !== "Home" && event.key !== "End") return;
                event.preventDefault();
                const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + offset + tabs.length) % tabs.length;
                selectConsoleView(tabs[next][0]);
                document.getElementById(`console-tab-${tabs[next][0]}`)?.focus();
              }}
              className={`min-h-14 rounded-xl border px-3 py-3 text-left text-sm font-medium ${consoleView === view ? "border-[#315f51] bg-[#315f51] text-[#fffaf0]" : "border-line bg-cream/80 text-ink"}`}>
              {label}
            </button>
          ))}
        </nav>
      ) : null}

      <div id="console-panel-reports" role={user.isOwner ? "tabpanel" : undefined} aria-labelledby={user.isOwner ? "console-tab-reports" : undefined} hidden={user.isOwner && consoleView !== "reports"}>
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.28em] text-cinnabar">REPORTS</p>
            <h2 className="mt-1 font-display text-2xl">{user.isOwner ? c.customerReports : c.recentReports}</h2>
          </div>
          {user.isOwner ? <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 min-w-52 rounded-full border border-line bg-cream px-4 text-sm outline-none focus:border-cinnabar" placeholder={c.search} /> : null}
        </div>

        {user.isOwner ? <details><summary className="min-h-11 py-3 text-sm">{c.batchManage} ＋</summary><div data-owner-bulk-toolbar="reports" className="mt-4 flex flex-wrap items-center gap-1.5 border-y border-line/70 py-2.5">
          <span className="mr-auto font-display text-sm text-ink">{selectedReportIds.length ? c.selected(selectedReportIds.length) : c.batchManage}</span>
          <button type="button" disabled={refreshBusy || !filtered.length} className="min-h-9 rounded-full border border-line bg-paper/55 px-3 text-[11px] text-ink-soft disabled:opacity-35" onClick={() => setSelectedReportIds(filtered.map((row) => row.id))}>{c.selectAllShown}</button>
          <button type="button" disabled={refreshBusy || !selectedReportIds.length} className="min-h-9 rounded-full border border-line bg-paper/55 px-3 text-[11px] text-ink-soft disabled:opacity-35" onClick={() => setSelectedReportIds([])}>{c.clearSelection}</button>
          <button type="button" disabled={refreshBusy || !selectedReportIds.length} className="min-h-9 rounded-full bg-cinnabar px-3 text-[11px] text-cream disabled:opacity-35" onClick={() => void deleteSelectedReports()}>{c.deleteSelected}</button>
        </div></details> : null}

        {busy ? <div className="mt-5 h-20 animate-pulse rounded-lg bg-paper-deep" /> : null}
        {error ? <p className="mt-4 rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm text-cinnabar-deep">{error}</p> : null}
        {!busy && !filtered.length ? <p className="mt-5 text-sm leading-7 text-ink-mute">{c.empty}</p> : null}

        <div className="mt-5 space-y-3">
          {filtered.map((row) => {
            const open = openId === row.id;
            const detail = details[row.id] ?? null;
            const snapshot = detail?.engine_snapshot ?? null;
            const sections = detail ? storedReportSections(detail) : [];
            const text = detail ? fullText(detail) : null;
            const savedAnswer = sections[0]?.body?.[0] || null;
            const fallbackAnswer = snapshot?.reading?.directAnswer ? customerCopy(snapshot.reading.directAnswer) : null;
            const displayAnswer = savedAnswer || fallbackAnswer;
            const chartState = statusPill(Boolean(snapshot?.chart), c.chartDone, c.chartPending);
            const answerState = statusPill(Boolean(savedAnswer || fallbackAnswer), c.answerDone, c.answerPending);
            const reportState = statusPill(sections.length >= 4 || Boolean(text), c.reportDone, c.reportPending);
            const imageState = detail?.image_path
              ? { label: c.imageDone, className: "border-emerald-700/25 bg-emerald-700/5 text-emerald-800" }
              : detail?.image_error
                ? { label: c.imageFailed, className: "border-cinnabar/30 bg-cinnabar/5 text-cinnabar" }
                : { label: c.imagePending, className: "border-line bg-paper/55 text-ink-mute" };
            const rowBusy = detailBusyId === row.id || actionBusyId === row.id;

            return (
              <article key={row.id} data-owner-selectable-file="report" className={`relative rounded-xl border bg-paper/35 p-3.5 ${selectedReportIds.includes(row.id) ? "border-wood/45 ring-1 ring-wood/15" : "border-line"}`}>
                {user.isOwner ? <button type="button" aria-pressed={selectedReportIds.includes(row.id)} onClick={() => setSelectedReportIds((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])} className={`absolute left-2 top-2 inline-flex min-h-9 items-center justify-center rounded-full border px-2.5 text-[10px] font-medium ${selectedReportIds.includes(row.id) ? "border-wood bg-wood text-cream" : "border-line bg-cream/95 text-ink-soft"}`} aria-label={`${c.select} ${row.alias || c.reportFallback}`}>
                  {selectedReportIds.includes(row.id) ? `✓ ${c.selectedOne}` : c.select}
                </button> : null}
                <div className={user.isOwner ? "pl-16 text-left" : "text-left"}>
                  <h3 className="font-display text-lg font-semibold break-words">{row.alias || String(row.context?.question ?? c.reportFallback)}</h3>
                  {user.isOwner ? <p className="truncate text-xs text-cinnabar">{row.user_email || c.noEmail}</p> : null}
                  <p className="mt-1 text-xs text-ink-mute">{new Date(row.created_at).toLocaleString(locale === "en" ? "en-AU" : locale === "zh-Hans" ? "zh-CN" : "zh-TW")} · {reportLevel(row, locale)}</p>
                  <p className="mt-1 text-[11px] text-ink-mute">{c.updated} {new Date(row.updated_at).toLocaleString(locale === "en" ? "en-AU" : locale === "zh-Hans" ? "zh-CN" : "zh-TW")}</p>
                </div>

                <div data-report-primary-actions className="mt-3 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => void toggleReport(row)} className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink-soft">{open ? c.collapse : c.open}</button>
                  <button type="button" disabled={rowBusy} onClick={() => void refreshDetail(row.id)} className="rounded-full border border-line bg-paper/70 px-4 py-2 text-sm text-ink-soft disabled:opacity-50">
                    {detailBusyId === row.id ? c.refreshing : c.refreshOne}
                  </button>
                </div>

                {open ? (
                  <div className="mt-4 border-t border-line pt-4 text-sm leading-7 text-ink-soft">
                    {detailBusyId === row.id ? <div className="h-28 animate-pulse rounded-lg bg-paper-deep" /> : null}
                    {detailBusyId !== row.id && detail ? (
                      <>
                        {user.isOwner ? (
                          <div className="mb-4 rounded-lg border border-line bg-cream/70 p-3">
                            <p className="text-[11px] tracking-[0.18em] text-cinnabar">{c.finalSource}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {[chartState, answerState, reportState, imageState].map((s) => <span key={s.label} className={`rounded-full border px-2.5 py-1 text-[11px] ${s.className}`}>{s.label}</span>)}
                            </div>
                          </div>
                        ) : null}

                        {snapshot?.chart ? (
                          <div className="mb-4 rounded-md bg-cream/70 p-3">
                            <p className="text-xs tracking-[0.18em] text-cinnabar">{c.chartSummary}</p>
                            <p className="mt-2">{c.dayMaster} {snapshot.chart.dayMaster}{snapshot.chart.dayMasterElement} · {c.monthCommand} {snapshot.chart.monthBranch}</p>
                            <p>{snapshot.chart.pillars.map((p) => p.ganZhi).join("　")}</p>
                            {displayAnswer ? <p className="mt-3 font-medium text-ink">{displayAnswer}</p> : null}
                          </div>
                        ) : displayAnswer ? <p className="mb-4 font-medium text-ink">{displayAnswer}</p> : null}

                        {user.isOwner ? (
                          <details data-report-secondary-actions className="mb-5 rounded-lg border border-line bg-paper/50 p-3">
                            <summary className="cursor-pointer list-none text-center text-xs font-medium text-ink-soft [&::-webkit-details-marker]:hidden">{c.manageActions} ＋</summary>
                            <div className="mt-3 flex flex-wrap justify-center gap-2 border-t border-line/70 pt-3">
                              {displayAnswer ? <button type="button" className="rounded-full border border-line bg-cream px-3 py-1.5 text-xs text-ink-soft" onClick={() => void copyFinalAnswer(row.id, displayAnswer)}>{c.copyAnswer}</button> : null}
                              <button type="button" disabled={actionBusyId === row.id || (SUPABASE_STORAGE_WRITES_PAUSED && !detail.image_path)} className="rounded-full bg-cinnabar px-3 py-1.5 text-xs text-cream disabled:opacity-50" onClick={() => void onReportImage(row.id, false)}>
                                {actionBusyId === row.id ? c.generatingImage : detail.image_path ? c.viewImage : c.generateImage}
                              </button>
                              {detail.image_path ? <button type="button" disabled={actionBusyId === row.id || SUPABASE_STORAGE_WRITES_PAUSED} className="rounded-full border border-cinnabar/35 bg-cinnabar/5 px-3 py-1.5 text-xs text-cinnabar disabled:opacity-50" onClick={() => void onReportImage(row.id, true)}>{c.regenerateImage}</button> : null}
                              <button type="button" className="rounded-full px-3 py-1.5 text-xs text-cinnabar" onClick={async () => {
                                if (!window.confirm(c.deleteRecordConfirm)) return;
                                await deleteReportRecord(session!, row.id);
                                setOpenId(null);
                                setDetails((prev) => { const next = { ...prev }; delete next[row.id]; return next; });
                                await loadReports();
                              }}>{c.deleteRecord}</button>
                            </div>
                          </details>
                        ) : null}

                        {reportMessages[row.id] ? <p className="mb-4 rounded-md border border-line bg-cream/70 px-3 py-2 text-xs text-cinnabar">{reportMessages[row.id]}</p> : null}

                        {imageUrls[row.id] ? (
                          <div className="mb-5 mx-auto max-w-sm">
                            <div className="overflow-hidden rounded-xl border border-line bg-cream p-2">
                              <img src={imageUrls[row.id]} alt={c.imageDone} className="aspect-[9/16] w-full rounded-lg object-cover" />
                            </div>
                            <DecreeImageReason
                              chart={snapshot?.chart ?? null}
                              question={String(row.alias || row.context?.question || c.reportFallback)}
                              selectedAssetId={reportGalleryReferenceAssetId(detail)}
                              compact
                            />
                          </div>
                        ) : null}

                        {sections.length ? (
                          <div className="space-y-4">
                            {sections.map((section, index) => (
                              <details key={`${row.id}-${section.key}-${index}`} className="zw-record-section border-t border-line/70">
                                <summary>{section.title || c.fullReport}</summary>
                                {(section.body ?? []).map((line, j) => <p key={j} className="mt-1">{customerCopy(line)}</p>)}
                              </details>
                            ))}
                          </div>
                        ) : text ? <div className="whitespace-pre-wrap">{text}</div> : !displayAnswer ? <p className="text-ink-mute">{c.noReadable}</p> : null}

                        {snapshot?.chart && (sections.length || text) ? <div className="mt-5"><TeaGuardianReport chart={snapshot.chart} /></div> : null}
                      </>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        {nextOffset !== null ? <button type="button" disabled={moreBusy} className="mt-5 min-h-11 rounded-full border border-line px-5" onClick={() => void loadMoreReports()}>{moreBusy ? c.refreshing : tr(locale, "載入更早的報告", "加载更早的报告", "Load older reports")}</button> : null}
        {query ? <p className="mt-3 text-sm">{tr(locale, "搜尋目前已載入的報告；可載入更早紀錄繼續查找。", "搜索目前已加载的报告；可加载更早记录继续查找。", "Searching loaded reports. Load older reports to search further.")}</p> : null}
      </section>

      </div>

      {user.isOwner && session ? (<>
        <div id="console-panel-images" role="tabpanel" aria-labelledby="console-tab-images" hidden={consoleView !== "images"}>
          {visitedViews.has("images") ? <Suspense fallback={<p role="status" className="p-5 text-ink">{tr(locale, "載入圖庫…", "加载图库…", "Loading gallery…")}</p>}><OwnerGalleryManager session={session} locale={locale} /></Suspense> : null}
        </div>
        <div id="console-panel-opening" role="tabpanel" aria-labelledby="console-tab-opening" hidden={consoleView !== "opening"}>
          {visitedViews.has("opening") ? <Suspense fallback={<p role="status" className="p-5 text-ink">{tr(locale, "載入影片…", "加载视频…", "Loading videos…")}</p>}><OwnerLoginVisualsManager session={session} locale={locale} /></Suspense> : null}
        </div>
        <div id="console-panel-themes" role="tabpanel" aria-labelledby="console-tab-themes" hidden={consoleView !== "themes"}>
          {visitedViews.has("themes") ? <Suspense fallback={<p role="status" className="p-5 text-ink">{tr(locale, "載入主題…", "加载主题…", "Loading themes…")}</p>}><OwnerThemeSkinsManager locale={locale} /></Suspense> : null}
        </div>
        <div id="console-panel-social" role="tabpanel" aria-labelledby="console-tab-social" hidden={consoleView !== "social"}>
          {visitedViews.has("social") ? <Suspense fallback={<p role="status" className="p-5 text-ink">{tr(locale, "載入發布器…", "加载发布器…", "Loading publisher…")}</p>}><SocialPublisherPage embedded /></Suspense> : null}
        </div>
      </>) : null}

      <Link to="/" className="inline-flex h-11 items-center rounded-full border border-line bg-cream px-5 text-ink">{t("backHome")}</Link>
    </main>
  );
}
