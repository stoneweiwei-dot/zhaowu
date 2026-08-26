import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { Locale } from "@/lib/i18n";
import type { SupabaseSession } from "@/lib/supabase-rest";
import { TEA_PROFILES } from "@/lib/tea/guardian";
import {
  deleteGalleryAsset,
  galleryPublicUrl,
  listOwnerGalleryAssets,
  setGalleryAssetEnabled,
  setGalleryAssetPrimary,
  uploadGalleryAsset,
  type GalleryAsset,
} from "@/lib/gallery-assets";

const CATEGORIES = [
  "tea-guardian",
  "buddhist",
  "daoist",
  "guardian-beast",
  "auspicious-motif",
  "report-art",
  "background",
  "dragon-sticker",
] as const;

function tr(locale: Locale, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

export function OwnerGalleryManager({ session, locale }: { session: SupabaseSession; locale: Locale }) {
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("tea-guardian");
  const [filter, setFilter] = useState<string>("all");
  const [assetKey, setAssetKey] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [primary, setPrimary] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const c = useMemo(() => ({
    kicker: "ZHAOWU GALLERY",
    title: tr(locale, "昭梧圖庫", "昭梧图库", "Zhaowu Gallery"),
    lead: tr(locale, "所有神像、茶仙、背景與報告插圖都放在這裡。網站只讀取目前主圖，不再把圖片寫死進程式。", "所有神像、茶仙、背景与报告插图都放在这里。网站只读取当前主图，不再把图片写死进程序。", "Store guardian art, tea imagery, backgrounds and report artwork here. The site reads the current primary asset instead of hard-coding images."),
    category: tr(locale, "分類", "分类", "Category"),
    key: tr(locale, "關聯鍵", "关联键", "Asset key"),
    keyHint: tr(locale, "例如 xihu-longjing；程式用這個鍵找圖。", "例如 xihu-longjing；程序用这个键找图。", "For example xihu-longjing. The app uses this key to find the image."),
    titleLabel: tr(locale, "圖片名稱（可選）", "图片名称（可选）", "Image title (optional)"),
    tags: tr(locale, "標籤（逗號分隔，可選）", "标签（逗号分隔，可选）", "Tags, comma-separated (optional)"),
    primary: tr(locale, "上傳後設為目前主圖", "上传后设为当前主图", "Set as current primary image"),
    upload: tr(locale, "選圖並上傳", "选图并上传", "Choose and upload"),
    uploading: tr(locale, "上傳中…", "上传中…", "Uploading…"),
    uploaded: (n: number) => tr(locale, `已上傳 ${n} 張。`, `已上传 ${n} 张。`, `Uploaded ${n} image${n === 1 ? "" : "s"}.`),
    failed: tr(locale, "圖庫操作失敗。", "图库操作失败。", "Gallery operation failed."),
    filter: tr(locale, "查看分類", "查看分类", "Filter"),
    all: tr(locale, "全部", "全部", "All"),
    empty: tr(locale, "目前這個分類沒有圖片。", "目前这个分类没有图片。", "No images in this category yet."),
    setPrimary: tr(locale, "設為主圖", "设为主图", "Set primary"),
    primaryNow: tr(locale, "目前主圖", "当前主图", "Current primary"),
    enabled: tr(locale, "啟用", "启用", "Enabled"),
    delete: tr(locale, "刪除", "删除", "Delete"),
    deleteConfirm: (name: string) => tr(locale, `刪除「${name}」？`, `删除“${name}”？`, `Delete “${name}”?`),
    multiHint: tr(locale, "一次選多張時，會以各自檔名自動建立關聯鍵；主圖設定只套用在單張上傳。", "一次选多张时，会以各自文件名自动建立关联键；主图设置只套用在单张上传。", "When uploading multiple files, each filename becomes its own asset key. Primary selection applies only to single-file uploads."),
  }), [locale]);

  async function load() {
    try {
      setAssets(await listOwnerGalleryAssets(session));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.failed);
    }
  }

  useEffect(() => { void load(); }, [session.access_token]);

  useEffect(() => {
    if (category !== "tea-guardian") return;
    if (!assetKey && TEA_PROFILES[0]) setAssetKey(TEA_PROFILES[0].id);
  }, [assetKey, category]);

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
          primary: files.length === 1 ? primary : false,
        });
      }
      await load();
      setTitle("");
      setTags("");
      setMessage(c.uploaded(files.length));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : c.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.28em] text-cinnabar">{c.kicker}</p>
          <h2 className="mt-1 font-display text-2xl">{c.title}</h2>
          <p className="mt-2 max-w-2xl text-xs leading-6 text-ink-mute">{c.lead}</p>
        </div>
        <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-mute">{assets.length}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-ink-soft">
          <span className="mb-1.5 block tracking-[0.12em] text-ink-mute">{c.category}</span>
          <select value={category} onChange={(e) => { const value = e.target.value as (typeof CATEGORIES)[number]; setCategory(value); if (value !== "tea-guardian") setAssetKey(""); }} className="h-11 w-full rounded-lg border border-line bg-paper/55 px-3 text-sm text-ink outline-none focus:border-cinnabar">
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label className="text-xs text-ink-soft">
          <span className="mb-1.5 block tracking-[0.12em] text-ink-mute">{c.key}</span>
          {category === "tea-guardian" ? (
            <select value={assetKey} onChange={(e) => setAssetKey(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-paper/55 px-3 text-sm text-ink outline-none focus:border-cinnabar">
              {TEA_PROFILES.map((tea) => <option key={tea.id} value={tea.id}>{tea.tea[locale]} · {tea.id}</option>)}
            </select>
          ) : (
            <input value={assetKey} onChange={(e) => setAssetKey(e.target.value)} placeholder="asset-key" className="h-11 w-full rounded-lg border border-line bg-paper/55 px-3 text-sm text-ink outline-none focus:border-cinnabar" />
          )}
          <span className="mt-1 block text-[11px] leading-5 text-ink-mute">{c.keyHint}</span>
        </label>

        <label className="text-xs text-ink-soft">
          <span className="mb-1.5 block tracking-[0.12em] text-ink-mute">{c.titleLabel}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-paper/55 px-3 text-sm text-ink outline-none focus:border-cinnabar" />
        </label>

        <label className="text-xs text-ink-soft">
          <span className="mb-1.5 block tracking-[0.12em] text-ink-mute">{c.tags}</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tea, guardian, song" className="h-11 w-full rounded-lg border border-line bg-paper/55 px-3 text-sm text-ink outline-none focus:border-cinnabar" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper/35 p-3">
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <input type="checkbox" checked={primary} onChange={(e) => setPrimary(e.target.checked)} />
          {c.primary}
        </label>
        <label className={`inline-flex min-h-11 cursor-pointer items-center rounded-full bg-cinnabar px-5 text-sm text-cream ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? c.uploading : c.upload}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => void onUpload(e)} />
        </label>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-ink-mute">{c.multiHint}</p>
      {message ? <p className="mt-3 text-sm text-cinnabar">{message}</p> : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <label className="flex items-center gap-2 text-xs text-ink-mute">
          {c.filter}
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-full border border-line bg-paper px-3 text-xs text-ink-soft">
            <option value="all">{c.all}</option>
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <span className="text-xs text-ink-mute">{visible.length}</span>
      </div>

      {!visible.length ? <p className="mt-4 text-sm text-ink-mute">{c.empty}</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {visible.map((asset) => (
          <article key={asset.id} className="overflow-hidden rounded-xl border border-line bg-paper/35">
            <img src={galleryPublicUrl(asset.storage_path)} alt={asset.title || asset.asset_key} loading="lazy" className="aspect-[4/3] w-full object-cover object-top" />
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{asset.title || asset.asset_key}</p>
                  <p className="mt-1 truncate text-[11px] text-ink-mute">{asset.category} / {asset.asset_key}</p>
                </div>
                {asset.is_primary ? <span className="shrink-0 rounded-full border border-wood/30 bg-wood/10 px-2 py-1 text-[10px] text-wood">{c.primaryNow}</span> : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs text-ink-soft">
                  <input type="checkbox" checked={asset.enabled} onChange={async (e) => {
                    try { await setGalleryAssetEnabled(session, asset.id, e.target.checked); await load(); }
                    catch (error) { setMessage(error instanceof Error ? error.message : c.failed); }
                  }} />
                  {c.enabled}
                </label>
                <div className="flex items-center gap-2">
                  {!asset.is_primary ? <button type="button" onClick={async () => {
                    try { await setGalleryAssetPrimary(session, asset); await load(); }
                    catch (error) { setMessage(error instanceof Error ? error.message : c.failed); }
                  }} className="rounded-full bg-wood px-3 py-1.5 text-xs text-cream">{c.setPrimary}</button> : null}
                  <button type="button" onClick={async () => {
                    if (!window.confirm(c.deleteConfirm(asset.title || asset.asset_key))) return;
                    try { await deleteGalleryAsset(session, asset); await load(); }
                    catch (error) { setMessage(error instanceof Error ? error.message : c.failed); }
                  }} className="rounded-full px-3 py-1.5 text-xs text-cinnabar">{c.delete}</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
