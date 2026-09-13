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

// Cookie-gated uploads go to /api/owner-music; playback never uses the r129 pad.

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
  const [message, setMessage] = useState<string | null>(null);

  const c = useMemo(() => ({
    manage: tr(locale, "背景音樂管理", "背景音乐管理", "Background music"),
    title: tr(locale, "網站背景音樂", "网站背景音乐", "Website background music"),
    lead: tr(
      locale,
      "站主登入後即可直接上傳。MP3、M4A/AAC、WAV、FLAC 在 4 MB 內寫入昭梧曲庫，完成後全站立即改播；不再經過 Supabase，也不再播放網站內建的佔位音。",
      "站主登录后即可直接上传。MP3、M4A/AAC、WAV、FLAC 在 4 MB 内写入昭梧曲库，完成后全站立即改播；不再经过 Supabase，也不再播放网站内建的占位音。",
      "After owner sign-in, upload MP3, M4A/AAC, WAV or FLAC up to 4 MB. The track becomes the live site music without Supabase.",
    ),
    entryLead: tr(locale, "站主專用 · 直接上傳、切換網站背景音樂", "站主专用 · 直接上传、切换网站背景音乐", "Owner only · upload and switch website background music"),
    upload: tr(locale, "＋ 上傳音樂", "＋ 上传音乐", "+ Upload music"),
    processing: tr(locale, "上傳中…", "上传中…", "Uploading…"),
    current: tr(locale, "目前播放", "当前播放", "Currently playing"),
    use: tr(locale, "設為背景音樂", "设为背景音乐", "Use as background music"),
    delete: tr(locale, "刪除", "删除", "Delete"),
    close: tr(locale, "關閉", "关闭", "Close"),
    refresh: tr(locale, "刷新", "刷新", "Refresh"),
    empty: tr(locale, "尚未有背景音樂。請上傳你要的曲子。", "尚未有背景音乐。请上传你要的曲子。", "No background music yet. Upload a track."),
    changed: tr(locale, "已切換背景音樂。", "已切换背景音乐。", "Background music changed."),
    uploaded: tr(locale, "新音樂已上傳並啟用。", "新音乐已上传并启用。", "New music uploaded and activated."),
    confirmDelete: tr(locale, "刪除這首背景音樂？", "删除这首背景音乐？", "Delete this background track?"),
    loadFailed: tr(locale, "背景音樂讀取失敗。", "背景音乐读取失败。", "Could not load background music."),
    formatHint: tr(locale, "支援 MP3、M4A、AAC、WAV、FLAC；單檔最多 4 MB。建議 MP3 或 M4A，iPhone Safari 最穩。先前上傳在 Supabase 的曲子仍鎖在流量上限裡，這裡可以重新上傳。", "支持 MP3、M4A、AAC、WAV、FLAC；单文件最多 4 MB。建议 MP3 或 M4A，iPhone Safari 最稳。先前上传在 Supabase 的曲子仍锁在流量上限里，这里可以重新上传。", "Supports MP3, M4A, AAC, WAV and FLAC up to 4 MB. Re-upload here; older Supabase files stay locked until the spend cap is lifted."),
    pipeline: tr(locale, "檢查格式 → 上傳到昭梧曲庫 → 全站啟用", "检查格式 → 上传到昭梧曲库 → 全站启用", "Check format → upload to Zhaowu library → activate"),
  }), [locale]);

  useEffect(() => {
    if (!user?.isOwner) {
      setPortalTarget(null);
      return;
    }
    const sync = () => {
      const active = window.location.pathname === "/account" || window.location.pathname.startsWith("/account/");
      setOnAccount(active);
      setPortalTarget(active ? document.querySelector<HTMLElement>("main > section:first-child") : null);
    };
    sync();
    window.addEventListener("popstate", sync);
    const timer = window.setInterval(sync, 300);
    return () => {
      window.removeEventListener("popstate", sync);
      window.clearInterval(timer);
    };
  }, [user?.isOwner]);

  async function load() {
    if (!user?.isOwner) return;
    try {
      const state = await loadOwnerMusic();
      setTracks(state.tracks);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    }
  }

  useEffect(() => {
    if (open) void load();
  }, [open, user?.isOwner]);

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user?.isOwner || busy) return;
    setBusy(true);
    setMessage(null);
    setPercent(4);
    try {
      await uploadOwnerMusic(file, setPercent);
      await load();
      setMessage(c.uploaded);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    } finally {
      setBusy(false);
      setPercent(null);
    }
  }

  async function onActivate(track: OwnerMusicTrack) {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await activateOwnerMusic(track.id);
      await load();
      setMessage(c.changed);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(track: OwnerMusicTrack) {
    if (busy || track.enabled || !window.confirm(c.confirmDelete)) return;
    setBusy(true);
    setMessage(null);
    try {
      await deleteOwnerMusic(track.id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    } finally {
      setBusy(false);
    }
  }

  if (!user?.isOwner || !onAccount) return null;

  const manager = (
    <>
      <button
        type="button"
        data-owner-background-music-manager
        data-owner-background-music-inline={portalTarget ? "true" : "fallback"}
        className={portalTarget
          ? "mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-cinnabar/20 bg-gradient-to-br from-paper/80 to-cream/65 px-4 py-4 text-left shadow-sm transition hover:border-cinnabar/35"
          : "fixed left-3 right-3 z-[88] flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-cinnabar/30 bg-cream/98 px-4 py-3 text-left shadow-xl backdrop-blur"}
        style={portalTarget ? undefined : { top: "max(0.75rem, env(safe-area-inset-top))" }}
        onClick={() => setOpen(true)}
      >
        <span className="min-w-0">
          <span className="block text-[10px] tracking-[0.22em] text-cinnabar">OWNER · AUDIO</span>
          <span className="mt-1 block font-display text-lg text-ink">{c.manage}</span>
          <span className="mt-1 block text-xs leading-5 text-ink-mute">{c.entryLead}</span>
        </span>
        <span aria-hidden="true" className="shrink-0 rounded-full bg-cinnabar px-3 py-2 text-sm text-cream">＋</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-ink/35 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label={c.title}>
          <section className="mx-auto max-w-2xl rounded-[1.6rem] border border-line bg-cream p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.24em] text-cinnabar">OWNER · AUDIO</p>
                <h2 className="mt-2 font-display text-2xl text-ink">{c.title}</h2>
              </div>
              <button type="button" className="rounded-full border border-line bg-paper/60 px-4 py-2 text-xs" onClick={() => setOpen(false)}>{c.close}</button>
            </div>

            <div className="mt-4 border-y border-line/70 py-4">
              <p className="text-sm leading-7 text-ink-soft">{c.lead}</p>
              <p className="mt-2 text-xs leading-6 text-ink-mute">{c.formatHint}</p>
              <p className="mt-2 text-[11px] tracking-[0.08em] text-cinnabar/80">{c.pipeline}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,audio/x-aac,audio/wav,audio/x-wav,audio/flac,audio/x-flac,.mp3,.m4a,.aac,.wav,.flac"
                onChange={(event) => void onUpload(event)}
              />
              <button type="button" disabled={busy} className="min-h-11 rounded-full bg-cinnabar px-5 text-sm text-cream disabled:opacity-50" onClick={() => inputRef.current?.click()}>
                {busy ? c.processing : c.upload}
              </button>
              <button type="button" disabled={busy} className="min-h-11 rounded-full border border-line bg-paper/60 px-4 text-sm text-ink-soft disabled:opacity-50" onClick={() => void load()}>{c.refresh}</button>
            </div>

            {percent != null ? (
              <div className="mt-4 border-y border-line/60 py-3" aria-live="polite">
                <div className="flex items-center justify-between gap-3 text-xs text-ink-soft"><span>{c.processing}</span><span>{percent}%</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-deep"><span className="block h-full bg-wood transition-[width]" style={{ width: `${percent}%` }} /></div>
              </div>
            ) : null}
            {message ? <p className="mt-4 border-l-2 border-cinnabar/55 pl-3 text-sm leading-6 text-cinnabar">{message}</p> : null}

            <div className="mt-5 space-y-3">
              {!tracks.length ? <p className="text-sm text-ink-mute">{c.empty}</p> : null}
              {tracks.map((track) => (
                <article key={track.id} className="border-t border-line/70 pt-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-medium text-ink">{track.name}</h3>
                        {track.enabled ? <span className="rounded-full border border-emerald-700/25 bg-emerald-700/5 px-2.5 py-1 text-[11px] text-emerald-800">{c.current}</span> : null}
                      </div>
                      <p className="mt-1 text-xs text-ink-mute">{formatCodec(track)} · {formatSize(track.fileSize)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!track.enabled ? <button type="button" disabled={busy} className="rounded-full bg-wood px-3 py-2 text-xs text-cream disabled:opacity-50" onClick={() => void onActivate(track)}>{c.use}</button> : null}
                      <button type="button" disabled={busy || track.enabled} className="rounded-full px-3 py-2 text-xs text-cinnabar disabled:opacity-30" onClick={() => void onDelete(track)}>{c.delete}</button>
                    </div>
                  </div>
                  <audio className="mt-3 w-full" controls preload="none">
                    <source src={track.url} type={track.contentType || "audio/mpeg"} />
                  </audio>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );

  return portalTarget ? createPortal(manager, portalTarget) : manager;
}
