import { createHash, timingSafeEqual } from "node:crypto";
import { publishSocialPost, socialConfiguration, SocialPublishError } from "../lib/meta-social-publisher.js";

const OWNER_COOKIE = "__Host-zhaowu_owner_session";
const OWNER_KEY_SHA256 = "6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07";

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

function requestHasOwnerSession(req) {
  return isValidOwnerSecret(readCookie(req, OWNER_COOKIE));
}

function requestIsSameOrigin(req) {
  const origin = headerValue(req, "origin").trim();
  const forwardedHost = headerValue(req, "x-forwarded-host").split(",")[0].trim();
  const host = forwardedHost || headerValue(req, "host").trim();
  if (!origin || !host) return false;
  try {
    if (new URL(origin).host !== host) return false;
  } catch { return false; }
  const fetchSite = headerValue(req, "sec-fetch-site").trim().toLowerCase();
  return !fetchSite || fetchSite === "same-origin";
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

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    if (method === "GET") return json(res, 200, { authenticated: requestHasOwnerSession(req) });
    if (method !== "POST") return json(res, 405, { authenticated: false });
    if (!requestIsSameOrigin(req)) return json(res, 403, { ok: false, error: "ORIGIN_REJECTED" });
    if (!requestHasOwnerSession(req)) return json(res, 401, { ok: false, error: "OWNER_REQUIRED" });

    const payload = await readJsonBody(req);
    if (payload?.action === "social.status") {
      return json(res, 200, { ok: true, channels: socialConfiguration() });
    }
    if (payload?.action !== "social.publish") {
      return json(res, 400, { ok: false, error: "ACTION_NOT_ALLOWED" });
    }
    const results = await publishSocialPost(payload);
    const successCount = Object.values(results).filter((result) => result?.ok).length;
    return json(res, successCount ? 200 : 502, { ok: successCount > 0, results });
  } catch (error) {
    if (error instanceof SocialPublishError) {
      return json(res, error.status, { ok: false, error: error.code, message: error.message });
    }
    return json(res, 500, { authenticated: false, error: "OWNER_SESSION_FAILED", detail: error instanceof Error ? error.message : "unknown" });
  }
}
