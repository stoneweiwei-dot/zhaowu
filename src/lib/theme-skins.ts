import { useEffect, useState } from "react";

/**
 * 主題皮膚 (theme skins) — owner-selectable visual skins.
 * - "none" / no attribute = the current production look (zero change).
 * - A skin only sets `data-zws` (+ `data-zws-mode`) on <html>; every visual override lives in
 *   src/theme-skins.css behind `html[data-zws]`, so removing the attribute fully restores the site.
 */
export const SKIN_KEY = "zhaowu.skin.v1";
export const SKIN_EVENT = "zhaowu-skin";
/** Site-wide default for visitors without a saved choice. Empty string = classic look. */
export const SITE_DEFAULT_SKIN = "";

export type SkinMode = "light" | "dark";
export type SkinDef = {
  id: string;
  zh: string;
  hans: string;
  en: string;
  noteZh: string;
  noteHans: string;
  noteEn: string;
  mode: SkinMode;
  /** Catalog order; 1–10 map to the original mood-board, 11–14 to the Song whitespace series. */
  ref: number;
  /** High-resolution painting (existing site art or a graded video frame) used as the page backdrop and home banner. */
  hero: string;
  /** CSS background-position that keeps the painting's focal point in the home banner. */
  focus: string;
  swatch: [string, string, string];
};


export const SKINS: SkinDef[] = [
  { id: "lotus-boat", ref: 1, mode: "light", zh: "蓮舟山水", hans: "莲舟山水", en: "Lotus Skiff", noteZh: "宣紙米・墨綠・金線，山水捲首", noteHans: "宣纸米・墨绿・金线，山水卷首", noteEn: "Rice-paper cream, ink green, gold hairlines", hero: "/art/zhaowu-lotus-ascend-v1.webp", focus: "50% 30%", swatch: ["#f4ead7", "#285044", "#b8934d"] },
  { id: "cloud-jade", ref: 2, mode: "light", zh: "雲山青綠", hans: "云山青绿", en: "Cloud & Jade", noteZh: "淡墨青山，清簡留白", noteHans: "淡墨青山，清简留白", noteEn: "Pale ink mountains, calm whitespace", hero: "/art/zhaowu-dragon-lake-v1.webp", focus: "50% 55%", swatch: ["#efe9db", "#2b5545", "#d9cfb8"] },
  { id: "golden-phoenix", ref: 3, mode: "light", zh: "金鳳朝陽", hans: "金凤朝阳", en: "Golden Phoenix", noteZh: "暖金旭日與白鳳", noteHans: "暖金旭日与白凤", noteEn: "Warm gold sun and white phoenix", hero: "/theme-skins/golden-phoenix-art.webp", focus: "50% 38%", swatch: ["#f3e6c8", "#26493c", "#c9a24f"] },
  { id: "ink-dragon", ref: 4, mode: "light", zh: "水墨飛龍", hans: "水墨飞龙", en: "Ink Dragon", noteZh: "書法大字與淡彩青龍", noteHans: "书法大字与淡彩青龙", noteEn: "Calligraphic titles, watercolour dragon", hero: "/hero-gallery/dragon-scholar.webp", focus: "50% 22%", swatch: ["#efe6d4", "#3f5f58", "#b79a5a"] },
  { id: "dragon-lotus", ref: 5, mode: "light", zh: "龍蓮日卷", hans: "龙莲日卷", en: "Dragon & Lotus", noteZh: "金邊卷軸卡片，龍與蓮舟", noteHans: "金边卷轴卡片，龙与莲舟", noteEn: "Gold-edged scroll cards, dragon and lotus", hero: "/hero-gallery/cloud-dragon.webp", focus: "40% 20%", swatch: ["#f1e8d8", "#234e43", "#c4a263"] },
  { id: "night-flute", ref: 6, mode: "dark", zh: "夜・龍吟", hans: "夜・龙吟", en: "Night Flute", noteZh: "深海夜藍，金色按鈕，吹笛少年與青龍", noteHans: "深海夜蓝，金色按钮，吹笛少年与青龙", noteEn: "Deep-sea night, gold buttons, flautist and dragon", hero: "/theme-skins/night-flute-art.webp", focus: "50% 30%", swatch: ["#0a1b27", "#e0be80", "#143347"] },
  { id: "day-flute", ref: 7, mode: "light", zh: "日・龍吟", hans: "日・龙吟", en: "Day Flute", noteZh: "霧白底，深藍按鈕，同一幅畫的日間版", noteHans: "雾白底，深蓝按钮，同一幅画的日间版", noteEn: "Misty paper, deep-blue buttons, the daylight edition", hero: "/intro/zhaowu-opening-r148.jpg", focus: "50% 28%", swatch: ["#eee6d6", "#0f4059", "#b9a06a"] },
  { id: "night-palace", ref: 8, mode: "dark", zh: "夜・宮闕", hans: "夜・宫阙", en: "Night Palace", noteZh: "寬幅夜景，雕花邊框卡片", noteHans: "宽幅夜景，雕花边框卡片", noteEn: "Wide night scene, ornate-framed cards", hero: "/theme-skins/night-palace-art.webp", focus: "50% 35%", swatch: ["#07121a", "#d8b574", "#16303f"] },
  { id: "pine-ink", ref: 9, mode: "light", zh: "青松簡約", hans: "青松简约", en: "Pine Minimal", noteZh: "墨字大標，深綠實心按鈕", noteHans: "墨字大标，深绿实心按钮", noteEn: "Bold ink titles, solid green buttons", hero: "/hero-gallery/temple-bamboo-rain.webp", focus: "50% 45%", swatch: ["#f4efe3", "#1f4a3a", "#172b25"] },
  { id: "pastel-koi", ref: 10, mode: "light", zh: "粉彩錦鯉", hans: "粉彩锦鲤", en: "Pastel Koi", noteZh: "粉藍紫水彩，輕盈細字", noteHans: "粉蓝紫水彩，轻盈细字", noteEn: "Pastel watercolour, light type", hero: "/hero-gallery/koi-dragon-rider.webp", focus: "50% 40%", swatch: ["#f7efe3", "#6f9a98", "#e8c9c1"] },
  // 宋式留白：新增可選系列；維持既有 10 套與經典預設不變。
  { id: "song-clear-dragon", ref: 11, mode: "light", zh: "雲龍留白", hans: "云龙留白", en: "Dragon in Clear Air", noteZh: "青玉遠山・暖紙大留白・淡金細線", noteHans: "青玉远山・暖纸大留白・淡金细线", noteEn: "Jade mountains, open paper, restrained gold", hero: "/art/zhaowu-dragon-lake-v1.webp", focus: "50% 52%", swatch: ["#f8f4eb", "#315e50", "#a99570"] },
  { id: "song-rain-bank", ref: 12, mode: "light", zh: "煙汀雨過", hans: "烟汀雨过", en: "After the Rain", noteZh: "雨青湖色・薄墨水岸・細框無浮飾", noteHans: "雨青湖色・薄墨水岸・细框无浮饰", noteEn: "Rainwashed lake blue, thin ink, quiet frames", hero: "/hero-gallery/river-rain-boat.webp", focus: "50% 48%", swatch: ["#f4f3eb", "#315c67", "#98a890"] },
  { id: "song-lotus-still", ref: 13, mode: "light", zh: "素荷清漪", hans: "素荷清漪", en: "Still Lotus", noteZh: "藕白荷影・暖墨茶色・水波留白", noteHans: "藕白荷影・暖墨茶色・水波留白", noteEn: "Ivory lotus, tea ink, spacious ripples", hero: "/art/scene-lotus-boat-v1.webp", focus: "50% 44%", swatch: ["#fbf4ed", "#6a604b", "#b39770"] },
  { id: "song-osmanthus", ref: 14, mode: "light", zh: "桂月素箋", hans: "桂月素笺", en: "Osmanthus Letter", noteZh: "桂花暖金・月白宣紙・疏朗題跋", noteHans: "桂花暖金・月白宣纸・疏朗题跋", noteEn: "Osmanthus gold, moonlit paper, spare headings", hero: "/art/scene-osmanthus-tea-v1.webp", focus: "50% 45%", swatch: ["#f8f0e3", "#5c6044", "#b59a68"] },
];

