import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

// Homepage IntroGate can be swapped by the owner from the /gallery "開場影片"
// admin panel (src/components/owner-login-visuals-manager.tsx). That panel
// writes to Supabase `gallery_assets` (category="loading", tag
// "login-background", is_primary flag) via the existing owner-cookie bridge.
// This is a PUBLIC, anonymous read — every first-time visitor's browser calls
// it, so it must fail fast and open: any error, timeout or empty result falls
// back to the built-in default video with zero visible delay beyond the
// bounded timeout below.

const FETCH_TIMEOUT_MS = 450;
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

/**
 * Best-effort lookup of the owner's currently-selected homepage opening
 * video. Returns null (use the built-in default) on any failure, timeout, or
 * when the owner has not set a custom one.
 */
export async function fetchIntroVisualOverride(): Promise<IntroVisualOverride | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return null;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/gallery_assets?category=eq.loading&enabled=eq.true&is_primary=eq.true&select=storage_path,bucket_id,content_type,tags&limit=1`,
      {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        signal: controller.signal,
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as GalleryRow[];
    const row = rows[0];
    if (!row || !row.storage_path) return null;
    if (!(row.tags ?? []).includes("login-background")) return null;
    if (!(row.content_type ?? "").startsWith("video/")) return null;
    const videoUrl = galleryPublicUrl(row.storage_path, row.bucket_id || GALLERY_BUCKET_FALLBACK);
    return videoUrl ? { videoUrl } : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}
