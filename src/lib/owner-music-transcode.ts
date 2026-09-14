import { decodeOwnerAudioPcm, encodeDecodedOwnerMp3 } from "@/lib/owner-music-native-encode";

const FFMPEG_MODULE_URL = "https://esm.sh/@ffmpeg/ffmpeg@0.12.15?bundle";
const FFMPEG_CLASS_WORKER_URL = "https://esm.sh/@ffmpeg/ffmpeg@0.12.15/dist/esm/worker.js?bundle";
const FFMPEG_CORE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js";
const FFMPEG_WASM_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm";

const TARGET_UPLOAD_BYTES = 3_550_000;
export const MAX_OWNER_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_SOURCE_BYTES = 200 * 1024 * 1024;
const INITIAL_AAC_KBPS = 96;
const MIN_AAC_KBPS = 64;
const CORE_LOAD_TIMEOUT_MS = 90_000;
const TRANSCODE_TIMEOUT_MS = 180_000;
const NATIVE_DECODE_TIMEOUT_MS = 12_000;
const TOO_LONG = "曲目太長；為避免把音質壓到明顯變差，AAC 64 kbps 後仍超過安全上傳大小。請裁短曲目後再試。";

export type OwnerMusicOptimizeProgress = { percent: number; label: string };
export type OptimizedOwnerMusic = { file: File; sourceBytes: number; outputBytes: number; bitrateKbps: number | null; transcoded: boolean };

type FfmpegFileData = Uint8Array | string;
type FfmpegLike = {
  load(config: Record<string, string>): Promise<boolean>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  exec(args: string[]): Promise<number>;
  readFile(path: string): Promise<FfmpegFileData>;
  deleteFile(path: string): Promise<void>;
  on(event: "progress", listener: (event: { progress: number }) => void): void;
  off(event: "progress", listener: (event: { progress: number }) => void): void;
  terminate?: () => void;
};
type FfmpegConstructor = new () => FfmpegLike;

