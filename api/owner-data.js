import { createHash, timingSafeEqual } from "node:crypto";

const OWNER_COOKIE = "__Host-zhaowu_owner_session";
const OWNER_KEY_SHA256 = "6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07";
const DEFAULT_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";
const ACTIONS = new Set([
  "report.list",
  "report.get",
  "report.delete",
  "report.viewImage",
  "report.generateImage",
  "background.list",
  "background.prepareUpload",
  "background.finalizeUpload",
  "background.setEnabled",
  "background.setWallpaper",
  "background.clearWallpaper",
  "background.delete",
  "gallery.list",
  "gallery.prepareUpload",
  "gallery.finalizeUpload",
  "gallery.setEnabled",
  "gallery.setPrimary",
  "gallery.setTags",
  "gallery.setLoginCurrent",
  "gallery.delete",
  "upload.abort",
]);

function hash(value) {
  return createHash("sha256").update(String(value), "utf8").digest();
}

export function isValidOwnerSecret(value) {
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

function normalizeOrigin(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.origin;
  } catch {
    return "";
  }
}

export function allowedOwnerOrigins(env = process.env) {
  const origins = new Set();
  for (const raw of String(env.ZHAOWU_OWNER_ALLOWED_ORIGINS ?? "").split(",")) {
    const origin = normalizeOrigin(raw);
    if (origin) origins.add(origin);
  }
  for (const key of ["VERCEL_URL", "VERCEL_BRANCH_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) {
    const origin = normalizeOrigin(env[key]);
    if (origin) origins.add(origin);
  }
  return origins;
}

export function requestIsSameOrigin(req, env = process.env) {
  const origin = normalizeOrigin(headerValue(req, "origin"));
  if (!origin) return false;
  const allowed = allowedOwnerOrigins(env);
  if (!allowed.has(origin)) return false;

  const fetchSite = headerValue(req, "sec-fetch-site").trim().toLowerCase();
  if (fetchSite && fetchSite !== "same-origin") return false;
  return true;
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

async function readJsonBody(req) {
  if (req?.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req?.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  if (typeof req?.json === "function") {
    try { return await req.json(); } catch { return {}; }
  }
  return {};
}

function supabaseUrl() {
  return String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
}

function bridgeSecret() {
  return String(process.env.ZHAOWU_OWNER_BRIDGE_SECRET ?? "").trim();
}

export default async function handler(req, res) {
  try {
    if ((req.method || "GET") !== "POST") return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
    if (!requestIsSameOrigin(req)) return json(res, 403, { ok: false, error: "ORIGIN_REJECTED" });
    if (!ownerSecretFrom(req)) return json(res, 401, { ok: false, error: "OWNER_REQUIRED" });

    const serverBridgeSecret = bridgeSecret();
    if (serverBridgeSecret.length < 32) return json(res, 503, { ok: false, error: "OWNER_BRIDGE_NOT_CONFIGURED" });

    const payload = await readJsonBody(req);
    const action = String(payload?.action ?? "").trim();
    if (!ACTIONS.has(action)) return json(res, 400, { ok: false, error: "ACTION_NOT_ALLOWED" });

    const upstream = await fetch(`${supabaseUrl()}/functions/v1/zhaowu-owner-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Zhaowu-Bridge-Secret": serverBridgeSecret,
        "X-Zhaowu-Server-Bridge": "r146",
      },
      body: JSON.stringify(payload),
    });
    const text = await upstream.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { ok: false, error: "UPSTREAM_INVALID_RESPONSE" }; }
    return json(res, upstream.status, body ?? { ok: upstream.ok });
  } catch (error) {
    return json(res, 502, {
      ok: false,
      error: "SUPABASE_UNAVAILABLE",
      detail: error instanceof Error ? error.message : "unknown",
    });
  }
}
