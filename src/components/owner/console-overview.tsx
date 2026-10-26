import { useEffect, useState } from "react";
import {
  META_ACCOUNTS_UNAVAILABLE,
  THREADS_ACCOUNTS_UNAVAILABLE,
  overviewWarningText,
  pendingManualChannels,
  readAutopublishOverview,
  type AutopublishOverview,
} from "@/lib/owner-autopublish-client";
import type { ReportListRecord } from "@/lib/bridge/supabase-rest";

export type OverviewTarget = "reports" | "autopublish" | "images" | "opening" | "themes";

type Todo = { tone: "bad" | "warn" | "ok"; text: string; go?: OverviewTarget; cta?: string };

const TONE = {
  bad: "border-cinnabar/35 bg-cinnabar/5",
  warn: "border-amber-700/30 bg-amber-600/5",
  ok: "border-emerald-700/25 bg-emerald-700/5",
} as const;

function dateText(value: string) {
  return new Date(value).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

/** First screen of the owner console: what is running, what needs the owner, shortcuts. */
export function ConsoleOverview({ reports, hasMoreReports, reportsLoading, onNavigate }: {
  reports: ReportListRecord[];
  hasMoreReports: boolean;
  reportsLoading: boolean;
  onNavigate: (target: OverviewTarget) => void;
}) {
  const [auto, setAuto] = useState<AutopublishOverview | null>(null);
  const [autoError, setAutoError] = useState("");

  useEffect(() => {
    let alive = true;
    void readAutopublishOverview().then((value) => { if (alive) { setAuto(value); setAutoError(""); } }).catch((error) => { if (alive) setAutoError(error instanceof Error ? error.message.slice(0, 160) : "Unknown error"); });
    return () => { alive = false; };
  }, []);

  const todos: Todo[] = [];
  if (autoError) todos.push({ tone: "bad", text: `讀不到自動發佈狀態（${autoError}）。`, go: "autopublish", cta: "打開檢查" });
  else if (auto && !auto.configured) todos.push({ tone: "bad", text: "自動發佈尚未啟用（伺服器未設定佇列密鑰）。", go: "autopublish", cta: "查看" });
  else if (auto?.settings) {
    const warnings = auto.warnings ?? [];
    const accountsUnverified = warnings.includes(THREADS_ACCOUNTS_UNAVAILABLE) || warnings.includes(META_ACCOUNTS_UNAVAILABLE);
    const anyAutomatic = Boolean(auto.channels?.threads || auto.channels?.instagram || auto.channels?.facebook);
    // A failed account lookup is not evidence that nothing is connected.
    if (!anyAutomatic && !accountsUnverified) todos.push({ tone: "bad", text: "還沒有連接可自動發布的平台。", go: "autopublish", cta: "連接 Meta / Threads" });
    for (const code of warnings) todos.push({ tone: "warn", text: overviewWarningText(code), go: "autopublish", cta: "查看" });
    if (!auto.settings.enabled) todos.push({ tone: "warn", text: "自動發佈目前是暫停狀態。", go: "autopublish", cta: "前往開啟" });
    const manual = (auto.items ?? []).filter((item) => pendingManualChannels(item).length > 0).length;
    if (manual) todos.push({ tone: "warn", text: `有 ${manual} 則貼文等你手動發到小紅書 / X。`, go: "autopublish", cta: "去處理" });
    const lastFail = (auto.items ?? []).find((item) => item.status === "failed" || item.status === "partial");
    if (lastFail) todos.push({ tone: "bad", text: `最近一次發佈${lastFail.status === "failed" ? "失敗" : "只成功一部分"}：${lastFail.last_error || "請看紀錄"}`, go: "autopublish", cta: "查看紀錄" });
    if (anyAutomatic && auto.settings.enabled && !manual && !lastFail && !warnings.length) todos.push({ tone: "ok", text: `自動發佈正常，下一次：${auto.schedule?.upcoming?.[0] ?? "—"}。` });
  }
  if (!todos.length && !auto && !autoError) todos.push({ tone: "warn", text: "讀取中…" });

  const posted = (auto?.items ?? []).filter((item) => item.status === "published" || item.status === "partial");
  const lastPosted = posted[0];

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
          <h3 className="font-display text-lg">自動發佈</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-ink-mute">狀態</dt><dd>{auto?.settings ? (auto.settings.enabled ? "運作中" : "已暫停") : "—"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-mute">頻率</dt><dd>{auto?.settings ? `每週 ${auto.settings.publish_days.length} 次` : "—"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-mute">上次發布</dt><dd>{lastPosted ? dateText(lastPosted.published_at ?? lastPosted.created_at) : "尚未發布"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-mute">內容庫</dt><dd>{auto?.bank ? `${auto.bank.total} 則輪播` : "—"}</dd></div>
          </dl>
          <button type="button" onClick={() => onNavigate("autopublish")} className="mt-4 min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink">管理自動發佈</button>
        </section>

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
      </div>

      <section className="seal-border rounded-xl bg-cream/95 p-5">
        <h3 className="font-display text-lg">網站外觀與內容</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {([["images", "背景與圖片"], ["opening", "影片素材"], ["themes", "主題皮膚"]] as [OverviewTarget, string][]).map(([target, label]) => (
            <button key={target} type="button" onClick={() => onNavigate(target)} className="min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink">{label}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
