import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

// 2026-10-02 owner instruction: the site ships three languages (繁體 / 简体 / English).
// A one-line `locale === "en" ? <english> : <chinese>` ternary silently serves Traditional text to
// Simplified readers. This guard fails when such a line contains characters that are Traditional-only
// and the line has no Simplified branch. Add the Simplified branch (locale === "zh-Hans" ? ... : ...).

const root = new URL("../src/", import.meta.url);
const TRAD = "個兩冊參圓圖宮專恆應數暫書時極樂機測獨現當盤經緣編總號計證資適陰陽靈頁題驗驟黃對體氣學會國點開關運說為與來們這";
const TERN = /(?:language|locale|lang|isEn|isEnglish)\s*===\s*"en"\s*\?/;
// A line is handled when it names zh-Hans explicitly, or splits Traditional from the remainder
// (`locale === "zh-Hant" ? hant : hans`), which already routes Simplified readers to the else branch.
const HANS = /zh-Hans|Hans|hans|isSimplified|===\s*"zh-Hant"/;
// Files owned by an open PR at the time of writing (docs/AI-COORDINATION.md file lock); remove once merged.
const LOCKED = new Set(["components/unified-birth-report.tsx"]);

async function* walk(dir, base = "") {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = join(base, entry.name);
    if (entry.isDirectory()) yield* walk(new URL(`${entry.name}/`, dir), rel);
    else if (/\.(ts|tsx)$/.test(entry.name)) yield [rel, new URL(entry.name, dir)];
  }
}

test("one-line en-vs-Chinese ternaries never serve Traditional-only text to Simplified readers", async () => {
  const offenders = [];
  for await (const [rel, url] of walk(root)) {
    if (LOCKED.has(rel.replaceAll("\\", "/"))) continue;
    const lines = (await readFile(url, "utf8")).split("\n");
    lines.forEach((line, index) => {
      if (!TERN.test(line) || HANS.test(line)) return;
      const bad = [...line].filter((ch) => TRAD.includes(ch));
      if (bad.length) offenders.push(`${rel}:${index + 1} [${[...new Set(bad)].join("")}] ${line.trim().slice(0, 120)}`);
    });
  }
  assert.deepEqual(offenders, [], `Traditional-only text without a zh-Hans branch:\n${offenders.join("\n")}`);
});
