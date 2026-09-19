import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  assertUploadTicketBinding,
  authorizeBridgeHeaders,
  createUploadTicket,
  validateUploadedObject,
  verifyUploadTicket,
} from "./security.mjs";

const BACKGROUND_BUCKET = "zhaowu-backgrounds";
const GALLERY_BUCKET = "zhaowu-gallery";
const REPORT_BUCKET = "zhaowu-report-images";
const BACKGROUND_SELECT = "id,source,name,storage_path,content_type,enabled,days_of_week,start_date,end_date,theme,created_at,updated_at";
const GALLERY_SELECT = "id,category,asset_key,title,storage_path,bucket_id,content_type,tags,enabled,is_primary,created_at,updated_at";
const REPORT_LIST_SELECT = "id,user_email,alias,record_kind,status,access_mode,payment_tier,payment_status,context,created_at,updated_at";
const REPORT_DETAIL_SELECT = "id,public_code,user_id,user_email,alias,record_kind,status,access_mode,payment_tier,payment_status,context,engine_snapshot,mother_draft,paid_report,visual_profile,image_path,image_error,created_at,updated_at";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_LOADING_VIDEO_BYTES = 6 * 1024 * 1024;
const MAX_REPORT_IMAGE_BYTES = 15 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const REPORT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const LOADING_VIDEO_TYPES = ["video/mp4", "video/webm"];

const ALLOWED_ACTIONS = new Set([
  "report.list",
  "report.get",
  "report.delete",
  "report.viewImage",
  "report.generateImage",
  "background.list",
  "background.prepareUpload",
  "background.finalizeUpload",
  "background.setEnabled",
  "background.setWallpaper",
  "background.clearWallpaper",
  "background.delete",
  "gallery.list",
  "gallery.prepareUpload",
  "gallery.finalizeUpload",
  "gallery.setEnabled",
  "gallery.setPrimary",
  "gallery.setTags",
  "gallery.setLoginCurrent",
  "gallery.delete",
  "upload.abort",
]);

type Payload = Record<string, unknown>;

type GalleryAsset = {
  id: string;
  category: string;
  asset_key: string;
  title: string;
  storage_path: string;
  bucket_id: string;
  content_type: string | null;
  tags: string[];
  enabled: boolean;
  is_primary: boolean;
};

type GalleryKnowledge = {
  asset_id: string;
  analysis_status: string;
  element_scores: Record<string, number> | null;
  client_eligible: boolean;
  contains_text: boolean;
  confidence: number | string | null;
};

class OwnerDataError extends Error {
  code: string;
  status: number;

