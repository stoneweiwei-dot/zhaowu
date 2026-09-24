import * as base from "../gallery-assets";
import type { SupabaseSession } from "@/lib/supabase-rest";
import { isOwnerCookieSession, ownerData, uploadOwnerSignedFile, type OwnerUploadTicket } from "@/lib/owner-data-client";
import { assertSupabaseStorageWritesEnabled } from "@/lib/storage-write-policy";

export * from "../gallery-assets";

function safeSlug(value: string, fallback = "asset") {
  const clean = value.trim().toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return clean || fallback;
}

export async function listOwnerGalleryAssets(session: SupabaseSession, category?: string): Promise<base.GalleryAsset[]> {
  if (!isOwnerCookieSession(session)) return base.listOwnerGalleryAssets(session, category);
  const out = await ownerData<{ ok: true; items: base.GalleryAsset[] }>("gallery.list", { category: category ?? null });
  return out.items ?? [];
}

export async function uploadGalleryAsset(
  session: SupabaseSession,
  file: File,
  meta: { category: string; assetKey?: string; title?: string; tags?: string[]; primary?: boolean },
): Promise<base.GalleryAsset> {
  assertSupabaseStorageWritesEnabled();
  if (!isOwnerCookieSession(session)) return base.uploadGalleryAsset(session, file, meta);

  const isVideo = file.type === "video/mp4" || file.type === "video/webm";
  const loading = meta.category === "loading";
  if (loading) {
    if (!isVideo) throw new Error("登入動畫庫只接受 MP4／WebM 影片。");
    if (isVideo && file.size > 6 * 1024 * 1024) throw new Error("登入動畫影片不可超過 6 MB。");
  } else {
    const isImage = file.type.startsWith("image/");
    if (!isImage) throw new Error("只接受圖片檔。");
    if (file.size > 10 * 1024 * 1024) throw new Error("單張圖片不可超過 10 MB。");
  }

  const category = safeSlug(meta.category, "uncategorized");
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const assetKey = safeSlug(meta.assetKey || baseName, crypto.randomUUID());
  const prep = await ownerData<OwnerUploadTicket>("gallery.prepareUpload", {
    name: file.name,
    contentType: file.type || "application/octet-stream",
    size: file.size,
    category,
    assetKey,
  });
  try {
    await uploadOwnerSignedFile(prep, file);
    const out = await ownerData<{ ok: true; item: base.GalleryAsset }>("gallery.finalizeUpload", {
      uploadTicket: prep.uploadTicket,
      path: prep.path,
      category: prep.category,
      assetKey: prep.assetKey,
      title: (meta.title || file.name).slice(0, 180),
      contentType: prep.contentType,
      size: prep.expectedSizeBytes,
      tags: (meta.tags ?? []).map((tag) => tag.trim()).filter(Boolean).slice(0, 20),
      primary: Boolean(meta.primary),
    });
    return out.item;
  } catch (error) {
    await ownerData("upload.abort", { uploadTicket: prep.uploadTicket }).catch(() => undefined);
    throw error;
  }
}

export async function setGalleryAssetEnabled(session: SupabaseSession, id: string, enabled: boolean) {
  if (!isOwnerCookieSession(session)) return base.setGalleryAssetEnabled(session, id, enabled);
  await ownerData("gallery.setEnabled", { id, enabled });
}

export async function setGalleryAssetPrimary(session: SupabaseSession, asset: base.GalleryAsset) {
  if (!isOwnerCookieSession(session)) return base.setGalleryAssetPrimary(session, asset);
  await ownerData("gallery.setPrimary", { id: asset.id });
}

export async function setGalleryAssetTags(session: SupabaseSession, id: string, tags: string[]) {
  if (!isOwnerCookieSession(session)) return base.setGalleryAssetTags(session, id, tags);
  await ownerData("gallery.setTags", { id, tags: tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 20) });
}

export async function setLoginVisualCurrent(session: SupabaseSession, asset: base.GalleryAsset) {
  if (!isOwnerCookieSession(session)) return base.setLoginVisualCurrent(session, asset);
  await ownerData("gallery.setLoginCurrent", { id: asset.id });
}

export async function deleteGalleryAsset(session: SupabaseSession, asset: base.GalleryAsset) {
  if (!isOwnerCookieSession(session)) return base.deleteGalleryAsset(session, asset);
  await ownerData("gallery.delete", { id: asset.id });
}
