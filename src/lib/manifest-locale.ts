/**
 * PWA manifest localisation.
 *
 * A web-app manifest is fetched by the browser, not by our React code, and the
 * visitor's UI language lives in localStorage — so the server cannot choose a
 * language. Instead three static manifests share the same `id`/`scope`/icons
 * (one installed identity) and differ only in `lang`/`name`/`description`.
 * The `<link rel="manifest">` href is pointed at the right file by the inline
 * script in index.html (before React boots) and re-pointed here on language
 * change. Zero runtime services, zero cost.
 */
export type ManifestLanguage = "zh-Hant" | "zh-Hans" | "en";

export const MANIFEST_HREF: Record<ManifestLanguage, string> = {
  "zh-Hant": "/manifest.webmanifest",
  "zh-Hans": "/manifest.zh-Hans.webmanifest",
  en: "/manifest.en.webmanifest",
};

/** Label iOS uses for "Add to Home Screen" (apple-mobile-web-app-title). */
export const APP_TITLE: Record<ManifestLanguage, string> = {
  "zh-Hant": "昭梧",
  "zh-Hans": "昭梧",
  en: "ZHAOWU",
};

/** Anything that is not Chinese falls back to English, matching the site UI fallback. */
export function manifestLanguageFor(language: string): ManifestLanguage {
  return language === "zh-Hant" || language === "zh-Hans" ? language : "en";
}

export function manifestHrefFor(language: string): string {
  return MANIFEST_HREF[manifestLanguageFor(language)];
}

export function applyManifestLocale(language: string, doc: Document | undefined = typeof document === "undefined" ? undefined : document) {
  if (!doc) return;
  const key = manifestLanguageFor(language);
  const link = doc.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (link && link.getAttribute("href") !== MANIFEST_HREF[key]) link.setAttribute("href", MANIFEST_HREF[key]);
  const title = doc.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
  if (title && title.content !== APP_TITLE[key]) title.content = APP_TITLE[key];
}