export function skinById(id: string | null | undefined) {
  return SKINS.find((s) => s.id === id) ?? null;
}

export function readSkinId(): string {
  if (typeof document === "undefined") return "";
  return document.documentElement.getAttribute("data-zws") ?? "";
}

function storedSkin(): string | null {
  try { return localStorage.getItem(SKIN_KEY); } catch { return null; }
}

export function applySkin(id: string, persist = true) {
  if (typeof document === "undefined") return;
  const skin = skinById(id);
  const root = document.documentElement;
  if (skin) {
    root.setAttribute("data-zws", skin.id);
    root.setAttribute("data-zws-mode", skin.mode);
    // dark skins reuse the audited night-mode contrast layer
    if (skin.mode === "dark") root.setAttribute("data-zw-theme", "night");
    else root.removeAttribute("data-zw-theme");
  } else {
    root.removeAttribute("data-zws");
    root.removeAttribute("data-zws-mode");
    root.removeAttribute("data-zw-theme");
  }
  if (persist) {
    try { localStorage.setItem(SKIN_KEY, skin ? skin.id : "none"); } catch { /* private mode */ }
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", skin ? skin.swatch[0] : "#fffaf0");
  window.dispatchEvent(new Event(SKIN_EVENT));
}

export function hydrateSkin() {
  if (typeof window === "undefined") return;
  const stored = storedSkin();
  const id = stored === "none" ? "" : stored ?? SITE_DEFAULT_SKIN;
  if (id && skinById(id)) applySkin(id, false);
}

export function useSkin() {
  const [id, setId] = useState<string>(readSkinId);
  useEffect(() => {
    const sync = () => setId(readSkinId());
    window.addEventListener(SKIN_EVENT, sync);
    return () => window.removeEventListener(SKIN_EVENT, sync);
  }, []);
  return { id, skin: skinById(id), apply: (next: string) => applySkin(next) };
}
