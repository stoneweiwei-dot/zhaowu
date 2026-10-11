import { publishSocialPost, socialConfiguration, SocialPublishError } from "../lib/meta-social-publisher.js";
import { requestHasOwnerSession } from "../lib/owner-session-cookie.js";

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
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
