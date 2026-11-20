import type { GalleryAsset } from "@/lib/gallery-assets";

/**
 * Report artwork shipped with the website, not rows in Supabase gallery_assets.
 * These read-only virtual entries let the owner find the exact files used by
 * DayStemPortrait and BranchScenery without duplicating them in Storage.
 */
const STEMS = [
  ["甲", "jia-wood", "Jia"], ["乙", "yi-wood", "Yi"],
  ["丙", "bing-fire", "Bing"], ["丁", "ding-fire", "Ding"],
  ["戊", "wu-earth", "Wu"], ["己", "ji-earth", "Ji"],
  ["庚", "geng-metal", "Geng"], ["辛", "xin-metal", "Xin"],
  ["壬", "ren-water", "Ren"], ["癸", "gui-water", "Gui"],
] as const;

const BRANCHES = [
  ["子", "zi", "Zi"], ["丑", "chou", "Chou"],
  ["寅", "yin", "Yin"], ["卯", "mao", "Mao"],
  ["辰", "chen", "Chen"], ["巳", "si", "Si"],
  ["午", "wu", "Wu"], ["未", "wei", "Wei"],
  ["申", "shen", "Shen"], ["酉", "you", "You"],
  ["戌", "xu", "Xu"], ["亥", "hai", "Hai"],
] as const;

function bundledAsset(
  kind: "character" | "scenery",
  glyph: string,
  key: string,
  roman: string,
): GalleryAsset {
  const character = kind === "character";
  return {
    id: `bundled-report-${kind}-${key}`,
    category: "visual-library",
    asset_key: `bundled-report-${kind}-${key}`,
    title: `${glyph} · ${roman} · ${character ? "天干角色 / Stem portrait" : "地支景象 / Branch scenery"}`,
    storage_path: `/report-visuals/${character ? "characters" : "branches"}/${key}.webp`,
    bucket_id: "public-fallback",
    content_type: "image/webp",
    tags: ["bundled-report-art", character ? "day-master" : "month-command"],
    enabled: true,
    is_primary: false,
    created_at: "2026-10-12T00:00:00Z",
    updated_at: "2026-10-12T00:00:00Z",
  };
}

export const BUNDLED_REPORT_ART: readonly GalleryAsset[] = [
  ...STEMS.map(([glyph, key, roman]) => bundledAsset("character", glyph, key, roman)),
  ...BRANCHES.map(([glyph, key, roman]) => bundledAsset("scenery", glyph, key, roman)),
];

export function isBundledReportArt(asset: GalleryAsset): boolean {
  return asset.bucket_id === "public-fallback"
    && asset.asset_key.startsWith("bundled-report-")
    && asset.tags.includes("bundled-report-art");
}
