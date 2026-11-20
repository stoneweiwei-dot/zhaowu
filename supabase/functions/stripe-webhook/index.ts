import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const WEBHOOK_TOKEN_SHA256 = "092ba513b79119e1a8b6340fe041ea4e6111fbff3ee653b0f6a346d5c87b60d0";

const PAYMENT_LINKS = Object.freeze({
  // Current and legacy one-time Payment Links for single-system reports.
  plink_1UP3HWFAzopdCCaxkt9pGy9Z: { product: "system", system: "bazi", amount: 499 },
  plink_1UPlUXFAzopdCCaxV59sdJfq: { product: "system", system: "bazi", amount: 990 },
  // 2026-10-19 current fixed-local links.
  plink_1USFDVFAzopdCCaxPfQyQj5c: { product: "system", system: "bazi", amount: 1690, amounts: { usd: 1690, aud: 2490, cny: 10800 } },
  plink_1USFDLFAzopdCCaxvBb5LiS3: { product: "system", system: "ziwei", amount: 1690, amounts: { usd: 1690, aud: 2490, cny: 10800 } },
  // Immediately previous USD links remain registered for already-open checkout recovery.
  plink_1URIwkFAzopdCCax8ZVKkNPH: { product: "system", system: "bazi", amount: 1999 },
  plink_1URIxFFAzopdCCaxRrt9wTyH: { product: "system", system: "ziwei", amount: 1999 },
  // 2026-10-11 repriced public links; legacy links remain accepted for already-open checkouts.
  plink_1UP3ogFAzopdCCaxRqhS5z8P: { product: "system", system: "ziwei", amount: 990 },
  plink_1UP3oiFAzopdCCaxM1vyKYB4: { product: "system", system: "qizheng", amount: 990, amounts: { usd: 990, aud: 1490, cny: 6800 } },
  plink_1UP3okFAzopdCCaxZRHjxXQj: { product: "system", system: "western", amount: 990, amounts: { usd: 990, aud: 1490, cny: 6800 } },
  plink_1UP3omFAzopdCCaxhAkQByg2: { product: "system", system: "indian", amount: 990, amounts: { usd: 990, aud: 1490, cny: 6800 } },
  plink_1UP3ooFAzopdCCaxurLK18pw: { product: "system", system: "palm", amount: 990, amounts: { usd: 990, aud: 1490, cny: 6800 } },
  plink_1UP3oqFAzopdCCaxqwVUMqQZ: { product: "system", system: "numerology", amount: 990, amounts: { usd: 990, aud: 1490, cny: 6800 } },
  plink_1UNco8FAzopdCCaxNMJ9EbUo: { product: "system", system: "ziwei", amount: 499 },
  plink_1UNcoFFAzopdCCaxZFDm86Ni: { product: "system", system: "qizheng", amount: 499 },
  plink_1UNcoMFAzopdCCax4OxJPpiR: { product: "system", system: "western", amount: 499 },
  plink_1UNcoYFAzopdCCaxtjG131VI: { product: "system", system: "indian", amount: 499 },
  plink_1UNcohFAzopdCCaxHJvn5hZv: { product: "system", system: "palm", amount: 499 },
  plink_1UNcooFAzopdCCaxtCLspxXX: { product: "system", system: "numerology", amount: 499 },
} as const);

type PaymentLinkId = keyof typeof PAYMENT_LINKS;

type PaymentDefinition = {
  system: string;
  amount: number;
  amounts?: Partial<Record<string, number | readonly number[]>>;
};

function expectedAmounts(definition: PaymentDefinition | undefined, currency: string): readonly number[] {
  if (!definition) return [];
  const configured = definition.amounts?.[currency] ?? (currency === "usd" ? definition.amount : undefined);
  if (configured === undefined) return [];
  return Array.isArray(configured) ? configured : [configured];
}

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
  const definition = PAYMENT_LINKS[linkId] as PaymentDefinition | undefined;
  const accessKey = String(session.client_reference_id || "").trim();
  const currency = String(session.currency || "").toLowerCase();
  const allowedAmounts = expectedAmounts(definition, currency);
  const amount = Number(session.amount_total);

  if (
    !/^cs_live_[A-Za-z0-9]{10,200}$/.test(sessionId)
    || !definition
    || !/^[A-Za-z0-9-]{20,100}$/.test(accessKey)
    || !Number.isInteger(amount)
    || !allowedAmounts.includes(amount)
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
    system_id: definition.system,
    amount_cents: amount,
    currency,
    status: nextStatus,
    updated_at: new Date().toISOString(),
  }, { onConflict: "checkout_session_id" });

  if (error) return response({ ok: false, error: "ENTITLEMENT_WRITE_FAILED" }, 500);
  return response({ ok: true, status: nextStatus });
}

Deno.serve(handle);
