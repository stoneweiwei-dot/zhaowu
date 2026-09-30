import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

// Homepage IntroGate can be swapped by the owner from the /gallery "開場影片"
// admin panel (src/components/owner-login-visuals-manager.tsx). That panel
// writes to Supabase `gallery_assets` (category="loading", tag
// "login-background", is_primary flag) via the existing owner-cookie bridge.
// This is a PUBLIC, anonymous read — every first-time visitor's browser calls
// it, so it must fail fast and open: any error, timeout or empty result falls
// back to the built-in default video with zero visible delay beyond the
// bounded timeout below.

// 450 ms was too tight on mobile data: the request timed out and the built-in clip played instead of the
// owner's upload. The poster covers the screen meanwhile, so a longer bounded wait costs nothing visible.
const FETCH_TIMEOUT_MS = 1800;
const GALLERY_BUCKET_FALLBACK = "zhaowu-gallery";

export type IntroVisualOverride = { videoUrl: string };

function galleryPublicUrl(path: string, bucketId: string) {
  if (!path) return "";
  if (path.startsWith("https://") || (path.startsWith("/") && !path.startsWith("//"))) return path;
  const safePath = path.split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(bucketId || GALLERY_BUCKET_FALLBACK)}/${safePath}`;
}

type GalleryRow = {
  storage_path?: string;
  bucket_id?: string;
  content_type?: string | null;
  tags?: string[];
};

function isEligibleRow(row: GalleryRow) {
  return Boolean(row.storage_path)
    && (row.tags ?? []).includes("login-background")
    && (row.content_type ?? "").startsWith("video/");
}

function rowVideoUrl(row: GalleryRow) {
  if (!isEligibleRow(row)) return null;
  const videoUrl = galleryPublicUrl(row.storage_path as string, row.bucket_id || GALLERY_BUCKET_FALLBACK);
  return videoUrl || null;
}

type IntroVisualTheme = "day" | "night" | "common";

function themeFromTags(tags: string[] | undefined): IntroVisualTheme {
  const set = new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()));
  if (set.has("login-night") || set.has("night")) return "night";
  if (set.has("login-day") || set.has("day")) return "day";
  return "common";
}

/**
 * Best-effort lookup of the owner's homepage opening video. An explicit pin
 * ("set as current" in the admin panel) always wins, exactly as before. With
 * no pin, this rotates randomly across the owner's enabled uploads that
 * match the visitor's day/night theme (falling back to the whole enabled
 * pool when nothing matches), so the admin panel's day/night/common grouping
 * actually reaches the homepage instead of only ever showing one fixed clip.
 * Both reads share one timeout budget and run in parallel. Returns null (use
 * the built-in default) on any failure, timeout, or empty pool.
 */
export async function fetchIntroVisualOverride(theme?: "day" | "night"): Promise<IntroVisualOverride | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return null;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const authHeaders = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
  try {
    const [pinnedRes, poolRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/gallery_assets?category=eq.loading&enabled=eq.true&is_primary=eq.true&select=storage_path,bucket_id,content_type,tags&limit=1`,
        { headers: authHeaders, signal: controller.signal },
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/gallery_assets?category=eq.loading&enabled=eq.true&select=storage_path,bucket_id,content_type,tags&limit=30`,
        { headers: authHeaders, signal: controller.signal },
      ),
    ]);

    if (pinnedRes.ok) {
      const pinnedRows = (await pinnedRes.json()) as GalleryRow[];
      const pinnedUrl = pinnedRows[0] ? rowVideoUrl(pinnedRows[0]) : null;
      if (pinnedUrl) return { videoUrl: pinnedUrl };
    }

    if (!poolRes.ok) return null;
    const rows = (await poolRes.json()) as GalleryRow[];
    const eligible = rows.filter(isEligibleRow);
    const themed = theme ? eligible.filter((row) => {
      const rowTheme = themeFromTags(row.tags);
      return rowTheme === theme || rowTheme === "common";
    }) : eligible;
    const pool = themed.length ? themed : eligible;
    if (!pool.length) return null;
    const videoUrl = rowVideoUrl(pool[Math.floor(Math.random() * pool.length)]);
    return videoUrl ? { videoUrl } : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}
