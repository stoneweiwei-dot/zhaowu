import { ownerSupabaseUrl } from "./owner-supabase-origin.js";
import { BRANCH, REPO } from "./owner-music-public.js";

// This is runtime configuration on the EXISTING owner-music data branch.
// Changing it never commits to main and never triggers a Vercel build.
export const SITE_SKIN_PATH = "public/site/active-skin.json";
export const SITE_SKIN_IDS = new Set([
  "none",
  "lotus-boat", "cloud-jade", "golden-phoenix", "ink-dragon",
  "dragon-lotus", "night-flute", "day-flute", "night-palace",
  "pine-ink", "pastel-koi", "song-clear-dragon", "song-rain-bank",
  "song-lotus-still", "song-osmanthus",
  "verdant-dragon", "verdant-mist", "verdant-pavilion", "verdant-rain",
  "dawn-dragon", "moon-lotus-boat", "bamboo-falls",
  "petal-immortal", "pink-lotus-stream", "butterfly-lotus",
  "song-gallery-frostleaf", "solar-frost-descent", "solar-auto", "sydney-jacaranda", "southern-summer", "southern-autumn", "southern-winter", "solar-start-winter", "solar-minor-snow", "solar-major-snow", "solar-winter-solstice", "solar-minor-cold", "solar-major-cold", "solar-start-spring", "solar-rain-water", "solar-awakening", "solar-spring-equinox", "solar-pure-brightness", "solar-grain-rain", "solar-start-summer", "solar-grain-buds", "solar-grain-in-ear", "solar-summer-solstice", "solar-minor-heat", "solar-major-heat", "solar-start-autumn", "solar-end-heat", "solar-white-dew", "solar-autumn-equinox", "solar-cold-dew",
]);

export function validSiteSkin(value) {
  return typeof value === "string" && SITE_SKIN_IDS.has(value) ? value : null;
}

export function validVisitorSkins(ids) {
  return Array.isArray(ids) && ids.length <= SITE_SKIN_IDS.size
    && ids.every(id => validSiteSkin(id)) && new Set(ids).size === ids.length;
}

export async function readPublishedSiteSkin(fetcher = fetch) {
  // Cache bust the GitHub raw URL, rather than asking Vercel to deploy on each change.
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${SITE_SKIN_PATH}?v=${Date.now()}`;
  const res = await fetcher(url, { cache: "no-store", signal: AbortSignal.timeout(5000), headers: { "Cache-Control": "no-cache" } });
  if (res.status === 404) return { skin: "pastel-koi", configured: false };
  if (!res.ok) throw new Error(`Shared site skin read failed (HTTP ${res.status})`);
  const data = await res.json();
  const skin = validSiteSkin(data?.skin);
  if (!skin) throw new Error("Invalid published site skin");
  return { skin, configured: true, updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null };
}

/** Shared skin publication reads a public Supabase setting; the prior GitHub JSON remains a read-only fallback. */
const PUBLIC_SITE_SKIN_KEY = "published_site_skin_v1";
export async function readPublishedSiteSkinFromSettings(fetcher = fetch, env = process.env) {
  // Only this public row may be read, including when using the server credential.
  const url = ownerSupabaseUrl(env) + "/rest/v1/site_settings?key=eq." + PUBLIC_SITE_SKIN_KEY + "&public_read=eq.true&select=value,updated_at&limit=1";
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Site skin settings reader is not configured");
  const res = await fetcher(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
    headers: { apikey: key, "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error(`Site skin settings unavailable (HTTP ${res.status})`);
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error("Invalid site skin settings response");
  if (!rows.length) return null; // First activation: use existing GitHub publication.
  const record = rows[0]?.value;
  const skin = validSiteSkin(record?.skin);
  if (!skin) throw new Error("Invalid published site skin in settings");
  return { skin, configured: true, ...(validVisitorSkins(record.allowedSkins) ? { allowedSkins: record.allowedSkins } : {}), updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : rows[0]?.updated_at ?? null };
}
