import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Visitor account creation that does NOT depend on e-mail delivery.
 *
 * Why: Supabase Auth has mailer_autoconfirm=false, so the stock /auth/v1/signup sends a confirmation
 * mail from Supabase's shared sender. That is rate-limited and unreliable for mainland-China mailboxes
 * (QQ / 163), which meant mainland visitors could not create an account at all. This function creates the
 * user with email_confirm=true; the browser then signs in through the normal /auth/v1/token endpoint
 * (same-origin /sb proxy). Trade-off, accepted: the e-mail address is not proven to belong to the person.
 * Accounts therefore carry no privilege beyond what the visitor saves under them.
 *
 * Abuse control: per-IP hourly limit stored as salted hashes in public.visitor_signup_attempts.
 * Deployed with verify_jwt=false (called anonymously from the browser).
 */

const IP_LIMIT_PER_HOUR = 6;
const UNKNOWN_IP_LIMIT_PER_HOUR = 40;
const EMAIL_SHAPE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "POST") return json(405, { ok: false, error: "METHOD_NOT_ALLOWED" });

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) return json(503, { ok: false, error: "SERVICE_NOT_CONFIGURED" });
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  let body: { email?: unknown; password?: unknown; name?: unknown };
  try { body = await request.json(); } catch { return json(400, { ok: false, error: "INVALID_JSON" }); }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim().slice(0, 40);
  if (!EMAIL_SHAPE.test(email)) return json(400, { ok: false, error: "INVALID_EMAIL" });
  if (password.length < 8 || password.length > 72) return json(400, { ok: false, error: "INVALID_PASSWORD" });

  const forwarded = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ip = forwarded || request.headers.get("cf-connecting-ip") || "";
  const ipHash = await sha256Hex(`zhaowu-visitor-signup:${ip || "unknown"}`);
  const limit = ip ? IP_LIMIT_PER_HOUR : UNKNOWN_IP_LIMIT_PER_HOUR;
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await db.from("visitor_signup_attempts").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
  if ((count ?? 0) >= limit) return json(429, { ok: false, error: "RATE_LIMITED" });
  await db.from("visitor_signup_attempts").insert({ ip_hash: ipHash });
  // Opportunistic cleanup so the table stays tiny.
  await db.from("visitor_signup_attempts").delete().lt("created_at", new Date(Date.now() - 86_400_000).toISOString());

  const { error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: name || email.split("@")[0] },
  });
  if (error) {
    const message = String(error.message || "").toLowerCase();
    if (message.includes("already") || message.includes("registered") || (error as { status?: number }).status === 422) {
      return json(409, { ok: false, error: "EMAIL_EXISTS" });
    }
    if (message.includes("password")) return json(400, { ok: false, error: "INVALID_PASSWORD" });
    return json(500, { ok: false, error: "SIGNUP_FAILED" });
  }
  return json(200, { ok: true });
});
