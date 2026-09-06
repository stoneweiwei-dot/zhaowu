import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SINGLE = resolve(HERE, "og-preview.jpg.b64");
const PREFIX = "og-preview.jpg.b64.";
const DEST = resolve(ROOT, "public/og.jpg");

function readPayload() {
  if (existsSync(SINGLE)) {
    return readFileSync(SINGLE, "utf8").replace(/\s+/g, "");
  }
  const names = readdirSync(HERE)
    .filter((name) => name.startsWith(PREFIX) && /^\d+$/.test(name.slice(PREFIX.length)))
    .sort();
  if (!names.length) {
    throw new Error("og preview payload parts are missing");
  }
  return names.map((name) => readFileSync(resolve(HERE, name), "utf8").replace(/\s+/g, "")).join("");
}

export function writeOgPreview() {
  const raw = Buffer.from(readPayload(), "base64");
  if (raw.subarray(0, 2).toString("hex") !== "ffd8") {
    throw new Error("og preview source is not a JPEG");
  }
  mkdirSync(dirname(DEST), { recursive: true });
  writeFileSync(DEST, raw);
  return { rel: "public/og.jpg", bytes: raw.length };
}

writeOgPreview();
