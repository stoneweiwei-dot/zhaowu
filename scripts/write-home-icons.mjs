import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const B64_DIR = resolve(HERE, "home-icons-b64");

const ICON_SOURCES = {
  180: resolve(HERE, "home-icons/zhaowu-lotus-180.png"),
  192: resolve(HERE, "home-icons/zhaowu-lotus-192.png"),
  512: resolve(HERE, "home-icons/zhaowu-lotus-512.png"),
};

function assertPng(path) {
  const buffer = readFileSync(path);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${path} is not a valid PNG`);
  }
}

function decodeJoined(prefix, dest) {
  if (!existsSync(B64_DIR)) return false;
  const names = readdirSync(B64_DIR)
    .filter((n) => n === prefix || n.startsWith(prefix))
    .sort();
  if (!names.length) return false;
  const pieces = names.map((n) => readFileSync(resolve(B64_DIR, n), "utf8").replace(/\s+/g, ""));
  writeFileSync(dest, Buffer.from(pieces.join(""), "base64"));
  return true;
}

function materializeSources() {
  mkdirSync(resolve(HERE, "home-icons"), { recursive: true });
  decodeJoined("zhaowu-lotus-180.png.b64", ICON_SOURCES[180]);
  decodeJoined("zhaowu-lotus-192.png.b64", ICON_SOURCES[192]);
  decodeJoined("zhaowu-lotus-512.part.", ICON_SOURCES[512]);
}

export function writeHomeIcons() {
  materializeSources();
  const files = [
    ["public/apple-touch-icon.png", 180],
    ["public/apple-touch-icon-precomposed.png", 180],
    ["public/apple-touch-icon-r20.png", 180],
    ["public/apple-touch-icon-r20-precomposed.png", 180],
    ["public/apple-touch-icon-r32.png", 180],
    ["public/apple-touch-icon-r32-precomposed.png", 180],
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
