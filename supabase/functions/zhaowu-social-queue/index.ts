import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Server-to-server gateway for the owner auto-publishing tables.
 *
 * Auth: ONLY a dedicated server secret (Vercel ZHAOWU_SOCIAL_QUEUE_SECRET, header x-zhaowu-queue-secret,
 * checked against the SHA-256 in public.social_queue_gateway). Fails closed when no hash is stored.
 * There is deliberately no owner-password path here: the daily cron has no owner session, and every
 * owner-facing action is already gated by the owner cookie in /api/owner-session before it reaches this
 * function. Deployed with verify_jwt=false (same as zhaowu-owner-data).
 */

const SETTINGS_SELECT = "id,enabled,publish_days,channels,attach_image,paused_reason,updated_at";
const QUEUE_SELECT = "id,status,source,bank_key,body,image_url,alt_text,channels,not_before,slot_date,results,attempts,last_error,published_at,created_at,updated_at";
const THREADS_SELECT = "id,threads_user_id,username,access_token_ciphertext,token_expires_at";
const CHANNELS = new Set(["threads", "instagram", "xiaohongshu", "facebook", "x"]);
const EDITABLE = new Set(["draft", "scheduled", "failed", "manual", "skipped"]);
const STALE_PUBLISHING_MS = 15 * 60 * 1000;

const ALLOWED = new Set([
  "settings.get", "settings.set",
  "queue.list", "queue.create", "queue.update", "queue.delete",
  "queue.nextOwner", "queue.recentBankKeys",
  "run.claim", "run.finish",
  "accounts.list",
]);

function text(value: unknown) { return String(value ?? "").trim(); }

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

// The shared secret lives in Vercel (ZHAOWU_SOCIAL_QUEUE_SECRET); only its SHA-256 is stored in
// public.social_queue_gateway, so no Supabase dashboard secret is needed and a DB read never reveals it.
async function bridgeAuthorized(request: Request, db: ReturnType<typeof createClient>) {
  const version = text(request.headers.get("x-zhaowu-server-bridge"));
  if (version !== "r163") return { ok: false, status: 403, error: "BRIDGE_REQUIRED" };
  const actual = text(request.headers.get("x-zhaowu-queue-secret"));
  if (actual.length < 32 || actual.length > 256) return { ok: false, status: 401, error: "BRIDGE_UNAUTHORIZED" };
  const { data } = await db.from("social_queue_gateway").select("secret_sha256").eq("id", 1).maybeSingle();
  const expected = text(data?.secret_sha256);
  if (!/^[0-9a-f]{64}$/.test(expected)) return { ok: false, status: 503, error: "BRIDGE_NOT_CONFIGURED" };
  const provided = await sha256Hex(actual);
  let diff = 0;
  for (let i = 0; i < 64; i += 1) diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? { ok: true as const } : { ok: false, status: 401, error: "BRIDGE_UNAUTHORIZED" };
}

function cleanChannels(value: unknown, fallback: string[] = ["threads"]) {
  const list = Array.isArray(value) ? value.map(text).filter((item) => CHANNELS.has(item)) : [];
  const unique = [...new Set(list)];
  return unique.length ? unique : fallback;
}

function cleanDays(value: unknown) {
  const days = Array.isArray(value) ? value.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6) : [];
  const unique = [...new Set(days)].sort((a, b) => a - b);
  if (unique.length < 1 || unique.length > 3) throw new Error("PUBLISH_DAYS_1_TO_3");
  return unique;
}

function cleanImageUrl(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error("INVALID_IMAGE_URL"); }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("INVALID_IMAGE_URL");
  return url.toString();
}

function cleanBody(value: unknown) {
  const body = text(value);
  if (!body) throw new Error("BODY_REQUIRED");
  if ([...body].length > 2200) throw new Error("BODY_TOO_LONG");
  return body;
}

function cleanUuid(value: unknown) {
  const id = text(value);
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("INVALID_ID");
  return id;
}

function cleanDate(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error("INVALID_DATE");
  return raw;
}

