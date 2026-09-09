import { galleryPublicUrl, listPublicGalleryAssets, type GalleryAsset } from "@/lib/gallery-assets";
import { isLoadingGalleryAsset } from "@/lib/gallery-groups";
import { LOADING_GALLERY_CATALOG } from "@/lib/loading-gallery-catalog";

export type LoginVisualTheme = "day" | "night" | "common";

export type LoginAnimationAsset = {
  id: string;
  title: string;
  type: "video" | "image";
  fileUrl: string;
  posterUrl?: string;
  durationMs?: number;
  active: boolean;
  current: boolean;
  theme: LoginVisualTheme;
  sortOrder: number;
  createdAt: string;
};

const SESSION_KEY = "zhaowu.login-anim.session";

export function loginVisualThemeFromTags(tags: string[] | undefined | null): LoginVisualTheme {
  const set = new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()));
  if (set.has("login-night") || set.has("night")) return "night";
  if (set.has("login-day") || set.has("day")) return "day";
  return "common";
}

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
    current: (item.tags ?? []).includes("current-default"),
    theme: loginVisualThemeFromTags(item.tags),
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
    type: (asset.content_type ?? "").startsWith("video/") ? "video" : "image",
    fileUrl: url,
    posterUrl: url,
    active: asset.enabled,
    current: Boolean(asset.is_primary && asset.enabled),
    theme: loginVisualThemeFromTags(asset.tags),
    sortOrder: 100 + index,
    createdAt: asset.created_at,
  };
}

export function catalogLoginAnimations(): LoginAnimationAsset[] {
  return LOADING_GALLERY_CATALOG.map(catalogToAsset);
}

export async function listLoginVisuals(): Promise<LoginAnimationAsset[]> {
  const catalog = catalogLoginAnimations();
  let remote: GalleryAsset[] = [];
  try { remote = (await listPublicGalleryAssets("loading")).filter(isLoadingGalleryAsset); } catch { remote = []; }
  const remoteKeys = new Set(remote.map((row) => row.asset_key));
  return [
    ...catalog.filter((item) => !remoteKeys.has(item.id.replace(/^catalog:/, ""))),
    ...remote.map(remoteToAsset),
  ].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listActiveLoginAnimations(): Promise<LoginAnimationAsset[]> {
  return (await listLoginVisuals()).filter((item) => item.active);
}

export function pickLoginAnimation(assets: LoginAnimationAsset[], theme?: "day" | "night"): LoginAnimationAsset | null {
  if (!assets.length) return null;
  const themed = theme
    ? assets.filter((item) => item.theme === theme || item.theme === "common")
    : assets;
  const pool = themed.length ? themed : assets;
  const current = pool.find((item) => item.current) ?? assets.find((item) => item.current);
  if (current) return current;
  const videos = pool.filter((item) => item.type === "video");
  const preferred = videos.length ? videos : pool;
  if (typeof window !== "undefined") {
    try {
      const saved = window.sessionStorage.getItem(SESSION_KEY);
      const match = preferred.find((item) => item.id === saved) ?? assets.find((item) => item.id === saved);
      if (match) return match;
    } catch { /* ignore */ }
  }
  return preferred[0] ?? pool[0] ?? null;
}