function extensionOf(file: File) { const ext = (file.name.split(".").pop() || "audio").toLowerCase().replace(/[^a-z0-9]/g, ""); return ext || "audio"; }
function baseName(file: File) { return (file.name.replace(/\.[^.]+$/, "").trim() || "background").slice(0, 100); }
export function isBrowserSafeAudio(file: File) {
  const type = file.type.toLowerCase(); const ext = extensionOf(file);
  return ["audio/mp4","audio/x-m4a","audio/mpeg","audio/mp3"].includes(type) || ["m4a","mp3"].includes(ext);
}
function asBytes(data: FfmpegFileData) { return typeof data === "string" ? new TextEncoder().encode(data) : data; }
function asArrayBuffer(bytes: Uint8Array): ArrayBuffer { const copy = new ArrayBuffer(bytes.byteLength); new Uint8Array(copy).set(bytes); return copy; }
export function isIosOwnerDevice() {
  if (typeof navigator === "undefined") return false;
  return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => { timer = setTimeout(() => reject(new Error(message)), timeoutMs); }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function toBlobUrl(url: string, mimeType: string) {
  const r = await withTimeout(fetch(url, { cache: "force-cache" }), CORE_LOAD_TIMEOUT_MS, "音訊優化器下載逾時，請確認網路後再試。");
  if (!r.ok) throw new Error(`音訊轉碼核心載入失敗（HTTP ${r.status}）。`);
  const bytes = await withTimeout(r.arrayBuffer(), CORE_LOAD_TIMEOUT_MS, "音訊優化器讀取逾時，請重新再試。");
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}

async function loadFfmpeg(onProgress?: (p: OwnerMusicOptimizeProgress) => void): Promise<FfmpegLike> {
  onProgress?.({ percent: 5, label: "載入音訊優化器" });
  const imported = await withTimeout(
    import(/* @vite-ignore */ FFMPEG_MODULE_URL) as Promise<{ FFmpeg?: FfmpegConstructor }>,
    CORE_LOAD_TIMEOUT_MS,
    "音訊優化器載入逾時，沒有卡死；請確認網路後重新選擇音樂。",
  );
  if (!imported.FFmpeg) throw new Error("無法載入音訊優化器，請重新整理後再試。");
  const ffmpeg = new imported.FFmpeg();
  const [coreURL, wasmURL, classWorkerURL] = await Promise.all([toBlobUrl(FFMPEG_CORE_URL,"text/javascript"), toBlobUrl(FFMPEG_WASM_URL,"application/wasm"), toBlobUrl(FFMPEG_CLASS_WORKER_URL,"text/javascript")]);
  const blobs = [coreURL, wasmURL, classWorkerURL];
  const forgetBlobs = () => { for (const url of blobs) URL.revokeObjectURL(url); };
  try {
    onProgress?.({ percent: 8, label: "初始化音訊優化器（首次較慢）" });
    await withTimeout(ffmpeg.load({ coreURL, wasmURL, classWorkerURL }), CORE_LOAD_TIMEOUT_MS, "音訊優化器初始化逾時，請改用 MP3／M4A 後再試，或換電腦上傳。");
  } catch (error) {
    ffmpeg.terminate?.();
    forgetBlobs();
    throw error;
  }
  const originalTerminate = ffmpeg.terminate?.bind(ffmpeg);
  ffmpeg.terminate = () => {
    originalTerminate?.();
    forgetBlobs();
  };
  return ffmpeg;
}

async function encodeAac(ffmpeg: FfmpegLike, inputName: string, outputName: string, bitrateKbps: number) {
  await ffmpeg.deleteFile(outputName).catch(() => undefined);
  let exit: number;
  try {
    exit = await withTimeout(
      ffmpeg.exec(["-y","-i",inputName,"-vn","-map_metadata","-1","-c:a","aac","-profile:a","aac_low","-b:a",`${bitrateKbps}k`,"-ar","48000","-ac","2","-movflags","+faststart",outputName]),
      TRANSCODE_TIMEOUT_MS,
      "音訊轉換逾時，已停止本次處理；請改用較短曲目或較小原檔再試。",
    );
  } catch (error) {
    ffmpeg.terminate?.();
    throw error;
  }
  if (exit !== 0) throw new Error("這個音檔無法轉成 Safari / iPhone 相容格式。");
  return asBytes(await ffmpeg.readFile(outputName));
}

function mp3File(source: File, bytes: Uint8Array, bitrateKbps: number): OptimizedOwnerMusic {
  const file = new File([asArrayBuffer(bytes)], `${baseName(source)}.mp3`, { type: "audio/mpeg" });
  return { file, sourceBytes: source.size, outputBytes: file.size, bitrateKbps, transcoded: true };
}

async function nativeFit(source: File, onProgress?: (p: OwnerMusicOptimizeProgress) => void) {
  const pcm = await decodeOwnerAudioPcm(source, onProgress);
  if (!pcm) return null;
  let bitrate = INITIAL_AAC_KBPS;
  onProgress?.({ percent: 28, label: `本機壓縮 MP3 ${bitrate} kbps` });
  let bytes = encodeDecodedOwnerMp3(pcm, bitrate);
  if (!bytes) return null;
  if (bytes.byteLength > TARGET_UPLOAD_BYTES) {
    bitrate = MIN_AAC_KBPS;
    onProgress?.({ percent: 48, label: `進一步縮小檔案（MP3 ${bitrate} kbps）` });
    bytes = encodeDecodedOwnerMp3(pcm, bitrate);
    if (!bytes) return null;
  }
  if (bytes.byteLength > TARGET_UPLOAD_BYTES) throw new Error(TOO_LONG);
  onProgress?.({ percent: 78, label: "音訊優化完成，準備上傳" });
  return mp3File(source, bytes, bitrate);
}

async function ffmpegFit(source: File, onProgress?: (p: OwnerMusicOptimizeProgress) => void): Promise<OptimizedOwnerMusic> {
  const ffmpeg = await loadFfmpeg(onProgress);
  const inputName = `owner-input.${extensionOf(source)}`; const outputName = "owner-output.m4a";
  let encodePercent = 12;
  const listener = ({ progress }: { progress: number }) => { const next = Math.max(12, Math.min(66, Math.round(12 + Math.max(0, progress) * 54))); if (next > encodePercent) { encodePercent = next; onProgress?.({ percent: next, label: "自動轉換 AAC / M4A" }); } };
  ffmpeg.on("progress", listener);
  try {
    onProgress?.({ percent: 10, label: "讀取原始音樂" });
    await ffmpeg.writeFile(inputName, new Uint8Array(await source.arrayBuffer()));
    let bitrate = INITIAL_AAC_KBPS; let bytes = await encodeAac(ffmpeg, inputName, outputName, bitrate);
    for (let attempt = 0; bytes.byteLength > TARGET_UPLOAD_BYTES && attempt < 2; attempt += 1) {
      const proportional = Math.floor(bitrate * (TARGET_UPLOAD_BYTES / bytes.byteLength) * 0.92);
      const nextBitrate = Math.max(MIN_AAC_KBPS, Math.min(bitrate - 8, proportional));
      if (nextBitrate >= bitrate) break;
      bitrate = nextBitrate; onProgress?.({ percent: 68 + attempt * 5, label: `進一步縮小檔案（AAC ${bitrate} kbps）` });
      bytes = await encodeAac(ffmpeg, inputName, outputName, bitrate); if (bitrate === MIN_AAC_KBPS) break;
    }
    if (bytes.byteLength > TARGET_UPLOAD_BYTES) throw new Error(TOO_LONG);
    onProgress?.({ percent: 78, label: "音訊優化完成，準備上傳" });
    const file = new File([asArrayBuffer(bytes)], `${baseName(source)}.m4a`, { type: "audio/mp4" });
    return { file, sourceBytes: source.size, outputBytes: file.size, bitrateKbps: bitrate, transcoded: true };
  } finally {
    ffmpeg.off("progress", listener);
    await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]);
    ffmpeg.terminate?.();
  }
}

