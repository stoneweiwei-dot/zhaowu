import { handleOwnerData } from "./owner-data.js";
import { publishSocialPost, socialConfiguration, SocialPublishError } from "../lib/meta-social-publisher.js";
import {
  ownerCookieValue,
  ownerSecretFromCookieValue,
  ownerSecretFromRequest,
  requestHasOwnerSession,
} from "../lib/owner-session-cookie.js";
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
import {
  clearMetaOauthCookie,
  createMetaAuthorization,
  decryptMetaAccessToken,
  encryptMetaAccessToken,
  exchangeMetaAuthorizationCode,
  metaAuthorizationOwnerProof,
  metaOauthConfiguration,
  tokenFingerprint as metaTokenFingerprint,
  verifyMetaAuthorization,
} from "../lib/meta-oauth.js";
import { metaAccountStoreRequest } from "../lib/meta-account-store.js";
import { runAutopublish } from "../lib/social-scheduler.js";
import { handleAutopublishAction } from "../lib/social-owner-actions.js";
import { timingSafeEqual } from "node:crypto";

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

function queryValue(req, name) {
  const direct = req?.query?.[name];
  if (direct !== undefined) return String(Array.isArray(direct) ? direct[0] : direct);
  try { return new URL(String(req?.url || "/"), "https://zhaowu.local").searchParams.get(name) || ""; } catch { return ""; }
}

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Fail closed when the secret is unset or short. */
function requestIsAuthorizedCron(req) {
  const expected = String(process.env.CRON_SECRET || "").trim();
  if (expected.length < 16) return false;
  const header = headerValue(req, "authorization").trim();
  const actual = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
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

function publicMetaAccount(row, source = "oauth") {
  return {
    id: String(row.id),
    pageId: String(row.page_id || row.pageId || ""),
    pageName: String(row.page_name || row.pageName || ""),
    instagramUserId: String(row.instagram_user_id || row.instagramUserId || ""),
    instagramUsername: String(row.instagram_username || row.instagramUsername || "").replace(/^@+/, ""),
    profilePictureUrl: String(row.profile_picture_url || row.profilePictureUrl || ""),
    expiresAt: row.token_expires_at || row.expiresAt || null,
    source,
  };
}

async function storedThreadsAccounts(ownerSecret) {
  const body = await threadsAccountStoreRequest("social.threads.list", {}, ownerSecret);
  return Array.isArray(body?.items) ? body.items : [];
}

async function storedMetaAccounts(ownerSecret) {
  const body = await metaAccountStoreRequest("social.meta.list", {}, ownerSecret);
  return Array.isArray(body?.items) ? body.items : [];
}

async function handleThreadsCallback(req, res, ownerSecret) {
  const state = queryValue(req, "state");
  const code = queryValue(req, "code");
  const oauthError = queryValue(req, "error") || queryValue(req, "error_reason");
  if (oauthError) return redirect(res, `/account?view=autopublish&threads=error&reason=${encodeURIComponent(oauthError)}`);
  if (!code || !verifyThreadsAuthorization(req, state)) return redirect(res, "/account?view=autopublish&threads=error&reason=invalid_state");
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
    }, ownerSecret);
    return redirect(res, `/account?view=autopublish&threads=connected&username=${encodeURIComponent(account.username)}`);
  } catch (error) {
    const codeValue = error instanceof Error ? error.message.split(":")[0] : "oauth_failed";
    return redirect(res, `/account?view=autopublish&threads=error&reason=${encodeURIComponent(codeValue)}`);
  }
}

