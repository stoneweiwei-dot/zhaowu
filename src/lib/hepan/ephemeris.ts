import type { CityHit } from "@/lib/bazi/types";
import { lahiriAyanamsa } from "@/lib/indian-astrology/engine";
import { nakshatraOf } from "@/lib/indian-astrology/parashari-engine";
import type { HepanCivilInput } from "./pair-model";
import type { VedicMoon } from "./vedic";
import type { WesternPairPositions, WesternPlanetKey } from "./western";

/**
 * Pair ephemeris for /hepan (approved by Shi 2026-11-24, 全批）.
 *
 * The western and vedic reference sections need real planet longitudes.
 * There is no server ephemeris: the site computes positions in the
 * browser from its vendored Astronomy Engine
 * (public/vendor/astronomy-engine-2.1.19.browser.min.js), exactly the
 * way the western depth page does. This module reuses that pattern:
 * lazy-load the same script (same SCRIPT_ID, so the western page and
 * this page share one loaded copy), take geocentric tropical ecliptic
 * longitudes, and derive the sidereal Moon from the Lahiri ayanamsa.
 *
 * - Western: Sun/Moon/Venus/Mars/Saturn tropical longitudes.
 * - Vedic: sidereal Moon sign + nakshatra (nakshatraOf from the site's
 *   own parashari engine). The Moon sign is only trusted when its
 *   tropical sign is stable across the sampling window.
 * - Time unknown: reference = local noon 12:00, sampled 00:00–23:59
 *   (same as western-depth-section.tsx). Time known: reference ± 2 min.
 *   Houses and angles are never computed here.
 *
 * This module touches window/document, so it is imported only by the
 * page component — never by pair-model.ts or the node tests.
 */

const SCRIPT_SRC = "/vendor/astronomy-engine-2.1.19.browser.min.js";
const SCRIPT_ID = "zhaowu-astronomy-engine-d60";

type AstronomyApi = {
  GeoVector: (body: string, date: Date, aberration: boolean) => unknown;
  Ecliptic: (vector: unknown) => { elon: number };
};

let pending: Promise<AstronomyApi> | null = null;

export function loadAstronomy(): Promise<AstronomyApi> {
  const win = window as typeof window & { Astronomy?: AstronomyApi };
  if (win.Astronomy) return Promise.resolve(win.Astronomy);
  if (pending) return pending;
  pending = new Promise<AstronomyApi>((resolve, reject) => {
    const current = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = current ?? document.createElement("script");
    script.addEventListener(
      "load",
      () => (win.Astronomy ? resolve(win.Astronomy) : reject(new Error("Astronomy API unavailable"))),
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error("Astronomy script unavailable")), {
      once: true,
    });
    if (!current) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }).catch((error: unknown) => {
    pending = null;
    throw error;
  });
  return pending;
}

function norm360(n: number): number {
  return ((n % 360) + 360) % 360;
}

function signOf(longitude: number): number {
  return Math.floor(norm360(longitude) / 30);
}

/**
 * Local civil time → UTC. Same DST-safe algorithm as
 * src/components/western-depth-section.tsx localToUtc: scan ±72h in
 * 15-minute steps and require exactly one match, so an ambiguous or
 * nonexistent civil time (DST transition) is rejected instead of
 * silently guessed.
 */
function localToUtc(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const target = [year, month, day, hour, minute].join(",");
  const matches: number[] = [];
  const localMs = Date.UTC(year, month - 1, day, hour, minute);
  for (let i = -72; i <= 72; i++) {
    const ms = localMs + i * 15 * 60 * 1000;
    const record: Record<string, number> = {};
    for (const p of fmt.formatToParts(new Date(ms))) {
      if (p.type !== "literal") record[p.type] = Number(p.value);
    }
    if ([record.year, record.month, record.day, record.hour, record.minute].join(",") === target) {
      matches.push(ms);
    }
  }
  if (matches.length !== 1) {
    throw new Error("Birth time is ambiguous or missing across a daylight-saving transition.");
  }
  return new Date(matches[0]);
}

