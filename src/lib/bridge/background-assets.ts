import * as base from "../background-assets";
import type { SupabaseSession } from "@/lib/supabase-rest";
import { isOwnerCookieSession, ownerData, uploadOwnerSignedFile, type OwnerUploadTicket } from "@/lib/owner-data-client";

export * from "../background-assets";

export async function listOwnerBackgroundPage(
  session: SupabaseSession,
  page = 0,
  requestedPageSize = base.BACKGROUND_HISTORY_PAGE_SIZE,
): Promise<base.BackgroundPage> {
  if (!isOwnerCookieSession(session)) return base.listOwnerBackgroundPage(session, page, requestedPageSize);
  const out = await ownerData<{ ok: true; page: base.BackgroundPage }>("background.list", {
    page,
    pageSize: requestedPageSize,
  });
  return out.page;
}

export async function uploadBackground(
  session: SupabaseSession,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<base.BackgroundAsset> {
  if (!isOwnerCookieSession(session)) return base.uploadBackground(session, file, onProgress);
  if (!file.type.startsWith("image/")) throw new Error("只接受圖片檔。");
  if (file.size > 10 * 1024 * 1024) throw new Error("單張圖片不可超過 10 MB。");

  const prep = await ownerData<OwnerUploadTicket>("background.prepareUpload", {
    name: file.name,
    contentType: file.type || "application/octet-stream",
    size: file.size,
  });
  try {
    await uploadOwnerSignedFile(prep, file, onProgress);
    const out = await ownerData<{ ok: true; item: base.BackgroundAsset }>("background.finalizeUpload", {
      path: prep.path,
      name: file.name,
      contentType: file.type || null,
    });
    onProgress?.(100);
    return out.item;
  } catch (error) {
    await ownerData("upload.abort", { bucket: "zhaowu-backgrounds", path: prep.path }).catch(() => undefined);
    throw error;
  }
}

export async function setBackgroundEnabled(session: SupabaseSession, id: string, enabled: boolean) {
  if (!isOwnerCookieSession(session)) return base.setBackgroundEnabled(session, id, enabled);
  await ownerData("background.setEnabled", { id, enabled });
}

export async function setBackgroundWallpaper(session: SupabaseSession, id: string) {
  if (!isOwnerCookieSession(session)) return base.setBackgroundWallpaper(session, id);
  await ownerData("background.setWallpaper", { id });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-background-change"));
}

export async function clearBackgroundWallpaper(session: SupabaseSession, id: string) {
  if (!isOwnerCookieSession(session)) return base.clearBackgroundWallpaper(session, id);
  await ownerData("background.clearWallpaper", { id });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-background-change"));
}

export async function deleteBackground(session: SupabaseSession, asset: base.BackgroundAsset) {
  if (!isOwnerCookieSession(session)) return base.deleteBackground(session, asset);
  await ownerData("background.delete", { id: asset.id, path: asset.storage_path });
}
