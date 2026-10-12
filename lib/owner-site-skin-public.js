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
]);

export function validSiteSkin(value) {
  return typeof value === "string" && SITE_SKIN_IDS.has(value) ? value : null;
}

export async function readPublishedSiteSkin(fetcher = fetch) {
  // Cache bust the GitHub raw URL, rather than asking Vercel to deploy on each change.
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${SITE_SKIN_PATH}?v=${Date.now()}`;
  const res = await fetcher(url, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
  if (res.status === 404) return { skin: "none", configured: false };
  if (!res.ok) throw new Error(`Shared site skin read failed (HTTP ${res.status})`);
  const data = await res.json();
  const skin = validSiteSkin(data?.skin);
  if (!skin) throw new Error("Invalid published site skin");
  return { skin, configured: true, updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null };
}
