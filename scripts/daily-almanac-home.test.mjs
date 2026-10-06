import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const widget = await readFile(new URL("../src/components/daily-almanac-widget.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/routes/index.tsx", import.meta.url), "utf8");
const form = await readFile(new URL("../src/components/analysis-form.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/home-layout-r46.css", import.meta.url), "utf8");
const hub = await readFile(new URL("../src/home-birth-hub-r60.css", import.meta.url), "utf8");
const almanacStyle = await readFile(new URL("../src/daily-almanac-r69.css", import.meta.url), "utf8");
const design = await readFile(new URL("../src/zhaowu-design-system.css", import.meta.url), "utf8");
const hero = await readFile(new URL("../src/home-hero-v1.css", import.meta.url), "utf8");

test("homepage puts Today Guide before the birth flow and preserves the approved full-guide mode", () => {
  const daily = route.indexOf("<LazyDailyAlmanacWidget onExpand={() => setTodayExpanded(true)} />");
  const formMount = route.indexOf("<AnalysisForm />");
  const report = route.indexOf("<ResultView result={current} />");
  const deepReading = route.indexOf("<DeepReadingHeroCard />");
  assert.ok(daily >= 0 && formMount > daily && report > formMount && deepReading > report);
  assert.match(route, /id="home-today-guide"/);
  assert.match(route, /const \[todayExpanded, setTodayExpanded\] = useState\(false\)/);
  assert.match(route, /setTodayExpanded\(true\)/);
  assert.match(route, /<LazyDailyAlmanacWidget embedded \/>/);
  assert.match(route, /<LazyDailyAlmanacWidget onExpand=\{\(\) => setTodayExpanded\(true\)\} \/>/);
  assert.match(route, /className="zw-home-today-collapse"/);
  assert.doesNotMatch(route, /scrollIntoView/);
  assert.match(widget, /onExpand\?: \(\) => void/);
  assert.match(widget, /if \(onExpand\) onExpand\(\)/);
  assert.match(widget, /zhaowu-daily-details\$\{embedded \? " is-embedded-open"/);
  assert.doesNotMatch(route, /activeSection === "today"/);
  assert.match(route, /import\("@\/components\/daily-almanac-widget"\)/);
  assert.match(route, /navToday: "Today"/);
  assert.match(route, /navToday: "今日"/);
  assert.match(form, /id="customer-record" className="zhaowu-customer-record"/);
  assert.match(form, /id="bazi"/);
  assert.match(route, /home-layout-r46\.css/);
  assert.match(route, /home-birth-hub-r60\.css/);
});

test("home reserves Today loading space and stops automatic painting motion when requested", () => {
  assert.match(route, /className="zw-home-today-skeleton"/);
  assert.match(route, /prefers-reduced-motion: reduce/);
  assert.match(route, /heroManual/);
  assert.match(hero, /\.zw-home-today-skeleton/);
  assert.match(hero, /min-height:\s*168px/);
  assert.match(hero, /prefers-reduced-motion: reduce/);
});

test("daily almanac uses the canonical calendar and shows current year month day hour pillars", () => {
  assert.match(widget, /dayGanzhi, hourPillar, yearMonthPillars/);
  assert.doesNotMatch(widget, /REFERENCE_UTC/);
  assert.doesNotMatch(widget, /function ganzhiForDay/);
  assert.match(widget, /const values = \[pillars\.year, pillars\.month, pillars\.day, pillars\.hour\]/);
  assert.match(widget, /zhaowu-daily-pillars/);
  assert.match(widget, /當下年月日時干支/);
  assert.match(widget, /jieName/);
  assert.match(widget, /setInterval\(refresh, 30_000\)/);
  assert.match(widget, /DailyColorsModule variant="embed" date=\{now\}/);
});

test("daily almanac keeps the daily spirit slip available to guests", () => {
  assert.match(widget, /stableHash/);
  assert.match(widget, /drawSlip/);
  assert.match(widget, /\/today\/spirit-slip-song-mineral-v1\.webp/);
  assert.doesNotMatch(widget, /listPublicGalleryAssets|galleryPublicUrl/);
  assert.doesNotMatch(widget, /needLogin|needBirth|goLogin|goBirth|slip-gate/);
  assert.doesNotMatch(widget, /useCurrentUserState/);
  assert.match(widget, /stableHash\(`\$\{dayKey\}\|daily-spirit-slip`\)/);
  assert.match(widget, /function drawSlip\(\) \{ setSlipOpen\(true\); \}/);
});

test("daily guide uses the canonical type system, readable touch targets and restrained motion", () => {
  assert.match(almanacStyle, /min-height:\s*0 !important/);
  assert.match(almanacStyle, /border-radius:\s*14px !important/);
  assert.match(almanacStyle, /var\(--font-display/);
  assert.match(almanacStyle, /grid-template-columns:\s*repeat\(4/);
  assert.match(almanacStyle, /zhaowu-daily-details/);
  assert.match(almanacStyle, /zhaowu-today-guide__summary/);
  assert.match(almanacStyle, /width:\s*44px;[\s\S]*height:\s*44px/);
  assert.match(almanacStyle, /zw-home-panel-enter/);
  assert.match(almanacStyle, /zhaowu-home-stage--daily-priority/);
  assert.match(almanacStyle, /:not\(\[open\]\) \.zhaowu-today-guide__expanded/);
  assert.doesNotMatch(almanacStyle, /\.zhaowu-home-layout \.zhaowu-daily-details \{ display:none/);
  assert.match(design, /-webkit-font-smoothing:\s*antialiased/);
});

test("r46 preserves mobile-first whitespace and responsive directory grids", () => {
  assert.match(layout, /\.zhaowu-daily-almanac/);
  assert.match(layout, /border-radius:\s*34px/);
  assert.match(layout, /@media \(max-width: 560px\)/);
  assert.match(layout, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  for (const e of ["\u6728", "\u706b", "\u571f", "\u91d1", "\u6c34"]) {
    assert.match(hub, new RegExp(`data-element="${e}"`));
  }
});

test("r96 almanac paints four distinct pillar colours and hides duplicate yi labels", () => {
  assert.match(widget, /data-pillar=\{PILLAR_KEYS\[index\]\}/);
  assert.match(widget, /lunarDateLabel/);
  assert.match(almanacStyle, /data-pillar="year"/);
  assert.match(almanacStyle, /data-pillar="hour"/);
  assert.match(almanacStyle, /#b23a2f/);
  assert.match(almanacStyle, /#2f6b5a/);
  assert.match(almanacStyle, /small:empty/);
});


test("Today Guide reuses granted browser location and refreshes it automatically", () => {
  for (const value of [
    'source: "browser" | "ip" | "none"',
    "navigator.geolocation.getCurrentPosition",
    "navigator.permissions.query",
    'permission.state === "granted"',
    "30 * 24 * 60 * 60_000",
    "15 * 60_000",
    "visibilitychange",
    "api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}",
    "function locationLabel(visitor: VisitorContext | null, locale: Locale)",
  ]) assert.ok(widget.includes(value), `Missing expected automatic location contract: ${value}`);
});

test("Today Guide uses only the same-origin Vercel coarse location fallback when precise permission is unavailable", () => {
  assert.match(widget, /fetch\("\/api\/visitor-location"/);
  assert.match(widget, /source: "ip"/);
  assert.match(widget, /value\?\.source === "browser" \|\| value\?\.source === "ip"/);
  assert.match(widget, /visitor\.source !== "none"/);
  assert.doesNotMatch(widget, /ipwho\.is|ipapi\.co|ipinfo\.io/);
});

test("Today location keeps the visible permission feedback for first-time precise opt-in", () => {
  assert.match(widget, /zhaowu-today-location-inline/);
  assert.match(widget, /locationError === "denied"/);
  assert.match(widget, /visitor\.timezone\.split\("\/"\)/);
  assert.match(design, /\.zhaowu-today-location-inline/);
  assert.match(design, /\.zhaowu-today-location-error/);
});
