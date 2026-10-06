import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const DEFAULT_ORIGIN = "https://stone-zhaowu-official.vercel.app";

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
    "https://zhaowu.soul-terminal.com",
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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, env: Runtime, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req, env), "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function cleanAccessKey(value: unknown) {
  const key = String(value ?? "").trim();
  return /^[A-Za-z0-9-]{20,100}$/.test(key) ? key : "";
}

function adminClient(env: Runtime) {
  if (!env.supabaseUrl || !env.supabaseSecretKey) return null;
  return createClient(env.supabaseUrl, env.supabaseSecretKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function validBrowserKey(req: Request, env: Runtime) {
  return !env.publishableKey || req.headers.get("apikey") === env.publishableKey;
}

export async function handle(req: Request, env: Runtime = runtimeFromDeno()): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req, env) });
  if (!validBrowserKey(req, env)) return json(req, env, { ok: false, error: { code: "CLIENT_KEY_REJECTED" } }, 401);
  if (req.method !== "GET") return json(req, env, { ok: false, error: { code: "PAYMENT_LINKS_ONLY" } }, 405);

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id") || "";
  const accessKey = cleanAccessKey(url.searchParams.get("access_key"));
  if (!/^cs_(?:live|test)_[A-Za-z0-9]{10,200}$/.test(sessionId) || !accessKey) {
    return json(req, env, { ok: false, error: { code: "BAD_VERIFICATION_REQUEST" } }, 400);
  }

  const admin = adminClient(env);
  if (!admin) return json(req, env, { ok: false, error: { code: "PAYMENT_STORE_NOT_CONFIGURED" } }, 503);

  const { data, error } = await admin
    .from("report_purchase_entitlements")
    .select("product_id,system_id,status")
    .eq("checkout_session_id", sessionId)
    .eq("access_key", accessKey)
    .maybeSingle();

  if (error) return json(req, env, { ok: false, error: { code: "PAYMENT_STORE_ERROR" } }, 502);
  if (!data) return json(req, env, { ok: true, paid: false, pending: true });

  return json(req, env, {
    ok: true,
    paid: data.status === "paid",
    pending: data.status === "pending",
    product: data.product_id,
    system: data.system_id,
  });
}

const D = (globalThis as { Deno?: { serve(handler: (req: Request) => Response | Promise<Response>): void } }).Deno;
if (D?.serve) D.serve((req: Request) => handle(req));
