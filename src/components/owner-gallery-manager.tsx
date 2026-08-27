import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { Locale } from "@/lib/i18n";
import type { SupabaseSession } from "@/lib/supabase-rest";
import { TEA_CATALOG } from "@/lib/tea-guardian";
import {
  deleteGalleryAsset,
  galleryPublicUrl,
  listOwnerGalleryAssets,
  setGalleryAssetEnabled,
  setGalleryAssetPrimary,
  uploadGalleryAsset,
  type GalleryAsset,
} from "@/lib/gallery-assets";

/*
 * Gallery buckets describe application behaviour only.
 * They must not pretend to identify a religion, deity, civilization or motif.
 * Semantic interpretation belongs to per-image knowledge metadata and may stay unknown.
 */
const CATEGORIES = ["visual-library", "tea-guardian", "background", "dragon-sticker"] as const;
type GalleryCategory = (typeof CATEGORIES)[number];

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function categoryLabel(locale: Locale, category: GalleryCategory) {
  const labels: Record<GalleryCategory, [string, string, string]> = {
    "visual-library": ["作品庫", "作品库", "Visual library"],
    "tea-guardian": ["茶仙系統圖", "茶仙系统图", "Tea system art"],
    background: ["網站背景", "网站背景", "Website backgrounds"],
    "dragon-sticker": ["小綠龍表情", "小绿龙表情", "Dragon stickers"],
  };
  const [hant, hans, en] = labels[category];
  return tr(locale, hant, hans, en);
}

function notifyGalleryChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-gallery-change"));
}

