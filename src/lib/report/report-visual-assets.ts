export type ReportVisualAsset = {
  src: string;
  index: number;
  count: number;
};

export type ReportVisualAssetKind = "day-master" | "month";
export type LuckVisualElement = "木" | "火" | "土" | "金" | "水";

const REPORT_VISUAL_CDN_BASE = "https://plgpxusmemnmzckbwtiv.supabase.co/storage/v1/object/public/zhaowu-gallery/report-visuals/r57";

const DAY_MASTER_ASSETS: Record<string, ReportVisualAsset> = {
  "jia-wood": { src: `${REPORT_VISUAL_CDN_BASE}/day-0.webp`, index: 0, count: 5 },
  "yi-wood": { src: `${REPORT_VISUAL_CDN_BASE}/day-0.webp`, index: 1, count: 5 },
  "bing-fire": { src: `${REPORT_VISUAL_CDN_BASE}/day-0.webp`, index: 2, count: 5 },
  "ding-fire": { src: `${REPORT_VISUAL_CDN_BASE}/day-0.webp`, index: 3, count: 5 },
  "wu-earth": { src: `${REPORT_VISUAL_CDN_BASE}/day-0.webp`, index: 4, count: 5 },
  "ji-earth": { src: `${REPORT_VISUAL_CDN_BASE}/day-1.webp`, index: 0, count: 5 },
  "geng-metal": { src: `${REPORT_VISUAL_CDN_BASE}/day-1.webp`, index: 1, count: 5 },
  "xin-metal": { src: `${REPORT_VISUAL_CDN_BASE}/day-1.webp`, index: 2, count: 5 },
  "ren-water": { src: `${REPORT_VISUAL_CDN_BASE}/day-1.webp`, index: 3, count: 5 },
  "gui-water": { src: `${REPORT_VISUAL_CDN_BASE}/day-1.webp`, index: 4, count: 5 },
};

const MONTH_ASSETS: Record<string, ReportVisualAsset> = {
  "yin-spring": { src: `${REPORT_VISUAL_CDN_BASE}/month-0.webp`, index: 0, count: 3 },
  "mao-spring": { src: `${REPORT_VISUAL_CDN_BASE}/month-0.webp`, index: 1, count: 3 },
  "chen-spring": { src: `${REPORT_VISUAL_CDN_BASE}/month-0.webp`, index: 2, count: 3 },
  "si-summer": { src: `${REPORT_VISUAL_CDN_BASE}/month-1.webp`, index: 0, count: 3 },
  "wu-summer": { src: `${REPORT_VISUAL_CDN_BASE}/month-1.webp`, index: 1, count: 3 },
  "wei-summer": { src: `${REPORT_VISUAL_CDN_BASE}/month-1.webp`, index: 2, count: 3 },
  "shen-autumn": { src: `${REPORT_VISUAL_CDN_BASE}/month-2.webp`, index: 0, count: 3 },
  "you-autumn": { src: `${REPORT_VISUAL_CDN_BASE}/month-2.webp`, index: 1, count: 3 },
  "xu-autumn": { src: `${REPORT_VISUAL_CDN_BASE}/month-2.webp`, index: 2, count: 3 },
  "hai-winter": { src: `${REPORT_VISUAL_CDN_BASE}/month-3.webp`, index: 0, count: 3 },
  "zi-winter": { src: `${REPORT_VISUAL_CDN_BASE}/month-3.webp`, index: 1, count: 3 },
  "chou-winter": { src: `${REPORT_VISUAL_CDN_BASE}/month-3.webp`, index: 2, count: 3 },
};

const LUCK_ASSETS: Record<LuckVisualElement, ReportVisualAsset> = {
  木: { src: "/report-visuals/groups/luck-0.webp", index: 0, count: 5 },
  火: { src: "/report-visuals/groups/luck-0.webp", index: 1, count: 5 },
  土: { src: "/report-visuals/groups/luck-0.webp", index: 2, count: 5 },
  金: { src: "/report-visuals/groups/luck-0.webp", index: 3, count: 5 },
  水: { src: "/report-visuals/groups/luck-0.webp", index: 4, count: 5 },
};

export function getReportVisualAsset(kind: ReportVisualAssetKind, key: string): ReportVisualAsset | null {
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
