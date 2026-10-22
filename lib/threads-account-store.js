import { ownerAuthHeaders } from "./owner-auth.js";

const DEFAULT_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";

function envValue(env, key) {
  return String(env?.[key] ?? "").trim();
}

/** `owner` is the result of authenticateOwner(); a bare owner-secret string is still accepted. */
export async function threadsAccountStoreRequest(action, payload, owner, env = process.env, fetchImpl = fetch) {
  const ownerAuth = typeof owner === "string" ? { kind: "secret", secret: owner } : owner;
  const base = (envValue(env, "SUPABASE_URL") || envValue(env, "VITE_SUPABASE_URL") || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  const bridgeSecret = envValue(env, "ZHAOWU_OWNER_BRIDGE_SECRET");
  if (!ownerAuth || !bridgeSecret) throw new Error("THREADS_ACCOUNT_STORE_NOT_CONFIGURED");
  const response = await fetchImpl(`${base}/functions/v1/zhaowu-owner-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Zhaowu-Bridge-Secret": bridgeSecret,
      ...ownerAuthHeaders(ownerAuth),
      "X-Zhaowu-Server-Bridge": "r162",
    },
    body: JSON.stringify({ action, ...payload }),
    signal: AbortSignal.timeout(20_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) throw new Error(String(body?.error || `THREADS_ACCOUNT_STORE_HTTP_${response.status}`));
  return body;
}
