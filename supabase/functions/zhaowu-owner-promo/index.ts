import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { authorizeBridgeHeaders } from "./auth.mjs";
import { normalizeCreate, normalizeUpdate, toPublicRow } from "./logic.mjs";

// Owner 2026-10-17: owner-only console for the existing report-paywall promo codes.
// Isolated from stripe-* / report_purchase_entitlements and from the customer-facing `promo-code`
// function: it only reads/writes public.promo_codes (RLS on, service-role only) and never records an
// amount, so it cannot touch payment or revenue reporting. It cannot delete codes or redemptions.

type Runtime = { supabaseUrl?: string; supabaseSecretKey?: string; bridgeSecret?: string };

function runtimeFromDeno(): Runtime {
  const env = (globalThis as { Deno?: { env: { get(name: string): string | undefined } } }).Deno?.env;
  const jsonKey = (name: string, key = "default") => {
    try { return JSON.parse(env?.get(name) || "{}")[key] as string | undefined; } catch { return undefined; }
  };
  return {
    supabaseUrl: env?.get("SUPABASE_URL"),
    supabaseSecretKey: jsonKey("SUPABASE_SECRET_KEYS") || env?.get("SUPABASE_SERVICE_ROLE_KEY"),
    bridgeSecret: env?.get("ZHAOWU_OWNER_BRIDGE_SECRET"),
  };
}

const ALLOWED_ACTIONS = new Set(["promo.list", "promo.create", "promo.update", "promo.setActive"]);
const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

function randomBytes(length: number) {
  return crypto.getRandomValues(new Uint8Array(length));
}

export async function handle(req: Request, env: Runtime = runtimeFromDeno()): Promise<Response> {
  if (req.method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
  const auth = authorizeBridgeHeaders(req.headers, env.bridgeSecret ?? "");
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

  const payload = await req.json().catch(() => null) as Record<string, unknown> | null;
  const action = String(payload?.action ?? "").trim();
  if (!payload || !ALLOWED_ACTIONS.has(action)) return json({ ok: false, error: "ACTION_NOT_ALLOWED" }, 400);
  if (!env.supabaseUrl || !env.supabaseSecretKey) return json({ ok: false, error: "PROMO_STORE_NOT_CONFIGURED" }, 503);
  const admin = createClient(env.supabaseUrl, env.supabaseSecretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const now = new Date();

  if (action === "promo.list") {
    const { data, error } = await admin.from("promo_codes").select("*").order("created_at", { ascending: false }).limit(300);
    if (error) return json({ ok: false, error: "PROMO_STORE_ERROR" }, 502);
    return json({ ok: true, codes: (data ?? []).map((row) => toPublicRow(row, now)) });
  }

  if (action === "promo.create") {
    const parsed = normalizeCreate(payload, { now, randomBytes });
    if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);
    // The customer-facing lookup is case-insensitive (ilike), so uniqueness must be too.
    const { data: clash, error: clashError } = await admin.from("promo_codes").select("id").ilike("code", parsed.value.code).limit(1);
    if (clashError) return json({ ok: false, error: "PROMO_STORE_ERROR" }, 502);
    if (clash?.length) return json({ ok: false, error: "CODE_ALREADY_EXISTS" }, 409);
    const { data, error } = await admin.from("promo_codes").insert(parsed.value).select("*").single();
    if (error) return json({ ok: false, error: error.code === "23505" ? "CODE_ALREADY_EXISTS" : "PROMO_STORE_ERROR" }, error.code === "23505" ? 409 : 502);
    return json({ ok: true, code: toPublicRow(data, now) });
  }

  // promo.update / promo.setActive
  const id = String(payload.id ?? "");
  if (!UUID.test(id)) return json({ ok: false, error: "BAD_ID" }, 400);
  const { data: current, error: readError } = await admin.from("promo_codes").select("*").eq("id", id).maybeSingle();
  if (readError) return json({ ok: false, error: "PROMO_STORE_ERROR" }, 502);
  if (!current) return json({ ok: false, error: "PROMO_NOT_FOUND" }, 404);

  const input = action === "promo.setActive" ? { active: payload.active } : {
    ...("maxRedemptions" in payload ? { maxRedemptions: payload.maxRedemptions } : {}),
    ...("expiresAt" in payload ? { expiresAt: payload.expiresAt } : {}),
    ...("note" in payload ? { note: payload.note } : {}),
    ...("active" in payload ? { active: payload.active } : {}),
  };
  const patch = normalizeUpdate(input, current, { now });
  if (!patch.ok) return json({ ok: false, error: patch.error }, 400);

  let query = admin.from("promo_codes").update(patch.value).eq("id", id);
  // Guard against a redemption landing between the read above and this write.
  if (typeof patch.value.max_redemptions === "number") query = query.lte("redeemed_count", patch.value.max_redemptions);
  const { data: updated, error } = await query.select("*");
  if (error) return json({ ok: false, error: "PROMO_STORE_ERROR" }, 502);
  if (!updated?.length) return json({ ok: false, error: "MAX_BELOW_REDEEMED" }, 409);
  return json({ ok: true, code: toPublicRow(updated[0], now) });
}

const D = (globalThis as { Deno?: { serve(handler: (req: Request) => Response | Promise<Response>): void } }).Deno;
if (D?.serve) D.serve((req: Request) => handle(req).catch(() => json({ ok: false, error: "OWNER_PROMO_FAILED" }, 500)));
