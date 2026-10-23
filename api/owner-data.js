import { authenticateOwner, ownerAuthHeaders } from "../lib/owner-auth.js";
import { ownerSupabaseUrl } from "../lib/owner-supabase-origin.js";
import { isValidOwnerSecret } from "../lib/owner-session-cookie.js";
import { readPublishedSiteSkin, readPublishedSiteSkinFromSettings, validSiteSkin } from "../lib/owner-site-skin-public.js";

export { isValidOwnerSecret };


const ACTIONS = new Set([
  "report.list",
  "report.save",
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
  "site-skin.publish",
  // Owner promo-code console. Same owner gate as everything above, but forwarded to its own isolated
  // Edge Function (see PROMO_FUNCTION) so the report/gallery function is never touched.
  "promo.list",
  "promo.create",
  "promo.update",
  "promo.setActive",
  "article.list",
  "article.save",
  "article.archive",
  "article.reset",
]);

const PROMO_FUNCTION = "zhaowu-owner-promo";
const ARTICLE_FUNCTION = "zhaowu-owner-articles";
export function ownerUpstreamFunction(action) {
  if (String(action).startsWith("promo.")) return PROMO_FUNCTION;
  if (String(action).startsWith("article.")) return ARTICLE_FUNCTION;
  return "zhaowu-owner-data";
}

function headerValue(req, name) {
  const headers = req?.headers;
  if (!headers) return "";
  if (typeof headers.get === "function") return String(headers.get(name) ?? "");
  const raw = headers[name] ?? headers[name.toLowerCase()];
  return String(Array.isArray(raw) ? raw[0] : raw ?? "");
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
  for (const key of [
    "URL",
    "DEPLOY_PRIME_URL",
    "DEPLOY_URL",
    "VERCEL_URL",
    "VERCEL_BRANCH_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
  ]) {
    const origin = normalizeOrigin(env[key]);
    if (origin) origins.add(origin);
  }
  return origins;
}

