import {
  emptyManifest,
  readOwnerMusicManifest,
  REPO,
  TRACK_DIR,
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

// Mainland China cannot reliably reach raw.githubusercontent.com or cdn.jsdelivr.net.
// Point every track on our owner-music repository to same-origin /api/owner-music?track=<id>,
// which proxies and edge-caches the audio bytes through our own origin.
function playbackUrl(rowOrUrl) {
  if (rowOrUrl && typeof rowOrUrl === "object") {
    const id = String(rowOrUrl.id || "").trim();
    const raw = String(rowOrUrl.url || "").trim();
    if (id && /^https:\/\/(?:raw\.githubusercontent\.com|cdn\.jsdelivr\.net\/gh)\//.test(raw)) {
      return `/api/owner-music?track=${encodeURIComponent(id)}`;
    }
    return playbackUrl(raw);
  }
  const raw = String(rowOrUrl || "").trim();
  const trackMatch = raw.match(/^https:\/\/(?:raw\.githubusercontent\.com|cdn\.jsdelivr\.net\/gh)\/[^/]+\/[^/@]+(?:\/|@)[^/?#]+\/public\/audio\/tracks\/([a-zA-Z0-9_-]+)\.[a-z0-9]+(?:[?#].*)?$/);
  if (trackMatch) {
    return `/api/owner-music?track=${encodeURIComponent(trackMatch[1])}`;
  }
  return raw;
}

function upstreamCandidates(row) {
  const urls = [];
  const raw = String(row?.url || "").trim();
  const filename = String(row?.filename || "").trim() || (raw.match(/\/([a-zA-Z0-9_-]+\.[a-z0-9]+)(?:[?#].*)?$/)?.[1] ?? "");
  if (raw.startsWith("https://raw.githubusercontent.com/")) {
    urls.push(raw);
    const m = raw.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/?#]+)\/(.+?)(?:[?#].*)?$/);
    if (m) urls.push(`https://cdn.jsdelivr.net/gh/${m[1]}/${m[2]}@${m[3]}/${m[4]}`);
  } else if (raw.startsWith("https://")) {
    urls.push(raw);
  }
  if (filename) {
    const branchRaw = `https://raw.githubusercontent.com/${REPO}/owner-music/${TRACK_DIR}/${filename}`;
    if (!urls.includes(branchRaw)) urls.push(branchRaw);
  }
  return urls;
}

async function streamTrack(req, res, row) {
  const candidates = upstreamCandidates(row);
  const range = headerValue(req, "range").trim();
  for (const target of candidates) {
    try {
      const upstream = await fetch(target, {
        headers: range ? { Range: range } : undefined,
      });
      if (!upstream.ok && upstream.status !== 206) continue;
      const body = Buffer.from(await upstream.arrayBuffer());
      const contentType = row?.contentType || upstream.headers.get("content-type") || "audio/mpeg";
      const status = upstream.status === 206 ? 206 : 200;
      const headers = {
        "Content-Type": contentType,
        "Content-Length": String(body.length),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      };
      const contentRange = upstream.headers.get("content-range");
      if (contentRange) headers["Content-Range"] = contentRange;
      if (res && typeof res.setHeader === "function") {
        for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
        if (typeof res.status === "function") {
          const response = res.status(status);
          return typeof response.send === "function" ? response.send(body) : response.end(body);
        }
        res.statusCode = status;
        return typeof res.end === "function" ? res.end(body) : undefined;
      }
      return new Response(body, { status, headers });
    } catch {
      // Try next candidate
    }
  }
  return redirectAudio(res, STATIC_FALLBACK_TRACK.url);
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
      url: playbackUrl(active),
      contentType: active.contentType || "audio/mpeg",
    } : null,
    tracks: tracks.map((row) => ({
      id: row.id,
      name: row.name,
      url: playbackUrl(row),
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
    const requestedTrackId = queryValue(req, "track").trim();
    const wantsStream = queryValue(req, "stream") === "1";
    const manifest = await readOwnerMusicManifest().catch(() => emptyManifest());
    const rawTracks = Array.isArray(manifest?.tracks) ? manifest.tracks : [];
    if (requestedTrackId) {
      const found = rawTracks.find((row) => row.id === requestedTrackId);
      if (found) return streamTrack(req, res, found);
      return redirectAudio(res, STATIC_FALLBACK_TRACK.url);
    }
    const payload = publicPayload(manifest);
    if (payload.active) {
      if (wantsStream) {
        const activeRaw = rawTracks.find((row) => row.id === payload.active.id);
        if (activeRaw) return streamTrack(req, res, activeRaw);
        return redirectAudio(res, payload.active.url);
      }
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
