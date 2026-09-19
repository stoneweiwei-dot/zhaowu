export type PublicAtlasAsset = {
  id: string;
  url: string;
  thumbnailUrl?: string;
};

const ornament = (id: string, file: string): PublicAtlasAsset => ({
  id,
  url: `/ornaments/generated/${file}.webp`,
});

/**
 * Customer-facing atlas assets are deliberately same-origin and cacheable.
 * Owner uploads may continue to live in Supabase, but the public atlas must
 * not make gallery_assets or zhaowu-gallery requests at runtime.
 *
 * Grid/list views should use thumbnailUrl when available. The original `url`
 * remains the click-through/full-resolution artwork.
 */
export const PUBLIC_ATLAS_ASSETS: readonly PublicAtlasAsset[] = [
  ornament("ornament-celestial-pearl", "celestial-pearl"),
  ornament("ornament-crane", "crane"),
  ornament("ornament-dragon", "dragon"),
  ornament("ornament-endless-knot", "endless-knot"),
  ornament("ornament-lotus", "lotus"),
  ornament("ornament-phoenix", "phoenix"),
  ornament("ornament-pomegranate", "pomegranate"),
  ornament("ornament-twin-fish", "twin-fish"),
] as const;
