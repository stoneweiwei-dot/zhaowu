import { createHash, timingSafeEqual } from "node:crypto";
import { isValidOwnerSecret, ownerSetCookie } from "../lib/owner-session-cookie.js";
import { isPublicTestCredential } from "../lib/owner-test-account.js";

function isValidOwnerAccount(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized || normalized.length > 256) return false;
  const hash = String(process.env.ZHAOWU_OWNER_ACCOUNT_SHA256 ?? "").trim();
  if (!/^[a-f0-9]{64}$/i.test(hash)) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = createHash("sha256").update(normalized, "utf8").digest();
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
    const account = body?.email ?? req.body?.email ?? "";
    // Public demo credential: confirms the sign-in flow works but issues no cookie and grants no access.
    if (isPublicTestCredential(account, secret)) return json(res, 200, { ok: true, mode: "tester" });
    if (!isValidOwnerAccount(account) || !isValidOwnerSecret(secret)) return json(res, 401, { ok: false, error: "INVALID_OWNER_CREDENTIAL" });
    const cookie = ownerSetCookie(secret);
    return json(res, 200, { ok: true }, { "Set-Cookie": cookie });
  } catch (error) {
    return json(res, 503, { ok: false, error: "OWNER_LOGIN_UNAVAILABLE" });
  }
}