export type HepanEphemerisPerson = {
  civil: HepanCivilInput;
  city: CityHit;
  timeUnknown: boolean;
};

export type HepanEphemeris = {
  westernA: WesternPairPositions;
  westernB: WesternPairPositions;
  /** False when either person's Moon sign is not stable across the day. */
  moonReliable: boolean;
  /** Null when the Moon sign is not stable across the day. */
  vedicA: VedicMoon | null;
  vedicB: VedicMoon | null;
};

const WESTERN_KEYS: WesternPlanetKey[] = ["Sun", "Moon", "Venus", "Mars", "Saturn"];

function longitudeOf(api: AstronomyApi, key: string, date: Date): number {
  const lon = api.Ecliptic(api.GeoVector(key, date, true)).elon;
  if (!Number.isFinite(lon)) throw new Error(`Invalid astronomical position: ${key}`);
  return norm360(lon);
}

function personEphemeris(
  api: AstronomyApi,
  person: HepanEphemerisPerson,
): { western: WesternPairPositions; vedic: VedicMoon | null } {
  const { civil, city, timeUnknown } = person;
  const refHour = timeUnknown ? 12 : civil.hour;
  const refMinute = timeUnknown ? 0 : civil.minute;
  const reference = localToUtc(city.timezone, civil.year, civil.month, civil.day, refHour, refMinute);
  const earlier = timeUnknown
    ? localToUtc(city.timezone, civil.year, civil.month, civil.day, 0, 0)
    : new Date(reference.getTime() - 120000);
  const later = timeUnknown
    ? localToUtc(city.timezone, civil.year, civil.month, civil.day, 23, 59)
    : new Date(reference.getTime() + 120000);

  const western = {} as WesternPairPositions;
  for (const key of WESTERN_KEYS) {
    const lon = longitudeOf(api, key, reference);
    const startLon = longitudeOf(api, key, earlier);
    const endLon = longitudeOf(api, key, later);
    western[key] = {
      longitude: lon,
      signReliable: signOf(lon) === signOf(startLon) && signOf(lon) === signOf(endLon),
    };
  }

  // Vedic Moon: sidereal longitude = tropical Moon − Lahiri ayanamsa.
  // No nakshatra without a birth time (the vedic module's own rule:
  // precision "unknown" refuses Nakshatra/Dasha); the sign is kept
  // only when stable across the whole day.
  let vedic: VedicMoon | null = null;
  if (western.Moon.signReliable) {
    const sidereal = norm360(western.Moon.longitude - lahiriAyanamsa(reference));
    let nakshatra: number | null = null;
    if (!timeUnknown) {
      const atRef = nakshatraOf(sidereal).index;
      const before = nakshatraOf(
        norm360(longitudeOf(api, "Moon", earlier) - lahiriAyanamsa(earlier)),
      ).index;
      const after = nakshatraOf(
        norm360(longitudeOf(api, "Moon", later) - lahiriAyanamsa(later)),
      ).index;
      nakshatra = atRef === before && atRef === after ? atRef : null;
    }
    vedic = {
      sign: Math.floor(sidereal / 30),
      degreeInSign: sidereal % 30,
      nakshatra,
      signReliable: true,
    };
  }
  return { western, vedic };
}

/** Load the Astronomy Engine once and compute both people's positions. */
export async function loadHepanEphemeris(
  a: HepanEphemerisPerson,
  b: HepanEphemerisPerson,
): Promise<HepanEphemeris> {
  const api = await loadAstronomy();
  const pa = personEphemeris(api, a);
  const pb = personEphemeris(api, b);
  return {
    westernA: pa.western,
    westernB: pb.western,
    moonReliable: pa.western.Moon.signReliable && pb.western.Moon.signReliable,
    vedicA: pa.vedic,
    vedicB: pb.vedic,
  };
}