  constructor(code: string, status = 400, detail = code) {
    super(detail);
    this.code = code;
    this.status = status;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function boundedInt(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function safeSlug(value: string, fallback = "asset") {
  const clean = value.trim().toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return clean || fallback;
}

function safeTags(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value.map((tag) => text(tag)).filter(Boolean).slice(0, 20);
}

function safeExtension(name: string, contentType: string) {
  const byType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  if (byType[contentType]) return byType[contentType];
  const ext = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  return ["jpg", "jpeg", "png", "webp", "avif", "mp4", "webm"].includes(ext) ? ext : "bin";
}

function isImageType(contentType: string) {
  return IMAGE_TYPES.includes(contentType);
}

function isLoadingVideoType(contentType: string) {
  return LOADING_VIDEO_TYPES.includes(contentType);
}

function isQaReport(row: Record<string, unknown>) {
  const kind = text(row.record_kind).toLowerCase();
  const access = text(row.access_mode).toLowerCase();
  const context = row.context && typeof row.context === "object" ? row.context as Record<string, unknown> : {};
  return ["test", "qa", "e2e"].includes(kind)
    || ["test", "qa", "e2e"].includes(access)
    || context.qa === true
    || context.isQa === true
    || context.is_qa === true;
}

function requireId(payload: Payload, field = "id") {
  const value = text(payload[field]);
  if (!value) throw new OwnerDataError("INVALID_REQUEST", 400, `${field} is required`);
  return value;
}

function bridgeSecret() {
  return Deno.env.get("ZHAOWU_OWNER_BRIDGE_SECRET") ?? "";
}

function uploadTicketSecret() {
  // A dedicated secret can be rotated independently. Supabase's server-only service-role
  // credential is a safe fallback and avoids making uploads depend on an extra dashboard
  // setting that may be missing after a function redeploy.
  const secret = Deno.env.get("ZHAOWU_OWNER_UPLOAD_TICKET_SECRET")
    || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    || "";
  if (secret.length < 32) throw new OwnerDataError("UPLOAD_TICKET_NOT_CONFIGURED", 503);
  return secret;
}

function requireService() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) throw new OwnerDataError("SUPABASE_ENV_MISSING", 503);
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function ticketError(error: unknown): OwnerDataError {
  const code = error instanceof Error ? error.message : "UPLOAD_TICKET_INVALID";
  if (code === "UPLOAD_TICKET_EXPIRED") return new OwnerDataError(code, 410);
  if (code === "SERVER_SECRET_NOT_CONFIGURED") return new OwnerDataError("UPLOAD_TICKET_NOT_CONFIGURED", 503);
  return new OwnerDataError("UPLOAD_TICKET_INVALID", 400, code);
}

async function verifiedTicket(payload: Payload, expected: Record<string, unknown>) {
  try {
    const ticket = await verifyUploadTicket(text(payload.uploadTicket), uploadTicketSecret());
    assertUploadTicketBinding(ticket, expected);
    return ticket;
  } catch (error) {
    throw ticketError(error);
  }
}

async function verifyStoredObject(
  service: ReturnType<typeof createClient>,
  bucket: string,
  path: string,
  ticket: Record<string, unknown>,
  maxSizeBytes: number,
  allowedContentTypes: string[],
) {
  const { data, error } = await service.storage.from(bucket).info(path);
  if (error || !data) throw new OwnerDataError("UPLOAD_FINALIZE_FAILED", 409, error?.message ?? "Uploaded object was not found");
  try {
    return validateUploadedObject(data, ticket, { maxSizeBytes, allowedContentTypes });
  } catch (validationError) {
    throw new OwnerDataError(
      "UPLOAD_FINALIZE_FAILED",
      validationError instanceof Error && validationError.message === "UPLOADED_OBJECT_TOO_LARGE" ? 413 : 409,
      validationError instanceof Error ? validationError.message : "Uploaded object validation failed",
    );
  }
}

async function removeObject(service: ReturnType<typeof createClient>, bucket: string, path: string) {
  const { error } = await service.storage.from(bucket).remove([path]);
  if (error && !/not found/i.test(error.message)) throw new OwnerDataError("STORAGE_DELETE_FAILED", 502, error.message);
}

async function bestEffortRemoveObject(service: ReturnType<typeof createClient>, bucket: string, path: string) {
  try {
    await removeObject(service, bucket, path);
    return false;
  } catch {
    return true;
  }
}

async function reportList(service: ReturnType<typeof createClient>, payload: Payload) {
  const limit = boundedInt(payload.limit, 50, 1, 50);
  const { data, error } = await service
    .from("report_requests")
    .select(REPORT_LIST_SELECT)
    .order("created_at", { ascending: false })
    .limit(Math.max(limit * 2, 60));
  if (error) throw new OwnerDataError("REPORT_LIST_FAILED", 502, error.message);
  const items = (data ?? []).filter((row) => !isQaReport(row as Record<string, unknown>)).slice(0, limit);
  return { ok: true, items };
}

async function reportGet(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const { data, error } = await service.from("report_requests").select(REPORT_DETAIL_SELECT).eq("id", id).maybeSingle();
  if (error) throw new OwnerDataError("REPORT_READ_FAILED", 502, error.message);
  return { ok: true, item: data ?? null };
}

async function reportDelete(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const { error } = await service.from("report_requests").delete().eq("id", id);
  if (error) throw new OwnerDataError("REPORT_DELETE_FAILED", 502, error.message);
  return { ok: true };
}

function galleryReferenceId(profile: unknown) {
  if (!profile || typeof profile !== "object") return null;
  const id = text((profile as Record<string, unknown>).galleryReferenceAssetId);
  return id || null;
}

async function reportViewImage(service: ReturnType<typeof createClient>, payload: Payload) {
  const reportId = text(payload.reportId);
  if (!reportId) throw new OwnerDataError("INVALID_REQUEST", 400, "reportId is required");
  const { data: report, error } = await service
    .from("report_requests")
    .select("id,image_path,visual_profile")
    .eq("id", reportId)
    .maybeSingle();
  if (error) throw new OwnerDataError("REPORT_READ_FAILED", 502, error.message);
  if (!report) throw new OwnerDataError("REPORT_NOT_FOUND", 404);
  const path = text(report.image_path);
  if (!path) {
    return {
      ok: true,
      imagePath: null,
      signedUrl: null,
      missing: true,
      galleryReferenceAssetId: galleryReferenceId(report.visual_profile),
    };
  }
  const { data: signed, error: signError } = await service.storage.from(REPORT_BUCKET).createSignedUrl(path, 3600);
  if (signError || !signed?.signedUrl) throw new OwnerDataError("IMAGE_LOAD_FAILED", 502, signError?.message ?? "Unable to sign image URL");
  return {
    ok: true,
    imagePath: path,
    signedUrl: signed.signedUrl,
    reused: true,
    galleryReferenceAssetId: galleryReferenceId(report.visual_profile),
  };
}

function normalizeElements(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  const map: Record<string, string> = { 木: "wood", 火: "fire", 土: "earth", 金: "metal", 水: "water" };
  return value.map((item) => map[text(item)] ?? text(item).toLowerCase()).filter((item) => ["wood", "fire", "earth", "metal", "water"].includes(item));
}

function galleryScore(knowledge: GalleryKnowledge | undefined, useful: string[], drain: string[]) {
  if (!knowledge) return 0;
  if (knowledge.contains_text) return -1000;
  const scores = knowledge.element_scores ?? {};
  let score = knowledge.analysis_status === "approved" ? 8 : 0;
  if (knowledge.client_eligible) score += 8;
  score += Number(knowledge.confidence ?? 0) * 2;
  for (const element of useful) score += Number(scores[element] ?? 0) * 4;
  for (const element of drain) score -= Number(scores[element] ?? 0) * 1.5;
  return score;
}

async function reportGenerateImage(service: ReturnType<typeof createClient>, payload: Payload) {
  const reportId = text(payload.reportId);
  if (!reportId) throw new OwnerDataError("INVALID_REQUEST", 400, "reportId is required");

  const { data: report, error: reportError } = await service
    .from("report_requests")
    .select("id,user_id,engine_snapshot,visual_profile,generation_attempts,image_path")
    .eq("id", reportId)
    .maybeSingle();
  if (reportError) throw new OwnerDataError("REPORT_READ_FAILED", 502, reportError.message);
  if (!report) throw new OwnerDataError("REPORT_NOT_FOUND", 404);
  if (payload.force !== true && text(report.image_path)) return reportViewImage(service, { reportId });
  if (!report.engine_snapshot) throw new OwnerDataError("DECREE_NOT_READY", 409);

  const { data: assets, error: assetsError } = await service
    .from("gallery_assets")
    .select(GALLERY_SELECT)
    .eq("enabled", true)
    .eq("category", "visual-library")
    .order("created_at", { ascending: false })
    .limit(250);
  if (assetsError) throw new OwnerDataError("GALLERY_REFERENCE_LOAD_FAILED", 502, assetsError.message);
  if (!assets?.length) throw new OwnerDataError("NO_GALLERY_ASSET_AVAILABLE", 409);

  const assetIds = assets.map((asset) => asset.id);
  const { data: knowledgeRows, error: knowledgeError } = await service
    .from("gallery_asset_knowledge")
    .select("asset_id,analysis_status,element_scores,client_eligible,contains_text,confidence")
    .in("asset_id", assetIds);
  if (knowledgeError) throw new OwnerDataError("GALLERY_REFERENCE_LOAD_FAILED", 502, knowledgeError.message);

  const knowledgeById = new Map((knowledgeRows ?? []).map((row) => [row.asset_id, row as GalleryKnowledge]));
  const engine = report.engine_snapshot as Record<string, unknown>;
  const structural = engine.structuralRemedy && typeof engine.structuralRemedy === "object"
    ? engine.structuralRemedy as Record<string, unknown>
    : {};
  const reading = engine.reading && typeof engine.reading === "object" ? engine.reading as Record<string, unknown> : {};
  const useful = normalizeElements(structural.usefulElements ?? reading.usefulElements ?? []);
  const drain = normalizeElements(structural.avoidElements ?? reading.avoidElements ?? []);

  const ranked = (assets as GalleryAsset[])
    .map((asset) => ({ asset, score: galleryScore(knowledgeById.get(asset.id), useful, drain) }))
    .filter(({ asset }) => knowledgeById.get(asset.id)?.contains_text !== true)
    .sort((left, right) => right.score - left.score || left.asset.id.localeCompare(right.asset.id));
  const selected = ranked[0]?.asset ?? assets[0] as GalleryAsset;
  if (!selected) throw new OwnerDataError("NO_GALLERY_ASSET_AVAILABLE", 409);

  const sourceBucket = selected.bucket_id || GALLERY_BUCKET;
  const { data: sourceBlob, error: sourceError } = await service.storage.from(sourceBucket).download(selected.storage_path);
  if (sourceError || !sourceBlob) throw new OwnerDataError("GALLERY_REFERENCE_LOAD_FAILED", 502, sourceError?.message ?? "Unable to read gallery asset");

  const contentType = (selected.content_type || sourceBlob.type || "image/webp").toLowerCase();
  if (!REPORT_IMAGE_TYPES.includes(contentType)) throw new OwnerDataError("IMAGE_GENERATION_FAILED", 415, "Gallery reference is not a supported report image type");
  if (!sourceBlob.size || sourceBlob.size > MAX_REPORT_IMAGE_BYTES) throw new OwnerDataError("IMAGE_GENERATION_FAILED", 413, "Generated report image exceeds 15 MB");

  const ext = safeExtension(selected.storage_path, contentType);
  const ownerFolder = text(report.user_id) || "owner";
  const targetPath = `${ownerFolder}/${report.id}/decree-owner-r146-${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await service.storage.from(REPORT_BUCKET).upload(targetPath, sourceBlob, {
    contentType,
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw new OwnerDataError("IMAGE_GENERATION_FAILED", 502, uploadError.message);

  try {
    const { data: stored, error: infoError } = await service.storage.from(REPORT_BUCKET).info(targetPath);
    if (infoError || !stored) throw new Error(infoError?.message ?? "Generated object was not found");
    validateUploadedObject(stored, { contentType, expectedSizeBytes: sourceBlob.size }, {
      maxSizeBytes: MAX_REPORT_IMAGE_BYTES,
      allowedContentTypes: REPORT_IMAGE_TYPES,
    });
  } catch (validationError) {
    await bestEffortRemoveObject(service, REPORT_BUCKET, targetPath);
    throw new OwnerDataError("IMAGE_GENERATION_FAILED", 502, validationError instanceof Error ? validationError.message : "Generated object validation failed");
  }

  const previousProfile = report.visual_profile && typeof report.visual_profile === "object"
    ? report.visual_profile as Record<string, unknown>
    : {};
  const visualProfile = {
    ...previousProfile,
    imageSource: "owner-server-gallery-direct",
    imageStyleVersion: "owner-server-r146",
    galleryReferenceAssetId: selected.id,
    galleryReferenceAssetKey: selected.asset_key,
    galleryReferenceTitle: selected.title,
    customerProviderIsolated: true,
  };
  const attempts = Number(report.generation_attempts ?? 0) + 1;
  const previousPath = text(report.image_path);
  const { error: patchError } = await service
    .from("report_requests")
    .update({
      image_path: targetPath,
      image_error: null,
      generation_error: null,
      generation_attempts: attempts,
      visual_profile: visualProfile,
      updated_at: new Date().toISOString(),
    })
    .eq("id", report.id);
  if (patchError) {
    await bestEffortRemoveObject(service, REPORT_BUCKET, targetPath);
    throw new OwnerDataError("IMAGE_GENERATION_FAILED", 502, patchError.message);
  }

  const previousImageCleanupPending = previousPath && previousPath !== targetPath
    ? await bestEffortRemoveObject(service, REPORT_BUCKET, previousPath)
    : false;

  const { data: signed, error: signError } = await service.storage.from(REPORT_BUCKET).createSignedUrl(targetPath, 3600);
  if (signError || !signed?.signedUrl) throw new OwnerDataError("IMAGE_LOAD_FAILED", 502, signError?.message ?? "Unable to sign generated image");
  return {
    ok: true,
    imagePath: targetPath,
    signedUrl: signed.signedUrl,
    reused: false,
    galleryDirect: true,
    galleryReferenceAssetId: selected.id,
    previousImageCleanupPending,
  };
}

async function backgroundList(service: ReturnType<typeof createClient>, payload: Payload) {
  const page = boundedInt(payload.page, 0, 0, 100000);
  const pageSize = boundedInt(payload.pageSize, 12, 1, 12);
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await service
    .from("background_assets")
    .select(BACKGROUND_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new OwnerDataError("BACKGROUND_LIST_FAILED", 502, error.message);
  return { ok: true, page: { items: data ?? [], total: count ?? (from + (data?.length ?? 0)), page, pageSize } };
}

async function backgroundPrepareUpload(service: ReturnType<typeof createClient>, payload: Payload) {
  const name = text(payload.name).slice(0, 160) || "background";
  const contentType = text(payload.contentType).toLowerCase();
  const size = boundedInt(payload.size, 0, 0, MAX_IMAGE_BYTES + 1);
  if (!isImageType(contentType)) throw new OwnerDataError("UPLOAD_PREPARE_FAILED", 415, "Only JPEG, PNG, WebP and AVIF are accepted");
  if (!size || size > MAX_IMAGE_BYTES) throw new OwnerDataError("UPLOAD_PREPARE_FAILED", 413, "Image exceeds 10 MB");
  const ext = safeExtension(name, contentType);
  const category = "background";
  const assetKey = safeSlug(name.replace(/\.[^.]+$/, ""), crypto.randomUUID());
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await service.storage.from(BACKGROUND_BUCKET).createSignedUploadUrl(path, { upsert: false });
  if (error || !data?.signedUrl) throw new OwnerDataError("UPLOAD_PREPARE_FAILED", 502, error?.message ?? "Unable to sign upload");
  const uploadTicket = await createUploadTicket({
    bucket: BACKGROUND_BUCKET,
    path,
    category,
    assetKey,
    contentType,
    expectedSizeBytes: size,
    uploadType: "background",
  }, uploadTicketSecret());
  return {
    ok: true,
    bucket: BACKGROUND_BUCKET,
    path,
    category,
    assetKey,
    contentType,
    expectedSizeBytes: size,
    uploadType: "background",
    uploadTicket,
    signedUrl: data.signedUrl,
    token: data.token ?? null,
  };
}

async function backgroundFinalizeUpload(service: ReturnType<typeof createClient>, payload: Payload) {
  const path = text(payload.path);
  const name = text(payload.name).slice(0, 160) || "background";
  const category = text(payload.category);
  const assetKey = text(payload.assetKey);
  const contentType = text(payload.contentType).toLowerCase();
  const size = Number(payload.size);
  const ticket = await verifiedTicket(payload, {
    bucket: BACKGROUND_BUCKET,
    path,
    category,
    assetKey,
    contentType,
    expectedSizeBytes: size,
    uploadType: "background",
  });
  const actual = await verifyStoredObject(service, BACKGROUND_BUCKET, path, ticket, MAX_IMAGE_BYTES, IMAGE_TYPES);
  const { data, error } = await service.from("background_assets").insert({
    source: "upload",
    name,
    storage_path: path,
    content_type: actual.contentType,
    enabled: true,
    days_of_week: [],
    theme: "daily-rotation",
  }).select(BACKGROUND_SELECT).single();
  if (error || !data) {
    await bestEffortRemoveObject(service, BACKGROUND_BUCKET, path);
    throw new OwnerDataError("UPLOAD_FINALIZE_FAILED", 502, error?.message ?? "Unable to save background metadata");
  }
  return { ok: true, item: data };
}

async function backgroundSetEnabled(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const enabled = payload.enabled === true;
  const { error } = await service.from("background_assets").update({ enabled, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new OwnerDataError("BACKGROUND_UPDATE_FAILED", 502, error.message);
  return { ok: true };
}

async function backgroundSetWallpaper(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const now = new Date().toISOString();
  const { error: clearError } = await service.from("background_assets").update({ theme: "daily-rotation", updated_at: now }).eq("theme", "wallpaper").neq("id", id);
  if (clearError) throw new OwnerDataError("BACKGROUND_UPDATE_FAILED", 502, clearError.message);
  const { error } = await service.from("background_assets").update({ enabled: true, theme: "wallpaper", updated_at: now }).eq("id", id);
  if (error) throw new OwnerDataError("BACKGROUND_UPDATE_FAILED", 502, error.message);
  return { ok: true };
}

async function backgroundClearWallpaper(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const { error } = await service.from("background_assets").update({ theme: "daily-rotation", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new OwnerDataError("BACKGROUND_UPDATE_FAILED", 502, error.message);
  return { ok: true };
}

async function backgroundDelete(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const { data: asset, error: readError } = await service.from("background_assets").select("id,storage_path").eq("id", id).maybeSingle();
  if (readError) throw new OwnerDataError("BACKGROUND_DELETE_FAILED", 502, readError.message);
  if (!asset) throw new OwnerDataError("ASSET_NOT_FOUND", 404);
  const { error } = await service.from("background_assets").delete().eq("id", id);
  if (error) throw new OwnerDataError("BACKGROUND_DELETE_FAILED", 502, error.message);
  const storageCleanupPending = await bestEffortRemoveObject(service, BACKGROUND_BUCKET, asset.storage_path);
  return { ok: true, storageCleanupPending };
}

async function galleryList(service: ReturnType<typeof createClient>, payload: Payload) {
  let query = service.from("gallery_assets").select(GALLERY_SELECT).order("created_at", { ascending: false });
  const category = text(payload.category);
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw new OwnerDataError("GALLERY_LIST_FAILED", 502, error.message);
  return { ok: true, items: data ?? [] };
}

async function galleryPrepareUpload(service: ReturnType<typeof createClient>, payload: Payload) {
  const name = text(payload.name).slice(0, 180) || "asset";
  const contentType = text(payload.contentType).toLowerCase();
  const size = boundedInt(payload.size, 0, 0, MAX_IMAGE_BYTES + 1);
  const category = safeSlug(text(payload.category), "uncategorized");
  const assetKey = safeSlug(text(payload.assetKey), crypto.randomUUID());
  const loading = category === "loading";
  const valid = isImageType(contentType) || (loading && isLoadingVideoType(contentType));
  const maxBytes = loading && isLoadingVideoType(contentType) ? MAX_LOADING_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (!valid) throw new OwnerDataError("UPLOAD_PREPARE_FAILED", 415, "Unsupported gallery media type");
  if (!size || size > maxBytes) throw new OwnerDataError("UPLOAD_PREPARE_FAILED", 413, "Gallery media exceeds size limit");
  const ext = safeExtension(name, contentType);
  const path = `${category}/${assetKey}/${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID()}.${ext}`;
  const { data, error } = await service.storage.from(GALLERY_BUCKET).createSignedUploadUrl(path, { upsert: false });
  if (error || !data?.signedUrl) throw new OwnerDataError("UPLOAD_PREPARE_FAILED", 502, error?.message ?? "Unable to sign upload");
  const uploadTicket = await createUploadTicket({
    bucket: GALLERY_BUCKET,
    path,
    category,
    assetKey,
    contentType,
    expectedSizeBytes: size,
    uploadType: "gallery",
  }, uploadTicketSecret());
  return {
    ok: true,
    bucket: GALLERY_BUCKET,
    path,
    category,
    assetKey,
    contentType,
    expectedSizeBytes: size,
    uploadType: "gallery",
    uploadTicket,
    signedUrl: data.signedUrl,
    token: data.token ?? null,
  };
}

async function galleryFinalizeUpload(service: ReturnType<typeof createClient>, payload: Payload) {
  const path = text(payload.path);
  const category = safeSlug(text(payload.category), "uncategorized");
  const assetKey = safeSlug(text(payload.assetKey), "asset");
  const title = text(payload.title).slice(0, 180);
  const contentType = text(payload.contentType).toLowerCase();
  const size = Number(payload.size);
  const tags = safeTags(payload.tags);
  const primary = payload.primary === true;
  const ticket = await verifiedTicket(payload, {
    bucket: GALLERY_BUCKET,
    path,
    category,
    assetKey,
    contentType,
    expectedSizeBytes: size,
    uploadType: "gallery",
  });
  const loadingVideo = category === "loading" && isLoadingVideoType(contentType);
  const allowedTypes = category === "loading" ? [...IMAGE_TYPES, ...LOADING_VIDEO_TYPES] : IMAGE_TYPES;
  const maxBytes = loadingVideo ? MAX_LOADING_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const actual = await verifyStoredObject(service, GALLERY_BUCKET, path, ticket, maxBytes, allowedTypes);
  const now = new Date().toISOString();
  const { data, error } = await service.from("gallery_assets").insert({
    category,
    asset_key: assetKey,
    title,
    storage_path: path,
    bucket_id: GALLERY_BUCKET,
    content_type: actual.contentType,
    tags,
    enabled: true,
    is_primary: false,
  }).select(GALLERY_SELECT).single();
  if (error || !data) {
    await bestEffortRemoveObject(service, GALLERY_BUCKET, path);
    throw new OwnerDataError("UPLOAD_FINALIZE_FAILED", 502, error?.message ?? "Unable to save gallery metadata");
  }
  if (primary) {
    const { error: clearError } = await service.from("gallery_assets").update({ is_primary: false, updated_at: now }).eq("category", category).eq("asset_key", assetKey).eq("is_primary", true).neq("id", data.id);
    if (clearError) throw new OwnerDataError("GALLERY_UPDATE_FAILED", 502, clearError.message);
    const { error: primaryError } = await service.from("gallery_assets").update({ is_primary: true, updated_at: now }).eq("id", data.id);
    if (primaryError) throw new OwnerDataError("GALLERY_UPDATE_FAILED", 502, primaryError.message);
    data.is_primary = true;
  }
  return { ok: true, item: data };
}

async function gallerySetEnabled(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const enabled = payload.enabled === true;
  const { error } = await service.from("gallery_assets").update({ enabled, ...(enabled ? {} : { is_primary: false }), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new OwnerDataError("GALLERY_UPDATE_FAILED", 502, error.message);
  return { ok: true };
}

async function gallerySetPrimary(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const { data: asset, error: readError } = await service.from("gallery_assets").select("id,category,asset_key").eq("id", id).maybeSingle();
  if (readError) throw new OwnerDataError("GALLERY_UPDATE_FAILED", 502, readError.message);
  if (!asset) throw new OwnerDataError("ASSET_NOT_FOUND", 404);
  const now = new Date().toISOString();
  const { error: clearError } = await service.from("gallery_assets").update({ is_primary: false, updated_at: now }).eq("category", asset.category).eq("asset_key", asset.asset_key).eq("is_primary", true);
  if (clearError) throw new OwnerDataError("GALLERY_UPDATE_FAILED", 502, clearError.message);
  const { error } = await service.from("gallery_assets").update({ enabled: true, is_primary: true, updated_at: now }).eq("id", id);
  if (error) throw new OwnerDataError("GALLERY_UPDATE_FAILED", 502, error.message);
  return { ok: true };
}

async function gallerySetTags(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const { error } = await service.from("gallery_assets").update({ tags: safeTags(payload.tags), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new OwnerDataError("GALLERY_UPDATE_FAILED", 502, error.message);
  return { ok: true };
}

async function gallerySetLoginCurrent(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const { data: asset, error: readError } = await service.from("gallery_assets").select("id,category").eq("id", id).maybeSingle();
  if (readError) throw new OwnerDataError("GALLERY_UPDATE_FAILED", 502, readError.message);
  if (!asset || asset.category !== "loading") throw new OwnerDataError("ASSET_NOT_FOUND", 404);
  const now = new Date().toISOString();
  const { error: clearError } = await service.from("gallery_assets").update({ is_primary: false, updated_at: now }).eq("category", "loading").eq("is_primary", true);
  if (clearError) throw new OwnerDataError("GALLERY_UPDATE_FAILED", 502, clearError.message);
  const { error } = await service.from("gallery_assets").update({ enabled: true, is_primary: true, updated_at: now }).eq("id", id);
  if (error) throw new OwnerDataError("GALLERY_UPDATE_FAILED", 502, error.message);
  return { ok: true };
}

async function galleryDelete(service: ReturnType<typeof createClient>, payload: Payload) {
  const id = requireId(payload);
  const { data: asset, error: readError } = await service.from("gallery_assets").select("id,bucket_id,storage_path").eq("id", id).maybeSingle();
  if (readError) throw new OwnerDataError("GALLERY_DELETE_FAILED", 502, readError.message);
  if (!asset) throw new OwnerDataError("ASSET_NOT_FOUND", 404);
  const { error } = await service.from("gallery_assets").delete().eq("id", id);
  if (error) throw new OwnerDataError("GALLERY_DELETE_FAILED", 502, error.message);
  const storageCleanupPending = await bestEffortRemoveObject(service, asset.bucket_id || GALLERY_BUCKET, asset.storage_path);
  return { ok: true, storageCleanupPending };
}

async function abortUpload(service: ReturnType<typeof createClient>, payload: Payload) {
  let ticket;
  try {
    ticket = await verifyUploadTicket(text(payload.uploadTicket), uploadTicketSecret());
  } catch (error) {
    throw ticketError(error);
  }
  if (![BACKGROUND_BUCKET, GALLERY_BUCKET].includes(text(ticket.bucket))) throw new OwnerDataError("INVALID_REQUEST", 400);
  const storageCleanupPending = await bestEffortRemoveObject(service, text(ticket.bucket), text(ticket.path));
  return { ok: true, storageCleanupPending };
}

async function dispatch(service: ReturnType<typeof createClient>, action: string, payload: Payload) {
  switch (action) {
    case "report.list": return reportList(service, payload);
    case "report.get": return reportGet(service, payload);
    case "report.delete": return reportDelete(service, payload);
    case "report.viewImage": return reportViewImage(service, payload);
    case "report.generateImage": return reportGenerateImage(service, payload);
    case "background.list": return backgroundList(service, payload);
    case "background.prepareUpload": return backgroundPrepareUpload(service, payload);
    case "background.finalizeUpload": return backgroundFinalizeUpload(service, payload);
    case "background.setEnabled": return backgroundSetEnabled(service, payload);
    case "background.setWallpaper": return backgroundSetWallpaper(service, payload);
    case "background.clearWallpaper": return backgroundClearWallpaper(service, payload);
    case "background.delete": return backgroundDelete(service, payload);
    case "gallery.list": return galleryList(service, payload);
    case "gallery.prepareUpload": return galleryPrepareUpload(service, payload);
    case "gallery.finalizeUpload": return galleryFinalizeUpload(service, payload);
    case "gallery.setEnabled": return gallerySetEnabled(service, payload);
    case "gallery.setPrimary": return gallerySetPrimary(service, payload);
    case "gallery.setTags": return gallerySetTags(service, payload);
    case "gallery.setLoginCurrent": return gallerySetLoginCurrent(service, payload);
    case "gallery.delete": return galleryDelete(service, payload);
    case "upload.abort": return abortUpload(service, payload);
    default: throw new OwnerDataError("ACTION_NOT_ALLOWED", 400);
  }
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);

    const auth = authorizeBridgeHeaders(req.headers, bridgeSecret());
    if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

    let payload: Payload;
    try { payload = await req.json() as Payload; } catch { return json({ ok: false, error: "INVALID_JSON" }, 400); }
    const action = text(payload.action);
    if (!ALLOWED_ACTIONS.has(action)) return json({ ok: false, error: "ACTION_NOT_ALLOWED" }, 400);

    const service = requireService();
    return json(await dispatch(service, action, payload));
  } catch (error) {
    if (error instanceof OwnerDataError) {
      return json({ ok: false, error: error.code, detail: error.message }, error.status);
    }
    return json({ ok: false, error: "OWNER_DATA_FAILED", detail: error instanceof Error ? error.message : "unknown" }, 500);
  }
});
