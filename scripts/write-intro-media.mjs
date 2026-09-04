import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VIDEO_PART_PREFIX = "loading-owner-r41.mp4.b64.";
const STILL_PART_PREFIX = "loading-owner-r41.jpg.b64.";
const VIDEO_PART_COUNT = 37;
const STILL_PART_COUNT = 4;
const VIDEO_SHA256 = "7582c123e3edbae40c7f5f3f91c024d8c1fa6053740e68bc5d71394fa697178f";
const STILL_SHA256 = "ad3d4787a7883b747b05eecfde71386d8cc7ac48a67a7f39b3a7656c6b8e6db2";

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
    "public/intro/loading-owner-r41.mp4",
    "0000002066747970",
    VIDEO_PART_COUNT,
    VIDEO_SHA256,
  );
  const still = decodeNumberedParts(
    "public/intro",
    STILL_PART_PREFIX,
    "public/intro/loading-owner-r41.jpg",
    "ffd8ffe0",
    STILL_PART_COUNT,
    STILL_SHA256,
  );
  return { video, still };
}

writeIntroMedia();
