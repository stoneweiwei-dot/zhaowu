const DEFAULT_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";

function envValue(env, key) {
  return String(env?.[key] ?? "").trim();
}

export async function metaAccountStoreRequest(action, payload, ownerSecret, env = process.env, fetchImpl = fetch) {
  const base = (envValue(env, "SUPABASE_URL") || envValue(env, "VITE_SUPABASE_URL") || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  const bridgeSecret = envValue(env, "ZHAOWU_OWNER_BRIDGE_SECRET");
  if (!ownerSecret || !bridgeSecret) throw new Error("META_ACCOUNT_STORE_NOT_CONFIGURED");
  const response = await fetchImpl(`${base}/functions/v1/zhaowu-owner-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Zhaowu-Bridge-Secret": bridgeSecret,
      "X-Zhaowu-Owner-Secret": ownerSecret,
      "X-Zhaowu-Server-Bridge": "r162",
    },
    body: JSON.stringify({ action, ...payload }),
    signal: AbortSignal.timeout(20_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) throw new Error(String(body?.error || `META_ACCOUNT_STORE_HTTP_${response.status}`));
  return body;
}
