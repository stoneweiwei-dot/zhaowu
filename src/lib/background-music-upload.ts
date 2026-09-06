import type { SupabaseSession } from "@/lib/supabase-rest";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import {
  activateBackgroundMusic,
  type BackgroundMusicAsset,
  type MusicUploadProgress,
} from "@/lib/background-music-assets";

const BUCKET = "zhaowu-audio";
const MAX_SOURCE_BYTES = 80 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 20 * 1024 * 1024;
const CORE_LOAD_TIMEOUT_MS = 28_000;
const UPLOAD_TIMEOUT_MS = 120_000;

const FFMPEG_PROVIDERS = [
  {
    moduleUrl: "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js",
    classWorkerUrl: "https://esm.sh/@ffmpeg/ffmpeg@0.12.15/dist/esm/worker.js?bundle",
    coreUrl: "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js",
    wasmUrl: "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm",
  },
  {
    moduleUrl: "https://esm.sh/@ffmpeg/ffmpeg@0.12.15?bundle",
    classWorkerUrl: "https://esm.sh/@ffmpeg/ffmpeg@0.12.15/dist/esm/worker.js?bundle",
    coreUrl: "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js",
    wasmUrl: "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm",
  },
] as const;

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

let ffmpegCache: FfmpegLike | null = null;
let ffmpegLoading: Promise<FfmpegLike> | null = null;

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

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function toBlobUrl(url: string, mimeType: string) {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`音訊核心下載失敗（HTTP ${res.status}）。`);
  return URL.createObjectURL(new Blob([await res.arrayBuffer()], { type: mimeType }));
}

async function loadFromProvider(
  provider: (typeof FFMPEG_PROVIDERS)[number],
): Promise<FfmpegLike> {
  const imported = await withTimeout(
    import(/* @vite-ignore */ provider.moduleUrl) as Promise<{ FFmpeg?: FfmpegConstructor }>,
    CORE_LOAD_TIMEOUT_MS,
    "音訊轉碼器載入逾時。",
  );
  if (!imported.FFmpeg) throw new Error("無法載入音訊轉碼器。");

  const ffmpeg = new imported.FFmpeg();
  const [coreURL, wasmURL, classWorkerURL] = await withTimeout(
    Promise.all([
      toBlobUrl(provider.coreUrl, "text/javascript"),
      toBlobUrl(provider.wasmUrl, "application/wasm"),
      toBlobUrl(provider.classWorkerUrl, "text/javascript"),
    ]),
    CORE_LOAD_TIMEOUT_MS,
    "音訊轉碼核心下載逾時。",
  );

  try {
    await withTimeout(
      ffmpeg.load({ coreURL, wasmURL, classWorkerURL }),
      CORE_LOAD_TIMEOUT_MS,
      "音訊轉碼核心啟動逾時。",
    );
  } finally {
    URL.revokeObjectURL(coreURL);
    URL.revokeObjectURL(wasmURL);
    URL.revokeObjectURL(classWorkerURL);
  }
  return ffmpeg;
}

