import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LEGACY_VIDEO_PART_PREFIX = "loading-v13.part.";
const LEGACY_VIDEO_PART_COUNT = 2;
const LEGACY_VIDEO_SHA256 = "44fbc42a7623c5974deb590cbe05ff2dd140847440aee78f5f8d3ffc9f2dc7ae";
const VIDEO_PART_PREFIX = "loading-owner-r40.part.";
const VIDEO_PART_COUNT = 8;
const VIDEO_SHA256 = "e07dd134da5c77f2dc0fd97d846a42bdbca1645584d7990f4c6b51770424072c";
const POSTER_SHA256 = "d89af43a7f6d8d984d35811c7d90067379711dabd9b7ec428963e2e64d872894";

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

function decodeSingleB64(srcRel, destRel, magicHex, expectedSha256) {
  const src = resolve(ROOT, srcRel);
  if (!existsSync(src)) return false;
  const buf = Buffer.from(readFileSync(src, "utf8").replace(/\s+/g, ""), "base64");
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
  const legacy = decodeNumberedParts(
    "public/intro",
    LEGACY_VIDEO_PART_PREFIX,
    "public/intro/loading-v13.mp4",
    "0000002066747970",
    LEGACY_VIDEO_PART_COUNT,
    LEGACY_VIDEO_SHA256,
  );
  const video = decodeNumberedParts(
    "public/intro",
    VIDEO_PART_PREFIX,
    "public/intro/loading-owner-r40.mp4",
    "0000002066747970",
    VIDEO_PART_COUNT,
    VIDEO_SHA256,
  );
  const poster = decodeSingleB64(
    "public/intro/loading-owner-r40-poster.b64",
    "public/intro/loading-owner-r40.jpg",
    "ffd8ffe0",
    POSTER_SHA256,
  );
  return { legacy, video, poster };
}

writeIntroMedia();
