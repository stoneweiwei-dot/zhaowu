import routeMetaData from "./route-meta.json";

export const SITE_ORIGIN: string = routeMetaData.origin;

export type RouteMetaLanguage = "zh-Hant" | "zh-Hans" | "en";
export type RouteMetaEntry = { title: string; description: string };
export type RouteMeta = Record<RouteMetaLanguage, RouteMetaEntry>;

/**
 * Per-route SEO metadata for the sitemap-listed public routes.
 *
 * Single source of truth shared by:
 * - the runtime <SiteShell> effect (title/description/og tags on navigation);
 * - scripts/build-route-html.mjs (static per-route HTML written into dist/
 *   so crawlers and share previews see route-specific meta without JS).
 *
 * Keys must match public/sitemap.xml <loc> paths exactly. Unknown routes fall
 * back to the homepage entry ("/") at the call sites, never to invented copy.
 */
export const ROUTE_META: Record<string, RouteMeta> = routeMetaData.routes;

export const ROUTE_META_PATHS: string[] = Object.keys(ROUTE_META);

function normalizePathname(pathname: string): string {
  const withoutQuery = String(pathname || "").split(/[?#]/)[0];
  if (withoutQuery === "/") return "/";
  return withoutQuery.replace(/\/+$/, "") || "/";
}

/** Returns the meta entry for a pathname, or null when the route has no entry. */
export function routeMetaFor(pathname: string): RouteMeta | null {
  const meta = ROUTE_META[normalizePathname(pathname)];
  return meta ?? null;
}

/**
 * Picks the entry for a UI language. ja/ko/hi (implemented but hidden from the
 * public language selector) intentionally fall back to English meta rather
 * than getting machine-invented translations.
 */
export function routeMetaForLanguage(meta: RouteMeta, language: string): RouteMetaEntry {
  if (language === "zh-Hant" || language === "zh-Hans") return meta[language];
  return meta.en;
}
