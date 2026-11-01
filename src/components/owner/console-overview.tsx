import type { ReportListRecord } from "@/lib/bridge/supabase-rest";

export type OverviewTarget = "reports" | "articles" | "music" | "images" | "opening" | "themes" | "promo" | "devices";
function dateText(value: string) {
  return new Date(value).toLocaleString("zh-TW", { timeZone: "Australia/Sydney", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}
export function ConsoleOverview({ reports, hasMoreReports, reportsLoading, onNavigate }: {
  reports: ReportListRecord[];
  hasMoreReports: boolean;
  reportsLoading: boolean;
  onNavigate: (target: OverviewTarget) => void;
}) {
  const frequent: [OverviewTarget, string, string][] = [
    ["articles", "文章管理", "編輯三語文章、管理公開狀態"],
    ["music", "上傳音樂", "上傳、試聽與啟用背景音樂"],
    ["images", "圖片與背景", "管理網站圖片、背景與圖庫"],
    ["opening", "影片素材", "查看目前影片並上傳新影片"],
  ];
  return (
    <div className="space-y-4" data-console-overview>
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <p className="text-xs tracking-[0.22em] text-cinnabar">CONTENT · MEDIA</p>
        <h2 className="mt-2 font-display text-xl">內容與素材</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">文章、音樂、圖片與影片集中在這裡；音樂上傳不再藏在圖片管理裡。</p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {frequent.map(([target, label, hint]) => (
            <button key={target} type="button" onClick={() => onNavigate(target)}
              className="flex min-h-24 flex-col items-start justify-center rounded-xl border border-line bg-paper/70 px-3 py-3 text-left transition hover:border-wood focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wood">
              <span className="font-display text-base font-semibold text-ink">{label}</span>
              <span className="mt-1 text-xs leading-5 text-ink-mute">{hint}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
        <h2 className="font-display text-xl">客戶報告</h2>
        {reportsLoading ? <div className="mt-3 h-16 animate-pulse rounded-lg bg-paper-deep" /> : (
          <>
            <p className="mt-3 text-3xl font-display text-ink">{reports.length}{hasMoreReports ? "+" : ""}<span className="ml-1 text-sm text-ink-mute">筆已載入</span></p>
            <ul className="mt-3 space-y-1 text-sm text-ink-soft">
              {reports.slice(0, 3).map(row => <li key={row.id} className="truncate">{dateText(row.created_at)}　{row.alias || String(row.context?.question ?? "昭梧報告")}</li>)}
              {!reports.length ? <li className="text-ink-mute">目前沒有已載入的報告。</li> : null}
            </ul>
          </>
        )}
        <button type="button" onClick={() => onNavigate("reports")} className="mt-4 min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink">查看客戶報告</button>
      </section>
      <details className="seal-border rounded-xl bg-cream/95 p-5">
        <summary className="cursor-pointer font-display text-lg text-ink">其他營運及設定</summary>
        <div className="mt-4 flex flex-wrap gap-2">
          {([["promo", "優惠碼"], ["themes", "主題皮膚"], ["devices", "登入與裝置"]] as [OverviewTarget, string][]).map(([target, label]) => (
            <button key={target} type="button" onClick={() => onNavigate(target)} className="min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink">{label}</button>
          ))}
        </div>
      </details>
      <a href="https://app.metricool.com/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-line bg-cream/95 px-4 text-sm text-ink">社群排程：Metricool</a>
    </div>
  );
}
