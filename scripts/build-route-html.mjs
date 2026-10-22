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
 * Routes listed in STATIC_PAGES additionally get a route-specific static body
 * (replacing the homepage static shell) plus Article/FAQPage/BreadcrumbList
 * JSON-LD, rendered from the same JSON the React page reads, so the crawlable
 * text can never drift from the page.
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

const TRUE_SOLAR_CONTENT_PATH = join(ROOT, "src/lib/true-solar-time-content.json");

function esc(value) {
  return escapeHtmlAttribute(value);
}

function signed(n) {
  return `${n > 0 ? "+" : n < 0 ? "\u2212" : "\u00b1"}${Math.abs(n)}`;
}

function utcLabel(offset) {
  return `UTC${offset >= 0 ? "+" : "\u2212"}${Math.abs(offset)}`;
}

/** Static zh-Hant body + JSON-LD for /knowledge/true-solar-time, from the shared content JSON. */
export function renderTrueSolarStatic(origin) {
  const c = JSON.parse(readFileSync(TRUE_SOLAR_CONTENT_PATH, "utf8"));
  const t = c.locales["zh-Hant"];
  const pairs = (items) => `<ul>${items.map(([n, x]) => `<li><strong>${esc(n)}</strong>\uff1a${esc(x)}</li>`).join("")}</ul>`;
  const rows = c.examples
    .map(
      (r) =>
        `<tr><th scope="row">${esc(r.place["zh-Hant"])}</th><td>${esc(r.civilStamp)}</td><td>${utcLabel(r.utcOffset)}</td><td>${signed(r.longitudeMinutes)}</td><td>${signed(r.eotMinutes)}</td><td>${signed(r.shiftMinutes)}</td><td>${esc(r.trueSolarStamp)}</td></tr>`,
    )
    .join("");
  const main = [
    '<main class="zw-static-shell" lang="zh-Hant">',
    '<nav aria-label="breadcrumb"><a href="/">\u662d\u68a7</a> \u203a <a href="/knowledge">\u77e5\u8b58\u5eab</a></nav>',
    `<h1>${esc(t.h1)}</h1>`,
    `<p>${esc(t.lead)}</p>`,
    `<p>${esc(t.basis)}</p>`,
    `<h2>${esc(t.what.h)}</h2>`,
    `<p>${esc(t.what.p)}</p>`,
    pairs(t.what.items),
    `<p>${esc(t.what.after)}</p>`,
    `<h2>${esc(t.formula.h)}</h2>`,
    `<pre>${t.formula.lines.map(esc).join("\n")}</pre>`,
    ...t.formula.notes.map((n) => `<p>${esc(n)}</p>`),
    `<h2>${esc(t.table.h)}</h2>`,
    `<p>${esc(t.table.intro)}</p>`,
    `<div style="overflow-x:auto"><table><thead><tr>${t.table.cols.map((x) => `<th scope="col">${esc(x)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`,
    ...t.table.notes.map((n) => `<p>${esc(n)}</p>`),
    `<h2>${esc(t.effects.h)}</h2>`,
    pairs(t.effects.items),
    `<h2>${esc(t.south.h)}</h2>`,
    ...t.south.p.map((n) => `<p>${esc(n)}</p>`),
    `<h2>${esc(t.limits.h)}</h2>`,
    pairs(t.limits.items),
    `<h2>${esc(t.faq.h)}</h2>`,
    ...t.faq.items.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`),
    `<p><a href="/#birth-form">${esc(t.cta.label)}</a> \u00b7 <a href="/knowledge">${esc(t.cta.back)}</a></p>`,
    "</main>",
  ].join("\n");

  const url = `${origin}${c.path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: t.h1,
        description: t.lead,
        inLanguage: "zh-Hant",
        datePublished: c.datePublished,
        dateModified: c.dateModified,
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: "\u662d\u68a7", url: `${origin}/` },
        publisher: { "@type": "Organization", name: "\u662d\u68a7", url: `${origin}/` },
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faq.items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "\u662d\u68a7", item: `${origin}/` },
          { "@type": "ListItem", position: 2, name: "\u77e5\u8b58\u5eab", item: `${origin}/knowledge` },
          { "@type": "ListItem", position: 3, name: t.h1, item: url },
        ],
      },
    ],
  };
  return { main, jsonLd };
}

/** Route path -> renderer returning { main, jsonLd }. Routes not listed keep the homepage static shell. */
export const STATIC_PAGES = {
  "/knowledge/true-solar-time": renderTrueSolarStatic,
};

/** Replaces the homepage static shell with the route's own body and appends its JSON-LD to <head>. */
export function injectStaticPage(html, routePath, origin) {
  const render = STATIC_PAGES[routePath];
  if (!render) return html;
  const { main, jsonLd } = render(origin);
  const shellPattern = /<main class="zw-static-shell"[\s\S]*?<\/main>/;
  if (!shellPattern.test(html)) throw new Error(`static shell not found in built index.html for ${routePath}`);
  const ld = `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>\n  `;
  return html.replace(shellPattern, () => main).replace("</head>", () => `${ld}</head>`);
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
    const html = injectStaticPage(injectRouteMeta(shell, entry, route, origin), route, origin);
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
