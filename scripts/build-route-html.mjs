/**
 * Post-build step: write static per-route HTML into dist/ for every
 * sitemap-listed public route.
 *
 * Why: the app is a Vite SPA, so every direct request otherwise gets the
 * homepage shell — one title/description/og set for all URLs. Crawlers and
 * share previews do not run JavaScript. This script reuses the single source
 * of truth in src/lib/route-meta.json (the same data the runtime <SiteShell>
 * effect applies) and writes dist<route>/index.html with route-specific
 * zh-Hant metadata (the fixed default language of the static shell, matching
 * the homepage's existing static copy).
 *
 * Vercel serves these files from the filesystem before the SPA fallback
 * rewrite, so /ziwei gets its own meta while unknown paths keep the fallback.
 * The runtime effect still switches title/description per UI language after
 * hydration; the SPA itself is unchanged.
 *
 * Zero-config: no framework migration, no prerender pipeline, no new service.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const META_PATH = join(ROOT, "src/lib/route-meta.json");
const AMP = "\u0026"; // &

export function readRouteMeta() {
  return JSON.parse(readFileSync(META_PATH, "utf8"));
}

export function escapeHtmlAttribute(value) {
  return String(value)
    .replace(/&/g, AMP + "amp;")
    .replace(/</g, AMP + "lt;")
    .replace(/>/g, AMP + "gt;")
    .replace(/"/g, AMP + "quot;");
}

function replaceMetaTag(html, pattern, value) {
  const escaped = escapeHtmlAttribute(value);
  return html.replace(pattern, (_match, before, after) => before + escaped + after);
}

/**
 * Injects route-specific metadata into the built SPA shell HTML.
 * Removes the homepage-only JSON-LD block so structured data is not
 * duplicated across every public URL.
 */
export function injectRouteMeta(html, entry, routePath, origin) {
  const url = `${origin}${routePath === "/" ? "/" : routePath}`;
  let out = html;

  out = out.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtmlAttribute(entry.title)}</title>`);
  out = replaceMetaTag(out, /(<meta name="description" content=")[^"]*(")/, entry.description);
  out = replaceMetaTag(out, /(<meta property="og:title" content=")[^"]*(")/, entry.title);
  out = replaceMetaTag(out, /(<meta property="og:description" content=")[^"]*(")/, entry.description);
  out = replaceMetaTag(out, /(<meta property="og:url" content=")[^"]*(")/, url);
  out = replaceMetaTag(out, /(<meta name="twitter:title" content=")[^"]*(")/, entry.title);
  out = replaceMetaTag(out, /(<meta name="twitter:description" content=")[^"]*(")/, entry.description);
  out = out.replace(/(<link rel="canonical" href=")[^"]*(")/, (_match, before, after) => before + escapeHtmlAttribute(url) + after);
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/, "");
  return out;
}

export function buildRouteHtml(distDir = join(ROOT, "dist")) {
  const indexPath = join(distDir, "index.html");
  if (!existsSync(indexPath)) {
    throw new Error(`dist/index.html not found at ${indexPath} — run "vite build" first.`);
  }
  const { origin, routes } = readRouteMeta();
  const shell = readFileSync(indexPath, "utf8");
  const written = [];
  for (const route of Object.keys(routes)) {
    if (route === "/") continue; // homepage shell already carries its own meta
    const entry = routes[route]["zh-Hant"];
    const html = injectRouteMeta(shell, entry, route, origin);
    const target = join(distDir, route, "index.html");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html);
    written.push(route);
  }
  return written;
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
if (invokedDirectly) {
  const written = buildRouteHtml();
  console.log(`build-route-html: wrote ${written.length} route HTML files (${written.join(", ")})`);
}
