import { createHash, timingSafeEqual } from "node:crypto";
import { publishSocialPost, socialConfiguration, SocialPublishError } from "../lib/meta-social-publisher.js";

const OWNER_COOKIE = "__Host-zhaowu_owner_session";
const OWNER_KEY_SHA256 = "6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07";

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
}

function readCookie(req, name) {
  for (const part of headerValue(req, "cookie").split(";")) {
    const index = part.indexOf("=");
    if (index < 0 || part.slice(0, index).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1)); } catch { return ""; }
  }
  return "";
}

function hasOwnerSession(req) {
  const value = readCookie(req, OWNER_COOKIE);
  if (!value || value.length < 8 || value.length > 256) return false;
  const expected = Buffer.from(OWNER_KEY_SHA256, "hex");
  const actual = createHash("sha256").update(value, "utf8").digest();
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function normalizeOrigin(value) {
  try {
    const url = new URL(String(value ?? ""));
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : "";
  } catch { return ""; }
}

function requestIsSameOrigin(req) {
  const origin = normalizeOrigin(headerValue(req, "origin"));
  if (!origin) return false;
  const forwardedHost = headerValue(req, "x-forwarded-host").split(",")[0].trim();
  const host = forwardedHost || headerValue(req, "host").trim();
  if (!host || new URL(origin).host !== host) return false;
  const fetchSite = headerValue(req, "sec-fetch-site").trim().toLowerCase();
  return !fetchSite || fetchSite === "same-origin";
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

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    if (method !== "GET" && method !== "POST") return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
    if (!hasOwnerSession(req)) return json(res, 401, { ok: false, error: "OWNER_REQUIRED" });

    if (method === "GET") {
      return json(res, 200, { ok: true, channels: socialConfiguration() });
    }
    if (!requestIsSameOrigin(req)) return json(res, 403, { ok: false, error: "ORIGIN_REJECTED" });

    const results = await publishSocialPost(await readJsonBody(req));
    const successCount = Object.values(results).filter((result) => result?.ok).length;
    return json(res, successCount ? 200 : 502, { ok: successCount > 0, results });
  } catch (error) {
    if (error instanceof SocialPublishError) {
      return json(res, error.status, { ok: false, error: error.code, message: error.message });
    }
    return json(res, 500, { ok: false, error: "SOCIAL_PUBLISH_FAILED", message: "發布暫時不可用。" });
  }
}
