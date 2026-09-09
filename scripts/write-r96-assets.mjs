import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const PACK = resolve(HERE, "r96-assets");

function decode(name) {
  const path = resolve(PACK, name);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf8").replace(/\s+/g, "");
  if (!raw) return null;
  try {
    return Buffer.from(raw, "base64");
  } catch {
    return null;
  }
}

function isPng(buf) {
  return buf
    && buf.length >= 8000
    && buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"
    && buf.includes(Buffer.from("IEND"));
}

function decodeGourd() {
  const single = decode("gourd-180.png.b64");
  if (isPng(single)) return single;
  const parts = ["gourd-180.part0.b64", "gourd-180.part1.b64", "gourd-180.part2.b64"].map(decode);
  if (parts.every(Boolean)) {
    const joined = Buffer.concat(parts);
    if (isPng(joined)) return joined;
  }
  return null;
}

export function writeR96Assets() {
  const gourd = decodeGourd();
  if (gourd) {
    for (const rel of ["public/brand/logo-icon-gourd.png", "public/brand/logo-icon-gourd-180.png"]) {
      const path = resolve(ROOT, rel);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, gourd);
    }
  }
  const poster = decode("poster.jpg.b64");
  if (poster && poster.length >= 64) {
    const path = resolve(ROOT, "public/gallery/loading/jade-lotus-bloom-r96-poster.jpg");
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, poster);
  }
  const video = decode("video.b64") || (() => {
    const parts = ["video.part0.b64", "video.part1.b64", "video.part2.b64"].map(decode);
    return parts.every(Boolean) ? Buffer.concat(parts) : null;
  })();
  if (video && video.length >= 1024) {
    const videoPath = resolve(ROOT, "public/gallery/loading/jade-lotus-bloom-r96.mp4");
    mkdirSync(dirname(videoPath), { recursive: true });
    writeFileSync(videoPath, video);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) writeR96Assets();
