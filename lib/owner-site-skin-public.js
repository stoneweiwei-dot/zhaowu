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
  "song-gallery-frostleaf", "solar-frost-descent", "solar-auto",
]);

export function validSiteSkin(value) {
  return typeof value === "string" && SITE_SKIN_IDS.has(value) ? value : null;
}

export async function readPublishedSiteSkin(fetcher = fetch) {
  // Cache bust the GitHub raw URL, rather than asking Vercel to deploy on each change.
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${SITE_SKIN_PATH}?v=${Date.now()}`;
  const res = await fetcher(url, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
  if (res.status === 404) return { skin: "pastel-koi", configured: false };
  if (!res.ok) throw new Error(`Shared site skin read failed (HTTP ${res.status})`);
  const data = await res.json();
  const skin = validSiteSkin(data?.skin);
  if (!skin) throw new Error("Invalid published site skin");
  return { skin, configured: true, updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null };
}

/** Shared skin publication reads a public Supabase setting; the prior GitHub JSON remains a read-only fallback. */
const PUBLIC_SITE_SKIN_KEY = "published_site_skin_v1";
const SITE_SETTINGS_READ_URL = "https://plgpxusmemnmzckbwtiv.supabase.co/rest/v1/site_settings?key=eq." + PUBLIC_SITE_SKIN_KEY + "&select=value,updated_at&limit=1";
const SITE_SETTINGS_ANON_KEY = "sb_publishable_7prU26nA0AX7dny0PW_ReA_GKwI588H"; // Browser-publishable key, not a service-role credential.

export async function readPublishedSiteSkinFromSettings(fetcher = fetch) {
  const res = await fetcher(SITE_SETTINGS_READ_URL, {
    cache: "no-store",
    headers: { apikey: SITE_SETTINGS_ANON_KEY, "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error(`Site skin settings unavailable (HTTP ${res.status})`);
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows.length) return null; // First activation: use existing GitHub publication.
  const record = rows[0]?.value;
  const skin = validSiteSkin(record?.skin);
  if (!skin) throw new Error("Invalid published site skin in settings");
  return { skin, configured: true, updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : rows[0]?.updated_at ?? null };
}
