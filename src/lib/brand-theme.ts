import { useEffect, useState } from "react";

export const BRAND_THEME_KEY = "zhaowu.theme.v1";
export const BRAND_THEME_EVENT = "zhaowu-theme";
export type BrandTheme = "day" | "night";

export function readBrandTheme(): BrandTheme {
  if (typeof document === "undefined") return "day";
  return document.documentElement.getAttribute("data-zw-theme") === "night" ? "night" : "day";
}

export function applyBrandTheme(theme: BrandTheme) {
  if (typeof document === "undefined") return;
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
    if (stored === "night" || stored === "day") applyBrandTheme(stored);
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
