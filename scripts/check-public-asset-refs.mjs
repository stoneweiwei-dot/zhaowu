import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(import.meta.url);
const root = resolve(dirname(script), "..");

// Read literals only. Never execute source code or fetch remote assets.
export function assetRefs(source, file) {
  const refs = new Set();
  const add = (path) => {
    let decoded = path;
    try { decoded = decodeURIComponent(path); } catch { /* Check malformed URLs literally. */ }
    if (!/^\/(?:sb|api|_vercel)\//.test(decoded) && !decoded.includes("\\") &&
        !decoded.split("/").includes("..")) refs.add(decoded);
  };
  // Quoted URL, CSS url(), or a subsequent srcset candidate with a descriptor.
  const urls = /(?:["'`(]|,\s+(?=\/[^\s,]+\s+\d+(?:\.\d+)?[wx]))(?:https:\/\/zhao-wu\.com)?(\/(?!\/)[^"'\r\n`<>()?#${},\\]+?\.[a-z\d]+)(?=["'`)?#]|\s+\d+(?:\.\d+)?[wx]\b)/gi;
  for (const match of source.matchAll(urls)) {
    // These arguments are suffix substitutions on an existing path.
    const before = source.slice(Math.max(0, match.index - 180), match.index);
    if (/\.(?:endsWith|replace)\($/.test(before) || /\.replace\([^()\n]*,\s*$/.test(before)) continue;
    add(match[1]);
  }

  if (file === "src/routes/-mythic-atlas-data.ts") {
    for (const [, name] of source.matchAll(/\bfile:\s*"([^"/]+\.png)"/g)) {
      add("/mythic-atlas/originals/" + name);
      add("/mythic-atlas/web/originals/" + name.replace(/\.png$/, ".webp"));
      add("/mythic-atlas/web/originals/" + name.replace(/\.png$/, "-thumb.webp"));
    }
  }
  if (file === "src/routes/bajinggong.tsx") {
    for (const [, field, name] of source.matchAll(/\b(image|original):\s*"([^"/]+\.(?:webp|png))"/g)) {
      add((field === "original" ? "/bajinggong/originals/" : "/bajinggong/") + name);
    }
  }

  // The Yunyi wall builds both its original and thumbnail URLs from a finite range.
  if (file === "src/routes/yunyi-shenxiang.tsx") {
    const count = Number(source.match(/className="yunyi-wall-grid">\{Array\.from\(\{ length: (\d+)/)?.[1]);
    for (const [, template] of source.matchAll(/`(\/[^\s`]*\$\{nn\}\.webp)`/g)) {
      for (let n = 1; n <= count; n++) add(template.replace("${nn}", String(n).padStart(2, "0")));
    }
  }
  return refs;
}

function* sourceFiles(directory) {
  for (const item of readdirSync(join(root, directory), { withFileTypes: true })) {
    const file = directory + "/" + item.name;
    if (item.isDirectory()) yield* sourceFiles(file);
    else if (/\.(?:[cm]?[jt]sx?|css|scss|svg|html?|json|mdx?)$/i.test(file)) yield file;
  }
}

export function checkPublicAssets() {
  if (!existsSync(join(root, "public"))) {
    console.log("Skipped asset check: public/ is absent from this copy.");
    return 0;
  }
  const directories = new Map();
  function hasFile(relative) {
    let dir = root;
    for (const part of relative.split("/")) {
      if (!directories.has(dir)) {
        if (!statSync(dir).isDirectory()) return false;
        directories.set(dir, new Set(readdirSync(dir)));
      }
      if (!directories.get(dir).has(part)) return false;
      dir = join(dir, part);
    }
    return statSync(dir).isFile();
  }

  const missing = new Map();
  for (const file of ["index.html", ...sourceFiles("src")]) {
    for (const path of assetRefs(readFileSync(join(root, file), "utf8"), file)) {
      const relative = path.slice(1);
      // Vite also resolves explicit source URLs (including the index module entry).
      if (hasFile("public/" + relative) || hasFile("src/assets/" + relative) ||
          (relative.startsWith("src/") && hasFile(relative))) continue;
      if (!missing.has(path)) missing.set(path, new Set());
      missing.get(path).add(file);
    }
  }
  for (const [path, files] of [...missing].sort()) console.error(path + " — " + [...files].join(", "));
  console.log(missing.size + " missing local asset reference(s).");
  return missing.size ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === script) process.exitCode = checkPublicAssets();
