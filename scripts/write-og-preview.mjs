import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SINGLE = resolve(HERE, "og-preview.jpg.b64");
const PREFIX = "og-preview.jpg.b64.";
const DEST = resolve(ROOT, "public/og.jpg");
const PARTS = ["00", "01", "02", "030", "031", "032", "040", "041", "042", "050", "051", "052"];
const RAW_BASE = "https://raw.githubusercontent.com/stoneweiwei-dot/zhaowu/feat/r61-og-preview-card/scripts/";

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

async function readRemotePayload() {
  const chunks = await Promise.all(
    PARTS.map(async (part) => {
      const res = await fetch(`${RAW_BASE}${PREFIX}${part}`);
      if (!res.ok) throw new Error(`og preview payload ${part} HTTP ${res.status}`);
      return (await res.text()).replace(/\s+/g, "");
    }),
  );
  return chunks.join("");
}

export async function writeOgPreview() {
  let payload = readLocalPayload();
  if (!payload) payload = await readRemotePayload();
  const raw = Buffer.from(payload, "base64");
  if (raw.subarray(0, 2).toString("hex") !== "ffd8") {
    throw new Error("og preview source is not a JPEG");
  }
  mkdirSync(dirname(DEST), { recursive: true });
  writeFileSync(DEST, raw);
  return { rel: "public/og.jpg", bytes: raw.length };
}

const runningDirect = fileURLToPath(import.meta.url) === process.argv[1] || process.argv[1]?.endsWith("write-og-preview.mjs");
if (runningDirect) {
  await writeOgPreview();
}
