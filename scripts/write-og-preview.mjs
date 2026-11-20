import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SINGLE = resolve(HERE, "og-preview.jpg.b64");
const PREFIX = "og-preview.jpg.b64.";
const DEST = resolve(ROOT, "public/og.jpg");
function readLocalPayload() {
  if (existsSync(SINGLE)) {
    return readFileSync(SINGLE, "utf8").replace(/\s+/g, "");
  }
  const names = readdirSync(HERE)
    .filter((name) => name.startsWith(PREFIX) && /^\d+$/.test(name.slice(PREFIX.length)))
    .sort();
  if (!names.length) return "";
  return names.map((name) => readFileSync(resolve(HERE, name), "utf8").replace(/\s+/g, "")).join("");
}

function validateJpeg(raw) {
  if (raw.subarray(0, 2).toString("hex") !== "ffd8") {
    throw new Error("og preview source is not a JPEG");
  }
  if (raw.readUInt16BE(raw.length - 2) !== 0xffd9) {
    throw new Error("og preview source is an incomplete JPEG");
  }
  return raw;
}

export function writeOgPreview() {
  const payload = readLocalPayload();
  // The checked-in production image is the deterministic offline source of truth.
  // Do not make builds depend on an old feature branch or raw.githubusercontent.com.
  const raw = payload
    ? validateJpeg(Buffer.from(payload, "base64"))
    : existsSync(DEST)
      ? validateJpeg(readFileSync(DEST))
      : null;
  if (!raw) {
    throw new Error("og preview source is missing: restore public/og.jpg or a local scripts/og-preview payload");
  }
  mkdirSync(dirname(DEST), { recursive: true });
  writeFileSync(DEST, raw);
  return { rel: "public/og.jpg", bytes: raw.length };
}

const runningDirect = fileURLToPath(import.meta.url) === process.argv[1] || process.argv[1]?.endsWith("write-og-preview.mjs");
if (runningDirect) {
  await writeOgPreview();
}
