export type LoadingCatalogKind = "image" | "animation";

export type LoadingCatalogItem = {
  asset_key: string;
  title: string;
  kind: LoadingCatalogKind;
  publicPath: string;
  videoPath?: string;
  durationMs?: number;
  tags: string[];
  created_at: string;
};

/**
 * Small, explicit login-visual allowlist. Operational screenshots, loading
 * posters and internal UI artwork do not belong in the owner login manager.
 */
export const LOADING_GALLERY_CATALOG: readonly LoadingCatalogItem[] = [
  {
    asset_key: "loading-owner-lotus-bloom-r53",
    title: "站主蓮開",
    kind: "animation",
    publicPath: "/intro/owner-lotus-bloom-r53.jpg",
    videoPath: "/intro/owner-lotus-bloom-r53.mp4",
    durationMs: 2800,
    tags: ["loading", "login-background", "animation", "lotus"],
    created_at: "2026-09-09T12:00:00.000Z",
  },
  {
    asset_key: "loading-owner-immortal-ascent-r123",
    title: "站主飛升",
    kind: "animation",
    publicPath: "/intro/owner-immortal-ascent-r123.jpg",
    videoPath: "/intro/owner-immortal-ascent-r123.mp4",
    durationMs: 10040,
    tags: ["loading", "login-background", "animation", "lotus", "current-default"],
    created_at: "2026-09-13T00:00:00.000Z",
  },
];


/**
 * Owner login uses an intentionally tiny, curated subset.
 * Loading posters, operational screenshots and internal UI artwork must never
 * appear as selectable login media.
 */
export const LOGIN_VISUAL_CATALOG_KEYS = [
  "loading-owner-lotus-bloom-r53",
  "loading-owner-immortal-ascent-r123",
] as const;

const LOGIN_VISUAL_CATALOG_KEY_SET = new Set<string>(LOGIN_VISUAL_CATALOG_KEYS);

export const LOGIN_VISUAL_CATALOG = LOADING_GALLERY_CATALOG.filter((item) =>
  LOGIN_VISUAL_CATALOG_KEY_SET.has(item.asset_key),
);
