import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  activateOwnerMusic,
  deleteOwnerMusic,
  deleteOwnerMusicMany,
  loadOwnerMusic,
  renameOwnerMusic,
  uploadOwnerMusic,
  type OwnerMusicTrack,
} from "@/lib/owner-music-client";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;
}

function formatCodec(track: OwnerMusicTrack) {
  if (track.contentType === "audio/mpeg") return "MP3";
  if (track.contentType === "audio/mp4") return "M4A / AAC";
  if (track.contentType === "audio/aac") return "AAC";
  if (track.contentType === "audio/wav") return "WAV";
  if (track.contentType === "audio/flac") return "FLAC";
  return "Audio";
}

export function OwnerBackgroundMusicManager() {
  const { locale } = useI18n();
  const { user } = useCurrentUserState();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [onAccount, setOnAccount] = useState(() => typeof window !== "undefined" && (window.location.pathname === "/account" || window.location.pathname.startsWith("/account/")));
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [tracks, setTracks] = useState<OwnerMusicTrack[]>([]);
  const [busy, setBusy] = useState(false);
  const [percent, setPercent] = useState<number | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const c = useMemo(() => ({
    manage: tr(locale, "背景音樂管理", "背景音乐管理", "Background music"),
    title: tr(locale, "網站背景音樂", "网站背景音乐", "Website background music"),
    upload: tr(locale, "＋ 選擇音樂", "＋ 选择音乐", "+ Choose music"),
    limit: tr(locale, "來源 ≤200MB · 直傳 ≤12MB · 支援分段上傳", "来源 ≤200MB · 直传 ≤12MB · 支持分段上传", "Source ≤200MB · direct ≤12MB · chunked upload"),
    processing: tr(locale, "處理中…", "处理中…", "Processing…"),
    current: tr(locale, "目前播放", "当前播放", "Currently playing"),
    use: tr(locale, "設為背景音樂", "设为背景音乐", "Use as background music"),
    delete: tr(locale, "刪除", "删除", "Delete"),
    rename: tr(locale, "改名", "改名", "Rename"),
    saveName: tr(locale, "保存名稱", "保存名称", "Save name"),
    cancel: tr(locale, "取消", "取消", "Cancel"),
    select: tr(locale, "選取", "选择", "Select"),
    selected: (n: number) => tr(locale, `已選 ${n} 首`, `已选 ${n} 首`, `${n} selected`),
    selectAll: tr(locale, "全選可刪除曲目", "全选可删除曲目", "Select deletable"),
    clearSelection: tr(locale, "取消全選", "取消全选", "Clear selection"),
    deleteSelected: tr(locale, "刪除所選", "删除所选", "Delete selected"),
    batchDeleteConfirm: (n: number) => tr(locale, `刪除已選的 ${n} 首音樂？此操作不可復原。`, `删除已选的 ${n} 首音乐？此操作不可恢复。`, `Delete ${n} selected tracks? This cannot be undone.`),
    renamed: tr(locale, "曲目名稱已更新。", "曲目名称已更新。", "Track name updated."),
    batchDeleted: (n: number) => tr(locale, `已刪除 ${n} 首音樂。`, `已删除 ${n} 首音乐。`, `Deleted ${n} tracks.`),
    activeCannotSelect: tr(locale, "目前播放中的曲目不可批量刪除", "当前播放中的曲目不可批量删除", "The active track cannot be bulk deleted"),
    close: tr(locale, "關閉", "关闭", "Close"),
    refresh: tr(locale, "刷新", "刷新", "Refresh"),
    empty: tr(locale, "尚未有背景音樂。請選擇你要的曲子。", "尚未有背景音乐。请选择你要的曲子。", "No background music yet. Choose a track."),
    changed: tr(locale, "已切換背景音樂。", "已切换背景音乐。", "Background music changed."),
    uploaded: tr(locale, "新音樂已優化、上傳並啟用。", "新音乐已优化、上传并启用。", "The new track was optimized, uploaded and activated."),
    confirmDelete: tr(locale, "刪除這首背景音樂？", "删除这首背景音乐？", "Delete this background track?"),
    loadFailed: tr(locale, "背景音樂讀取失敗。", "背景音乐读取失败。", "Could not load background music."),
  }), [locale]);

  useEffect(() => {
    if (!user?.isOwner) { setPortalTarget(null); return; }
    const sync = () => {
      const active = window.location.pathname === "/account" || window.location.pathname.startsWith("/account/");
      setOnAccount(active);
      setPortalTarget(active ? document.querySelector<HTMLElement>("main > section:first-child") : null);
    };
    sync(); window.addEventListener("popstate", sync); const timer = window.setInterval(sync, 300);
    return () => { window.removeEventListener("popstate", sync); window.clearInterval(timer); };
  }, [user?.isOwner]);

  async function load() {
    if (!user?.isOwner) return;
    try {
      const state = await loadOwnerMusic();
      setTracks(state.tracks);
      const ids = new Set(state.tracks.map((track) => track.id));
      setSelectedIds((current) => current.filter((id) => ids.has(id) && !state.tracks.find((track) => track.id === id)?.enabled));
    }
    catch (error) { setMessage(error instanceof Error ? error.message : c.loadFailed); }
  }

  useEffect(() => { if (open) void load(); }, [open, user?.isOwner]);

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file || !user?.isOwner || busy) return;
    setBusy(true); setMessage(null); setPercent(2); setStage(c.processing);
    try {
      const result = await uploadOwnerMusic(file, (progress) => { setPercent(progress.percent); setStage(progress.label); });
      await load();
      const saved = Math.max(0, result.sourceBytes - result.outputBytes);
      const detail = result.transcoded
        ? ` ${formatSize(result.sourceBytes)} → ${formatSize(result.outputBytes)}${result.bitrateKbps ? ` · AAC ${result.bitrateKbps} kbps` : ""}`
        : ` ${formatSize(result.outputBytes)} · 已保留原格式避免重複有損轉碼`;
      setMessage(`${c.uploaded}${saved > 0 ? detail : detail}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    } finally { setBusy(false); setPercent(null); setStage(null); }
  }

  async function onActivate(track: OwnerMusicTrack) {
    if (busy) return; setBusy(true); setMessage(null);
    try { await activateOwnerMusic(track.id); await load(); setMessage(c.changed); }
    catch (error) { setMessage(error instanceof Error ? error.message : c.loadFailed); }
    finally { setBusy(false); }
  }

  async function onDelete(track: OwnerMusicTrack) {
    if (busy || track.enabled || !window.confirm(c.confirmDelete)) return;
    setBusy(true); setMessage(null);
    try { await deleteOwnerMusic(track.id); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : c.loadFailed); }
    finally { setBusy(false); }
  }

  function toggleSelected(track: OwnerMusicTrack) {
    if (track.enabled) return;
    setSelectedIds((current) => current.includes(track.id) ? current.filter((id) => id !== track.id) : [...current, track.id]);
  }

  function selectAllDeletable() {
    setSelectedIds(tracks.filter((track) => !track.enabled).map((track) => track.id));
  }

  async function onBatchDelete() {
    if (busy || !selectedIds.length || !window.confirm(c.batchDeleteConfirm(selectedIds.length))) return;
    setBusy(true); setMessage(null);
    try {
      const count = selectedIds.length;
      await deleteOwnerMusicMany(selectedIds);
      setSelectedIds([]);
      await load();
      setMessage(c.batchDeleted(count));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    } finally { setBusy(false); }
  }

  function beginRename(track: OwnerMusicTrack) {
    setEditingId(track.id);
    setEditingName(track.name);
  }

  async function saveRename(track: OwnerMusicTrack) {
    if (busy) return;
    const nextName = editingName.trim();
    if (!nextName) return;
    setBusy(true); setMessage(null);
    try {
      await renameOwnerMusic(track.id, nextName);
      setEditingId(null);
      setEditingName("");
      await load();
      setMessage(c.renamed);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    } finally { setBusy(false); }
  }

  if (!user?.isOwner || !onAccount) return null;

  const manager = <>
    <button type="button" data-owner-background-music-manager data-owner-background-music-inline={portalTarget ? "true" : "fallback"}
      className={portalTarget ? "mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-cinnabar/20 bg-gradient-to-br from-paper/80 to-cream/65 px-4 py-4 text-left shadow-sm transition hover:border-cinnabar/35" : "fixed left-3 right-3 z-[88] flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-cinnabar/30 bg-cream/98 px-4 py-3 text-left shadow-xl backdrop-blur"}
      style={portalTarget ? undefined : { top: "max(0.75rem, env(safe-area-inset-top))" }} onClick={() => setOpen(true)}>
      <span className="min-w-0"><span className="block text-[10px] tracking-[0.22em] text-cinnabar">OWNER · AUDIO</span><span className="mt-1 block font-display text-lg text-ink">{c.manage}</span></span>
      <span aria-hidden="true" className="shrink-0 rounded-full bg-cinnabar px-3 py-2 text-sm text-cream">＋</span>
    </button>

    {open ? <div className="fixed inset-0 z-[100] overflow-y-auto bg-ink/35 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label={c.title}>
      <section className="mx-auto max-w-2xl rounded-[1.6rem] border border-line bg-cream p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs tracking-[0.24em] text-cinnabar">OWNER · AUDIO</p><h2 className="mt-2 font-display text-2xl text-ink">{c.title}</h2></div><button type="button" className="rounded-full border border-line bg-paper/60 px-4 py-2 text-xs" onClick={() => setOpen(false)}>{c.close}</button></div>
        <div className="mt-5 flex flex-wrap gap-2">
          <input ref={inputRef} type="file" className="hidden" accept="audio/*,.mp3,.m4a,.aac,.wav,.flac,.ogg,.opus,.aif,.aiff,.caf" onChange={(event) => void onUpload(event)} />
          <button type="button" disabled={busy} className="min-h-11 rounded-full bg-cinnabar px-5 text-sm text-cream disabled:opacity-50" onClick={() => inputRef.current?.click()}>{busy ? c.processing : c.upload}</button>
          <button type="button" disabled={busy} className="min-h-11 rounded-full border border-line bg-paper/60 px-4 text-sm text-ink-soft disabled:opacity-50" onClick={() => void load()}>{c.refresh}</button>
        </div>
        <p className="mt-2 text-[11px] text-ink-mute">{c.limit}</p>
        {percent != null ? <div className="mt-4 border-y border-line/60 py-3" aria-live="polite"><div className="flex items-center justify-between gap-3 text-xs text-ink-soft"><span>{stage || c.processing}</span><span>{percent}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-deep"><span className="block h-full bg-wood transition-[width]" style={{ width: `${percent}%` }} /></div></div> : null}
        {message ? <p className="mt-4 border-l-2 border-cinnabar/55 pl-3 text-sm leading-6 text-cinnabar">{message}</p> : null}
        {selectedIds.length ? <div data-owner-bulk-toolbar="music" className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-paper/45 px-3 py-3">
          <span className="text-xs font-medium text-ink-soft">{c.selected(selectedIds.length)}</span>
          <button type="button" disabled={busy} className="min-h-10 rounded-full border border-line bg-cream px-3 text-xs disabled:opacity-40" onClick={selectAllDeletable}>{c.selectAll}</button>
          <button type="button" disabled={busy || !selectedIds.length} className="min-h-10 rounded-full border border-line bg-cream px-3 text-xs disabled:opacity-40" onClick={() => setSelectedIds([])}>{c.clearSelection}</button>
          <button type="button" disabled={busy || !selectedIds.length} className="min-h-10 rounded-full bg-cinnabar px-4 text-xs text-cream disabled:opacity-40" onClick={() => void onBatchDelete()}>{c.deleteSelected}</button>
        </div> : null}
        <div className="mt-5 space-y-3">
          {!tracks.length ? <p className="text-sm text-ink-mute">{c.empty}</p> : null}
          {tracks.map((track) => <article key={track.id} data-owner-selectable-file="music" className={`border-t border-line/70 pt-4 ${selectedIds.includes(track.id) ? "rounded-xl bg-cinnabar/[0.035] px-3 pb-3" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <label className={`mt-0.5 grid min-h-11 min-w-11 place-items-center rounded-full border border-line bg-paper/60 ${track.enabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`} title={track.enabled ? c.activeCannotSelect : c.select}>
                  <input type="checkbox" className="h-4 w-4" disabled={busy || track.enabled} checked={selectedIds.includes(track.id)} onChange={() => toggleSelected(track)} aria-label={`${c.select} ${track.name}`} />
                </label>
                <div className="min-w-0 flex-1">
                  {editingId === track.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input autoFocus value={editingName} maxLength={80} onChange={(event) => setEditingName(event.target.value)} onKeyDown={(event) => {
                        if (event.key === "Enter") void saveRename(track);
                        if (event.key === "Escape") { setEditingId(null); setEditingName(""); }
                      }} className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-cream px-3 text-base text-ink outline-none focus:border-cinnabar" aria-label={c.rename} />
                      <button type="button" disabled={busy || !editingName.trim()} className="min-h-11 rounded-full bg-wood px-3 text-xs text-cream disabled:opacity-40" onClick={() => void saveRename(track)}>{c.saveName}</button>
                      <button type="button" disabled={busy} className="min-h-11 rounded-full border border-line px-3 text-xs" onClick={() => { setEditingId(null); setEditingName(""); }}>{c.cancel}</button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-medium text-ink">{track.name}</h3>{track.enabled ? <span className="rounded-full border border-emerald-700/25 bg-emerald-700/5 px-2.5 py-1 text-[11px] text-emerald-800">{c.current}</span> : null}</div>
                  )}
                  <p className="mt-1 text-xs text-ink-mute">{formatCodec(track)} · {formatSize(track.fileSize)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!track.enabled ? <button type="button" disabled={busy} className="min-h-10 rounded-full bg-wood px-3 text-xs text-cream disabled:opacity-50" onClick={() => void onActivate(track)}>{c.use}</button> : null}
                <button type="button" disabled={busy || editingId === track.id} className="min-h-10 rounded-full border border-line bg-paper/60 px-3 text-xs text-ink-soft disabled:opacity-40" onClick={() => beginRename(track)}>{c.rename}</button>
                <button type="button" disabled={busy || track.enabled} className="min-h-10 rounded-full px-3 text-xs text-cinnabar disabled:opacity-30" onClick={() => void onDelete(track)}>{c.delete}</button>
              </div>
            </div>
            <audio className="mt-3 w-full" controls preload="none"><source src={track.url} type={track.contentType || "audio/mpeg"} /></audio>
          </article>)}
        </div>
      </section>
    </div> : null}
  </>;

  return portalTarget ? createPortal(manager, portalTarget) : manager;
}
