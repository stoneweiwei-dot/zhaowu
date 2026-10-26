import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("homepage starts with the owner-selected theme and one guided accordion entry", async () => {
  const home = await source("src/routes/index.tsx");
  const painted = await source("src/components/painted-home.tsx");
  const tree = await source("src/components/home-tree.tsx");
  const shell = await source("src/components/site-shell.tsx");
  assert.doesNotMatch(home, /HERO_PAINTINGS|zw-hero-gallery|visibleHeroIndexes/);
  assert.match(home, /<PaintedHome/);
  assert.match(painted, /ph-guide-start/);
  assert.match(painted, /<HomeTree/);
  assert.match(tree, /useState<HomeSection \| null>\('form'\)/);
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


test("static fallback offers first-screen entry to homepage and working birth form", async () => {
  const html = await source("index.html");
  const start = html.indexOf('<main class="zw-static-shell" lang="zh-Hant">');
  const end = html.indexOf("</main>", start);
  assert.ok(start >= 0 && end > start, "HTML crawlable fallback must exist when JS is unavailable");
  const fallback = html.slice(start, end);
  const navAt = fallback.indexOf('class="zw-static-entry"');
  assert.ok(navAt > 0 && navAt < fallback.indexOf("<h2>主要功能</h2>"), "Entry links must appear above long SEO text");
  assert.ok(fallback.includes('href="/?zw_entry=home" data-static-home-link'), "Missing direct home link");
  assert.ok(fallback.includes('href="/?zw_entry=chart#birth-form" data-static-chart-link'), "Missing chart link");
  for (const caption of ["進入昭梧首頁", "进入昭梧首页", "Enter ZHAOWU", "免費八字排盤", "免费八字排盘", "Free birth chart"]) {
    assert.ok(fallback.includes(caption), "Missing fallback label: " + caption);
  }
  assert.ok(html.includes("min-height: 44px"), "Tap targets must be at least 44px tall");
  const home = await source("src/routes/index.tsx");
  assert.ok(home.includes('BIRTH_HASHES = ["#birth-form"'), "Chart deep-link must be supported");
  assert.ok(home.includes("openBirthBook({ focusYear: false })"), "Deep-link must open form without extra tap");
});

test("reader and full-text translation views retain first-screen escape guidance", async () => {
  const html = await source("index.html");
  const mainStart = html.indexOf('<main class="zw-static-shell" lang="zh-Hant">');
  const mainEnd = html.indexOf("</main>", mainStart);
  assert.ok(mainStart >= 0 && mainEnd > mainStart, "Static fallback must exist");
  const body = html.slice(mainStart, mainEnd);
  // Reader-style text extractors may remove navigation but retain article paragraphs.
  const readerBody = body.replace(/<nav\\b[^>]*>[\\s\\S]*?<\\/nav>/g, "");
  const introEnd = readerBody.indexOf("<h2>主要功能</h2>");
  const lead = readerBody.slice(0, introEnd);
  assert.ok(lead.includes('data-static-reader-access'), "Reader-help text must be a paragraph, not a nav");
  assert.ok(lead.includes("Translate Full Text／翻譯全文"), "Recognizable translation-mode exit steps are required");
  assert.ok(lead.includes('href="https://zhao-wu.com/#birth-form"'), "Visible link to full browser birth form is required");
  assert.ok(lead.includes('href="https://zhao-wu.com/"'), "Visible link to homepage is required");
  assert.ok(lead.indexOf('data-static-reader-access') < lead.indexOf('免登入免費八字排盤'), "Recovery directions must precede feature copy");
  assert.ok(html.includes(".zw-static-reader-access a {"), "Tap-size CSS must cover inline recovery links");
  assert.ok(html.includes("min-height: 44px"), "Recovery links need mobile-sized tap targets");
});
