import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  GUARDIAN_STYLE_POOL_VERSION,
  chooseGuardianStyle,
  type GuardianStyle,
} from "./style-pool.ts";

const IMAGE_STYLE_VERSION = "gallery-seeded-song-v7-reuse-existing-20260827";
const GALLERY_BUCKET = "zhaowu-gallery";
const REPORT_BUCKET = "zhaowu-report-images";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ELEMENT_KEY: Record<string, "wood" | "fire" | "earth" | "metal" | "water"> = {
  木: "wood", 火: "fire", 土: "earth", 金: "metal", 水: "water",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function decreeFrom(report: any): string {
  const current = String(report?.engine_snapshot?.reading?.decree ?? "").trim();
  if (current) return current;
  const pages = report?.mother_draft?.reportSections ?? report?.mother_draft?.ninePages;
  if (Array.isArray(pages)) {
    const page = pages.find((p: any) => p?.key === "decree" || p?.pageNo === 5);
    const body = Array.isArray(page?.body) ? page.body.filter(Boolean).join(" ") : "";
    if (body) return body;
  }
  return "";
}

async function signExisting(service: any, imagePath: string) {
  const { data, error } = await service.storage.from(REPORT_BUCKET).createSignedUrl(imagePath, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

function clampScore(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
}

function referenceScore(chart: any, knowledge: any): number {
  const useful = [...new Set(Array.isArray(chart?.useful) ? chart.useful.map(String) : [])]
    .filter((value) => ELEMENT_KEY[value]);
  const drain = [...new Set(Array.isArray(chart?.drain) ? chart.drain.map(String) : [])]
    .filter((value) => ELEMENT_KEY[value] && !useful.includes(value));
  if (!useful.length) return Number.NEGATIVE_INFINITY;
  const scores = knowledge?.element_scores && typeof knowledge.element_scores === "object"
    ? knowledge.element_scores as Record<string, unknown>
    : {};
  const usefulScores = useful.map((element) => clampScore(scores[ELEMENT_KEY[element]]));
  const support = usefulScores.reduce((sum, value) => sum + value, 0) / usefulScores.length;
  const balance = usefulScores.length > 1 ? Math.min(...usefulScores) : usefulScores[0];
  const drainScore = drain.length
    ? drain.reduce((sum, element) => sum + clampScore(scores[ELEMENT_KEY[element]]), 0) / drain.length
    : 0;
  const confidence = Math.max(0, Math.min(1, Number(knowledge?.confidence) || 0));
  return Number((support + balance * 0.18 - drainScore * 0.36 + confidence * 4).toFixed(6));
}

async function chooseGalleryReference(service: any, chart: any) {
  const { data: knowledgeRows, error: knowledgeError } = await service
    .from("gallery_asset_knowledge")
    .select("asset_id,element_scores,confidence")
    .eq("analysis_status", "approved")
    .eq("client_eligible", true);
  if (knowledgeError || !Array.isArray(knowledgeRows) || !knowledgeRows.length) return null;

  const ids = knowledgeRows.map((row: any) => String(row.asset_id ?? "")).filter(Boolean);
  if (!ids.length) return null;

  const { data: assets, error: assetsError } = await service
    .from("gallery_assets")
    .select("id,category,asset_key,title,storage_path,bucket_id,content_type,enabled")
    .eq("enabled", true)
    .eq("category", "visual-library")
    .in("id", ids);
  if (assetsError || !Array.isArray(assets) || !assets.length) return null;

  const knowledgeById = new Map(knowledgeRows.map((row: any) => [String(row.asset_id), row]));
  const ranked = assets
    .map((asset: any) => ({ asset, score: referenceScore(chart, knowledgeById.get(String(asset.id))) }))
    .filter((candidate: any) => Number.isFinite(candidate.score))
    .sort((a: any, b: any) => b.score - a.score || String(a.asset.id).localeCompare(String(b.asset.id)));
  return ranked[0]?.asset ?? null;
}

function visualTheme(question: string) {
  if (/(感情|戀愛|恋爱|正緣|正缘|婚姻|伴侶|伴侣|關係|关系|合作|桃花)/.test(question)) {
    return "AFFINITY: use one elegant paired-lotus or endless-knot motif, gentle mirrored movement, no literal romantic couple.";
  }
  if (/(旅行|旅遊|旅游|出行|搬家|城市|國家|国家|方向)/.test(question)) {
    return "MOVEMENT: use a flowing cloud-and-water path with generous open space.";
  }
  if (/(財|财|收入|資源|资源|福氣|福气)/.test(question)) {
    return "RESOURCE FLOW: use one refined treasure-vase or jewel motif with restrained gold accents.";
  }
  if (/(健康|清理|淨化|净化|修復|修复|療癒|疗愈)/.test(question)) {
    return "PURIFICATION: use luminous lotus and clear jade-water ribbons, quiet and spacious.";
  }
  return "BALANCE: one principal sacred symbol and at most one secondary motif, quiet and breathable.";
}

function visualPrompt(report: any, decree: string, guardianStyle: GuardianStyle, referenceTitle: string): string {
  const chart = report?.engine_snapshot?.chart ?? {};
  const reading = report?.engine_snapshot?.reading ?? {};
  const pillars = Array.isArray(chart.pillars)
    ? chart.pillars.map((p: any) => p?.ganZhi).filter(Boolean).join(" ")
    : "";
  const question = String(report?.alias ?? report?.engine_snapshot?.question ?? "").trim();
  const direct = String(reading?.directAnswer ?? "").trim();

  return [
    "Create one original premium vertical 9:16 personal destiny decree artwork for ZHAOWU / 昭梧. Not a UI screenshot.",
    `Use the supplied owner-approved Gallery image (${referenceTitle || "approved reference"}) as the visual mother-image. Preserve its historical painting language, civilization, paper/silk atmosphere, palette family, brush density and spatial rhythm, but create a new original composition for this chart. Do not copy its text, watermark, exact figure, seals or object placement.`,
    "Primary visual language: refined old xuan-paper or silk painting, Song-inspired mineral color, museum-like depth, visible paper fiber and restrained aged print character. Avoid modern CG, xianxia poster, glossy game-card rendering and plastic highlights.",
    `Selected visual mode (${guardianStyle.id} / ${guardianStyle.label}): ${guardianStyle.directive}`,
    `Question direction: ${visualTheme(question)}`,
    "Keep one clear focal subject, generous negative space, and enough tonal contrast for phone viewing. Important objects must translate supported report meanings rather than inventing new fortune conclusions.",
    "No readable generated text, no fake charts, no gibberish calligraphy, no black full background, no product-photo cutout, no crowded auspicious-object collage.",
    `Question: ${question || "personal destiny report"}.`,
    `Four pillars: ${pillars}.`,
    `Direct conclusion context: ${direct.slice(0, 650)}.`,
    `Personal decree meaning: ${decree.slice(0, 1000)}.`,
  ].join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);

  const auth = req.headers.get("Authorization");
  if (!auth) return json({ ok: false, error: "UNAUTHORIZED" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ ok: false, error: "SUPABASE_ENV_MISSING" }, 500);

  let payload: any;
  try { payload = await req.json(); }
  catch { return json({ ok: false, error: "INVALID_JSON" }, 400); }

  const reportId = String(payload?.reportId ?? "").trim();
  const force = payload?.force === true;
  if (!reportId) return json({ ok: false, error: "REPORT_ID_REQUIRED" }, 400);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
  const service = createClient(supabaseUrl, serviceKey);
  const { data: report, error: readError } = await userClient
    .from("report_requests")
    .select("id,user_id,alias,engine_snapshot,mother_draft,paid_report,visual_profile,image_path,image_error,generation_attempts")
    .eq("id", reportId)
    .single();
  if (readError || !report) return json({ ok: false, error: "REPORT_NOT_FOUND" }, 404);

  const profile = report.visual_profile && typeof report.visual_profile === "object" ? report.visual_profile : {};

  // Delivery first: a previously generated personal image must remain viewable even if the style version changes
  // or the image provider is temporarily unavailable. Regeneration is explicit via force=true.
  if (report.image_path && !force) {
    const signedUrl = await signExisting(service, report.image_path);
    if (signedUrl) {
      return json({
        ok: true,
        imagePath: report.image_path,
        signedUrl,
        reused: true,
        styleVersion: String((profile as any)?.imageStyleVersion ?? "legacy"),
        guardianStyleId: (profile as any)?.guardianStyleId ?? null,
        galleryReferenceAssetId: (profile as any)?.galleryReferenceAssetId ?? null,
      });
    }
  }

  const decree = decreeFrom(report);
  if (!decree) return json({ ok: false, error: "DECREE_NOT_READY" }, 409);

  const chart = report?.engine_snapshot?.chart ?? {};
  const galleryReference = await chooseGalleryReference(service, chart);
  if (!galleryReference) return json({ ok: false, error: "GALLERY_REFERENCE_NOT_FOUND" }, 409);

  const referenceBucket = String(galleryReference.bucket_id || GALLERY_BUCKET);
  const { data: referenceBlob, error: referenceError } = await service.storage
    .from(referenceBucket)
    .download(String(galleryReference.storage_path));
  if (referenceError || !referenceBlob) return json({ ok: false, error: "GALLERY_REFERENCE_LOAD_FAILED" }, 502);

  const attempts = Number(report.generation_attempts ?? 0) + 1;
  const guardianStyle = chooseGuardianStyle(`${report.id}:${galleryReference.id}:${attempts}:${GUARDIAN_STYLE_POOL_VERSION}`);
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) return json({ ok: false, error: "IMAGE_GENERATION_NOT_CONFIGURED" }, 503);

  try {
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", visualPrompt(report, decree, guardianStyle, String(galleryReference.title ?? galleryReference.asset_key ?? "")));
    form.append("size", "1024x1536");
    form.append("quality", "high");
    form.append("output_format", "png");
    form.append("image", referenceBlob, "approved-gallery-reference.png");

    const imageRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: form,
    });
    const imageBody = await imageRes.json();
    if (!imageRes.ok) throw new Error(String(imageBody?.error?.message ?? `OpenAI HTTP ${imageRes.status}`));
    const b64 = imageBody?.data?.[0]?.b64_json;
    if (!b64) throw new Error("Image API returned no b64_json");

    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    const owner = report.user_id || "owner";
    const safeVersion = IMAGE_STYLE_VERSION.replace(/[^a-z0-9-]/gi, "-");
    const objectPath = `${owner}/${reportId}/decree-${safeVersion}.png`;
    const { error: uploadError } = await service.storage
      .from(REPORT_BUCKET)
      .upload(objectPath, bytes, { contentType: "image/png", upsert: true });
    if (uploadError) throw uploadError;

    await service.from("report_requests").update({
      image_path: objectPath,
      image_error: null,
      generation_error: null,
      generation_attempts: attempts,
      visual_profile: {
        ...profile,
        imageStyleVersion: IMAGE_STYLE_VERSION,
        guardianStylePoolVersion: GUARDIAN_STYLE_POOL_VERSION,
        guardianStyleId: guardianStyle.id,
        guardianStyleLabel: guardianStyle.label,
        galleryReferenceAssetId: galleryReference.id,
        galleryReferenceAssetKey: galleryReference.asset_key,
        galleryReferenceTitle: galleryReference.title,
        visualSystem: "站主核准作品庫母圖 × 舊宣紙宋系圖譜風 × 昭梧四柱繪意",
      },
      updated_at: new Date().toISOString(),
    }).eq("id", reportId);

    const signedUrl = await signExisting(service, objectPath);
    return json({
      ok: true,
      imagePath: objectPath,
      signedUrl,
      reused: false,
      styleVersion: IMAGE_STYLE_VERSION,
      guardianStyleId: guardianStyle.id,
      galleryReferenceAssetId: galleryReference.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // A failed refresh must never make an already-generated personal image disappear.
    if (report.image_path) {
      const signedUrl = await signExisting(service, report.image_path);
      if (signedUrl) {
        await service.from("report_requests").update({
          image_error: null,
          generation_error: message.slice(0, 1000),
          generation_attempts: attempts,
          updated_at: new Date().toISOString(),
        }).eq("id", reportId);
        return json({
          ok: true,
          imagePath: report.image_path,
          signedUrl,
          reused: true,
          degraded: true,
          styleVersion: String((profile as any)?.imageStyleVersion ?? "legacy"),
          guardianStyleId: (profile as any)?.guardianStyleId ?? null,
          galleryReferenceAssetId: galleryReference.id,
        });
      }
    }

    await service.from("report_requests").update({
      image_error: "IMAGE_GENERATION_FAILED",
      generation_error: message.slice(0, 1000),
      generation_attempts: attempts,
      visual_profile: {
        ...profile,
        galleryReferenceAssetId: galleryReference.id,
        galleryReferenceAssetKey: galleryReference.asset_key,
        galleryReferenceTitle: galleryReference.title,
      },
      updated_at: new Date().toISOString(),
    }).eq("id", reportId);
    return json({ ok: false, error: "IMAGE_GENERATION_FAILED" }, 500);
  }
});