async function getFfmpeg(onProgress?: (progress: MusicUploadProgress) => void) {
  if (ffmpegCache) return ffmpegCache;
  if (ffmpegLoading) return ffmpegLoading;

  ffmpegLoading = (async () => {
    let lastError: unknown = null;
    for (let index = 0; index < FFMPEG_PROVIDERS.length; index += 1) {
      onProgress?.({
        stage: "loading",
        percent: index === 0 ? 4 : 7,
        label: index === 0 ? "準備音訊轉碼器" : "切換備援轉碼來源",
      });
      try {
        const loaded = await loadFromProvider(FFMPEG_PROVIDERS[index]);
        ffmpegCache = loaded;
        return loaded;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error
      ? new Error(`${lastError.message} 頁面已停止等待，不會一直卡在 3%。`)
      : new Error("音訊轉碼器載入失敗，頁面已停止等待，不會一直卡住。");
  })();

  try {
    return await ffmpegLoading;
  } finally {
    ffmpegLoading = null;
  }
}

function fileExtension(file: File) {
  const ext = (file.name.split(".").pop() || "audio").toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext || "audio";
}

function isDirectMp3(file: File) {
  return fileExtension(file) === "mp3" || file.type === "audio/mpeg" || file.type === "audio/mp3";
}

function asBytes(data: FfmpegFileData) {
  return typeof data === "string" ? new TextEncoder().encode(data) : data;
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

async function normalizeToMp3(
  file: File,
  onProgress?: (progress: MusicUploadProgress) => void,
): Promise<Blob> {
  if (isDirectMp3(file)) {
    onProgress?.({ stage: "transcoding", percent: 68, label: "檔案已是相容 MP3，略過轉碼" });
    return file.slice(0, file.size, "audio/mpeg");
  }

  const ffmpeg = await getFfmpeg(onProgress);
  const inputName = `input-${crypto.randomUUID()}.${fileExtension(file)}`;
  const outputName = `output-${crypto.randomUUID()}.mp3`;
  const progressListener = ({ progress }: { progress: number }) => {
    const percent = Math.max(10, Math.min(68, Math.round(10 + Math.max(0, progress) * 58)));
    onProgress?.({ stage: "transcoding", percent, label: "轉成網站高相容 MP3" });
  };
  ffmpeg.on("progress", progressListener);

  try {
    onProgress?.({ stage: "transcoding", percent: 10, label: "讀取音訊檔" });
    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    const exitCode = await ffmpeg.exec([
      "-i", inputName,
      "-vn",
      "-map_metadata", "-1",
      "-c:a", "libmp3lame",
      "-b:a", "128k",
      "-ar", "48000",
      "-ac", "2",
      outputName,
    ]);
    if (exitCode !== 0) throw new Error("MP3 轉碼失敗。");

    const bytes = asBytes(await ffmpeg.readFile(outputName));
    if (!bytes.byteLength) throw new Error("MP3 轉碼結果為空。");
    if (bytes.byteLength > MAX_OUTPUT_BYTES) throw new Error("轉碼後檔案超過 20 MB，請縮短音樂後再上傳。");
    return new Blob([asArrayBuffer(bytes)], { type: "audio/mpeg" });
  } finally {
    ffmpeg.off("progress", progressListener);
    await Promise.allSettled([
      ffmpeg.deleteFile(inputName),
      ffmpeg.deleteFile(outputName),
    ]);
  }
}

function uploadObjectWithProgress(
  session: SupabaseSession,
  path: string,
  body: Blob,
  onProgress?: (progress: MusicUploadProgress) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath(path)}`);
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.setRequestHeader("apikey", SUPABASE_KEY);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("Content-Type", "audio/mpeg");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const ratio = event.loaded / Math.max(1, event.total);
      onProgress?.({
        stage: "uploading",
        percent: Math.max(72, Math.min(92, Math.round(72 + ratio * 20))),
        label: "上傳標準 MP3",
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
        const body = JSON.parse(xhr.responseText) as Record<string, unknown>;
        message = String(body.message ?? body.error ?? message);
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
    headers: {
      ...apiHeaders(session.access_token),
      Prefer: "return=minimal",
    },
  });
  if (!res.ok) await parse(res);
}

export async function uploadBackgroundMusicResilient(
  session: SupabaseSession,
  file: File,
  onProgress?: (progress: MusicUploadProgress) => void,
): Promise<BackgroundMusicAsset> {
  if (!file.size) throw new Error("音訊檔是空的。");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("原始音訊請控制在 80 MB 以內，避免手機記憶體不足。");

  onProgress?.({ stage: "loading", percent: 1, label: "檢查音訊格式" });
  const normalized = await normalizeToMp3(file, onProgress);
  const folder = `background/uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
  const storagePath = `${folder}.mp3`;

  onProgress?.({ stage: "uploading", percent: 72, label: "開始上傳標準 MP3" });
  await uploadObjectWithProgress(session, storagePath, normalized, onProgress);

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
      storage_path: storagePath,
      fallback_storage_path: null,
      content_type: "audio/mpeg",
      fallback_content_type: null,
      codec: isDirectMp3(file) ? "mp3-direct" : "mp3-normalized",
      bitrate_kbps: isDirectMp3(file) ? null : 128,
      sample_rate_hz: isDirectMp3(file) ? null : 48000,
      channels: isDirectMp3(file) ? null : 2,
      file_size: normalized.size,
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
    await Promise.allSettled([
      deleteObject(session, storagePath),
      deleteMetadata(session, asset.id),
    ]);
    throw error;
  }

  onProgress?.({ stage: "done", percent: 100, label: "已啟用新背景音樂" });
  return { ...asset, enabled: true };
}
