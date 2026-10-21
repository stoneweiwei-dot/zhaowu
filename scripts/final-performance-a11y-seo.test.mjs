import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("homepage starts with the owner-selected wallpaper and the birth entry", async () => {
  const home = await source("src/routes/index.tsx");
  const paintedHome = await source("src/components/painted-home.tsx");
  const shell = await source("src/components/site-shell.tsx");
  assert.doesNotMatch(home, /HERO_PAINTINGS|zw-hero-gallery|visibleHeroIndexes/);
  assert.match(home, /import \{ PaintedHome \} from "@\/components\/painted-home"/);
  assert.match(paintedHome, /data-home-resolve/);
  assert.match(paintedHome, /data-home-birth-entry/);
  assert.match(shell, /--zhaowu-shell-wallpaper/);
});

test("secondary homepage modules are deferred until their panels open", async () => {
  const home = await source("src/routes/index.tsx");
  for (const moduleName of [
    "daily-almanac-widget",
    "sky-events-home-section",
    "life-view-home-section",
    "scent-five-element-test",
  ]) {
    assert.match(home, new RegExp(`import\\("@/components/${moduleName}"\\)`));
  }
  assert.doesNotMatch(home, /import \{ DailyAlmanacWidget \} from/);
  assert.doesNotMatch(home, /import \{ LifeViewHomeSection \} from/);
  assert.doesNotMatch(home, /<Suspense fallback=\{null\}>/);
  assert.match(home, /zw-home-inline-loading/);
  assert.match(home, /role="status"/);
});

test("site shell exposes keyboard skip navigation and localized metadata", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const css = await source("src/zhaowu-design-system.css");
  assert.match(shell, /className="zhaowu-skip-link"/);
  assert.match(shell, /id="zhaowu-main-content"/);
  assert.match(shell, /document\.title = title/);
  assert.match(shell, /meta\[name="description"\]/);
  assert.match(shell, /meta\[property="og:title"\]/);
  assert.match(shell, /meta\[name="twitter:title"\]/);
  assert.match(css, /\.zhaowu-skip-link/);
});

test("index provides conservative JSON-LD without invented ratings or testimonials", async () => {
  const html = await source("index.html");
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type": "WebSite"/);
  assert.match(html, /"@type": "WebApplication"/);
  assert.doesNotMatch(html, /aggregateRating|review|offers/);
});

test("custom domain is canonical and uses the same-origin Supabase proxy", async () => {
  const html = await source("index.html");
  assert.match(html, /<link rel="canonical" href="https:\/\/zhao-wu\.com\/" \/>/);
  assert.match(html, /"url": "https:\/\/zhao-wu\.com\//);
  assert.doesNotMatch(html, /stone-zhaowu-official\.vercel\.app/);
  const config = await source("src/lib/supabase-config.ts");
  assert.match(config, /PROXY_HOST_DOMAINS = \["stone-zhaowu-official\.vercel\.app", "zhao-wu\.com"\]/);
  assert.match(config, /return onProxyHost \? `\$\{origin\}\$\{SAME_ORIGIN_PROXY_PREFIX\}`/);
});

test("the legacy Vercel alias redirects to the canonical custom domain", async () => {
  const vercel = JSON.parse(await source("vercel.json"));
  const redirect = vercel.redirects?.find((item) =>
    item.has?.some((condition) => condition.type === "host" && condition.value === "stone-zhaowu-official.vercel.app"),
  );
  assert.equal(redirect?.destination, "https://zhao-wu.com/:path*");
  assert.equal(redirect?.permanent, true);
});
