import { publishSocialPost, socialConfiguration, SocialPublishError } from "../lib/meta-social-publisher.js";
import { authenticateOwner, authenticateOwnerProof, ownerProofValue } from "../lib/owner-auth.js";
import { PASSKEY_ACTIONS, isPublicPasskeyAction, runPasskeyAction } from "../lib/owner-passkey-actions.js";
import {
  clearThreadsOauthCookie,
  createThreadsAuthorization,
  decryptThreadsAccessToken,
  encryptThreadsAccessToken,
  exchangeThreadsAuthorizationCode,
  threadsOauthConfiguration,
  threadsAuthorizationOwnerProof,
  tokenFingerprint,
  verifyThreadsAuthorization,
} from "../lib/threads-oauth.js";
import { threadsAccountStoreRequest } from "../lib/threads-account-store.js";

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

// A header value may be an array (several Set-Cookie headers).
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
  const responseHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    for (const item of Array.isArray(value) ? value : [value]) responseHeaders.append(key, item);
  }
  return new Response(JSON.stringify(body), { status, headers: responseHeaders });
}

function queryValue(req, name) {
  const direct = req?.query?.[name];
  if (direct !== undefined) return String(Array.isArray(direct) ? direct[0] : direct);
  try { return new URL(String(req?.url || "/"), "https://zhaowu.local").searchParams.get(name) || ""; } catch { return ""; }
}

function redirect(res, location, cookie = clearThreadsOauthCookie()) {
  const headers = { Location: location, "Cache-Control": "no-store", "Set-Cookie": cookie };
  if (res && typeof res.status === "function" && typeof res.setHeader === "function") {
    for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
    return res.status(302).end();
  }
  return new Response(null, { status: 302, headers });
}

function publicThreadAccount(row, source = "oauth") {
  return {
    id: String(row.id),
    userId: String(row.threads_user_id || row.userId || ""),
    username: String(row.username || "").replace(/^@+/, ""),
    profilePictureUrl: String(row.profile_picture_url || row.profilePictureUrl || ""),
    expiresAt: row.token_expires_at || row.expiresAt || null,
    source,
  };
}

async function storedThreadsAccounts(owner) {
  const body = await threadsAccountStoreRequest("social.threads.list", {}, owner);
  return Array.isArray(body?.items) ? body.items : [];
}

async function handleThreadsCallback(req, res, owner) {
  const state = queryValue(req, "state");
  const code = queryValue(req, "code");
  const oauthError = queryValue(req, "error") || queryValue(req, "error_reason");
  if (oauthError) return redirect(res, `/social?threads=error&reason=${encodeURIComponent(oauthError)}`);
  if (!code || !verifyThreadsAuthorization(req, state)) return redirect(res, "/social?threads=error&reason=invalid_state");
  try {
    const account = await exchangeThreadsAuthorizationCode(code);
    const accessTokenCiphertext = encryptThreadsAccessToken(account.accessToken);
    await threadsAccountStoreRequest("social.threads.upsert", {
      threadsUserId: account.userId,
      username: account.username,
      profilePictureUrl: account.profilePictureUrl,
      accessTokenCiphertext,
      tokenFingerprint: tokenFingerprint(account.accessToken),
      tokenExpiresAt: account.expiresAt,
    }, owner);
    return redirect(res, `/social?threads=connected&username=${encodeURIComponent(account.username)}`);
  } catch (error) {
    const codeValue = error instanceof Error ? error.message.split(":")[0] : "oauth_failed";
    return redirect(res, `/social?threads=error&reason=${encodeURIComponent(codeValue)}`);
  }
}

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    if (method === "GET") {
      let owner = await authenticateOwner(req);
      if (queryValue(req, "action") === "threads.callback") {
        if (!owner) owner = await authenticateOwnerProof(threadsAuthorizationOwnerProof(req));
        if (!owner) return redirect(res, "/login?redirect=%2Fsocial");
        return handleThreadsCallback(req, res, owner);
      }
      // `kind` tells the UI whether this is a password session or a Passkey session (which cannot publish to Git).
      return json(res, 200, { authenticated: Boolean(owner), kind: owner?.kind ?? null });
    }
    if (method !== "POST") return json(res, 405, { authenticated: false });
    if (!requestIsSameOrigin(req)) return json(res, 403, { ok: false, error: "ORIGIN_REJECTED" });

    const payload = await readJsonBody(req);
    if (PASSKEY_ACTIONS.has(payload?.action)) {
      const owner = isPublicPasskeyAction(payload.action) ? null : await authenticateOwner(req);
      if (!owner && !isPublicPasskeyAction(payload.action)) return json(res, 401, { ok: false, error: "OWNER_REQUIRED" });
      const result = await runPasskeyAction(payload.action, payload, { req, owner });
      return json(res, result.status, result.body, result.cookies.length ? { "Set-Cookie": result.cookies } : {});
    }
    const owner = await authenticateOwner(req);
    if (!owner) return json(res, 401, { ok: false, error: "OWNER_REQUIRED" });
    if (payload?.action === "social.status") {
      const base = socialConfiguration();
      let rows = [];
      try { rows = await storedThreadsAccounts(owner); } catch { /* legacy env publishing may still work */ }
      const threadsAccounts = rows.map((row) => publicThreadAccount(row));
      return json(res, 200, {
        ok: true,
        channels: {
          ...base,
          threads: threadsAccounts.length > 0 || base.threads,
          ready: base.instagram || base.threads || threadsAccounts.length > 0,
          threadsOauthReady: threadsOauthConfiguration().ready,
          threadsAccounts,
        },
      });
    }
    if (payload?.action === "social.threads.connect") {
      const authorization = createThreadsAuthorization(process.env, Date.now(), ownerProofValue(owner));
      return json(res, 200, { ok: true, url: authorization.url }, { "Set-Cookie": authorization.cookie });
    }
    if (payload?.action === "social.threads.disconnect") {
      const id = String(payload?.accountId || "").trim();
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json(res, 400, { ok: false, error: "INVALID_THREADS_ACCOUNT" });
      await threadsAccountStoreRequest("social.threads.delete", { id }, owner);
      return json(res, 200, { ok: true });
    }
    if (payload?.action !== "social.publish") {
      return json(res, 400, { ok: false, error: "ACTION_NOT_ALLOWED" });
    }
    let threadAccounts = [];
    if (Array.isArray(payload?.channels) && payload.channels.includes("threads")) {
      const rows = await storedThreadsAccounts(owner);
      const requested = new Set(Array.isArray(payload?.threadAccountIds) ? payload.threadAccountIds.map(String) : []);
      const selectedRows = requested.size ? rows.filter((row) => requested.has(String(row.id))) : rows;
      if (requested.size && selectedRows.length !== requested.size) return json(res, 400, { ok: false, error: "UNKNOWN_THREADS_ACCOUNT" });
      threadAccounts = selectedRows.map((row) => ({
        id: String(row.id),
        userId: String(row.threads_user_id),
        username: String(row.username),
        accessToken: decryptThreadsAccessToken(row.access_token_ciphertext),
      }));
    }
    const results = await publishSocialPost(payload, process.env, fetch, threadAccounts);
    const successCount = Object.values(results).filter((result) => result?.ok).length;
    return json(res, successCount ? 200 : 502, { ok: successCount > 0, results });
  } catch (error) {
    if (error instanceof SocialPublishError) {
      return json(res, error.status, { ok: false, error: error.code, message: error.message });
    }
    return json(res, 500, { authenticated: false, error: "OWNER_SESSION_FAILED", detail: error instanceof Error ? error.message : "unknown" });
  }
}
