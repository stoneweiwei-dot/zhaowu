import { MAX_OWNER_UPLOAD_BYTES, optimizeOwnerMusic, type OwnerMusicOptimizeProgress } from "@/lib/owner-music-transcode";

export type OwnerMusicTrack = {
  id: string;
  name: string;
  url: string;
  contentType: string;
  fileSize: number | null;
  enabled: boolean;
  createdAt: string | null;
};

export type OwnerMusicState = {
  active: { id: string; name: string; url: string; contentType: string } | null;
  tracks: OwnerMusicTrack[];
};

export type OwnerMusicUploadResult = {
  sourceBytes: number;
  outputBytes: number;
  bitrateKbps: number | null;
  transcoded: boolean;
};

export const OWNER_MUSIC_CHUNK_BYTES = 3_000_000;

async function parseBody(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
}

export async function loadOwnerMusic(): Promise<OwnerMusicState> {
  const response = await fetch("/api/owner-music", { cache: "no-store", credentials: "include" });
  const body = await parseBody(response);
  if (!response.ok) throw new Error(typeof body.detail === "string" ? body.detail : "背景音樂讀取失敗。");
  const active = body.active && typeof body.active === "object" ? body.active as Record<string, unknown> : null;
  const tracks = Array.isArray(body.tracks) ? body.tracks : [];
  return {
    active: active && typeof active.url === "string" ? {
      id: String(active.id ?? ""), name: String(active.name ?? "背景音樂"), url: String(active.url), contentType: String(active.contentType ?? "audio/mpeg"),
    } : null,
    tracks: tracks.map((row) => {
      const item = row && typeof row === "object" ? row as Record<string, unknown> : {};
      return {
        id: String(item.id ?? ""), name: String(item.name ?? "背景音樂"), url: String(item.url ?? ""), contentType: String(item.contentType ?? "audio/mpeg"),
        fileSize: typeof item.fileSize === "number" ? item.fileSize : null, enabled: Boolean(item.enabled), createdAt: typeof item.createdAt === "string" ? item.createdAt : null,
      };
    }).filter((row) => row.id && row.url),
  };
}

function uploadError(body: Record<string, unknown>) {
  if (body.error === "AUDIO_TOO_LARGE") return "音檔仍超過安全上傳大小，請裁短曲目後再試。";
  if (body.error === "UNSUPPORTED_AUDIO") return "這個音檔無法轉成網站播放格式。";
  if (body.error === "OWNER_REQUIRED") return "站主登入狀態已失效，請重新登入。";
  return typeof body.detail === "string" ? body.detail : "背景音樂上傳失敗。";
}

async function postMusicBlob(file: Blob, name: string, contentType: string, extra: Record<string, string> = {}) {
  return fetch("/api/owner-music", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": contentType || "audio/mpeg",
      "x-zhaowu-music-name": encodeURIComponent(name || "background.mp3"),
      ...extra,
    },
    body: file,
  });
}

async function uploadInChunks(file: File, onProgress?: (progress: OwnerMusicOptimizeProgress) => void) {
  if (file.size > MAX_OWNER_UPLOAD_BYTES) throw new Error("音檔超過 12 MB。請先轉成較小的 MP3／M4A 或裁短曲目。");
  const total = Math.max(1, Math.ceil(file.size / OWNER_MUSIC_CHUNK_BYTES));
  const uploadId = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48);
  let lastBody: Record<string, unknown> = {};
  for (let index = 0; index < total; index += 1) {
    const start = index * OWNER_MUSIC_CHUNK_BYTES;
    const blob = file.slice(start, start + OWNER_MUSIC_CHUNK_BYTES);
    onProgress?.({ percent: Math.min(96, 82 + Math.round(((index + 0.35) / total) * 16)), label: `上傳音樂 ${index + 1}/${total}` });
    const response = await postMusicBlob(blob, file.name, file.type || "audio/mpeg", {
      "x-zhaowu-music-upload-id": uploadId,
      "x-zhaowu-music-chunk-index": String(index),
      "x-zhaowu-music-chunk-total": String(total),
    });
    lastBody = await parseBody(response);
    if (!response.ok) throw new Error(uploadError(lastBody));
    onProgress?.({ percent: Math.min(98, 82 + Math.round(((index + 1) / total) * 16)), label: index + 1 === total ? "保存並切換網站背景音樂" : `已收第 ${index + 1} 段` });
  }
  if (lastBody.pending) throw new Error("分塊尚未收齊，請再試一次。");
  return lastBody;
}

export async function uploadOwnerMusic(
  source: File,
  onProgress?: (progress: OwnerMusicOptimizeProgress) => void,
): Promise<OwnerMusicUploadResult> {
  const optimized = await optimizeOwnerMusic(source, onProgress);
  onProgress?.({ percent: 82, label: "上傳音樂" });
  const file = optimized.file;
  if (file.size > OWNER_MUSIC_CHUNK_BYTES) {
    await uploadInChunks(file, onProgress);
  } else {
    const response = await postMusicBlob(file, file.name, file.type || "audio/mp4");
    const body = await parseBody(response);
    if (!response.ok) throw new Error(uploadError(body));
  }
  onProgress?.({ percent: 100, label: "完成" });
  window.dispatchEvent(new Event("zhaowu-music-change"));
  return {
    sourceBytes: optimized.sourceBytes,
    outputBytes: optimized.outputBytes,
    bitrateKbps: optimized.bitrateKbps,
    transcoded: optimized.transcoded,
  };
}

export async function activateOwnerMusic(id: string) {
  const response = await fetch("/api/owner-music", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  const body = await parseBody(response);
  if (!response.ok) throw new Error(typeof body.detail === "string" ? body.detail : "無法切換背景音樂。");
  window.dispatchEvent(new Event("zhaowu-music-change"));
}

export async function deleteOwnerMusic(id: string) {
  const response = await fetch("/api/owner-music", { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  const body = await parseBody(response);
  if (!response.ok) throw new Error(typeof body.detail === "string" ? body.detail : "無法刪除背景音樂。");
  window.dispatchEvent(new Event("zhaowu-music-change"));
}
