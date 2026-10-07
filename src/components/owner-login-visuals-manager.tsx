import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { Locale } from "@/lib/i18n";
import type { SupabaseSession } from "@/lib/bridge/supabase-rest";
import {
  deleteGalleryAsset,
  galleryPublicUrl,
  listOwnerGalleryAssets,
  setGalleryAssetTags,
  setLoginVisualCurrent,
  uploadGalleryAsset,
  type GalleryAsset,
} from "@/lib/bridge/gallery-assets";
import { LOGIN_VISUAL_CATALOG } from "@/lib/loading-gallery-catalog";
import { SUPABASE_STORAGE_WRITES_PAUSED } from "@/lib/storage-write-policy";
import { LOGIN_VIDEO_ACCEPT, isBrowserPlayableVideoType, resolveLoginVideoType } from "@/lib/video-formats";
import { LOGIN_VIDEO_MAX_SECONDS, compressLoginVideo } from "@/lib/login-video-compress";

const NAME_TAG_PREFIX = "name:";
const NAME_MAX = 40;

/** Display name = owner-chosen `name:` tag when present, otherwise the stored title. */
function displayTitle(asset: GalleryAsset) {
  const tag = (asset.tags ?? []).find((item) => item.startsWith(NAME_TAG_PREFIX));
  const custom = tag ? tag.slice(NAME_TAG_PREFIX.length).trim() : "";
  return custom || asset.title;
}

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function notifyChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-gallery-change"));
}

function catalogRows(): GalleryAsset[] {
  return LOGIN_VISUAL_CATALOG.map((item) => ({
    id: `catalog:${item.asset_key}`,
    category: "loading",
    asset_key: item.asset_key,
    title: item.title,
    storage_path: item.videoPath || item.publicPath,
    bucket_id: "public-fallback",
    content_type: item.videoPath ? "video/mp4" : "image/jpeg",
    tags: [...item.tags],
    enabled: true,
    is_primary: (item.tags ?? []).includes("current-default"),
    created_at: item.created_at,
    updated_at: item.created_at,
  }));
}

function srcOf(asset: GalleryAsset) {
  if (asset.bucket_id === "public-fallback") return asset.storage_path;
  return galleryPublicUrl(asset.storage_path, asset.bucket_id);
}

function posterOf(asset: GalleryAsset) {
  // Only built-in clips have a real poster image. For uploaded videos the poster used to be
  // the video URL itself (not an image), which rendered a blank tile; they now show a real
  // frame of the video instead (see videoSrcOf).
  const catalog = LOGIN_VISUAL_CATALOG.find((item) => item.asset_key === asset.asset_key || asset.id === `catalog:${item.asset_key}`);
  return catalog?.publicPath;
}

/** `#t=` makes every browser (incl. iOS Safari) paint a real frame as the preview. */
function videoSrcOf(asset: GalleryAsset) {
  const src = srcOf(asset);
  return src.includes("#") ? src : `${src}#t=0.5`;
}

function isVideo(asset: GalleryAsset) {
  return (asset.content_type ?? "").startsWith("video/") || Boolean(LOGIN_VISUAL_CATALOG.find((item) => item.asset_key === asset.asset_key)?.videoPath);
}

function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const node = document.createElement("video");
    node.preload = "metadata";
    node.onloadedmetadata = () => {
      const duration = Number.isFinite(node.duration) ? node.duration : 0;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    node.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("video"));
    };
    node.src = url;
  });
}

