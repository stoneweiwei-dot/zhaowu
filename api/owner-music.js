import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
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

// Safari asks for byte ranges. Some GitHub raw endpoints ignore Range and return
// 200 with the whole file; synthesize a correct 206 response without buffering it.
function audioByteRange(value, size) {
  if (!value || !Number.isSafeInteger(size) || size <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return null;
  let start;
  let end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return { invalid: true };
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
  }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) {
    return { invalid: true };
  }
  return { start, end: Math.min(end, size - 1) };
}

async function* audioSlice(chunks, start, end) {
  let offset = 0;
  for await (const chunk of chunks) {
    const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    const next = offset + data.length;
    if (next > start && offset <= end) {
      yield data.subarray(Math.max(0, start - offset), Math.min(data.length, end + 1 - offset));
    }
    offset = next;
    if (offset > end) break;
  }
}

function rangeNotSatisfiable(res, size) {
  const headers = { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes", "Cache-Control": "no-store" };
  if (res && typeof res.setHeader === "function") {
    for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
    res.statusCode = 416;
    return res.end();
  }
  return new Response(null, { status: 416, headers });
}

async function streamTrack(req, res, row) {
  const candidates = upstreamCandidates(row);
  const range = headerValue(req, "range").trim();
  const method = (req?.method || "GET").toUpperCase();
  const knownSize = Number(row?.fileSize);
  const initialRange = audioByteRange(range, knownSize);
  if (initialRange?.invalid) return rangeNotSatisfiable(res, knownSize);

  for (const target of candidates) {
    try {
      const upstream = await fetch(target, {
        method,
        headers: range ? { Range: range } : undefined,
      });
      if (!upstream.ok) continue;
      if (method !== "HEAD" && !upstream.body) continue;
      if ((upstream.headers.get("content-type") || "").includes("text/html")) continue;

      const lengthHeader = upstream.headers.get("content-length");
      const upstreamLength = lengthHeader !== null && /^\d+$/.test(lengthHeader) ? Number(lengthHeader) : null;
      const total = Number.isSafeInteger(upstreamLength) && upstreamLength > 0 ? upstreamLength : knownSize;
      // Only slice the body if the upstream ignored the requested byte range.
      const manualRange = upstream.status === 200 ? audioByteRange(range, total) : null;
      if (manualRange?.invalid) return rangeNotSatisfiable(res, total);
      const upstreamRange = upstream.headers.get("content-range");
      if (upstream.status === 206 && !upstreamRange) continue;
      const status = upstream.status === 206 || (manualRange && !manualRange.invalid) ? 206 : 200;
      const headers = {
        "Content-Type": row?.contentType || upstream.headers.get("content-type") || "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      };
      if (Number.isSafeInteger(total) && total > 0) headers["Accept-Ranges"] = "bytes";
      if (status === 206 && manualRange && !manualRange.invalid) {
        headers["Content-Range"] = `bytes ${manualRange.start}-${manualRange.end}/${total}`;
        headers["Content-Length"] = String(manualRange.end - manualRange.start + 1);
      } else {
        if (status === 206 && upstreamRange) headers["Content-Range"] = upstreamRange;
        if (Number.isSafeInteger(upstreamLength) && upstreamLength >= 0) headers["Content-Length"] = String(upstreamLength);
      }

      if (method === "HEAD") {
        if (res && typeof res.setHeader === "function") {
          for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
          res.statusCode = status;
          return res.end();
        }
        return new Response(null, { status, headers });
      }

      const input = Readable.fromWeb(upstream.body);
      const output = manualRange && !manualRange.invalid
        ? Readable.from(audioSlice(input, manualRange.start, manualRange.end))
        : input;
      if (res && typeof res.setHeader === "function") {
        for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
        res.statusCode = status;
        await pipeline(output, res); // Backpressure + early client disconnect, no full-file Buffer.
        return;
      }
      return new Response(Readable.toWeb(output), { status, headers });
    } catch (error) {
      // A stream cannot be restarted with another audio file after headers are sent.
      if (res?.headersSent) {
        if (!res.destroyed && typeof res.destroy === "function") res.destroy(error);
        return;
      }
      // Before sending headers, a second trusted upstream can be tried.
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
  maxDuration: 30,
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
