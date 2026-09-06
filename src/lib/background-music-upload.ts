import type { SupabaseSession } from "@/lib/supabase-rest";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import {
  activateBackgroundMusic,
  type BackgroundMusicAsset,
  type MusicUploadProgress,
} from "@/lib/background-music-assets";

const BUCKET = "zhaowu-audio";
const MAX_OUTPUT_BYTES = 15 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 120_000;

type NativeTrack = {
  blob: Blob;
  extension: string;
  contentType: string;
  codec: string;
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
      throw new Error(`背景音樂服務回應格式錯誤（HTTP ${res.status}）。`);
    }
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

function fileExtension(file: File) {
  return (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function nativeTrack(file: File): NativeTrack {
  const ext = fileExtension(file);
  if (ext === "mp3" || file.type === "audio/mpeg" || file.type === "audio/mp3") {
    return { blob: file.slice(0, file.size, "audio/mpeg"), extension: "mp3", contentType: "audio/mpeg", codec: "native-mp3" };
  }
  if (ext === "m4a" || ext === "mp4" || file.type === "audio/mp4" || file.type === "audio/x-m4a") {
    return { blob: file.slice(0, file.size, "audio/mp4"), extension: "m4a", contentType: "audio/mp4", codec: "native-aac-m4a" };
  }
  if (ext === "aac" || file.type === "audio/aac" || file.type === "audio/x-aac") {
    return { blob: file.slice(0, file.size, "audio/aac"), extension: "aac", contentType: "audio/aac", codec: "native-aac" };
  }
  if (ext === "wav" || file.type === "audio/wav" || file.type === "audio/x-wav") {
    return { blob: file.slice(0, file.size, "audio/wav"), extension: "wav", contentType: "audio/wav", codec: "native-wav" };
  }
  if (ext === "flac" || file.type === "audio/flac" || file.type === "audio/x-flac") {
    return { blob: file.slice(0, file.size, "audio/flac"), extension: "flac", contentType: "audio/flac", codec: "native-flac" };
  }
  throw new Error("手機上傳目前只接受 MP3、M4A/AAC、WAV 或 FLAC。這版不再在 iPhone 內載入大型轉碼器，避免卡在 3%／7%。");
}

function uploadObjectWithProgress(
  session: SupabaseSession,
  path: string,
  body: Blob,
  contentType: string,
  onProgress?: (progress: MusicUploadProgress) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath(path)}`);
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.setRequestHeader("apikey", SUPABASE_KEY);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const ratio = event.loaded / Math.max(1, event.total);
      onProgress?.({
        stage: "uploading",
        percent: Math.max(12, Math.min(92, Math.round(12 + ratio * 80))),
        label: "直接上傳原始音訊",
      });
    };
    xhr.onerror = () => reject(new Error("背景音樂上傳連線失敗。"));
    xhr.ontimeout = () => reject(new Error("背景音樂上傳逾時，已停止等待。"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      let message = `背景音樂上傳失敗（HTTP ${xhr.status}）。`;
      try {
        const response = JSON.parse(xhr.responseText) as Record<string, unknown>;
        message = String(response.message ?? response.error ?? message);
      } catch {
        // Keep the HTTP fallback message.
      }
      reject(new Error(message));
    };
    xhr.send(body);
  });
}

async function deleteObject(session: SupabaseSession, path: string) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath(path)}`, {
    method: "DELETE",
    headers: apiHeaders(session.access_token, false),
  });
  if (!res.ok && res.status !== 404) await parse(res);
}

async function deleteMetadata(session: SupabaseSession, id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/background_music_assets?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { ...apiHeaders(session.access_token), Prefer: "return=minimal" },
  });
  if (!res.ok) await parse(res);
}

export async function uploadBackgroundMusicResilient(
  session: SupabaseSession,
  file: File,
  onProgress?: (progress: MusicUploadProgress) => void,
): Promise<BackgroundMusicAsset> {
  if (!file.size) throw new Error("音訊檔是空的。");
  if (file.size > MAX_OUTPUT_BYTES) throw new Error("網站背景音樂請控制在 15 MB 以內。手機版直接上傳，不再先做瀏覽器轉碼。");

  onProgress?.({ stage: "loading", percent: 4, label: "檢查手機可直接播放的音訊格式" });
  const prepared = nativeTrack(file);
  const folder = `background/uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
  const storagePath = `${folder}.${prepared.extension}`;

  onProgress?.({ stage: "uploading", percent: 12, label: "開始直接上傳原始音訊" });
  await uploadObjectWithProgress(session, storagePath, prepared.blob, prepared.contentType, onProgress);

  onProgress?.({ stage: "saving", percent: 94, label: "保存曲目資料" });
  const insert = await fetch(`${SUPABASE_URL}/rest/v1/background_music_assets`, {
    method: "POST",
    headers: { ...apiHeaders(session.access_token), Prefer: "return=representation" },
    body: JSON.stringify({
      name: file.name.replace(/\.[^.]+$/, "").slice(0, 120) || "背景音樂",
      original_name: file.name.slice(0, 180),
      storage_path: storagePath,
      fallback_storage_path: null,
      content_type: prepared.contentType,
      fallback_content_type: null,
      codec: prepared.codec,
      bitrate_kbps: null,
      sample_rate_hz: null,
      channels: null,
      file_size: prepared.blob.size,
      enabled: false,
    }),
  });

  let asset: BackgroundMusicAsset;
  try {
    const rows = await parse<BackgroundMusicAsset[]>(insert);
    asset = rows[0];
    if (!asset) throw new Error("保存曲目資料失敗。");
  } catch (error) {
    await deleteObject(session, storagePath).catch(() => undefined);
    throw error;
  }

  try {
    onProgress?.({ stage: "saving", percent: 98, label: "切換目前背景音樂" });
    await activateBackgroundMusic(session, asset.id);
  } catch (error) {
    await Promise.allSettled([deleteObject(session, storagePath), deleteMetadata(session, asset.id)]);
    throw error;
  }

  onProgress?.({ stage: "done", percent: 100, label: "已啟用新背景音樂" });
  return { ...asset, enabled: true };
}