export function OwnerLoginVisualsManager({ session, locale }: { session: SupabaseSession; locale: Locale }) {
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<GalleryAsset | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const copy = useMemo(() => ({
    kicker: "OPENING VIDEO",
    title: tr(locale, "首頁開場影片管理", "首页开场视频管理", "Homepage opening video"),
    upload: tr(locale, "上傳開場影片", "上传开场视频", "Upload opening video"),
    current: tr(locale, "目前使用中", "目前使用中", "Currently in use"),
    use: tr(locale, "設為目前使用", "设为目前使用", "Set as current"),
    remove: tr(locale, "刪除", "删除", "Delete"),
    preview: tr(locale, "預覽", "预览", "Preview"),
    close: tr(locale, "關閉", "关闭", "Close"),
    day: tr(locale, "日間版", "日间版", "Day"),
    night: tr(locale, "夜間版", "夜间版", "Night"),
    common: tr(locale, "通用版", "通用版", "Common"),
    builtIn: tr(locale, "內置素材", "内置素材", "Built-in"),
    videoRequired: tr(locale, "開場影片只接受影片檔（MP4、MOV、M4V、WebM、3GP、MKV、AVI、WMV、FLV、MPEG、TS、OGV）。", "开场视频只接受视频文件（MP4、MOV、M4V、WebM、3GP、MKV、AVI、WMV、FLV、MPEG、TS、OGV）。", "The opening video must be a video file (MP4, MOV, M4V, WebM, 3GP, MKV, AVI, WMV, FLV, MPEG, TS, OGV)."),
    clipped: tr(locale, "已上傳；首頁開場最長播放 15 秒，其餘片段不會播出。", "已上传；首页开场最长播放 15 秒，其余片段不会播出。", "Uploaded. The homepage opening plays for at most 15 seconds; the rest of the clip is not shown."),
    notPlayable: tr(locale, "已上傳；此格式瀏覽器無法直接播放，首頁會改顯示封面。建議改用 MP4 或 MOV。", "已上传；此格式浏览器无法直接播放，首页会改显示封面。建议改用 MP4 或 MOV。", "Uploaded. Browsers cannot play this format directly, so the homepage will show the poster instead. MP4 or MOV is recommended."),
    rename: tr(locale, "改名", "改名", "Rename"),
    save: tr(locale, "儲存", "保存", "Save"),
    cancel: tr(locale, "取消", "取消", "Cancel"),
    namePlaceholder: tr(locale, "輸入新名稱", "输入新名称", "New name"),
    compressing: tr(locale, "壓縮中", "压缩中", "Compressing"),
    compressed: (from: number, to: number) => tr(
      locale,
      `已壓縮：${(from / 1048576).toFixed(1)} MB → ${(to / 1048576).toFixed(1)} MB（最長 ${LOGIN_VIDEO_MAX_SECONDS} 秒）。`,
      `已压缩：${(from / 1048576).toFixed(1)} MB → ${(to / 1048576).toFixed(1)} MB（最长 ${LOGIN_VIDEO_MAX_SECONDS} 秒）。`,
      `Compressed: ${(from / 1048576).toFixed(1)} MB → ${(to / 1048576).toFixed(1)} MB (max ${LOGIN_VIDEO_MAX_SECONDS} s).`,
    ),
    tooBig: () => {
      return tr(locale, `此影片壓縮後仍太大，超過儲存空間單檔上限（Supabase 回報 413）。請先用手機「剪輯」裁成 15 秒內、或用較低畫質重新匯出後再上傳。`, `此视频压缩后仍太大，超过存储空间单文件上限（Supabase 返回 413）。请先用手机「剪辑」裁成 15 秒内、或用较低画质重新导出后再上传。`, `This video is still too large after compression and exceeds the storage per-file limit (Supabase returned 413). Trim it to 15 seconds or export at lower quality, then upload again.`);
    },
    compressFailed: tr(locale, "此影片無法在瀏覽器內壓縮，已直接上傳原檔。", "此视频无法在浏览器内压缩，已直接上传原文件。", "This video could not be compressed in the browser; the original was uploaded."),
    failed: tr(locale, "開場影片操作失敗。", "开场视频操作失败。", "Opening-video update failed."),
    empty: tr(locale, "尚未設定自訂開場影片，首頁會使用內建蓮開影片。", "尚未设置自定义开场视频，首页会使用内置莲开视频。", "No custom opening video set. The homepage uses the built-in lotus clip."),
  }), [locale]);

  async function load() {
    try {
      const rows = (await listOwnerGalleryAssets(session, "loading")).filter((asset) =>
        (asset.tags ?? []).some((tag) => tag.trim().toLowerCase() === "login-background") && isVideo(asset),
      );
      setAssets(rows);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    }
  }

  useEffect(() => { void load(); }, [session.access_token]);

  const remoteKeys = new Set(assets.map((asset) => asset.asset_key));
  const rows = [...catalogRows().filter((asset) => !remoteKeys.has(asset.asset_key)), ...assets];
  const currentId = rows.find((asset) => asset.is_primary && asset.enabled)?.id ?? rows.find((asset) => asset.is_primary)?.id;

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || busy) return;
    let uploadedCount = 0;
    let currentFileName = "";
    setBusy(true);
    setMessage(null);
    try {
      const notes = new Set<string>();
      for (const file of files) {
        currentFileName = file.name;
        const videoType = resolveLoginVideoType(file);
        if (!videoType) throw new Error(copy.videoRequired);
        const duration = await Promise.race([
          readDuration(file),
          new Promise<number>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
        ]).catch(() => null);
        const playable = isBrowserPlayableVideoType(videoType);
        // Owner instruction 2026-09-30: squeeze uploads to within 15 seconds, keeping sound (client-side, zero cost).
        const result = await compressLoginVideo(file, duration, playable, (progress) => setMessage(`${copy.compressing} ${Math.min(99, progress.percent)}% · ${progress.label}`));
        setMessage(null);
        if (result.compressed) notes.add(copy.compressed(result.sourceBytes, result.outputBytes));
        else if (result.skippedReason === "failed") notes.add(copy.compressFailed);
        else if (duration === null || !playable) notes.add(copy.notPlayable);
        else if (duration > 15) notes.add(copy.clipped);
        await uploadGalleryAsset(session, result.file, {
          category: "loading",
          title: file.name,
          tags: ["loading", "login-background", "login-common", "owner-upload"],
          primary: false,
        });
        uploadedCount += 1;
      }
      if (notes.size) setMessage([...notes].join(" "));
    } catch (error) {
      const raw = error instanceof Error ? error.message : "";
      const detail = /413|Maximum size exceeded/i.test(raw) ? copy.tooBig() : raw || copy.failed;
      const saved = uploadedCount ? tr(locale, `（前 ${uploadedCount} 支已上傳）`, `（前 ${uploadedCount} 支已上传）`, ` (${uploadedCount} earlier uploads saved)`) : "";
      setMessage(`${currentFileName}: ${detail}${saved}`);
    } finally {
      if (uploadedCount) { await load(); notifyChanged(); }
      setBusy(false);
    }
  }

  async function saveName(asset: GalleryAsset) {
    const cleaned = draftName.trim().replace(/\s+/g, " ").slice(0, NAME_MAX);
    if (!cleaned) { setMessage(tr(locale, "名稱不能留空。", "名称不能留空。", "The name cannot be empty.")); return; }
    setBusy(true); setMessage(null);
    try {
      const next = (asset.tags ?? []).filter((tag) => !tag.startsWith(NAME_TAG_PREFIX));
      next.push(`${NAME_TAG_PREFIX}${cleaned}`);
      await setGalleryAssetTags(session, asset.id, next);
      setRenamingId(null);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    } finally { setBusy(false); }
  }

  return (
    <section id="login-visuals" data-owner-login-visuals className="seal-border rounded-2xl bg-cream/88 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-[0.22em] text-cinnabar">{copy.kicker}</p>
          <h2 className="mt-1 font-display text-xl leading-tight">{copy.title}</h2>
        </div>
        <label className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full bg-[#1f4e3a] px-4 text-sm text-[#faf8f1] ${busy || SUPABASE_STORAGE_WRITES_PAUSED ? "pointer-events-none opacity-50" : ""}`}>
          {copy.upload}
          <input type="file" multiple disabled={busy || SUPABASE_STORAGE_WRITES_PAUSED} accept={LOGIN_VIDEO_ACCEPT} className="hidden" onChange={(event) => void onUpload(event)} />
        </label>
      </div>
      {SUPABASE_STORAGE_WRITES_PAUSED ? <p className="mt-3 text-xs font-medium text-ink-mute" data-owner-storage-status>{tr(locale, "Storage 寫入暫停", "Storage 写入暂停", "Storage read-only")}</p> : null}
      {message ? <p className="mt-3 rounded-xl border border-line bg-paper/40 px-4 py-3 text-sm text-cinnabar">{message}</p> : null}
      {!rows.length ? <p className="mt-4 text-sm text-ink-mute">{copy.empty}</p> : null}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {rows.map((asset) => {
          const locked = asset.id.startsWith("catalog:");
          const current = asset.id === currentId;
          return (
            <article key={asset.id} className={`relative overflow-hidden rounded-xl border ${current ? "border-[#c4a05a] bg-[#fffaf1]" : "border-line bg-cream/72"}`}>
              <button type="button" className="block w-full" onClick={() => setPreview(asset)}>
                <video className="aspect-[16/10] w-full object-cover" src={videoSrcOf(asset)} poster={posterOf(asset)} muted playsInline preload="metadata" />
              </button>
              <div className="space-y-2.5 p-3">
                <div className="flex flex-wrap items-start gap-2">
                  {renamingId === asset.id ? (
                    <form className="flex min-w-0 flex-1 items-center gap-1" onSubmit={(event) => { event.preventDefault(); void saveName(asset); }}>
                      <input autoFocus value={draftName} maxLength={NAME_MAX} placeholder={copy.namePlaceholder} onChange={(event) => setDraftName(event.target.value)} className="min-w-0 flex-1 rounded-md border border-line bg-cream px-2 py-1 text-xs" />
                      <button type="submit" disabled={busy} className="rounded-full bg-[#1f4e3a] px-2 py-1 text-[10px] text-[#faf8f1]">{copy.save}</button>
                      <button type="button" className="rounded-full border border-line px-2 py-1 text-[10px]" onClick={() => setRenamingId(null)}>{copy.cancel}</button>
                    </form>
                  ) : <p className="w-full min-w-0 break-words text-sm font-medium [overflow-wrap:anywhere]">{displayTitle(asset)}</p>}
                  {current ? <span className="shrink-0 rounded-full border border-[#c4a05a] px-2 py-0.5 text-[11px] text-[#1f4e3a]">{copy.current}</span> : null}
                </div>
                {locked ? (
                  <p className="text-[11px] text-ink-mute">{copy.builtIn}</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {!current ? (
                      <button type="button" className="rounded-full bg-[#1f4e3a] px-2.5 py-1 text-[10px] text-[#faf8f1]" onClick={async () => {
                        try { await setLoginVisualCurrent(session, asset); await load(); notifyChanged(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); }
                      }}>{copy.use}</button>
                    ) : null}
                    <button type="button" className="rounded-full border border-line px-2.5 py-1 text-[10px]" onClick={() => { setRenamingId(asset.id); setDraftName(displayTitle(asset)); }}>{copy.rename}</button>
                    <button type="button" className="rounded-full px-2.5 py-1 text-[10px] text-cinnabar" onClick={async () => {
                      if (!window.confirm(`${copy.remove} ${displayTitle(asset)}?`)) return;
                      try { await deleteGalleryAsset(session, asset); await load(); notifyChanged(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); }
                    }}>{copy.remove}</button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4" role="dialog" aria-modal="true" onClick={() => setPreview(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-cream p-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-display text-lg">{displayTitle(preview)}</p>
              <button type="button" className="rounded-full border border-line px-3 py-1 text-xs" onClick={() => setPreview(null)}>{copy.close}</button>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl bg-paper">
              <video className="max-h-[70vh] w-full object-contain" src={srcOf(preview)} poster={posterOf(preview)} controls autoPlay muted playsInline />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
