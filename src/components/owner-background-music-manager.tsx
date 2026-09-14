import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  activateOwnerMusic,
  deleteOwnerMusic,
  loadOwnerMusic,
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

  const c = useMemo(() => ({
    manage: tr(locale, "背景音樂管理", "背景音乐管理", "Background music"),
    title: tr(locale, "網站背景音樂", "网站背景音乐", "Website background music"),
    lead: tr(
      locale,
      "直接選原始音樂即可。昭梧會先在你的裝置上判斷格式；WAV、FLAC、大型 MP3 等會自動轉成 iPhone／Safari 穩定的 AAC-LC / M4A，並在保持背景播放聽感的前提下把檔案壓到安全上傳大小，再保存及全站啟用。",
      "直接选择原始音乐即可。昭梧会先在你的设备上判断格式；WAV、FLAC、大型 MP3 等会自动转成 iPhone／Safari 稳定的 AAC-LC / M4A，并在保持背景播放听感的前提下压到安全上传大小，再保存及全站启用。",
      "Choose the original track. Zhaowu optimizes it on your device, converting large or lossless files to Safari-safe AAC-LC/M4A at the highest bitrate that fits the upload path, then saves and activates it site-wide.",
    ),
    entryLead: tr(locale, "站主專用 · 自動轉碼、壓縮、上傳、切換", "站主专用 · 自动转码、压缩、上传、切换", "Owner only · optimize, upload and switch music"),
    upload: tr(locale, "＋ 選擇音樂", "＋ 选择音乐", "+ Choose music"),
    processing: tr(locale, "處理中…", "处理中…", "Processing…"),
    current: tr(locale, "目前播放", "当前播放", "Currently playing"),
    use: tr(locale, "設為背景音樂", "设为背景音乐", "Use as background music"),
    delete: tr(locale, "刪除", "删除", "Delete"),
    close: tr(locale, "關閉", "关闭", "Close"),
    refresh: tr(locale, "刷新", "刷新", "Refresh"),
    empty: tr(locale, "尚未有背景音樂。請選擇你要的曲子。", "尚未有背景音乐。请选择你要的曲子。", "No background music yet. Choose a track."),
    changed: tr(locale, "已切換背景音樂。", "已切换背景音乐。", "Background music changed."),
    uploaded: tr(locale, "新音樂已優化、上傳並啟用。", "新音乐已优化、上传并启用。", "The new track was optimized, uploaded and activated."),
    confirmDelete: tr(locale, "刪除這首背景音樂？", "删除这首背景音乐？", "Delete this background track?"),
    loadFailed: tr(locale, "背景音樂讀取失敗。", "背景音乐读取失败。", "Could not load background music."),
    formatHint: tr(locale, "可直接選一般音訊原檔，來源檔最高 200 MB。已經很小且相容的 MP3／M4A 會保留原音質；其他格式自動轉 AAC/M4A。極端超長曲目若壓到最低安全品質仍無法容納，才會要求裁短。", "可直接选择一般音频原文件，来源文件最高 200 MB。已经很小且兼容的 MP3／M4A 会保留原音质；其他格式自动转 AAC/M4A。极端超长曲目若压到最低安全质量仍无法容纳，才会要求裁短。", "Select a normal audio source up to 200 MB. Small compatible MP3/M4A files stay untouched; other formats are converted automatically. Only exceptionally long tracks that still cannot fit safely after compression need trimming."),
    pipeline: tr(locale, "讀取原檔 → 自動判斷／轉 AAC → 尺寸優化 → 上傳曲庫 → 全站啟用", "读取原文件 → 自动判断／转 AAC → 尺寸优化 → 上传曲库 → 全站启用", "Read source → optimize/convert AAC → size-fit → upload → activate"),
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
    try { const state = await loadOwnerMusic(); setTracks(state.tracks); }
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

  if (!user?.isOwner || !onAccount) return null;

  const manager = <>
    <button type="button" data-owner-background-music-manager data-owner-background-music-inline={portalTarget ? "true" : "fallback"}
      className={portalTarget ? "mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-cinnabar/20 bg-gradient-to-br from-paper/80 to-cream/65 px-4 py-4 text-left shadow-sm transition hover:border-cinnabar/35" : "fixed left-3 right-3 z-[88] flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-cinnabar/30 bg-cream/98 px-4 py-3 text-left shadow-xl backdrop-blur"}
      style={portalTarget ? undefined : { top: "max(0.75rem, env(safe-area-inset-top))" }} onClick={() => setOpen(true)}>
      <span className="min-w-0"><span className="block text-[10px] tracking-[0.22em] text-cinnabar">OWNER · AUDIO</span><span className="mt-1 block font-display text-lg text-ink">{c.manage}</span><span className="mt-1 block text-xs leading-5 text-ink-mute">{c.entryLead}</span></span>
      <span aria-hidden="true" className="shrink-0 rounded-full bg-cinnabar px-3 py-2 text-sm text-cream">＋</span>
    </button>

    {open ? <div className="fixed inset-0 z-[100] overflow-y-auto bg-ink/35 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label={c.title}>
      <section className="mx-auto max-w-2xl rounded-[1.6rem] border border-line bg-cream p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs tracking-[0.24em] text-cinnabar">OWNER · AUDIO</p><h2 className="mt-2 font-display text-2xl text-ink">{c.title}</h2></div><button type="button" className="rounded-full border border-line bg-paper/60 px-4 py-2 text-xs" onClick={() => setOpen(false)}>{c.close}</button></div>
        <div className="mt-4 border-y border-line/70 py-4"><p className="text-sm leading-7 text-ink-soft">{c.lead}</p><p className="mt-2 text-xs leading-6 text-ink-mute">{c.formatHint}</p><p className="mt-2 text-[11px] tracking-[0.08em] text-cinnabar/80">{c.pipeline}</p></div>
        <div className="mt-5 flex flex-wrap gap-2">
          <input ref={inputRef} type="file" className="hidden" accept="audio/*,.mp3,.m4a,.aac,.wav,.flac,.ogg,.opus,.aif,.aiff,.caf" onChange={(event) => void onUpload(event)} />
          <button type="button" disabled={busy} className="min-h-11 rounded-full bg-cinnabar px-5 text-sm text-cream disabled:opacity-50" onClick={() => inputRef.current?.click()}>{busy ? c.processing : c.upload}</button>
          <button type="button" disabled={busy} className="min-h-11 rounded-full border border-line bg-paper/60 px-4 text-sm text-ink-soft disabled:opacity-50" onClick={() => void load()}>{c.refresh}</button>
        </div>
        {percent != null ? <div className="mt-4 border-y border-line/60 py-3" aria-live="polite"><div className="flex items-center justify-between gap-3 text-xs text-ink-soft"><span>{stage || c.processing}</span><span>{percent}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-deep"><span className="block h-full bg-wood transition-[width]" style={{ width: `${percent}%` }} /></div></div> : null}
        {message ? <p className="mt-4 border-l-2 border-cinnabar/55 pl-3 text-sm leading-6 text-cinnabar">{message}</p> : null}
        <div className="mt-5 space-y-3">
          {!tracks.length ? <p className="text-sm text-ink-mute">{c.empty}</p> : null}
          {tracks.map((track) => <article key={track.id} className="border-t border-line/70 pt-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-medium text-ink">{track.name}</h3>{track.enabled ? <span className="rounded-full border border-emerald-700/25 bg-emerald-700/5 px-2.5 py-1 text-[11px] text-emerald-800">{c.current}</span> : null}</div><p className="mt-1 text-xs text-ink-mute">{formatCodec(track)} · {formatSize(track.fileSize)}</p></div><div className="flex flex-wrap gap-2">{!track.enabled ? <button type="button" disabled={busy} className="rounded-full bg-wood px-3 py-2 text-xs text-cream disabled:opacity-50" onClick={() => void onActivate(track)}>{c.use}</button> : null}<button type="button" disabled={busy || track.enabled} className="rounded-full px-3 py-2 text-xs text-cinnabar disabled:opacity-30" onClick={() => void onDelete(track)}>{c.delete}</button></div></div><audio className="mt-3 w-full" controls preload="none"><source src={track.url} type={track.contentType || "audio/mpeg"} /></audio></article>)}
        </div>
      </section>
    </div> : null}
  </>;

  return portalTarget ? createPortal(manager, portalTarget) : manager;
}
