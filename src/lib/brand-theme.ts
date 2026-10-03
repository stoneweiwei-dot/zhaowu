import { useEffect, useState } from "react";

export const BRAND_THEME_KEY = "zhaowu.theme.v1";
export const BRAND_THEME_EVENT = "zhaowu-theme";
export type BrandTheme = "day" | "night";
/** Owner 2026-10-03: night mode is switched off site-wide (day is the stable theme). CSS stays dormant; flip to re-enable. */
export const NIGHT_MODE_ENABLED = false;

export function readBrandTheme(): BrandTheme {
  if (typeof document === "undefined") return "day";
  return document.documentElement.getAttribute("data-zw-theme") === "night" ? "night" : "day";
}

export function applyBrandTheme(requested: BrandTheme) {
  if (typeof document === "undefined") return;
  const theme: BrandTheme = NIGHT_MODE_ENABLED ? requested : "day";
  const root = document.documentElement;
  if (theme === "night") root.setAttribute("data-zw-theme", "night");
  else root.removeAttribute("data-zw-theme");
  try {
    localStorage.setItem(BRAND_THEME_KEY, theme);
  } catch {
    /* private mode */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "night" ? "#0A1311" : "#fffaf0");
  window.dispatchEvent(new Event(BRAND_THEME_EVENT));
}

export function hydrateBrandTheme() {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(BRAND_THEME_KEY);
    if (!NIGHT_MODE_ENABLED) applyBrandTheme("day");
    else if (stored === "night" || stored === "day") applyBrandTheme(stored);
  } catch {
    /* ignore */
  }
}

export function useBrandTheme() {
  const [theme, setTheme] = useState<BrandTheme>(readBrandTheme);
  useEffect(() => {
    const sync = () => setTheme(readBrandTheme());
    window.addEventListener(BRAND_THEME_EVENT, sync);
    return () => window.removeEventListener(BRAND_THEME_EVENT, sync);
  }, []);
  return {
    theme,
    night: theme === "night",
    toggle: () => applyBrandTheme(theme === "night" ? "day" : "night"),
  };
}
