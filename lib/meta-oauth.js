import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { encryptThreadsAccessToken, decryptThreadsAccessToken, tokenFingerprint } from "./threads-oauth.js";

const DEFAULT_ORIGIN = "https://zhao-wu.com";
const DEFAULT_GRAPH_VERSION = "v26.0";
const OAUTH_COOKIE = "__Host-zhaowu_meta_oauth";
const OAUTH_TTL_SECONDS = 10 * 60;
const REQUEST_TIMEOUT_MS = 25_000;
const META_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
];

function value(env, key) {
  return String(env?.[key] ?? "").trim();
}

function origin(env) {
  const raw = value(env, "PUBLIC_SITE_ORIGIN") || value(env, "VITE_SITE_URL") || DEFAULT_ORIGIN;
  try { return new URL(raw).origin; } catch { return DEFAULT_ORIGIN; }
}

function graphVersion(env) {
  const version = value(env, "META_GRAPH_API_VERSION") || DEFAULT_GRAPH_VERSION;
  return /^v\d+\.\d+$/.test(version) ? version : DEFAULT_GRAPH_VERSION;
}

export function metaOauthConfiguration(env = process.env) {
  const appId = value(env, "META_APP_ID");
  const appSecret = value(env, "META_APP_SECRET");
  const version = graphVersion(env);
  const redirectUri = `${origin(env)}/api/owner-session?action=meta.callback`;
  return { appId, appSecret, version, redirectUri, scopes: [...META_SCOPES], ready: Boolean(appId && appSecret) };
}

function signature(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function equalText(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function cookieValue(req, name) {
  const headers = req?.headers;
  const raw = typeof headers?.get === "function" ? String(headers.get("cookie") ?? "") : String(headers?.cookie ?? headers?.Cookie ?? "");
  for (const part of raw.split(";")) {
    const index = part.indexOf("=");
    if (index < 0 || part.slice(0, index).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1)); } catch { return ""; }
  }
  return "";
}

function cookiePayload(req) {
  try {
    const raw = cookieValue(req, OAUTH_COOKIE);
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function createMetaAuthorization(env = process.env, nowMs = Date.now(), ownerProof = "") {
  const config = metaOauthConfiguration(env);
  if (!config.ready) throw new Error("META_OAUTH_NOT_CONFIGURED");
  const payload = Buffer.from(JSON.stringify({
    v: 1,
    nonce: randomBytes(24).toString("base64url"),
    exp: Math.floor(nowMs / 1000) + OAUTH_TTL_SECONDS,
  })).toString("base64url");
  const state = `${payload}.${signature(payload, config.appSecret)}`;
  const url = new URL(`https://www.facebook.com/${config.version}/dialog/oauth`);
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", config.scopes.join(","));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  const stored = Buffer.from(JSON.stringify({ state, ownerProof: String(ownerProof || "") })).toString("base64url");
  const cookie = `${OAUTH_COOKIE}=${encodeURIComponent(stored)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${OAUTH_TTL_SECONDS}`;
  return { url: url.toString(), cookie };
}

export function verifyMetaAuthorization(req, state, env = process.env, nowMs = Date.now()) {
  const config = metaOauthConfiguration(env);
  const cookie = cookiePayload(req);
  const parts = String(state ?? "").split(".");
  if (!config.ready || parts.length !== 2 || !cookie?.state || !equalText(cookie.state, state)) return false;
  if (!equalText(parts[1], signature(parts[0], config.appSecret))) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return payload?.v === 1 && Number.isFinite(payload?.exp) && payload.exp * 1000 > nowMs;
  } catch {
    return false;
  }
}

export function metaAuthorizationOwnerProof(req) {
  return String(cookiePayload(req)?.ownerProof || "");
}

export function clearMetaOauthCookie() {
  return `${OAUTH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

async function fetchJson(url, init, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (error) {
    const code = error?.name === "TimeoutError" || error?.name === "AbortError" ? "META_TIMEOUT" : "META_UNAVAILABLE";
    throw new Error(code);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) {
    const message = String(payload?.error?.message || `Meta HTTP ${response.status}`).slice(0, 300);
    throw new Error(`META_OAUTH_REJECTED:${message}`);
  }
  return payload;
}

export async function exchangeMetaAuthorizationCode(code, env = process.env, fetchImpl = fetch) {
  const config = metaOauthConfiguration(env);
  if (!config.ready) throw new Error("META_OAUTH_NOT_CONFIGURED");
  const tokenUrl = new URL(`https://graph.facebook.com/${config.version}/oauth/access_token`);
  tokenUrl.searchParams.set("client_id", config.appId);
  tokenUrl.searchParams.set("client_secret", config.appSecret);
  tokenUrl.searchParams.set("redirect_uri", config.redirectUri);
  tokenUrl.searchParams.set("code", String(code ?? ""));
  const short = await fetchJson(tokenUrl.toString(), { method: "GET" }, fetchImpl);
  if (!short?.access_token) throw new Error("META_OAUTH_INVALID_RESPONSE");

  const longUrl = new URL(`https://graph.facebook.com/${config.version}/oauth/access_token`);
  longUrl.searchParams.set("grant_type", "fb_exchange_token");
  longUrl.searchParams.set("client_id", config.appId);
  longUrl.searchParams.set("client_secret", config.appSecret);
  longUrl.searchParams.set("fb_exchange_token", String(short.access_token));
  const long = await fetchJson(longUrl.toString(), { method: "GET" }, fetchImpl);
  const userToken = String(long?.access_token || "").trim();
  if (!userToken) throw new Error("META_LONG_TOKEN_MISSING");

  const accounts = [];
  let nextUrl = new URL(`https://graph.facebook.com/${config.version}/me/accounts`);
  nextUrl.searchParams.set("fields", "id,name,access_token,instagram_business_account{id,username,profile_picture_url}");
  nextUrl.searchParams.set("limit", "100");
  nextUrl.searchParams.set("access_token", userToken);
  for (let page = 0; nextUrl && page < 5; page += 1) {
    const payload = await fetchJson(nextUrl.toString(), { method: "GET" }, fetchImpl);
    for (const row of Array.isArray(payload?.data) ? payload.data : []) {
      const pageId = String(row?.id || "").trim();
      const pageName = String(row?.name || "").trim();
      const accessToken = String(row?.access_token || "").trim();
      if (!pageId || !pageName || !accessToken) continue;
      const instagram = row?.instagram_business_account || null;
      accounts.push({
        pageId,
        pageName,
        instagramUserId: String(instagram?.id || "").trim() || null,
        instagramUsername: String(instagram?.username || "").trim().replace(/^@+/, "") || null,
        profilePictureUrl: String(instagram?.profile_picture_url || "").trim() || null,
        accessToken,
        tokenExpiresAt: null,
      });
    }
    const candidate = String(payload?.paging?.next || "").trim();
    nextUrl = candidate && candidate.startsWith("https://graph.facebook.com/") ? new URL(candidate) : null;
  }
  if (!accounts.length) throw new Error("META_NO_MANAGED_PAGES");
  return accounts;
}

export const encryptMetaAccessToken = encryptThreadsAccessToken;
export const decryptMetaAccessToken = decryptThreadsAccessToken;
export { tokenFingerprint };
