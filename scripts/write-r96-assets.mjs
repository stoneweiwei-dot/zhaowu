import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const PACK = resolve(HERE, "r96-assets");

function decode(name) {
  const path = resolve(PACK, name);
  if (!existsSync(path)) return null;
  return Buffer.from(readFileSync(path, "utf8").replace(/\s+/g, ""), "base64");
}

function decodeGourd() {
  const parts = ["gourd-180.part0.b64", "gourd-180.part1.b64", "gourd-180.part2.b64"].map(decode);
  if (parts.every(Boolean)) return Buffer.concat(parts);
  return decode("gourd-180.png.b64");
}

export function writeR96Assets() {
  const gourd = decodeGourd();
  if (gourd && gourd.length >= 8000) {
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
  const parts = ["video.part0.b64", "video.part1.b64", "video.part2.b64"].map(decode);
  if (parts.every(Boolean)) {
    const videoPath = resolve(ROOT, "public/gallery/loading/jade-lotus-bloom-r96.mp4");
    mkdirSync(dirname(videoPath), { recursive: true });
    writeFileSync(videoPath, Buffer.concat(parts));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) writeR96Assets();
