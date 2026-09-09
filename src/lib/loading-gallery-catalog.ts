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
 * Built-in login / loading library. These stay out of the public atlas
 * and out of decree matching. Owner /gallery shows them in the Loading group.
 */
export const LOADING_GALLERY_CATALOG: readonly LoadingCatalogItem[] = [
  {
    asset_key: "loading-song-parchment-dragon",
    title: "宋畫龍鶴蓮",
    kind: "image",
    publicPath: "/gallery/loading/song-parchment-dragon.jpg",
    tags: ["loading", "login-background", "song-atlas", "dragon", "crane", "lotus"],
    created_at: "2026-09-07T00:00:00.000Z",
  },
  {
    asset_key: "loading-song-parchment-anim",
    title: "宋畫龍鶴蓮動畫",
    kind: "animation",
    publicPath: "/gallery/loading/song-parchment-dragon.jpg",
    tags: ["loading", "login-background", "animation", "song-atlas", "dragon", "lotus"],
    created_at: "2026-09-07T00:00:01.000Z",
  },
  {
    asset_key: "loading-dawn-dragon-lotus",
    title: "晨光龍蓮",
    kind: "image",
    publicPath: "/gallery/loading/dawn-dragon-lotus.jpg",
    tags: ["loading", "login-background", "dawn", "dragon", "lotus", "koi"],
    created_at: "2026-09-07T00:00:02.000Z",
  },
  {
    asset_key: "loading-dawn-dragon-anim",
    title: "晨光龍蓮動畫",
    kind: "animation",
    publicPath: "/gallery/loading/dawn-dragon-lotus.jpg",
    tags: ["loading", "login-background", "animation", "dawn", "dragon", "lotus"],
    created_at: "2026-09-07T00:00:03.000Z",
  },
  {
    asset_key: "loading-live-lotus-bloom",
    title: "實拍蓮花經開",
    kind: "animation",
    publicPath: "/gallery/loading/anim-live-lotus-poster.jpg",
    tags: ["loading", "login-background", "animation", "lotus", "live-bloom"],
    created_at: "2026-09-07T00:00:04.000Z",
  },
  {
    asset_key: "loading-official-monitor-cat",
    title: "昭梧 Official 運營監控",
    kind: "image",
    publicPath: "/gallery/loading/official-monitor-cat.jpg",
    tags: ["loading", "official", "monitor"],
    created_at: "2026-09-07T00:00:05.000Z",
  },
  {
    asset_key: "loading-owner-lotus-bloom-r53",
    title: "站主蓮開",
    kind: "animation",
    publicPath: "/intro/owner-lotus-bloom-r53.jpg",
    videoPath: "/intro/owner-lotus-bloom-r53.mp4",
    durationMs: 2800,
    tags: ["loading", "login-background", "animation", "lotus", "current-default"],
    created_at: "2026-09-09T12:00:00.000Z",
  },
  {
    asset_key: "loading-jade-lotus-bloom-r96",
    title: "金邊青蓮綿放",
    kind: "animation",
    publicPath: "/gallery/loading/jade-lotus-bloom-r96-poster.jpg",
    videoPath: "/gallery/loading/jade-lotus-bloom-r96.mp4",
    durationMs: 4770,
    tags: ["loading", "login-background", "animation", "lotus", "jade-bloom"],
    created_at: "2026-09-09T00:00:06.000Z",
  },
];