async function handleMetaCallback(req, res, ownerSecret) {
  const state = queryValue(req, "state");
  const code = queryValue(req, "code");
  const oauthError = queryValue(req, "error") || queryValue(req, "error_reason");
  if (oauthError) return redirect(res, `/account?view=autopublish&meta=error&reason=${encodeURIComponent(oauthError)}`, clearMetaOauthCookie());
  if (!code || !verifyMetaAuthorization(req, state)) return redirect(res, "/account?view=autopublish&meta=error&reason=invalid_state", clearMetaOauthCookie());
  try {
    const accounts = await exchangeMetaAuthorizationCode(code);
    for (const account of accounts) {
      await metaAccountStoreRequest("social.meta.upsert", {
        pageId: account.pageId,
        pageName: account.pageName,
        instagramUserId: account.instagramUserId,
        instagramUsername: account.instagramUsername,
        profilePictureUrl: account.profilePictureUrl,
        accessTokenCiphertext: encryptMetaAccessToken(account.accessToken),
        tokenFingerprint: metaTokenFingerprint(account.accessToken),
        tokenExpiresAt: account.tokenExpiresAt,
      }, ownerSecret);
    }
    return redirect(res, `/account?view=autopublish&meta=connected&pages=${accounts.length}`, clearMetaOauthCookie());
  } catch (error) {
    const codeValue = error instanceof Error ? error.message.split(":")[0] : "oauth_failed";
    return redirect(res, `/account?view=autopublish&meta=error&reason=${encodeURIComponent(codeValue)}`, clearMetaOauthCookie());
  }
}

