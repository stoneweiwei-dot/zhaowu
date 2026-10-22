import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const json = async (path) => JSON.parse(await read(path));

const MANIFESTS = {
  "zh-Hant": { file: "public/manifest.webmanifest", lang: "zh-TW" },
  "zh-Hans": { file: "public/manifest.zh-Hans.webmanifest", lang: "zh-Hans" },
  en: { file: "public/manifest.en.webmanifest", lang: "en" },
};

test("three manifests share one installed identity and differ only in language fields", async () => {
  const base = await json(MANIFESTS["zh-Hant"].file);
  const names = new Set();
  for (const [key, { file, lang }] of Object.entries(MANIFESTS)) {
    const m = await json(file);
    assert.equal(m.lang, lang, `${key} lang`);
    for (const field of ["id", "start_url", "scope", "display", "background_color", "theme_color", "icons"]) {
      assert.deepEqual(m[field], base[field], `${key}.${field} must match the default manifest`);
    }
    assert.ok(m.name && m.short_name && m.description, `${key} has name/short_name/description`);
    names.add(m.name);
  }
  assert.equal(names.size, 3, "each language has its own name");
  assert.match((await json(MANIFESTS.en.file)).name, /^ZHAOWU/);
  assert.doesNotMatch((await json(MANIFESTS.en.file)).name, /[一-鿿]/);
  assert.match((await json(MANIFESTS["zh-Hans"].file)).name, /选择分析/);
  assert.match((await json(MANIFESTS["zh-Hant"].file)).name, /選擇分析/);
});

test("manifest language mapping: Chinese variants map to themselves, everything else to English", async () => {
  const lib = await read("src/lib/manifest-locale.ts");
  assert.match(lib, /"zh-Hant": "\/manifest\.webmanifest"/);
  assert.match(lib, /"zh-Hans": "\/manifest\.zh-Hans\.webmanifest"/);
  assert.match(lib, /en: "\/manifest\.en\.webmanifest"/);
  assert.match(lib, /language === "zh-Hant" \|\| language === "zh-Hans" \? language : "en"/);
  const display = await read("src/lib/display-language.ts");
  assert.match(display, /import \{ applyManifestLocale \} from "@\/lib\/manifest-locale"/);
  assert.match(display, /document\.documentElement\.lang = language;\s*applyManifestLocale\(language\)/);
});

test("index.html points the manifest at the visitor's language before React boots", async () => {
  const html = await read("index.html");
  assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest" \/>/);
  assert.match(html, /savedLanguage === "zh-Hans" \? "\/manifest\.zh-Hans\.webmanifest" : savedLanguage === "en" \? "\/manifest\.en\.webmanifest" : "\/manifest\.webmanifest"/);
  assert.match(html, /apple-mobile-web-app-title[\s\S]{0,200}savedLanguage === "en" \? "ZHAOWU" : "昭梧"/);
  // The bootstrap script must set the manifest only after savedLanguage is resolved.
  assert.ok(html.indexOf("savedLanguage = /-cn|-sg|hans/") < html.indexOf('savedLanguage === "zh-Hans" ? "/manifest.zh-Hans.webmanifest"'));
});

test("localized manifests are never edge-cached and satisfy the CSP", async () => {
  const vercel = await json("vercel.json");
  const headers = new Map(vercel.headers.map((entry) => [entry.source, entry.headers]));
  for (const source of ["/manifest.webmanifest", "/manifest.zh-Hans.webmanifest", "/manifest.en.webmanifest"]) {
    const cache = (headers.get(source) ?? []).find((h) => h.key.toLowerCase() === "cache-control")?.value ?? "";
    assert.match(cache, /no-store/, `${source} cache-control`);
  }
  const csp = (headers.get("/(.*)") ?? []).find((h) => h.key === "Content-Security-Policy")?.value ?? "";
  assert.match(csp, /manifest-src 'self'/);
});

test("/guide has no page: it redirects server-side to a content page and stays out of the sitemap", async () => {
  const vercel = await json("vercel.json");
  const rule = vercel.redirects.find((r) => r.source === "/guide/:path*");
  assert.ok(rule, "guide redirect exists");
  assert.equal(rule.destination, "/?guide=1");
  assert.equal(rule.permanent, false, "temporary so it can become a real page later");
  assert.ok(vercel.redirects.indexOf(rule) < vercel.redirects.findIndex((r) => r.has), "guide rule precedes the host redirect");
  const sitemap = await read("public/sitemap.xml");
  assert.doesNotMatch(sitemap, /\/guide/);
  const dock = await read("src/components/site-utility-dock.tsx");
  assert.match(dock, /searchParams\.get\("guide"\) !== "1"/);
  assert.match(dock, /setPanel\("guide"\)/);
  assert.match(dock, /searchParams\.delete\("guide"\)/);
  // Declared after the pathname-reset effect, otherwise setPanel(null) would win on mount.
  assert.ok(dock.indexOf('searchParams.get("guide")') > dock.indexOf("setPanel(null); setAsked(false); }, [pathname]"));
});

test("release-watch cron is declared, bounded and authenticated", async () => {
  const vercel = await json("vercel.json");
  assert.ok(vercel.crons.some((c) => c.path === "/api/release-watch" && /^\d+ \d+ \* \* \*$/.test(c.schedule)), "daily cron");
  assert.ok(vercel.functions["api/release-watch.js"].maxDuration <= 30);
});