export function requestIsSameOrigin(req, env = process.env) {
  const origin = normalizeOrigin(headerValue(req, "origin"));
  if (!origin) return false;
  const allowed = allowedOwnerOrigins(env);
  const forwardedHost = headerValue(req, "x-forwarded-host").split(",")[0].trim();
  const requestHost = forwardedHost || headerValue(req, "host").trim();
  let matchesRequestHost = false;
  try { matchesRequestHost = Boolean(requestHost) && new URL(origin).host === requestHost; } catch { matchesRequestHost = false; }
  if (!matchesRequestHost && !allowed.has(origin)) return false;

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
  if (typeof req?.json === "function") {
    try { return await req.json(); } catch { return {}; }
  }
  if (req?.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req?.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

function supabaseUrl() {
  return ownerSupabaseUrl(process.env);
}

function bridgeSecret() {
  return String(process.env.ZHAOWU_OWNER_BRIDGE_SECRET ?? "").trim();
}

const OWNER_UPSTREAM_TIMEOUT_MS = 12_000;

function postOwnerUpstream(action, payload, owner, serverBridgeSecret, fetchImpl = fetch) {
  return fetchImpl(`${supabaseUrl()}/functions/v1/${ownerUpstreamFunction(action)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(serverBridgeSecret ? { "X-Zhaowu-Bridge-Secret": serverBridgeSecret } : {}),
      ...ownerAuthHeaders(owner),
      "X-Zhaowu-Server-Bridge": "r162",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(OWNER_UPSTREAM_TIMEOUT_MS),
  });
}

function retryableSiteSkinStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

/**
 * Owner-cookie-only fallback for a backend 404 on site-skin.publish.
 * Uses the existing Supabase service role server-side; no browser secrets,
 * public write grants, schema changes, or extra Vercel functions.
 */
export async function publishSiteSkinFallback(skin, env = process.env, fetchImpl = fetch) {
  if (!validSiteSkin(skin)) return { status: 400, body: { ok: false, error: "UNKNOWN_SITE_SKIN" } };
  const key = String(env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!key) return { status: 503, body: { ok: false, error: "SITE_SKIN_SERVICE_NOT_CONFIGURED" } };
  const updatedAt = new Date().toISOString();
  const url = ownerSupabaseUrl(env) +
    "/rest/v1/site_settings?on_conflict=key&select=value,updated_at";
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: "Bearer " + key,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        key: "published_site_skin_v1",
        value: { skin, updatedAt },
        public_read: true,
        updated_at: updatedAt,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return { status: 503, body: { ok: false, error: "SHARED_SKIN_WRITE_FAILED" } };
    const rows = await response.json();
    if (!Array.isArray(rows) || rows[0]?.value?.skin !== skin)
      return { status: 503, body: { ok: false, error: "SHARED_SKIN_VERIFY_FAILED" } };
    return { status: 200, body: { ok: true, skin, updatedAt } };
  } catch {
    return { status: 503, body: { ok: false, error: "SHARED_SKIN_FALLBACK_UNAVAILABLE" } };
  }
}

export async function handleOwnerData(req, res, parsedPayload) {
  try {
    const method = req.method || "GET";
    if (method === "GET") {
      // The only public GET on this otherwise private owner-data bridge.
      let view = String(req.query?.view ?? "");
      if (!view) {
        try { view = new URL(String(req.url || "/"), "https://zhaowu.local").searchParams.get("view") || ""; } catch {}
      }
      if (view !== "site-skin") return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
      try {
        const record = await readPublishedSiteSkinFromSettings().catch(() => null) ?? await readPublishedSiteSkin();
        return json(res, 200, { ok: true, ...record });
      } catch {
        return json(res, 503, { ok: false, error: "SHARED_SKIN_TEMPORARILY_UNAVAILABLE" });
      }
    }
    if (method !== "POST") return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
    if (!requestIsSameOrigin(req)) return json(res, 403, { ok: false, error: "ORIGIN_REJECTED" });
    const owner = await authenticateOwner(req);
    if (!owner) return json(res, 401, { ok: false, error: "OWNER_REQUIRED" });

    const serverBridgeSecret = bridgeSecret();

    const payload = parsedPayload ?? await readJsonBody(req);
    const action = String(payload?.action ?? "").trim();
    if (action === "site-skin.publish" && !validSiteSkin(payload?.skin)) {
      return json(res, 400, { ok: false, error: "UNKNOWN_SITE_SKIN" });
    }
    if (!ACTIONS.has(action)) return json(res, 400, { ok: false, error: "ACTION_NOT_ALLOWED" });
    // Promo and article actions go to their own isolated Edge Functions, which only accept the owner password.
    if (ownerUpstreamFunction(action) !== "zhaowu-owner-data" && owner.kind !== "secret") {
      return json(res, 403, { ok: false, error: "OWNER_PASSWORD_REQUIRED" });
    }
    const sendUpstream = () => postOwnerUpstream(action, payload, owner, serverBridgeSecret);
    let upstream;
    try {
      upstream = await sendUpstream();
    } catch (error) {
      // Theme publication is an idempotent upsert. A single Supabase/network
      // interruption must not make the owner repeat the selection manually.
      if (action !== "site-skin.publish") throw error;
      upstream = await sendUpstream();
    }
    if (action === "site-skin.publish" && retryableSiteSkinStatus(upstream.status)) {
      upstream = await sendUpstream();
    }
    // A stale/missing Edge action can return 404 while the authenticated
    // owner-data API itself is live. Retry this one whitelisted write through
    // the existing server-side service role, never through the browser.
    if (action === "site-skin.publish" && upstream.status === 404) {
      const fallback = await publishSiteSkinFallback(payload.skin);
      return json(res, fallback.status, fallback.body);
    }
    const text = await upstream.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { ok: false, error: "UPSTREAM_INVALID_RESPONSE" }; }
    if (upstream.status === 402) {
      const detail = String(body?.message ?? body?.detail ?? text ?? "");
      body = {
        ok: false,
        error: /cached_egress/i.test(detail) ? "exceed_cached_egress_quota" : "exceed_storage_size_quota",
        detail,
      };
    }
    return json(res, upstream.status, body ?? { ok: upstream.ok });
  } catch (error) {
    return json(res, 502, {
      ok: false,
      error: "SUPABASE_UNAVAILABLE",
      detail: error instanceof Error ? error.message : "unknown",
    });
  }
}

export default async function handler(req, res) {
  return handleOwnerData(req, res);
}
