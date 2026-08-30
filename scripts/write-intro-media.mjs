import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function decodeBase64Parts(partRels, destRel, magicHex) {
  const pieces = [];
  for (const rel of partRels) {
    const path = resolve(ROOT, rel);
    if (!existsSync(path)) return false;
    pieces.push(readFileSync(path, "utf8").replace(/\s+/g, ""));
  }
  const buf = Buffer.from(pieces.join(""), "base64");
  if (magicHex) {
    const got = buf.subarray(0, magicHex.length / 2).toString("hex");
    if (got !== magicHex) {
      throw new Error(`${destRel} decoded magic ${got}, expected ${magicHex}`);
    }
  }
  writeFileSync(resolve(ROOT, destRel), buf);
  return true;
}

export function writeIntroMedia() {
  const video = decodeBase64Parts(
    ["public/intro/loading-v11.mp4.b64.a", "public/intro/loading-v11.mp4.b64.b"],
    "public/intro/loading-v11.mp4",
    "0000002066747970",
  );
  const poster = decodeBase64Parts(
    ["public/intro/lotus-bloom-v12.webp.b64"],
    "public/intro/lotus-bloom-v12.webp",
    "52494646",
  );
  return { video, poster };
}

writeIntroMedia();
