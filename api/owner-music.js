import { createHash, timingSafeEqual } from "node:crypto";
import {
  activateOwnerMusicTrack,
  deleteOwnerMusicTrack,
  deleteOwnerMusicTracks,
  renameOwnerMusicTrack,
  emptyManifest,
  MAX_BYTES,
  readOwnerMusicManifest,
  saveOwnerMusicTrack,
  saveOwnerMusicChunk,
} from "../lib/owner-music-git.js";

const OWNER_COOKIE = "__Host-zhaowu_owner_session";
const OWNER_KEY_SHA256 = "6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07";
const STATIC_FALLBACK_TRACK = {
  id: "zhaowu-static-fallback",
  name: "昭梧背景音樂",
  url: "/audio/zhaowu-background.mp3",
  contentType: "audio/mpeg",
  fileSize: 336710,
  enabled: true,
  createdAt: null,
};

const ALLOWED_TYPES = {
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/aac": ".aac",
  "audio/x-aac": ".aac",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/flac": ".flac",
  "audio/x-flac": ".flac",
};

const ALLOWED_EXT = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".wav": "audio/wav",
  ".flac": "audio/flac",
};

function hash(value) {
  return createHash("sha256").update(String(value), "utf8").digest();
}

function isValidOwnerSecret(value) {
  if (!value || value.length < 8 || value.length > 256) return false;
  const expected = Buffer.from(OWNER_KEY_SHA256, "hex");
  const actual = hash(value);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
}

function readCookie(req, name) {
  const raw = headerValue(req, "cookie");
  for (const part of raw.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (key !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1)); } catch { return ""; }
  }
  return "";
}

function ownerSecretFrom(req) {
  const secret = readCookie(req, OWNER_COOKIE);
  return isValidOwnerSecret(secret) ? secret : "";
}

