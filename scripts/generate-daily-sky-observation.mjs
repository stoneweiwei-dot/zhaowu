#!/usr/bin/env node
/**
 * Deterministic daily Sydney sky observation generator (#1017).
 *
 * - Uses the repository's approved self-hosted astronomy-engine bundle
 *   (`public/vendor/astronomy-engine-2.1.19.browser.min.js`) to compute
 *   verifiable Sydney (`Australia/Sydney`, -33.8688, 151.2093) Moon and
 *   planetary rise/set/transit times and meridian-transit illumination.
 * - Produces identical numerical values across `zh-Hant`, `zh-Hans`, and `en`.
 * - Idempotent & non-destructive: if `OBSERVATIONS` in
 *   `src/components/daily-sky-observation.tsx` already contains the target
 *   date, it exits 0 without overwriting curated/BoM-verified records unless
 *   `--force` is explicitly passed.
 * - Never fabricates S/A major planetary events, JPL Horizons verification,
 *   or unverified weather/light-pollution readings: unverified layers are
 *   explicitly marked as "資料暫缺" / "资料暂缺" / "Data unavailable".
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENGINE_PATH = join(ROOT, "public/vendor/astronomy-engine-2.1.19.browser.min.js");
const COMPONENT_PATH = join(ROOT, "src/components/daily-sky-observation.tsx");
const SYDNEY_LAT = -33.8688;
const SYDNEY_LON = 151.2093;

export function sydneyDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function loadAstronomyEngine() {
  const code = readFileSync(ENGINE_PATH, "utf8");
  const ctx = { window: {}, globalThis: {}, Date, Math, Number, Error };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const engine = ctx.Astronomy || ctx.window.Astronomy;
  if (!engine) throw new Error("Failed to load self-hosted Astronomy Engine");
  return engine;
}

function sydneyDayStartUtc(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(`Invalid Sydney date format: ${dateStr}`);
  }
  for (const offsetHours of [11, 10]) {
    const candidate = new Date(Date.parse(`${dateStr}T00:00:00Z`) - offsetHours * 3_600_000);
    const checkDate = sydneyDateString(candidate);
    const checkHour = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Australia/Sydney",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(candidate);
    if (checkDate === dateStr && (checkHour === "00:00" || checkHour === "24:00")) {
      return candidate;
    }
  }
  return new Date(Date.parse(`${dateStr}T00:00:00Z`) - 11 * 3_600_000);
}

function formatSydneyTime(astroTime) {
  if (!astroTime || !astroTime.date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(astroTime.date);
}

function moonPhaseLabels(phaseDeg) {
  const p = ((phaseDeg % 360) + 360) % 360;
  if (p < 12 || p >= 348) return { "zh-Hant": "朔月（新月附近）", "zh-Hans": "朔月（新月附近）", en: "New Moon phase" };
  if (p < 78) return { "zh-Hant": "盈眉月", "zh-Hans": "盈眉月", en: "Waxing crescent" };
  if (p < 102) return { "zh-Hant": "上弦月", "zh-Hans": "上弦月", en: "First quarter" };
  if (p < 168) return { "zh-Hant": "盈凸月", "zh-Hans": "盈凸月", en: "Waxing gibbous" };
  if (p < 192) return { "zh-Hant": "望月（滿月附近）", "zh-Hans": "望月（满月附近）", en: "Full Moon phase" };
  if (p < 258) return { "zh-Hant": "虧凸月", "zh-Hans": "亏凸月", en: "Waning gibbous" };
  if (p < 282) return { "zh-Hant": "下弦月", "zh-Hans": "下弦月", en: "Last quarter" };
  return { "zh-Hant": "殘月", "zh-Hans": "残月", en: "Waning crescent" };
}

export function buildDailySkySnapshot(dateStr) {
  const Astronomy = loadAstronomyEngine();
  const observer = new Astronomy.Observer(SYDNEY_LAT, SYDNEY_LON, 0);
  const start = sydneyDayStartUtc(dateStr);

  const moonRise = formatSydneyTime(Astronomy.SearchRiseSet("Moon", observer, +1, start, 1));
  const moonSet = formatSydneyTime(Astronomy.SearchRiseSet("Moon", observer, -1, start, 1));
  const moonTransit = Astronomy.SearchHourAngle("Moon", observer, 0, start, +1);
  const transitClock = formatSydneyTime(moonTransit.time);
  const illumPct = (Astronomy.Illumination("Moon", moonTransit.time).phase_fraction * 100).toFixed(1);
  const phase = moonPhaseLabels(Astronomy.MoonPhase(moonTransit.time));

  const marsRise = formatSydneyTime(Astronomy.SearchRiseSet("Mars", observer, +1, start, 1));
  const jupiterRise = formatSydneyTime(Astronomy.SearchRiseSet("Jupiter", observer, +1, start, 1));
  const venusRise = formatSydneyTime(Astronomy.SearchRiseSet("Venus", observer, +1, start, 1));
  const saturnSet = formatSydneyTime(Astronomy.SearchRiseSet("Saturn", observer, -1, start, 1));

  const [year, month] = dateStr.split("-").map(Number);

  return {
    date: dateStr,
    moon: {
      "zh-Hant": `${phase["zh-Hant"]}；${transitClock} 過中天時照明 ${illumPct}%（月中天瞬時值，非全天固定照明）。${moonRise} 月出，${moonSet} 月落。`,
      "zh-Hans": `${phase["zh-Hans"]}；${transitClock} 过中天时照明 ${illumPct}%（月中天瞬时值，非全天固定照明）。${moonRise} 月出，${moonSet} 月落。`,
      en: `${phase.en}; ${illumPct}% illuminated at its ${transitClock} meridian transit (transit instant, not fixed all day). Moonrise ${moonRise}; moonset ${moonSet}.`,
    },
    planets: {
      "zh-Hant": `悉尼當日星曆計算：土星約 ${saturnSet} 落下；凌晨火星 ${marsRise}、木星 ${jupiterRise}、金星 ${venusRise} 升起。水星鄰近太陽方向時不建議直接觀測。`,
      "zh-Hans": `悉尼当日星历计算：土星约 ${saturnSet} 落下；凌晨火星 ${marsRise}、木星 ${jupiterRise}、金星 ${venusRise} 升起。水星邻近太阳方向时不建议直接观测。`,
      en: `Sydney ephemeris times: Saturn sets around ${saturnSet}; Mars rises at ${marsRise}, Jupiter at ${jupiterRise} and Venus at ${venusRise}. Avoid viewing Mercury when close to the Sun.`,
    },
    events: {
      "zh-Hant": "資料暫缺：本日 S／A 重大行星事件、JPL 交叉比對與90天日曆尚待獨立星曆核驗，不代表沒有重大事件。",
      "zh-Hans": "资料暂缺：本日 S／A 重大行星事件、JPL 交叉比对与90天日历尚待独立星历核验，不代表没有重大事件。",
      en: "Data unavailable: today's S/A major planetary events, JPL cross-checks and the 90-day calendar await independent ephemeris verification; this does not mean there are no major events.",
    },
    weather: {
      "zh-Hant": "資料暫缺：當日逐時能見度與實測光害資料暫缺；外出觀測前請先核對澳洲氣象局（BoM）悉尼最新預報並遠離強光。",
      "zh-Hans": "资料暂缺：当日逐时能见度与实测光害资料暂缺；外出观测前请先核对澳大利亚气象局（BoM）悉尼最新预报并远离强光。",
      en: "Data unavailable: hour-by-hour visibility and measured light-pollution readings are unavailable; check the latest Australian Bureau of Meteorology (BoM) Sydney forecast before observing.",
    },
    sources: [
      { title: `Timeanddate · Sydney Astronomy (${dateStr} AEDT/AEST)`, url: "https://www.timeanddate.com/astronomy/australia/sydney" },
      { title: `Timeanddate · Sydney Moon, ${year}-${String(month).padStart(2, "0")}`, url: `https://www.timeanddate.com/moon/australia/sydney?month=${month}&year=${year}` },
      { title: "Timeanddate · Sydney Night Sky Planets", url: "https://www.timeanddate.com/astronomy/night/australia/sydney" },
      { title: "Australian Bureau of Meteorology · Sydney Forecast", url: "https://www.bom.gov.au/places/nsw/north-sydney/forecast" },
    ],
  };
}

export function upsertObservationSource(sourceText, snapshot, { force = false } = {}) {
  const existingPattern = new RegExp(`date:\\s*"${snapshot.date}"`);
  if (existingPattern.test(sourceText) && !force) {
    return { updated: false, content: sourceText, reason: `Snapshot for ${snapshot.date} already exists` };
  }
  const serialized = `  {\n    date: ${JSON.stringify(snapshot.date)},\n    moon: {\n      "zh-Hant": ${JSON.stringify(snapshot.moon["zh-Hant"])},\n      "zh-Hans": ${JSON.stringify(snapshot.moon["zh-Hans"])},\n      en: ${JSON.stringify(snapshot.moon.en)}\n    },\n    planets: {\n      "zh-Hant": ${JSON.stringify(snapshot.planets["zh-Hant"])},\n      "zh-Hans": ${JSON.stringify(snapshot.planets["zh-Hans"])},\n      en: ${JSON.stringify(snapshot.planets.en)}\n    },\n    events: {\n      "zh-Hant": ${JSON.stringify(snapshot.events["zh-Hant"])},\n      "zh-Hans": ${JSON.stringify(snapshot.events["zh-Hans"])},\n      en: ${JSON.stringify(snapshot.events.en)}\n    },\n    weather: {\n      "zh-Hant": ${JSON.stringify(snapshot.weather["zh-Hant"])},\n      "zh-Hans": ${JSON.stringify(snapshot.weather["zh-Hans"])},\n      en: ${JSON.stringify(snapshot.weather.en)}\n    },\n    sources: [\n${snapshot.sources.map((s) => `      { title: ${JSON.stringify(s.title)}, url: ${JSON.stringify(s.url)} }`).join(",\n")}\n    ]\n  }`;

  const marker = "\n];\n\nconst UI:";
  const idx = sourceText.indexOf(marker);
  if (idx === -1) {
    throw new Error("OBSERVATIONS array closing marker not found in daily-sky-observation.tsx");
  }
  const nextContent = `${sourceText.slice(0, idx)},\n${serialized}${sourceText.slice(idx)}`;
  return { updated: true, content: nextContent, reason: `Appended snapshot for ${snapshot.date}` };
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isCli) {
  const dateArg = process.argv.find((a) => a.startsWith("--date="))?.slice(7);
  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");
  const targetDate = dateArg || sydneyDateString(new Date());
  const snapshot = buildDailySkySnapshot(targetDate);
  const current = readFileSync(COMPONENT_PATH, "utf8");
  const result = upsertObservationSource(current, snapshot, { force });
  if (result.updated && !dryRun) {
    writeFileSync(COMPONENT_PATH, result.content, "utf8");
  }
  console.log(`[generate-daily-sky-observation] ${targetDate}: ${result.reason}${dryRun ? " (dry-run)" : ""}`);
}
