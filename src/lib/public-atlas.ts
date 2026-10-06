export type PublicAtlasAsset = {
  id: string;
  url: string;
  thumbnailUrl?: string;
};

const ornament = (id: string, file: string): PublicAtlasAsset => ({
  id,
  url: `/ornaments/generated/${file}.webp`,
});

const reportVisual = (id: string, file: string): PublicAtlasAsset => ({
  id,
  url: `/report-visuals/full/${file}.webp`,
});

/**
 * Customer-facing atlas assets are deliberately same-origin and cacheable.
 * Owner uploads may continue to live in Supabase, but the public atlas must
 * not make gallery_assets or zhaowu-gallery requests at runtime.
 *
 * Grid/list views should use thumbnailUrl when available. The original `url`
 * remains the click-through/full-resolution artwork.
 */
// Keep the customer-facing atlas restrained to the current Song-inspired
// jade/mineral-pigment visual system. The approved Ten Heavenly Stems and
// Twelve Earthly Branch/month-command report artworks are first-class atlas
// assets alongside four restrained auspicious motifs. Decorative charm-like
// variants remain in the repository but are intentionally not surfaced.
export const PUBLIC_ATLAS_ASSETS: readonly PublicAtlasAsset[] = [
  // Ten Heavenly Stems
  reportVisual("library-report-art-jia-wood", "jia-wood"),
  reportVisual("library-report-art-yi-wood", "yi-wood"),
  reportVisual("library-report-art-bing-fire", "bing-fire"),
  reportVisual("library-report-art-ding-fire", "ding-fire"),
  reportVisual("library-report-art-wu-earth", "wu-earth"),
  reportVisual("library-report-art-ji-earth", "ji-earth"),
  reportVisual("library-report-art-geng-metal", "geng-metal"),
  reportVisual("library-report-art-xin-metal", "xin-metal"),
  reportVisual("library-report-art-ren-water", "ren-water"),
  reportVisual("library-report-art-gui-water", "gui-water"),

  // Twelve Earthly Branches / month-command artworks
  reportVisual("library-report-art-yin-spring", "yin-spring"),
  reportVisual("library-report-art-mao-spring", "mao-spring"),
  reportVisual("library-report-art-chen-spring", "chen-spring"),
  reportVisual("library-report-art-si-summer", "si-summer"),
  reportVisual("library-report-art-wu-summer", "wu-summer"),
  reportVisual("library-report-art-wei-summer", "wei-summer"),
  reportVisual("library-report-art-shen-autumn", "shen-autumn"),
  reportVisual("library-report-art-you-autumn", "you-autumn"),
  reportVisual("library-report-art-xu-autumn", "xu-autumn"),
  reportVisual("library-report-art-hai-winter", "hai-winter"),
  reportVisual("library-report-art-zi-winter", "zi-winter"),
  reportVisual("library-report-art-chou-winter", "chou-winter"),

  // Restrained auspicious motifs
  ornament("ornament-crane", "crane"),
  ornament("ornament-dragon", "dragon"),
  ornament("ornament-lotus", "lotus"),
  ornament("ornament-phoenix", "phoenix"),
] as const;
