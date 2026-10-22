const DEFAULT_SUPABASE_URL = "https://plgpxusmemnmzckbwtiv.supabase.co";

function envValue(env, key) {
  return String(env?.[key] ?? "").trim();
}

export function socialQueueConfigured(env = process.env) {
  return envValue(env, "ZHAOWU_SOCIAL_QUEUE_SECRET").length >= 32;
}

/**
 * Server-to-server call to the `zhaowu-social-queue` edge function.
 * Auth is the dedicated ZHAOWU_SOCIAL_QUEUE_SECRET (never the owner password or cookie), so the daily
 * cron and the owner console use exactly the same gateway.
 */
export async function socialQueueRequest(action, payload = {}, env = process.env, fetchImpl = fetch) {
  const secret = envValue(env, "ZHAOWU_SOCIAL_QUEUE_SECRET");
  if (secret.length < 32) throw new Error("SOCIAL_QUEUE_NOT_CONFIGURED");
  const base = (envValue(env, "SUPABASE_URL") || envValue(env, "VITE_SUPABASE_URL") || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  const response = await fetchImpl(`${base}/functions/v1/zhaowu-social-queue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Zhaowu-Server-Bridge": "r163",
      "X-Zhaowu-Queue-Secret": secret,
    },
    body: JSON.stringify({ action, ...payload }),
    signal: AbortSignal.timeout(20_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) throw new Error(String(body?.error || `SOCIAL_QUEUE_HTTP_${response.status}`));
  return body;
}