function requestIsSameOrigin(req) {
  const origin = headerValue(req, "origin").trim();
  if (!origin) return true;
  const forwardedHost = (headerValue(req, "x-forwarded-host") || headerValue(req, "host")).split(",")[0].trim();
  if (!forwardedHost) return false;
  try { return new URL(origin).host === forwardedHost; } catch { return false; }
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

async function readRawBody(req) {
  if (Buffer.isBuffer(req?.body)) return req.body;
  if (req?.body instanceof ArrayBuffer) return Buffer.from(req.body);
  if (ArrayBuffer.isView(req?.body)) {
    return Buffer.from(req.body.buffer, req.body.byteOffset, req.body.byteLength);
  }
  if (typeof req?.body === "string") return Buffer.from(req.body, "utf8");
  if (typeof req?.arrayBuffer === "function") {
    const buf = await req.arrayBuffer();
    return Buffer.from(buf);
  }
  if (req && typeof req[Symbol.asyncIterator] === "function") {
    const chunks = [];
    for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return Buffer.concat(chunks);
  }
  return Buffer.alloc(0);
}

async function readJsonBody(req) {
  if (req?.body && typeof req.body === "object" && !Buffer.isBuffer(req.body) && !ArrayBuffer.isView(req.body) && !(req.body instanceof ArrayBuffer)) return req.body;
  if (typeof req?.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  if (typeof req?.json === "function") {
    try { return await req.json(); } catch {}
  }
  const raw = await readRawBody(req);
  if (!raw.length) return {};
  try { return JSON.parse(raw.toString("utf8")); } catch { return {}; }
}

async function readBinaryBody(req) {
  return readRawBody(req);
}

function filenameOf(name, contentType) {
  const raw = String(name || "background").trim() || "background";
  const base = raw.replace(/[/\\]/g, "").slice(0, 80);
  const lower = base.toLowerCase();
  const extFromName = Object.keys(ALLOWED_EXT).find((ext) => lower.endsWith(ext));
  if (extFromName) return { name: base.replace(/\.[^.]+$/, "") || "background", ext: extFromName, contentType: ALLOWED_EXT[extFromName] };
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) return null;
  return { name: base.replace(/\.[^.]+$/, "") || "background", ext, contentType: ALLOWED_EXT[ext] };
}

function sniffAudioExt(buffer) {
  if (!buffer || buffer.length < 4) return null;
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return { ext: ".mp3", contentType: "audio/mpeg" };
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return { ext: ".mp3", contentType: "audio/mpeg" };
  if (buffer.length >= 8 && buffer.slice(4, 8).toString("ascii") === "ftyp") return { ext: ".m4a", contentType: "audio/mp4" };
  return null;
}

function resolveAudioFile(name, contentType, buffer) {
  const parsed = filenameOf(name, contentType);
  if (parsed) return parsed;
  const sniffed = sniffAudioExt(buffer);
  if (!sniffed) return null;
  const raw = String(name || "background").trim() || "background";
  const base = raw.replace(/[/\\]/g, "").replace(/\.[^.]+$/, "") || "background";
  return { name: base.slice(0, 80), ext: sniffed.ext, contentType: sniffed.contentType };
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
  maxDuration: 60,
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    if (method === "GET" || method === "HEAD") {
      const wantsStream = queryValue(req, "stream") === "1";
      const manifest = await readOwnerMusicManifest().catch(() => emptyManifest());
      const gitPayload = publicPayload(manifest);
      if (gitPayload.active) {
        if (wantsStream) return redirectAudio(res, gitPayload.active.url);
        return json(res, 200, gitPayload);
      }
      if (wantsStream) return redirectAudio(res, STATIC_FALLBACK_TRACK.url);
      return json(res, 200, staticFallbackPayload());
    }
    if (!requestIsSameOrigin(req)) return json(res, 403, { ok: false, error: "ORIGIN_REJECTED" });
    const secret = ownerSecretFrom(req);
    if (!secret) return json(res, 401, { ok: false, error: "OWNER_REQUIRED" });

    if (method === "POST") {
      const declaredType = headerValue(req, "content-type").split(";")[0].trim().toLowerCase();
      const rawName = decodeURIComponent(headerValue(req, "x-zhaowu-music-name") || "background");
      const buffer = await readBinaryBody(req);
      const parsed = resolveAudioFile(rawName, declaredType, buffer);
      if (!parsed) return json(res, 415, { ok: false, error: "UNSUPPORTED_AUDIO", detail: `type=${declaredType || "empty"} name=${rawName}` });
      if (!buffer.length) return json(res, 400, { ok: false, error: "EMPTY_AUDIO" });
      const uploadId = headerValue(req, "x-zhaowu-music-upload-id").trim();
      const chunkIndex = headerValue(req, "x-zhaowu-music-chunk-index").trim();
      const chunkTotal = headerValue(req, "x-zhaowu-music-chunk-total").trim();
      if (uploadId || chunkIndex || chunkTotal) {
        const saved = await saveOwnerMusicChunk(secret, {
          name: parsed.name,
          ext: parsed.ext,
          contentType: parsed.contentType,
          buffer,
          uploadId,
          chunkIndex,
          chunkTotal,
        });
        if (saved?.pending) return json(res, 200, { ok: true, pending: true, received: saved.received, total: saved.total });
        return json(res, 200, { ...publicPayload(saved), uploaded: true });
      }
      if (buffer.length > MAX_BYTES) return json(res, 413, { ok: false, error: "AUDIO_TOO_LARGE" });
      const manifest = await saveOwnerMusicTrack(secret, {
        name: parsed.name,
        ext: parsed.ext,
        contentType: parsed.contentType,
        buffer,
      });
      return json(res, 200, { ...publicPayload(manifest), uploaded: true });
    }

    const body = await readJsonBody(req);
    const id = String(body?.id ?? "").trim();
    if (method === "PATCH") {
      if (!id) return json(res, 400, { ok: false, error: "TRACK_REQUIRED" });
      const action = String(body?.action ?? "").trim();
      if (action === "rename" || Object.prototype.hasOwnProperty.call(body || {}, "name")) {
        const name = String(body?.name ?? "").trim();
        if (!name) return json(res, 400, { ok: false, error: "TRACK_NAME_REQUIRED" });
        const manifest = await renameOwnerMusicTrack(secret, id, name);
        return json(res, 200, { ...publicPayload(manifest), renamed: true });
      }
      const manifest = await activateOwnerMusicTrack(secret, id);
      return json(res, 200, { ...publicPayload(manifest), changed: true });
    }
    if (method === "DELETE") {
      const ids = Array.isArray(body?.ids) ? body.ids.map((value) => String(value ?? "").trim()).filter(Boolean) : [];
      if (ids.length) {
        const manifest = await deleteOwnerMusicTracks(secret, ids);
        return json(res, 200, { ...publicPayload(manifest), deleted: ids.length });
      }
      if (!id) return json(res, 400, { ok: false, error: "TRACK_REQUIRED" });
      const manifest = await deleteOwnerMusicTrack(secret, id);
      return json(res, 200, { ...publicPayload(manifest), deleted: true });
    }
    return json(res, 405, { ok: false });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: "OWNER_MUSIC_FAILED",
      detail: error instanceof Error ? error.message : "unknown",
    });
  }
}
