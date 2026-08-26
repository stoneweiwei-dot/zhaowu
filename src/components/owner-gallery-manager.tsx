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

const CATEGORIES = ["tea-guardian", "buddhist", "daoist", "guardian-beast", "auspicious-motif", "report-art", "background", "dragon-sticker"] as const;

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

export function OwnerGalleryManager({ session, locale }: { session: SupabaseSession; locale: Locale }) {
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("tea-guardian");
  const [filter, setFilter] = useState("all");
  const [assetKey, setAssetKey] = useState(TEA_CATALOG[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [primary, setPrimary] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const copy = useMemo(() => ({
    title: tr(locale, "昭梧圖庫", "昭梧图库", "Zhaowu Gallery"),
    lead: tr(locale, "神像、茶仙、背景與報告插圖統一放在 Supabase 圖庫。程式用「分類＋關聯鍵」找目前主圖。", "神像、茶仙、背景与报告插图统一放在 Supabase 图库。程序用“分类＋关联键”找当前主图。", "Store guardians, tea art, backgrounds and report images in one Supabase gallery. The app resolves the current primary image by category and asset key."),
    category: tr(locale, "分類", "分类", "Category"),
    key: tr(locale, "關聯鍵", "关联键", "Asset key"),
    titleLabel: tr(locale, "圖片名稱（可選）", "图片名称（可选）", "Title (optional)"),
    tags: tr(locale, "標籤，逗號分隔（可選）", "标签，逗号分隔（可选）", "Tags, comma separated (optional)"),
    primary: tr(locale, "上傳後設為目前主圖", "上传后设为当前主图", "Set as current primary image"),
    upload: tr(locale, "選圖並上傳", "选图并上传", "Choose and upload"),
    uploading: tr(locale, "上傳中…", "上传中…", "Uploading…"),
    all: tr(locale, "全部", "全部", "All"),
    empty: tr(locale, "這個分類目前沒有圖片。", "这个分类目前没有图片。", "No images in this category yet."),
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
          assetKey: files.length === 1 ? assetKey || undefined : undefined,
          title: files.length === 1 ? title || undefined : undefined,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          primary: files.length === 1 && primary,
        });
      }
      setTitle("");
      setTags("");
      await load();
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
        <label className="text-xs text-ink-soft"><span className="mb-1 block text-ink-mute">{copy.category}</span><select value={category} onChange={(e) => { const value = e.target.value as (typeof CATEGORIES)[number]; setCategory(value); setAssetKey(value === "tea-guardian" ? (TEA_CATALOG[0]?.id ?? "") : ""); }} className="h-11 w-full rounded-lg border border-line bg-paper px-3">{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-xs text-ink-soft"><span className="mb-1 block text-ink-mute">{copy.key}</span>{category === "tea-guardian" ? <select value={assetKey} onChange={(e) => setAssetKey(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-paper px-3">{TEA_CATALOG.map((tea) => <option key={tea.id} value={tea.id}>{tea.name[locale]} · {tea.id}</option>)}</select> : <input value={assetKey} onChange={(e) => setAssetKey(e.target.value)} placeholder="asset-key" className="h-11 w-full rounded-lg border border-line bg-paper px-3" />}</label>
        <label className="text-xs text-ink-soft"><span className="mb-1 block text-ink-mute">{copy.titleLabel}</span><input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-paper px-3" /></label>
        <label className="text-xs text-ink-soft"><span className="mb-1 block text-ink-mute">{copy.tags}</span><input value={tags} onChange={(e) => setTags(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-paper px-3" /></label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper/45 p-3">
        <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" checked={primary} onChange={(e) => setPrimary(e.target.checked)} />{copy.primary}</label>
        <label className={`inline-flex min-h-11 cursor-pointer items-center rounded-full bg-cinnabar px-5 text-sm text-cream ${busy ? "pointer-events-none opacity-50" : ""}`}>{busy ? copy.uploading : copy.upload}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => void onUpload(e)} /></label>
      </div>
      {message ? <p className="mt-3 text-sm text-cinnabar">{message}</p> : null}

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-full border border-line bg-paper px-3 text-xs"><option value="all">{copy.all}</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
        <span className="text-xs text-ink-mute">{visible.length}</span>
      </div>

      {!visible.length ? <p className="mt-4 text-sm text-ink-mute">{copy.empty}</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((asset) => <article key={asset.id} className="overflow-hidden rounded-xl border border-line bg-paper/35">
          <img src={galleryPublicUrl(asset.storage_path)} alt={asset.title || asset.asset_key} loading="lazy" className="aspect-[4/3] w-full object-cover object-top" />
          <div className="p-3">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-medium">{asset.title || asset.asset_key}</p><p className="truncate text-[11px] text-ink-mute">{asset.category} / {asset.asset_key}</p></div>{asset.is_primary ? <span className="shrink-0 rounded-full bg-wood/10 px-2 py-1 text-[10px] text-wood">{copy.primaryNow}</span> : null}</div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={asset.enabled} onChange={async (e) => { try { await setGalleryAssetEnabled(session, asset.id, e.target.checked); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); } }} />{copy.enabled}</label>
              <div className="flex gap-2">{!asset.is_primary ? <button type="button" onClick={async () => { try { await setGalleryAssetPrimary(session, asset); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); } }} className="rounded-full bg-wood px-3 py-1.5 text-xs text-cream">{copy.setPrimary}</button> : null}<button type="button" onClick={async () => { if (!window.confirm(`${copy.remove} ${asset.title || asset.asset_key}?`)) return; try { await deleteGalleryAsset(session, asset); await load(); } catch (error) { setMessage(error instanceof Error ? error.message : copy.failed); } }} className="rounded-full px-3 py-1.5 text-xs text-cinnabar">{copy.remove}</button></div>
            </div>
          </div>
        </article>)}
      </div>
    </section>
  );
}