export function OwnerGalleryManager({ session, locale }: { session: SupabaseSession; locale: Locale }) {
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [category, setCategory] = useState<GalleryCategory>("visual-library");
  const [filter, setFilter] = useState("all");
  const [assetKey, setAssetKey] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [primary, setPrimary] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const copy = useMemo(() => ({
    title: tr(locale, "昭梧圖庫", "昭梧图库", "Zhaowu Gallery"),
    lead: tr(
      locale,
      "不再按佛、道、瑞獸或吉祥紋樣硬分組。一般作品統一進作品庫；系統只保留真正會影響網站功能的用途。需要圖片時，由昭梧依每張圖的已核准資料自行匹配。",
      "不再按佛、道、瑞兽或吉祥纹样硬分组。一般作品统一进作品库；系统只保留真正会影响网站功能的用途。需要图片时，由昭梧依每张图的已核准资料自行匹配。",
      "The Gallery no longer guesses Buddhist, Daoist, guardian-beast or motif categories. General artwork lives in one visual library; only real application roles remain. Zhaowu selects approved images from image-level metadata when needed.",
    ),
    category: tr(locale, "系統用途", "系统用途", "System role"),
    key: tr(locale, "關聯鍵", "关联键", "Asset key"),
    titleLabel: tr(locale, "圖片名稱（可選）", "图片名称（可选）", "Title (optional)"),
    tags: tr(locale, "備註標籤，逗號分隔（可選）", "备注标签，逗号分隔（可选）", "Notes / tags, comma separated (optional)"),
    primary: tr(locale, "上傳後設為目前主圖", "上传后设为当前主图", "Set as current primary image"),
    upload: tr(locale, "選圖並上傳", "选图并上传", "Choose and upload"),
    uploading: tr(locale, "上傳中…", "上传中…", "Uploading…"),
    all: tr(locale, "全部圖片", "全部图片", "All images"),
    empty: tr(locale, "這個用途目前沒有圖片。", "这个用途目前没有图片。", "No images in this role yet."),
    setPrimary: tr(locale, "設為主圖", "设为主图", "Set primary"),
    primaryNow: tr(locale, "目前主圖", "当前主图", "Current primary"),
    enabled: tr(locale, "啟用", "启用", "Enabled"),
    remove: tr(locale, "刪除", "删除", "Delete"),
    failed: tr(locale, "圖庫操作失敗。", "图库操作失败。", "Gallery operation failed."),
  }), [locale]);

  async function load() {
    try { setAssets(await listOwnerGalleryAssets(session)); }
    catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); }
  }

  useEffect(() => { void load(); }, [session.access_token]);

  const visible = useMemo(() => filter === "all" ? assets : assets.filter((asset) => asset.category === filter), [assets, filter]);

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setBusy(true);
    setMessage(null);
    try {
      for (const file of files) {
        await uploadGalleryAsset(session, file, {
          category,
          assetKey: category === "background" ? "site-wallpaper" : files.length === 1 ? assetKey || undefined : undefined,
          title: files.length === 1 ? title || undefined : undefined,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          primary: files.length === 1 && primary,
        });
      }
      setTitle("");
      setTags("");
      await load();
      notifyGalleryChanged();
      setMessage(tr(locale, `已上傳 ${files.length} 張。`, `已上传 ${files.length} 张。`, `Uploaded ${files.length} image${files.length === 1 ? "" : "s"}.`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    } finally { setBusy(false); }
  }

  return (
    <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.28em] text-cinnabar">ZHAOWU GALLERY</p>
          <h1 className="mt-1 font-display text-3xl">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-soft">{copy.lead}</p>
        </div>
        <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-mute">{assets.length}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-ink-soft">
          <span className="mb-1 block text-ink-mute">{copy.category}</span>
          <select
            value={category}
            onChange={(e) => {
              const value = e.target.value as GalleryCategory;
              setCategory(value);
              setAssetKey(value === "tea-guardian" ? (TEA_CATALOG[0]?.id ?? "") : value === "background" ? "site-wallpaper" : "");
            }}
            className="h-11 w-full rounded-lg border border-line bg-paper px-3"
          >
            {CATEGORIES.map((item) => <option key={item} value={item}>{categoryLabel(locale, item)}</option>)}
          </select>
        </label>
        <label className="text-xs text-ink-soft">
          <span className="mb-1 block text-ink-mute">{copy.key}</span>
          {category === "tea-guardian" ? (
            <select value={assetKey} onChange={(e) => setAssetKey(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-paper px-3">
              {TEA_CATALOG.map((tea) => <option key={tea.id} value={tea.id}>{tea.name[locale]} · {tea.id}</option>)}
            </select>
          ) : (
            <input
              value={assetKey}
              onChange={(e) => setAssetKey(e.target.value)}
              placeholder={category === "background" ? "site-wallpaper" : "optional-key"}
              disabled={category === "background"}
              className="h-11 w-full rounded-lg border border-line bg-paper px-3 disabled:opacity-70"
            />
          )}
        </label>
        <label className="text-xs text-ink-soft"><span className="mb-1 block text-ink-mute">{copy.titleLabel}</span><input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-paper px-3" /></label>
        <label className="text-xs text-ink-soft"><span className="mb-1 block text-ink-mute">{copy.tags}</span><input value={tags} onChange={(e) => setTags(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-paper px-3" /></label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper/45 p-3">
        <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={primary} onChange={(e) => setPrimary(e.target.checked)} />{copy.primary}</label>
        <label className={`inline-flex min-h-11 cursor-pointer items-center rounded-full bg-cinnabar px-5 text-sm text-cream ${busy ? "pointer-events-none opacity-50" : ""}`}>{busy ? copy.uploading : copy.upload}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => void onUpload(e)} /></label>
      </div>
      {message ? <p className="mt-3 text-sm text-cinnabar">{message}</p> : null}

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-full border border-line bg-paper px-3 text-xs">
          <option value="all">{copy.all}</option>
          {CATEGORIES.map((item) => <option key={item} value={item}>{categoryLabel(locale, item)}</option>)}
        </select>
        <span className="text-xs text-ink-mute">{visible.length}</span>
      </div>

      {!visible.length ? <p className="mt-4 text-sm text-ink-mute">{copy.empty}</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((asset) => (
          <article key={asset.id} className="overflow-hidden rounded-xl border border-line bg-paper/35">
            <img src={galleryPublicUrl(asset.storage_path, asset.bucket_id)} alt={asset.title || asset.asset_key} loading="lazy" className="aspect-[4/3] w-full object-cover object-top" />
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{asset.title || asset.asset_key}</p>
                  <p className="truncate text-[11px] text-ink-mute">{CATEGORIES.includes(asset.category as GalleryCategory) ? categoryLabel(locale, asset.category as GalleryCategory) : asset.category}</p>
                  {asset.tags?.length ? <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-ink-mute">{asset.tags.join(" · ")}</p> : null}
                </div>
                {asset.is_primary ? <span className="shrink-0 rounded-full bg-wood/10 px-2 py-1 text-[10px] text-wood">{copy.primaryNow}</span> : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={asset.enabled} onChange={async (e) => { try { await setGalleryAssetEnabled(session, asset.id, e.target.checked); await load(); notifyGalleryChanged(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); } }} />{copy.enabled}</label>
                <div className="flex gap-2">
                  {!asset.is_primary ? <button type="button" onClick={async () => { try { await setGalleryAssetPrimary(session, asset); await load(); notifyGalleryChanged(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); } }} className="rounded-full bg-wood px-3 py-1.5 text-xs text-cream">{copy.setPrimary}</button> : null}
                  <button type="button" onClick={async () => { if (!window.confirm(`${copy.remove} ${asset.title || asset.asset_key}?`)) return; try { await deleteGalleryAsset(session, asset); await load(); notifyGalleryChanged(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); } }} className="rounded-full px-3 py-1.5 text-xs text-cinnabar">{copy.remove}</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
