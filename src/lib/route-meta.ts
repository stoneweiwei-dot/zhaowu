import clientRouteData from "./client-route-meta.json";
import { languagePath, parseLanguagePath, type UrlLanguage } from "./language-routing.js";
import routeMetaData from "./route-meta.json";

export const SITE_ORIGIN: string = routeMetaData.origin;

export type RouteMetaLanguage = UrlLanguage;
export type RouteMetaEntry = { title: string; description: string };
export type RouteMeta = Partial<Record<RouteMetaLanguage, RouteMetaEntry>> & Record<"zh-Hant" | "en", RouteMetaEntry>;

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

const clientRoutes: Record<string, RouteMeta> = clientRouteData;

export const ROUTE_META_PATHS: string[] = Object.keys(ROUTE_META);

function normalizePathname(pathname: string): string {
  const withoutQuery = String(pathname || "").split(/[?#]/)[0];
  if (withoutQuery === "/") return "/";
  return withoutQuery.replace(/\/+$/, "") || "/";
}

/** Returns the meta entry for a pathname, or null when the route has no entry. */
export function routeMetaFor(pathname: string): RouteMeta | null {
  const path = normalizePathname(parseLanguagePath(pathname).rest);
  return ROUTE_META[path] ?? clientRoutes[path] ?? null;
}

/** Static HTML and client navigation share the same route copy. */
export function pageHead({ matches }: { matches: readonly { pathname: string }[] }) {
  const pathname = matches[matches.length - 1]?.pathname ?? "/";
  const { rest } = parseLanguagePath(pathname);
  const { language } = parseLanguagePath(typeof window === "undefined" ? pathname : window.location.pathname);
  const entry = routeMetaFor(pathname);
  if (!entry) return {};
  const { title, description } = routeMetaForLanguage(entry, language);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: SITE_ORIGIN + "/og.jpg" },
    ],
    links: [{ rel: "canonical", href: SITE_ORIGIN + languagePath(normalizePathname(rest), language) }],
  };
}

/** Every indexed URL has its own localized metadata. */
export function routeMetaForLanguage(meta: RouteMeta, language: string): RouteMetaEntry {
  return meta[language as RouteMetaLanguage] ?? meta["zh-Hant"];
}
