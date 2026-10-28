import type { ReportListRecord } from "@/lib/bridge/supabase-rest";

export type OverviewTarget = "reports" | "images" | "opening" | "themes";
function dateText(value: string) {
  return new Date(value).toLocaleString("zh-TW", { timeZone: "Australia/Sydney", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}
export function ConsoleOverview({ reports, hasMoreReports, reportsLoading, onNavigate }: {
  reports: ReportListRecord[];
  hasMoreReports: boolean;
  reportsLoading: boolean;
  onNavigate: (target: OverviewTarget) => void;
}) {
  return (
    <div className="space-y-5" data-console-overview>
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <h2 className="font-display text-xl">客戶報告</h2>
        {reportsLoading ? <div className="mt-3 h-16 animate-pulse rounded-lg bg-paper-deep" /> : (
          <>
            <p className="mt-3 text-3xl font-display text-ink">{reports.length}{hasMoreReports ? "+" : ""}<span className="ml-1 text-sm text-ink-mute">筆已上傳</span></p>
            <ul className="mt-3 space-y-1 text-sm text-ink-soft">
              {reports.slice(0, 3).map(row => <li key={row.id} className="truncate">{dateText(row.created_at)}　{row.alias || String(row.context?.question ?? "昭梧報告")}</li>)}
              {!reports.length ? <li className="text-ink-mute">還沒有客戶報告。</li> : null}
            </ul>
          </>
        )}
        <button type="button" onClick={() => onNavigate("reports")} className="mt-4 min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink">查看全部報告</button>
      </section>
      <section className="seal-border rounded-xl bg-cream/95 p-5">
        <h3 className="font-display text-lg">網站外觀與內容</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {([["images", "背景與圖片"], ["opening", "影片素材"], ["themes", "主題皮膚"]] as [OverviewTarget, string][]).map(([target, label]) => (
            <button key={target} type="button" onClick={() => onNavigate(target)} className="min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink">{label}</button>
          ))}
        </div>
      </section>
      <a href="https://app.metricool.com/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-line bg-cream/95 px-4 text-sm text-ink">外部社群排程：Metricool</a>
    </div>
  );
}
