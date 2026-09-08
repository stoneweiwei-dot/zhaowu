import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const PACK = resolve(HERE, "r96-assets");

function decode(name) {
  return Buffer.from(readFileSync(resolve(PACK, name), "utf8").replace(/\s+/g, ""), "base64");
}

export function writeR96Assets() {
  const files = [
    ["public/brand/logo-icon-gourd.png", "gourd.png.b64"],
    ["public/brand/logo-icon-gourd-180.png", "gourd-180.png.b64"],
    ["public/brand/logo-icon-gourd-256.png", "gourd-256.png.b64"],
    ["scripts/home-icons/zhaowu-gourd-16.png", "gourd-16.png.b64"],
    ["scripts/home-icons/zhaowu-gourd-32.png", "gourd-32.png.b64"],
    ["scripts/home-icons/zhaowu-gourd-180.png", "gourd-180.png.b64"],
    ["scripts/home-icons/zhaowu-gourd-192.png", "gourd-192.png.b64"],
    ["scripts/home-icons/zhaowu-gourd-512.png", "gourd-512.png.b64"],
    ["public/gallery/loading/jade-lotus-bloom-r96-poster.jpg", "poster.jpg.b64"],
  ];
  for (const [rel, pack] of files) {
    const path = resolve(ROOT, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, decode(pack));
  }
  const video = Buffer.concat(["video.part0.b64", "video.part1.b64", "video.part2.b64"].map(decode));
  const videoPath = resolve(ROOT, "public/gallery/loading/jade-lotus-bloom-r96.mp4");
  mkdirSync(dirname(videoPath), { recursive: true });
  writeFileSync(videoPath, video);
  return { videoBytes: video.length };
}

if (import.meta.url === `file://${process.argv[1]}`) writeR96Assets();
