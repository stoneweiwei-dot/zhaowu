import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://zhao-wu.com", "https://www.zhao-wu.com", "https://zhaowu.pages.dev",
]);
const hits = new Map<string, { count: number; resetAt: number }>();

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const preview = /^https:\/\/[a-z0-9-]+\.zhaowu\.pages\.dev$/.test(origin);
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) || preview ? origin : "https://zhaowu.pages.dev",
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function reply(req: Request, value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
function valid(payload: Record<string, unknown>) {
  const allowed = new Set(["birthDateTime", "gender", "birthplace", "trueSolarTime", "summary", "language", "snapshot"]);
  if (Object.keys(payload).some((key) => !allowed.has(key)) || Object.keys(payload).length !== allowed.size) return false;
  if (typeof payload.birthDateTime !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/.test(payload.birthDateTime)) return false;
  const d = new Date(`${payload.birthDateTime}Z`);
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 16) !== payload.birthDateTime.slice(0, 16)) return false;
  if (!["male", "female", "unspecified"].includes(String(payload.gender))) return false;
  if (typeof payload.birthplace !== "string" || !payload.birthplace.trim() || payload.birthplace.length > 160) return false;
  if (payload.trueSolarTime !== null && (typeof payload.trueSolarTime !== "string" || payload.trueSolarTime.length > 40)) return false;
  if (typeof payload.summary !== "string" || !payload.summary.trim() || payload.summary.length > 500) return false;
  if (!["zh-Hant", "zh-Hans", "en"].includes(String(payload.language))) return false;
  const snapshot = payload.snapshot;
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot) || JSON.stringify(snapshot).length > 500_000) return false;
  const result = snapshot as Record<string, unknown>;
  const chart = result.chart as Record<string, unknown> | undefined;
  const pillars = chart?.pillars;
  return Array.isArray(pillars) && pillars.length === 4 && typeof result.id === "string";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return reply(req, { error: "METHOD_NOT_ALLOWED" }, 405);
  const length = Number(req.headers.get("content-length") ?? "0");
  if (length > 550_000) return reply(req, { error: "PAYLOAD_TOO_LARGE" }, 413);
  const ip = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").slice(0, 80);
  const now = Date.now();
  for (const [key, value] of hits) if (value.resetAt <= now) hits.delete(key);
  const bucket = hits.get(ip);
  if (bucket && bucket.count >= 12) return reply(req, { error: "RATE_LIMITED" }, 429);
  hits.set(ip, bucket ? { ...bucket, count: bucket.count + 1 } : { count: 1, resetAt: now + 60_000 });

  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return reply(req, { error: "INVALID_JSON" }, 400); }
  if (!payload || typeof payload !== "object" || !valid(payload)) return reply(req, { error: "INVALID_PAYLOAD" }, 400);
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return reply(req, { error: "SERVER_NOT_CONFIGURED" }, 503);
  const service = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await service.from("visitor_charts").insert({
    birth_datetime: payload.birthDateTime,
    gender: payload.gender,
    birthplace: payload.birthplace,
    true_solar_time: payload.trueSolarTime,
    chart_summary: payload.summary,
    language: payload.language,
    chart_snapshot: payload.snapshot,
  });
  if (error) return reply(req, { error: "SAVE_FAILED" }, 502);
  return reply(req, { ok: true }, 201);
});
