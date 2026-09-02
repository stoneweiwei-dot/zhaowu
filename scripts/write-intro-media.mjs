import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VIDEO_PART_PREFIX = "dawn-lotus-r34.mp4.b64.";
const STILL_PART_PREFIX = "dawn-lotus-r34.jpg.b64.";
const VIDEO_PART_COUNT = 8;
const STILL_PART_COUNT = 2;
const VIDEO_SHA256 = "1c90d5fe5eb6b71757f1b884f2f75b924ef1efc141ade752ce8accd09769e473";
const STILL_SHA256 = "058af8622797a58a2b84e001e52e3ae239a9237b021e262816ef07eb2b1479a0";

function decodeNumberedParts(dirRel, prefix, destRel, magicHex, expectedCount, expectedSha256) {
  const dir = resolve(ROOT, dirRel);
  if (!existsSync(dir)) return false;
  const names = readdirSync(dir)
    .filter((n) => n.startsWith(prefix))
    .sort();
  if (!names.length) return false;
  if (expectedCount && names.length !== expectedCount) {
    throw new Error(`${destRel} expected ${expectedCount} parts, found ${names.length}`);
  }
  const pieces = names.map((n) => readFileSync(resolve(dir, n), "utf8").replace(/\s+/g, ""));
  const buf = Buffer.from(pieces.join(""), "base64");
  if (magicHex) {
    const got = buf.subarray(0, magicHex.length / 2).toString("hex");
    if (got !== magicHex) {
      throw new Error(`${destRel} decoded magic ${got}, expected ${magicHex}`);
    }
  }
  if (expectedSha256) {
    const got = createHash("sha256").update(buf).digest("hex");
    if (got !== expectedSha256) {
      throw new Error(`${destRel} decoded sha256 ${got}, expected ${expectedSha256}`);
    }
  }
  writeFileSync(resolve(ROOT, destRel), buf);
  return true;
}

export function writeIntroMedia() {
  const video = decodeNumberedParts(
    "public/intro",
    VIDEO_PART_PREFIX,
    "public/intro/dawn-lotus-r34.mp4",
    "0000002066747970",
    VIDEO_PART_COUNT,
    VIDEO_SHA256,
  );
  const still = decodeNumberedParts(
    "public/intro",
    STILL_PART_PREFIX,
    "public/intro/dawn-lotus-r34.jpg",
    "ffd8ffe0",
    STILL_PART_COUNT,
    STILL_SHA256,
  );
  return { video, still };
}

writeIntroMedia();
