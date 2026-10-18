import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const DEFAULT_ORIGIN = "https://zhao-wu.com";
const THREADS_GRAPH_ORIGIN = "https://graph.threads.net";
const OAUTH_COOKIE = "__Host-zhaowu_threads_oauth";
const OAUTH_TTL_SECONDS = 10 * 60;
const REQUEST_TIMEOUT_MS = 25_000;

function value(env, key) {
  return String(env?.[key] ?? "").trim();
}

function origin(env) {
  const raw = value(env, "PUBLIC_SITE_ORIGIN") || value(env, "VITE_SITE_URL") || DEFAULT_ORIGIN;
  try { return new URL(raw).origin; } catch { return DEFAULT_ORIGIN; }
}

export function threadsOauthConfiguration(env = process.env) {
  const appId = value(env, "META_APP_ID");
  const appSecret = value(env, "META_APP_SECRET");
  const redirectUri = `${origin(env)}/api/owner-session?action=threads.callback`;
  return { appId, appSecret, redirectUri, ready: Boolean(appId && appSecret) };
}

function stateSignature(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function equalText(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createThreadsAuthorization(env = process.env, nowMs = Date.now(), ownerProof = "") {
  const config = threadsOauthConfiguration(env);
  if (!config.ready) throw new Error("THREADS_OAUTH_NOT_CONFIGURED");
  const payload = Buffer.from(JSON.stringify({
    v: 1,
    nonce: randomBytes(24).toString("base64url"),
    exp: Math.floor(nowMs / 1000) + OAUTH_TTL_SECONDS,
  })).toString("base64url");
  const state = `${payload}.${stateSignature(payload, config.appSecret)}`;
  const url = new URL("https://threads.net/oauth/authorize");
  url.searchParams.set("client_id", config.appId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", "threads_basic,threads_content_publish");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  const cookiePayload = Buffer.from(JSON.stringify({ state, ownerProof: String(ownerProof || "") })).toString("base64url");
  const cookie = `${OAUTH_COOKIE}=${encodeURIComponent(cookiePayload)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${OAUTH_TTL_SECONDS}`;
  return { url: url.toString(), cookie };
}

function cookieValue(req, name) {
  const headers = req?.headers;
  const raw = typeof headers?.get === "function"
    ? String(headers.get("cookie") ?? "")
    : String(headers?.cookie ?? headers?.Cookie ?? "");
  for (const part of raw.split(";")) {
    const index = part.indexOf("=");
    if (index < 0 || part.slice(0, index).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1)); } catch { return ""; }
  }
  return "";
}

export function verifyThreadsAuthorization(req, state, env = process.env, nowMs = Date.now()) {
  const config = threadsOauthConfiguration(env);
  const cookie = threadsOauthCookiePayload(req);
  const parts = String(state ?? "").split(".");
  if (!config.ready || parts.length !== 2 || !cookie?.state || !equalText(cookie.state, state)) return false;
  if (!equalText(parts[1], stateSignature(parts[0], config.appSecret))) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return payload?.v === 1 && Number.isFinite(payload?.exp) && payload.exp * 1000 > nowMs;
  } catch {
    return false;
  }
}

function threadsOauthCookiePayload(req) {
  try {
    const raw = cookieValue(req, OAUTH_COOKIE);
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function threadsAuthorizationOwnerProof(req) {
  return String(threadsOauthCookiePayload(req)?.ownerProof || "");
}

export function clearThreadsOauthCookie() {
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

export async function exchangeThreadsAuthorizationCode(code, env = process.env, fetchImpl = fetch) {
  const config = threadsOauthConfiguration(env);
  if (!config.ready) throw new Error("THREADS_OAUTH_NOT_CONFIGURED");
  const body = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
    code: String(code ?? ""),
  });
  const short = await fetchJson(`${THREADS_GRAPH_ORIGIN}/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  }, fetchImpl);
  if (!short?.access_token || !short?.user_id) throw new Error("META_OAUTH_INVALID_RESPONSE");

  const longUrl = new URL(`${THREADS_GRAPH_ORIGIN}/access_token`);
  longUrl.searchParams.set("grant_type", "th_exchange_token");
  longUrl.searchParams.set("client_secret", config.appSecret);
  longUrl.searchParams.set("access_token", String(short.access_token));
  const long = await fetchJson(longUrl.toString(), { method: "GET" }, fetchImpl);
  if (!long?.access_token) throw new Error("META_LONG_TOKEN_MISSING");

  const profileUrl = new URL(`${THREADS_GRAPH_ORIGIN}/v1.0/me`);
  profileUrl.searchParams.set("fields", "id,username,threads_profile_picture_url");
  profileUrl.searchParams.set("access_token", String(long.access_token));
  const profile = await fetchJson(profileUrl.toString(), { method: "GET" }, fetchImpl);
  const userId = String(profile?.id || short.user_id || "").trim();
  const username = String(profile?.username || "").trim().replace(/^@+/, "");
  if (!userId || !username) throw new Error("META_PROFILE_INVALID");
  const expiresIn = Math.max(0, Number(long.expires_in) || 0);
  return {
    userId,
    username,
    profilePictureUrl: String(profile?.threads_profile_picture_url || "").trim(),
    accessToken: String(long.access_token),
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
  };
}

function tokenKey(env) {
  const config = threadsOauthConfiguration(env);
  if (!config.appSecret) throw new Error("THREADS_TOKEN_KEY_NOT_CONFIGURED");
  const bridge = value(env, "ZHAOWU_OWNER_BRIDGE_SECRET");
  return Buffer.from(hkdfSync("sha256", `${config.appSecret}:${bridge}`, "zhaowu-threads-token-v1", "aes-256-gcm", 32));
}

export function encryptThreadsAccessToken(token, env = process.env) {
  const plain = String(token ?? "").trim();
  if (!plain) throw new Error("THREADS_TOKEN_REQUIRED");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(env), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `v1.${Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url")}`;
}

export function decryptThreadsAccessToken(value, env = process.env) {
  const rawValue = String(value ?? "");
  if (!rawValue.startsWith("v1.")) throw new Error("THREADS_TOKEN_FORMAT_INVALID");
  const raw = Buffer.from(rawValue.slice(3), "base64url");
  if (raw.length < 29) throw new Error("THREADS_TOKEN_FORMAT_INVALID");
  const decipher = createDecipheriv("aes-256-gcm", tokenKey(env), raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
}

export function tokenFingerprint(value) {
  return createHash("sha256").update(String(value ?? "")).digest("hex").slice(0, 16);
}
