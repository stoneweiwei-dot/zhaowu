import { createClient } from "npm:@supabase/supabase-js@2.95.0";

// Owner 2026-10-15: temporary free-access / promo codes for the report paywall.
// Deliberately isolated from stripe-checkout / stripe-webhook / report_purchase_entitlements —
// this function only ever reads/writes the new promo_codes / promo_redemptions tables (RLS
// enabled, no public policies; only this function's service-role key can touch them). It never
// records a Stripe-tracked charge or amount, so it cannot distort payment/revenue reporting.

const DEFAULT_ORIGIN = "https://stone-zhaowu-official.vercel.app";
const SYSTEM_IDS = ["bazi", "ziwei", "qizheng", "western", "indian", "palm", "numerology"] as const;
type SystemId = (typeof SYSTEM_IDS)[number];

type Runtime = {
  supabaseUrl?: string;
  supabaseSecretKey?: string;
  publishableKey?: string;
  origins?: string;
};

function runtimeFromDeno(): Runtime {
  const D = (globalThis as { Deno?: { env: { get(name: string): string | undefined } } }).Deno;
  const env = D?.env;
  const jsonKey = (name: string, key = "default") => {
    try { return JSON.parse(env?.get(name) || "{}")[key] as string | undefined; } catch { return undefined; }
  };
  return {
    supabaseUrl: env?.get("SUPABASE_URL"),
    supabaseSecretKey: jsonKey("SUPABASE_SECRET_KEYS") || env?.get("SUPABASE_SERVICE_ROLE_KEY"),
    publishableKey: jsonKey("SUPABASE_PUBLISHABLE_KEYS") || env?.get("SUPABASE_ANON_KEY"),
    origins: env?.get("PUBLIC_SITE_ORIGINS"),
  };
}

function allowedOrigins(env: Runtime) {
  return new Set([
    DEFAULT_ORIGIN,
    ...(env.origins || "").split(",").map((item) => item.trim()).filter(Boolean),
  ]);
}

function requestOrigin(req: Request, env: Runtime) {
  const origin = req.headers.get("origin") || "";
  if (allowedOrigins(env).has(origin)) return origin;
  try {
    const url = new URL(origin);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return origin;
  } catch { /* use default */ }
  return DEFAULT_ORIGIN;
}

