import { ownerSecretFromRequest } from "../lib/owner-session-cookie.js";
import { saveSharedSiteSkin } from "../lib/owner-music-git.js";
import { readPublishedSiteSkin, validSiteSkin } from "../lib/owner-site-skin-public.js";

function header(req, key) {
  const raw = typeof req.headers?.get === "function" ? req.headers.get(key) : req.headers?.[key] ?? req.headers?.[key.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
}

/** Reject cross-origin writes even if a cookie is sent; never allow guest writes. */
export function sameOriginWrite(req) {
  const origin = header(req, "origin").trim();
  const hostname = (header(req, "x-forwarded-host") || header(req, "host")).split(",")[0].trim();
  const fetchSite = header(req, "sec-fetch-site").toLowerCase().trim();
  if (!origin || !hostname || (fetchSite && fetchSite !== "same-origin")) return false;
  try { return new URL(origin).host === hostname; } catch { return false; }
}

function respond(res, status, body) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  };
  if (res && typeof res.status === "function" && typeof res.setHeader === "function") {
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(status).json(body);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function bodyOf(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  if (typeof req.json === "function") {
    try { return await req.json(); } catch { return {}; }
  }
  return {};
}

export default async function handler(req, res) {
  const method = req.method || "GET";
  if (method === "GET") {
    try {
      const value = await readPublishedSiteSkin();
      return respond(res, 200, { ok: true, ...value });
    } catch {
      return respond(res, 503, { ok: false, error: "SHARED_SKIN_TEMPORARILY_UNAVAILABLE" });
    }
  }
  if (method !== "POST") return respond(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  if (!sameOriginWrite(req)) return respond(res, 403, { ok: false, error: "ORIGIN_REJECTED" });
  const secret = ownerSecretFromRequest(req);
  if (!secret) return respond(res, 401, { ok: false, error: "OWNER_REQUIRED" });
  const payload = await bodyOf(req);
  const skin = validSiteSkin(payload?.skin);
  if (!skin) return respond(res, 400, { ok: false, error: "UNKNOWN_SITE_SKIN" });
  try {
    const published = await saveSharedSiteSkin(secret, skin);
    return respond(res, 200, { ok: true, ...published });
  } catch {
    return respond(res, 503, { ok: false, error: "SHARED_SKIN_WRITE_FAILED" });
  }
}
