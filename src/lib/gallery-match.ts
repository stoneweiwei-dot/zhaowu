import type { Chart, Element } from "@/lib/bazi/types";
import { galleryPublicUrl, type GalleryAsset } from "@/lib/gallery-assets";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export type VisualElementScores = {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
};

export type GalleryArtKnowledge = {
  asset_id: string;
  element_scores: VisualElementScores;
  climate_scores: { warm: number; cool: number; dry: number; moist: number };
  palette: string[];
  mood_labels: string[];
  summary: string;
  confidence: number;
};

export type CustomerGalleryArt = {
  asset: GalleryAsset;
  knowledge: GalleryArtKnowledge;
  score: number;
  imageUrl: string;
  matchedElements: Element[];
};

const ELEMENT_KEY: Record<Element, keyof VisualElementScores> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
};

const ASSET_SELECT = "id,category,asset_key,title,storage_path,bucket_id,content_type,tags,enabled,is_primary,created_at,updated_at";

function publicHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_KEY,
    ...(SUPABASE_KEY ? { Authorization: `Bearer ${SUPABASE_KEY}` } : {}),
    "Content-Type": "application/json",
  };
}

function clampScore(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
}

function normalizeElementScores(value: unknown): VisualElementScores {
  const row = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    wood: clampScore(row.wood),
    fire: clampScore(row.fire),
    earth: clampScore(row.earth),
    metal: clampScore(row.metal),
    water: clampScore(row.water),
  };
}

function normalizeKnowledge(row: Record<string, unknown>): GalleryArtKnowledge {
  const climate = row.climate_scores && typeof row.climate_scores === "object"
    ? row.climate_scores as Record<string, unknown>
    : {};
  return {
    asset_id: String(row.asset_id ?? ""),
    element_scores: normalizeElementScores(row.element_scores),
    climate_scores: {
      warm: clampScore(climate.warm),
      cool: clampScore(climate.cool),
      dry: clampScore(climate.dry),
      moist: clampScore(climate.moist),
    },
    palette: Array.isArray(row.palette) ? row.palette.map(String) : [],
    mood_labels: Array.isArray(row.mood_labels) ? row.mood_labels.map(String) : [],
    summary: String(row.summary ?? ""),
    confidence: Math.max(0, Math.min(1, Number(row.confidence) || 0)),
  };
}

export function scoreCustomerGalleryArt(chart: Pick<Chart, "useful" | "drain">, knowledge: GalleryArtKnowledge): number {
  const useful = [...new Set(chart.useful)];
  const drain = [...new Set(chart.drain)].filter((element) => !useful.includes(element));
  if (!useful.length) return Number.NEGATIVE_INFINITY;

  const usefulScores = useful.map((element) => knowledge.element_scores[ELEMENT_KEY[element]]);
  const support = usefulScores.reduce((sum, value) => sum + value, 0) / usefulScores.length;
  const balance = usefulScores.length > 1 ? Math.min(...usefulScores) : usefulScores[0];
  const drainScore = drain.length
    ? drain.reduce((sum, element) => sum + knowledge.element_scores[ELEMENT_KEY[element]], 0) / drain.length
    : 0;

  // Decorative matching only. The chart is immutable input; image metadata never feeds back into BaZi calculation.
  return Number((support + balance * 0.18 - drainScore * 0.36 + knowledge.confidence * 4).toFixed(6));
}

export function rankCustomerGalleryArt(
  chart: Pick<Chart, "useful" | "drain">,
  candidates: Array<{ asset: GalleryAsset; knowledge: GalleryArtKnowledge }>,
): CustomerGalleryArt[] {
  return candidates
    .map(({ asset, knowledge }) => ({
      asset,
      knowledge,
      score: scoreCustomerGalleryArt(chart, knowledge),
      imageUrl: galleryPublicUrl(asset.storage_path, asset.bucket_id),
      matchedElements: [...new Set(chart.useful)].sort() as Element[],
    }))
    .filter((candidate) => Number.isFinite(candidate.score))
    .sort((a, b) => b.score - a.score || a.asset.id.localeCompare(b.asset.id));
}

export function chooseCustomerGalleryArt(
  chart: Pick<Chart, "useful" | "drain">,
  candidates: Array<{ asset: GalleryAsset; knowledge: GalleryArtKnowledge }>,
): CustomerGalleryArt | null {
  return rankCustomerGalleryArt(chart, candidates)[0] ?? null;
}

export async function loadCustomerGalleryCandidates(): Promise<Array<{ asset: GalleryAsset; knowledge: GalleryArtKnowledge }>> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];

  const knowledgeResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/gallery_asset_knowledge?analysis_status=eq.approved&client_eligible=eq.true&select=asset_id,element_scores,climate_scores,palette,mood_labels,summary,confidence&order=asset_id.asc`,
    { headers: publicHeaders() },
  );
  if (!knowledgeResponse.ok) return [];
  const rawKnowledge = await knowledgeResponse.json() as Array<Record<string, unknown>>;
  const knowledge = rawKnowledge.map(normalizeKnowledge).filter((row) => row.asset_id);
  if (!knowledge.length) return [];

  const ids = knowledge.map((row) => row.asset_id.replace(/[^a-fA-F0-9-]/g, "")).filter(Boolean);
  if (!ids.length) return [];
  const assetsResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/gallery_assets?enabled=eq.true&category=eq.visual-library&id=in.(${ids.join(",")})&select=${ASSET_SELECT}&order=id.asc`,
    { headers: publicHeaders() },
  );
  if (!assetsResponse.ok) return [];
  const assets = await assetsResponse.json() as GalleryAsset[];
  const byId = new Map(assets.map((asset) => [asset.id, asset]));

  return knowledge.flatMap((row) => {
    const asset = byId.get(row.asset_id);
    return asset ? [{ asset, knowledge: row }] : [];
  });
}
