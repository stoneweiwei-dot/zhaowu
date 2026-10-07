import { FEATURED_CITIES, filterFeatured } from "@/lib/bazi/cities";
import type { CityHit } from "@/lib/bazi/types";

/**
 * Birthplace search used by the birth-record form.
 *
 * Coverage strategy (owner 2026-10-08: small towns must be findable):
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
  const local = filterFeatured(q);
  if (q.length < 2) return local.length ? local : FEATURED_CITIES.slice(0, 8);
  const key = normalize(q);
  const cached = cache.get(key);
  if (cached) return cached;

  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 6000);
  try {
    const [meteo, osm] = await Promise.all([
      openMeteo(q, controller.signal).catch(() => [] as CityHit[]),
      // Photon fills the CJK small-place gap; for Latin queries it is a secondary source.
      photon(q, controller.signal).catch(() => [] as CityHit[]),
    ]);
    const remote = CJK.test(q) ? [...osm, ...meteo] : [...meteo, ...osm];
    const merged = dedupe([...local, ...remote]).slice(0, 12);
    if (merged.length) cache.set(key, merged);
    return merged.length ? merged : local;
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
