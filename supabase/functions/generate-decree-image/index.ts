import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  GUARDIAN_STYLE_POOL_VERSION,
  chooseGuardianStyle,
  type GuardianStyle,
} from "./style-pool.ts";

const IMAGE_STYLE_VERSION = "gallery-seeded-song-v5-20260827";
const GALLERY_BUCKET = "zhaowu-gallery";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ELEMENT_KEY: Record<string, "wood" | "fire" | "earth" | "metal" | "water"> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
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

function clampScore(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
}

function referenceScore(chart: any, knowledge: any): number {
  const useful = [...new Set(Array.isArray(chart?.useful) ? chart.useful.map(String) : [])].filter((value) => ELEMENT_KEY[value]);
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
    .eq("category", "reference-style")
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
  if (/(身強|身强|身弱|旺衰|五行|能量|日主)/.test(question)) {
    return "BALANCE / 轉: use one restrained Dharma-wheel or circular celestial halo as the main symbol, with subtle jade cloud movement suggesting balance and transformation.";
  }
  if (/(感情|戀愛|恋爱|正緣|正缘|婚姻|伴侶|伴侣|關係|关系|合作)/.test(question)) {
    return "AFFINITY / 緣: use one elegant endless-knot or paired-lotus motif as the supporting symbol, with gentle mirrored movement rather than literal paired characters.";
  }
  if (/(旅行|旅遊|旅游|出行|搬家|城市|國家|国家|方向)/.test(question)) {
    return "MOVEMENT / 遊: use a single flowing wave-and-cloud path with one small paired-fish motif, leaving generous open space.";
  }
  if (/(溝通|沟通|消息|表達|表达|說話|说话|聲音|声音)/.test(question)) {
    return "VOICE / 音: use one pale-jade conch or subtle circular resonance motif, refined and painterly.";
  }
  if (/(健康|清理|淨化|净化|修復|修复|療癒|疗愈)/.test(question)) {
    return "PURIFICATION / 淨: use a luminous lotus and clear jade-water ribbons, quiet and spacious, avoiding medical imagery.";
  }
  if (/(財|财|收入|資源|资源|福氣|福气)/.test(question)) {
    return "ABUNDANCE: use one refined treasure-vase or jewel motif with restrained gold leaf accents, never a pile of auspicious objects.";
  }
  return "BALANCE: use one principal sacred symbol and at most one secondary auspicious motif, keeping the composition quiet and breathable.";
}

