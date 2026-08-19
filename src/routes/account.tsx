import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { deleteReportRecord, listReportRecords, type ReportRecord } from "@/lib/supabase-rest";

export const Route = createFileRoute("/account")({ component: AccountPage });

function reportLevel(row: ReportRecord) {
  if (row.paid_report) return "最高版";
  if (row.mother_draft) return "九頁母稿";
  if (row.engine_snapshot) return "基礎盤";
  return "待生成";
}

function fullText(row: ReportRecord): string | null {
  if (!row.paid_report || typeof row.paid_report !== "object") return null;
  const text = (row.paid_report as Record<string, unknown>).text;
  return typeof text === "string" ? text : null;
}

function ninePages(row: ReportRecord): { pageNo?: number; title?: string; body?: string[] }[] {
  const sources = [row.paid_report, row.mother_draft];
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const pages = (source as Record<string, unknown>).ninePages;
    if (Array.isArray(pages)) return pages as { pageNo?: number; title?: string; body?: string[] }[];
  }
  return [];
}

function AccountPage() {
  const { user, session, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<ReportRecord[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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

  useEffect(() => {
    void load();
  }, [session?.access_token, user?.isOwner]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.alias, r.user_email, r.context?.question].some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [query, rows]);

  if (isPending) {
    return <div className="mx-auto h-52 max-w-xl animate-pulse rounded-xl bg-cream/70" />;
  }

  if (!user || !session) {
    return (
      <main className="mx-auto max-w-xl">
        <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
          <p className="text-xs tracking-[0.28em] text-cinnabar">MY ZHAOWU</p>
          <h1 className="mt-2 font-display text-3xl">我的昭梧</h1>
          <p className="mt-4 text-sm leading-7 text-ink-soft">登入後查看你的出生檔案與最近三份報告。</p>
          <Link to="/login" className="mt-6 inline-flex h-11 items-center rounded-full bg-cinnabar px-5 text-cream">登入</Link>
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
            <p className="mt-2 text-sm text-ink-soft">{user.isOwner ? `目前可讀 ${rows.length} 筆（含客戶）` : `最近 ${rows.length} 筆，最多顯示 3 筆`}</p>
          </div>
        </div>
      </section>

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
        {!busy && !filtered.length ? <p className="mt-5 text-sm leading-7 text-ink-mute">目前沒有報告。完成一次分析後，在結果頁按「保存到我的昭梧」。</p> : null}

        <div className="mt-5 space-y-3">
          {filtered.map((row) => {
            const open = openId === row.id;
            const snapshot = row.engine_snapshot;
            const text = fullText(row);
            const pages = ninePages(row);
            return (
              <article key={row.id} className="rounded-lg border border-line bg-paper/35 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {user.isOwner ? <p className="truncate text-xs text-cinnabar">{row.user_email || "未綁 Email"}</p> : null}
                    <h3 className="mt-1 truncate font-display text-lg">{row.alias || String(row.context?.question ?? "昭梧報告")}</h3>
                    <p className="mt-1 text-xs text-ink-mute">{new Date(row.created_at).toLocaleString()} · {reportLevel(row)}</p>
                  </div>
                  <button type="button" onClick={() => setOpenId(open ? null : row.id)} className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink-soft">
                    {open ? "收起" : "查看"}
                  </button>
                </div>

                {open ? (
                  <div className="mt-4 border-t border-line pt-4 text-sm leading-7 text-ink-soft">
                    {snapshot ? (
                      <div className="mb-4 rounded-md bg-cream/70 p-3">
                        <p className="text-xs tracking-[0.18em] text-cinnabar">命盤摘要</p>
                        <p className="mt-2">日主 {snapshot.chart.dayMaster}{snapshot.chart.dayMasterElement} · 月令 {snapshot.chart.monthBranch}</p>
                        <p>{snapshot.chart.pillars.map((p) => p.ganZhi).join("　")}</p>
                        <p className="mt-2">{snapshot.reading.directAnswer}</p>
                      </div>
                    ) : null}
                    {text ? <div className="mb-4 whitespace-pre-wrap">{text}</div> : null}
                    {pages.length ? (
                      <div className="space-y-4">
                        {pages.map((p, i) => (
                          <div key={`${row.id}-${i}`} className="border-t border-line/70 pt-3 first:border-0 first:pt-0">
                            <p className="font-medium text-ink">第 {p.pageNo ?? i + 1} 頁 · {p.title ?? "完整報告"}</p>
                            {(p.body ?? []).map((line, j) => <p key={j} className="mt-1">{line}</p>)}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {!snapshot && !text && !pages.length ? <p className="text-ink-mute">這筆記錄尚未生成可讀內容。</p> : null}
                    {user.isOwner ? (
                      <button
                        type="button"
                        className="mt-5 text-xs text-cinnabar"
                        onClick={async () => {
                          if (!window.confirm("刪除這筆報告？")) return;
                          await deleteReportRecord(session, row.id);
                          setOpenId(null);
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

      <Link to="/" className="inline-flex h-11 items-center rounded-full border border-line bg-cream px-5 text-ink">返回首頁</Link>
    </main>
  );
}
