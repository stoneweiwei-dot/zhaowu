import lamejs from "./vendor/lamejs.js";

type NativeProgress = { percent: number; label: string };

const LAME_RATES = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000];

function asBytes(data: Int8Array) {
  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

export function pickLameSampleRate(rate: number) {
  if (LAME_RATES.includes(rate)) return rate;
  return rate >= 44100 ? 48000 : 44100;
}

export function resampleChannel(input: Float32Array, fromRate: number, toRate: number) {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const length = Math.max(1, Math.round(input.length / ratio));
  const out = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const src = i * ratio;
    const left = Math.min(input.length - 1, Math.floor(src));
    const right = Math.min(input.length - 1, left + 1);
    const mix = src - left;
    out[i] = input[left] * (1 - mix) + input[right] * mix;
  }
  return out;
}

export function floatToInt16(input: Float32Array) {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, input[i] ?? 0));
    out[i] = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
  }
  return out;
}

export function encodePcmToMp3(left: Int16Array, right: Int16Array | null, sampleRate: number, kbps: number) {
  const encoder = new lamejs.Mp3Encoder(right ? 2 : 1, sampleRate, kbps);
  const frame = 1152;
  const parts: Uint8Array[] = [];
  let total = 0;
  for (let offset = 0; offset < left.length; offset += frame) {
    const end = Math.min(left.length, offset + frame);
    const encoded = right
      ? encoder.encodeBuffer(left.subarray(offset, end), right.subarray(offset, end))
      : encoder.encodeBuffer(left.subarray(offset, end));
    if (encoded.length) {
      const copy = asBytes(encoded);
      parts.push(copy);
      total += copy.byteLength;
    }
  }
  const flushed = encoder.flush();
  if (flushed.length) {
    const copy = asBytes(flushed);
    parts.push(copy);
    total += copy.byteLength;
  }
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const part of parts) {
    out.set(part, cursor);
    cursor += part.byteLength;
  }
  return out;
}

function decodeAudioBuffer(ctx: AudioContext, data: ArrayBuffer) {
  return new Promise<AudioBuffer>((resolve, reject) => {
    let settled = false;
    const ok = (buffer: AudioBuffer) => {
      if (settled) return;
      settled = true;
      resolve(buffer);
    };
    const fail = (error?: unknown) => {
      if (settled) return;
      settled = true;
      reject(error instanceof Error ? error : new Error("這個音檔無法在此裝置解碼。"));
    };
    try {
      const result = ctx.decodeAudioData(data, ok, fail) as Promise<AudioBuffer> | void;
      if (result && typeof result.then === "function") result.then(ok, fail);
    } catch (error) {
      fail(error);
    }
  });
}

export type DecodedOwnerPcm = {
  left: Int16Array;
  right: Int16Array | null;
  sampleRate: number;
};

export async function decodeOwnerAudioPcm(
  source: File,
  onProgress?: (progress: NativeProgress) => void,
): Promise<DecodedOwnerPcm | null> {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();
  try {
    if (ctx.state === "suspended") {
      await Promise.race([
        ctx.resume().catch(() => undefined),
        new Promise<void>((resolve) => { setTimeout(resolve, 1200); }),
      ]);
    }
    onProgress?.({ percent: 12, label: "本機解碼音樂（不下載大型轉碼器）" });
    const buffer = await decodeAudioBuffer(ctx, (await source.arrayBuffer()).slice(0));
    const sampleRate = pickLameSampleRate(buffer.sampleRate);
    const leftFloat = resampleChannel(buffer.getChannelData(0), buffer.sampleRate, sampleRate);
    const rightFloat = buffer.numberOfChannels > 1
      ? resampleChannel(buffer.getChannelData(1), buffer.sampleRate, sampleRate)
      : null;
    return {
      left: floatToInt16(leftFloat),
      right: rightFloat ? floatToInt16(rightFloat) : null,
      sampleRate,
    };
  } catch {
    return null;
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

export function encodeDecodedOwnerMp3(pcm: DecodedOwnerPcm, kbps: number) {
  const bytes = encodePcmToMp3(pcm.left, pcm.right, pcm.sampleRate, kbps);
  return bytes.byteLength < 256 ? null : bytes;
}
