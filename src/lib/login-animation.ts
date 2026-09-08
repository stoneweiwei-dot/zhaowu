import { galleryPublicUrl, listPublicGalleryAssets, type GalleryAsset } from "@/lib/gallery-assets";
import { isLoadingGalleryAsset } from "@/lib/gallery-groups";
import { LOADING_GALLERY_CATALOG } from "@/lib/loading-gallery-catalog";

export type LoginAnimationAsset = {
  id: string;
  title: string;
  type: "video" | "image";
  fileUrl: string;
  posterUrl?: string;
  durationMs?: number;
  active: boolean;
  sortOrder: number;
  createdAt: string;
};

const SESSION_KEY = "zhaowu.login-anim.session";

function catalogToAsset(item: (typeof LOADING_GALLERY_CATALOG)[number], index: number): LoginAnimationAsset {
  const video = Boolean(item.videoPath);
  return {
    id: `catalog:${item.asset_key}`,
    title: item.title,
    type: video ? "video" : "image",
    fileUrl: item.videoPath || item.publicPath,
    posterUrl: item.publicPath,
    durationMs: item.durationMs,
    active: true,
    sortOrder: index,
    createdAt: item.created_at,
  };
}

function remoteToAsset(asset: GalleryAsset, index: number): LoginAnimationAsset {
  const video = (asset.content_type ?? "").startsWith("video/") || (asset.tags ?? []).includes("animation");
  const url = asset.bucket_id === "public-fallback" ? asset.storage_path : galleryPublicUrl(asset.storage_path, asset.bucket_id);
  return {
    id: asset.id,
    title: asset.title,
    type: (asset.content_type ?? "").startsWith("video/") ? "video" : video ? "image" : "image",
    fileUrl: url,
    posterUrl: url,
    active: asset.enabled,
    sortOrder: 100 + index,
    createdAt: asset.created_at,
  };
}

export function catalogLoginAnimations(): LoginAnimationAsset[] {
  return LOADING_GALLERY_CATALOG.map(catalogToAsset);
}

export async function listActiveLoginAnimations(): Promise<LoginAnimationAsset[]> {
  const catalog = catalogLoginAnimations();
  let remote: GalleryAsset[] = [];
  try { remote = (await listPublicGalleryAssets("loading")).filter(isLoadingGalleryAsset); } catch { remote = []; }
  const remoteKeys = new Set(remote.map((row) => row.asset_key));
  const merged = [
    ...catalog.filter((item) => !remoteKeys.has(item.id.replace(/^catalog:/, ""))),
    ...remote.filter((row) => row.enabled).map(remoteToAsset),
  ];
  return merged.filter((item) => item.active);
}

export function pickLoginAnimation(assets: LoginAnimationAsset[]): LoginAnimationAsset | null {
  if (!assets.length) return null;
  const videos = assets.filter((item) => item.type === "video");
  const pool = videos.length ? videos : assets;
  if (typeof window !== "undefined") {
    try {
      const saved = window.sessionStorage.getItem(SESSION_KEY);
      const match = pool.find((item) => item.id === saved) ?? assets.find((item) => item.id === saved);
      if (match) return match;
      const chosen = pool[Math.floor(Math.random() * pool.length)] ?? null;
      if (chosen) window.sessionStorage.setItem(SESSION_KEY, chosen.id);
      return chosen;
    } catch { /* ignore */ }
  }
  return pool[0] ?? null;
}
