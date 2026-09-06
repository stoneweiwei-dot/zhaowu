import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  activateBackgroundMusic,
  deleteBackgroundMusic,
  listOwnerBackgroundMusic,
  musicPublicUrl,
  type BackgroundMusicAsset,
  type MusicUploadProgress,
} from "@/lib/background-music-assets";
import { uploadBackgroundMusicResilient } from "@/lib/background-music-upload";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatCodec(asset: BackgroundMusicAsset) {
  if (asset.content_type === "audio/mpeg") return "MP3";
  if (asset.content_type === "audio/mp4") return "M4A / AAC";
  if (asset.content_type === "audio/aac") return "AAC";
  if (asset.content_type === "audio/wav") return "WAV";
  if (asset.content_type === "audio/flac") return "FLAC";
  return asset.codec || "Audio";
}

export function OwnerBackgroundMusicManager() {
  const { locale } = useI18n();
  const { user, session } = useCurrentUserState();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [onAccount, setOnAccount] = useState(() => typeof window !== "undefined" && (window.location.pathname === "/account" || window.location.pathname.startsWith("/account/")));
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<BackgroundMusicAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<MusicUploadProgress | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const c = useMemo(() => ({
    manage: tr(locale, "背景音樂管理", "背景音乐管理", "Background music"),
    title: tr(locale, "網站背景音樂", "网站背景音乐", "Website background music"),
    lead: tr(
      locale,
      "手機版不再做瀏覽器轉碼。MP3、M4A/AAC、WAV、FLAC 在 15 MB 內直接上傳到網站，完成後立即切換；不再載入大型轉碼核心，也不會卡在 3% 或 7%。",
      "手机版不再做浏览器转码。MP3、M4A/AAC、WAV、FLAC 在 15 MB 内直接上传到网站，完成后立即切换；不再加载大型转码核心，也不会卡在 3% 或 7%。",
      "Mobile upload no longer transcodes in the browser. MP3, M4A/AAC, WAV and FLAC up to 15 MB upload directly and become active immediately.",
    ),
    entryLead: tr(locale, "站主專用 · 直接上傳、切換網站背景音樂", "站主专用 · 直接上传、切换网站背景音乐", "Owner only · upload and switch website background music"),
    upload: tr(locale, "＋ 上傳音樂", "＋ 上传音乐", "+ Upload music"),
    processing: tr(locale, "上傳中…", "上传中…", "Uploading…"),
    current: tr(locale, "目前播放", "当前播放", "Currently playing"),
    use: tr(locale, "設為背景音樂", "设为背景音乐", "Use as background music"),
    delete: tr(locale, "刪除", "删除", "Delete"),
    close: tr(locale, "關閉", "关闭", "Close"),
    refresh: tr(locale, "刷新", "刷新", "Refresh"),
    empty: tr(locale, "尚未有背景音樂。", "尚未有背景音乐。", "No background music yet."),
    changed: tr(locale, "已切換背景音樂。", "已切换背景音乐。", "Background music changed."),
    uploaded: tr(locale, "新音樂已直接上傳並啟用。", "新音乐已直接上传并启用。", "New music uploaded and activated."),
    confirmDelete: tr(locale, "刪除這首背景音樂？", "删除这首背景音乐？", "Delete this background track?"),
    loadFailed: tr(locale, "背景音樂讀取失敗。", "背景音乐读取失败。", "Could not load background music."),
    formatHint: tr(locale, "支援 MP3、M4A、AAC、WAV、FLAC；單檔最多 15 MB。建議優先用 MP3 或 M4A/AAC，iPhone Safari 最穩。", "支持 MP3、M4A、AAC、WAV、FLAC；单文件最多 15 MB。建议优先用 MP3 或 M4A/AAC，iPhone Safari 最稳。", "Supports MP3, M4A, AAC, WAV and FLAC up to 15 MB. MP3 or M4A/AAC is recommended for iPhone Safari."),
    pipeline: tr(locale, "檢查格式 → 直接上傳 → 保存 → 啟用", "检查格式 → 直接上传 → 保存 → 启用", "Check format → upload → save → activate"),
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
    if (!session || !user?.isOwner) return;
    try {
      setAssets(await listOwnerBackgroundMusic(session));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    }
  }

  useEffect(() => {
    if (open) void load();
  }, [open, session?.access_token]);

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !session || !user?.isOwner || busy) return;
    setBusy(true);
    setMessage(null);
    setProgress({ stage: "loading", percent: 1, label: tr(locale, "檢查音訊格式", "检查音频格式", "Checking audio format") });
    try {
      await uploadBackgroundMusicResilient(session, file, setProgress);
      await load();
      setMessage(c.uploaded);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onActivate(asset: BackgroundMusicAsset) {
    if (!session || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await activateBackgroundMusic(session, asset.id);
      await load();
      setMessage(c.changed);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(asset: BackgroundMusicAsset) {
    if (!session || busy || asset.enabled || !window.confirm(c.confirmDelete)) return;
    setBusy(true);
    setMessage(null);
    try {
      await deleteBackgroundMusic(session, asset);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.loadFailed);
    } finally {
      setBusy(false);
    }
  }

  if (!user?.isOwner || !session || !onAccount) return null;

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

            {progress ? (
              <div className="mt-4 border-y border-line/60 py-3" aria-live="polite">
                <div className="flex items-center justify-between gap-3 text-xs text-ink-soft"><span>{progress.label}</span><span>{progress.percent}%</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-deep"><span className="block h-full bg-wood transition-[width]" style={{ width: `${progress.percent}%` }} /></div>
              </div>
            ) : null}
            {message ? <p className="mt-4 border-l-2 border-cinnabar/55 pl-3 text-sm leading-6 text-cinnabar">{message}</p> : null}

            <div className="mt-5 space-y-3">
              {!assets.length ? <p className="text-sm text-ink-mute">{c.empty}</p> : null}
              {assets.map((asset) => {
                const primary = musicPublicUrl(asset.storage_path);
                const fallback = musicPublicUrl(asset.fallback_storage_path);
                return (
                  <article key={asset.id} className="border-t border-line/70 pt-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-medium text-ink">{asset.name}</h3>
                          {asset.enabled ? <span className="rounded-full border border-emerald-700/25 bg-emerald-700/5 px-2.5 py-1 text-[11px] text-emerald-800">{c.current}</span> : null}
                        </div>
                        <p className="mt-1 text-xs text-ink-mute">{formatCodec(asset)} · {formatSize(asset.file_size)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!asset.enabled ? <button type="button" disabled={busy} className="rounded-full bg-wood px-3 py-2 text-xs text-cream disabled:opacity-50" onClick={() => void onActivate(asset)}>{c.use}</button> : null}
                        <button type="button" disabled={busy || asset.enabled} className="rounded-full px-3 py-2 text-xs text-cinnabar disabled:opacity-30" onClick={() => void onDelete(asset)}>{c.delete}</button>
                      </div>
                    </div>
                    <audio className="mt-3 w-full" controls preload="none">
                      {primary ? <source src={primary} type={asset.content_type || "audio/mp4"} /> : null}
                      {fallback ? <source src={fallback} type={asset.fallback_content_type || "audio/mpeg"} /> : null}
                    </audio>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );

  return portalTarget ? createPortal(manager, portalTarget) : manager;
}
