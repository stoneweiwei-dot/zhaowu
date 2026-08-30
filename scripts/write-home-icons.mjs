import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const ICONS = [
  ["public/apple-touch-icon.png", "home-icon-180.b64"],
  ["public/apple-touch-icon-precomposed.png", "home-icon-180.b64"],
  ["public/icons/apple-touch-icon.png", "home-icon-180.b64"],
  ["public/icons/icon-192.png", "home-icon-192.b64"],
  ["public/icons/icon-512.png", "home-icon-512.b64"],
];

export function writeHomeIcons() {
  const written = [];
  for (const [rel, payloadName] of ICONS) {
    const path = resolve(ROOT, rel);
    mkdirSync(dirname(path), { recursive: true });
    const buffer = Buffer.from(readFileSync(resolve(HERE, payloadName), "utf8"), "base64");
    if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
      throw new Error(`${rel} is not a valid PNG`);
    }
    writeFileSync(path, buffer);
    written.push({ rel, bytes: buffer.length });
  }
  return written;
}

writeHomeIcons();
