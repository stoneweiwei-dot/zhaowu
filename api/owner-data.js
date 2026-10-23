import { authenticateOwner, ownerAuthHeaders } from "../lib/owner-auth.js";
import { isValidOwnerSecret } from "../lib/owner-session-cookie.js";
import { readPublishedSiteSkin, readPublishedSiteSkinFromSettings, validSiteSkin } from "../lib/owner-site-skin-public.js";

export { isValidOwnerSecret };

const DEFAULT_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";

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
  return String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
}

function bridgeSecret() {
  return String(process.env.ZHAOWU_OWNER_BRIDGE_SECRET ?? "").trim();
}


// Temporary read-only Production diagnosis. Never returns credentials, upstream bodies,
// headers, owner records or private data. Remove once the bridge has been repaired.
const OPS_CODES = new Set(["BRIDGE_REQUIRED","BRIDGE_NOT_CONFIGURED","BRIDGE_UNAUTHORIZED","OWNER_UNAUTHORIZED","OWNER_REQUIRED","METHOD_NOT_ALLOWED","INVALID_DEVICE_ID","ACTION_NOT_ALLOWED","SUPABASE_ENV_MISSING","PROMO_STORE_NOT_CONFIGURED","OWNER_DATA_FAILED","SOCIAL_QUEUE_HTTP_404","SOCIAL_QUEUE_NOT_CONFIGURED"]);
async function ownerBridgeProbe(functionName, action, secret) {
  try {
    const r = await fetch(`${supabaseUrl()}/functions/v1/${functionName}`, {
      method:"POST",
      headers:{"Content-Type":"application/json","X-Zhaowu-Server-Bridge":"r162", ...(secret?{"X-Zhaowu-Bridge-Secret":secret}:{}) ,"X-Zhaowu-Owner-Secret":"__diagnostic_invalid_owner_proof__"},
      body:JSON.stringify({action}),signal:AbortSignal.timeout(5500),
    });
    const b=await r.json().catch(()=>({}));
    return {http:r.status,code:OPS_CODES.has(b?.error)?b.error:"OTHER"};
  } catch {return {http:0,code:"NETWORK_ERROR"};}
}
async function readOnlyOperationsDiagnostic() {
  // Existing bridge-only action checks a non-existent credential ID. No device
  // or customer data is returned and no mutation is performed.
  const bridge=bridgeSecret();
  const check=async()=>{
    try{
      const r=await fetch(`${supabaseUrl()}/functions/v1/zhaowu-owner-data`,{
        method:"POST",headers:{"Content-Type":"application/json","X-Zhaowu-Server-Bridge":"r162",...(bridge?{"X-Zhaowu-Bridge-Secret":bridge}:{})},
        body:JSON.stringify({action:"owner.device.credential",credentialId:"__invalid_diagnostic__"}),signal:AbortSignal.timeout(5500)
      });
      const b=await r.json().catch(()=>({}));
      return {http:r.status,code:OPS_CODES.has(b?.error)?b.error:(r.status===200?"OK":"OTHER")};
    }catch{return {http:0,code:"NETWORK_ERROR"};}
  };
  const social=async()=>{
    try{
      const {socialQueueRequest}=await import("../lib/social-queue-client.js");
      await socialQueueRequest("settings.get",{},process.env,fetch);
      return {http:200,code:"OK"};
    }catch(e){
      const code=String(e instanceof Error?e.message:"");
      const match=code.match(/^(SOCIAL_QUEUE_HTTP_\d{3}|SOCIAL_QUEUE_NOT_CONFIGURED|BRIDGE_UNAUTHORIZED|BRIDGE_NOT_CONFIGURED|BRIDGE_REQUIRED)$/);
      return {http:0,code:match?match[1]:"SOCIAL_QUEUE_FAILURE"};
    }
  };
  const admin=async()=>{
    const key=String(process.env.SUPABASE_SERVICE_ROLE_KEY||"").trim();
    if(!key)return {http:0,code:"MISSING"};
    try{
      const r=await fetch(`${supabaseUrl()}/rest/v1/site_settings?select=key&limit=1`,{
        headers:{apikey:key,Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(5500)
      });
      return {http:r.status,code:r.ok?"OK":r.status===401||r.status===403?"WRONG_PROJECT_KEY":"OTHER"};
    }catch{return {http:0,code:"NETWORK_ERROR"};}
  };
  const [device,promo,articles,queue,serviceKey]=await Promise.all([
    check(),ownerBridgeProbe(PROMO_FUNCTION,"promo.list",bridge),ownerBridgeProbe(ARTICLE_FUNCTION,"article.list",bridge),social(),admin()
  ]);
  return {ok:true,diagnosticOnly:true,device,promo,articles,queue,serviceKey};
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
  const url = String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "") +
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
      if (view === "ops-health") return json(res, 200, await readOnlyOperationsDiagnostic());
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
    const upstream = await fetch(`${supabaseUrl()}/functions/v1/${ownerUpstreamFunction(action)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(serverBridgeSecret ? { "X-Zhaowu-Bridge-Secret": serverBridgeSecret } : {}),
        ...ownerAuthHeaders(owner),
        "X-Zhaowu-Server-Bridge": "r162",
      },
      body: JSON.stringify(payload),
    });
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
