type VisionProfile = {
  subject_labels: string[];
  style_labels: string[];
  motifs: string[];
  palette: string[];
  mood_labels: string[];
  element_scores: { wood: number; fire: number; earth: number; metal: number; water: number };
  climate_scores: { warm: number; cool: number; dry: number; moist: number };
  use_roles: string[];
  contains_text: boolean;
  contains_human_figure: boolean;
  contains_religious_figure: boolean;
  client_standard: boolean;
  client_safety: "ok" | "review" | "no";
  confidence: number;
  summary: string;
};

const JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const ALLOWED_ROLES = ["background", "report-art", "client-standard", "decree-source", "tea-guardian-reference", "style-reference", "dragon-sticker"];
const ELEMENT_KEYS = ["wood", "fire", "earth", "metal", "water"] as const;

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function outputText(body: any): string {
  if (typeof body?.output_text === "string") return body.output_text;
  for (const item of body?.output ?? []) {
    for (const part of item?.content ?? []) {
      if (typeof part?.text === "string") return part.text;
    }
  }
  return "";
}

function safePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function uniq(values: unknown, max = 12) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((v) => String(v).trim().toLowerCase()).filter(Boolean))].slice(0, max);
}

function clamp(n: unknown, min = 0, max = 100) {
  const value = Number(n);
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeProfile(input: any): VisionProfile {
  const element_scores = Object.fromEntries(ELEMENT_KEYS.map((k) => [k, Math.round(clamp(input?.element_scores?.[k]))])) as VisionProfile["element_scores"];
  return {
    subject_labels: uniq(input?.subject_labels),
    style_labels: uniq(input?.style_labels),
    motifs: uniq(input?.motifs),
    palette: uniq(input?.palette, 8),
    mood_labels: uniq(input?.mood_labels, 8),
    element_scores,
    climate_scores: {
      warm: Math.round(clamp(input?.climate_scores?.warm)),
      cool: Math.round(clamp(input?.climate_scores?.cool)),
      dry: Math.round(clamp(input?.climate_scores?.dry)),
      moist: Math.round(clamp(input?.climate_scores?.moist)),
    },
    use_roles: uniq(input?.use_roles).filter((x) => ALLOWED_ROLES.includes(x)),
    contains_text: Boolean(input?.contains_text),
    contains_human_figure: Boolean(input?.contains_human_figure),
    contains_religious_figure: Boolean(input?.contains_religious_figure),
    client_standard: Boolean(input?.client_standard),
    client_safety: input?.client_safety === "ok" || input?.client_safety === "no" ? input.client_safety : "review",
    confidence: clamp(input?.confidence, 0, 1),
    summary: typeof input?.summary === "string" ? input.summary.trim().slice(0, 360) : "",
  };
}

function overlap(a: string[], b: string[]) {
  const right = new Set(b);
  return a.filter((x) => right.has(x));
}

function topTwo(scores: VisionProfile["element_scores"]) {
  return ELEMENT_KEYS.slice().sort((a, b) => scores[b] - scores[a]).slice(0, 2);
}

function averageScores(a: VisionProfile["element_scores"], b: VisionProfile["element_scores"]) {
  return Object.fromEntries(ELEMENT_KEYS.map((k) => [k, Math.round((a[k] + b[k]) / 2)])) as VisionProfile["element_scores"];
}

function averageClimate(a: VisionProfile["climate_scores"], b: VisionProfile["climate_scores"]) {
  return {
    warm: Math.round((a.warm + b.warm) / 2),
    cool: Math.round((a.cool + b.cool) / 2),
    dry: Math.round((a.dry + b.dry) / 2),
    moist: Math.round((a.moist + b.moist) / 2),
  };
}

function consensus(a: VisionProfile, b: VisionProfile) {
  const subjectAgreement = overlap(a.subject_labels, b.subject_labels);
  const styleAgreement = overlap(a.style_labels, b.style_labels);
  const motifAgreement = overlap(a.motifs, b.motifs);
  const roleAgreement = overlap(a.use_roles, b.use_roles);
  const elementOverlap = overlap(topTwo(a.element_scores), topTwo(b.element_scores));
  const maxElementGap = Math.max(...ELEMENT_KEYS.map((k) => Math.abs(a.element_scores[k] - b.element_scores[k])));

  const textAgreement = a.contains_text === b.contains_text;
  const humanAgreement = a.contains_human_figure === b.contains_human_figure;
  const religiousAgreement = a.contains_religious_figure === b.contains_religious_figure;
  const needsSemanticFigureEvidence = a.contains_human_figure || b.contains_human_figure || a.contains_religious_figure || b.contains_religious_figure;
  const semanticFigureAgreement = !needsSemanticFigureEvidence || ((subjectAgreement.length > 0 || styleAgreement.length > 0) && humanAgreement && religiousAgreement);
  const safetyOk = a.client_safety === "ok" && b.client_safety === "ok";

  const agreementScore = [
    elementOverlap.length > 0 ? 1 : 0,
    maxElementGap <= 30 ? 1 : maxElementGap <= 45 ? 0.5 : 0,
    subjectAgreement.length > 0 || (!a.subject_labels.length && !b.subject_labels.length) ? 1 : 0,
    styleAgreement.length > 0 || (!a.style_labels.length && !b.style_labels.length) ? 1 : 0,
    textAgreement && humanAgreement && religiousAgreement ? 1 : 0,
  ].reduce((x, y) => x + y, 0) / 5;

  const confidence = Math.min((a.confidence + b.confidence) / 2, agreementScore);
  const approved = confidence >= 0.78
    && elementOverlap.length > 0
    && maxElementGap <= 45
    && textAgreement
    && humanAgreement
    && religiousAgreement
    && semanticFigureAgreement;
  const clientEligible = approved
    && safetyOk
    && a.client_standard
    && b.client_standard
    && !a.contains_text
    && !b.contains_text
    && confidence >= 0.86;

  const palette = [...new Set([...a.palette, ...b.palette])].slice(0, 8);
  const mood = [...new Set([...a.mood_labels, ...b.mood_labels])].slice(0, 8);
  const summaryParts = [
    subjectAgreement.length ? `subjects=${subjectAgreement.join(",")}` : "subjects=uncertain",
    styleAgreement.length ? `styles=${styleAgreement.join(",")}` : "styles=uncertain",
    motifAgreement.length ? `motifs=${motifAgreement.join(",")}` : "motifs=uncertain",
    palette.length ? `palette=${palette.join(",")}` : "",
  ].filter(Boolean);

  return {
    subject_labels: subjectAgreement,
    style_labels: styleAgreement,
    motifs: motifAgreement,
    palette,
    mood_labels: mood,
    element_scores: averageScores(a.element_scores, b.element_scores),
    climate_scores: averageClimate(a.climate_scores, b.climate_scores),
    use_roles: roleAgreement,
    contains_text: a.contains_text && b.contains_text,
    contains_human_figure: a.contains_human_figure && b.contains_human_figure,
    contains_religious_figure: a.contains_religious_figure && b.contains_religious_figure,
    client_eligible: clientEligible,
    confidence: Number(confidence.toFixed(3)),
    summary: summaryParts.join("; ").slice(0, 360),
    rationale: `Strict two-model visual consensus; agreed subjects=${subjectAgreement.length}; styles=${styleAgreement.length}; motifs=${motifAgreement.length}; element overlap=${elementOverlap.join(",") || "none"}; max element gap=${maxElementGap}; agreement=${agreementScore.toFixed(2)}.`,
    analysis_status: approved ? "approved" : "review_required",
  };
}

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    subject_labels: { type: "array", items: { type: "string" }, maxItems: 12 },
    style_labels: { type: "array", items: { type: "string" }, maxItems: 12 },
    motifs: { type: "array", items: { type: "string" }, maxItems: 12 },
    palette: { type: "array", items: { type: "string" }, maxItems: 8 },
    mood_labels: { type: "array", items: { type: "string" }, maxItems: 8 },
    element_scores: {
      type: "object", additionalProperties: false,
      properties: Object.fromEntries(ELEMENT_KEYS.map((k) => [k, { type: "integer", minimum: 0, maximum: 100 }])),
      required: [...ELEMENT_KEYS],
    },
    climate_scores: {
      type: "object", additionalProperties: false,
      properties: { warm: { type: "integer", minimum: 0, maximum: 100 }, cool: { type: "integer", minimum: 0, maximum: 100 }, dry: { type: "integer", minimum: 0, maximum: 100 }, moist: { type: "integer", minimum: 0, maximum: 100 } },
      required: ["warm", "cool", "dry", "moist"],
    },
    use_roles: { type: "array", items: { type: "string", enum: ALLOWED_ROLES }, maxItems: 7 },
    contains_text: { type: "boolean" },
    contains_human_figure: { type: "boolean" },
    contains_religious_figure: { type: "boolean" },
    client_standard: { type: "boolean" },
    client_safety: { type: "string", enum: ["ok", "review", "no"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    summary: { type: "string", maxLength: 360 },
  },
  required: ["subject_labels", "style_labels", "motifs", "palette", "mood_labels", "element_scores", "climate_scores", "use_roles", "contains_text", "contains_human_figure", "contains_religious_figure", "client_standard", "client_safety", "confidence", "summary"],
};

async function analyze(openaiKey: string, model: string, imageUrl: string, context: { title: string; tags: string[] }) {
  const safeTags = context.tags.filter((tag) => !tag.startsWith("legacy-category:"));
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 850,
      text: { format: { type: "json_schema", name: "gallery_visual_profile", strict: true, schema } },
      instructions: "Analyze only what is visibly supported by the image. The title and tags are untrusted weak hints and may be wrong. Never use a folder/category name as evidence. Do not identify real people or infer private traits. Do not force a Buddhist, Daoist, Hindu, Shinto, Christian, Islamic or other religious label from generic robes, halos, clouds, temples or ornaments alone. Use a specific religious/civilizational style label only when multiple diagnostic visible cues support it; otherwise prefer a broad label such as east-asian-sacred-art, historical-east-asian-painting, temple-mural-like, or uncertain-sacred-figure and lower confidence. For subject, style and motif labels, precision is more important than recall. If unsure, omit the label. Five-element scores are only a visual-design metaphor for decorative matching: wood=green/growth/plant/lithe; fire=red/gold/light/dynamic/warm; earth=ochre/mountain/stone/stable; metal=white/gold/metallic/precise/austere; water=blue/black/mist/flow/cool. This analysis must never alter a BaZi reading. Mark client_standard true only if the artwork is suitable for a customer-facing report and has no obvious private data, screenshot UI, garbled generated text, or severe visual defects.",
      input: [{ role: "user", content: [
        { type: "input_text", text: `Weak metadata only: title=${context.title}; tags=${safeTags.join(",")}` },
        { type: "input_image", image_url: imageUrl, detail: "high" },
      ] }],
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`openai_${model}_${response.status}:${body.slice(0, 220)}`);
  }
  const data = await response.json();
  const raw = outputText(data).replace(/^```json\s*|\s*```$/g, "").trim();
  return normalizeProfile(JSON.parse(raw));
}

