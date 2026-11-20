import { useState } from "react";
import { ownerData } from "@/lib/owner-data-client";
import type { ReportSection } from "@/lib/report/focused-report";

type HistoryItem = { version: number; kind: "original" | "edit" | "restore"; note: string; restored_from: number | null; created_at: string };

const KIND: Record<HistoryItem["kind"], string> = { original: "原始版本", edit: "修改", restore: "還原" };

function errorText(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "NO_STORED_SECTIONS") return "這份報告沒有已存的章節文字，無法編輯。";
  if (code === "EDIT_CONFLICT") return "同時有另一個修改，請重新讀取後再試。";
  if (code === "SECTION_LINE_TOO_LONG" || code === "SECTION_TOO_LONG") return "內容太長，請分成幾段。";
  if (code === "INVALID_SECTION_TITLE") return "章節標題不能是空白，也不能超過 120 字。";
  if (code === "OWNER_UNAUTHORIZED") return "登入已失效，請重新登入。";
  return code ? `操作失敗（${code}）。` : "操作失敗，請稍後再試。";
}

const when = (iso: string) => new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false });
const bodyText = (section: ReportSection) => (section.body ?? []).join("\n\n");
const toLines = (value: string) => value.split(/\n{2,}/).map((line) => line.trim()).filter(Boolean);

/** Owner-only editor for the stored text of a report. Original text is never overwritten: every save is a history version. */
export function ReportEditor({ reportId, sections, onChanged }: { reportId: string; sections: ReportSection[]; onChanged: () => void | Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [bodies, setBodies] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<HistoryItem[] | null>(null);

  function begin() {
    setTitles(sections.map((section) => section.title ?? ""));
    setBodies(sections.map(bodyText));
    setNote("");
    setMessage("");
    setOpen(true);
  }

  async function save() {
    const edits = sections.flatMap((section, index) => {
      const title = titles[index]?.trim() ?? "";
      const body = toLines(bodies[index] ?? "");
      const titleChanged = title !== (section.title ?? "").trim();
      const bodyChanged = body.join("\n\n") !== (section.body ?? []).join("\n\n");
      if (!titleChanged && !bodyChanged) return [];
      return [{ index, ...(titleChanged ? { title } : {}), ...(bodyChanged ? { body } : {}) }];
    });
    if (!edits.length) { setMessage("沒有任何修改。"); return; }
    setBusy(true);
    setMessage("");
    try {
      await ownerData("report.edit", { id: reportId, edits, note });
      setOpen(false);
      setHistory(null);
      await onChanged();
    } catch (error) {
      setMessage(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  async function loadHistory() {
    setBusy(true);
    setMessage("");
    try {
      const out = await ownerData<{ ok: true; items: HistoryItem[] }>("report.history", { id: reportId });
      setHistory(out.items);
    } catch (error) {
      setMessage(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  async function restore(version: number) {
    const label = version === 0 ? "原始版本" : `第 ${version} 版`;
    if (!window.confirm(`把這份報告還原到「${label}」？目前的內容會留在修改紀錄裡，之後還能再還原回來。`)) return;
    setBusy(true);
    setMessage("");
    try {
      await ownerData("report.restore", { id: reportId, version });
      setOpen(false);
      setHistory(null);
      await onChanged();
    } catch (error) {
      setMessage(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  const latest = history?.[0]?.version;

  return (
    <div className="mb-4 rounded-lg border border-line bg-paper/50 p-3" data-owner-report-editor>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy || !sections.length} onClick={open ? () => setOpen(false) : begin} className="min-h-11 rounded-full border border-line bg-cream/80 px-4 text-sm text-ink-soft disabled:opacity-50">
          {open ? "取消編輯" : "編輯報告文字"}
        </button>
        <button type="button" disabled={busy} onClick={() => void (history ? setHistory(null) : loadHistory())} className="min-h-11 rounded-full border border-line bg-cream/80 px-4 text-sm text-ink-soft disabled:opacity-50">
          {history ? "收起修改紀錄" : "修改紀錄／還原"}
        </button>
      </div>
      {!sections.length ? <p className="mt-2 text-xs text-ink-mute">這份報告沒有已存的章節文字，無法編輯。</p> : null}
      {message ? <p className="mt-2 text-sm text-cinnabar" role="alert">{message}</p> : null}

      {open ? (
        <div className="mt-3 space-y-4">
          <p className="text-xs text-ink-mute">只修改文字。命盤、排盤與計算結果不會被更動；段落之間空一行。每次儲存都會留下一個版本，原始版本永遠保留。</p>
          {sections.map((section, index) => (
            <div key={`${section.key}-${index}`} className="space-y-1.5 border-t border-line/70 pt-3">
              <label className="block text-xs text-ink-mute">第 {index + 1} 章標題
                <input value={titles[index] ?? ""} onChange={(event) => setTitles((prev) => prev.map((value, i) => (i === index ? event.target.value : value)))} maxLength={120} className="mt-1 min-h-11 w-full rounded-lg border border-line bg-cream/80 px-3 text-base text-ink" />
              </label>
              <label className="block text-xs text-ink-mute">內容
                <textarea value={bodies[index] ?? ""} onChange={(event) => setBodies((prev) => prev.map((value, i) => (i === index ? event.target.value : value)))} rows={Math.min(14, Math.max(4, (bodies[index] ?? "").split("\n").length + 1))} className="mt-1 w-full rounded-lg border border-line bg-cream/80 px-3 py-2 text-base leading-relaxed text-ink" />
              </label>
            </div>
          ))}
          <label className="block text-xs text-ink-mute">這次修改的備註（選填）
            <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={200} className="mt-1 min-h-11 w-full rounded-lg border border-line bg-cream/80 px-3 text-base text-ink" />
          </label>
          <button type="button" disabled={busy} onClick={() => void save()} className="min-h-11 rounded-full bg-wood px-6 text-sm font-medium text-cream disabled:opacity-50">
            {busy ? "儲存中…" : "儲存修改"}
          </button>
        </div>
      ) : null}

      {history ? (
        <ul className="mt-3 space-y-2" data-owner-report-history>
          {history.length === 0 ? <li className="text-sm text-ink-mute">這份報告還沒有任何修改。</li> : null}
          {history.map((item) => (
            <li key={item.version} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line/70 pt-2 text-sm">
              <span className="font-medium text-ink">{item.version === 0 ? "原始版本" : `第 ${item.version} 版`}</span>
              <span className="text-ink-mute">{KIND[item.kind]}・{when(item.created_at)}</span>
              {item.note ? <span className="text-ink-soft">{item.note}</span> : null}
              {item.version === latest ? <span className="rounded-full border border-wood/40 bg-wood/10 px-2 py-0.5 text-[11px] text-wood">目前使用</span> : (
                <button type="button" disabled={busy} onClick={() => void restore(item.version)} className="ml-auto min-h-11 rounded-full border border-line px-4 text-sm text-ink-soft disabled:opacity-50">還原到這版</button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
