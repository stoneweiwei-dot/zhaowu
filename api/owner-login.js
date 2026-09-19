import { createHash, timingSafeEqual } from "node:crypto";

const OWNER_COOKIE = "__Host-zhaowu_owner_session";
const OWNER_KEY_SHA256 = "6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

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

function requestIsSameOrigin(req) {
  const origin = headerValue(req, "origin").trim();
  if (!origin) return true;
  const forwardedHost = (headerValue(req, "x-forwarded-host") || headerValue(req, "host")).split(",")[0].trim();
  if (!forwardedHost) return false;
  try { return new URL(origin).host === forwardedHost; } catch { return false; }
}

function json(res, status, body, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  };
  if (res && typeof res.status === "function" && typeof res.setHeader === "function") {
    for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
    return res.status(status).json(body);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function readJsonBody(req) {
  // Netlify passes a standards-based Request whose body is a ReadableStream.
  // A stream is also an object, so treating every object body as parsed JSON
  // silently turned the owner secret into an empty value on Production.
  if (typeof req?.json === "function") {
    try { return await req.json(); } catch { return {}; }
  }
  if (
    req?.body
    && typeof req.body === "object"
    && !Buffer.isBuffer(req.body)
    && Object.getPrototypeOf(req.body) === Object.prototype
  ) return req.body;
  if (typeof req?.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

export default async function handler(req, res) {
  try {
    if ((req.method || "GET") !== "POST") return json(res, 405, { ok: false });
    if (!requestIsSameOrigin(req)) return json(res, 403, { ok: false, error: "ORIGIN_REJECTED" });
    const body = await readJsonBody(req);
    const secret = String(body?.secret ?? req.body?.secret ?? "");
    if (!isValidOwnerSecret(secret)) return json(res, 401, { ok: false, error: "INVALID_OWNER_CREDENTIAL" });
    const cookie = `${OWNER_COOKIE}=${encodeURIComponent(secret)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE_SECONDS}`;
    return json(res, 200, { ok: true }, { "Set-Cookie": cookie });
  } catch (error) {
    return json(res, 500, { ok: false, error: "OWNER_LOGIN_FAILED", detail: error instanceof Error ? error.message : "unknown" });
  }
}
