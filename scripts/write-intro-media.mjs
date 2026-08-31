import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VIDEO_PART_PREFIX = "loading-v13.part.";
const VIDEO_PART_COUNT = 2;

function decodeNumberedParts(dirRel, prefix, destRel, magicHex, expectedCount) {
  const dir = resolve(ROOT, dirRel);
  if (!existsSync(dir)) return false;
  const names = readdirSync(dir)
    .filter((n) => n.startsWith(prefix))
    .sort();
  if (!names.length) return false;
  if (expectedCount && names.length < expectedCount) return false;
  const pieces = names.map((n) => readFileSync(resolve(dir, n), "utf8").replace(/\s+/g, ""));
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
  const video = decodeNumberedParts(
    "public/intro",
    VIDEO_PART_PREFIX,
    "public/intro/loading-v13.mp4",
    "0000002066747970",
    VIDEO_PART_COUNT,
  );
  const poster = decodeNumberedParts(
    "public/intro",
    "lotus-bloom-v12.webp.b64",
    "public/intro/lotus-bloom-v12.webp",
    "52494646",
    1,
  );
  return { video, poster };
}

writeIntroMedia();
