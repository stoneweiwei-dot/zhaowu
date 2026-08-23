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
import { Mark } from "@/components/marks";
import { useI18n, type Locale } from "@/lib/i18n";
import { customerCopy, customerDirectAnswer, customerDocument } from "@/lib/report/customer-copy";

export const Route = createFileRoute("/account")({ component: AccountPage });

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function reportLevel(row: Pick<ReportRecord, "status" | "payment_tier">, locale: Locale) {
  if (row.status === "full_ready" || row.payment_tier === "full") return tr(locale, "最高版", "最高版", "Highest version");
  if (row.status === "report_ready") return tr(locale, "完整／九頁", "完整／九页", "Full / nine-page");
  if (row.status === "engine_ready") return tr(locale, "基礎盤", "基础盘", "Base chart");
  if (row.status === "ready") return tr(locale, "已完成", "已完成", "Ready");
  return tr(locale, "待生成", "待生成", "Pending");
}

function fullText(row: ReportRecord): string | null {
  if (!row.paid_report || typeof row.paid_report !== "object") return null;
  const text = (row.paid_report as Record<string, unknown>).text;
  return typeof text === "string" ? customerDocument(text) : null;
}

function storedNinePages(row: ReportRecord): { pageNo?: number; title?: string; body?: string[] }[] {
  const sources = [row.mother_draft, row.paid_report];
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const pages = (source as Record<string, unknown>).ninePages;
    if (Array.isArray(pages)) return pages as { pageNo?: number; title?: string; body?: string[] }[];
  }
  return [];
}

