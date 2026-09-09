import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { Locale } from "@/lib/i18n";
import type { SupabaseSession } from "@/lib/supabase-rest";
import {
  deleteGalleryAsset,
  galleryPublicUrl,
  listOwnerGalleryAssets,
  setGalleryAssetEnabled,
  setGalleryAssetTags,
  setLoginVisualCurrent,
  uploadGalleryAsset,
  type GalleryAsset,
} from "@/lib/gallery-assets";
import { isLoadingGalleryAsset } from "@/lib/gallery-groups";
import { LOADING_GALLERY_CATALOG } from "@/lib/loading-gallery-catalog";
import { loginVisualThemeFromTags, type LoginVisualTheme } from "@/lib/login-animation";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function notifyChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-gallery-change"));
}

function catalogRows(): GalleryAsset[] {
  return LOADING_GALLERY_CATALOG.map((item) => ({
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
  const catalog = LOADING_GALLERY_CATALOG.find((item) => item.asset_key === asset.asset_key || asset.id === `catalog:${item.asset_key}`);
  return catalog?.publicPath || srcOf(asset);
}

function isVideo(asset: GalleryAsset) {
  return (asset.content_type ?? "").startsWith("video/") || Boolean(LOADING_GALLERY_CATALOG.find((item) => item.asset_key === asset.asset_key)?.videoPath);
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

  const copy = useMemo(() => ({
    kicker: "LOGIN VISUALS",
    title: tr(locale, "登入動畫管理", "登录动画管理", "Login visuals"),
    lead: tr(locale, "獨立管理登入畫面影片／封面，不與首頁背景或總圖庫混用。設為目前使用後，前台登入頁立即讀取該項。", "独立管理登录画面影片／封面，不与首页背景或总图库混用。设为目前使用后，前台登录页立即读取该项。", "Manage login videos separately from homepage backgrounds and the public atlas. The frontend reads the current item immediately."),
    upload: tr(locale, "上傳登入動畫", "上传登录动画", "Upload login visual"),
    current: tr(locale, "目前使用中", "目前使用中", "Currently in use"),
    use: tr(locale, "設為目前使用", "设为目前使用", "Set as current"),
    enable: tr(locale, "啟用", "启用", "Enable"),
    disable: tr(locale, "停用", "停用", "Disable"),
    remove: tr(locale, "刪除", "删除", "Delete"),
    preview: tr(locale, "預覽", "预览", "Preview"),
    close: tr(locale, "關閉", "关闭", "Close"),
    day: tr(locale, "日間版", "日间版", "Day"),
    night: tr(locale, "夜間版", "夜间版", "Night"),
    common: tr(locale, "通用版", "通用版", "Common"),
    builtIn: tr(locale, "內置素材", "内置素材", "Built-in"),
    tooLong: tr(locale, "登入動畫不可超過 5 秒。", "登录动画不可超过 5 秒。", "Login animation must be 5 seconds or shorter."),
    failed: tr(locale, "登入動畫操作失敗。", "登录动画操作失败。", "Login visual update failed."),
    empty: tr(locale, "尚未有遠端登入動畫，前台會使用內置蓮開影片。", "尚未有远程登录动画，前台会使用内置莲开影片。", "No remote login visual yet. The built-in lotus clip is used."),
  }), [locale]);

  async function load() {
    try {
      const rows = (await listOwnerGalleryAssets(session, "loading")).filter(isLoadingGalleryAsset);
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
    if (!files.length) return;
    setBusy(true);
    setMessage(null);
    try {
      for (const file of files) {
        if (file.type === "video/mp4" || file.type === "video/webm") {
          const duration = await readDuration(file);
          if (duration > 5) throw new Error(copy.tooLong);
        }
        await uploadGalleryAsset(session, file, {
          category: "loading",
          tags: ["loading", "login-background", "login-common", "owner-upload"],
          primary: false,
        });
      }
      await load();
      notifyChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    } finally {
      setBusy(false);
    }
  }

  async function setTheme(asset: GalleryAsset, theme: LoginVisualTheme) {
    if (asset.id.startsWith("catalog:")) return;
    const next = (asset.tags ?? []).filter((tag) => !["login-day", "login-night", "login-common", "day", "night"].includes(tag));
    next.push(theme === "day" ? "login-day" : theme === "night" ? "login-night" : "login-common");
    try {
      await setGalleryAssetTags(session, asset.id, next);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    }
  }

  return (
    <section id="login-visuals" data-owner-login-visuals className="seal-border rounded-[1.6rem] bg-cream/88 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.28em] text-cinnabar">{copy.kicker}</p>
          <h2 className="mt-1 font-display text-3xl">{copy.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-soft">{copy.lead}</p>
        </div>
        <label className={`inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-[#1f4e3a] px-5 text-sm text-[#faf8f1] ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {copy.upload}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" className="hidden" onChange={(event) => void onUpload(event)} />
        </label>
      </div>
      {message ? <p className="mt-3 rounded-xl border border-line bg-paper/40 px-4 py-3 text-sm text-cinnabar">{message}</p> : null}
      {!rows.length ? <p className="mt-4 text-sm text-ink-mute">{copy.empty}</p> : null}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((asset) => {
          const locked = asset.id.startsWith("catalog:");
          const theme = loginVisualThemeFromTags(asset.tags);
          const current = asset.id === currentId;
          const video = isVideo(asset);
          return (
            <article key={asset.id} className={`overflow-hidden rounded-2xl border ${current ? "border-[#c4a05a] bg-[#fffaf1]" : "border-line bg-cream/72"}`}>
              <button type="button" className="block w-full" onClick={() => setPreview(asset)}>
                {video ? (
                  <video className="aspect-[16/10] w-full object-cover" src={srcOf(asset)} poster={posterOf(asset)} muted playsInline preload="metadata" />
                ) : (
                  <img className="aspect-[16/10] w-full object-cover" src={posterOf(asset)} alt={asset.title} />
                )}
              </button>
              <div className="space-y-2.5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate font-medium">{asset.title}</p>
                  {current ? <span className="shrink-0 rounded-full border border-[#c4a05a] px-2 py-0.5 text-[11px] text-[#1f4e3a]">{copy.current}</span> : null}
                </div>
                <p className="text-[11px] tracking-[0.14em] text-ink-mute">{video ? "MP4 / WEBM" : "POSTER"} · {theme === "night" ? copy.night : theme === "day" ? copy.day : copy.common}</p>
                {locked ? (
                  <p className="text-[11px] text-ink-mute">{copy.builtIn}</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(["day", "night", "common"] as const).map((item) => (
                      <button key={item} type="button" className={`rounded-full border px-2.5 py-1 text-[11px] ${theme === item ? "border-[#1f4e3a] bg-[#1f4e3a] text-[#faf8f1]" : "border-line text-ink-soft"}`} onClick={() => void setTheme(asset, item)}>
                        {item === "day" ? copy.day : item === "night" ? copy.night : copy.common}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {!locked && !current ? (
                    <button type="button" className="rounded-full bg-[#1f4e3a] px-3 py-1.5 text-[11px] text-[#faf8f1]" onClick={async () => {
                      try { await setLoginVisualCurrent(session, asset); await load(); notifyChanged(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); }
                    }}>{copy.use}</button>
                  ) : null}
                  {!locked ? (
                    <button type="button" className="rounded-full border border-line px-3 py-1.5 text-[11px]" onClick={async () => {
                      try { await setGalleryAssetEnabled(session, asset.id, !asset.enabled); await load(); notifyChanged(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); }
                    }}>{asset.enabled ? copy.disable : copy.enable}</button>
                  ) : null}
                  <button type="button" className="rounded-full border border-line px-3 py-1.5 text-[11px]" onClick={() => setPreview(asset)}>{copy.preview}</button>
                  {!locked ? (
                    <button type="button" className="rounded-full px-3 py-1.5 text-[11px] text-cinnabar" onClick={async () => {
                      if (!window.confirm(`${copy.remove} ${asset.title}?`)) return;
                      try { await deleteGalleryAsset(session, asset); await load(); notifyChanged(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); }
                    }}>{copy.remove}</button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4" role="dialog" aria-modal="true" onClick={() => setPreview(null)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-cream p-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-display text-lg">{preview.title}</p>
              <button type="button" className="rounded-full border border-line px-3 py-1 text-xs" onClick={() => setPreview(null)}>{copy.close}</button>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl bg-paper">
              {isVideo(preview) ? (
                <video className="max-h-[70vh] w-full object-contain" src={srcOf(preview)} poster={posterOf(preview)} controls autoPlay muted playsInline />
              ) : (
                <img className="max-h-[70vh] w-full object-contain" src={posterOf(preview)} alt={preview.title} />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