export default async function handler(req, res) {
  try {
    const method = req.method || "GET";
    if (method === "GET") {
      // Public read-only fallback when the owner-data route is absent from an older deployment.
      // Delegate to the same source of truth; no owner mutation or credential exposure.
      if (queryValue(req, "view") === "site-skin") return handleOwnerData(req, res);
      if (queryValue(req, "action") === "cron.autopublish") {
        if (!requestIsAuthorizedCron(req)) return json(res, 401, { ok: false, error: "CRON_UNAUTHORIZED" });
        try {
          const result = await runAutopublish({ env: process.env, fetchImpl: fetch });
          return json(res, 200, { ok: true, result: { ran: result.ran, reason: result.reason, status: result.status } });
        } catch (error) {
          return json(res, 500, { ok: false, error: "CRON_FAILED", detail: error instanceof Error ? error.message.slice(0, 120) : "unknown" });
        }
      }
      let ownerSecret = ownerSecretFromRequest(req);
      if (queryValue(req, "action") === "threads.callback") {
        if (!ownerSecret) ownerSecret = ownerSecretFromCookieValue(threadsAuthorizationOwnerProof(req));
        if (!ownerSecret) return redirect(res, "/login?redirect=%2Fsocial");
        return handleThreadsCallback(req, res, ownerSecret);
      }
      if (queryValue(req, "action") === "meta.callback") {
        if (!ownerSecret) ownerSecret = ownerSecretFromCookieValue(metaAuthorizationOwnerProof(req));
        if (!ownerSecret) return redirect(res, "/login?redirect=%2Faccount%3Fview%3Dautopublish", clearMetaOauthCookie());
        return handleMetaCallback(req, res, ownerSecret);
      }
      return json(res, 200, { authenticated: Boolean(ownerSecret) });
    }
    if (method !== "POST") return json(res, 405, { authenticated: false });
    if (!requestIsSameOrigin(req)) return json(res, 403, { ok: false, error: "ORIGIN_REJECTED" });
    if (!requestHasOwnerSession(req)) return json(res, 401, { ok: false, error: "OWNER_REQUIRED" });
    const ownerSecret = ownerSecretFromRequest(req);

    const payload = await readJsonBody(req);
    // Fallback for old Vercel function manifests that return 404 on /api/owner-data.
    // Reuse the original owner-data handler, including its strict origin and owner checks. The body was
    // already consumed above, so hand over the parsed payload instead of letting owner-data read it again.
    if (payload?.action === "site-skin.publish") return handleOwnerData(req, res, payload);
    if (payload?.action === "social.status") {
      const base = socialConfiguration();
      let threadRows = [];
      let metaRows = [];
      try { threadRows = await storedThreadsAccounts(ownerSecret); } catch { /* legacy env publishing may still work */ }
      try { metaRows = await storedMetaAccounts(ownerSecret); } catch { /* legacy env publishing may still work */ }
      const threadsAccounts = threadRows.map((row) => publicThreadAccount(row));
      const metaAccounts = metaRows.map((row) => publicMetaAccount(row));
      return json(res, 200, {
        ok: true,
        channels: {
          ...base,
          threads: threadsAccounts.length > 0 || base.threads,
          instagram: metaAccounts.some((account) => account.instagramUserId) || base.instagram,
          facebook: metaAccounts.length > 0 || base.facebook,
          ready: base.instagram || base.facebook || base.threads || threadsAccounts.length > 0 || metaAccounts.length > 0,
          threadsOauthReady: threadsOauthConfiguration().ready,
          metaOauthReady: metaOauthConfiguration().ready,
          threadsAccounts,
          metaAccounts,
        },
      });
    }
    if (payload?.action === "social.threads.connect") {
      const authorization = createThreadsAuthorization(process.env, Date.now(), ownerCookieValue(ownerSecret));
      return json(res, 200, { ok: true, url: authorization.url }, { "Set-Cookie": authorization.cookie });
    }
    if (payload?.action === "social.threads.disconnect") {
      const id = String(payload?.accountId || "").trim();
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json(res, 400, { ok: false, error: "INVALID_THREADS_ACCOUNT" });
      await threadsAccountStoreRequest("social.threads.delete", { id }, ownerSecret);
      return json(res, 200, { ok: true });
    }
    if (payload?.action === "social.meta.connect") {
      const authorization = createMetaAuthorization(process.env, Date.now(), ownerCookieValue(ownerSecret));
      return json(res, 200, { ok: true, url: authorization.url }, { "Set-Cookie": authorization.cookie });
    }
    if (payload?.action === "social.meta.disconnect") {
      const id = String(payload?.accountId || "").trim();
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json(res, 400, { ok: false, error: "INVALID_META_ACCOUNT" });
      await metaAccountStoreRequest("social.meta.delete", { id }, ownerSecret);
      return json(res, 200, { ok: true });
    }
    if (typeof payload?.action === "string" && payload.action.startsWith("autopublish.")) {
      try {
        const handled = await handleAutopublishAction(payload);
        if (handled) return json(res, handled.status, handled.body);
      } catch (error) {
        return json(res, 502, { ok: false, error: error instanceof Error ? error.message.slice(0, 120) : "AUTOPUBLISH_FAILED" });
      }
    }
    if (payload?.action !== "social.publish") {
      return json(res, 400, { ok: false, error: "ACTION_NOT_ALLOWED" });
    }
    let threadAccounts = [];
    if (Array.isArray(payload?.channels) && payload.channels.includes("threads")) {
      const rows = await storedThreadsAccounts(ownerSecret);
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
    let metaAccounts = [];
    if (Array.isArray(payload?.channels) && (payload.channels.includes("instagram") || payload.channels.includes("facebook"))) {
      const rows = await storedMetaAccounts(ownerSecret);
      const requested = new Set(Array.isArray(payload?.metaAccountIds) ? payload.metaAccountIds.map(String) : []);
      const selectedRows = requested.size ? rows.filter((row) => requested.has(String(row.id))) : rows;
      if (requested.size && selectedRows.length !== requested.size) return json(res, 400, { ok: false, error: "UNKNOWN_META_ACCOUNT" });
      metaAccounts = selectedRows.map((row) => ({
        id: String(row.id),
        pageId: String(row.page_id),
        pageName: String(row.page_name),
        instagramUserId: String(row.instagram_user_id || ""),
        instagramUsername: String(row.instagram_username || ""),
        accessToken: decryptMetaAccessToken(row.access_token_ciphertext),
      }));
    }
    const results = await publishSocialPost(payload, process.env, fetch, threadAccounts, metaAccounts);
    const successCount = Object.values(results).filter((result) => result?.ok).length;
    return json(res, successCount ? 200 : 502, { ok: successCount > 0, results });
  } catch (error) {
    if (error instanceof SocialPublishError) {
      return json(res, error.status, { ok: false, error: error.code, message: error.message });
    }
    return json(res, 500, { authenticated: false, error: "OWNER_SESSION_FAILED", detail: error instanceof Error ? error.message : "unknown" });
  }
}
