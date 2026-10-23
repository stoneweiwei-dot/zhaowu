import type { ReportListRecord } from "@/lib/bridge/supabase-rest";

export type OverviewTarget = "reports" | "images" | "opening" | "themes";

type Todo = { tone: "bad" | "warn" | "ok"; text: string; go?: OverviewTarget; cta?: string };

const TONE = {
  bad: "border-cinnabar/35 bg-cinnabar/5",
  warn: "border-amber-700/30 bg-amber-600/5",
  ok: "border-emerald-700/25 bg-emerald-700/5",
} as const;

function dateText(value: string) {
  return new Date(value).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

/** First screen of the owner console: reports and the site tools that remain active. */
export function ConsoleOverview({ reports, hasMoreReports, reportsLoading, onNavigate }: {
  reports: ReportListRecord[];
  hasMoreReports: boolean;
  reportsLoading: boolean;
  onNavigate: (target: OverviewTarget) => void;
}) {
  const todos: Todo[] = reports.length
    ? [{ tone: "ok", text: `目前有 ${reports.length}${hasMoreReports ? "+" : ""} 筆客戶報告可管理。` }]
    : [{ tone: "warn", text: "目前還沒有客戶報告；先把網站與單次付款流程準備好。" }];

  return (
    <div className="space-y-5" data-console-overview>
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.28em] text-cinnabar">TODAY</p>
        <h2 className="mt-1 font-display text-2xl">需要你注意的事</h2>
        <ul className="mt-4 space-y-2">
          {todos.map((todo, index) => (
            <li key={index} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${TONE[todo.tone]}`}>
              <span className="min-w-0 flex-1 text-sm leading-6 text-ink">{todo.text}</span>
              {todo.go ? <button type="button" onClick={() => onNavigate(todo.go!)} className="min-h-11 shrink-0 rounded-full border border-line bg-cream px-4 text-sm text-ink">{todo.cta}</button> : null}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <section className="seal-border rounded-xl bg-cream/95 p-5">
          <h3 className="font-display text-lg">客戶報告</h3>
          {reportsLoading ? <div className="mt-3 h-16 animate-pulse rounded-lg bg-paper-deep" /> : (
            <>
              <p className="mt-3 text-3xl font-display text-ink">{reports.length}{hasMoreReports ? "+" : ""}<span className="ml-1 text-sm text-ink-mute">筆已上傳</span></p>
              <ul className="mt-3 space-y-1 text-sm text-ink-soft">
                {reports.slice(0, 3).map((row) => <li key={row.id} className="truncate">{dateText(row.created_at)}　{row.alias || String(row.context?.question ?? "昭梧報告")}</li>)}
                {!reports.length ? <li className="text-ink-mute">還沒有客戶報告。</li> : null}
              </ul>
            </>
          )}
          <button type="button" onClick={() => onNavigate("reports")} className="mt-4 min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink">查看全部報告</button>
        </section>

        <section className="seal-border rounded-xl bg-cream/95 p-5">
          <h3 className="font-display text-lg">網站外觀與內容</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {([["images", "背景與圖片"], ["opening", "開場影片"], ["themes", "主題皮膚"]] as [OverviewTarget, string][]).map(([target, label]) => (
              <button key={target} type="button" onClick={() => onNavigate(target)} className="min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink">{label}</button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
