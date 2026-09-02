import { copyFileSync, mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const ICON_SOURCES = {
  180: resolve(HERE, "home-icons/zhaowu-lotus-180.png"),
  192: resolve(HERE, "home-icons/zhaowu-lotus-192.png"),
  512: resolve(HERE, "home-icons/zhaowu-lotus-512.png"),
};

function decodeParts(prefix, dest) {
  const dir = resolve(HERE, "home-icons");
  if (!existsSync(dir)) return false;
  const names = readdirSync(dir)
    .filter((n) => n.startsWith(prefix) && n.includes(".b64."))
    .sort();
  if (!names.length) return false;
  const buf = Buffer.from(names.map((n) => readFileSync(resolve(dir, n), "utf8").replace(/\s+/g, "")).join(""), "base64");
  if (buf.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${dest} decoded file is not a PNG`);
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, buf);
  return true;
}

function assertPng(path) {
  const buffer = readFileSync(path);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${path} is not a valid PNG`);
  }
}

export function writeHomeIcons() {
  decodeParts("zhaowu-lotus-180.png.b64.", ICON_SOURCES[180]);
  decodeParts("zhaowu-lotus-192.png.b64.", ICON_SOURCES[192]);
  decodeParts("zhaowu-lotus-512.png.b64.", ICON_SOURCES[512]);

  const files = [
    ["public/apple-touch-icon.png", 180],
    ["public/apple-touch-icon-precomposed.png", 180],
    ["public/apple-touch-icon-r20.png", 180],
    ["public/apple-touch-icon-r20-precomposed.png", 180],
    ["public/apple-touch-icon-r34.png", 180],
    ["public/apple-touch-icon-r34-precomposed.png", 180],
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
