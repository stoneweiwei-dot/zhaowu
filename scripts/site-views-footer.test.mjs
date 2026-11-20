import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Owner 2026-10-01 / 2026-11-11: cumulative visit counts (legacy base + new DB count) must always be visible
// in the page footer, even when the new database count is 0 or the fetch fails.
const shell = await readFile(new URL("../src/components/site-shell.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const statsSrc = await readFile(new URL("../src/lib/site-stats.ts", import.meta.url), "utf8");

function loadVisitFormatters(tsSource) {
  const baseMatch = tsSource.match(/export const LEGACY_VISITS_BASE\s*=\s*([\d_]+);/);
  assert.ok(baseMatch, "LEGACY_VISITS_BASE must be exported in src/lib/site-stats.ts");
  const legacyBase = Number(baseMatch[1].replaceAll("_", ""));
  const start = tsSource.indexOf("export function getDisplayedTotalVisits");
  const end = tsSource.indexOf("export const SITE_RELEASE_FALLBACK");
  assert.ok(start > -1 && end > start, "visit formatters must be exported in src/lib/site-stats.ts");
  const jsFns = tsSource
    .slice(start, end)
    .replaceAll(/^export\s+/gm, "")
    .replaceAll(/newDbCount:\s*number\s*\|\s*null\s*\|\s*undefined\s*=\s*0/g, "newDbCount = 0")
    .replaceAll(/total:\s*number,\s*language:\s*string/g, "total, language")
    .replaceAll(/language:\s*string/g, "language")
    .replaceAll(/\):\s*(?:string|number)\s*\{/g, ") {")
    .replaceAll(/value:\s*number/g, "value");
  return new Function(
    "LEGACY_VISITS_BASE",
    `${jsFns}; return { legacyBase: LEGACY_VISITS_BASE, getDisplayedTotalVisits, formatCumulativeVisitsNumber, formatCumulativeVisitsLabel, formatCumulativeVisits };`,
  )(legacyBase);
}

test("footer always shows cumulative visits (confirmed 2444 legacy base + new DB count) as a cumulative-only badge without today visits in footer or header", () => {
  assert.match(shell, /data-site-views/);
  assert.match(shell, /data-site-views-number/);
  assert.match(shell, /data-site-views-label/);
  assert.match(shell, /LEGACY_VISITS_BASE/);
  assert.match(shell, /formatCumulativeVisitsNumber\(displayedTotal,\s*language\)/);
  assert.match(shell, /formatCumulativeVisitsLabel\(language\)/);
  assert.match(shell, /const displayedTotal = LEGACY_VISITS_BASE \+ \(stats\.totalVisits > 0 \? stats\.totalVisits : 0\)/);
  assert.doesNotMatch(shell, /stats\.totalVisits > 0 \?\s*\(\s*<p[^>]*data-site-views/);
  assert.doesNotMatch(shell, /data-site-views-today/);
  assert.doesNotMatch(shell, /stats\.todayVisits/);
  assert.doesNotMatch(shell, /今日瀏覽|Views today/);
  const statusStripMatch = shell.match(/<div[^>]*data-site-status-strip>[\s\S]*?<\/div>/);
  assert.ok(statusStripMatch, "header status strip must exist");
  assert.doesNotMatch(statusStripMatch[0], /cumulativeVisits|todayVisits|totalVisits/);
});

test("LEGACY_VISITS_BASE is confirmed as 2444 and visit number/label formatters format thousands in zh-Hant, zh-Hans, and en naturally", () => {
  assert.doesNotMatch(statsSrc, /PLACEHOLDER|暫填|待確認|佔位|unconfirmed/i);
  const {
    legacyBase,
    getDisplayedTotalVisits,
    formatCumulativeVisitsNumber,
    formatCumulativeVisitsLabel,
    formatCumulativeVisits,
  } = loadVisitFormatters(statsSrc);
  assert.equal(legacyBase, 2444, "LEGACY_VISITS_BASE must be confirmed as 2444");
  assert.equal(getDisplayedTotalVisits(0), 2444);
  assert.equal(getDisplayedTotalVisits(null), 2444);
  assert.equal(getDisplayedTotalVisits(undefined), 2444);
  assert.equal(getDisplayedTotalVisits(-5), 2444);
  assert.equal(getDisplayedTotalVisits(156), 2600);
  assert.equal(formatCumulativeVisitsLabel("zh-Hant"), "累計訪客");
  assert.equal(formatCumulativeVisitsLabel("zh-Hans"), "累计访客");
  assert.equal(formatCumulativeVisitsLabel("en"), "Total visits");
  assert.equal(formatCumulativeVisitsNumber(2444, "zh-Hant"), "2,444");
  assert.equal(formatCumulativeVisitsNumber(2444, "zh-Hans"), "2,444");
  assert.equal(formatCumulativeVisitsNumber(2444, "en"), "2,444+");
  assert.equal(formatCumulativeVisitsNumber(2444 + 356, "zh-Hant"), "2,800");
  assert.equal(formatCumulativeVisitsNumber(2444 + 356, "zh-Hans"), "2,800");
  assert.equal(formatCumulativeVisitsNumber(2444 + 356, "en"), "2,800+");
  assert.equal(formatCumulativeVisits(2444, "zh-Hant"), "累計 2,444 人次");
  assert.equal(formatCumulativeVisits(2444, "zh-Hans"), "累计 2,444 人次");
  assert.equal(formatCumulativeVisits(2444, "en"), "2,444+ visits");
});

test("footer view-count block is styled with Song serif numerals, jade/gold tokens, and rice-paper border while the counter RPC is unchanged", () => {
  assert.match(css, /\.zhaowu-site-footer \.zhaowu-site-views/);
  assert.match(css, /\.zhaowu-site-footer \.zhaowu-site-views__number/);
  assert.match(css, /var\(--zw-jade/);
  assert.match(css, /var\(--zw-line/);
  assert.match(css, /white-space:\s*nowrap/);
  assert.match(statsSrc, /rpc\/zhaowu_record_visit/);
  assert.match(statsSrc, /site_settings\?key=eq\.visitor_count/);
});

test("automated browsers (CI / smoke / Playwright) are never counted as visits", () => {
  assert.match(statsSrc, /export function isAutomatedBrowser/);
  assert.match(statsSrc, /nav\.webdriver/);
  assert.match(statsSrc, /HeadlessChrome/);
  // the guard must run before any network call or visitor key creation in recordVisit
  const body = statsSrc.slice(statsSrc.indexOf("export async function recordVisit"));
  assert.ok(body.indexOf("isAutomatedBrowser()") > -1 && body.indexOf("isAutomatedBrowser()") < body.indexOf("publicFetch"));
});
