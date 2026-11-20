import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const REPORT_BUCKET = "zhaowu-report-images";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);

  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return json({ ok: false, error: "UNAUTHORIZED" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ ok: false, error: "SUPABASE_ENV_MISSING" }, 500);

  let payload: { reportId?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "INVALID_JSON" }, 400);
  }

  const reportId = String(payload?.reportId ?? "").trim();
  if (!reportId) return json({ ok: false, error: "REPORT_ID_REQUIRED" }, 400);

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  const actor = authData?.user;
  if (authError || !actor?.id) return json({ ok: false, error: "UNAUTHORIZED" }, 401);

  const service = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [{ data: profile }, { data: report, error: reportError }] = await Promise.all([
    service.from("profiles").select("is_owner").eq("id", actor.id).maybeSingle(),
    service.from("report_requests").select("id,user_id,image_path,visual_profile").eq("id", reportId).maybeSingle(),
  ]);

  if (reportError || !report) return json({ ok: false, error: "REPORT_NOT_FOUND" }, 404);
  const isOwner = profile?.is_owner === true;
  if (!isOwner && report.user_id !== actor.id) return json({ ok: false, error: "REPORT_NOT_FOUND" }, 404);

  const visualProfile = report.visual_profile && typeof report.visual_profile === "object"
    ? report.visual_profile as Record<string, unknown>
    : {};
  const galleryReferenceAssetId = String(visualProfile.galleryReferenceAssetId ?? "").trim() || null;
  const imagePath = String(report.image_path ?? "").trim();
  if (!imagePath) {
    return json({
      ok: true,
      imagePath: null,
      signedUrl: null,
      reused: false,
      missing: true,
      galleryReferenceAssetId,
    });
  }

  const { data: signed, error: signError } = await service.storage
    .from(REPORT_BUCKET)
    .createSignedUrl(imagePath, 3600);
  if (signError || !signed?.signedUrl) return json({ ok: false, error: "IMAGE_LOAD_FAILED" }, 502);

  return json({
    ok: true,
    imagePath,
    signedUrl: signed.signedUrl,
    reused: true,
    missing: false,
    galleryReferenceAssetId,
  });
});
