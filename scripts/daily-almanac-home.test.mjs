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

test("homepage puts the primary birth flow before Today Guide while keeping one reading path", () => {
  const formMount = route.indexOf("<AnalysisForm />");
  const daily = route.indexOf("<DailyAlmanacWidget embedded />");
  const report = route.indexOf("<ResultView result={current} />");
  assert.ok(formMount >= 0 && report > formMount && daily > report);
  assert.match(route, /todayTitle: "Today"/);
  assert.match(route, /todayTitle: "今日"/);
  assert.match(widget, /zhaowu-daily-details\$\{embedded \? " is-embedded-open"/);
  assert.match(form, /id="customer-record" className="zhaowu-customer-record"/);
  assert.match(form, /id="bazi"/);
  assert.match(route, /home-layout-r46\.css/);
  assert.match(route, /home-birth-hub-r60\.css/);
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


test("Today Guide location is confirmed only from browser geolocation", () => {
  for (const value of [
    'source: "browser" | "none"',
    "navigator.geolocation.getCurrentPosition",
    "timeout: 8_000",
    "maximumAge: 5 * 60_000",
    "api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}",
    'source === "browser"',
    "function locationLabel(visitor: VisitorContext | null, locale: Locale)",
    'visitor.city.trim().toLowerCase() !== "washington"',
    "Location not confirmed", "尚未确认位置", "尚未確認位置",
    "\"Located\"", "\"已定位\""
  ]) assert.ok(widget.includes(value), `Missing expected location contract: ${value}`);
  assert.doesNotMatch(widget, /ipwho\.is|ipapi\.co|ipinfo\.io/);
});

test("Today Guide invalidates legacy IP cache and only stores browser-confirmed locations", () => {
  for (const value of [
    "zhaowu:visitor-context:v3",
    "removeItem(legacyKey)",
    "zhaowu:visitor-context:v4",
    'value?.source === "browser"',
    'typeof value.latitude === "number"',
    'typeof value.longitude === "number"',
    'window.localStorage.setItem("zhaowu:visitor-context:v4"',
    "if (!embedded && event.currentTarget.open) void requestLocation()",
    'className="zhaowu-today-location-control"',
    'className="zhaowu-today-location-control"',
    "seasonLabel(visitor.latitude, now.getMonth() + 1, locale)",
    "Season pending location"
  ]) assert.ok(widget.includes(value), `Missing expected cache/location contract: ${value}`);
});
