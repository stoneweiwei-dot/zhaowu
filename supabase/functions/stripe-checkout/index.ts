// One-time US$9.99 Stripe Checkout. POST = create session, GET ?session_id= = verify it was really paid.
// STRIPE_SECRET_KEY is a Supabase function secret; it never reaches the browser or the repo.
const ORIGIN = "https://stone-zhaowu-official.vercel.app";
const AMOUNT_CENTS = 999;
const PRODUCT_NAME = "昭梧命理 · 深度推演與大師解惑";

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  let allowed = ORIGIN;
  try {
    const u = new URL(origin);
    if (u.origin === ORIGIN || u.hostname === "localhost" || u.hostname === "127.0.0.1") allowed = origin;
  } catch { /* default */ }
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function handle(req: Request, env: { key?: string }, fetchImpl: typeof fetch = fetch): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  const key = env.key;
  if (!key) return json(req, { ok: false, error: { code: "PAYMENT_NOT_CONFIGURED" } }, 503);
  const auth = { Authorization: `Bearer ${key}` };

  if (req.method === "GET") {
    const id = new URL(req.url).searchParams.get("session_id") ?? "";
    if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(id)) return json(req, { ok: false, error: { code: "BAD_SESSION" } }, 400);
    try {
      const r = await fetchImpl(`https://api.stripe.com/v1/checkout/sessions/${id}`, { headers: auth });
      const s = await r.json();
      if (!r.ok) return json(req, { ok: false, error: { code: "STRIPE_ERROR" } }, 502);
      const paid = s.payment_status === "paid" && s.amount_total === AMOUNT_CENTS && s.currency === "usd";
      return json(req, { ok: true, paid, reportId: s.client_reference_id ?? null });
    } catch {
      return json(req, { ok: false, error: { code: "STRIPE_UNREACHABLE" } }, 502);
    }
  }

  if (req.method !== "POST") return json(req, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } }, 405);
  let input: Record<string, unknown> = {};
  try { input = await req.json(); } catch { /* empty body ok */ }
  const reportId = String(input?.reportId ?? "").slice(0, 80).replace(/[^\w-]/g, "");
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(AMOUNT_CENTS),
    "line_items[0][price_data][product_data][name]": PRODUCT_NAME,
    success_url: `${ORIGIN}/account?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${ORIGIN}/account?paid=0`,
  });
  if (reportId) { form.set("client_reference_id", reportId); form.set("metadata[report_id]", reportId); }
  try {
    const r = await fetchImpl("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const data = await r.json();
    if (!r.ok || !data?.url) return json(req, { ok: false, error: { code: "STRIPE_ERROR" } }, 502);
    return json(req, { ok: true, url: data.url, id: data.id });
  } catch {
    return json(req, { ok: false, error: { code: "STRIPE_UNREACHABLE" } }, 502);
  }
}

// deno-lint-ignore no-explicit-any
const D = (globalThis as any).Deno;
if (D?.serve) D.serve((req: Request) => handle(req, { key: D.env.get("STRIPE_SECRET_KEY") }));
