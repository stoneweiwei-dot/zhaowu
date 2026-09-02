import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

function decodeB64Source(stem, size) {
  const direct = resolve(HERE, `home-icons/${stem}.png`);
  const single = resolve(HERE, `home-icons/${stem}.png.b64`);
  if (existsSync(direct) && readFileSync(direct).subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
    return direct;
  }
  if (existsSync(single)) {
    const buf = Buffer.from(readFileSync(single, "utf8").replace(/\s+/g, ""), "base64");
    writeFileSync(direct, buf);
    return direct;
  }
  const parts = [0, 1, 2].map((i) => resolve(HERE, `home-icons/${stem}.png.b64.${String(i).padStart(2, "0")}`));
  if (parts.every((p) => existsSync(p))) {
    const buf = Buffer.from(parts.map((p) => readFileSync(p, "utf8").replace(/\s+/g, "")).join(""), "base64");
    writeFileSync(direct, buf);
    return direct;
  }
  throw new Error(`missing icon source for ${stem} (${size})`);
}

const ICON_SOURCES = {
  180: decodeB64Source("zhaowu-lotus-180", 180),
  192: decodeB64Source("zhaowu-lotus-192", 192),
  512: decodeB64Source("zhaowu-lotus-512", 512),
};

function assertPng(path) {
  const buffer = readFileSync(path);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${path} is not a valid PNG`);
  }
}

export function writeHomeIcons() {
  const files = [
    ["public/apple-touch-icon.png", 180],
    ["public/apple-touch-icon-precomposed.png", 180],
    ["public/apple-touch-icon-r20.png", 180],
    ["public/apple-touch-icon-r20-precomposed.png", 180],
    ["public/apple-touch-icon-r33.png", 180],
    ["public/apple-touch-icon-r33-precomposed.png", 180],
    ["public/icons/apple-touch-icon.png", 180],
    ["public/icons/icon-192.png", 192],
    ["public/icons/icon-512.png", 512],
    ["public/icons/zhaowu-lotus-192.png", 192],
    ["public/icons/zhaowu-lotus-512.png", 512],
  ];

  Object.values(ICON_SOURCES).forEach(assertPng);

  const written = [];
  for (const [rel, size] of files) {
    const path = resolve(ROOT, rel);
    mkdirSync(dirname(path), { recursive: true });
    copyFileSync(ICON_SOURCES[size], path);
    written.push({ rel, bytes: readFileSync(path).length });
  }
  return written;
}

writeHomeIcons();
