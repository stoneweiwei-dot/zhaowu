import { createHash, timingSafeEqual } from "node:crypto";
import {
  activateOwnerMusicTrack,
  deleteOwnerMusicTrack,
  emptyManifest,
  MAX_BYTES,
  readOwnerMusicManifest,
  saveOwnerMusicTrack,
  saveOwnerMusicChunk,
} from "../lib/owner-music-git.js";

const OWNER_COOKIE = "__Host-zhaowu_owner_session";
const OWNER_KEY_SHA256 = "6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07";
const DEFAULT_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7prU26nA0AX7dny0PW_ReA_GKwI588H";
const SUPABASE_AUDIO_BUCKET = "zhaowu-audio";
const SUPABASE_BOOTSTRAP_TRACK = {
  id: "1cac87db-23b6-4861-8e79-59ec5bde18c8",
  name: "River In My Breathing 2",
  storagePath: "background/uploads/2026-09-09/16bf293f-bf59-4b79-b4ce-92b67f6d534d.m4a",
  contentType: "audio/mp4",
  fileSize: 3869936,
  createdAt: "2026-09-09T12:22:47.500335Z",
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

function redirectAudio(res, url) {
  let destination = "";
  try {
    const parsed = new URL(String(url || ""));
    if (parsed.protocol === "https:" || parsed.protocol === "http:") destination = parsed.toString();
  } catch {}
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

async function readJsonBody(req) {
  if (req?.body && typeof req.body === "object" && !Buffer.isBuffer(req.body) && !ArrayBuffer.isView(req.body)) return req.body;
  if (typeof req?.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  if (typeof req?.json === "function") {
    try { return await req.json(); } catch { return {}; }
  }
  return {};
}

async function readBinaryBody(req) {
  if (Buffer.isBuffer(req?.body)) return req.body;
  if (typeof req?.arrayBuffer === "function") {
    const buf = await req.arrayBuffer();
    return Buffer.from(buf);
  }
  if (req?.body && typeof req.body[Symbol.asyncIterator] === "function") {
    const chunks = [];
    for await (const chunk of req.body) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  }
  return Buffer.alloc(0);
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

function publicPayload(manifest) {
  const tracks = Array.isArray(manifest?.tracks) ? manifest.tracks : [];
  const active = tracks.find((row) => row.id === manifest?.activeId) || tracks.find((row) => row.enabled) || null;
  return {
    ok: true,
    active: active ? {
      id: active.id,
      name: active.name,
      url: active.url,
      contentType: active.contentType || "audio/mpeg",
    } : null,
    tracks: tracks.map((row) => ({
      id: row.id,
      name: row.name,
      url: row.url,
      contentType: row.contentType || "audio/mpeg",
      fileSize: row.fileSize ?? null,
      enabled: row.id === (manifest.activeId || active?.id),
      createdAt: row.createdAt || null,
    })),
  };
}

function supabaseRuntimeConfig() {
  const url = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  const key = String(process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY);
  return { url, key };
}

function storagePublicUrl(baseUrl, path) {
  const encoded = String(path || "").split("/").map(encodeURIComponent).join("/");
  return encoded ? `${baseUrl}/storage/v1/object/public/${SUPABASE_AUDIO_BUCKET}/${encoded}` : "";
}

function bootstrapSupabaseTrack() {
  return {
    id: SUPABASE_BOOTSTRAP_TRACK.id,
    name: SUPABASE_BOOTSTRAP_TRACK.name,
    url: storagePublicUrl(DEFAULT_SUPABASE_URL, SUPABASE_BOOTSTRAP_TRACK.storagePath),
    contentType: SUPABASE_BOOTSTRAP_TRACK.contentType,
    fileSize: SUPABASE_BOOTSTRAP_TRACK.fileSize,
    enabled: true,
    createdAt: SUPABASE_BOOTSTRAP_TRACK.createdAt,
  };
}

async function readSupabaseActiveTrack() {
  const { url, key } = supabaseRuntimeConfig();
  if (!url || !key) return null;
  const endpoint = new URL(`${url}/rest/v1/background_music_assets`);
  endpoint.searchParams.set("enabled", "eq.true");
  endpoint.searchParams.set("select", "id,name,storage_path,content_type,file_size,created_at,updated_at");
  endpoint.searchParams.set("order", "updated_at.desc");
  endpoint.searchParams.set("limit", "1");
  const response = await fetch(endpoint, {
    headers: { apikey: key },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const rows = await response.json().catch(() => []);
  const row = Array.isArray(rows) ? rows[0] : null;
  const publicUrl = storagePublicUrl(url, row?.storage_path);
  if (!row?.id || !publicUrl) return null;
  return {
    id: String(row.id),
    name: String(row.name || "背景音樂"),
    url: publicUrl,
    contentType: String(row.content_type || "audio/mp4"),
    fileSize: Number.isFinite(Number(row.file_size)) ? Number(row.file_size) : null,
    enabled: true,
    createdAt: row.created_at || null,
  };
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    if (method === "GET") {
      const wantsStream = queryValue(req, "stream") === "1";
      const manifest = await readOwnerMusicManifest().catch(() => emptyManifest());
      const gitPayload = publicPayload(manifest);
      if (gitPayload.active) {
        if (wantsStream) return redirectAudio(res, gitPayload.active.url);
        return json(res, 200, gitPayload);
      }
      const dynamicSupabaseTrack = await readSupabaseActiveTrack().catch(() => null);
      const supabaseTrack = dynamicSupabaseTrack || bootstrapSupabaseTrack();
      if (wantsStream) return redirectAudio(res, supabaseTrack.url);
      return json(res, 200, {
        ok: true,
        active: {
          id: supabaseTrack.id,
          name: supabaseTrack.name,
          url: supabaseTrack.url,
          contentType: supabaseTrack.contentType,
        },
        tracks: [supabaseTrack],
        source: dynamicSupabaseTrack ? "supabase-fallback" : "supabase-bootstrap",
      });
    }
    if (!requestIsSameOrigin(req)) return json(res, 403, { ok: false, error: "ORIGIN_REJECTED" });
    const secret = ownerSecretFrom(req);
    if (!secret) return json(res, 401, { ok: false, error: "OWNER_REQUIRED" });

    if (method === "POST") {
      const declaredType = headerValue(req, "content-type").split(";")[0].trim().toLowerCase();
      const rawName = decodeURIComponent(headerValue(req, "x-zhaowu-music-name") || "background");
      const parsed = filenameOf(rawName, declaredType);
      if (!parsed) return json(res, 415, { ok: false, error: "UNSUPPORTED_AUDIO" });
      const buffer = await readBinaryBody(req);
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
    if (!id) return json(res, 400, { ok: false, error: "TRACK_REQUIRED" });
    if (method === "PATCH") {
      const manifest = await activateOwnerMusicTrack(secret, id);
      return json(res, 200, { ...publicPayload(manifest), changed: true });
    }
    if (method === "DELETE") {
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
