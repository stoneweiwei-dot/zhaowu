import { createHmac, timingSafeEqual } from "node:crypto";

// Meta Threads sends signed_request as application/x-www-form-urlencoded.
// No owner cookie is accepted here; only the dedicated Threads app secret can authorize deletion.
function send(res, status, body) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (res && typeof res.status === "function" && typeof res.setHeader === "function") {
    for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
    return res.status(status).json(body);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function query(req, name) {
  const candidate = req?.query?.[name];
  if (typeof candidate === "string") return candidate;
  try { return new URL(String(req?.url || "/"), "https://zhao-wu.com").searchParams.get(name) || ""; } catch { return ""; }
}

function signedRequestValue(req) {
  if (typeof req?.body?.signed_request === "string") return req.body.signed_request;
  if (typeof req?.body === "string") return new URLSearchParams(req.body).get("signed_request") || "";
  return "";
}

export function verifyThreadsSignedRequest(value, secret, now = Date.now()) {
  if (typeof value !== "string" || value.length > 8192 || !secret) return null;
  const parts = value.split(".");
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return null;
  const [signature, encoded] = parts;
  let received;
  let parsed;
  try {
    received = Buffer.from(signature, "base64url");
    parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch { return null; }
  const expected = createHmac("sha256", secret).update(encoded).digest();
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  if (parsed?.algorithm !== "HMAC-SHA256" || !/^[0-9]{3,30}$/.test(String(parsed?.user_id || ""))) return null;
  const issuedMs = Number(parsed.issued_at) * 1000;
  // Allow delayed retry but reject very old/replayed and far-future messages.
  if (!Number.isFinite(issuedMs) || issuedMs > now + 300_000 || issuedMs < now - 7 * 86_400_000) return null;
  return { userId: String(parsed.user_id) };
}

function deletionCode(userId, secret) {
  return createHmac("sha256", secret).update("threads-data-deletion:v1:" + userId).digest("hex").slice(0, 48);
}

async function restRequest(path, init, env, fetchImpl) {
  const origin = String(env.SUPABASE_URL || "https://plgpxusmemnmzckbwtiv.supabase.co").replace(/\/$/, "");
  const key = String(env.SUPABASE_SERVICE_ROLE_KEY || "");
  if (!key) throw new Error("SERVICE_ROLE_NOT_CONFIGURED");
  const response = await fetchImpl(origin + "/rest/v1/" + path, {
    ...init,
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error("SUPABASE_STATUS_" + response.status);
  return response;
}

async function removeThreadsConnection(userId, env, fetchImpl) {
  await restRequest("social_threads_accounts?threads_user_id=eq." + encodeURIComponent(userId), { method: "DELETE", headers: { Prefer: "return=minimal" } }, env, fetchImpl);
}

async function recordDeletionReceipt(code, env, fetchImpl) {
  await restRequest("site_settings?on_conflict=key", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ key: "threads_delete_" + code, value: { status: "completed" }, public_read: false, updated_at: new Date().toISOString() }),
  }, env, fetchImpl);
}

export async function handleThreadsMetaCallback(req, res, env = process.env, fetchImpl = fetch) {
  const method = req?.method || "GET";
  const action = query(req, "action").replace(/^threads\./, "");
  const secret = String(env.THREADS_APP_SECRET || "").trim();

  if (method === "GET") {
    const code = query(req, "code");
    if (!code && (action === "deauthorize" || action === "data-deletion")) return send(res, 200, { ok: true, ready: Boolean(secret) });
    if (!/^[a-f0-9]{48}$/.test(code)) return send(res, 400, { ok: false, error: "INVALID_CONFIRMATION_CODE" });
    try {
      const response = await restRequest("site_settings?key=eq.threads_delete_" + code + "&select=value&limit=1", { method: "GET" }, env, fetchImpl);
      const rows = await response.json();
      return send(res, Array.isArray(rows) && rows[0]?.value?.status === "completed" ? 200 : 404, {
        status: Array.isArray(rows) && rows[0]?.value?.status === "completed" ? "completed" : "not_found",
      });
    } catch { return send(res, 503, { ok: false, error: "STATUS_UNAVAILABLE" }); }
  }

  if (method !== "POST" || !["deauthorize", "data-deletion"].includes(action)) return send(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  if (!secret) return send(res, 503, { ok: false, error: "THREADS_SECRET_NOT_CONFIGURED" });
  const signed = verifyThreadsSignedRequest(signedRequestValue(req), secret);
  if (!signed) return send(res, 403, { ok: false, error: "INVALID_SIGNED_REQUEST" });
  try {
    await removeThreadsConnection(signed.userId, env, fetchImpl);
    if (action === "deauthorize") return send(res, 200, { ok: true });
    const code = deletionCode(signed.userId, secret);
    await recordDeletionReceipt(code, env, fetchImpl);
    const site = String(env.PUBLIC_SITE_ORIGIN || "https://zhao-wu.com");
    const origin = new URL(site).origin;
    return send(res, 200, { url: origin + "/api/owner-session?action=threads.deletion-status&code=" + code, confirmation_code: code });
  } catch {
    // Failed deletion must never be reported as completed; Meta may retry.
    return send(res, 503, { ok: false, error: "DELETION_UNAVAILABLE" });
  }
}

export default async function handler(req, res) {
  return handleThreadsMetaCallback(req, res);
}
