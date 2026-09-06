import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SOURCE = resolve(HERE, "og-preview.jpg.b64");
const DEST = resolve(ROOT, "public/og.jpg");

export function writeOgPreview() {
  const raw = Buffer.from(readFileSync(SOURCE, "utf8").replace(/\s+/g, ""), "base64");
  if (raw.subarray(0, 2).toString("hex") !== "ffd8") {
    throw new Error("og preview source is not a JPEG");
  }
  mkdirSync(dirname(DEST), { recursive: true });
  writeFileSync(DEST, raw);
  return { rel: "public/og.jpg", bytes: raw.length };
}

writeOgPreview();
