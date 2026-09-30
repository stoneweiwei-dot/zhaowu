import { loadFfmpeg, withTimeout } from "@/lib/owner-music-transcode";

/**
 * Opening-video compression (owner instruction 2026-09-30: uploaded login videos should be
 * squeezed to within 10 seconds). Runs in the owner's browser with ffmpeg.wasm (same zero-cost,
 * client-side approach as the music optimiser) — no server transcoding, no paid service.
 * Output is a muted H.264 MP4, max 10 s, max 1280 px wide, which plays on every browser.
 */
export const LOGIN_VIDEO_MAX_SECONDS = 10;
const SKIP_IF_UNDER_BYTES = 6 * 1024 * 1024;
const MAX_SOURCE_BYTES = 300 * 1024 * 1024;
const TRANSCODE_TIMEOUT_MS = 240_000;

export type LoginVideoProgress = { percent: number; label: string };
export type LoginVideoCompressResult = {
  file: File;
  compressed: boolean;
  sourceBytes: number;
  outputBytes: number;
  /** Set when compression was skipped or failed and the original is uploaded unchanged. */
  skippedReason?: "small-enough" | "too-large" | "failed";
};

function baseName(file: File) {
  return (file.name.replace(/\.[^.]+$/, "").trim() || "opening").slice(0, 100);
}

export function shouldCompressLoginVideo(file: { size: number }, durationSeconds: number | null, playable: boolean) {
  if (file.size > MAX_SOURCE_BYTES) return false;
  if (!playable || durationSeconds === null) return true;
  return durationSeconds > LOGIN_VIDEO_MAX_SECONDS + 0.2 || file.size > SKIP_IF_UNDER_BYTES;
}

export async function compressLoginVideo(
  source: File,
  durationSeconds: number | null,
  playable: boolean,
  onProgress?: (progress: LoginVideoProgress) => void,
): Promise<LoginVideoCompressResult> {
  const unchanged = (skippedReason: LoginVideoCompressResult["skippedReason"]): LoginVideoCompressResult => ({
    file: source, compressed: false, sourceBytes: source.size, outputBytes: source.size, skippedReason,
  });
  if (source.size > MAX_SOURCE_BYTES) return unchanged("too-large");
  if (!shouldCompressLoginVideo(source, durationSeconds, playable)) return unchanged("small-enough");

  let ffmpeg: Awaited<ReturnType<typeof loadFfmpeg>> | null = null;
  try {
    ffmpeg = await loadFfmpeg(onProgress, "影片");
    const ext = (source.name.split(".").pop() || "mov").toLowerCase().replace(/[^a-z0-9]/g, "") || "mov";
    const inputName = `login-input.${ext}`;
    const outputName = "login-output.mp4";
    onProgress?.({ percent: 12, label: "讀取影片" });
    await ffmpeg.writeFile(inputName, new Uint8Array(await source.arrayBuffer()));
    const listener = ({ progress }: { progress: number }) => {
      if (Number.isFinite(progress)) onProgress?.({ percent: 15 + Math.round(Math.min(1, Math.max(0, progress)) * 80), label: "壓縮影片（最長 10 秒）" });
    };
    ffmpeg.on("progress", listener);
    // `-t` before `-i` limits how much of the input is read, so long clips are not fully decoded.
    const exit = await withTimeout(
      ffmpeg.exec([
        "-y", "-t", String(LOGIN_VIDEO_MAX_SECONDS), "-i", inputName,
        "-an", "-map_metadata", "-1",
        "-vf", "scale='min(1280,iw)':-2,fps=24",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "27", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", outputName,
      ]),
      TRANSCODE_TIMEOUT_MS,
      "影片壓縮逾時，已改為直接上傳原檔。",
    );
    ffmpeg.off("progress", listener);
    if (exit !== 0) throw new Error("ffmpeg-exit");
    const data = await ffmpeg.readFile(outputName);
    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
    if (!bytes.byteLength) throw new Error("empty-output");
    // Only keep the result when it is actually smaller or the source was longer than the cap.
    const copy = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(copy).set(bytes);
    const file = new File([copy], `${baseName(source)}.mp4`, { type: "video/mp4" });
    const longer = durationSeconds === null || durationSeconds > LOGIN_VIDEO_MAX_SECONDS + 0.2;
    if (!longer && file.size >= source.size) return unchanged("small-enough");
    onProgress?.({ percent: 97, label: "壓縮完成，準備上傳" });
    return { file, compressed: true, sourceBytes: source.size, outputBytes: file.size };
  } catch {
    return unchanged("failed");
  } finally {
    ffmpeg?.terminate?.();
  }
}
