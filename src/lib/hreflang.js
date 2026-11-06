export const LOCALES = ["zh-Hant", "zh-Hans", "en"];
export const DEFAULT_LOCALE = "zh-Hant";
export const LOCALE_PREFIX = { "zh-Hant": "", "zh-Hans": "/zh-Hans", en: "/en" };

export const HREFLANG_PATHS = new Set([
  "/about",
  "/knowledge",
  "/knowledge/five-elements-tone-qi",
  "/knowledge/nine-heavens-lamps",
  "/knowledge/shushu-boundary",
  "/knowledge/system-map",
  "/knowledge/true-solar-time",
]);
export const LOCALIZED_PATHS = new Set(["/", ...HREFLANG_PATHS]);

export function hasLocalizedPath(path) {
  return LOCALIZED_PATHS.has(normalizePath(path));
}

export function normalizePath(input) {
  let path = String(input || "/").split(/[?#]/, 1)[0];
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  return path.length > 1 ? path.replace(/\/+$/, "") : "/";
}

export function splitLocale(input) {
  const path = normalizePath(input);
  const lower = path.toLowerCase();
  if (lower === "/en" || lower.startsWith("/en/")) {
    return { locale: "en", path: normalizePath(path.slice(3)) };
  }
  if (lower === "/zh-hans" || lower.startsWith("/zh-hans/")) {
    return { locale: "zh-Hans", path: normalizePath(path.slice(8)) };
  }
  return { locale: DEFAULT_LOCALE, path };
}

export function withLocale(path, locale = DEFAULT_LOCALE) {
  const clean = normalizePath(path);
  const prefix = LOCALE_PREFIX[locale] ?? "";
  return prefix ? `${prefix}${clean === "/" ? "" : clean}` || prefix : clean;
}

export function htmlLang(locale) {
  return LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

export function ogLocale(locale) {
  return { "zh-Hant": "zh_TW", "zh-Hans": "zh_CN", en: "en_AU" }[locale] || "zh_TW";
}

export function hreflangTags(path, origin) {
  const clean = normalizePath(path);
  const urls = [
    ["zh-Hant", withLocale(clean, "zh-Hant")],
    ["zh-Hans", withLocale(clean, "zh-Hans")],
    ["en", withLocale(clean, "en")],
    ["x-default", withLocale(clean, "zh-Hant")],
  ];
  return urls.map(([locale, href]) => `    <link rel="alternate" hreflang="${locale}" href="${origin}${href}" />`).join("\n") + "\n  ";
}
