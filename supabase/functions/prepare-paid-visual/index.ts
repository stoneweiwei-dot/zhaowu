import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VISUAL_KIND = "aura_chakra";
const BLUEPRINT_VERSION = "ZW-AURA-SYMBOLIC-1.0";
const MAX_BLUEPRINT_BYTES = 24_000;
const ELIGIBLE_TIERS = new Set(["full"]);
const ELIGIBLE_PAYMENT_STATES = new Set(["paid", "not_required"]);

function allowedOrigin(origin: string | null) {
  if (!origin) return "https://stone-zhaowu-official.vercel.app";
  try {
    const url = new URL(origin);
    if (
      url.hostname === "stone-zhaowu-official.vercel.app" ||
      (url.hostname.startsWith("stone-zhaowu-official-") && url.hostname.endsWith(".vercel.app")) ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1"
    ) return origin;
  } catch { /* fall through */ }
  return "https://stone-zhaowu-official.vercel.app";
}

function cors(req: Request) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(req.headers.get("origin")),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function tokenFrom(req: Request) {
  const authorization = req.headers.get("authorization") ?? "";
  return authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validStringArray(value: unknown, maxItems: number) {
  return Array.isArray(value) && value.length <= maxItems && value.every((item) => typeof item === "string" && item.length <= 120);
}

function validAuraBlueprint(value: unknown): value is Record<string, unknown> {
  if (!isPlainObject(value)) return false;
  if (value.version !== BLUEPRINT_VERSION || value.symbolicOnly !== true) return false;
  if (typeof value.primaryColor !== "string" || value.primaryColor.length > 40) return false;
  if (typeof value.baseColor !== "string" || value.baseColor.length > 40) return false;
  if (!validStringArray(value.secondaryColors, 5)) return false;
  if (value.accentColor != null && (typeof value.accentColor !== "string" || value.accentColor.length > 40)) return false;
  if (!Array.isArray(value.chakraThemes) || value.chakraThemes.length > 7) return false;
  for (const theme of value.chakraThemes) {
    if (!isPlainObject(theme)) return false;
    if (typeof theme.chakra !== "string" || typeof theme.emphasis !== "string" || typeof theme.interpretation !== "string") return false;
    if (theme.interpretation.length > 600) return false;
  }
  for (const key of ["naturalStrength", "likelyDrainPoint", "currentDevelopmentTheme", "missionLine", "disclaimer"]) {
    if (typeof value[key] !== "string" || String(value[key]).length > 1800) return false;
  }
  try {
    return new TextEncoder().encode(JSON.stringify(value)).byteLength <= MAX_BLUEPRINT_BYTES;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { ok: false, error: "METHOD_NOT_ALLOWED" }, 405);

  const token = tokenFrom(req);
  if (!token) return json(req, { ok: false, error: "UNAUTHORIZED" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !anonKey || !serviceKey) return json(req, { ok: false, error: "SUPABASE_ENV_MISSING" }, 500);

  const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  const actor = authData?.user;
  if (authError || !actor?.id) return json(req, { ok: false, error: "UNAUTHORIZED" }, 401);

  let payload: unknown;
  try { payload = await req.json(); }
  catch { return json(req, { ok: false, error: "INVALID_JSON" }, 400); }
  if (!isPlainObject(payload)) return json(req, { ok: false, error: "INVALID_PAYLOAD" }, 400);

  const reportId = String(payload.reportId ?? "").trim();
  const visualKind = String(payload.visualKind ?? VISUAL_KIND).trim();
  const blueprint = payload.blueprint;
  if (!reportId) return json(req, { ok: false, error: "REPORT_ID_REQUIRED" }, 400);
  if (visualKind !== VISUAL_KIND) return json(req, { ok: false, error: "UNSUPPORTED_VISUAL_KIND" }, 400);
  if (!validAuraBlueprint(blueprint)) return json(req, { ok: false, error: "INVALID_BLUEPRINT" }, 400);

  const service = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const [{ data: actorProfile }, { data: report, error: reportError }] = await Promise.all([
    service.from("profiles").select("is_owner").eq("id", actor.id).maybeSingle(),
    service.from("report_requests")
      .select("id,user_id,payment_tier,payment_status,access_mode,engine_snapshot,paid_report")
      .eq("id", reportId)
      .maybeSingle(),
  ]);

  if (reportError || !report) return json(req, { ok: false, error: "REPORT_NOT_FOUND" }, 404);
  const isOwner = actorProfile?.is_owner === true;
  if (!isOwner && report.user_id !== actor.id) return json(req, { ok: false, error: "REPORT_NOT_FOUND" }, 404);

  const tier = String(report.payment_tier ?? "").toLowerCase();
  const paymentState = String(report.payment_status ?? "").toLowerCase();
  const paidGate = ELIGIBLE_TIERS.has(tier) && ELIGIBLE_PAYMENT_STATES.has(paymentState);
  if (!paidGate) {
    return json(req, {
      ok: false,
      error: "PAID_VISUAL_LOCKED",
      status: "locked",
      providerUsed: false,
    }, 402);
  }
  if (!report.engine_snapshot || !report.paid_report) {
    return json(req, { ok: false, error: "REPORT_NOT_READY", status: "locked", providerUsed: false }, 409);
  }

  const ownerUserId = String(report.user_id || actor.id);
  const { data: existing } = await service
    .from("paid_visual_blueprints")
    .select("id,status,result_path,attempts,updated_at")
    .eq("report_id", report.id)
    .eq("visual_kind", visualKind)
    .maybeSingle();

  if (existing?.status === "generating") {
    return json(req, {
      ok: true,
      id: existing.id,
      reportId: report.id,
      visualKind,
      status: "generating",
      resultPath: existing.result_path ?? null,
      attempts: existing.attempts ?? 0,
      providerUsed: false,
      reused: true,
    });
  }

  if (existing?.status === "completed" && existing.result_path) {
    return json(req, {
      ok: true,
      id: existing.id,
      reportId: report.id,
      visualKind,
      status: "completed",
      resultPath: existing.result_path,
      attempts: existing.attempts ?? 0,
      providerUsed: false,
      reused: true,
    });
  }

  const now = new Date().toISOString();
  const row = {
    report_id: report.id,
    user_id: ownerUserId,
    visual_kind: visualKind,
    status: "ready",
    blueprint,
    ready_at: now,
    last_error: null,
  };
  const { data: saved, error: saveError } = await service
    .from("paid_visual_blueprints")
    .upsert(row, { onConflict: "report_id,visual_kind" })
    .select("id,status,result_path,attempts,updated_at")
    .single();

  if (saveError || !saved) return json(req, { ok: false, error: "BLUEPRINT_SAVE_FAILED", providerUsed: false }, 500);

  return json(req, {
    ok: true,
    id: saved.id,
    reportId: report.id,
    visualKind,
    status: saved.status,
    resultPath: saved.result_path ?? null,
    attempts: saved.attempts ?? 0,
    providerUsed: false,
    reused: false,
  });
});
