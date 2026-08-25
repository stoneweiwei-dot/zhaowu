import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  deleteReportRecord,
  getReportRecord,
  listReportRecords,
  type ReportListRecord,
  type ReportRecord,
} from "@/lib/supabase-rest";
import {
  backgroundPublicUrl,
  clearBackgroundWallpaper,
  deleteBackground,
  isPinnedWallpaper,
  listOwnerBackgrounds,
  setBackgroundEnabled,
  setBackgroundWallpaper,
  uploadBackground,
  type BackgroundAsset,
} from "@/lib/background-assets";
import { useI18n, type Locale } from "@/lib/i18n";
import { customerCopy, customerDocument } from "@/lib/report/customer-copy";
import { ReportDragonSticker } from "@/components/report-dragon-sticker";
import { generateDecreeImage } from "@/lib/report/decree-image";
import type { ReportSection } from "@/lib/report/focused-report";

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
  const [rows, setRows] = useState<ReportListRecord[]>([]);
  const [details, setDetails] = useState<Record<string, ReportRecord | null>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(true);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [detailBusyId, setDetailBusyId] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportMessages, setReportMessages] = useState<Record<string, string>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [backgrounds, setBackgrounds] = useState<BackgroundAsset[]>([]);
  const [backgroundBusy, setBackgroundBusy] = useState(false);
  const [backgroundMsg, setBackgroundMsg] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const c = useMemo(() => ({
    ownerTitle: tr(locale, "昭梧站主後台", "昭梧站主后台", "Zhaowu Owner Console"),
    memberTitle: tr(locale, "我的昭梧", "我的昭梧", "My Zhaowu"),
    ownerBadge: tr(locale, "站主 · 單一最終答案", "站主 · 单一最终答案", "Owner · one final answer"),
    reportsReadError: tr(locale, "報告讀取失敗。", "报告读取失败。", "Could not load reports."),
    reportReadError: tr(locale, "單筆報告讀取失敗。", "单笔报告读取失败。", "Could not load this report."),
    expired: tr(locale, "登入狀態已失效，請重新登入。", "登录状态已失效，请重新登录。", "Your session has expired. Sign in again."),
    birthData: tr(locale, "出生資料", "出生资料", "Birth profile"),
    birthSaved: tr(locale, "已保存，可供下次分析回填。", "已保存，可供下次分析回填。", "Saved for the next analysis."),
    birthEmpty: tr(locale, "尚未保存。", "尚未保存。", "Not saved yet."),
    reports: tr(locale, "報告", "报告", "Reports"),
    ownerCount: (n: number) => tr(locale, `目前 ${n} 筆`, `目前 ${n} 笔`, `${n} reports`),
    memberCount: (n: number) => tr(locale, `最近 ${n} 筆，最多顯示 3 筆`, `最近 ${n} 笔，最多显示 3 笔`, `${n} recent reports; up to 3 shown`),
    refreshAll: tr(locale, "刷新後台", "刷新后台", "Refresh console"),
    refreshing: tr(locale, "刷新中…", "刷新中…", "Refreshing…"),
    refreshed: tr(locale, "已刷新", "已刷新", "Refreshed"),
    refreshOne: tr(locale, "刷新這筆", "刷新这笔", "Refresh"),
    customerReports: tr(locale, "客戶報告", "客户报告", "Customer reports"),
    recentReports: tr(locale, "最近報告", "最近报告", "Recent reports"),
    search: tr(locale, "搜尋 Email / 問題", "搜索 Email / 问题", "Search email / question"),
    empty: tr(locale, "目前沒有報告。", "目前没有报告。", "No reports yet."),
    open: tr(locale, "查看", "查看", "Open"),
    collapse: tr(locale, "收起", "收起", "Collapse"),
    noEmail: tr(locale, "未綁 Email", "未绑定 Email", "No email linked"),
    reportFallback: tr(locale, "昭梧報告", "昭梧报告", "Zhaowu report"),
    chartSummary: tr(locale, "命盤摘要", "命盘摘要", "Chart summary"),
    dayMaster: tr(locale, "日主", "日主", "Day Master"),
    monthCommand: tr(locale, "月令", "月令", "Month command"),
    finalSource: tr(locale, "最終答案來源：保存版本，不重新計算", "最终答案来源：保存版本，不重新计算", "Final answer source: saved version, no live recalculation"),
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
    backgroundTitle: tr(locale, "首頁背景管理", "首页背景管理", "Homepage backgrounds"),
    backgroundLead: tr(locale, "站主設定的壁紙優先；其餘啟用圖片才參與輪播。", "站主设置的壁纸优先；其余启用图片才参与轮播。", "Pinned owner wallpaper has priority; other enabled images may rotate."),
    uploadedImages: (n: number) => tr(locale, `＋已上傳圖片（${n}）`, `＋已上传图片（${n}）`, `+ Uploaded images (${n})`),
    noImages: tr(locale, "目前沒有已上傳圖片。", "目前没有已上传图片。", "No uploaded images yet."),
    upload: tr(locale, "＋上傳圖片", "＋上传图片", "+ Upload images"),
    uploading: tr(locale, "上傳中…", "上传中…", "Uploading…"),
    uploaded: (n: number) => tr(locale, `已上傳 ${n} 張。`, `已上传 ${n} 张。`, `Uploaded ${n} image${n === 1 ? "" : "s"}.`),
    uploadFailed: tr(locale, "圖片上傳失敗。", "图片上传失败。", "Image upload failed."),
    enabled: tr(locale, "啟用輪播", "启用轮播", "Enable rotation"),
    setWallpaper: tr(locale, "設為壁紙", "设为壁纸", "Set as wallpaper"),
    currentWallpaper: tr(locale, "目前壁紙", "当前壁纸", "Current wallpaper"),
    unpinWallpaper: tr(locale, "取消固定", "取消固定", "Unpin"),
    wallpaperSet: tr(locale, "已設為目前壁紙。", "已设为当前壁纸。", "Wallpaper updated."),
    delete: tr(locale, "刪除", "删除", "Delete"),
    deleteImage: (name: string) => tr(locale, `刪除「${name}」？`, `删除“${name}”？`, `Delete “${name}”?`),
    deleteFailed: tr(locale, "刪除失敗。", "删除失败。", "Delete failed."),
    updateFailed: tr(locale, "更新失敗。", "更新失败。", "Update failed."),
    backgroundsReadError: tr(locale, "背景圖片讀取失敗。", "背景图片读取失败。", "Could not load background images."),
    updated: tr(locale, "更新", "更新", "Updated"),
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
      setRows(await listReportRecords(session, user.isOwner));
    } catch (err) {
      setError(err instanceof Error ? err.message : c.reportsReadError);
    } finally {
      setBusy(false);
    }
  }

  async function loadBackgrounds() {
    if (!session || !user?.isOwner) return;
    try {
      setBackgrounds(await listOwnerBackgrounds(session));
    } catch (err) {
      setBackgroundMsg(err instanceof Error ? err.message : c.backgroundsReadError);
    }
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
      if (user.isOwner) await loadBackgrounds();
      if (openId) await refreshDetail(openId, true);
      setLastRefreshedAt(new Date());
    } finally {
      setRefreshBusy(false);
    }
  }

  useEffect(() => {
    void loadReports();
    if (user?.isOwner) void loadBackgrounds();
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
      const out = await generateDecreeImage(session, id, force);
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

  async function onBackgroundUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!session || !user?.isOwner || !files.length) return;
    setBackgroundBusy(true);
    setBackgroundMsg(null);
    try {
      for (const file of files) await uploadBackground(session, file);
      await loadBackgrounds();
      setBackgroundMsg(c.uploaded(files.length));
    } catch (err) {
      setBackgroundMsg(err instanceof Error ? err.message : c.uploadFailed);
    } finally {
      setBackgroundBusy(false);
    }
  }

  if (isPending) return <div className="mx-auto h-52 max-w-xl animate-pulse rounded-xl bg-cream/70" />;

  if (!user || !session) {
    return (
      <main className="mx-auto max-w-xl">
        <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
          <p className="text-xs tracking-[0.28em] text-cinnabar">MY ZHAOWU</p>
          <h1 className="mt-2 font-display text-3xl">{t("myTitle")}</h1>
          <p className="mt-4 text-sm leading-7 text-ink-soft">{t("mySignedOutLead")}</p>
          <Link to="/login" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-cinnabar px-5 text-cream">{t("loginTab")}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5">
      <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.28em] text-cinnabar">{user.isOwner ? "OWNER CONSOLE" : "MY ZHAOWU"}</p>
            <h1 className="mt-2 font-display text-3xl">{user.isOwner ? c.ownerTitle : c.memberTitle}</h1>
            <p className="mt-2 text-sm text-ink-soft">{user.displayName} · {user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user.isOwner ? <span className="rounded-full border border-cinnabar/30 bg-cinnabar/5 px-3 py-1 text-xs text-cinnabar">{c.ownerBadge}</span> : null}
            <button type="button" disabled={refreshBusy} onClick={() => void refreshAll()} className="rounded-full border border-line bg-paper/70 px-3 py-2 text-xs text-ink-soft disabled:opacity-50">
              {refreshBusy ? c.refreshing : c.refreshAll}
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-paper/45 p-4">
            <p className="text-xs tracking-[0.2em] text-ink-mute">{c.birthData}</p>
            <p className="mt-2 text-sm text-ink-soft">{user.birthData ? c.birthSaved : c.birthEmpty}</p>
          </div>
          <div className="rounded-lg border border-line bg-paper/45 p-4">
            <p className="text-xs tracking-[0.2em] text-ink-mute">{c.reports}</p>
            <p className="mt-2 text-sm text-ink-soft">{user.isOwner ? c.ownerCount(rows.length) : c.memberCount(rows.length)}</p>
            {lastRefreshedAt ? <p className="mt-1 text-[11px] text-ink-mute">{c.refreshed} · {lastRefreshedAt.toLocaleTimeString()}</p> : null}
          </div>
        </div>
      </section>

      {user.isOwner ? (
        <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.28em] text-cinnabar">BACKGROUND LIBRARY</p>
              <h2 className="mt-1 font-display text-2xl">{c.backgroundTitle}</h2>
            </div>
            <label className={`inline-flex h-10 cursor-pointer items-center rounded-full bg-cinnabar px-4 text-sm text-cream ${backgroundBusy ? "pointer-events-none opacity-50" : ""}`}>
              {backgroundBusy ? c.uploading : c.upload}
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => void onBackgroundUpload(e)} />
            </label>
          </div>
          <p className="mt-3 text-xs leading-6 text-ink-mute">{c.backgroundLead}</p>
          {backgroundMsg ? <p className="mt-3 text-sm text-cinnabar">{backgroundMsg}</p> : null}

          <details className="mt-4 rounded-lg border border-line bg-paper/35 p-4">
            <summary className="cursor-pointer text-sm font-medium text-ink">{c.uploadedImages(backgrounds.length)}</summary>
            {!backgrounds.length ? <p className="mt-4 text-sm text-ink-mute">{c.noImages}</p> : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {backgrounds.map((asset) => (
                <article key={asset.id} className="overflow-hidden rounded-lg border border-line bg-cream/80">
                  <img src={backgroundPublicUrl(asset.storage_path)} alt={asset.name} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-ink">{asset.name}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs text-ink-soft">
                        <input type="checkbox" checked={asset.enabled} onChange={async (e) => {
                          try { await setBackgroundEnabled(session, asset.id, e.target.checked); await loadBackgrounds(); }
                          catch (err) { setBackgroundMsg(err instanceof Error ? err.message : c.updateFailed); }
                        }} />
                        {c.enabled}
                      </label>
                      <div className="flex items-center gap-2">
                        {isPinnedWallpaper(asset) ? (
                          <button type="button" className="rounded-full border border-wood/40 bg-wood/10 px-3 py-1.5 text-xs text-wood" onClick={async () => {
                            try { await clearBackgroundWallpaper(session, asset.id); await loadBackgrounds(); }
                            catch (err) { setBackgroundMsg(err instanceof Error ? err.message : c.updateFailed); }
                          }}>{c.unpinWallpaper}</button>
                        ) : (
                          <button type="button" className="rounded-full bg-cinnabar px-3 py-1.5 text-xs text-cream" onClick={async () => {
                            try { await setBackgroundWallpaper(session, asset.id); await loadBackgrounds(); setBackgroundMsg(c.wallpaperSet); }
                            catch (err) { setBackgroundMsg(err instanceof Error ? err.message : c.updateFailed); }
                          }}>{c.setWallpaper}</button>
                        )}
                        <button type="button" className="rounded-full px-3 py-1.5 text-xs text-cinnabar" onClick={async () => {
                          if (!window.confirm(c.deleteImage(asset.name))) return;
                          try { await deleteBackground(session, asset); await loadBackgrounds(); }
                          catch (err) { setBackgroundMsg(err instanceof Error ? err.message : c.deleteFailed); }
                        }}>{c.delete}</button>
                      </div>
                    </div>
                    {isPinnedWallpaper(asset) ? <p className="mt-2 text-[11px] tracking-[0.12em] text-cinnabar">{c.currentWallpaper}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </details>
        </section>
      ) : null}

      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.28em] text-cinnabar">REPORTS</p>
            <h2 className="mt-1 font-display text-2xl">{user.isOwner ? c.customerReports : c.recentReports}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user.isOwner ? <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 min-w-52 rounded-full border border-line bg-cream px-4 text-sm outline-none focus:border-cinnabar" placeholder={c.search} /> : null}
            <button type="button" disabled={refreshBusy} onClick={() => void refreshAll()} className="h-10 rounded-full border border-line bg-cream px-4 text-sm text-ink-soft disabled:opacity-50">
              {refreshBusy ? c.refreshing : c.refreshAll}
            </button>
          </div>
        </div>

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
              <article key={row.id} className="rounded-lg border border-line bg-paper/35 p-4">
                <div className="text-center">
                  <h3 className="truncate font-display text-lg font-semibold">{row.alias || String(row.context?.question ?? c.reportFallback)}</h3>
                  {user.isOwner ? <p className="truncate text-xs text-cinnabar">{row.user_email || c.noEmail}</p> : null}
                  <p className="mt-1 text-xs text-ink-mute">{new Date(row.created_at).toLocaleString(locale === "en" ? "en-AU" : locale === "zh-Hans" ? "zh-CN" : "zh-TW")} · {reportLevel(row, locale)}</p>
                  <p className="mt-1 text-[11px] text-ink-mute">{c.updated} {new Date(row.updated_at).toLocaleString(locale === "en" ? "en-AU" : locale === "zh-Hans" ? "zh-CN" : "zh-TW")}</p>
                </div>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
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
                          <div className="mb-5 flex flex-wrap gap-2 rounded-lg border border-line bg-paper/50 p-3">
                            {displayAnswer ? <button type="button" className="rounded-full border border-line bg-cream px-3 py-1.5 text-xs text-ink-soft" onClick={() => void copyFinalAnswer(row.id, displayAnswer)}>{c.copyAnswer}</button> : null}
                            <button type="button" disabled={actionBusyId === row.id} className="rounded-full bg-cinnabar px-3 py-1.5 text-xs text-cream disabled:opacity-50" onClick={() => void onReportImage(row.id, false)}>
                              {actionBusyId === row.id ? c.generatingImage : detail.image_path ? c.viewImage : c.generateImage}
                            </button>
                            {detail.image_path ? <button type="button" disabled={actionBusyId === row.id} className="rounded-full border border-cinnabar/35 bg-cinnabar/5 px-3 py-1.5 text-xs text-cinnabar disabled:opacity-50" onClick={() => void onReportImage(row.id, true)}>{c.regenerateImage}</button> : null}
                          </div>
                        ) : null}

                        {reportMessages[row.id] ? <p className="mb-4 rounded-md border border-line bg-cream/70 px-3 py-2 text-xs text-cinnabar">{reportMessages[row.id]}</p> : null}

                        {imageUrls[row.id] ? <div className="mb-5 mx-auto max-w-sm overflow-hidden rounded-xl border border-line bg-cream p-2"><img src={imageUrls[row.id]} alt={c.imageDone} className="aspect-[9/16] w-full rounded-lg object-cover" /></div> : null}

                        {sections.length ? (
                          <div className="space-y-4">
                            {sections.map((section, index) => (
                              <div key={`${row.id}-${section.key}-${index}`} className="border-t border-line/70 pt-3 first:border-0 first:pt-0">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="pt-1 font-medium text-ink">{String(section.sectionNo ?? index + 1).padStart(2, "0")} · {section.title || c.fullReport}</p>
                                  <ReportDragonSticker section={section} compact />
                                </div>
                                {(section.body ?? []).map((line, j) => <p key={j} className="mt-1">{customerCopy(line)}</p>)}
                              </div>
                            ))}
                          </div>
                        ) : text ? <div className="whitespace-pre-wrap">{text}</div> : !displayAnswer ? <p className="text-ink-mute">{c.noReadable}</p> : null}

                        {user.isOwner ? <button type="button" className="mt-5 text-xs text-cinnabar" onClick={async () => {
                          if (!window.confirm(c.deleteRecordConfirm)) return;
                          await deleteReportRecord(session, row.id);
                          setOpenId(null);
                          setDetails((prev) => { const next = { ...prev }; delete next[row.id]; return next; });
                          await loadReports();
                        }}>{c.deleteRecord}</button> : null}
                      </>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <Link to="/" className="inline-flex h-11 items-center rounded-full border border-line bg-cream px-5 text-ink">{t("backHome")}</Link>
    </main>
  );
}