function AccountPage() {
  const { t, locale } = useI18n();
  const { user, session, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<ReportListRecord[]>([]);
  const [details, setDetails] = useState<Record<string, ReportRecord | null>>({});
  const [detailBusyId, setDetailBusyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [backgrounds, setBackgrounds] = useState<BackgroundAsset[]>([]);
  const [backgroundBusy, setBackgroundBusy] = useState(false);
  const [backgroundMsg, setBackgroundMsg] = useState<string | null>(null);

  const c = useMemo(() => ({
    reportsReadError: tr(locale, "報告讀取失敗。", "报告读取失败。", "Could not load reports."),
    backgroundsReadError: tr(locale, "背景圖片讀取失敗。", "背景图片读取失败。", "Could not load background images."),
    expired: tr(locale, "登入狀態已失效，請重新登入後再查看報告。", "登录状态已失效，请重新登录后再查看报告。", "Your session has expired. Sign in again to open reports."),
    reportReadError: tr(locale, "單筆報告讀取失敗。", "单笔报告读取失败。", "Could not load this report."),
    uploaded: (n: number) => tr(locale, `已上傳 ${n} 張；啟用中的圖片會按日期輪播。`, `已上传 ${n} 张；启用中的图片会按日期轮播。`, `Uploaded ${n} image${n === 1 ? "" : "s"}. Enabled images rotate by date.`),
    uploadFailed: tr(locale, "圖片上傳失敗。", "图片上传失败。", "Image upload failed."),
    ownerTitle: tr(locale, "昭梧站主後台", "昭梧站主后台", "Zhaowu Owner Console"),
    memberTitle: tr(locale, "我的昭梧", "我的昭梧", "My Zhaowu"),
    ownerBadge: tr(locale, "站主 · 最高版直看", "站主 · 最高版直看", "Owner · highest version access"),
    birthData: tr(locale, "出生資料", "出生资料", "Birth profile"),
    birthSaved: tr(locale, "已記住，下次分析可自動回填。", "已记住，下次分析可自动回填。", "Saved. It will be filled automatically next time."),
    birthEmpty: tr(locale, "尚未保存；完成一次分析後會自動記住。", "尚未保存；完成一次分析后会自动记住。", "Not saved yet. It will be remembered after an analysis."),
    reports: tr(locale, "報告", "报告", "Reports"),
    ownerCount: (n: number) => tr(locale, `目前可讀 ${n} 筆（列表只載摘要）`, `目前可读 ${n} 笔（列表只载摘要）`, `${n} report${n === 1 ? "" : "s"} available; the list loads summaries only.`),
    memberCount: (n: number) => tr(locale, `最近 ${n} 筆，最多顯示 3 筆`, `最近 ${n} 笔，最多显示 3 笔`, `${n} recent report${n === 1 ? "" : "s"}; up to 3 are shown.`),
    backgroundTitle: tr(locale, "首頁背景管理", "首页背景管理", "Homepage backgrounds"),
    uploading: tr(locale, "上傳中…", "上传中…", "Uploading…"),
    upload: tr(locale, "＋上傳圖片", "＋上传图片", "+ Upload images"),
    backgroundLead: tr(locale, "可一次選多張。點「設為壁紙」會立刻用這張當全站背景；其餘啟用中的圖片按日期輪播。", "可一次选多张。点「设为壁纸」会立刻用这张当全站背景；其余启用中的图片按日期轮播。", "Select multiple images. “Set as wallpaper” applies it immediately; other enabled images rotate by date."),
    uploadedImages: (n: number) => tr(locale, `＋已上傳圖片（${n}）`, `＋已上传图片（${n}）`, `+ Uploaded images (${n})`),
    noImages: tr(locale, "目前沒有已上傳圖片。", "目前没有已上传图片。", "No uploaded images yet."),
    enabled: tr(locale, "啟用輪播", "启用轮播", "Enable rotation"),
    setWallpaper: tr(locale, "設為壁紙", "设为壁纸", "Set as wallpaper"),
    currentWallpaper: tr(locale, "目前壁紙", "当前壁纸", "Current wallpaper"),
    wallpaperSet: tr(locale, "已設為目前壁紙。回首頁即可看到。", "已设为当前壁纸。回首页即可看到。", "Set as the current wallpaper. Open the home page to see it."),
    unpinWallpaper: tr(locale, "取消固定", "取消固定", "Unpin"),
    updateFailed: tr(locale, "更新失敗。", "更新失败。", "Update failed."),
    delete: tr(locale, "刪除", "删除", "Delete"),
    deleteImage: (name: string) => tr(locale, `刪除「${name}」？`, `删除“${name}”？`, `Delete “${name}”?`),
    deleteFailed: tr(locale, "刪除失敗。", "删除失败。", "Delete failed."),
    customerReports: tr(locale, "客戶報告", "客户报告", "Customer reports"),
    recentReports: tr(locale, "最近報告", "最近报告", "Recent reports"),
    search: tr(locale, "搜尋 Email / 問題", "搜索 Email / 问题", "Search email / question"),
    empty: tr(locale, "目前沒有報告。登入後完成一次分析，基礎盤會自動出現在這裡。", "目前没有报告。登录后完成一次分析，基础盘会自动出现在这里。", "No reports yet. After a signed-in analysis, the base chart will appear here automatically."),
    reportFallback: tr(locale, "昭梧報告", "昭梧报告", "Zhaowu report"),
    noEmail: tr(locale, "未綁 Email", "未绑定 Email", "No email linked"),
    collapse: tr(locale, "收起", "收起", "Collapse"),
    open: tr(locale, "查看", "查看", "Open"),
    chartSummary: tr(locale, "命盤摘要", "命盘摘要", "Chart summary"),
    dayMaster: tr(locale, "日主", "日主", "Day Master"),
    monthCommand: tr(locale, "月令", "月令", "Month command"),
    page: tr(locale, "頁", "页", "Page"),
    fullReport: tr(locale, "完整報告", "完整报告", "Full report"),
    noReadable: tr(locale, "這筆記錄尚未生成可讀內容。", "这笔记录尚未生成可读内容。", "This record does not yet contain readable report content."),
    deleteRecordConfirm: tr(locale, "刪除這筆報告？", "删除这笔报告？", "Delete this report?"),
    deleteRecord: tr(locale, "刪除記錄", "删除记录", "Delete record"),
  }), [locale]);

  async function load() {
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

  useEffect(() => {
    void load();
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
    if (Object.prototype.hasOwnProperty.call(details, row.id)) return;
    if (!session) {
      setError(c.expired);
      return;
    }
    setDetailBusyId(row.id);
    setError(null);
    try {
      const detail = await getReportRecord(session, row.id);
      setDetails((prev) => ({ ...prev, [row.id]: detail }));
    } catch (err) {
      setError(err instanceof Error ? err.message : c.reportReadError);
      setDetails((prev) => ({ ...prev, [row.id]: null }));
    } finally {
      setDetailBusyId(null);
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

  if (isPending) {
    return <div className="mx-auto h-52 max-w-xl animate-pulse rounded-xl bg-cream/70" />;
  }

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
          {user.isOwner ? <span className="rounded-full border border-cinnabar/30 bg-cinnabar/5 px-3 py-1 text-xs text-cinnabar">{c.ownerBadge}</span> : null}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-paper/45 p-4">
            <p className="text-xs tracking-[0.2em] text-ink-mute">{c.birthData}</p>
            <p className="mt-2 text-sm text-ink-soft">{user.birthData ? c.birthSaved : c.birthEmpty}</p>
          </div>
          <div className="rounded-lg border border-line bg-paper/45 p-4">
            <p className="text-xs tracking-[0.2em] text-ink-mute">{c.reports}</p>
            <p className="mt-2 text-sm text-ink-soft">{user.isOwner ? c.ownerCount(rows.length) : c.memberCount(rows.length)}</p>
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
                    <p className="mt-1 text-[11px] text-ink-mute">{new Date(asset.created_at).toLocaleString(locale === "en" ? "en-AU" : locale === "zh-Hans" ? "zh-CN" : "zh-TW")}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs text-ink-soft">
                        <input
                          type="checkbox"
                          checked={asset.enabled}
                          onChange={async (e) => {
                            setBackgroundMsg(null);
                            try {
                              await setBackgroundEnabled(session, asset.id, e.target.checked);
                              await loadBackgrounds();
                            } catch (err) {
                              setBackgroundMsg(err instanceof Error ? err.message : c.updateFailed);
                            }
                          }}
                        />
                        {c.enabled}
                      </label>
                      <div className="flex items-center gap-3">
                        {isPinnedWallpaper(asset) ? (
                          <button
                            type="button"
                            className="text-xs text-wood"
                            onClick={async () => {
                              setBackgroundMsg(null);
                              try {
                                await clearBackgroundWallpaper(session, asset.id);
                                await loadBackgrounds();
                              } catch (err) {
                                setBackgroundMsg(err instanceof Error ? err.message : c.updateFailed);
                              }
                            }}
                          >
                            {c.unpinWallpaper}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="text-xs text-cinnabar"
                            onClick={async () => {
                              setBackgroundMsg(null);
                              try {
                                await setBackgroundWallpaper(session, asset.id);
                                await loadBackgrounds();
                                setBackgroundMsg(c.wallpaperSet);
                              } catch (err) {
                                setBackgroundMsg(err instanceof Error ? err.message : c.updateFailed);
                              }
                            }}
                          >
                            {c.setWallpaper}
                          </button>
                        )}
                        <button
                          type="button"
                          className="text-xs text-cinnabar"
                          onClick={async () => {
                            if (!window.confirm(c.deleteImage(asset.name))) return;
                            setBackgroundMsg(null);
                            try {
                              await deleteBackground(session, asset);
                              await loadBackgrounds();
                            } catch (err) {
                              setBackgroundMsg(err instanceof Error ? err.message : c.deleteFailed);
                            }
                          }}
                        >
                          {c.delete}
                        </button>
                      </div>
                    </div>
                    {isPinnedWallpaper(asset) ? (
                      <p className="mt-2 text-[11px] tracking-[0.12em] text-cinnabar">{c.currentWallpaper}</p>
                    ) : null}
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
          {user.isOwner ? (
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 min-w-52 rounded-full border border-line bg-cream px-4 text-sm outline-none focus:border-cinnabar" placeholder={c.search} />
          ) : null}
        </div>

        {busy ? <div className="mt-5 h-28 animate-pulse rounded-lg bg-paper-deep" /> : null}
        {error ? <p className="mt-4 rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm text-cinnabar-deep">{error}</p> : null}
        {!busy && !filtered.length ? <p className="mt-5 text-sm leading-7 text-ink-mute">{c.empty}</p> : null}

        <div className="mt-5 space-y-3">
          {filtered.map((row) => {
            const open = openId === row.id;
            const detail = details[row.id] ?? null;
            const snapshot = detail?.engine_snapshot ?? null;
            const pages = detail ? storedNinePages(detail) : [];
            const text = detail ? fullText(detail) : null;
            return (
              <article key={row.id} className="rounded-lg border border-line bg-paper/35 p-4">
                <div className="flex items-start justify-center gap-2 text-center">
                  <Mark id="brand" size={30} className="mt-0.5 h-7 w-7 shrink-0 opacity-80" />
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-semibold">{row.alias || String(row.context?.question ?? c.reportFallback)}</h3>
                    {user.isOwner ? <p className="truncate text-xs text-cinnabar">{row.user_email || c.noEmail}</p> : null}
                    <p className="mt-1 text-xs text-ink-mute">{new Date(row.created_at).toLocaleString(locale === "en" ? "en-AU" : locale === "zh-Hans" ? "zh-CN" : "zh-TW")} · {reportLevel(row, locale)}</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <button type="button" onClick={() => void toggleReport(row)} className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink-soft">
                    {open ? c.collapse : c.open}
                  </button>
                </div>

                {open ? (
                  <div className="mt-4 border-t border-line pt-4 text-sm leading-7 text-ink-soft">
                    {detailBusyId === row.id ? <div className="h-28 animate-pulse rounded-lg bg-paper-deep" /> : null}
                    {detailBusyId !== row.id && snapshot ? (
                      <div className="mb-4 rounded-md bg-cream/70 p-3">
                        <p className="text-xs tracking-[0.18em] text-cinnabar">{c.chartSummary}</p>
                        <p className="mt-2">{c.dayMaster} {snapshot.chart.dayMaster}{snapshot.chart.dayMasterElement} · {c.monthCommand} {snapshot.chart.monthBranch}</p>
                        <p>{snapshot.chart.pillars.map((p) => p.ganZhi).join("　")}</p>
                        <p className="mt-2">{customerDirectAnswer(snapshot.question, snapshot.reading.directAnswer)}</p>
                      </div>
                    ) : null}
                    {detailBusyId !== row.id && text ? <div className="mb-4 whitespace-pre-wrap">{text}</div> : null}
                    {detailBusyId !== row.id && pages.length ? (
                      <div className="space-y-4">
                        {pages.map((p, i) => (
                          <div key={`${row.id}-${i}`} className="border-t border-line/70 pt-3 first:border-0 first:pt-0">
                            <p className="font-medium text-ink">{locale === "en" ? `${c.page} ${p.pageNo ?? i + 1}` : `第 ${p.pageNo ?? i + 1} ${c.page}`} · {p.title ?? c.fullReport}</p>
                            {(p.body ?? []).map((line, j) => <p key={j} className="mt-1">{customerCopy(line)}</p>)}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {detailBusyId !== row.id && detail && !snapshot && !text && !pages.length ? <p className="text-ink-mute">{c.noReadable}</p> : null}
                    {detailBusyId !== row.id && user.isOwner ? (
                      <button
                        type="button"
                        className="mt-5 text-xs text-cinnabar"
                        onClick={async () => {
                          if (!window.confirm(c.deleteRecordConfirm)) return;
                          await deleteReportRecord(session, row.id);
                          setOpenId(null);
                          setDetails((prev) => {
                            const next = { ...prev };
                            delete next[row.id];
                            return next;
                          });
                          await load();
                        }}
                      >
                        {c.deleteRecord}
                      </button>
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
