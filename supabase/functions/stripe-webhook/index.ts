import Stripe from "npm:stripe@22.6.0";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const STRIPE_API_VERSION = "2026-08-26.dahlia" as const;
const PRODUCT_AMOUNTS: Record<string, number> = { quick: 199, system: 499, bundle: 999 };
const SYSTEMS = new Set(["ziwei", "qizheng", "western", "indian", "palm", "numerology", "all"]);

function secretFromJson(name: string) {
  try { return JSON.parse(Deno.env.get(name) || "{}").default as string | undefined; } catch { return undefined; }
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function handle(req: Request) {
  if (req.method !== "POST") return response({ ok: false }, 405);
  const stripeKey = Deno.env.get("STRIPE_RESTRICTED_KEY") || Deno.env.get("STRIPE_SECRET_KEY") || "";
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseSecret = secretFromJson("SUPABASE_SECRET_KEYS") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseSecret) return response({ ok: false, error: "WEBHOOK_NOT_CONFIGURED" }, 503);
  const signature = req.headers.get("stripe-signature") || "";
  let event: Stripe.Event;
  try {
    event = await new Stripe(stripeKey, { apiVersion: STRIPE_API_VERSION }).webhooks.constructEventAsync(await req.text(), signature, webhookSecret);
  } catch {
    return response({ ok: false, error: "INVALID_SIGNATURE" }, 400);
  }
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed"].includes(event.type)) {
    return response({ ok: true, ignored: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const product = String(session.metadata?.product_id || "");
  const system = String(session.metadata?.system_id || "");
  const accessKey = String(session.metadata?.access_key || "");
  const expected = PRODUCT_AMOUNTS[product];
  const valid = Boolean(
    session.id
    && expected
    && session.amount_total === expected
    && session.currency === "usd"
    && SYSTEMS.has(system)
    && ((product === "bundle" && system === "all") || (product !== "bundle" && system !== "all"))
    && /^[A-Za-z0-9-]{20,100}$/.test(accessKey)
  );
  if (!valid) return response({ ok: false, error: "INVALID_CHECKOUT_METADATA" }, 400);
  const paid = event.type !== "checkout.session.async_payment_failed" && session.payment_status !== "unpaid";
  const admin = createClient(supabaseUrl, supabaseSecret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: existing, error: readError } = await admin
    .from("report_purchase_entitlements")
    .select("status")
    .eq("checkout_session_id", session.id)
    .maybeSingle();
  if (readError) return response({ ok: false, error: "ENTITLEMENT_READ_FAILED" }, 500);
  if (existing?.status === "paid" && !paid) return response({ ok: true, ignored: "STALE_FAILURE_EVENT" });
  const { error } = await admin.from("report_purchase_entitlements").upsert({
    checkout_session_id: session.id,
    stripe_event_id: event.id,
    access_key: accessKey,
    product_id: product,
    system_id: system === "all" ? null : system,
    amount_cents: expected,
    currency: "usd",
    status: paid ? "paid" : "failed",
    updated_at: new Date().toISOString(),
  }, { onConflict: "checkout_session_id" });
  if (error) return response({ ok: false, error: "ENTITLEMENT_WRITE_FAILED" }, 500);
  return response({ ok: true });
}

Deno.serve(handle);
