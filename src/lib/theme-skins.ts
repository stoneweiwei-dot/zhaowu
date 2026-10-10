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
  /** Source reference number in the owner's mood-board (圖1–圖10). */
  ref: number;
  hero: string;
  swatch: [string, string, string];
};

const art = (id: string) => `/theme-skins/${id}-hero.webp`;

export const SKINS: SkinDef[] = [
  { id: "lotus-boat", ref: 1, mode: "light", zh: "蓮舟山水", hans: "莲舟山水", en: "Lotus Skiff", noteZh: "宣紙米・墨綠・金線，山水捲首", noteHans: "宣纸米・墨绿・金线，山水卷首", noteEn: "Rice-paper cream, ink green, gold hairlines", hero: art("lotus-boat"), swatch: ["#f4ead7", "#285044", "#b8934d"] },
  { id: "cloud-jade", ref: 2, mode: "light", zh: "雲山青綠", hans: "云山青绿", en: "Cloud & Jade", noteZh: "淡墨青山，清簡留白", noteHans: "淡墨青山，清简留白", noteEn: "Pale ink mountains, calm whitespace", hero: art("cloud-jade"), swatch: ["#efe9db", "#2b5545", "#d9cfb8"] },
  { id: "golden-phoenix", ref: 3, mode: "light", zh: "金鳳朝陽", hans: "金凤朝阳", en: "Golden Phoenix", noteZh: "暖金旭日與白鳳", noteHans: "暖金旭日与白凤", noteEn: "Warm gold sun and white phoenix", hero: art("golden-phoenix"), swatch: ["#f3e6c8", "#26493c", "#c9a24f"] },
  { id: "ink-dragon", ref: 4, mode: "light", zh: "水墨飛龍", hans: "水墨飞龙", en: "Ink Dragon", noteZh: "書法大字與淡彩青龍", noteHans: "书法大字与淡彩青龙", noteEn: "Calligraphic titles, watercolour dragon", hero: art("ink-dragon"), swatch: ["#efe6d4", "#3f5f58", "#b79a5a"] },
  { id: "dragon-lotus", ref: 5, mode: "light", zh: "龍蓮日卷", hans: "龙莲日卷", en: "Dragon & Lotus", noteZh: "金邊卷軸卡片，龍與蓮舟", noteHans: "金边卷轴卡片，龙与莲舟", noteEn: "Gold-edged scroll cards, dragon and lotus", hero: art("dragon-lotus"), swatch: ["#f1e8d8", "#234e43", "#c4a263"] },
  { id: "night-flute", ref: 6, mode: "dark", zh: "夜・龍吟", hans: "夜・龙吟", en: "Night Flute", noteZh: "深海夜藍，金色按鈕，吹笛少年與青龍", noteHans: "深海夜蓝，金色按钮，吹笛少年与青龙", noteEn: "Deep-sea night, gold buttons, flautist and dragon", hero: art("night-flute"), swatch: ["#0a1b27", "#e0be80", "#143347"] },
  { id: "day-flute", ref: 7, mode: "light", zh: "日・龍吟", hans: "日・龙吟", en: "Day Flute", noteZh: "霧白底，深藍按鈕，同一幅畫的日間版", noteHans: "雾白底，深蓝按钮，同一幅画的日间版", noteEn: "Misty paper, deep-blue buttons, the daylight edition", hero: art("day-flute"), swatch: ["#eee6d6", "#0f4059", "#b9a06a"] },
  { id: "night-palace", ref: 8, mode: "dark", zh: "夜・宮闕", hans: "夜・宫阙", en: "Night Palace", noteZh: "寬幅夜景，雕花邊框卡片", noteHans: "宽幅夜景，雕花边框卡片", noteEn: "Wide night scene, ornate-framed cards", hero: art("night-palace"), swatch: ["#07121a", "#d8b574", "#16303f"] },
  { id: "pine-ink", ref: 9, mode: "light", zh: "青松簡約", hans: "青松简约", en: "Pine Minimal", noteZh: "墨字大標，深綠實心按鈕", noteHans: "墨字大标，深绿实心按钮", noteEn: "Bold ink titles, solid green buttons", hero: art("pine-ink"), swatch: ["#f4efe3", "#1f4a3a", "#172b25"] },
  { id: "pastel-koi", ref: 10, mode: "light", zh: "粉彩錦鯉", hans: "粉彩锦鲤", en: "Pastel Koi", noteZh: "粉藍紫水彩，輕盈細字", noteHans: "粉蓝紫水彩，轻盈细字", noteEn: "Pastel watercolour, light type", hero: art("pastel-koi"), swatch: ["#f7efe3", "#6f9a98", "#e8c9c1"] },
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
