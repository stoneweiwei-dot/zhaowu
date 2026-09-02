import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VIDEO_PART_PREFIX = "loading-v13.part.";
const VIDEO_PART_COUNT = 2;
const VIDEO_SHA256 = "44fbc42a7623c5974deb590cbe05ff2dd140847440aee78f5f8d3ffc9f2dc7ae";
const R33_STILL_PREFIX = "loading-r33-still.part.";
const R33_STILL_COUNT = 2;
const R33_STILL_SHA256 = "6eb2832059d86fe94337c4c39d6bffb8ee93d55c6f257898ae5a51c5fa476ff6";
const R33_BLOOM_PREFIX = "loading-r33-bloom.part.";
const R33_BLOOM_COUNT = 4;
const R33_BLOOM_SHA256 = "553c2ae1928609e30380b0c4d1f4307f835e33bb5ef23af42407a274b56d66e5";

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
    "public/intro/loading-v13.mp4",
    "0000002066747970",
    VIDEO_PART_COUNT,
    VIDEO_SHA256,
  );
  const still = decodeNumberedParts(
    "public/intro",
    R33_STILL_PREFIX,
    "public/intro/wutong-owner-r29.jpeg",
    "ffd8ff",
    R33_STILL_COUNT,
    R33_STILL_SHA256,
  );
  const bloom = decodeNumberedParts(
    "public/intro",
    R33_BLOOM_PREFIX,
    "public/intro/wutong-owner-r29.mp4",
    "0000002066747970",
    R33_BLOOM_COUNT,
    R33_BLOOM_SHA256,
  );
  return { video, still, bloom };
}

writeIntroMedia();
