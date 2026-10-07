import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { Locale } from "@/lib/i18n";
import type { SupabaseSession } from "@/lib/bridge/supabase-rest";
import {
  deleteGalleryAsset,
  galleryPublicUrl,
  listOwnerGalleryAssets,
  uploadGalleryAsset,
  type GalleryAsset,
} from "@/lib/bridge/gallery-assets";
import { OWNER_GALLERY_GROUP_ORDER, isLoadingGalleryAsset, isOfficialSongGalleryAsset, matchesOwnerGalleryGroup, type OwnerGalleryGroup } from "@/lib/gallery-groups";
import { SUPABASE_STORAGE_WRITES_PAUSED } from "@/lib/storage-write-policy";
import { setBackgroundWallpaper, uploadBackground } from "@/lib/bridge/background-assets";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function notifyGalleryChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-gallery-change"));
}

const PAGE_SIZE = 18;

function assetSrc(asset: GalleryAsset) {
  return galleryPublicUrl(asset.storage_path, asset.bucket_id);
}

export function OwnerGalleryManager({ session, locale }: { session: SupabaseSession; locale: Locale }) {
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [group, setGroup] = useState<OwnerGalleryGroup>("owner-upload");
  const [open, setOpen] = useState(true);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [preview, setPreview] = useState<GalleryAsset | null>(null);
  const [backgroundBusyId, setBackgroundBusyId] = useState<string | null>(null);

  const copy = useMemo(() => ({
    title: tr(locale, "圖片素材", "图片素材", "Image library"),
    upload: tr(locale, "加入圖片", "加入图片", "Add images"),
    uploading: tr(locale, "加入中…", "加入中…", "Adding…"),
    songMaster: tr(locale, "正式宋式母圖", "正式宋式母图", "Official Song masters"),
    dayMaster: tr(locale, "十天干", "十天干", "Ten heavenly stems"),
    monthCommand: tr(locale, "十二地支／月令", "十二地支／月令", "Twelve earthly branches"),
    luckFiveElements: tr(locale, "五行運圖", "五行运图", "Five-element luck"),
    auspicious: tr(locale, "吉祥紋樣", "吉祥纹样", "Auspicious motifs"),
    ownerUpload: tr(locale, "私人上傳", "私人上传", "Private uploads"),
    legacy: tr(locale, "舊素材", "旧素材", "Legacy assets"),
    openGallery: tr(locale, "打開圖庫", "打开图库", "Open gallery"),
    closeGallery: tr(locale, "收起圖庫", "收起图库", "Close gallery"),
    empty: tr(locale, "目前沒有圖片。", "目前没有图片。", "No images in this view."),
    remove: tr(locale, "刪除", "删除", "Delete"),
    qcBlocked: tr(locale, "品質未通過", "质量未通过", "Quality blocked"),
    setHomeBackground: tr(locale, "設為首頁背景", "设为首页背景", "Set as homepage background"),
    settingHomeBackground: tr(locale, "套用中…", "套用中…", "Applying…"),
    homeBackgroundSet: tr(locale, "已設為首頁背景。", "已设为首页背景。", "Homepage background updated."),
    homeBackgroundHint: tr(locale, "點圖片可預覽；要換首頁背景，直接點該圖片下方的「設為首頁背景」。", "点图片可预览；要换首页背景，直接点该图片下方的“设为首页背景”。", "Tap an image to preview it, or use “Set as homepage background” on that image."),
    more: tr(locale, "載入更多", "加载更多", "Load more"),
    preview: tr(locale, "預覽", "预览", "Preview"),
    closePreview: tr(locale, "關閉", "关闭", "Close"),
    failed: tr(locale, "圖庫操作失敗。", "图库操作失败。", "Gallery operation failed."),
  }), [locale]);

  async function load() {
    try {
      const next = await listOwnerGalleryAssets(session);
      setAssets(next);
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
      setGroup("owner-upload");
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

  const libraryAssets = useMemo(
    () => assets.filter((asset) => asset.category === "visual-library" && !isLoadingGalleryAsset(asset)),
    [assets],
  );
  const groupCounts = useMemo(() => Object.fromEntries(
    OWNER_GALLERY_GROUP_ORDER.map((item) => [
      item,
      libraryAssets.filter((asset) => matchesOwnerGalleryGroup(asset, item)).length,
    ]),
  ) as Record<OwnerGalleryGroup, number>, [libraryAssets]);
  const visibleAssets = useMemo(
    () => libraryAssets.filter((asset) => matchesOwnerGalleryGroup(asset, group)),
    [libraryAssets, group],
  );
  const renderedAssets = visibleAssets.slice(0, shown);
  const protectedAsset = (asset: GalleryAsset) => isOfficialSongGalleryAsset(asset) || asset.bucket_id === "public-fallback";
  const qcBlockedAsset = (asset: GalleryAsset) => asset.tags.includes("qc-blocked-ghosting");
  const switchGroup = (next: OwnerGalleryGroup) => {
    setGroup(next);
    setShown(PAGE_SIZE);
  };

  const groupLabel = (item: OwnerGalleryGroup) => {
    if (item === "song-master") return copy.songMaster;
    if (item === "day-master") return copy.dayMaster;
    if (item === "month-command") return copy.monthCommand;
    if (item === "luck-five-elements") return copy.luckFiveElements;
    if (item === "auspicious") return copy.auspicious;
    if (item === "owner-upload") return copy.ownerUpload;
    return copy.legacy;
  };

  async function setAsHomepageBackground(asset: GalleryAsset) {
    if (busy || backgroundBusyId || SUPABASE_STORAGE_WRITES_PAUSED || qcBlockedAsset(asset)) return;
    setBackgroundBusyId(asset.id);
    setMessage(null);
    try {
      const response = await fetch(assetSrc(asset));
      if (!response.ok) throw new Error(tr(locale, "圖片讀取失敗。", "图片读取失败。", "Could not load this image."));
      const blob = await response.blob();
      const contentType = blob.type || asset.content_type || "image/webp";
      if (!contentType.startsWith("image/")) throw new Error(tr(locale, "這個素材不是可用圖片。", "这个素材不是可用图片。", "This asset is not a usable image."));
      const ext = contentType.includes("jpeg") ? "jpg" : contentType.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "webp";
      const file = new File([blob], `homepage-${asset.asset_key || asset.id}.${ext}`, { type: contentType });
      const background = await uploadBackground(session, file);
      await setBackgroundWallpaper(session, background.id);
      window.dispatchEvent(new Event("zhaowu-background-change"));
      setMessage(copy.homeBackgroundSet);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    } finally {
      setBackgroundBusyId(null);
    }
  }

  return (
    <section className="seal-border rounded-2xl bg-cream/92 p-4 sm:p-5" data-owner-content-gallery>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.22em] text-wood">CONTENT LIBRARY</p>
          <h2 className="mt-1 font-display text-xl leading-tight">{copy.title}</h2>
        </div>
        <span className="shrink-0 rounded-full border border-line bg-paper/70 px-3 py-1 text-xs text-ink-mute">{libraryAssets.length}</span>
      </div>

      <p className="mt-3 text-sm leading-6 text-ink-mute">{copy.homeBackgroundHint}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[#1f4e3a] px-4 text-sm text-[#faf8f1] ${busy || SUPABASE_STORAGE_WRITES_PAUSED ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? copy.uploading : copy.upload}
          <input type="file" multiple disabled={SUPABASE_STORAGE_WRITES_PAUSED} accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => void onUpload(e)} />
        </label>
        <button type="button" className="min-h-11 rounded-full border border-line bg-paper/70 px-4 text-sm text-ink-soft" onClick={() => setOpen((value) => !value)}>
          {open ? copy.closeGallery : copy.openGallery}
        </button>
      </div>

      {SUPABASE_STORAGE_WRITES_PAUSED ? <p className="mt-3 text-xs font-medium text-ink-mute" data-owner-storage-status>{tr(locale, "Storage 寫入暫停", "Storage 写入暂停", "Storage read-only")}</p> : null}
      {message ? <p className="mt-3 rounded-xl border border-line bg-paper/40 px-4 py-3 text-sm text-cinnabar">{message}</p> : null}

      {open ? (
        <div className="mt-4 border-t border-line/70 pt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" aria-label={tr(locale, "圖庫分類", "图库分类", "Gallery groups")}>
            {OWNER_GALLERY_GROUP_ORDER.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchGroup(item)}
                aria-pressed={group === item}
                className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 text-left text-sm ${group === item ? "border-[#315f51] bg-[#315f51] text-[#fffaf0]" : "border-line bg-paper/55 text-ink-soft"}`}
              >
                <span className="min-w-0 leading-tight">{groupLabel(item)}</span>
                <span className="shrink-0 text-[11px] opacity-70">{groupCounts[item]}</span>
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
                  <div className="mt-3 grid gap-2">
                    <button
                      type="button"
                      disabled={Boolean(backgroundBusyId) || SUPABASE_STORAGE_WRITES_PAUSED || qcBlockedAsset(asset)}
                      className="min-h-10 rounded-full bg-[#315f51] px-3 text-xs font-medium text-[#fffaf0] disabled:opacity-40"
                      onClick={() => void setAsHomepageBackground(asset)}
                    >
                      {backgroundBusyId === asset.id ? copy.settingHomeBackground : qcBlockedAsset(asset) ? copy.qcBlocked : copy.setHomeBackground}
                    </button>
                    {!protectedAsset(asset) ? (
                      <button type="button" onClick={async () => {
                        if (!window.confirm(`${copy.remove} ${asset.title}?`)) return;
                        try {
                          await deleteGalleryAsset(session, asset);
                          await load();
                          notifyGalleryChanged();
                        } catch (error) {
                          setMessage(error instanceof Error ? error.message : copy.failed);
                        }
                      }} className="min-h-9 rounded-full border border-cinnabar/25 px-3 text-xs text-cinnabar">{copy.remove}</button>
                    ) : null}
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
