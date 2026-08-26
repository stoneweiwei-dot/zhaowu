import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const BUCKET = "zhaowu-gallery";

function fail(status: number, error: string) {
  return new Response(JSON.stringify({ ok: false, error }), { status, headers: jsonHeaders });
}

function clean(value: string, fallback: string, max = 120) {
  const normalized = value.trim().toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max);
  return normalized || fallback;
}

function decodeBase64(input: string) {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "GET" && req.method !== "POST") return fail(405, "method_not_allowed");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return fail(500, "server_not_configured");
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const url = new URL(req.url);
  let id = url.searchParams.get("id") ?? "";
  let token = url.searchParams.get("token") ?? "";
  let cleanup = url.searchParams.get("cleanup") === "1";
  let queue: any = null;
  let claimed = false;

  if (req.method === "POST") {
    try {
      const body = await req.json();
      id = typeof body?.id === "string" ? body.id : id;
      token = typeof body?.token === "string" ? body.token : token;
      cleanup = body?.cleanup === true || cleanup;
    } catch {
      return fail(400, "invalid_json");
    }
  }

  if (!id && !token) {
    const { data, error } = await admin.rpc("claim_gallery_ingest_queue");
    if (error) return fail(500, "queue_claim_failed");
    queue = Array.isArray(data) ? data[0] : null;
    claimed = true;
    if (!queue) return new Response(JSON.stringify({ ok: true, empty: true }), { headers: jsonHeaders });
  } else {
    if (!/^[0-9a-f-]{36}$/i.test(id) || token.length < 24) return fail(400, "invalid_request");
    const { data, error } = await admin
      .from("gallery_ingest_queue")
      .select("id,token,category,asset_key,title,content_type,file_ext,tags,is_primary,base64_data,expires_at")
      .eq("id", id)
      .eq("token", token)
      .maybeSingle();
    if (error) return fail(500, "queue_read_failed");
    if (!data) return fail(404, "queue_item_not_found");
    if (new Date(data.expires_at).getTime() < Date.now()) {
      await admin.from("gallery_ingest_queue").delete().eq("id", id);
      return fail(410, "queue_item_expired");
    }
    queue = data;
  }

  let bytes: Uint8Array;
  try { bytes = decodeBase64(queue.base64_data); }
  catch { return fail(400, "invalid_base64"); }
  if (!bytes.byteLength || bytes.byteLength > 10 * 1024 * 1024) return fail(413, "image_too_large");

  const category = clean(queue.category, "uncategorized", 100);
  const assetKey = clean(queue.asset_key, crypto.randomUUID(), 120);
  const ext = ["jpg", "jpeg", "png", "webp", "avif"].includes(queue.file_ext) ? queue.file_ext : "webp";
  const path = `${category}/${assetKey}/${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: queue.content_type,
    upsert: false,
    cacheControl: "31536000",
  });
  if (uploadError) return fail(500, `storage_upload_failed:${uploadError.message}`);

  let insertedId: string | null = null;
  try {
    if (queue.is_primary) {
      const { error: clearError } = await admin
        .from("gallery_assets")
        .update({ is_primary: false, updated_at: new Date().toISOString() })
        .eq("category", category)
        .eq("asset_key", assetKey)
        .eq("is_primary", true);
      if (clearError) throw clearError;
    }

    const { data: inserted, error: insertError } = await admin
      .from("gallery_assets")
      .insert({
        category,
        asset_key: assetKey,
        title: String(queue.title || assetKey).slice(0, 180),
        storage_path: path,
        content_type: queue.content_type,
        tags: Array.isArray(queue.tags) ? queue.tags.slice(0, 20) : [],
        enabled: true,
        is_primary: Boolean(queue.is_primary),
        bucket_id: BUCKET,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;
    insertedId = inserted.id;

    if (!claimed) await admin.from("gallery_ingest_queue").delete().eq("id", queue.id);

    if (cleanup) {
      await admin.storage.from(BUCKET).remove([path]);
      await admin.from("gallery_assets").delete().eq("id", insertedId);
    }

    return new Response(JSON.stringify({ ok: true, asset_id: insertedId, bucket: BUCKET, path, bytes: bytes.byteLength, cleanup, claimed }), { headers: jsonHeaders });
  } catch (error) {
    await admin.storage.from(BUCKET).remove([path]);
    return fail(500, `gallery_insert_failed:${error instanceof Error ? error.message : "unknown"}`);
  }
});
