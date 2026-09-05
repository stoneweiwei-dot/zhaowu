import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  activateBackgroundMusic,
  deleteBackgroundMusic,
  listOwnerBackgroundMusic,
  musicPublicUrl,
  uploadBackgroundMusic,
  type BackgroundMusicAsset,
  type MusicUploadProgress,
} from "@/lib/background-music-assets";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function OwnerBackgroundMusicManager() {
  const { locale } = useI18n();
  const { user, session } = useCurrentUserState();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [onAccount, setOnAccount] = useState(() => typeof window !== "undefined" && window.location.pathname === "/account");
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<BackgroundMusicAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<MusicUploadProgress | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const c = useMemo(() => ({
    manage: tr(locale, "背景音樂管理", "背景音乐管理", "Background music"),
    title: tr(locale, "網站背景音樂", "网站背景音乐", "Website background music"),
    lead: tr(locale, "上傳常見音訊後，會在你的瀏覽器本地轉成 AAC-LC .m4a 主檔與 MP3 備援，再存入昭梧 Supabase。換歌不需要重新部署網站。", "上传常见音频后，会在你的浏览器本地转成 AAC-LC .m4a 主文件与 MP3 备用，再存入昭梧 Supabase。换歌不需要重新部署网站。", "Uploads are converted locally in your browser to AAC-LC M4A plus an MP3 fallback, then stored in Zhaowu Supabase. Changing tracks does not redeploy the site."),
    upload: tr(locale, "＋ 上傳音樂並自動轉碼", "＋ 上传音乐并自动转码", "+ Upload and convert"),
    converting: tr(locale, "處理中…", "处理中…", "Processing…"),
    current: tr(locale, "目前播放", "当前播放", "Currently playing"),
    use: tr(locale, "設為背景音樂", "设为背景音乐", "Use as background music"),
    delete: tr(locale, "刪除", "删除", "Delete"),
    close: tr(locale, "關閉", "关闭", "Close"),
    refresh: tr(locale, "刷新", "刷新", "Refresh"),
    empty: tr(locale, "尚未有背景音樂。", "尚未有背景音乐。", "No background music yet."),
    changed: tr(locale, "已切換背景音樂。", "已切换背景音乐。", "Background music changed."),
    uploaded: tr(locale, "新音樂已轉碼、上傳並啟用。", "新音乐已转码、上传并启用。", "New music converted, uploaded and activated."),
    confirmDelete: tr(locale, "刪除這首背景音樂？", "删除这首背景音乐？", "Delete this background track?"),
    loadFailed: tr(locale, "背景音樂讀取失敗。", "背景音乐读取失败。", "Could not load background music."),
  }), [locale]);

  useEffect(() => {
    if (!user?.isOwner) return;
    const sync = () => setOnAccount(window.location.pathname === "/account");
    sync();
    window.addEventListener("popstate", sync);
    const timer = window.setInterval(sync, 800);
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
    if (!file || !session || !user?.isOwner) return;
    setBusy(true);
    setMessage(null);
    setProgress({ stage: "loading", percent: 1, label: c.converting });
    try {
      await uploadBackgroundMusic(session, file, setProgress);
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

  return (
    <>
      <button
        type="button"
        data-owner-background-music-manager
        className="fixed z-[58] inline-flex min-h-10 items-center rounded-full border border-wood/35 bg-cream/95 px-4 text-xs font-medium text-ink-soft shadow-sm backdrop-blur"
        style={{ right: "max(0.75rem, env(safe-area-inset-right))", bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        onClick={() => setOpen(true)}
      >
        {c.manage}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-ink/35 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label={c.title}>
          <section className="mx-auto max-w-2xl rounded-2xl border border-line bg-cream p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.24em] text-cinnabar">OWNER · AUDIO</p>
                <h2 className="mt-2 font-display text-2xl text-ink">{c.title}</h2>
              </div>
              <button type="button" className="rounded-full border border-line bg-paper/60 px-4 py-2 text-xs" onClick={() => setOpen(false)}>{c.close}</button>
            </div>

            <p className="mt-4 text-sm leading-7 text-ink-soft">{c.lead}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="audio/*,.mp3,.m4a,.aac,.wav,.flac,.ogg,.opus,.wma"
                onChange={(event) => void onUpload(event)}
              />
              <button type="button" disabled={busy} className="min-h-11 rounded-full bg-cinnabar px-5 text-sm text-cream disabled:opacity-50" onClick={() => inputRef.current?.click()}>
                {busy ? c.converting : c.upload}
              </button>
              <button type="button" disabled={busy} className="min-h-11 rounded-full border border-line bg-paper/60 px-4 text-sm text-ink-soft disabled:opacity-50" onClick={() => void load()}>{c.refresh}</button>
            </div>

            {progress ? (
              <div className="mt-4 rounded-xl border border-line bg-paper/45 p-4" aria-live="polite">
                <div className="flex items-center justify-between gap-3 text-xs text-ink-soft"><span>{progress.label}</span><span>{progress.percent}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-deep"><span className="block h-full bg-wood transition-[width]" style={{ width: `${progress.percent}%` }} /></div>
              </div>
            ) : null}
            {message ? <p className="mt-4 rounded-lg border border-line bg-paper/45 px-4 py-3 text-sm text-cinnabar">{message}</p> : null}

            <div className="mt-5 space-y-3">
              {!assets.length ? <p className="text-sm text-ink-mute">{c.empty}</p> : null}
              {assets.map((asset) => {
                const primary = musicPublicUrl(asset.storage_path);
                const fallback = musicPublicUrl(asset.fallback_storage_path);
                return (
                  <article key={asset.id} className="rounded-xl border border-line bg-paper/35 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-medium text-ink">{asset.name}</h3>
                          {asset.enabled ? <span className="rounded-full border border-emerald-700/25 bg-emerald-700/5 px-2.5 py-1 text-[11px] text-emerald-800">{c.current}</span> : null}
                        </div>
                        <p className="mt-1 text-xs text-ink-mute">AAC-LC 128 kbps · 48 kHz · stereo · {formatSize(asset.file_size)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!asset.enabled ? <button type="button" disabled={busy} className="rounded-full bg-wood px-3 py-2 text-xs text-cream disabled:opacity-50" onClick={() => void onActivate(asset)}>{c.use}</button> : null}
                        <button type="button" disabled={busy || asset.enabled} className="rounded-full px-3 py-2 text-xs text-cinnabar disabled:opacity-30" onClick={() => void onDelete(asset)}>{c.delete}</button>
                      </div>
                    </div>
                    <audio className="mt-3 w-full" controls preload="none">
                      {primary ? <source src={primary} type="audio/mp4" /> : null}
                      {fallback ? <source src={fallback} type="audio/mpeg" /> : null}
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
}
