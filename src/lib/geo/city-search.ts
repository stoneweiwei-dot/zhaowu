import { FEATURED_CITIES, filterFeatured, localizeCityHit } from "@/lib/bazi/cities";
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

/** Common CJK place names whose English form improves Open-Meteo recall. */
const CJK_ALIASES: Record<string, string> = {
  台北: "Taipei", 臺北: "Taipei", 新北: "New Taipei", 桃園: "Taoyuan", 中壢: "Zhongli",
  新竹: "Hsinchu", 苗栗: "Miaoli", 台中: "Taichung", 臺中: "Taichung", 彰化: "Changhua",
  南投: "Nantou", 雲林: "Yunlin", 嘉義: "Chiayi", 台南: "Tainan", 臺南: "Tainan",
  高雄: "Kaohsiung", 屏東: "Pingtung", 宜蘭: "Yilan", 花蓮: "Hualien", 台東: "Taitung",
  臺東: "Taitung", 澎湖: "Penghu", 基隆: "Keelung", 金門: "Kinmen", 馬祖: "Matsu",
  北京: "Beijing", 上海: "Shanghai", 廣州: "Guangzhou", 广州: "Guangzhou", 深圳: "Shenzhen",
  杭州: "Hangzhou", 南京: "Nanjing", 蘇州: "Suzhou", 苏州: "Suzhou", 成都: "Chengdu",
  重慶: "Chongqing", 重庆: "Chongqing", 武漢: "Wuhan", 武汉: "Wuhan", 西安: "Xi'an",
  天津: "Tianjin", 長沙: "Changsha", 长沙: "Changsha", 廈門: "Xiamen", 厦门: "Xiamen",
  福州: "Fuzhou", 青島: "Qingdao", 青岛: "Qingdao", 濟南: "Jinan", 郑州: "Zhengzhou",
  瀋陽: "Shenyang", 沈阳: "Shenyang", 大連: "Dalian", 大连: "Dalian", 哈爾濱: "Harbin",
  昆明: "Kunming", 貴陽: "Guiyang", 贵阳: "Guiyang", 南寧: "Nanning", 南宁: "Nanning",
  海口: "Haikou", 三亞: "Sanya", 三亚: "Sanya", 拉薩: "Lhasa", 拉萨: "Lhasa",
  香港: "Hong Kong", 九龍: "Kowloon", 澳門: "Macau", 澳门: "Macau",
  新加坡: "Singapore", 吉隆坡: "Kuala Lumpur", 檳城: "Penang", 槟城: "Penang",
  曼谷: "Bangkok", 雅加達: "Jakarta", 雅加达: "Jakarta", 馬尼拉: "Manila", 马尼拉: "Manila",
  胡志明市: "Ho Chi Minh City", 河內: "Hanoi", 河内: "Hanoi",
  雪梨: "Sydney", 悉尼: "Sydney", 墨爾本: "Melbourne", 墨尔本: "Melbourne",
  布里斯本: "Brisbane", 伯斯: "Perth", 珀斯: "Perth", 阿德雷德: "Adelaide",
  坎培拉: "Canberra", 奧克蘭: "Auckland", 奥克兰: "Auckland", 威靈頓: "Wellington",
  倫敦: "London", 伦敦: "London", 巴黎: "Paris", 紐約: "New York", 纽约: "New York",
  舊金山: "San Francisco", 旧金山: "San Francisco", 洛杉磯: "Los Angeles", 洛杉矶: "Los Angeles",
  西雅圖: "Seattle", 温哥華: "Vancouver", 溫哥華: "Vancouver", 多倫多: "Toronto",
  東京: "Tokyo", 东京: "Tokyo", 大阪: "Osaka", 京都: "Kyoto", 首爾: "Seoul", 首尔: "Seoul",
};

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

/** localizeCityHit + gazetteer places (Simplified / English display). */
export function localizePlaceHit(city: CityHit, locale: "zh-Hant" | "zh-Hans" | "en"): CityHit {
  const featured = localizeCityHit(city, locale);
  if (featured !== city) return featured;
  const display = localizeChinaPlace(city, locale);
  return display ? { ...city, display } : city;
}

async function fetchCitySource(url: string, parentSignal: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const abortFromParent = () => controller.abort();
  parentSignal.addEventListener("abort", abortFromParent, { once: true });
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
    parentSignal.removeEventListener("abort", abortFromParent);
  }
}

async function openMeteo(q: string, signal: AbortSignal): Promise<CityHit[]> {
  const language = CJK.test(q) ? "zh" : "en";
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=${language}`;
  const res = await fetchCitySource(url, signal);
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
  const res = await fetchCitySource(url, signal);
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
  // Keep the whole lookup responsive even when both public geocoders are slow.
  const timer = setTimeout(abort, 1800);
  try {
    const alias = CJK_ALIASES[q] ?? CJK_ALIASES[normalize(q)] ?? "";
    const latinQuery = alias || (CJK.test(q) ? "" : q);
    const jobs: Promise<CityHit[]>[] = [
      // Keep the original query for Photon, which often recognizes local CJK names.
      photon(q, controller.signal).catch(() => [] as CityHit[]),
    ];
    if (latinQuery) {
      jobs.push(openMeteo(latinQuery, controller.signal).catch(() => [] as CityHit[]));
      if (alias && alias !== q) jobs.push(photon(alias, controller.signal).catch(() => [] as CityHit[]));
    } else if (CJK.test(q)) {
      // Preserve the original upstream lookup as a fallback for unaliased CJK places.
      jobs.push(openMeteo(q, controller.signal).catch(() => [] as CityHit[]));
    }
    const settled = await Promise.all(jobs);
    const remote = settled.flat();
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
