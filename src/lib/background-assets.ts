import type { SupabaseSession } from "@/lib/supabase-rest";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
const BUCKET = "zhaowu-backgrounds";

export type BackgroundAsset = {
  id: string;
  source: string;
  name: string;
  storage_path: string;
  content_type: string | null;
  enabled: boolean;
  days_of_week: number[];
  start_date: string | null;
  end_date: string | null;
  theme: string | null;
  created_at: string;
  updated_at: string;
};

function apiHeaders(token?: string | null, json = true): HeadersInit {
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
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(`背景服務回應格式錯誤（HTTP ${res.status}）。`);
    }
  }
  if (!res.ok) {
    const message = body && typeof body === "object"
      ? String(
        (body as Record<string, unknown>).message
        ?? (body as Record<string, unknown>).error_description
        ?? (body as Record<string, unknown>).error
        ?? `HTTP ${res.status}`,
      )
      : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return body as T;
}

function safePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export function backgroundPublicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${safePath(path)}`;
}

export async function listPublicBackgrounds(): Promise<BackgroundAsset[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const select = "id,source,name,storage_path,content_type,enabled,days_of_week,start_date,end_date,theme,created_at,updated_at";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/background_assets?enabled=eq.true&select=${select}&order=created_at.desc`, {
    headers: apiHeaders(),
  });
  if (!res.ok) return [];
  return parse<BackgroundAsset[]>(res);
}

export async function listOwnerBackgrounds(session: SupabaseSession): Promise<BackgroundAsset[]> {
  const select = "id,source,name,storage_path,content_type,enabled,days_of_week,start_date,end_date,theme,created_at,updated_at";
  const res = await fetch(`${SUPABASE_URL}/rest/v1/background_assets?select=${select}&order=created_at.desc`, {
    headers: apiHeaders(session.access_token),
  });
  return parse<BackgroundAsset[]>(res);
}

export async function uploadBackground(session: SupabaseSession, file: File): Promise<BackgroundAsset> {
  if (!file.type.startsWith("image/")) throw new Error("只接受圖片檔。");
  if (file.size > 10 * 1024 * 1024) throw new Error("單張圖片不可超過 10 MB。");

  const ext = (file.name.split(".").pop() || "webp").toLowerCase().replace(/[^a-z0-9]/g, "") || "webp";
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
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

  const insert = await fetch(`${SUPABASE_URL}/rest/v1/background_assets`, {
    method: "POST",
    headers: {
      ...apiHeaders(session.access_token),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      source: "upload",
      name: file.name.slice(0, 160),
      storage_path: path,
      content_type: file.type || null,
      enabled: true,
      days_of_week: [],
      theme: "daily-rotation",
    }),
  });
  try {
    const rows = await parse<BackgroundAsset[]>(insert);
    return rows[0];
  } catch (error) {
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath(path)}`, {
      method: "DELETE",
      headers: apiHeaders(session.access_token, false),
    }).catch(() => undefined);
    throw error;
  }
}

export async function setBackgroundEnabled(session: SupabaseSession, id: string, enabled: boolean) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/background_assets?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      ...apiHeaders(session.access_token),
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ enabled, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) await parse(res);
}

export function isPinnedWallpaper(asset: BackgroundAsset) {
  return asset.theme === "wallpaper";
}

export async function setBackgroundWallpaper(session: SupabaseSession, id: string) {
  const current = await listOwnerBackgrounds(session);
  const previous = current.filter((asset) => asset.theme === "wallpaper" && asset.id !== id);
  for (const asset of previous) {
    const clear = await fetch(`${SUPABASE_URL}/rest/v1/background_assets?id=eq.${encodeURIComponent(asset.id)}`, {
      method: "PATCH",
      headers: {
        ...apiHeaders(session.access_token),
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ theme: "daily-rotation", updated_at: new Date().toISOString() }),
    });
    if (!clear.ok) await parse(clear);
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/background_assets?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      ...apiHeaders(session.access_token),
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      enabled: true,
      theme: "wallpaper",
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) await parse(res);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("zhaowu-background-change"));
  }
}

export async function clearBackgroundWallpaper(session: SupabaseSession, id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/background_assets?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      ...apiHeaders(session.access_token),
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ theme: "daily-rotation", updated_at: new Date().toISOString() }),
  });
  if (!res.ok) await parse(res);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("zhaowu-background-change"));
  }
}

export async function deleteBackground(session: SupabaseSession, asset: BackgroundAsset) {
  const storage = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath(asset.storage_path)}`, {
    method: "DELETE",
    headers: apiHeaders(session.access_token, false),
  });
  if (!storage.ok && storage.status !== 404) await parse(storage);

  const row = await fetch(`${SUPABASE_URL}/rest/v1/background_assets?id=eq.${encodeURIComponent(asset.id)}`, {
    method: "DELETE",
    headers: {
      ...apiHeaders(session.access_token),
      Prefer: "return=minimal",
    },
  });
  if (!row.ok) await parse(row);
}

export function chooseDailyBackground(assets: BackgroundAsset[], now = new Date()): BackgroundAsset | null {
  const eligible = assets
    .filter((asset) => {
      if (!asset.enabled) return false;
      if (asset.start_date && now < new Date(`${asset.start_date}T00:00:00`)) return false;
      if (asset.end_date && now > new Date(`${asset.end_date}T23:59:59`)) return false;
      if (asset.days_of_week.length && !asset.days_of_week.includes(now.getDay())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (!eligible.length) return null;

  const pinned = eligible.find((asset) => asset.theme === "wallpaper");
  if (pinned) return pinned;

  const weekday = now.getDay();
  const explicit = eligible.filter((asset) => asset.days_of_week.includes(weekday));
  const pool = explicit.length ? explicit : eligible;
  const yearStart = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - yearStart.getTime()) / 86_400_000);
  return pool[Math.abs(dayOfYear) % pool.length] ?? pool[0] ?? null;
}