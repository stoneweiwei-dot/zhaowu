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
import {
  GALLERY_GROUP_ORDER,
  galleryDisplayGroup,
  isPublicAtlasAsset,
  sortGalleryAssets,
  type GalleryDisplayGroup,
} from "@/lib/gallery-groups";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function notifyGalleryChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-gallery-change"));
}

type OwnerFilter = "atlas" | "all" | GalleryDisplayGroup;

export function OwnerGalleryManager({ session, locale }: { session: SupabaseSession; locale: Locale }) {
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<OwnerFilter>("atlas");

  const copy = useMemo(() => ({
    title: tr(locale, "昭梧總圖庫", "昭梧总图库", "Zhaowu Gallery"),
    lead: tr(
      locale,
      "你只需要把喜歡的圖放進來。現有圖片已按聖像、道韻、瑞獸、吉祥、命理圖、近期上傳與其他用途整理；分類只影響圖庫檢視，不會反過來改動命理判斷。",
      "你只需要把喜欢的图放进来。现有图片已按圣像、道韵、瑞兽、吉祥、命理图、近期上传与其他用途整理；分类只影响图库检视，不会反过来改动命理判断。",
      "Add the images you want to keep. Existing assets are organised into sacred, Daoist, guardian-beast, auspicious, destiny-art, recent-upload and utility groups. Gallery organisation never changes the reading itself.",
    ),
    upload: tr(locale, "選圖並加入總圖庫", "选图并加入总图库", "Add images"),
    uploading: tr(locale, "加入中…", "加入中…", "Adding…"),
    empty: tr(locale, "這個分組目前沒有圖片。", "这个分组目前没有图片。", "This group is empty."),
    enabled: tr(locale, "可使用", "可使用", "Available"),
    remove: tr(locale, "刪除", "删除", "Delete"),
    failed: tr(locale, "圖庫操作失敗。", "图库操作失败。", "Gallery operation failed."),
    filters: {
      atlas: tr(locale, "吉象圖鑑", "吉象图鉴", "Public atlas"),
      all: tr(locale, "全部", "全部", "All"),
      buddhist: tr(locale, "聖像", "圣像", "Sacred"),
      daoist: tr(locale, "道韻", "道韵", "Daoist"),
      "guardian-beast": tr(locale, "瑞獸", "瑞兽", "Guardian beasts"),
      auspicious: tr(locale, "吉祥·風水", "吉祥·风水", "Auspicious / Feng shui"),
      "report-art": tr(locale, "命理圖", "命理图", "Destiny art"),
      "recent-upload": tr(locale, "近期上傳", "近期上传", "Recent uploads"),
      reference: tr(locale, "風格參考", "风格参考", "References"),
      background: tr(locale, "背景", "背景", "Backgrounds"),
      "dragon-sticker": tr(locale, "小綠龍", "小绿龙", "Dragon stickers"),
      "tea-guardian": tr(locale, "茶仙", "茶仙", "Tea guardians"),
      other: tr(locale, "其他", "其他", "Other"),
    } satisfies Record<OwnerFilter, string>,
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
      setFilter("recent-upload");
      notifyGalleryChanged();
      setMessage(tr(locale, `已加入 ${files.length} 張。`, `已加入 ${files.length} 张。`, `Added ${files.length} image${files.length === 1 ? "" : "s"}.`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.failed);
    } finally {
      setBusy(false);
    }
  }

  const organizedAssets = useMemo(() => sortGalleryAssets(assets), [assets]);

  const counts = useMemo(() => {
    const value: Record<OwnerFilter, number> = {
      atlas: 0,
      all: assets.length,
      buddhist: 0,
      daoist: 0,
      "guardian-beast": 0,
      auspicious: 0,
      "report-art": 0,
      reference: 0,
      "recent-upload": 0,
      background: 0,
      "dragon-sticker": 0,
      "tea-guardian": 0,
      other: 0,
    };
    for (const asset of assets) {
      value[galleryDisplayGroup(asset)] += 1;
      if (isPublicAtlasAsset(asset)) value.atlas += 1;
    }
    return value;
  }, [assets]);

  const visibleAssets = useMemo(() => {
    if (filter === "all") return organizedAssets;
    if (filter === "atlas") return organizedAssets.filter(isPublicAtlasAsset);
    return organizedAssets.filter((asset) => galleryDisplayGroup(asset) === filter);
  }, [filter, organizedAssets]);

  const filterOptions: OwnerFilter[] = ["atlas", "all", ...GALLERY_GROUP_ORDER];

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

      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2" aria-label={tr(locale, "圖庫分組", "图库分组", "Gallery groups")}>
        {filterOptions.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setFilter(group)}
            aria-pressed={filter === group}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs ${filter === group ? "border-cinnabar/50 bg-cinnabar text-cream" : "border-line bg-paper text-ink-soft"}`}
          >
            {copy.filters[group]} <span className="opacity-70">{counts[group]}</span>
          </button>
        ))}
      </div>

      {message ? <p className="mt-3 text-sm text-cinnabar">{message}</p> : null}
      {!visibleAssets.length ? <p className="mt-4 text-sm text-ink-mute">{copy.empty}</p> : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleAssets.map((asset) => {
          const group = galleryDisplayGroup(asset);
          return (
            <article key={asset.id} className="overflow-hidden rounded-xl border border-line bg-paper/35">
              <img
                src={galleryPublicUrl(asset.storage_path, asset.bucket_id)}
                alt={asset.title || "gallery image"}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover object-top"
              />
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-medium">{asset.title}</p>
                  <span className="shrink-0 rounded-full border border-line bg-cream px-2 py-1 text-[10px] text-ink-mute">{copy.filters[group]}</span>
                </div>
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
          );
        })}
      </div>
    </section>
  );
}
