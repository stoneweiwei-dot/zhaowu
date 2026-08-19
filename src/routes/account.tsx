import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { deleteReport, getUsageSummary, listReports, loadReport, type ReportRow, type UsageSummary } from "@/lib/actions";
import type { SavedReport } from "@/lib/bazi/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ReportRecordView } from "@/components/report-record";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { user, profile, isPending } = useCurrentUserState();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [selected, setSelected] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    try {
      const [r, u] = await Promise.all([listReports(), getUsageSummary()]);
      setReports(r); setUsage(u);
    } catch (err) { setMsg(err instanceof Error ? err.message : "读取失败"); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (user) void refresh(); else setLoading(false); }, [user?.id]);

  if (isPending) return <div className="h-48 animate-pulse rounded-xl bg-cream/70" />;
  if (!user) return <section className="seal-border rounded-xl bg-cream/95 p-6"><h1 className="font-display text-2xl">我的昭梧</h1><p className="mt-3 text-sm text-ink-soft">登录后查看出生档案和历史报告。</p><Link to="/login" className="mt-5 inline-flex rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">去登录</Link></section>;

  return (
    <main className="space-y-6">
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.28em] text-cinnabar">我的昭梧</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-display text-3xl">{profile?.displayName || user.email}</h1><p className="mt-1 text-sm text-ink-mute">{user.email}</p></div>{profile?.isOwner ? <Link to="/admin" className="rounded-full bg-ink px-4 py-2 text-sm text-cream">进入站主后台</Link> : null}</div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-paper p-4"><p className="text-xs text-ink-mute">今日免费提问剩余</p><p className="mt-1 font-display text-2xl">{usage?.owner ? "∞" : usage?.questionRemaining ?? "—"}</p></div><div className="rounded-lg bg-paper p-4"><p className="text-xs text-ink-mute">今日免费报告剩余</p><p className="mt-1 font-display text-2xl">{usage?.owner ? "∞" : usage?.reportRemaining ?? "—"}</p></div><div className="rounded-lg bg-paper p-4"><p className="text-xs text-ink-mute">出生资料</p><p className="mt-1 text-sm">{profile?.birthData ? "已保存，会自动回填" : "尚未保存"}</p></div></div>
      </section>

      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <div className="flex items-center justify-between"><div><p className="text-xs tracking-[0.28em] text-cinnabar">历史报告</p><h2 className="mt-1 font-display text-2xl">按时间倒序</h2></div><button onClick={() => void refresh()} className="rounded-full border border-line px-4 py-2 text-xs">刷新</button></div>
        {loading ? <div className="mt-4 h-24 animate-pulse rounded-lg bg-paper" /> : reports.length === 0 ? <p className="mt-4 text-sm text-ink-mute">账号内还没有报告。</p> : <div className="mt-4 space-y-2">{reports.map((r) => <div key={r.id} className="flex items-center gap-3 rounded-lg border border-line bg-paper/40 p-3"><button className="min-w-0 flex-1 text-left" onClick={() => void loadReport({ data: r.id }).then(setSelected).catch((e) => setMsg(e.message))}><p className="truncate text-sm font-medium">{r.question}</p><p className="mt-1 text-xs text-ink-mute">{new Date(r.createdAt).toLocaleString()} · {r.hasFullReport ? "完整报告" : "引擎记录"}</p></button><button onClick={() => void deleteReport({ data: r.id }).then(() => { if (selected?.id === r.id) setSelected(null); return refresh(); }).catch((e) => setMsg(e.message))} className="rounded-full px-3 py-2 text-xs text-ink-mute hover:text-cinnabar">删除</button></div>)}</div>}
        {msg ? <p className="mt-3 text-sm text-cinnabar">{msg}</p> : null}
      </section>
      {selected ? <ReportRecordView row={selected} /> : null}
    </main>
  );
}
