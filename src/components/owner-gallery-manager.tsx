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

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function notifyGalleryChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-gallery-change"));
}

export function OwnerGalleryManager({ session, locale }: { session: SupabaseSession; locale: Locale }) {
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const copy = useMemo(() => ({
    title: tr(locale, "昭梧總圖庫", "昭梧总图库", "Zhaowu Gallery"),
    lead: tr(
      locale,
      "你只需要把喜歡的圖放進來。分類、五行、用途、客戶匹配與背景調用都由系統在後台處理，不需要你手動整理。",
      "你只需要把喜欢的图放进来。分类、五行、用途、客户匹配与背景调用都由系统在后台处理，不需要你手动整理。",
      "Just add the images you want to keep. Internal classification, visual tags, client matching and background use are handled automatically behind the scenes.",
    ),
    upload: tr(locale, "選圖並加入總圖庫", "选图并加入总图库", "Add images"),
    uploading: tr(locale, "加入中…", "加入中…", "Adding…"),
    empty: tr(locale, "總圖庫目前沒有圖片。", "总图库目前没有图片。", "The gallery is empty."),
    enabled: tr(locale, "可使用", "可使用", "Available"),
    remove: tr(locale, "刪除", "删除", "Delete"),
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
      notifyGalleryChanged();
      setMessage(tr(locale, `已加入 ${files.length} 張。`, `已加入 ${files.length} 张。`, `Added ${files.length} image${files.length === 1 ? "" : "s"}.`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    } finally {
      setBusy(false);
    }
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

      <div className="mt-5 flex justify-end rounded-lg border border-line bg-paper/45 p-3">
        <label className={`inline-flex min-h-11 cursor-pointer items-center rounded-full bg-cinnabar px-5 text-sm text-cream ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? copy.uploading : copy.upload}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => void onUpload(e)} />
        </label>
      </div>

      {message ? <p className="mt-3 text-sm text-cinnabar">{message}</p> : null}
      {!assets.length ? <p className="mt-4 text-sm text-ink-mute">{copy.empty}</p> : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <article key={asset.id} className="overflow-hidden rounded-xl border border-line bg-paper/35">
            <img
              src={galleryPublicUrl(asset.storage_path, asset.bucket_id)}
              alt={asset.title || "gallery image"}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover object-top"
            />
            <div className="p-3">
              <p className="truncate text-sm font-medium">{asset.title}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={asset.enabled}
                    onChange={async (e) => {
                      try {
                        await setGalleryAssetEnabled(session, asset.id, e.target.checked);
                        await load();
                        notifyGalleryChanged();
                      } catch (error) {
                        setMessage(error instanceof Error ? error.message : copy.failed);
                      }
                    }}
                  />
                  {copy.enabled}
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(`${copy.remove} ${asset.title}?`)) return;
                    try {
                      await deleteGalleryAsset(session, asset);
                      await load();
                      notifyGalleryChanged();
                    } catch (error) {
                      setMessage(error instanceof Error ? error.message : copy.failed);
                    }
                  }}
                  className="rounded-full px-3 py-1.5 text-xs text-cinnabar"
                >
                  {copy.remove}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
