import type { SupabaseSession } from "@/lib/supabase-rest";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

const BUCKET = "zhaowu-audio";
const ASSET_SELECT = "id,name,original_name,storage_path,fallback_storage_path,content_type,fallback_content_type,codec,bitrate_kbps,sample_rate_hz,channels,duration_seconds,file_size,enabled,created_at,updated_at";
const MAX_OUTPUT_BYTES = 15 * 1024 * 1024;
const MAX_SOURCE_BYTES = 120 * 1024 * 1024;

const FFMPEG_MODULE_URL = "https://esm.sh/@ffmpeg/ffmpeg@0.12.15?bundle";
const FFMPEG_CLASS_WORKER_URL = "https://esm.sh/@ffmpeg/ffmpeg@0.12.15/dist/esm/worker.js?bundle";
const FFMPEG_CORE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js";
const FFMPEG_WASM_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm";

export type BackgroundMusicAsset = {
  id: string;
  name: string;
  original_name: string | null;
  storage_path: string;
  fallback_storage_path: string | null;
  content_type: string;
  fallback_content_type: string | null;
  codec: string;
  bitrate_kbps: number | null;
  sample_rate_hz: number | null;
  channels: number | null;
  duration_seconds: number | null;
  file_size: number | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type MusicUploadProgress = {
  stage: "loading" | "transcoding" | "uploading" | "saving" | "done";
  percent: number;
  label: string;
};

type FfmpegFileData = Uint8Array | string;
type FfmpegLike = {
  load(config: Record<string, string>): Promise<boolean>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  exec(args: string[]): Promise<number>;
  readFile(path: string): Promise<FfmpegFileData>;
  deleteFile(path: string): Promise<void>;
  on(event: "progress", listener: (event: { progress: number }) => void): void;
  off(event: "progress", listener: (event: { progress: number }) => void): void;
};

type FfmpegConstructor = new () => FfmpegLike;

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
      throw new Error(`背景音樂服務回應格式錯誤（HTTP ${res.status}）。`);
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

export function musicPublicUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${safePath(path)}`;
}

export async function getActiveBackgroundMusic(): Promise<BackgroundMusicAsset | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/background_music_assets?enabled=eq.true&select=${ASSET_SELECT}&limit=1`, {
    headers: apiHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const rows = await parse<BackgroundMusicAsset[]>(res);
  return rows[0] ?? null;
}

export async function listOwnerBackgroundMusic(session: SupabaseSession): Promise<BackgroundMusicAsset[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/background_music_assets?select=${ASSET_SELECT}&order=updated_at.desc&limit=30`, {
    headers: apiHeaders(session.access_token),
    cache: "no-store",
  });
  return parse<BackgroundMusicAsset[]>(res);
}

async function toBlobUrl(url: string, mimeType: string) {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`轉碼核心下載失敗（HTTP ${res.status}）。`);
  return URL.createObjectURL(new Blob([await res.arrayBuffer()], { type: mimeType }));
}

async function loadFfmpeg(onProgress?: (progress: MusicUploadProgress) => void): Promise<FfmpegLike> {
  onProgress?.({ stage: "loading", percent: 3, label: "載入音訊轉碼核心" });
  const imported = await import(/* @vite-ignore */ FFMPEG_MODULE_URL) as { FFmpeg?: FfmpegConstructor };
  if (!imported.FFmpeg) throw new Error("無法載入音訊轉碼器。");

  const ffmpeg = new imported.FFmpeg();
  const [coreURL, wasmURL, classWorkerURL] = await Promise.all([
    toBlobUrl(FFMPEG_CORE_URL, "text/javascript"),
    toBlobUrl(FFMPEG_WASM_URL, "application/wasm"),
    toBlobUrl(FFMPEG_CLASS_WORKER_URL, "text/javascript"),
  ]);
  try {
    await ffmpeg.load({ coreURL, wasmURL, classWorkerURL });
  } finally {
    URL.revokeObjectURL(coreURL);
    URL.revokeObjectURL(wasmURL);
    URL.revokeObjectURL(classWorkerURL);
  }
  return ffmpeg;
}

function fileExtension(file: File) {
  const ext = (file.name.split(".").pop() || "audio").toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext || "audio";
}

function asBytes(data: FfmpegFileData) {
  if (typeof data === "string") return new TextEncoder().encode(data);
  return data;
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

export async function transcodeBackgroundMusic(
  file: File,
  onProgress?: (progress: MusicUploadProgress) => void,
): Promise<{ primary: Blob; fallback: Blob }> {
  if (!file.size) throw new Error("音訊檔是空的。");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("原始音訊請控制在 120 MB 以內。");

  const ffmpeg = await loadFfmpeg(onProgress);
  const inputName = `input.${fileExtension(file)}`;
  const primaryName = "output.m4a";
  const fallbackName = "output.mp3";
  const progressListener = ({ progress }: { progress: number }) => {
    const percent = Math.max(8, Math.min(72, Math.round(8 + Math.max(0, progress) * 64)));
    onProgress?.({ stage: "transcoding", percent, label: "轉成 Safari / iPhone 優先格式" });
  };
  ffmpeg.on("progress", progressListener);

  try {
    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    const aacExit = await ffmpeg.exec([
      "-i", inputName,
      "-vn",
      "-c:a", "aac",
      "-profile:a", "aac_low",
      "-b:a", "128k",
      "-ar", "48000",
      "-ac", "2",
      "-movflags", "+faststart",
      primaryName,
    ]);
    if (aacExit !== 0) throw new Error("AAC-LC 轉碼失敗。");

    onProgress?.({ stage: "transcoding", percent: 73, label: "建立 MP3 備援格式" });
    const mp3Exit = await ffmpeg.exec([
      "-i", inputName,
      "-vn",
      "-c:a", "libmp3lame",
      "-b:a", "128k",
      "-ar", "48000",
      "-ac", "2",
      fallbackName,
    ]);
    if (mp3Exit !== 0) throw new Error("MP3 備援轉碼失敗。");

    const primaryBytes = asBytes(await ffmpeg.readFile(primaryName));
    const fallbackBytes = asBytes(await ffmpeg.readFile(fallbackName));
    if (primaryBytes.byteLength > MAX_OUTPUT_BYTES || fallbackBytes.byteLength > MAX_OUTPUT_BYTES) {
      throw new Error("轉碼後單檔超過 15 MB，請縮短音訊後再上傳。");
    }

    return {
      primary: new Blob([asArrayBuffer(primaryBytes)], { type: "audio/mp4" }),
      fallback: new Blob([asArrayBuffer(fallbackBytes)], { type: "audio/mpeg" }),
    };
  } finally {
    ffmpeg.off("progress", progressListener);
    await Promise.allSettled([
      ffmpeg.deleteFile(inputName),
      ffmpeg.deleteFile(primaryName),
      ffmpeg.deleteFile(fallbackName),
    ]);
  }
}

async function uploadObject(session: SupabaseSession, path: string, body: Blob, contentType: string) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath(path)}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body,
  });
  if (!res.ok) await parse(res);
}

async function deleteObject(session: SupabaseSession, path: string | null | undefined) {
  if (!path) return;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath(path)}`, {
    method: "DELETE",
    headers: apiHeaders(session.access_token, false),
  });
  if (!res.ok && res.status !== 404) await parse(res);
}