function visualPrompt(report: any, decree: string, guardianStyle: GuardianStyle, referenceTitle: string): string {
  const chart = report?.engine_snapshot?.chart ?? {};
  const reading = report?.engine_snapshot?.reading ?? {};
  const pillars = Array.isArray(chart.pillars)
    ? chart.pillars.map((p: any) => p?.ganZhi).filter(Boolean).join(" ")
    : "";
  const dayMaster = `${chart.dayMaster ?? ""}${chart.dayMasterElement ?? ""}`;
  const month = chart.monthBranch ?? "";
  const dayun = chart.currentDayun?.ganZhi ?? "";
  const question = String(report?.alias ?? report?.engine_snapshot?.question ?? "").trim();
  const direct = String(reading?.directAnswer ?? "").trim();

  return [
    "Create one original premium vertical 9:16 commissioned artwork for ZHAOWU / 昭梧. It is a personal destiny decree illustration, not a UI screenshot and not product photography.",
    `REFERENCE SOURCE: the supplied owner-approved Gallery image (${referenceTitle || "approved personal reference"}) is the visual mother-image for this generation. Preserve its civilization, historical painting language, paper/silk atmosphere, palette family, brush density, spatial rhythm and overall visual temperature. Create a new original composition for this person's chart; do not simply copy the reference image, its text, seals, watermark, exact figure, or exact object placement.`,
    "PRIMARY VISUAL LANGUAGE: refined Song-dynasty inspired mineral-color painting on continuous warm ivory silk or xuan-paper. Use old-paper texture, soft aged scanning, restrained mineral color, gentle ink absorption and quiet museum-like depth. Avoid modern high-definition CG, commercial xianxia posters, glossy game-card rendering and plastic digital highlights.",
    "CONTRAST / LEGIBILITY: the sacred subject must read clearly on a phone screen. Preserve bright air and negative space, but give the main figure, robe edges, face, hands and principal symbol enough tonal separation to remain visible. Avoid milky cream-on-cream washout.",
    "SUBJECT: if a celestial guardian or sacred figure is used, render it as a refined traditional East Asian painted celestial archetype with calm expression, graceful robes and symbolic protective presence. Keep gender cues restrained and avoid sexualized anatomy, exaggerated muscles, glossy jewelry or fantasy armor.",
    `SELECTED GUARDIAN VISUAL MODE (${guardianStyle.id} / ${guardianStyle.label}): ${guardianStyle.directive}`,
    `QUESTION-SPECIFIC ART DIRECTION: ${visualTheme(question)}`,
    "COMPOSITION: one clear focal subject occupying roughly the central 45–60% of the page, with generous breathing room above and around it. Use one principal auspicious symbol and at most one secondary motif. Let clouds, water, mountain mist, lotus petals, or silk ribbons connect the composition softly.",
    "SYMBOL DISCIPLINE: every important object must translate an already-supported report meaning such as balance, pressure, release, timing, movement, relationship, purification or resource flow. Do not invent a new Bazi conclusion merely to justify a pretty object.",
    "ABSOLUTE NEGATIVES: NO black or near-black full background; NO glossy 3D sculpture; NO white product-photo cutout; NO crowded auspicious-object collage; NO generic fantasy armor; NO UI cards; NO fake charts; NO generated prose; NO gibberish signatures; NO fake calligraphy; NO watermark copied from the reference; NO modern game-character-card look.",
    "Typography: generate no readable text at all. Leave a small clean lower-right safe area so the website can add branding separately without risking garbled AI text.",
    `Question context: ${question || "personal destiny report"}.`,
    `Four pillars: ${pillars}. Day master: ${dayMaster}. Month command: ${month}. Current dayun: ${dayun}.`,
    `Direct conclusion context: ${direct.slice(0, 650)}.`,
    `Personal decree meaning: ${decree.slice(0, 1000)}.`,
    "Translate the chart into balance, pressure, release, timing and movement through restrained symbolic imagery. The result should feel like an old Eastern painted scroll that has existed for years, not a newly rendered digital poster.",
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
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ ok: false, error: "SUPABASE_ENV_MISSING" }, 500);
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "INVALID_JSON" }, 400);
  }

  const reportId = String(payload?.reportId ?? "").trim();
  if (!reportId) return json({ ok: false, error: "REPORT_ID_REQUIRED" }, 400);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: auth } },
  });
  const service = createClient(supabaseUrl, serviceKey);
  const { data: report, error: readError } = await userClient
    .from("report_requests")
    .select("id,user_id,alias,engine_snapshot,mother_draft,paid_report,visual_profile,image_path,image_error,generation_attempts")
    .eq("id", reportId)
    .single();

  if (readError || !report) return json({ ok: false, error: "REPORT_NOT_FOUND" }, 404);

  const profile = report.visual_profile && typeof report.visual_profile === "object"
    ? report.visual_profile
    : {};
  const currentStyleVersion = String((profile as any)?.imageStyleVersion ?? "");
  if (report.image_path && payload?.force !== true && currentStyleVersion === IMAGE_STYLE_VERSION) {
    const { data: signed, error: signError } = await service.storage
      .from("zhaowu-report-images")
      .createSignedUrl(report.image_path, 3600);
    if (!signError && signed?.signedUrl) {
      return json({
        ok: true,
        imagePath: report.image_path,
        signedUrl: signed.signedUrl,
        reused: true,
        styleVersion: IMAGE_STYLE_VERSION,
        guardianStyleId: (profile as any)?.guardianStyleId ?? null,
        galleryReferenceAssetId: (profile as any)?.galleryReferenceAssetId ?? null,
      });
    }
  }

  const decree = decreeFrom(report);
  if (!decree) return json({ ok: false, error: "DECREE_NOT_READY" }, 409);

  const chart = report?.engine_snapshot?.chart ?? {};
  const galleryReference = await chooseGalleryReference(service, chart);
  if (!galleryReference) {
    return json({ ok: false, error: "GALLERY_REFERENCE_NOT_FOUND" }, 409);
  }

  const referenceBucket = String(galleryReference.bucket_id || GALLERY_BUCKET);
  const { data: referenceBlob, error: referenceError } = await service.storage
    .from(referenceBucket)
    .download(String(galleryReference.storage_path));
  if (referenceError || !referenceBlob) {
    return json({ ok: false, error: "GALLERY_REFERENCE_LOAD_FAILED" }, 502);
  }

  const attempts = Number(report.generation_attempts ?? 0) + 1;
  const guardianStyle = chooseGuardianStyle(
    `${report.id}:${galleryReference.id}:${attempts}:${GUARDIAN_STYLE_POOL_VERSION}`,
  );
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openaiKey) {
    await service.from("report_requests").update({
      image_error: "IMAGE_GENERATION_NOT_CONFIGURED",
      generation_error: "OPENAI_API_KEY is not configured for generate-decree-image",
      generation_attempts: attempts,
      updated_at: new Date().toISOString(),
    }).eq("id", reportId);
    return json({ ok: false, error: "IMAGE_GENERATION_NOT_CONFIGURED" }, 503);
  }

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
    if (!imageRes.ok) {
      throw new Error(String(imageBody?.error?.message ?? `OpenAI HTTP ${imageRes.status}`));
    }
    const b64 = imageBody?.data?.[0]?.b64_json;
    if (!b64) throw new Error("Image API returned no b64_json");

    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    const owner = report.user_id || "owner";
    const safeVersion = IMAGE_STYLE_VERSION.replace(/[^a-z0-9-]/gi, "-");
    const objectPath = `${owner}/${reportId}/decree-${safeVersion}.png`;
    const { error: uploadError } = await service.storage
      .from("zhaowu-report-images")
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
        visualSystem: "站主核准命誥圖庫母圖 × 舊宣紙宋系圖譜風 × 昭梧四柱繪意",
        auspiciousMotifs: ["依問題只選一主一輔，不堆疊八吉祥"],
      },
      updated_at: new Date().toISOString(),
    }).eq("id", reportId);

    const { data: signed } = await service.storage
      .from("zhaowu-report-images")
      .createSignedUrl(objectPath, 3600);
    return json({
      ok: true,
      imagePath: objectPath,
      signedUrl: signed?.signedUrl ?? null,
      reused: false,
      styleVersion: IMAGE_STYLE_VERSION,
      guardianStyleId: guardianStyle.id,
      galleryReferenceAssetId: galleryReference.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
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
