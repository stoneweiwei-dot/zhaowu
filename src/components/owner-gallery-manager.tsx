import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { Locale } from "@/lib/i18n";
import type { SupabaseSession } from "@/lib/bridge/supabase-rest";
import {
  deleteGalleryAsset,
  galleryPublicUrl,
  listOwnerGalleryAssets,
  setGalleryAssetEnabled,
  uploadGalleryAsset,
  type GalleryAsset,
} from "@/lib/bridge/gallery-assets";
import { OWNER_GALLERY_GROUP_ORDER, isLoadingGalleryAsset, isOfficialSongGalleryAsset, matchesOwnerGalleryGroup, type OwnerGalleryGroup } from "@/lib/gallery-groups";
import { SUPABASE_STORAGE_WRITES_PAUSED } from "@/lib/storage-write-policy";

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
  const [group, setGroup] = useState<OwnerGalleryGroup>("song-master");
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [preview, setPreview] = useState<GalleryAsset | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const copy = useMemo(() => ({
    title: tr(locale, "總圖庫", "总图库", "Gallery"),
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
    enabled: tr(locale, "可使用", "可使用", "Available"),
    remove: tr(locale, "刪除", "删除", "Delete"),
    select: tr(locale, "選取", "选择", "Select"),
    selectedOne: tr(locale, "已選", "已选", "Selected"),
    batchManage: tr(locale, "批次管理", "批次管理", "Bulk actions"),
    selected: (n: number) => tr(locale, `已選 ${n} 個`, `已选 ${n} 个`, `${n} selected`),
    selectVisible: tr(locale, "全選此分類", "全选此分类", "Select all in view"),
    clearSelection: tr(locale, "清除選取", "清除选择", "Clear"),
    enableSelected: tr(locale, "批次顯示", "批量显示", "Show selected"),
    disableSelected: tr(locale, "批次隱藏", "批量隐藏", "Hide selected"),
    deleteSelected: tr(locale, "批次刪除", "批量删除", "Delete selected"),
    shown: tr(locale, "顯示中", "显示中", "Shown"),
    hidden: tr(locale, "已隱藏", "已隐藏", "Hidden"),
    coreAsset: tr(locale, "核心資產", "核心资产", "Core asset"),
    qcBlocked: tr(locale, "QC 封鎖", "QC 封锁", "QC blocked"),
    batchDeleteConfirm: (n: number) => tr(locale, `刪除已選的 ${n} 個素材？此操作不可復原。`, `删除已选的 ${n} 个素材？此操作不可恢复。`, `Delete ${n} selected assets? This cannot be undone.`),
    batchDone: (n: number) => tr(locale, `已處理 ${n} 個素材。`, `已处理 ${n} 个素材。`, `Updated ${n} assets.`),
    more: tr(locale, "載入更多", "加载更多", "Load more"),
    preview: tr(locale, "預覽", "预览", "Preview"),
    closePreview: tr(locale, "關閉", "关闭", "Close"),
    failed: tr(locale, "圖庫操作失敗。", "图库操作失败。", "Gallery operation failed."),
  }), [locale]);

  async function load() {
    try {
      const next = await listOwnerGalleryAssets(session);
      setAssets(next);
      const ids = new Set(next.map((asset) => asset.id));
      setSelectedIds((current) => current.filter((id) => ids.has(id)));
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
  const selectedEnableableIds = selectedIds.filter((id) => {
    const asset = libraryAssets.find((item) => item.id === id);
    return asset ? !qcBlockedAsset(asset) : false;
  });
  const selectedDeletableIds = selectedIds.filter((id) => {
    const asset = libraryAssets.find((item) => item.id === id);
    return asset ? !protectedAsset(asset) : false;
  });

  const switchGroup = (next: OwnerGalleryGroup) => {
    setGroup(next);
    setSelectedIds([]);
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

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const selectVisible = () => {
    setSelectedIds(visibleAssets.map((asset) => asset.id));
  };

  async function setSelectedEnabled(enabled: boolean) {
    const targetIds = enabled ? selectedEnableableIds : selectedIds;
    if (busy || !targetIds.length) return;
    setBusy(true); setMessage(null);
    try {
      await Promise.all(targetIds.map((id) => setGalleryAssetEnabled(session, id, enabled)));
      const count = targetIds.length;
      await load();
      notifyGalleryChanged();
      setMessage(copy.batchDone(count));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    } finally { setBusy(false); }
  }

  async function deleteSelected() {
    if (busy || !selectedIds.length || !window.confirm(copy.batchDeleteConfirm(selectedIds.length))) return;
    setBusy(true); setMessage(null);
    try {
      const chosen = libraryAssets.filter((asset) => selectedDeletableIds.includes(asset.id));
      for (const asset of chosen) await deleteGalleryAsset(session, asset);
      const count = chosen.length;
      setSelectedIds([]);
      await load();
      notifyGalleryChanged();
      setMessage(copy.batchDone(count));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    } finally { setBusy(false); }
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

          <div data-owner-bulk-toolbar="gallery" className="mt-3 flex flex-wrap items-center gap-1.5 border-y border-line/70 py-2.5">
            <span className="mr-auto font-display text-sm text-ink">{selectedIds.length ? copy.selected(selectedIds.length) : copy.batchManage}</span>
            <button type="button" disabled={busy || !visibleAssets.length} className="min-h-9 rounded-full border border-line bg-paper/55 px-3 text-[11px] text-ink-soft disabled:opacity-35" onClick={selectVisible}>{copy.selectVisible}</button>
            <button type="button" disabled={busy || !selectedIds.length} className="min-h-9 rounded-full border border-line bg-paper/55 px-3 text-[11px] text-ink-soft disabled:opacity-35" onClick={() => setSelectedIds([])}>{copy.clearSelection}</button>
            <button type="button" disabled={busy || !selectedEnableableIds.length} className="min-h-9 rounded-full border border-wood/30 bg-wood/5 px-3 text-[11px] text-wood disabled:opacity-35" onClick={() => void setSelectedEnabled(true)}>{copy.enableSelected}</button>
            <button type="button" disabled={busy || !selectedIds.length} className="min-h-9 rounded-full border border-line bg-paper/55 px-3 text-[11px] text-ink-soft disabled:opacity-35" onClick={() => void setSelectedEnabled(false)}>{copy.disableSelected}</button>
            <button type="button" disabled={busy || !selectedDeletableIds.length} className="min-h-9 rounded-full bg-cinnabar px-3 text-[11px] text-cream disabled:opacity-35" onClick={() => void deleteSelected()}>{copy.deleteSelected}</button>
          </div>

          {!visibleAssets.length ? <p className="mt-4 text-sm text-ink-mute">{copy.empty}</p> : null}

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {renderedAssets.map((asset) => (
              <article key={asset.id} data-owner-selectable-file="gallery" className={`relative overflow-hidden rounded-xl border bg-cream/72 ${selectedIds.includes(asset.id) ? "border-wood/45 ring-1 ring-wood/15" : "border-line"}`}>
                <button type="button" aria-pressed={selectedIds.includes(asset.id)} onClick={() => toggleSelected(asset.id)} className={`absolute left-2 top-2 z-10 inline-flex min-h-9 items-center justify-center rounded-full border px-2.5 text-[10px] font-medium shadow-sm ${selectedIds.includes(asset.id) ? "border-wood bg-wood text-cream" : "border-line bg-cream/95 text-ink-soft"}`} aria-label={`${copy.select} ${asset.title}`}>
                  {selectedIds.includes(asset.id) ? `✓ ${copy.selectedOne}` : copy.select}
                </button>
                <button type="button" className="block w-full" onClick={() => setPreview(asset)} aria-label={`${copy.preview} ${asset.title}`}>
                  <img src={assetSrc(asset)} alt={asset.title || "gallery image"} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover object-top" />
                </button>
                <div className="p-3">
                  <p className="truncate text-xs font-medium sm:text-sm">{asset.title}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      aria-pressed={asset.enabled}
                      disabled={qcBlockedAsset(asset)}
                      className={`min-h-8 rounded-full border px-2.5 text-[10px] disabled:cursor-not-allowed ${qcBlockedAsset(asset) ? "border-cinnabar/25 bg-cinnabar/5 text-cinnabar" : asset.enabled ? "border-wood/30 bg-wood/5 text-wood" : "border-line bg-paper/55 text-ink-mute"}`}
                      onClick={async () => {
                        try {
                          await setGalleryAssetEnabled(session, asset.id, !asset.enabled);
                          await load();
                          notifyGalleryChanged();
                        } catch (error) {
                          setMessage(error instanceof Error ? error.message : copy.failed);
                        }
                      }}
                    >{qcBlockedAsset(asset) ? copy.qcBlocked : asset.enabled ? copy.shown : copy.hidden}</button>
                    {protectedAsset(asset) ? (
                      <span className="rounded-full border border-wood/25 bg-wood/5 px-2.5 py-1 text-[10px] text-wood">{copy.coreAsset}</span>
                    ) : (
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
                    )}
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
