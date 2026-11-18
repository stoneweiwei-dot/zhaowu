/** Build crawlable documents for every public route × ten URL languages.
 * Public static files take precedence over Vercel's restricted language rewrites.
 * Existing rich Chinese/English content is reused; other article bodies retain
 * their runtime fallback, with localized editorial summaries in the document.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { LANGUAGES, languagePath, languageAlternates } from "../src/lib/language-routing.js";

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
export function injectRouteMeta(html, entry, routePath, origin, language = "zh-Hant") {
  const url = `${origin}${routePath === "/" ? "/" : routePath}`;
  let out = html.replace(/(<html[^>]* lang=")[^"]*(")/, `$1${language}$2`);
  out = out.replace(/<link[^>]*hreflang=[^>]*>\s*/g, "");
  const alternates = languageAlternates(routePath, origin).map(({ language, href }) =>
    `<link rel="alternate" hreflang="${language}" href="${escapeHtmlAttribute(href)}" />`).join("\n  ");
  out = out.replace("</head>", `${alternates}\n</head>`);

  out = out.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtmlAttribute(entry.title)}</title>`);
  out = replaceMetaTag(out, /(<meta name="description" content=")[^"]*(")/, entry.description);
  out = replaceMetaTag(out, /(<meta property="og:title" content=")[^"]*(")/, entry.title);
  out = replaceMetaTag(out, /(<meta property="og:description" content=")[^"]*(")/, entry.description);
  out = replaceMetaTag(out, /(<meta property="og:url" content=")[^"]*(")/, url);
  out = replaceMetaTag(out, /(<meta name="twitter:title" content=")[^"]*(")/, entry.title);
  out = replaceMetaTag(out, /(<meta name="twitter:description" content=")[^"]*(")/, entry.description);
  out = out.replace(/(<link rel="canonical" href=")[^"]*(")/, (_match, before, after) => before + escapeHtmlAttribute(url) + after);
  if (routePath !== "/" || language !== "zh-Hant") out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/, "");
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
export function renderTrueSolarStatic(origin, language = "zh-Hant") {
  const c = JSON.parse(readFileSync(TRUE_SOLAR_CONTENT_PATH, "utf8"));
  const t = c.locales[language];
  const pairs = (items) => `<ul>${items.map(([n, x]) => `<li><strong>${esc(n)}</strong>\uff1a${esc(x)}</li>`).join("")}</ul>`;
  const rows = c.examples
    .map(
      (r) =>
        `<tr><th scope="row">${esc(r.place[language])}</th><td>${esc(r.civilStamp)}</td><td>${utcLabel(r.utcOffset)}</td><td>${signed(r.longitudeMinutes)}</td><td>${signed(r.eotMinutes)}</td><td>${signed(r.shiftMinutes)}</td><td>${esc(r.trueSolarStamp)}</td></tr>`,
    )
    .join("");
  const copy = SHELL_COPY[language];
  const main = [
    '<main class="zw-static-shell" lang="zh-Hant">',
    `<nav aria-label="breadcrumb"><a href="/">${esc(copy.home)}</a> › <a href="/knowledge">${esc(copy.knowledge)}</a></nav>`,
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
    `<nav aria-label="${esc(copy.knowledge)}"><h2>${esc(copy.knowledge)}</h2><ul>${["/knowledge/five-elements-tone-qi", "/knowledge/shushu-boundary", "/knowledge/system-map"].map(p => `<li><a href="${p}">${esc(readRouteMeta().routes[p][language].title)}</a></li>`).join("")}</ul></nav>`,
    "</main>",
  ].join("\n");

  const url = `${origin}${languagePath(c.path, language)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: t.h1,
        description: t.lead,
        inLanguage: language,
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
  return { main: localizeStaticLinks(main.replace('lang="zh-Hant"', `lang="${language}"`), language), jsonLd };
}

/** Route path -> renderer returning { main, jsonLd }. Routes not listed keep the homepage static shell. */
export const STATIC_PAGES = {
  "/knowledge/true-solar-time": renderTrueSolarStatic,
};

/** Replaces the homepage static shell with the route's own body and appends its JSON-LD to <head>. */
export function injectStaticPage(html, routePath, origin, language = "zh-Hant") {
  const render = ["zh-Hant", "zh-Hans", "en"].includes(language) && STATIC_PAGES[routePath];
  const { main, jsonLd } = render ? render(origin, language) : renderRouteSummary(routePath, language);
  const shellPattern = /<main class="zw-static-shell"[\s\S]*?<\/main>/;
  if (!shellPattern.test(html)) throw new Error(`static shell not found in built index.html for ${routePath}`);
  const ld = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>\n  ` : "";
  return html.replace(shellPattern, () => main).replace("</head>", () => `${ld}</head>`);
}

const SUMMARIES = JSON.parse(readFileSync(join(ROOT, "src/lib/route-static-summaries.json"), "utf8"));
const SHELL_COPY = JSON.parse(readFileSync(join(ROOT, "src/lib/seo-shell-copy.json"), "utf8"));

function localizeStaticLinks(main, language) {
  return main.replace(/href="(\/[^"\s]*)"/g, (_, path) => `href="${languagePath(path, language)}"`);
}

/** Localized title, lead and editorial body; never a claim of full article translation. */
export function renderRouteSummary(routePath, language = "zh-Hant") {
  const routes = readRouteMeta().routes;
  const entry = routes[routePath]?.[language];
  if (!entry) throw new Error(`missing route metadata for ${routePath} ${language}`);
  const copy = SHELL_COPY[language];
  const knowledgePaths = ["/knowledge/true-solar-time", "/knowledge/five-elements-tone-qi", "/knowledge/shushu-boundary", "/knowledge/system-map"];
  const links = (routePath === "/knowledge" || knowledgePaths.includes(routePath))
    ? `<nav aria-label="${esc(copy.knowledge)}"><h2>${esc(copy.knowledge)}</h2><ul>${knowledgePaths.filter(p => p !== routePath).map(p => `<li><a href="${esc(p)}">${esc(routes[p][language].title)}</a></li>`).join("")}</ul></nav>`
    : "";
  const paragraphs = SUMMARIES[routePath]?.[language] ?? [];
  const main = `<main class="zw-static-shell" lang="${language}"><nav aria-label="${esc(copy.home)}"><a href="/">${esc(copy.home)}</a> · <a href="/knowledge">${esc(copy.knowledge)}</a></nav><h1>${esc(entry.title)}</h1><p data-static-lead>${esc(entry.description)}</p><section data-static-summary>${paragraphs.map(p => `<p>${esc(p)}</p>`).join("\n")}</section>${links}<p>${esc(copy.fallback)}</p><p><a href="/?zw_entry=chart#birth-form">${esc(copy.chart)}</a></p></main>`;
  return { main: localizeStaticLinks(main, language), jsonLd: null };
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
    for (const language of LANGUAGES) {
      const path = languagePath(route, language);
      let html = injectRouteMeta(shell, routes[route][language], path, origin, language);
      // Preserve the established rich default homepage and its reader recovery links.
      if (route !== "/" || language !== "zh-Hant") html = injectStaticPage(html, route, origin, language);
      const target = join(distDir, path, "index.html");
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, html);
      written.push(path);
    }
  }
  return written;
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
if (invokedDirectly) {
  const written = buildRouteHtml();
  console.log(`build-route-html: wrote ${written.length} route HTML files (10 languages)`);
}
