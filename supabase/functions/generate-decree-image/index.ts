import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  GUARDIAN_STYLE_POOL_VERSION,
  chooseGuardianStyle,
  type GuardianStyle,
} from "./style-pool.ts";

const IMAGE_STYLE_VERSION = "song-saturated-sacred-pool-v4-20260825";

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

function visualPrompt(report: any, decree: string, guardianStyle: GuardianStyle): string {
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
    "PRIMARY VISUAL LANGUAGE: refined Song-dynasty inspired mineral-color painting on continuous warm ivory silk or xuan-paper. Compared with a pale Song-style wash, raise saturation and clarity by one controlled level: use luminous but richer celadon, jade green, turquoise, azurite or lapis blue, pearl white, warm ochre-gold leaf and restrained cinnabar. Keep the palette elegant and harmonious, never neon, muddy or candy-like.",
    "CONTRAST / LEGIBILITY: the sacred subject must read clearly on a phone screen. Preserve bright air and negative space, but give the main figure, robe edges, face, hands, jewelry and principal symbol enough tonal separation to remain visible. Avoid milky low-contrast haze, cream-on-cream washout and overexposed pastel fog.",
    "STYLE: elegant flat-to-shallow-relief painted forms, delicate ink-and-mineral brushwork, subtle silk texture, fine gold linework and atmospheric cloud layers. Avoid photorealism and avoid glossy 3D collectible-figure rendering.",
    "SUBJECT: if a celestial guardian or sacred figure is used, render it as a refined traditional East Asian painted celestial archetype with calm expression, graceful robes and symbolic protective presence. The guardian layer is artistic and symbolic only; do not present a random deity as an objective religious fact or destiny claim. Do not make it look like a resin statue, toy, game character, or product shot. Keep the figure integrated into the painted environment rather than cut out on a white backdrop.",
    `SELECTED GUARDIAN VISUAL MODE (${guardianStyle.id} / ${guardianStyle.label}): ${guardianStyle.directive}`,
    `QUESTION-SPECIFIC ART DIRECTION: ${visualTheme(question)}`,
    "COMPOSITION: one clear focal subject occupying roughly the central 45–60% of the page, with generous breathing room above and around it. Use one principal auspicious symbol and at most one secondary motif. Let clouds, water, mountain mist, lotus petals, or silk ribbons connect the composition softly.",
    "SYMBOL DISCIPLINE: every important object must translate an already-supported report meaning such as balance, pressure, release, timing, movement, relationship, purification or resource flow. Do not invent a new Bazi conclusion merely to justify a pretty object.",
    "BORDER: if used, keep it thin, elegant and partially broken like a painted scroll edge. For the concealed-sacred mode, a thin antique-gold circular moon-disc or mandala frame is preferred around the figure.",
    "ABSOLUTE NEGATIVES: NO black or near-black background unless the requested symbol absolutely requires a small dark accent; NO dark teal lacquer slab; NO glossy 3D sculpture; NO white product-photo cutout; NO crowded set of eight auspicious objects; NO oversized halo machinery; NO generic temple souvenir aesthetic; NO flat SVG sticker row; NO UI cards; NO fake charts; NO generated prose; NO gibberish signatures or fake calligraphy; NO watermarks embedded by the image model; NO washed-out pastel figure that disappears into the background; NO childish chibi deity; NO generic fantasy armor.",
    "Typography: generate no readable text at all. Leave a small clean lower-right safe area so the website can add branding separately without risking garbled AI text.",
    `Question context: ${question || "personal destiny report"}.`,
    `Four pillars: ${pillars}. Day master: ${dayMaster}. Month command: ${month}. Current dayun: ${dayun}.`,
    `Direct conclusion context: ${direct.slice(0, 650)}.`,
    `Personal decree meaning: ${decree.slice(0, 1000)}.`,
    "Translate the chart into balance, pressure, release, timing and movement through restrained symbolic imagery. The result should feel like a bespoke museum-quality Eastern painted scroll created for one person, not a generic Buddhist ornament collage.",
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
  if (payload?.viewOnly === true) {
    if (!report.image_path) return json({ ok: false, error: "IMAGE_NOT_FOUND" }, 404);
    const { data: signed, error: signError } = await service.storage
      .from("zhaowu-report-images")
      .createSignedUrl(report.image_path, 3600);
    if (signError || !signed?.signedUrl) {
      return json({ ok: false, error: "IMAGE_SIGN_FAILED" }, 500);
    }
    return json({
      ok: true,
      imagePath: report.image_path,
      signedUrl: signed.signedUrl,
      reused: true,
      styleVersion: currentStyleVersion || null,
      guardianStyleId: (profile as any)?.guardianStyleId ?? null,
    });
  }
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
      });
    }
  }

  const decree = decreeFrom(report);
  if (!decree) return json({ ok: false, error: "DECREE_NOT_READY" }, 409);

  const attempts = Number(report.generation_attempts ?? 0) + 1;
  const guardianStyle = chooseGuardianStyle(
    `${report.id}:${attempts}:${GUARDIAN_STYLE_POOL_VERSION}`,
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
    const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: visualPrompt(report, decree, guardianStyle),
        size: "1024x1536",
        quality: "high",
        output_format: "png",
      }),
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
        visualSystem: "濃郁版宋氏聖相風 × 含藏聖相隨機護法池 × 昭梧四柱繪意",
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await service.from("report_requests").update({
      image_error: "IMAGE_GENERATION_FAILED",
      generation_error: message.slice(0, 1000),
      generation_attempts: attempts,
      updated_at: new Date().toISOString(),
    }).eq("id", reportId);
    return json({ ok: false, error: "IMAGE_GENERATION_FAILED", detail: message }, 500);
  }
});