export async function optimizeOwnerMusic(source: File, onProgress?: (p: OwnerMusicOptimizeProgress) => void): Promise<OptimizedOwnerMusic> {
  if (!source.size) throw new Error("音檔是空的。");
  if (source.size > MAX_SOURCE_BYTES) throw new Error("原始音檔超過 200 MB；請先裁短曲目後再上傳。");
  if (isBrowserSafeAudio(source)) {
    if (source.size > MAX_OWNER_UPLOAD_BYTES) throw new Error("MP3／M4A 超過 12 MB。請先轉成較小檔案或裁短曲目後再傳，不必在 iPhone 上解碼壓縮。");
    onProgress?.({ percent: 58, label: "已是網站可播放格式，直接上傳原檔" });
    return { file: source, sourceBytes: source.size, outputBytes: source.size, bitrateKbps: null, transcoded: false };
  }
  onProgress?.({ percent: 6, label: "本機壓縮音樂，避免 iPhone 卡住" });
  let native: OptimizedOwnerMusic | null = null;
  try {
    native = await withTimeout(nativeFit(source, onProgress), NATIVE_DECODE_TIMEOUT_MS, "本機解碼逾時，已停止以免卡住。請改選 12MB 以內的 MP3 或 M4A 直接上傳。");
  } catch (error) {
    if (isIosOwnerDevice()) throw error instanceof Error ? error : new Error("本機解碼失敗。請改選 MP3 或 M4A。");
    native = null;
  }
  if (native) return native;
  if (isIosOwnerDevice()) {
    throw new Error("iPhone 無法解碼這個格式，已停止載入大型轉碼器以免卡住。請改選 MP3 或 M4A，或用電腦上傳 FLAC／WAV。");
  }
  return ffmpegFit(source, onProgress);
}
