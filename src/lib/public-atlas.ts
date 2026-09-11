export type PublicAtlasAsset = {
  id: string;
  url: string;
};

const reportVisual = (id: string, file: string): PublicAtlasAsset => ({
  id,
  url: `/report-visuals/full/${file}.webp`,
});

const ornament = (id: string, file: string): PublicAtlasAsset => ({
  id,
  url: `/ornaments/generated/${file}.webp`,
});

/**
 * Customer-facing atlas assets are deliberately same-origin and immutable.
 * Owner uploads may continue to live in Supabase, but the public atlas must
 * not make gallery_assets or zhaowu-gallery requests at runtime.
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

  reportVisual("report-overview", "overview"),
  reportVisual("report-jia-wood", "jia-wood"),
  reportVisual("report-yi-wood", "yi-wood"),
  reportVisual("report-bing-fire", "bing-fire"),
  reportVisual("report-ding-fire", "ding-fire"),
  reportVisual("report-wu-earth", "wu-earth"),
  reportVisual("report-ji-earth", "ji-earth"),
  reportVisual("report-geng-metal", "geng-metal"),
  reportVisual("report-xin-metal", "xin-metal"),
  reportVisual("report-ren-water", "ren-water"),
  reportVisual("report-gui-water", "gui-water"),

  reportVisual("report-yin-spring", "yin-spring"),
  reportVisual("report-mao-spring", "mao-spring"),
  reportVisual("report-chen-spring", "chen-spring"),
  reportVisual("report-si-summer", "si-summer"),
  reportVisual("report-wu-summer", "wu-summer"),
  reportVisual("report-wei-summer", "wei-summer"),
  reportVisual("report-shen-autumn", "shen-autumn"),
  reportVisual("report-you-autumn", "you-autumn"),
  reportVisual("report-xu-autumn", "xu-autumn"),
  reportVisual("report-hai-winter", "hai-winter"),
  reportVisual("report-zi-winter", "zi-winter"),
  reportVisual("report-chou-winter", "chou-winter"),

  reportVisual("report-luck-wood", "luck-wood"),
  reportVisual("report-luck-fire", "luck-fire"),
  reportVisual("report-luck-earth", "luck-earth"),
  reportVisual("report-luck-metal", "luck-metal"),
  reportVisual("report-luck-water", "luck-water"),
] as const;
