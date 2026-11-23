import { FEATURED_CITIES, filterFeatured, findFeaturedByAlias, localizeCityHit } from "@/lib/bazi/cities";
import type { CityHit } from "@/lib/bazi/types";
import { fuzzyChinaPlaces, isKnownPlace, localizeChinaPlace, searchChinaPlaces } from "@/lib/geo/china-places";

/**
 * Birthplace search used by the birth-record form.
 *
 * Coverage strategy (owner 2026-10-08: small towns must be findable):
 *  0. Offline China/Taiwan/HK/Macau gazetteer (all prefecture-level cities + 300 county-level
 *     cities; Traditional / Simplified / pinyin; timezone preset; ranked above remote results).
 *  1. Local featured cities (instant, offline).
 *  2. Open-Meteo geocoding (GeoNames; strong for Latin names, includes timezone).
 *  3. OSM Photon (OpenStreetMap; strong for CJK village/district names). Photon has
 *     no timezone, so those hits carry `timezone: ""` and are resolved from the
 *     coordinates by `resolveCityTimezone` before the city can be selected.
 *
 * A birthplace without a confirmed IANA timezone must never reach the chart engine:
 * callers fail closed when `resolveCityTimezone` cannot confirm one.
 */

const CJK = /[㐀-鿿豈-﫿]/u;
const cache = new Map<string, CityHit[]>();

const CJK_ALIASES: Record<string, string> = {
  台北: "Taipei", 臺北: "Taipei", 高雄: "Kaohsiung", 新竹: "Hsinchu",
  上海: "Shanghai", 廣州: "Guangzhou", 广州: "Guangzhou", 香港: "Hong Kong",
  雪梨: "Sydney", 悉尼: "Sydney", 東京: "Tokyo", 东京: "Tokyo",
};

function latinAlias(q: string) {
  return CJK_ALIASES[q.normalize("NFKC")] ?? "";
}

export function needsTimezone(city: CityHit) {
  return !city.timezone || (city.timezone === "UTC" && Math.abs(city.longitude) > 7.5);
}

function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[\s,，。·/\\-]+/g, "");
}

