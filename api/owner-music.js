import {
  emptyManifest,
  readOwnerMusicManifest,
} from "../lib/owner-music-public.js";

const STATIC_FALLBACK_TRACK = {
  id: "zhaowu-static-fallback",
  name: "昭梧背景音樂",
  url: "/audio/zhaowu-background.mp3",
  contentType: "audio/mpeg",
  fileSize: 336710,
  enabled: true,
  createdAt: null,
};

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
}

function json(res, status, body) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (res && typeof res.status === "function" && typeof res.setHeader === "function") {
    for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
    return res.status(status).json(body);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function queryValue(req, name) {
  const direct = req?.query?.[name];
  if (Array.isArray(direct)) return String(direct[0] ?? "");
  if (direct != null) return String(direct);
  try {
    const host = (headerValue(req, "x-forwarded-host") || headerValue(req, "host") || "localhost").split(",")[0].trim();
    const proto = (headerValue(req, "x-forwarded-proto") || "https").split(",")[0].trim();
    return new URL(String(req?.url || "/"), `${proto}://${host}`).searchParams.get(name) || "";
  } catch {
    return "";
  }
}

function playbackUrl(url) {
  const raw = String(url || "").trim();
  const githubRaw = raw.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/?#]+)\/(.+?)(?:[?#].*)?$/);
  if (githubRaw) {
    const [, owner, repo, ref, path] = githubRaw;
    return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${ref}/${path}`;
  }
  return raw;
}

function redirectAudio(res, url) {
  const raw = playbackUrl(url);
  let destination = "";
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    destination = raw;
  } else {
    try {
      const parsed = new URL(raw);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") destination = parsed.toString();
    } catch {}
  }
  if (!destination) return json(res, 404, { ok: false, error: "ACTIVE_AUDIO_UNAVAILABLE" });
  const headers = {
    Location: destination,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (res && typeof res.setHeader === "function") {
    for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
    if (typeof res.status === "function") {
      const response = res.status(307);
      return typeof response.end === "function" ? response.end() : response;
    }
    res.statusCode = 307;
    return typeof res.end === "function" ? res.end() : undefined;
  }
  return new Response(null, { status: 307, headers });
}

function publicPayload(manifest) {
  const tracks = Array.isArray(manifest?.tracks) ? manifest.tracks : [];
  const active = tracks.find((row) => row.id === manifest?.activeId) || tracks.find((row) => row.enabled) || null;
  return {
    ok: true,
    active: active ? {
      id: active.id,
      name: active.name,
      url: playbackUrl(active.url),
      contentType: active.contentType || "audio/mpeg",
    } : null,
    tracks: tracks.map((row) => ({
      id: row.id,
      name: row.name,
      url: playbackUrl(row.url),
      contentType: row.contentType || "audio/mpeg",
      fileSize: row.fileSize ?? null,
      enabled: row.id === (manifest.activeId || active?.id),
      createdAt: row.createdAt || null,
    })),
  };
}

function staticFallbackPayload() {
  return {
    ok: true,
    active: {
      id: STATIC_FALLBACK_TRACK.id,
      name: STATIC_FALLBACK_TRACK.name,
      url: STATIC_FALLBACK_TRACK.url,
      contentType: STATIC_FALLBACK_TRACK.contentType,
    },
    tracks: [STATIC_FALLBACK_TRACK],
    source: "static-fallback",
  };
}

export const config = {
  maxDuration: 10,
};

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    if (method !== "GET" && method !== "HEAD") return json(res, 405, { ok: false });
    const wantsStream = queryValue(req, "stream") === "1";
    const manifest = await readOwnerMusicManifest().catch(() => emptyManifest());
    const payload = publicPayload(manifest);
    if (payload.active) {
      if (wantsStream) return redirectAudio(res, payload.active.url);
      return json(res, 200, payload);
    }
    if (wantsStream) return redirectAudio(res, STATIC_FALLBACK_TRACK.url);
    return json(res, 200, staticFallbackPayload());
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: "OWNER_MUSIC_READ_FAILED",
      detail: error instanceof Error ? error.message : "unknown",
    });
  }
}
