import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { Locale } from "@/lib/i18n";
import type { SupabaseSession } from "@/lib/supabase-rest";
import {
  deleteGalleryAsset,
  galleryPublicUrl,
  listOwnerGalleryAssets,
  setGalleryAssetEnabled,
  uploadGalleryAsset,
  type GalleryAsset,
} from "@/lib/gallery-assets";
import { isLoadingGalleryAsset, isPublicAtlasAsset } from "@/lib/gallery-groups";
import { LOADING_GALLERY_CATALOG } from "@/lib/loading-gallery-catalog";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function notifyGalleryChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-gallery-change"));
}

type OwnerView = "atlas" | "loading" | "all";
const PAGE_SIZE = 18;

function catalogAssets(): GalleryAsset[] {
  return LOADING_GALLERY_CATALOG.map((item) => ({
    id: `catalog:${item.asset_key}`,
    category: "loading",
    asset_key: item.asset_key,
    title: item.title,
    storage_path: item.publicPath,
    bucket_id: "public-fallback",
    content_type: item.kind === "animation" ? "image/jpeg+animation" : "image/jpeg",
    tags: [...item.tags],
    enabled: true,
    is_primary: false,
    created_at: item.created_at,
    updated_at: item.created_at,
  }));
}

function assetSrc(asset: GalleryAsset) {
  if (asset.bucket_id === "public-fallback") return asset.storage_path;
  return galleryPublicUrl(asset.storage_path, asset.bucket_id);
}

function catalogItemFor(asset: GalleryAsset) {
  const key = asset.id.startsWith("catalog:") ? asset.id.slice("catalog:".length) : asset.asset_key;
  return LOADING_GALLERY_CATALOG.find((item) => item.asset_key === key);
}

function previewMedia(asset: GalleryAsset) {
  const catalog = catalogItemFor(asset);
  const videoPath = catalog?.videoPath;
  const poster = catalog?.publicPath || assetSrc(asset);
  if (videoPath) return { type: "video" as const, src: videoPath, poster };
  if ((asset.content_type ?? "").startsWith("video/")) return { type: "video" as const, src: assetSrc(asset), poster };
  return { type: "image" as const, src: poster, poster };
}

