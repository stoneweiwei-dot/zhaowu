import type { Locale } from "@/lib/i18n";

/** Owner-music manifest titles use "中文｜English". Unknown names stay untouched. */
export function musicDisplayName(rawName: string, locale: Locale) {
  const raw = rawName.trim();
  const separator = raw.indexOf("｜");
  if (separator < 0) return { primary: raw, secondary: "" };
  const chinese = raw.slice(0, separator).trim();
  const english = raw.slice(separator + 1).trim();
  if (!chinese || !english) return { primary: raw, secondary: "" };
  return locale === "en"
    ? { primary: english, secondary: chinese }
    : { primary: locale === "zh-Hans" ? simplifiedMusicTitle(chinese) : chinese, secondary: english };
}

/** Only transforms characters occurring in our curated song titles; do not alter artist filenames. */
function simplifiedMusicTitle(title: string): string {
  const chars: Record<string, string> = {
    韻: "韵", 漸: "渐", 隱: "隐", 紙: "纸", 曉: "晓", 霧: "雾",
    雲: "云", 錄: "录", 聖: "圣", 響: "响", 覺: "觉",
    運: "运", 蓮: "莲", 餘: "余", 靜: "静", 頂: "顶",
    雙: "双", 樂: "乐", 錦: "锦", 齋: "斋", 舊: "旧",
  };
  return Array.from(title, (character) => chars[character] ?? character).join("");
}
