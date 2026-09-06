import type { GalleryAsset } from "@/lib/gallery-assets";

export type GalleryDisplayGroup =
  | "buddhist"
  | "daoist"
  | "guardian-beast"
  | "auspicious"
  | "report-art"
  | "reference"
  | "recent-upload"
  | "background"
  | "dragon-sticker"
  | "tea-guardian"
  | "loading"
  | "other";

export const PUBLIC_ATLAS_GROUPS = [
  "buddhist",
  "daoist",
  "guardian-beast",
  "auspicious",
  "report-art",
  "recent-upload",
] as const satisfies readonly GalleryDisplayGroup[];

export type PublicAtlasGroup = (typeof PUBLIC_ATLAS_GROUPS)[number];

export const GALLERY_GROUP_ORDER: readonly GalleryDisplayGroup[] = [
  "loading",
  "buddhist",
  "daoist",
  "guardian-beast",
  "auspicious",
  "report-art",
  "recent-upload",
  "reference",
  "background",
  "dragon-sticker",
  "tea-guardian",
  "other",
];

const PUBLIC_ATLAS_SET = new Set<GalleryDisplayGroup>(PUBLIC_ATLAS_GROUPS);

function hasTag(asset: GalleryAsset, tag: string) {
  return (asset.tags ?? []).some((item) => item.trim().toLowerCase() === tag);
}

export function galleryDisplayGroup(asset: GalleryAsset): GalleryDisplayGroup {
  if (asset.category === "loading") return "loading";
  if (hasTag(asset, "loading") || hasTag(asset, "login-background")) return "loading";
  if (asset.category === "background") return "background";
  if (asset.category === "dragon-sticker") return "dragon-sticker";
  if (asset.category === "tea-guardian") return "tea-guardian";
  if (asset.category !== "visual-library") return "other";

  const key = asset.asset_key.toLowerCase();
  if (key.startsWith("library-loading-") || key.startsWith("loading-")) return "loading";
  if (key.startsWith("library-buddhist-")) return "buddhist";
  if (key.startsWith("library-daoist-")) return "daoist";
  if (key.startsWith("library-guardian-beast-")) return "guardian-beast";
  if (key.startsWith("library-auspicious-")) return "auspicious";
  if (key.startsWith("library-report-art-")) return "report-art";
  if (key.startsWith("reference-")) return "reference";
  if (key.startsWith("img-")) return "recent-upload";
  return "other";
}

export function isPublicAtlasAsset(asset: GalleryAsset): boolean {
  return asset.category === "visual-library" && PUBLIC_ATLAS_SET.has(galleryDisplayGroup(asset));
}

export function isLoadingGalleryAsset(asset: GalleryAsset): boolean {
  return galleryDisplayGroup(asset) === "loading";
}

export function sortGalleryAssets<T extends GalleryAsset>(assets: T[]): T[] {
  const rank = new Map(GALLERY_GROUP_ORDER.map((group, index) => [group, index] as const));
  return [...assets].sort((a, b) => {
    const groupDiff = (rank.get(galleryDisplayGroup(a)) ?? 999) - (rank.get(galleryDisplayGroup(b)) ?? 999);
    if (groupDiff) return groupDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