function readVideoDuration(file: File): Promise<number> {
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

export function OwnerGalleryManager({ session, locale }: { session: SupabaseSession; locale: Locale }) {
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [view, setView] = useState<OwnerView>("atlas");
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [preview, setPreview] = useState<GalleryAsset | null>(null);

  const copy = useMemo(() => ({
    title: tr(locale, "昭梧總圖庫", "昭梧总图库", "Zhaowu Gallery"),
    lead: tr(
      locale,
      "你只需要把喜歡的圖放進來。分類、五行、用途、客戶匹配與背景調用都由系統在後台處理，不需要你手動整理。",
      "你只需要把喜欢的图放进来。分类、五行、用途、客户匹配与背景调用都由系统在后台处理，不需要你手动整理。",
      "Just add the images you want to keep. Internal classification, visual tags, client matching and background use are handled automatically behind the scenes.",
    ),
    compactLead: tr(locale, "圖片預設收合，不再整頁鋪開。需要管理時再展開；登入動畫仍保留獨立分組。", "图片默认收合，不再整页铺开。需要管理时再展开；登录动画仍保留独立分组。", "Images stay collapsed by default instead of filling the page. Open them only when needed; the Loading group remains separate."),
    upload: tr(locale, "選圖並加入總圖庫", "选图并加入总图库", "Add images"),
    uploadLoading: tr(locale, "加入登入動畫分組", "加入登录动画分组", "Add to Loading group"),
    uploading: tr(locale, "加入中…", "加入中…", "Adding…"),
    atlas: tr(locale, "吉象圖鑑", "吉象图鉴", "Public atlas"),
    loading: tr(locale, "登入動畫", "登录动画", "Loading"),
    all: tr(locale, "全部圖片", "全部图片", "All images"),
    openGallery: tr(locale, "展開圖片", "展开图片", "Open images"),
    closeGallery: tr(locale, "收起圖片", "收起图片", "Collapse images"),
    empty: tr(locale, "這個檢視目前沒有圖片。", "这个检视目前没有图片。", "No images in this view."),
    enabled: tr(locale, "可使用", "可使用", "Available"),
    remove: tr(locale, "刪除", "删除", "Delete"),
    more: tr(locale, "載入更多", "加载更多", "Load more"),
    catalogLock: tr(locale, "內置登入素材", "内置登录素材", "Built-in loading asset"),
    preview: tr(locale, "預覽", "预览", "Preview"),
    closePreview: tr(locale, "關閉預覽", "关闭预览", "Close preview"),
    tooLong: tr(locale, "登入動畫不可超過 5 秒。", "登录动画不可超过 5 秒。", "Login animation must be 5 seconds or shorter."),
    failed: tr(locale, "圖庫操作失敗。", "图库操作失败。", "Gallery operation failed."),
  }), [locale]);

  async function load() {
    try {
      setAssets(await listOwnerGalleryAssets(session));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    }
  }

  useEffect(() => { void load(); }, [session.access_token]);

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setBusy(true);
    setMessage(null);
    try {
      for (const file of files) {
        if (view === "loading" && (file.type === "video/mp4" || file.type === "video/webm")) {
          const duration = await readVideoDuration(file);
          if (duration > 5) throw new Error(copy.tooLong);
        }
        await uploadGalleryAsset(session, file, {
          category: view === "loading" ? "loading" : "visual-library",
          tags: view === "loading" ? ["loading", "login-background", "owner-upload"] : ["owner-upload", "auto-classify"],
          primary: false,
        });
      }
      await load();
      if (view !== "loading") setView("all");
      setShown(PAGE_SIZE);
      setOpen(true);
      notifyGalleryChanged();
      setMessage(tr(locale, `已加入 ${files.length} 張。`, `已加入 ${files.length} 张。`, `Added ${files.length} image${files.length === 1 ? "" : "s"}.`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    } finally {
      setBusy(false);
    }
  }

  const atlasAssets = useMemo(() => assets.filter(isPublicAtlasAsset), [assets]);
  const loadingRemote = useMemo(() => assets.filter(isLoadingGalleryAsset), [assets]);
  const loadingAssets = useMemo(() => {
    const remoteKeys = new Set(loadingRemote.map((asset) => asset.asset_key));
    return [...catalogAssets().filter((asset) => !remoteKeys.has(asset.asset_key)), ...loadingRemote];
  }, [loadingRemote]);
  const visibleAssets = view === "atlas" ? atlasAssets : view === "loading" ? loadingAssets : assets;
  const renderedAssets = visibleAssets.slice(0, shown);

  const switchView = (next: OwnerView) => {
    setView(next);
    setShown(PAGE_SIZE);
  };

  return (
    <section className="seal-border rounded-[1.6rem] bg-cream/95 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-[0.28em] text-cinnabar">ZHAOWU GALLERY</p>
          <h1 className="mt-1 font-display text-3xl">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-soft">{copy.lead}</p>
        </div>
        <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-mute">{assets.length}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-line bg-paper/42 px-4 py-3">
          <p className="text-xs tracking-[0.14em] text-wood">COMPACT LIBRARY</p>
          <p className="mt-1 text-sm leading-6 text-ink-soft">{copy.compactLead}</p>
        </div>
        <label className={`inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-cinnabar px-5 text-sm text-cream shadow-sm ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? copy.uploading : view === "loading" ? copy.uploadLoading : copy.upload}
          <input type="file" multiple accept={view === "loading" ? "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/avif"} className="hidden" onChange={(e) => void onUpload(e)} />
        </label>
      </div>

      {message ? <p className="mt-3 rounded-xl border border-line bg-paper/40 px-4 py-3 text-sm text-cinnabar">{message}</p> : null}

      <details data-owner-gallery-drawer open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="mt-5 overflow-hidden rounded-2xl border border-line bg-paper/32">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:hidden sm:px-5">
          <span>
            <span className="block text-[10px] tracking-[0.18em] text-cinnabar">IMAGE LIBRARY</span>
            <span className="mt-1 block font-display text-lg text-ink">{open ? copy.closeGallery : copy.openGallery}</span>
          </span>
          <span className="flex flex-wrap items-center justify-end gap-2 text-xs text-ink-mute">
            <span>{copy.atlas} {atlasAssets.length}</span><span>·</span><span>{copy.loading} {loadingAssets.length}</span><span>·</span><span>{copy.all} {assets.length}</span>
            <span aria-hidden="true" className={`ml-1 text-lg transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
          </span>
        </summary>

        {open ? (
          <div className="border-t border-line px-4 pb-5 pt-4 sm:px-5">
            <div className="flex flex-wrap gap-2" aria-label={tr(locale, "圖庫檢視", "图库检视", "Gallery view")}>
              {(["atlas", "loading", "all"] as OwnerView[]).map((item) => (
                <button key={item} type="button" onClick={() => switchView(item)} aria-pressed={view === item} className={`min-h-10 rounded-full border px-4 text-sm ${view === item ? "border-cinnabar/50 bg-cinnabar text-cream" : "border-line bg-cream text-ink-soft"}`}>
                  {item === "atlas" ? copy.atlas : item === "loading" ? copy.loading : copy.all}
                  <span className="ml-2 opacity-70">{item === "atlas" ? atlasAssets.length : item === "loading" ? loadingAssets.length : assets.length}</span>
                </button>
              ))}
            </div>

            {!visibleAssets.length ? <p className="mt-4 text-sm text-ink-mute">{copy.empty}</p> : null}

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {renderedAssets.map((asset) => {
                const catalogLocked = asset.id.startsWith("catalog:");
                const animation = (asset.tags ?? []).includes("animation") || (asset.content_type ?? "").includes("animation");
                return (
                  <article key={asset.id} className="overflow-hidden rounded-xl border border-line bg-cream/72">
                    <button type="button" className="block w-full" onClick={() => setPreview(asset)} aria-label={`${copy.preview} ${asset.title}`}>
                      <img src={assetSrc(asset)} alt={asset.title || "gallery image"} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover object-top" />
                    </button>
                    <div className="p-3">
                      <p className="truncate text-xs font-medium sm:text-sm">{asset.title}</p>
                      {animation ? <p className="mt-1 text-[11px] tracking-[0.18em] text-ink-mute">ANIMATION</p> : null}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        {catalogLocked ? (
                          <>
                            <span className="text-[11px] text-ink-mute">{copy.catalogLock}</span>
                            <button type="button" className="rounded-full px-2 py-1 text-[11px] text-wood" onClick={() => setPreview(asset)}>{copy.preview}</button>
                          </>
                        ) : (
                          <>
                            <label className="flex items-center gap-1.5 text-[11px]">
                              <input type="checkbox" checked={asset.enabled} onChange={async (event) => {
                                try {
                                  await setGalleryAssetEnabled(session, asset.id, event.target.checked);
                                  await load();
                                  notifyGalleryChanged();
                                } catch (error) {
                                  setMessage(error instanceof Error ? error.message : copy.failed);
                                }
                              }} />
                              {copy.enabled}
                            </label>
                            <button type="button" onClick={async () => {
                              if (!window.confirm(`${copy.remove} ${asset.title}?`)) return;
                              try {
                                await deleteGalleryAsset(session, asset);
                                await load();
                                notifyGalleryChanged();
                              } catch (error) {
                                setMessage(error instanceof Error ? error.message : copy.failed);
                              }
                            }} className="rounded-full px-2 py-1 text-[11px] text-cinnabar">{copy.remove}</button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {shown < visibleAssets.length ? (
              <div className="mt-5 flex justify-center"><button type="button" className="min-h-10 rounded-full border border-line bg-cream px-5 text-sm text-ink-soft" onClick={() => setShown((current) => current + PAGE_SIZE)}>{copy.more}</button></div>
            ) : null}
          </div>
        ) : null}
      </details>

      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4" role="dialog" aria-modal="true" aria-label={copy.preview} onClick={() => setPreview(null)}>
          <div className="max-h-[86vh] w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-cream p-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-display text-lg">{preview.title}</p>
              <button type="button" className="rounded-full border border-line px-3 py-1 text-xs" onClick={() => setPreview(null)}>{copy.closePreview}</button>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl bg-paper">
              {previewMedia(preview).type === "video" ? (
                <video className="max-h-[70vh] w-full object-contain" src={previewMedia(preview).src} poster={previewMedia(preview).poster} controls autoPlay muted playsInline />
              ) : (
                <img className="max-h-[70vh] w-full object-contain" src={previewMedia(preview).src} alt={preview.title} />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