export async function activateBackgroundMusic(session: SupabaseSession, id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/activate_background_music`, {
    method: "POST",
    headers: apiHeaders(session.access_token),
    body: JSON.stringify({ p_id: id }),
  });
  if (!res.ok) await parse(res);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("zhaowu-music-change"));
}

export async function uploadBackgroundMusic(
  session: SupabaseSession,
  file: File,
  onProgress?: (progress: MusicUploadProgress) => void,
): Promise<BackgroundMusicAsset> {
  const { primary, fallback } = await transcodeBackgroundMusic(file, onProgress);
  const folder = `background/uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
  const primaryPath = `${folder}.m4a`;
  const fallbackPath = `${folder}.mp3`;

  onProgress?.({ stage: "uploading", percent: 78, label: "上傳 AAC-LC 主檔" });
  await uploadObject(session, primaryPath, primary, "audio/mp4");
  try {
    onProgress?.({ stage: "uploading", percent: 88, label: "上傳 MP3 備援檔" });
    await uploadObject(session, fallbackPath, fallback, "audio/mpeg");
  } catch (error) {
    await deleteObject(session, primaryPath).catch(() => undefined);
    throw error;
  }

  onProgress?.({ stage: "saving", percent: 94, label: "保存曲目資料" });
  const insert = await fetch(`${SUPABASE_URL}/rest/v1/background_music_assets`, {
    method: "POST",
    headers: {
      ...apiHeaders(session.access_token),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: file.name.replace(/\.[^.]+$/, "").slice(0, 120) || "背景音樂",
      original_name: file.name.slice(0, 180),
      storage_path: primaryPath,
      fallback_storage_path: fallbackPath,
      content_type: "audio/mp4",
      fallback_content_type: "audio/mpeg",
      codec: "aac-lc+mp3-fallback",
      bitrate_kbps: 128,
      sample_rate_hz: 48000,
      channels: 2,
      file_size: primary.size,
      enabled: false,
    }),
  });

  let asset: BackgroundMusicAsset;
  try {
    const rows = await parse<BackgroundMusicAsset[]>(insert);
    asset = rows[0];
    if (!asset) throw new Error("保存曲目資料失敗。");
  } catch (error) {
    await Promise.allSettled([
      deleteObject(session, primaryPath),
      deleteObject(session, fallbackPath),
    ]);
    throw error;
  }

  await activateBackgroundMusic(session, asset.id);
  onProgress?.({ stage: "done", percent: 100, label: "已啟用新背景音樂" });
  return { ...asset, enabled: true };
}

export async function deleteBackgroundMusic(session: SupabaseSession, asset: BackgroundMusicAsset) {
  if (asset.enabled) throw new Error("目前播放中的曲目不可直接刪除，請先啟用另一首。");
  await Promise.all([
    deleteObject(session, asset.storage_path),
    deleteObject(session, asset.fallback_storage_path),
  ]);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/background_music_assets?id=eq.${encodeURIComponent(asset.id)}`, {
    method: "DELETE",
    headers: {
      ...apiHeaders(session.access_token),
      Prefer: "return=minimal",
    },
  });
  if (!res.ok) await parse(res);
}
