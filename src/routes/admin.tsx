import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listOwnerReports, type ReportRow } from "@/lib/actions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { highestVersion, ReportRecordView } from "@/components/report-record";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, profile, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [selected, setSelected] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  async function refresh() {
    setLoading(true); setMsg(null);
    try { const data = await listOwnerReports(); setRows(data); if (!selected && data[0]) setSelected(data[0]); }
    catch (err) { setMsg(err instanceof Error ? err.message : "后台读取失败"); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (profile?.isOwner) void refresh(); else setLoading(false); }, [profile?.isOwner]);
  if (isPending) return <div className="h-48 animate-pulse rounded-xl bg-cream/70" />;
  if (!user) return <section className="seal-border rounded-xl bg-cream/95 p-6"><p>请先登录。</p><Link to="/login" className="mt-4 inline-flex rounded-full bg-cinnabar px-4 py-2 text-cream">登录</Link></section>;
  if (!profile?.isOwner) return <section className="seal-border rounded-xl bg-cream/95 p-6"><h1 className="font-display text-2xl">无站主权限</h1><p className="mt-3 text-sm text-ink-soft">站主权限只由数据库登记邮箱识别，不使用前端硬编码密码。</p></section>;

  return (
    <main className="space-y-6">
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs tracking-[0.28em] text-cinnabar">站主后台</p><h1 className="mt-1 font-display text-3xl">所有客户报告</h1><p className="mt-2 text-sm text-ink-soft">点击任一条，直接打开该记录当前可用的最高版本：完整报告 → 九页母稿 → 引擎报告。</p></div><button onClick={() => void refresh()} className="rounded-full border border-line px-4 py-2 text-sm">刷新</button></div></section>
      <section className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="seal-border max-h-[70dvh] overflow-auto rounded-xl bg-cream/95 p-3">
          {loading ? <div className="h-24 animate-pulse rounded-lg bg-paper" /> : rows.length === 0 ? <p className="p-3 text-sm text-ink-mute">目前数据库里还没有客户报告。</p> : rows.map((r) => <button key={r.id} onClick={() => setSelected(r)} className={`mb-2 block w-full rounded-lg border p-3 text-left ${selected?.id === r.id ? "border-cinnabar bg-cinnabar/5" : "border-line bg-paper/40"}`}><p className="truncate text-sm font-medium">{String(r.context?.question ?? r.engine_snapshot?.question ?? r.alias ?? "客户报告")}</p><p className="mt-1 truncate text-xs text-ink-mute">{r.user_email || r.alias || "未绑定邮箱"}</p><p className="mt-1 text-[11px] text-cinnabar">{highestVersion(r)}</p></button>)}
          {msg ? <p className="p-3 text-sm text-cinnabar">{msg}</p> : null}
        </div>
        <div>{selected ? <ReportRecordView row={selected} /> : <div className="seal-border rounded-xl bg-cream/95 p-6 text-sm text-ink-mute">选择一条报告。</div>}</div>
      </section>
    </main>
  );
}
