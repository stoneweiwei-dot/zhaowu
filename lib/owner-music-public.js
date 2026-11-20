export const REPO = "stoneweiwei-dot/zhaowu";
export const BRANCH = "owner-music";
export const MANIFEST_PATH = "public/audio/owner-manifest.json";
export const TRACK_DIR = "public/audio/tracks";
export const MAX_BYTES = 12 * 1024 * 1024;
export const SCRATCH_DIR = "public/audio/scratch";

export function emptyManifest() {
  return { version: 1, activeId: null, tracks: [] };
}

export function publicTrackUrl(filename, version) {
  const qs = version ? `?v=${encodeURIComponent(version)}` : "";
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${TRACK_DIR}/${filename}${qs}`;
}

export async function readOwnerMusicManifest() {
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${MANIFEST_PATH}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) return emptyManifest();
  const body = await res.json().catch(() => null);
  if (!body || typeof body !== "object") return emptyManifest();
  const tracks = Array.isArray(body.tracks) ? body.tracks : [];
  return {
    version: 1,
    activeId: body.activeId ? String(body.activeId) : null,
    tracks,
  };
}
