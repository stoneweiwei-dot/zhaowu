import type { SupabaseSession } from "@/lib/supabase-rest";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

const BUCKET = "zhaowu-gallery";

export type GalleryAsset = {
  id: string;
  category: string;
  asset_key: string;
  title: string;
  storage_path: string;
  content_type: string | null;
  tags: string[];
  enabled: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

function headers(token?: string | null, json = true): HeadersInit {
  const bearer = token || SUPABASE_KEY;
  return {
    apikey: SUPABASE_KEY,
    ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try { body = JSON.parse(text); } catch { throw new Error(`Gallery response error (HTTP ${res.status}).`); }
  }
  if (!res.ok) {
    const message = body && typeof body === "object"
      ? String((body as Record<string, unknown>).message ?? (body as Record<string, unknown>).error_description ?? (body as Record<string, unknown>).error ?? `HTTP ${res.status}`)
      : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return body as T;
}

function safePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function safeSlug(value: string, fallback = "asset") {
  const clean = value.trim().toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return clean || fallback;
}

export function galleryPublicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${safePath(path)}`;
}

const SELECT = "id,category,asset_key,title,storage_path,content_type,tags,enabled,is_primary,created_at,updated_at";

export async function listPublicGalleryAssets(category?: string): Promise<GalleryAsset[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const filter = category ? `&category=eq.${encodeURIComponent(category)}` : "";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/gallery_assets?enabled=eq.true${filter}&select=${SELECT}&order=created_at.desc`, { headers: headers() });
  if (!res.ok) return [];
  return parse<GalleryAsset[]>(res);
}

export async function listOwnerGalleryAssets(session: SupabaseSession, category?: string): Promise<GalleryAsset[]> {
  const filter = category ? `&category=eq.${encodeURIComponent(category)}` : "";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/gallery_assets?select=${SELECT}${filter}&order=created_at.desc`, {
    headers: headers(session.access_token),
  });
  return parse<GalleryAsset[]>(res);
}

export async function resolvePrimaryGalleryAssets(category: string, keys: string[]): Promise<Record<string, GalleryAsset>> {
  const unique = [...new Set(keys.map((key) => key.trim()).filter(Boolean))];
  if (!unique.length) return {};
  const inFilter = unique.map((key) => `"${key.replace(/"/g, "")}"`).join(",");
  const url = `${SUPABASE_URL}/rest/v1/gallery_assets?enabled=eq.true&is_primary=eq.true&category=eq.${encodeURIComponent(category)}&asset_key=in.(${encodeURIComponent(inFilter)})&select=${SELECT}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) return {};
  const rows = await parse<GalleryAsset[]>(res);
  return Object.fromEntries(rows.map((row) => [row.asset_key, row]));
}

export async function uploadGalleryAsset(
  session: SupabaseSession,
  file: File,
  meta: { category: string; assetKey?: string; title?: string; tags?: string[]; primary?: boolean },
): Promise<GalleryAsset> {
  if (!file.type.startsWith("image/")) throw new Error("只接受圖片檔。");
  if (file.size > 10 * 1024 * 1024) throw new Error("單張圖片不可超過 10 MB。");

  const category = safeSlug(meta.category, "uncategorized");
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const assetKey = safeSlug(meta.assetKey || baseName, crypto.randomUUID());
  const ext = (file.name.split(".").pop() || "webp").toLowerCase().replace(/[^a-z0-9]/g, "") || "webp";
  const path = `${category}/${assetKey}/${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID()}.${ext}`;

  const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath(path)}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: file,
  });
  if (!upload.ok) await parse(upload);

  if (meta.primary) {
    const clear = await fetch(`${SUPABASE_URL}/rest/v1/gallery_assets?category=eq.${encodeURIComponent(category)}&asset_key=eq.${encodeURIComponent(assetKey)}&is_primary=eq.true`, {
      method: "PATCH",
      headers: { ...headers(session.access_token), Prefer: "return=minimal" },
      body: JSON.stringify({ is_primary: false, updated_at: new Date().toISOString() }),
    });
    if (!clear.ok) await parse(clear);
  }

  const insert = await fetch(`${SUPABASE_URL}/rest/v1/gallery_assets`, {
    method: "POST",
    headers: { ...headers(session.access_token), Prefer: "return=representation" },
    body: JSON.stringify({
      category,
      asset_key: assetKey,
      title: (meta.title || file.name).slice(0, 180),
      storage_path: path,
      content_type: file.type || null,
      tags: (meta.tags ?? []).map((tag) => tag.trim()).filter(Boolean).slice(0, 20),
      enabled: true,
      is_primary: Boolean(meta.primary),
    }),
  });

  try {
    const rows = await parse<GalleryAsset[]>(insert);
    return rows[0];
  } catch (error) {
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath(path)}`, {
      method: "DELETE",
      headers: headers(session.access_token, false),
    }).catch(() => undefined);
    throw error;
  }
}

export async function setGalleryAssetEnabled(session: SupabaseSession, id: string, enabled: boolean) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/gallery_assets?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...headers(session.access_token), Prefer: "return=minimal" },
    body: JSON.stringify({ enabled, ...(enabled ? {} : { is_primary: false }), updated_at: new Date().toISOString() }),
  });
  if (!res.ok) await parse(res);
}

export async function setGalleryAssetPrimary(session: SupabaseSession, asset: GalleryAsset) {
  const clear = await fetch(`${SUPABASE_URL}/rest/v1/gallery_assets?category=eq.${encodeURIComponent(asset.category)}&asset_key=eq.${encodeURIComponent(asset.asset_key)}&is_primary=eq.true`, {
    method: "PATCH",
    headers: { ...headers(session.access_token), Prefer: "return=minimal" },
    body: JSON.stringify({ is_primary: false, updated_at: new Date().toISOString() }),
  });
  if (!clear.ok) await parse(clear);

  const set = await fetch(`${SUPABASE_URL}/rest/v1/gallery_assets?id=eq.${encodeURIComponent(asset.id)}`, {
    method: "PATCH",
    headers: { ...headers(session.access_token), Prefer: "return=minimal" },
    body: JSON.stringify({ enabled: true, is_primary: true, updated_at: new Date().toISOString() }),
  });
  if (!set.ok) await parse(set);
}

export async function deleteGalleryAsset(session: SupabaseSession, asset: GalleryAsset) {
  const storage = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath(asset.storage_path)}`, {
    method: "DELETE",
    headers: headers(session.access_token, false),
  });
  if (!storage.ok && storage.status !== 404) await parse(storage);

  const row = await fetch(`${SUPABASE_URL}/rest/v1/gallery_assets?id=eq.${encodeURIComponent(asset.id)}`, {
    method: "DELETE",
    headers: { ...headers(session.access_token), Prefer: "return=minimal" },
  });
  if (!row.ok) await parse(row);
}