function dedupe(rows: CityHit[]) {
  const seen = new Set<string>();
  const out: CityHit[] = [];
  for (const row of rows) {
    if (!Number.isFinite(row.latitude) || !Number.isFinite(row.longitude)) continue;
    const key = `${normalize(row.name)}|${row.latitude.toFixed(1)}|${row.longitude.toFixed(1)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

/** Gazetteer hits first, then featured cities that are not the same place. */
export function searchLocalPlaces(q: string): CityHit[] {
  const gazetteer = searchChinaPlaces(q);
  const featured = filterFeatured(q).filter(
    (f) => !gazetteer.some((g) => Math.abs(g.latitude - f.latitude) < 0.1 && Math.abs(g.longitude - f.longitude) < 0.1),
  );
  return [...gazetteer, ...featured];
}

/**
 * The one offline place a typed query unambiguously names, or null.
 *
 * Matches an exact local name/display first, then a featured-city alias that
 * belongs to exactly one city ("Sydney" -> 雪梨，澳洲). Remote-only rows are
 * never returned here: a place the visitor did not pick from the dropdown
 * must never be silently confirmed, because remote ordering is not
 * contractual — the same name can be Sydney, Australia or Sydney, Canada.
 */
export function findLocalExactPlace(q: string): CityHit | null {
  const query = normalize(String(q ?? "").trim());
  if (!query) return null;
  for (const row of searchLocalPlaces(q)) {
    const firstLabel = row.display.split(/[，,]/)[0] ?? row.display;
    if ([row.name, row.display, firstLabel].map(normalize).includes(query)) return row;
  }
  return findFeaturedByAlias(q);
}

/** localizeCityHit + gazetteer places (Simplified / English display). */
export function localizePlaceHit(city: CityHit, locale: "zh-Hant" | "zh-Hans" | "en"): CityHit {
  const featured = localizeCityHit(city, locale);
  if (featured !== city) return featured;
  const display = localizeChinaPlace(city, locale);
  return display ? { ...city, display } : city;
}

async function openMeteo(q: string, signal: AbortSignal): Promise<CityHit[]> {
  const language = CJK.test(q) ? "zh" : "en";
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=${language}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const body = (await res.json()) as {
    results?: { name: string; country?: string; admin1?: string; admin2?: string; latitude: number; longitude: number; timezone?: string }[];
  };
  return (body.results ?? []).map((r) => ({
    name: r.name,
    country: r.country ?? "",
    display: [r.name, r.admin2 && r.admin2 !== r.name ? r.admin2 : null, r.admin1, r.country].filter(Boolean).join("，"),
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone || "",
  }));
}

const PHOTON_PLACE_KEYS = new Set(["place", "boundary"]);

async function photon(q: string, signal: AbortSignal): Promise<CityHit[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const body = (await res.json()) as {
    features?: {
      geometry?: { coordinates?: [number, number] };
      properties?: { name?: string; osm_key?: string; city?: string; district?: string; county?: string; state?: string; country?: string };
    }[];
  };
  const rows: CityHit[] = [];
  for (const feature of body.features ?? []) {
    const p = feature.properties ?? {};
    const coords = feature.geometry?.coordinates;
    if (!p.name || !coords) continue;
    if (p.osm_key && !PHOTON_PLACE_KEYS.has(p.osm_key)) continue;
    const parts = [p.name, p.district, p.city, p.county, p.state, p.country]
      .filter((part): part is string => Boolean(part))
      .filter((part, index, list) => list.indexOf(part) === index);
    rows.push({
      name: p.name,
      country: p.country ?? "",
      display: parts.join("，"),
      latitude: coords[1],
      longitude: coords[0],
      timezone: "",
    });
  }
  return rows;
}

export async function searchBirthPlaces(query: string, signal?: AbortSignal): Promise<CityHit[]> {
  const q = String(query ?? "").trim().slice(0, 60);
  const local = searchLocalPlaces(q);
  if (q.length < 2) return local.length ? local : FEATURED_CITIES.slice(0, 8);
  const key = normalize(q);
  const cached = cache.get(key);
  if (cached) return cached;

  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 1800);
  try {
    const alias = latinAlias(q);
    const upstream = (request: (query: string, signal: AbortSignal) => Promise<CityHit[]>, query: string) => {
      const requestController = new AbortController();
      const abortRequest = () => requestController.abort();
      controller.signal.addEventListener("abort", abortRequest, { once: true });
      const timer = setTimeout(abortRequest, 1500);
      return request(query, requestController.signal).catch(() => [] as CityHit[]).finally(() => {
        clearTimeout(timer);
        controller.signal.removeEventListener("abort", abortRequest);
      });
    };
    const [meteo, osm, aliasMeteo, aliasOsm] = await Promise.all([
      upstream(openMeteo, q),
      // Photon often recognizes local names directly; keep the original CJK query.
      upstream(photon, q),
      ...(alias ? [upstream(openMeteo, alias), upstream(photon, alias)] : [Promise.resolve([] as CityHit[]), Promise.resolve([] as CityHit[])]),
    ]);
    const remote = CJK.test(q) ? [...osm, ...aliasOsm, ...aliasMeteo, ...meteo] : [...meteo, ...osm];
    // Remote rows that merely re-state a gazetteer city (e.g. "洛阳市") add nothing.
    const extra = remote.filter((r) => !isKnownPlace(r.name, r.latitude, r.longitude));
    const merged = dedupe([...local, ...extra]).slice(0, 12);
    if (merged.length) {
      cache.set(key, merged);
      return merged;
    }
    // Nothing matched anywhere: offer the closest gazetteer names so the user can always pick one.
    return fuzzyChinaPlaces(q);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

/** Resolve an IANA timezone from coordinates. Returns null when it cannot be confirmed. */
export async function resolveCityTimezone(city: CityHit): Promise<CityHit | null> {
  if (!needsTimezone(city)) return city;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m&timezone=auto&forecast_days=1`;
    const res = await fetch(url, { signal: controller.signal, cache: "force-cache" });
    if (!res.ok) return null;
    const body = (await res.json()) as { timezone?: string };
    const timezone = typeof body.timezone === "string" ? body.timezone : "";
    if (!timezone || timezone === "GMT" || !timezone.includes("/")) return null;
    try { new Intl.DateTimeFormat("en-US", { timeZone: timezone }); } catch { return null; }
    return { ...city, timezone };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
