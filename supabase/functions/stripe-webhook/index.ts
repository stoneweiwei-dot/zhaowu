import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const WEBHOOK_TOKEN_SHA256 = "092ba513b79119e1a8b6340fe041ea4e6111fbff3ee653b0f6a346d5c87b60d0";

const PAYMENT_LINKS = Object.freeze({
  // BaZi standalone: USD 4.99; the six-system bundle does not include BaZi.
  plink_1UP3HWFAzopdCCaxkt9pGy9Z: { product: "system", system: "bazi", amount: 499 },
  plink_1UNco6FAzopdCCaxsi61vVPn: { product: "quick", system: "ziwei", amount: 199 },
  plink_1UNco8FAzopdCCaxNMJ9EbUo: { product: "system", system: "ziwei", amount: 499 },
  plink_1UNcoBFAzopdCCaxggjB7RO8: { product: "bundle", system: "ziwei", amount: 999 },
  plink_1UNcoDFAzopdCCaxhPNKhhss: { product: "quick", system: "qizheng", amount: 199 },
  plink_1UNcoFFAzopdCCaxZFDm86Ni: { product: "system", system: "qizheng", amount: 499 },
  plink_1UNcoHFAzopdCCaxDfyMBkKr: { product: "bundle", system: "qizheng", amount: 999 },
  plink_1UNcoKFAzopdCCaxkWNiYhcm: { product: "quick", system: "western", amount: 199 },
  plink_1UNcoMFAzopdCCax4OxJPpiR: { product: "system", system: "western", amount: 499 },
  plink_1UNcoOFAzopdCCaxKFsZ2XCL: { product: "bundle", system: "western", amount: 999 },
  plink_1UNcoWFAzopdCCaxdUVzgf4c: { product: "quick", system: "indian", amount: 199 },
  plink_1UNcoYFAzopdCCaxtjG131VI: { product: "system", system: "indian", amount: 499 },
  plink_1UNcobFAzopdCCaxGGEWgLs3: { product: "bundle", system: "indian", amount: 999 },
  plink_1UNcodFAzopdCCaxNxe5Rr0Z: { product: "quick", system: "palm", amount: 199 },
  plink_1UNcohFAzopdCCaxHJvn5hZv: { product: "system", system: "palm", amount: 499 },
  plink_1UNcojFAzopdCCaxIb9qCjoO: { product: "bundle", system: "palm", amount: 999 },
  plink_1UNcolFAzopdCCax8WIpJfZE: { product: "quick", system: "numerology", amount: 199 },
  plink_1UNcooFAzopdCCaxtCLspxXX: { product: "system", system: "numerology", amount: 499 },
  plink_1UNcoqFAzopdCCaxVhnaiQCZ: { product: "bundle", system: "numerology", amount: 999 },
} as const);

type PaymentLinkId = keyof typeof PAYMENT_LINKS;

function secretFromJson(name: string) {
  try { return JSON.parse(Deno.env.get(name) || "{}").default as string | undefined; } catch { return undefined; }
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function paymentLinkId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) return String((value as { id?: unknown }).id ?? "");
  return "";
}

export async function handle(req: Request) {
  if (req.method !== "POST") return response({ ok: false }, 405);

  const token = new URL(req.url).searchParams.get("key") || "";
  const tokenHash = token ? await sha256Hex(token) : "";
  if (!tokenHash || !safeEqual(tokenHash, WEBHOOK_TOKEN_SHA256)) {
    return response({ ok: false, error: "INVALID_WEBHOOK_TOKEN" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseSecret = secretFromJson("SUPABASE_SECRET_KEYS") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !supabaseSecret) return response({ ok: false, error: "PAYMENT_STORE_NOT_CONFIGURED" }, 503);

  let event: Record<string, any>;
  try { event = await req.json(); } catch { return response({ ok: false, error: "INVALID_JSON" }, 400); }

  const eventType = String(event.type || "");
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed"].includes(eventType)) {
    return response({ ok: true, ignored: true });
  }
  if (event.livemode !== true || !/^evt_[A-Za-z0-9_]+$/.test(String(event.id || ""))) {
    return response({ ok: false, error: "INVALID_LIVE_EVENT" }, 400);
  }

  const session = event.data?.object ?? {};
  const sessionId = String(session.id || "");
  const linkId = paymentLinkId(session.payment_link) as PaymentLinkId;
  const definition = PAYMENT_LINKS[linkId];
  const accessKey = String(session.client_reference_id || "").trim();

  if (
    !/^cs_live_[A-Za-z0-9]{10,200}$/.test(sessionId)
    || !definition
    || !/^[A-Za-z0-9-]{20,100}$/.test(accessKey)
    || session.amount_total !== definition.amount
    || String(session.currency || "").toLowerCase() !== "usd"
  ) {
    return response({ ok: false, error: "INVALID_CHECKOUT_SESSION" }, 400);
  }

  const paid = eventType === "checkout.session.async_payment_succeeded"
    || (eventType === "checkout.session.completed" && session.payment_status === "paid");
  const failed = eventType === "checkout.session.async_payment_failed";
  const nextStatus = paid ? "paid" : failed ? "failed" : "pending";

  const admin = createClient(supabaseUrl, supabaseSecret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: existing, error: readError } = await admin
    .from("report_purchase_entitlements")
    .select("status")
    .eq("checkout_session_id", sessionId)
    .maybeSingle();
  if (readError) return response({ ok: false, error: "ENTITLEMENT_READ_FAILED" }, 500);
  if (existing?.status === "paid" && nextStatus !== "paid") return response({ ok: true, ignored: "STALE_NONPAID_EVENT" });

  const { error } = await admin.from("report_purchase_entitlements").upsert({
    checkout_session_id: sessionId,
    stripe_event_id: String(event.id),
    access_key: accessKey,
    product_id: definition.product,
    system_id: definition.product === "bundle" ? null : definition.system,
    amount_cents: definition.amount,
    currency: "usd",
    status: nextStatus,
    updated_at: new Date().toISOString(),
  }, { onConflict: "checkout_session_id" });

  if (error) return response({ ok: false, error: "ENTITLEMENT_WRITE_FAILED" }, 500);
  return response({ ok: true, status: nextStatus });
}

Deno.serve(handle);
