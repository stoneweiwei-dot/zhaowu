import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readRouteMeta, escapeHtmlAttribute, injectRouteMeta } from "./build-route-html.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const AMP = "\u0026";

test("route-meta.json is well-formed with 3 languages per route", () => {
  const { origin, routes } = readRouteMeta();
  assert.equal(origin, "https://zhao-wu.com");
  const paths = Object.keys(routes);
  assert.equal(paths.length, 30, "expected the 30 sitemap-listed routes");
  assert.ok(paths.includes("/"));
  for (const path of paths) {
    assert.ok(path === "/" || path.startsWith("/"), `route key ${path} must be absolute`);
    assert.ok(!/\/$/.test(path) || path === "/", `route key ${path} must not end with a slash`);
    for (const language of ["zh-Hant", "zh-Hans", "en"]) {
      const entry = routes[path][language];
      assert.ok(entry, `${path} missing ${language}`);
      assert.ok(entry.title && entry.title.length >= 4, `${path} ${language} title too short`);
      assert.ok(entry.description && entry.description.length >= 12, `${path} ${language} description too short`);
    }
  }
});

test("every sitemap URL has a route-meta entry (and vice versa)", () => {
  const { routes } = readRouteMeta();
  const sitemap = read("public/sitemap.xml");
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].replace("https://zhao-wu.com", "") || "/");
  for (const loc of locs) assert.ok(routes[loc], `sitemap URL ${loc} has no route-meta entry`);
  for (const path of Object.keys(routes)) assert.ok(locs.includes(path), `route-meta entry ${path} is not in the sitemap`);
});

test("site shell consumes the route-meta resolver (runtime per-page meta)", () => {
  const shell = read("src/components/site-shell.tsx");
  assert.match(shell, /from "@\/lib\/route-meta"/);
  assert.match(shell, /routeMetaFor\(pathname\)/);
  assert.match(shell, /routeMetaForLanguage\(routeMeta, language\)/);
  // Home fallback copy stays inline: unknown routes and ja/ko/hi defaults are unchanged.
  assert.match(shell, /Free BaZi Chart · Four Pillars/);
  assert.match(shell, /真太陽時/);
});

test("escapeHtmlAttribute escapes HTML-special characters", () => {
  assert.equal(escapeHtmlAttribute('A & B < C > " D'), `A ${AMP}amp; B ${AMP}lt; C ${AMP}gt; ${AMP}quot; D`);
});

test("injectRouteMeta writes per-route title/description/og/canonical and drops homepage JSON-LD", () => {
  const fixture = [
    "<title>home</title>",
    '<meta name="description" content="home desc" />',
    '<link rel="canonical" href="https://zhao-wu.com/" />',
    '<meta property="og:title" content="home" />',
    '<meta property="og:url" content="https://zhao-wu.com/" />',
    '<meta name="twitter:title" content="home" />',
    '<script type="application/ld+json">{"@type":"WebSite"}</script>',
    '<script type="module" src="/app.js"></script>',
    '<div id="root"></div>',
  ].join("\n");
  const out = injectRouteMeta(fixture, { title: "T", description: "D" }, "/ziwei", "https://zhao-wu.com");
  assert.match(out, /<title>T<\/title>/);
  assert.match(out, /<meta name="description" content="D" \/>/);
  assert.match(out, /<link rel="canonical" href="https:\/\/zhao-wu\.com\/ziwei" \/>/);
  assert.match(out, /<meta property="og:url" content="https:\/\/zhao-wu\.com\/ziwei" \/>/);
  assert.match(out, /<meta name="twitter:title" content="T" \/>/);
  assert.doesNotMatch(out, /application\/ld\+json/);
  assert.match(out, /<script type="module" src="\/app\.js"><\/script>/);
  assert.match(out, /<div id="root"><\/div>/);
});

test("package.json build runs build-route-html after vite build", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.scripts.build, /^vite build && node scripts\/build-route-html\.mjs && tsc --noEmit$/);
});

test("vercel.json has no global SPA catch-all (soft-404 fix) and every client route is still reachable", () => {
  const vercel = JSON.parse(read("vercel.json"));
  assert.ok(!vercel.rewrites.some((r) => r.source === "/((?!api/).*)"), "global catch-all returns 200 for unknown URLs (soft 404)");
  // Client-only routes need an explicit rewrite; public routes are prerendered by build-route-html.
  const rewritten = vercel.rewrites
    .filter((r) => r.destination === "/index.html")
    .map((r) => r.source.replace(/\/:path\*$/, ""));
  const tree = read("src/routeTree.gen.ts");
  const block = tree.match(/interface FileRoutesByFullPath \{([\s\S]*?)\n\}/)[1];
  const routes = [...block.matchAll(/'([^']+)':/g)].map((m) => m[1]);
  assert.ok(routes.length > 30, "route tree parse sanity");
  const prerendered = new Set(Object.keys(readRouteMeta().routes));
  const uncovered = routes.filter(
    (p) => p !== "/" && !prerendered.has(p) && !rewritten.some((base) => p === base || p.startsWith(`${base}/`)),
  );
  assert.deepEqual(uncovered, [], `routes neither prerendered nor rewritten would 404 in production: ${uncovered.join(", ")}`);
  assert.match(read("public/404.html"), /<meta name="robots" content="noindex/);
});

test("old vercel.app host redirects the root path explicitly (/:path* alone does not redirect '/' on Vercel)", () => {
  const vercel = JSON.parse(read("vercel.json"));
  const hostRule = (r) => r.has?.some((h) => h.type === "host" && h.value === "stone-zhaowu-official.vercel.app");
  const root = vercel.redirects.find((r) => r.source === "/" && hostRule(r));
  assert.ok(root, "host-scoped redirect for '/' is required");
  assert.equal(root.destination, "https://zhao-wu.com/");
  assert.equal(root.permanent, true);
  const rest = vercel.redirects.find((r) => r.source === "/:path*" && hostRule(r));
  assert.equal(rest?.destination, "https://zhao-wu.com/:path*");
});
