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

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function notifyGalleryChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-gallery-change"));
}

type OwnerView = "atlas" | "all";
const PAGE_SIZE = 18;

function assetSrc(asset: GalleryAsset) {
  return galleryPublicUrl(asset.storage_path, asset.bucket_id);
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
    title: tr(locale, "總圖庫", "总图库", "Gallery"),
    lead: tr(
      locale,
      "只管理要保留的內容圖片；登入畫面在上方獨立管理，網站 Loading 與介面小素材不會混進這裡。",
      "只管理要保留的内容图片；登录画面在上方独立管理，网站 Loading 与界面小素材不会混进这里。",
      "Manage content images only. Login visuals are handled separately above, and internal loading/UI assets are excluded.",
    ),
    upload: tr(locale, "加入圖片", "加入图片", "Add images"),
    uploading: tr(locale, "加入中…", "加入中…", "Adding…"),
    atlas: tr(locale, "吉象圖鑑", "吉象图鉴", "Public atlas"),
    all: tr(locale, "全部內容圖", "全部内容图", "All content images"),
    openGallery: tr(locale, "打開圖庫", "打开图库", "Open gallery"),
    closeGallery: tr(locale, "收起圖庫", "收起图库", "Close gallery"),
    empty: tr(locale, "目前沒有圖片。", "目前没有图片。", "No images in this view."),
    enabled: tr(locale, "可使用", "可使用", "Available"),
    remove: tr(locale, "刪除", "删除", "Delete"),
    more: tr(locale, "載入更多", "加载更多", "Load more"),
    preview: tr(locale, "預覽", "预览", "Preview"),
    closePreview: tr(locale, "關閉", "关闭", "Close"),
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
        await uploadGalleryAsset(session, file, {
          category: "visual-library",
          tags: ["owner-upload", "auto-classify"],
          primary: false,
        });
      }
      await load();
      setView("all");
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

  const libraryAssets = useMemo(() => assets.filter((asset) => !isLoadingGalleryAsset(asset)), [assets]);
  const atlasAssets = useMemo(() => libraryAssets.filter(isPublicAtlasAsset), [libraryAssets]);
  const visibleAssets = view === "atlas" ? atlasAssets : libraryAssets;
  const renderedAssets = visibleAssets.slice(0, shown);

  const switchView = (next: OwnerView) => {
    setView(next);
    setShown(PAGE_SIZE);
  };

  return (
    <section className="seal-border rounded-[1.35rem] bg-cream/92 p-4 sm:p-6" data-owner-content-gallery>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.22em] text-wood">CONTENT LIBRARY</p>
          <h2 className="mt-1 font-display text-2xl">{copy.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{copy.lead}</p>
        </div>
        <span className="shrink-0 rounded-full border border-line bg-paper/70 px-3 py-1 text-xs text-ink-mute">{libraryAssets.length}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[#1f4e3a] px-4 text-sm text-[#faf8f1] ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? copy.uploading : copy.upload}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => void onUpload(e)} />
        </label>
        <button type="button" className="min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink-soft" onClick={() => setOpen((value) => !value)}>
          {open ? copy.closeGallery : copy.openGallery}
        </button>
      </div>

      {message ? <p className="mt-3 rounded-xl border border-line bg-paper/40 px-4 py-3 text-sm text-cinnabar">{message}</p> : null}

      {open ? (
        <div className="mt-4 border-t border-line/70 pt-4">
          <div className="flex flex-wrap gap-2" aria-label={tr(locale, "圖庫檢視", "图库检视", "Gallery view")}>
            {(["atlas", "all"] as OwnerView[]).map((item) => (
              <button key={item} type="button" onClick={() => switchView(item)} aria-pressed={view === item} className={`min-h-10 rounded-full border px-4 text-sm ${view === item ? "border-cinnabar/50 bg-cinnabar text-cream" : "border-line bg-cream text-ink-soft"}`}>
                {item === "atlas" ? copy.atlas : copy.all}
                <span className="ml-2 opacity-70">{item === "atlas" ? atlasAssets.length : libraryAssets.length}</span>
              </button>
            ))}
          </div>

          {!visibleAssets.length ? <p className="mt-4 text-sm text-ink-mute">{copy.empty}</p> : null}

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {renderedAssets.map((asset) => (
              <article key={asset.id} className="overflow-hidden rounded-xl border border-line bg-cream/72">
                <button type="button" className="block w-full" onClick={() => setPreview(asset)} aria-label={`${copy.preview} ${asset.title}`}>
                  <img src={assetSrc(asset)} alt={asset.title || "gallery image"} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover object-top" />
                </button>
                <div className="p-3">
                  <p className="truncate text-xs font-medium sm:text-sm">{asset.title}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
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
                  </div>
                </div>
              </article>
            ))}
          </div>

          {shown < visibleAssets.length ? (
            <div className="mt-5 flex justify-center">
              <button type="button" className="min-h-10 rounded-full border border-line bg-cream px-5 text-sm text-ink-soft" onClick={() => setShown((current) => current + PAGE_SIZE)}>{copy.more}</button>
            </div>
          ) : null}
        </div>
      ) : null}

      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4" role="dialog" aria-modal="true" aria-label={copy.preview} onClick={() => setPreview(null)}>
          <div className="max-h-[86vh] w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-cream p-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-display text-lg">{preview.title}</p>
              <button type="button" className="rounded-full border border-line px-3 py-1 text-xs" onClick={() => setPreview(null)}>{copy.closePreview}</button>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl bg-paper">
              <img className="max-h-[70vh] w-full object-contain" src={assetSrc(preview)} alt={preview.title} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