function corsHeaders(req: Request, env: Runtime) {
  return {
    "Access-Control-Allow-Origin": requestOrigin(req, env),
    "Access-Control-Allow-Headers": "apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, env: Runtime, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req, env), "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function adminClient(env: Runtime) {
  if (!env.supabaseUrl || !env.supabaseSecretKey) return null;
  return createClient(env.supabaseUrl, env.supabaseSecretKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function validBrowserKey(req: Request, env: Runtime) {
  return !env.publishableKey || req.headers.get("apikey") === env.publishableKey;
}

function isSystemId(value: unknown): value is SystemId {
  return typeof value === "string" && (SYSTEM_IDS as readonly string[]).includes(value);
}

function isAccessKey(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9-]{20,100}$/.test(value);
}

function isCode(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9-]{3,64}$/.test(value.trim());
}

async function handleVerify(req: Request, env: Runtime, admin: ReturnType<typeof adminClient>): Promise<Response> {
  const url = new URL(req.url);
  const accessKey = url.searchParams.get("access_key") || "";
  const system = url.searchParams.get("system") || "";
  if (!isAccessKey(accessKey) || !isSystemId(system)) {
    return json(req, env, { ok: false, error: { code: "BAD_VERIFICATION_REQUEST" } }, 400);
  }
  if (!admin) return json(req, env, { ok: false, error: { code: "PROMO_STORE_NOT_CONFIGURED" } }, 503);

  const { data, error } = await admin
    .from("promo_redemptions")
    .select("product_id,system_id")
    .eq("access_key", accessKey)
    .in("system_id", ["all", system]);

  if (error) return json(req, env, { ok: false, error: { code: "PROMO_STORE_ERROR" } }, 502);
  const bundleRow = (data ?? []).find((row) => row.product_id === "bundle");
  if (bundleRow) return json(req, env, { ok: true, paid: true, product: "bundle", system: null });
  const systemRow = (data ?? []).find((row) => row.product_id === "system" && row.system_id === system);
  if (systemRow) return json(req, env, { ok: true, paid: true, product: "system", system });
  return json(req, env, { ok: true, paid: false });
}

async function handleRedeem(req: Request, env: Runtime, admin: ReturnType<typeof adminClient>): Promise<Response> {
  if (!admin) return json(req, env, { ok: false, error: { code: "PROMO_STORE_NOT_CONFIGURED" } }, 503);
  const payload = await req.json().catch(() => null) as { code?: unknown; system?: unknown; access_key?: unknown } | null;
  const code = payload && isCode(payload.code) ? payload.code.trim() : null;
  const system = payload && isSystemId(payload.system) ? payload.system : null;
  const accessKey = payload && isAccessKey(payload.access_key) ? payload.access_key : null;
  if (!code || !system || !accessKey) {
    return json(req, env, { ok: false, error: { code: "BAD_REDEMPTION_REQUEST" } }, 400);
  }

  const { data: promo, error: lookupError } = await admin
    .from("promo_codes")
    .select("id,product_id,system_id,active,expires_at,max_redemptions,redeemed_count")
    .ilike("code", code)
    .maybeSingle();
  if (lookupError) return json(req, env, { ok: false, error: { code: "PROMO_STORE_ERROR" } }, 502);
  if (!promo || !promo.active) return json(req, env, { ok: false, error: { code: "PROMO_NOT_FOUND" } }, 404);
  if (promo.expires_at && new Date(promo.expires_at).getTime() <= Date.now()) {
    return json(req, env, { ok: false, error: { code: "PROMO_EXPIRED" } }, 410);
  }
  if (promo.system_id && promo.system_id !== system) {
    return json(req, env, { ok: false, error: { code: "PROMO_WRONG_SYSTEM" } }, 409);
  }

  const redemptionSystemId = promo.product_id === "bundle" ? "all" : system;
  const granted = { ok: true, paid: true, product: promo.product_id, system: promo.product_id === "bundle" ? null : system };

  // Re-entering a code this browser already redeemed is idempotent: unlock again, use no new slot.
  const { data: existing, error: existingError } = await admin
    .from("promo_redemptions")
    .select("id")
    .match({ promo_code_id: promo.id, access_key: accessKey, system_id: redemptionSystemId })
    .maybeSingle();
  if (existingError) return json(req, env, { ok: false, error: { code: "PROMO_STORE_ERROR" } }, 502);
  if (existing) return json(req, env, granted);

  if (promo.max_redemptions !== null && promo.redeemed_count >= promo.max_redemptions) {
    return json(req, env, { ok: false, error: { code: "PROMO_EXHAUSTED" } }, 410);
  }
  const { error: insertError } = await admin
    .from("promo_redemptions")
    .insert({ promo_code_id: promo.id, access_key: accessKey, product_id: promo.product_id, system_id: redemptionSystemId });
  if (insertError) {
    // A concurrent request from the same browser won the insert: same idempotent outcome.
    if (insertError.code === "23505") return json(req, env, granted);
    return json(req, env, { ok: false, error: { code: "PROMO_STORE_ERROR" } }, 502);
  }

  const { data: claimed, error: claimError } = await admin.rpc("claim_promo_code_slot", { p_id: promo.id });
  if (claimError) {
    await admin.from("promo_redemptions").delete().match({ promo_code_id: promo.id, access_key: accessKey, system_id: redemptionSystemId });
    return json(req, env, { ok: false, error: { code: "PROMO_STORE_ERROR" } }, 502);
  }
  if (!claimed) {
    // Lost the race for the last slot (or the code lapsed between the checks above and now).
    // Compensate by removing the redemption row we just inserted so no orphaned grant remains.
    await admin.from("promo_redemptions").delete().match({ promo_code_id: promo.id, access_key: accessKey, system_id: redemptionSystemId });
    return json(req, env, { ok: false, error: { code: "PROMO_EXHAUSTED" } }, 410);
  }

  return json(req, env, granted);
}

export async function handle(req: Request, env: Runtime = runtimeFromDeno()): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req, env) });
  if (!validBrowserKey(req, env)) return json(req, env, { ok: false, error: { code: "CLIENT_KEY_REJECTED" } }, 401);

  const admin = adminClient(env);
  if (req.method === "GET") return handleVerify(req, env, admin);
  if (req.method === "POST") return handleRedeem(req, env, admin);
  return json(req, env, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } }, 405);
}

const D = (globalThis as { Deno?: { serve(handler: (req: Request) => Response | Promise<Response>): void } }).Deno;
if (D?.serve) D.serve((req: Request) => handle(req));