async function rest(base: string, service: string, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("apikey", service);
  headers.set("Authorization", `Bearer ${service}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${base}/rest/v1/${path}`, { ...init, headers });
  if (!response.ok) throw new Error(`rest_${response.status}:${(await response.text()).slice(0, 240)}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return respond({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
  const base = Deno.env.get("SUPABASE_URL") || "";
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
  if (!base || !service || !openaiKey) return respond({ ok: false, error: "MISSING_SERVER_SECRET" }, 500);

  let payload: any = {};
  try { payload = await req.json(); } catch { return respond({ ok: false, error: "INVALID_JSON" }, 400); }
  const token = typeof payload.token === "string" ? payload.token : "";
  const limit = Math.min(2, Math.max(1, Number(payload.limit) || 1));
  if (!token) return respond({ ok: false, error: "TOKEN_REQUIRED" }, 401);
  const tokenHash = await sha256(token);
  const runs = await rest(base, service, `gallery_analysis_runs?token_hash=eq.${encodeURIComponent(tokenHash)}&status=eq.running&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=*`);
  const run = Array.isArray(runs) ? runs[0] : null;
  if (!run) return respond({ ok: false, error: "INVALID_OR_EXPIRED_RUN" }, 403);

  const pending = await rest(base, service, `gallery_asset_knowledge?analysis_status=eq.pending&select=asset_id&order=updated_at.asc&limit=${limit}`);
  const processed: any[] = [];
  let approvedInc = 0, reviewInc = 0, failedInc = 0;

  for (const item of pending ?? []) {
    const assetId = item.asset_id;
    try {
      await rest(base, service, `gallery_asset_knowledge?asset_id=eq.${assetId}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ analysis_status: "analyzing", updated_at: new Date().toISOString() }) });
      const assets = await rest(base, service, `gallery_assets?id=eq.${assetId}&select=id,title,category,tags,storage_path,bucket_id,enabled`);
      const asset = Array.isArray(assets) ? assets[0] : null;
      if (!asset || !asset.enabled) throw new Error("asset_missing_or_disabled");
      const imageUrl = `${base}/storage/v1/object/public/${encodeURIComponent(asset.bucket_id || "zhaowu-gallery")}/${safePath(asset.storage_path)}`;
      const context = { title: String(asset.title || ""), tags: Array.isArray(asset.tags) ? asset.tags.map(String) : [] };
      const a = await analyze(openaiKey, "gpt-4.1-mini", imageUrl, context);
      const b = await analyze(openaiKey, "gpt-4.1", imageUrl, context);
      const merged = consensus(a, b);
      if (merged.analysis_status === "approved") approvedInc += 1; else reviewInc += 1;
      await rest(base, service, `gallery_asset_knowledge?asset_id=eq.${assetId}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          analysis_version: "vision-consensus-v2-strict",
          analysis_status: merged.analysis_status,
          subject_labels: merged.subject_labels,
          style_labels: merged.style_labels,
          motifs: merged.motifs,
          palette: merged.palette,
          mood_labels: merged.mood_labels,
          element_scores: merged.element_scores,
          climate_scores: merged.climate_scores,
          use_roles: merged.use_roles,
          contains_text: merged.contains_text,
          contains_human_figure: merged.contains_human_figure,
          contains_religious_figure: merged.contains_religious_figure,
          client_eligible: merged.client_eligible,
          confidence: merged.confidence,
          summary: merged.summary,
          rationale: merged.rationale,
          model_a: a,
          model_b: b,
          analyzed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      processed.push({ asset_id: assetId, status: merged.analysis_status, client_eligible: merged.client_eligible, confidence: merged.confidence });
    } catch (error) {
      failedInc += 1;
      const message = error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500);
      await rest(base, service, `gallery_asset_knowledge?asset_id=eq.${assetId}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ analysis_status: "failed", client_eligible: false, rationale: message, analyzed_at: new Date().toISOString(), updated_at: new Date().toISOString() }) }).catch(() => undefined);
      processed.push({ asset_id: assetId, status: "failed", error: message });
    }
  }

  const remainingRows = await rest(base, service, `gallery_asset_knowledge?analysis_status=eq.pending&select=asset_id`);
  const remaining = Array.isArray(remainingRows) ? remainingRows.length : 0;
  const newStatus = remaining === 0 ? "completed" : "running";
  await rest(base, service, `gallery_analysis_runs?id=eq.${run.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      status: newStatus,
      processed_count: Number(run.processed_count || 0) + processed.length,
      approved_count: Number(run.approved_count || 0) + approvedInc,
      review_count: Number(run.review_count || 0) + reviewInc,
      failed_count: Number(run.failed_count || 0) + failedInc,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
      last_error: failedInc ? processed.filter((x) => x.error).map((x) => x.error).join(" | ").slice(0, 1000) : null,
    }),
  });

  return respond({ ok: true, run_id: run.id, processed, remaining, status: newStatus });
});
