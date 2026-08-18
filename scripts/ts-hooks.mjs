import { registerHooks } from "node:module";
import { existsSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "..", "src");

function asFileUrl(absPath) {
  return pathToFileURL(absPath).href;
}

function pickExisting(base) {
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, join(base, "index.ts")];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const hit = pickExisting(join(SRC, specifier.slice(2)));
      if (hit) return { url: asFileUrl(hit), shortCircuit: true };
    }
    if (specifier.startsWith(".") && context.parentURL) {
      const parentDir = dirname(fileURLToPath(context.parentURL));
      const raw = join(parentDir, specifier);
      if (!extname(specifier)) {
        const hit = pickExisting(raw);
        if (hit) return { url: asFileUrl(hit), shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
});
