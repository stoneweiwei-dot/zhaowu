export type ReportVisualAsset = {
  id: string;
  src: string;
  index: number;
  count: number;
  thumbnailUrl: string;
  fullImageUrl: string;
};

export type ReportVisualAssetKind = "day-master" | "month" | "overview";
export type LuckVisualElement = "木" | "火" | "土" | "金" | "水";

const REPORT_VISUAL_CDN_BASE = "/report-visuals/groups";
const REPORT_LUCK_CDN_BASE = "/report-visuals/groups";
const REPORT_OVERVIEW_CDN = "/report-visuals/full/overview.webp";

function localPair(id: string, sprite: string, index: number, count: number): ReportVisualAsset {
  return {
    id,
    src: sprite,
    index,
    count,
    thumbnailUrl: `/report-visuals/thumb/${id}.webp`,
    fullImageUrl: `/report-visuals/full/${id}.webp`,
  };
}

const DAY_MASTER_ASSETS: Record<string, ReportVisualAsset> = {
  "jia-wood": localPair("jia-wood", `${REPORT_VISUAL_CDN_BASE}/day-0.webp`, 0, 5),
  "yi-wood": localPair("yi-wood", `${REPORT_VISUAL_CDN_BASE}/day-0.webp`, 1, 5),
  "bing-fire": localPair("bing-fire", `${REPORT_VISUAL_CDN_BASE}/day-0.webp`, 2, 5),
  "ding-fire": localPair("ding-fire", `${REPORT_VISUAL_CDN_BASE}/day-0.webp`, 3, 5),
  "wu-earth": localPair("wu-earth", `${REPORT_VISUAL_CDN_BASE}/day-0.webp`, 4, 5),
  "ji-earth": localPair("ji-earth", `${REPORT_VISUAL_CDN_BASE}/day-1.webp`, 0, 5),
  "geng-metal": localPair("geng-metal", `${REPORT_VISUAL_CDN_BASE}/day-1.webp`, 1, 5),
  "xin-metal": localPair("xin-metal", `${REPORT_VISUAL_CDN_BASE}/day-1.webp`, 2, 5),
  "ren-water": localPair("ren-water", `${REPORT_VISUAL_CDN_BASE}/day-1.webp`, 3, 5),
  "gui-water": localPair("gui-water", `${REPORT_VISUAL_CDN_BASE}/day-1.webp`, 4, 5),
};

const MONTH_ASSETS: Record<string, ReportVisualAsset> = {
  "yin-spring": localPair("yin-spring", `${REPORT_VISUAL_CDN_BASE}/month-0.webp`, 0, 3),
  "mao-spring": localPair("mao-spring", `${REPORT_VISUAL_CDN_BASE}/month-0.webp`, 1, 3),
  "chen-spring": localPair("chen-spring", `${REPORT_VISUAL_CDN_BASE}/month-0.webp`, 2, 3),
  "si-summer": localPair("si-summer", `${REPORT_VISUAL_CDN_BASE}/month-1.webp`, 0, 3),
  "wu-summer": localPair("wu-summer", `${REPORT_VISUAL_CDN_BASE}/month-1.webp`, 1, 3),
  "wei-summer": localPair("wei-summer", `${REPORT_VISUAL_CDN_BASE}/month-1.webp`, 2, 3),
  "shen-autumn": localPair("shen-autumn", `${REPORT_VISUAL_CDN_BASE}/month-2.webp`, 0, 3),
  "you-autumn": localPair("you-autumn", `${REPORT_VISUAL_CDN_BASE}/month-2.webp`, 1, 3),
  "xu-autumn": localPair("xu-autumn", `${REPORT_VISUAL_CDN_BASE}/month-2.webp`, 2, 3),
  "hai-winter": localPair("hai-winter", `${REPORT_VISUAL_CDN_BASE}/month-3.webp`, 0, 3),
  "zi-winter": localPair("zi-winter", `${REPORT_VISUAL_CDN_BASE}/month-3.webp`, 1, 3),
  "chou-winter": localPair("chou-winter", `${REPORT_VISUAL_CDN_BASE}/month-3.webp`, 2, 3),
};

const LUCK_ASSETS: Record<LuckVisualElement, ReportVisualAsset> = {
  木: localPair("luck-wood", `${REPORT_LUCK_CDN_BASE}/luck-0.webp`, 0, 5),
  火: localPair("luck-fire", `${REPORT_LUCK_CDN_BASE}/luck-0.webp`, 1, 5),
  土: localPair("luck-earth", `${REPORT_LUCK_CDN_BASE}/luck-0.webp`, 2, 5),
  金: localPair("luck-metal", `${REPORT_LUCK_CDN_BASE}/luck-0.webp`, 3, 5),
  水: localPair("luck-water", `${REPORT_LUCK_CDN_BASE}/luck-0.webp`, 4, 5),
};

export const REPORT_OVERVIEW_ASSET: ReportVisualAsset = {
  id: "overview",
  src: REPORT_OVERVIEW_CDN,
  index: 0,
  count: 1,
  thumbnailUrl: "/report-visuals/thumb/overview.webp",
  fullImageUrl: "/report-visuals/full/overview.webp",
};

export function getReportVisualAsset(kind: ReportVisualAssetKind, key: string): ReportVisualAsset | null {
  if (kind === "overview") return REPORT_OVERVIEW_ASSET;
  return (kind === "day-master" ? DAY_MASTER_ASSETS[key] : MONTH_ASSETS[key]) ?? null;
}

export function luckElementFromGanZhi(ganZhi: string | null | undefined): LuckVisualElement | null {
  const stem = ganZhi?.trim().charAt(0);
  if (!stem) return null;
  if (stem === "甲" || stem === "乙") return "木";
  if (stem === "丙" || stem === "丁") return "火";
  if (stem === "戊" || stem === "己") return "土";
  if (stem === "庚" || stem === "辛") return "金";
  if (stem === "壬" || stem === "癸") return "水";
  return null;
}

export function getLuckVisualAsset(ganZhi: string | null | undefined): ReportVisualAsset | null {
  const element = luckElementFromGanZhi(ganZhi);
  return element ? LUCK_ASSETS[element] : null;
}

export const REPORT_VISUAL_ASSET_COUNTS = {
  dayMaster: 10,
  month: 12,
  luckElement: 5,
} as const;
