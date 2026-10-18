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
  assert.equal(paths.length, 26, "expected the 26 sitemap-listed routes");
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

test("vercel.json keeps the SPA fallback rewrite (filesystem-first still applies)", () => {
  const vercel = JSON.parse(read("vercel.json"));
  const fallback = vercel.rewrites.find((r) => r.source === "/((?!api/).*)");
  assert.ok(fallback, "SPA fallback rewrite must remain");
  assert.equal(fallback.destination, "/index.html");
});