function cleanTimestamp(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) throw new Error("INVALID_TIMESTAMP");
  return parsed.toISOString();
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return json(405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  const supabaseUrl = text(Deno.env.get("SUPABASE_URL"));
  const serviceKey = text(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  if (!supabaseUrl || !serviceKey) return json(503, { ok: false, error: "SERVICE_NOT_CONFIGURED" });
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const auth = await bridgeAuthorized(request, db);
  if (!auth.ok) return json(auth.status, { ok: false, error: auth.error });

  let payload: Record<string, unknown>;
  try { payload = await request.json(); } catch { return json(400, { ok: false, error: "INVALID_JSON" }); }
  const action = text(payload?.action);
  if (!ALLOWED.has(action)) return json(400, { ok: false, error: "ACTION_NOT_ALLOWED" });

  try {
    if (action === "settings.get") {
      const { data, error } = await db.from("social_autopublish_settings").select(SETTINGS_SELECT).eq("id", 1).maybeSingle();
      if (error) throw error;
      return json(200, { ok: true, settings: data });
    }

    if (action === "settings.set") {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (typeof payload.enabled === "boolean") patch.enabled = payload.enabled;
      if (payload.publishDays !== undefined) patch.publish_days = cleanDays(payload.publishDays);
      if (payload.channels !== undefined) patch.channels = cleanChannels(payload.channels);
      if (typeof payload.attachImage === "boolean") patch.attach_image = payload.attachImage;
      if (payload.pausedReason !== undefined) patch.paused_reason = text(payload.pausedReason).slice(0, 300) || null;
      const { data, error } = await db.from("social_autopublish_settings").update(patch).eq("id", 1).select(SETTINGS_SELECT).single();
      if (error) throw error;
      return json(200, { ok: true, settings: data });
    }

    if (action === "queue.list") {
      const limit = Math.max(1, Math.min(100, Number(payload.limit) || 40));
      const { data, error } = await db.from("social_post_queue").select(QUEUE_SELECT).order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      return json(200, { ok: true, items: data ?? [] });
    }

    if (action === "queue.create") {
      const status = text(payload.status) === "draft" ? "draft" : "scheduled";
      const row = {
        status,
        source: "owner",
        body: cleanBody(payload.body),
        image_url: cleanImageUrl(payload.imageUrl),
        alt_text: text(payload.altText).slice(0, 1000) || null,
        channels: cleanChannels(payload.channels),
        not_before: cleanTimestamp(payload.notBefore),
      };
      const { data, error } = await db.from("social_post_queue").insert(row).select(QUEUE_SELECT).single();
      if (error) throw error;
      return json(200, { ok: true, item: data });
    }

    if (action === "queue.update") {
      const id = cleanUuid(payload.id);
      const { data: current, error: readError } = await db.from("social_post_queue").select("id,status").eq("id", id).maybeSingle();
      if (readError) throw readError;
      if (!current) return json(404, { ok: false, error: "NOT_FOUND" });
      if (!EDITABLE.has(current.status)) return json(409, { ok: false, error: "NOT_EDITABLE" });
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (payload.body !== undefined) patch.body = cleanBody(payload.body);
      if (payload.imageUrl !== undefined) patch.image_url = cleanImageUrl(payload.imageUrl);
      if (payload.altText !== undefined) patch.alt_text = text(payload.altText).slice(0, 1000) || null;
      if (payload.channels !== undefined) patch.channels = cleanChannels(payload.channels);
      if (payload.notBefore !== undefined) patch.not_before = cleanTimestamp(payload.notBefore);
      if (payload.status !== undefined) {
        const next = text(payload.status);
        if (!["draft", "scheduled", "skipped", "manual"].includes(next)) throw new Error("INVALID_STATUS");
        patch.status = next;
      }
      const { data, error } = await db.from("social_post_queue").update(patch).eq("id", id).select(QUEUE_SELECT).single();
      if (error) throw error;
      return json(200, { ok: true, item: data });
    }

    if (action === "queue.delete") {
      const id = cleanUuid(payload.id);
      const { error } = await db.from("social_post_queue").delete().eq("id", id).neq("status", "publishing");
      if (error) throw error;
      return json(200, { ok: true });
    }

    if (action === "queue.nextOwner") {
      const nowIso = new Date().toISOString();
      const { data, error } = await db.from("social_post_queue").select(QUEUE_SELECT)
        .eq("status", "scheduled").eq("source", "owner")
        .or(`not_before.is.null,not_before.lte.${nowIso}`)
        .order("created_at", { ascending: true }).limit(1);
      if (error) throw error;
      return json(200, { ok: true, item: data?.[0] ?? null });
    }

    if (action === "queue.recentBankKeys") {
      const { data, error } = await db.from("social_post_queue").select("bank_key,created_at")
        .eq("source", "bank").not("bank_key", "is", null).order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return json(200, { ok: true, keys: (data ?? []).map((row) => row.bank_key) });
    }

    if (action === "run.claim") {
      // Recover rows stuck in `publishing` (function timeout / crash) so they cannot block the day forever.
      const staleBefore = new Date(Date.now() - STALE_PUBLISHING_MS).toISOString();
      await db.from("social_post_queue")
        .update({ status: "failed", last_error: "STALE_PUBLISHING", updated_at: new Date().toISOString() })
        .eq("status", "publishing").lt("updated_at", staleBefore);

      const slotDate = cleanDate(payload.slotDate);
      const claim = {
        status: "publishing",
        slot_date: slotDate,
        attempts: 1,
        updated_at: new Date().toISOString(),
      };
      let query;
      const queueId = text(payload.queueId);
      if (queueId) {
        const id = cleanUuid(queueId);
        const { data: current } = await db.from("social_post_queue").select("id,status,attempts").eq("id", id).maybeSingle();
        if (!current) return json(404, { ok: false, error: "NOT_FOUND" });
        if (!["scheduled", "draft", "failed", "manual"].includes(current.status)) return json(409, { ok: false, error: "NOT_CLAIMABLE" });
        query = db.from("social_post_queue").update({ ...claim, attempts: Number(current.attempts || 0) + 1 }).eq("id", id).select(QUEUE_SELECT).single();
      } else {
        query = db.from("social_post_queue").insert({
          ...claim,
          source: text(payload.source) === "bank" ? "bank" : "owner",
          bank_key: text(payload.bankKey) || null,
          body: cleanBody(payload.body),
          image_url: cleanImageUrl(payload.imageUrl),
          alt_text: text(payload.altText).slice(0, 1000) || null,
          channels: cleanChannels(payload.channels),
        }).select(QUEUE_SELECT).single();
      }
      const { data, error } = await query;
      if (error) {
        if ((error as { code?: string }).code === "23505") return json(200, { ok: true, claimed: false, reason: "ALREADY_RAN_TODAY" });
        throw error;
      }
      return json(200, { ok: true, claimed: true, item: data });
    }

    if (action === "run.finish") {
      const id = cleanUuid(payload.id);
      const status = text(payload.status);
      if (!["published", "partial", "failed", "manual"].includes(status)) throw new Error("INVALID_STATUS");
      const patch: Record<string, unknown> = {
        status,
        results: payload.results && typeof payload.results === "object" ? payload.results : {},
        last_error: text(payload.lastError).slice(0, 500) || null,
        updated_at: new Date().toISOString(),
      };
      if (status === "published" || status === "partial") patch.published_at = new Date().toISOString();
      const { data, error } = await db.from("social_post_queue").update(patch).eq("id", id).select(QUEUE_SELECT).single();
      if (error) throw error;
      return json(200, { ok: true, item: data });
    }

    if (action === "accounts.list") {
      const { data, error } = await db.from("social_threads_accounts").select(THREADS_SELECT).order("connected_at", { ascending: true });
      if (error) throw error;
      return json(200, { ok: true, items: data ?? [] });
    }

    return json(400, { ok: false, error: "ACTION_NOT_ALLOWED" });
  } catch (error) {
    const message = error instanceof Error ? error.message : (error as { message?: string })?.message || "UNKNOWN";
    const known = /^(PUBLISH_DAYS_1_TO_3|INVALID_[A-Z_]+|BODY_REQUIRED|BODY_TOO_LONG)$/.test(message);
    return json(known ? 400 : 500, { ok: false, error: known ? message : "QUEUE_FAILED" });
  }
});
