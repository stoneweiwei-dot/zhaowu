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

export function writeR96Assets() {
  const files = [
    ["public/brand/logo-icon-gourd.png", "gourd-180.png.b64"],
    ["public/brand/logo-icon-gourd-180.png", "gourd-180.png.b64"],
    ["public/gallery/loading/jade-lotus-bloom-r96-poster.jpg", "poster.jpg.b64"],
  ];
  for (const [rel, pack] of files) {
    const buf = decode(pack);
    if (!buf) continue;
    if (rel.includes("gourd") && buf.length < 8000) {
      throw new Error(`${pack} decoded to ${buf.length} bytes; gold gourd pack is a stub`);
    }
    if (buf.length < 64) continue;
    const path = resolve(ROOT, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, buf);
  }
  const parts = ["video.part0.b64", "video.part1.b64", "video.part2.b64"].map(decode);
  if (parts.every(Boolean)) {
    const videoPath = resolve(ROOT, "public/gallery/loading/jade-lotus-bloom-r96.mp4");
    mkdirSync(dirname(videoPath), { recursive: true });
    writeFileSync(videoPath, Buffer.concat(parts));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) writeR96Assets();
