import Stripe from "npm:stripe@22.6.0";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const STRIPE_API_VERSION = "2026-08-26.dahlia" as const;
const DEFAULT_ORIGIN = "https://stone-zhaowu-official.vercel.app";
const ALLOWED_SYSTEMS = new Set(["ziwei", "qizheng", "western", "indian", "palm", "numerology"]);

export const PRODUCTS = Object.freeze({
  quick: { amount: 199, name: "昭梧命理 · 单盘快速读" },
  system: { amount: 499, name: "昭梧命理 · 单盘完整深读" },
  bundle: { amount: 999, name: "昭梧命理 · 六盘完整深读" },
});

type ProductId = keyof typeof PRODUCTS;
type Runtime = {
  stripeKey?: string;
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
    stripeKey: env?.get("STRIPE_RESTRICTED_KEY") || env?.get("STRIPE_SECRET_KEY"),
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

function cleanAccessKey(value: unknown) {
  const key = String(value ?? "").trim();
  return /^[A-Za-z0-9-]{20,100}$/.test(key) ? key : "";
}

function cleanSystem(value: unknown) {
  const system = String(value ?? "").trim();
  return ALLOWED_SYSTEMS.has(system) ? system : "";
}

function cleanReturnPath(value: unknown) {
  const path = String(value ?? "/").trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\n") || path.includes("\r")) return "/";
  return path.slice(0, 300);
}

function stripeClient(key: string) {
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
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
  if (!env.stripeKey) return json(req, env, { ok: false, error: { code: "PAYMENT_NOT_CONFIGURED" } }, 503);

  if (req.method === "GET") {
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

  if (req.method !== "POST") return json(req, env, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } }, 405);
  let input: Record<string, unknown> = {};
  try { input = await req.json(); } catch { /* validation below */ }
  const product = String(input.product ?? "") as ProductId;
  const definition = PRODUCTS[product];
  const system = cleanSystem(input.system);
  const accessKey = cleanAccessKey(input.accessKey);
  const returnPath = cleanReturnPath(input.returnPath);
  if (!definition || !accessKey || (!system && product !== "bundle")) {
    return json(req, env, { ok: false, error: { code: "INVALID_PRODUCT_REQUEST" } }, 400);
  }

  const origin = requestOrigin(req, env);
  const success = new URL(returnPath, origin);
  success.searchParams.set("checkout", "success");
  success.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  const cancel = new URL(returnPath, origin);
  cancel.searchParams.set("checkout", "cancelled");
  const metadata = { product_id: product, system_id: product === "bundle" ? "all" : system, access_key: accessKey };

  try {
    const session = await stripeClient(env.stripeKey).checkout.sessions.create({
      mode: "payment",
      line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: definition.amount, product_data: { name: definition.name } } }],
      success_url: success.toString().replace("%7BCHECKOUT_SESSION_ID%7D", "{CHECKOUT_SESSION_ID}"),
      cancel_url: cancel.toString(),
      client_reference_id: accessKey,
      metadata,
      payment_intent_data: { metadata },
      integration_identifier: "zhaowu_report_access_v1",
    });
    if (!session.url) return json(req, env, { ok: false, error: { code: "CHECKOUT_URL_MISSING" } }, 502);
    return json(req, env, { ok: true, url: session.url, id: session.id });
  } catch {
    return json(req, env, { ok: false, error: { code: "STRIPE_ERROR" } }, 502);
  }
}

const D = (globalThis as { Deno?: { serve(handler: (req: Request) => Response | Promise<Response>): void } }).Deno;
if (D?.serve) D.serve((req: Request) => handle(req));
