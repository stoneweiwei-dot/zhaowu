import type { ReportRow } from "@/lib/actions";

type PageLike = { pageNo?: number; title?: string; body?: string[] };

function pagesFrom(value: unknown): PageLike[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((x) => x && typeof x === "object") as PageLike[];
}

export function highestVersion(row: ReportRow): string {
  const paid = row.paid_report as { fullReport?: unknown; ninePages?: unknown } | null;
  if (paid && (typeof paid.fullReport === "string" || Array.isArray(paid.ninePages))) return "最高版 · 完整报告";
  if (Array.isArray(row.mother_draft)) return "九页母稿";
  if (row.engine_snapshot?.reading) return "引擎报告";
  return "原始记录";
}

export function ReportRecordView({ row }: { row: ReportRow }) {
  const paid = row.paid_report as { fullReport?: unknown; ninePages?: unknown } | null;
  const paidPages = pagesFrom(paid?.ninePages);
  const motherPages = pagesFrom(row.mother_draft);
  const pages = paidPages ?? motherPages;
  const full = typeof paid?.fullReport === "string" ? paid.fullReport : null;
  const snapshot = row.engine_snapshot;
  return (
    <article className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs tracking-[0.2em] text-cinnabar">{highestVersion(row)}</p>
          <h3 className="mt-1 font-display text-xl">{String(row.context?.question ?? snapshot?.question ?? "昭梧报告")}</h3>
        </div>
        <p className="text-xs text-ink-mute">{new Date(row.updated_at).toLocaleString()}</p>
      </div>
      {full ? <div className="mt-5 whitespace-pre-wrap text-sm leading-8 text-ink-soft">{full}</div> : null}
      {pages ? <div className="mt-5 space-y-6">{pages.map((p, i) => <section key={i} className="border-t border-line pt-4 first:border-0"><p className="text-xs tracking-[0.16em] text-cinnabar">第 {p.pageNo ?? i + 1} 页｜{p.title ?? "报告"}</p><div className="mt-2 space-y-2 text-sm leading-7 text-ink-soft">{(p.body ?? []).map((line, j) => <p key={j}>{line}</p>)}</div></section>)}</div> : null}
      {!full && !pages && snapshot ? <div className="mt-5 space-y-4 text-sm leading-7 text-ink-soft"><p className="font-display text-lg text-ink">{snapshot.reading.directAnswer}</p><p>{snapshot.reading.rhythm}</p><p className="text-cinnabar">{snapshot.reading.decree}</p><p>{snapshot.reading.action}</p></div> : null}
      {!full && !pages && !snapshot ? <pre className="mt-5 overflow-auto whitespace-pre-wrap text-xs leading-6 text-ink-soft">{JSON.stringify(row.context ?? {}, null, 2)}</pre> : null}
    </article>
  );
}
