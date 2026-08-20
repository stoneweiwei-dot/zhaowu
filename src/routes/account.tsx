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
  deleteBackground,
  listOwnerBackgrounds,
  setBackgroundEnabled,
  uploadBackground,
  type BackgroundAsset,
} from "@/lib/background-assets";
import { Mark } from "@/components/marks";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/account")({ component: AccountPage });

function reportLevel(row: Pick<ReportRecord, "status" | "payment_tier">) {
  if (row.status === "full_ready" || row.payment_tier === "full") return "最高版";
  if (row.status === "report_ready") return "完整／九頁";
  if (row.status === "engine_ready") return "基礎盤";
  if (row.status === "ready") return "已完成";
  return "待生成";
}

function fullText(row: ReportRecord): string | null {
  if (!row.paid_report || typeof row.paid_report !== "object") return null;
  const text = (row.paid_report as Record<string, unknown>).text;
  return typeof text === "string" ? text : null;
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
  const { t } = useI18n();
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
      setError(err instanceof Error ? err.message : "報告讀取失敗。");
    } finally {
      setBusy(false);
    }
  }

  async function loadBackgrounds() {
    if (!session || !user?.isOwner) return;
    try {
      setBackgrounds(await listOwnerBackgrounds(session));
    } catch (err) {
      setBackgroundMsg(err instanceof Error ? err.message : "背景圖片讀取失敗。");
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
      setError("登入狀態已失效，請重新登入後再查看報告。");
      return;
    }
    setDetailBusyId(row.id);
    setError(null);
    try {
      const detail = await getReportRecord(session, row.id);
      setDetails((prev) => ({ ...prev, [row.id]: detail }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "單筆報告讀取失敗。");
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
      setBackgroundMsg(`已上傳 ${files.length} 張；啟用中的圖片會按日期輪播。`);
    } catch (err) {
      setBackgroundMsg(err instanceof Error ? err.message : "圖片上傳失敗。");
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
            <h1 className="mt-2 font-display text-3xl">{user.isOwner ? "昭梧站主後台" : "我的昭梧"}</h1>
            <p className="mt-2 text-sm text-ink-soft">{user.displayName} · {user.email}</p>
          </div>
          {user.isOwner ? <span className="rounded-full border border-cinnabar/30 bg-cinnabar/5 px-3 py-1 text-xs text-cinnabar">站主 · 最高版直看</span> : null}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-paper/45 p-4">
            <p className="text-xs tracking-[0.2em] text-ink-mute">出生資料</p>
            <p className="mt-2 text-sm text-ink-soft">{user.birthData ? "已記住，下次分析可自動回填。" : "尚未保存；完成一次分析後會自動記住。"}</p>
          </div>
          <div className="rounded-lg border border-line bg-paper/45 p-4">
            <p className="text-xs tracking-[0.2em] text-ink-mute">報告</p>
            <p className="mt-2 text-sm text-ink-soft">{user.isOwner ? `目前可讀 ${rows.length} 筆（列表只載摘要）` : `最近 ${rows.length} 筆，最多顯示 3 筆`}</p>
          </div>
        </div>
      </section>

      {user.isOwner ? (
        <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.28em] text-cinnabar">BACKGROUND LIBRARY</p>
              <h2 className="mt-1 font-display text-2xl">首頁背景管理</h2>
            </div>
            <label className={`inline-flex h-10 cursor-pointer items-center rounded-full bg-cinnabar px-4 text-sm text-cream ${backgroundBusy ? "pointer-events-none opacity-50" : ""}`}>
              {backgroundBusy ? "上傳中…" : "＋上傳圖片"}
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => void onBackgroundUpload(e)} />
            </label>
          </div>
          <p className="mt-3 text-xs leading-6 text-ink-mute">可一次選多張。啟用中的圖片按日期自動輪播；全部停用時使用網站內建背景。</p>
          {backgroundMsg ? <p className="mt-3 text-sm text-cinnabar">{backgroundMsg}</p> : null}

          <details className="mt-4 rounded-lg border border-line bg-paper/35 p-4">
            <summary className="cursor-pointer text-sm font-medium text-ink">＋已上傳圖片（{backgrounds.length}）</summary>
            {!backgrounds.length ? <p className="mt-4 text-sm text-ink-mute">目前沒有已上傳圖片。</p> : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {backgrounds.map((asset) => (
                <article key={asset.id} className="overflow-hidden rounded-lg border border-line bg-cream/80">
                  <img src={backgroundPublicUrl(asset.storage_path)} alt={asset.name} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-ink">{asset.name}</p>
                    <p className="mt-1 text-[11px] text-ink-mute">{new Date(asset.created_at).toLocaleString()}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
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
                              setBackgroundMsg(err instanceof Error ? err.message : "更新失敗。");
                            }
                          }}
                        />
                        啟用輪播
                      </label>
                      <button
                        type="button"
                        className="text-xs text-cinnabar"
                        onClick={async () => {
                          if (!window.confirm(`刪除「${asset.name}」？`)) return;
                          setBackgroundMsg(null);
                          try {
                            await deleteBackground(session, asset);
                            await loadBackgrounds();
                          } catch (err) {
                            setBackgroundMsg(err instanceof Error ? err.message : "刪除失敗。");
                          }
                        }}
                      >
                        刪除
                      </button>
                    </div>
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
            <h2 className="mt-1 font-display text-2xl">{user.isOwner ? "客戶報告" : "最近報告"}</h2>
          </div>
          {user.isOwner ? (
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 min-w-52 rounded-full border border-line bg-cream px-4 text-sm outline-none focus:border-cinnabar" placeholder="搜尋 Email / 問題" />
          ) : null}
        </div>

        {busy ? <div className="mt-5 h-28 animate-pulse rounded-lg bg-paper-deep" /> : null}
        {error ? <p className="mt-4 rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm text-cinnabar-deep">{error}</p> : null}
        {!busy && !filtered.length ? <p className="mt-5 text-sm leading-7 text-ink-mute">目前沒有報告。登入後完成一次分析，基礎盤會自動出現在這裡。</p> : null}

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
                    <h3 className="truncate font-display text-lg font-semibold">{row.alias || String(row.context?.question ?? "昭梧報告")}</h3>
                    {user.isOwner ? <p className="truncate text-xs text-cinnabar">{row.user_email || "未綁 Email"}</p> : null}
                    <p className="mt-1 text-xs text-ink-mute">{new Date(row.created_at).toLocaleString()} · {reportLevel(row)}</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <button type="button" onClick={() => void toggleReport(row)} className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink-soft">
                    {open ? "收起" : "查看"}
                  </button>
                </div>

                {open ? (
                  <div className="mt-4 border-t border-line pt-4 text-sm leading-7 text-ink-soft">
                    {detailBusyId === row.id ? <div className="h-28 animate-pulse rounded-lg bg-paper-deep" /> : null}
                    {detailBusyId !== row.id && snapshot ? (
                      <div className="mb-4 rounded-md bg-cream/70 p-3">
                        <p className="text-xs tracking-[0.18em] text-cinnabar">命盤摘要</p>
                        <p className="mt-2">日主 {snapshot.chart.dayMaster}{snapshot.chart.dayMasterElement} · 月令 {snapshot.chart.monthBranch}</p>
                        <p>{snapshot.chart.pillars.map((p) => p.ganZhi).join("　")}</p>
                        <p className="mt-2">{snapshot.reading.directAnswer}</p>
                      </div>
                    ) : null}
                    {detailBusyId !== row.id && text ? <div className="mb-4 whitespace-pre-wrap">{text}</div> : null}
                    {detailBusyId !== row.id && pages.length ? (
                      <div className="space-y-4">
                        {pages.map((p, i) => (
                          <div key={`${row.id}-${i}`} className="border-t border-line/70 pt-3 first:border-0 first:pt-0">
                            <p className="font-medium text-ink">第 {p.pageNo ?? i + 1} 頁 · {p.title ?? "完整報告"}</p>
                            {(p.body ?? []).map((line, j) => <p key={j} className="mt-1">{line}</p>)}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {detailBusyId !== row.id && detail && !snapshot && !text && !pages.length ? <p className="text-ink-mute">這筆記錄尚未生成可讀內容。</p> : null}
                    {detailBusyId !== row.id && user.isOwner ? (
                      <button
                        type="button"
                        className="mt-5 text-xs text-cinnabar"
                        onClick={async () => {
                          if (!window.confirm("刪除這筆報告？")) return;
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
                        刪除記錄
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
