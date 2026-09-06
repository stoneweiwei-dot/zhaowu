import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR_REL = "public/gallery/loading";
const PREFIX = "loading-pack.part.";
const EXPECTED_COUNT = 19;

export function writeLoadingGallery() {
  const dir = resolve(ROOT, DIR_REL);
  if (!existsSync(dir)) return false;
  const names = readdirSync(dir).filter((name) => name.startsWith(PREFIX)).sort();
  if (names.length < EXPECTED_COUNT) return false;
  try {
    const raw = names.map((name) => readFileSync(resolve(dir, name), "utf8").replace(/\s+/g, "")).join("");
    const pack = JSON.parse(raw);
    if (!pack || typeof pack !== "object") return false;
    mkdirSync(dir, { recursive: true });
    for (const [name, b64] of Object.entries(pack)) {
      if (typeof name !== "string" || typeof b64 !== "string") continue;
      if (!/^[a-z0-9.-]+\.(jpg|jpeg|webp)$/i.test(name)) continue;
      writeFileSync(resolve(dir, name), Buffer.from(b64, "base64"));
    }
    return true;
  } catch {
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeLoadingGallery();
}
