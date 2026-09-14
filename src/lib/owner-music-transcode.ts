const FFMPEG_MODULE_URL = "https://esm.sh/@ffmpeg/ffmpeg@0.12.15?bundle";
const FFMPEG_CLASS_WORKER_URL = "https://esm.sh/@ffmpeg/ffmpeg@0.12.15/dist/esm/worker.js?bundle";
const FFMPEG_CORE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js";
const FFMPEG_WASM_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm";

const TARGET_UPLOAD_BYTES = 3_550_000;
const MAX_SOURCE_BYTES = 200 * 1024 * 1024;
const INITIAL_AAC_KBPS = 96;
const MIN_AAC_KBPS = 64;
const CORE_LOAD_TIMEOUT_MS = 25_000;
const TRANSCODE_TIMEOUT_MS = 180_000;

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
function isCompactBrowserSafeAudio(file: File) {
  const type = file.type.toLowerCase(); const ext = extensionOf(file);
  return file.size <= TARGET_UPLOAD_BYTES && (["audio/mp4","audio/x-m4a","audio/mpeg","audio/mp3"].includes(type) || ["m4a","mp3"].includes(ext));
}
function asBytes(data: FfmpegFileData) { return typeof data === "string" ? new TextEncoder().encode(data) : data; }
function asArrayBuffer(bytes: Uint8Array): ArrayBuffer { const copy = new ArrayBuffer(bytes.byteLength); new Uint8Array(copy).set(bytes); return copy; }

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
  try {
    await withTimeout(ffmpeg.load({ coreURL, wasmURL, classWorkerURL }), CORE_LOAD_TIMEOUT_MS, "音訊優化器初始化逾時，請重新再試。");
  } catch (error) {
    ffmpeg.terminate?.();
    throw error;
  } finally {
    URL.revokeObjectURL(coreURL); URL.revokeObjectURL(wasmURL); URL.revokeObjectURL(classWorkerURL);
  }
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

export async function optimizeOwnerMusic(source: File, onProgress?: (p: OwnerMusicOptimizeProgress) => void): Promise<OptimizedOwnerMusic> {
  if (!source.size) throw new Error("音檔是空的。");
  if (source.size > MAX_SOURCE_BYTES) throw new Error("原始音檔超過 200 MB；請先裁短曲目後再上傳。");
  if (isCompactBrowserSafeAudio(source)) {
    onProgress?.({ percent: 58, label: "已是適合網站播放的格式，保留原音質" });
    return { file: source, sourceBytes: source.size, outputBytes: source.size, bitrateKbps: null, transcoded: false };
  }
  const ffmpeg = await loadFfmpeg(onProgress);
  const inputName = `owner-input.${extensionOf(source)}`; const outputName = "owner-output.m4a";
  let encodePercent = 12;
  const listener = ({ progress }: { progress: number }) => { const next = Math.max(12, Math.min(66, Math.round(12 + Math.max(0, progress) * 54))); if (next > encodePercent) { encodePercent = next; onProgress?.({ percent: next, label: "自動轉換 AAC / M4A" }); } };
  ffmpeg.on("progress", listener);
  let terminated = false;
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
    if (bytes.byteLength > TARGET_UPLOAD_BYTES) throw new Error("曲目太長；為避免把音質壓到明顯變差，AAC 64 kbps 後仍超過安全上傳大小。請裁短曲目後再試。");
    onProgress?.({ percent: 78, label: "音訊優化完成，準備上傳" });
    const file = new File([asArrayBuffer(bytes)], `${baseName(source)}.m4a`, { type: "audio/mp4" });
    return { file, sourceBytes: source.size, outputBytes: file.size, bitrateKbps: bitrate, transcoded: true };
  } catch (error) {
    if (error instanceof Error && /逾時/.test(error.message)) terminated = true;
    throw error;
  } finally {
    ffmpeg.off("progress", listener);
    if (!terminated) await Promise.allSettled([ffmpeg.deleteFile(inputName), ffmpeg.deleteFile(outputName)]);
  }
}
