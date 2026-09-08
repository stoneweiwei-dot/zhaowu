import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const ICON_SOURCES = {
  16: resolve(HERE, "home-icons/zhaowu-gourd-wordmark-r86-16.png"),
  32: resolve(HERE, "home-icons/zhaowu-gourd-wordmark-r86-32.png"),
  180: resolve(HERE, "home-icons/zhaowu-gourd-wordmark-r86-180.png"),
  192: resolve(HERE, "home-icons/zhaowu-gourd-wordmark-r86-192.png"),
  512: resolve(HERE, "home-icons/zhaowu-gourd-wordmark-r86-512.png"),
  1024: resolve(HERE, "home-icons/zhaowu-gourd-wordmark-r86-1024.png"),
};

function assertPng(path) {
  const buffer = readFileSync(path);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`${path} is not a valid PNG`);
  }
}

export function writeHomeIcons() {
  const files = [
    ["public/apple-touch-icon-r86.png", 180],
    ["public/apple-touch-icon-r86-precomposed.png", 180],
    ["public/apple-touch-icon.png", 180],
    ["public/apple-touch-icon-precomposed.png", 180],
    ["public/icons/apple-touch-icon.png", 180],
    ["public/icons/icon-192.png", 192],
    ["public/icons/icon-512.png", 512],
    ["public/icons/zhaowu-gourd-wordmark-r86-180.png", 180],
    ["public/icons/zhaowu-gourd-wordmark-r86-192.png", 192],
    ["public/icons/zhaowu-gourd-wordmark-r86-512.png", 512],
    ["public/icons/zhaowu-gourd-wordmark-r86-1024.png", 1024],
    ["public/android-chrome-192x192.png", 192],
    ["public/android-chrome-512x512.png", 512],
    ["public/favicon-32x32.png", 32],
    ["public/favicon-16x16.png", 16],
    ["public/favicon-r86-32x32.png", 32],
    ["public/favicon-r86-16x16.png", 16],
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
