import { optimizeOwnerMusic, type OwnerMusicOptimizeProgress } from "@/lib/owner-music-transcode";

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

export async function uploadOwnerMusic(
  source: File,
  onProgress?: (progress: OwnerMusicOptimizeProgress) => void,
): Promise<OwnerMusicUploadResult> {
  const optimized = await optimizeOwnerMusic(source, onProgress);
  onProgress?.({ percent: 82, label: "上傳優化後音樂" });
  const file = optimized.file;
  const response = await fetch("/api/owner-music", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": file.type || "audio/mp4",
      "x-zhaowu-music-name": encodeURIComponent(file.name || "background.m4a"),
    },
    body: file,
  });
  onProgress?.({ percent: 94, label: "保存並切換網站背景音樂" });
  const body = await parseBody(response);
  if (!response.ok) {
    if (body.error === "AUDIO_TOO_LARGE") throw new Error("優化後音檔仍超過安全上傳大小，請裁短曲目後再試。");
    if (body.error === "UNSUPPORTED_AUDIO") throw new Error("這個音檔無法轉成網站播放格式。");
    if (body.error === "OWNER_REQUIRED") throw new Error("站主登入狀態已失效，請重新登入。");
    throw new Error(typeof body.detail === "string" ? body.detail : "背景音樂上傳失敗。");
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
