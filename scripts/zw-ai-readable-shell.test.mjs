import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("index.html ships a non-JS readable summary inside #root", async () => {
  const html = await read("index.html");
  const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/main><\/div>/);
  assert.ok(rootMatch, "root must wrap a static <main> summary");
  const summary = rootMatch[1];
  assert.match(summary, /<h1>昭梧｜昭於未見，梧於有歸<\/h1>/);
  assert.match(summary, /子平八字/);
  assert.match(summary, /<h2>常見問題<\/h2>/);
  assert.match(summary, /href="\/knowledge"/);
});

test("static summary is visually hidden but not display:none", async () => {
  const html = await read("index.html");
  const tag = html.match(/<main class="zw-static-shell"[^>]*>/)?.[0] ?? "";
  assert.match(tag, /clip:rect\(0,0,0,0\)/);
  assert.doesNotMatch(tag, /display:\s*none/);
});

test("public/llms.txt exists and is plain text with canonical origin", async () => {
  const txt = await read("public/llms.txt");
  assert.match(txt, /^# 昭梧/);
  assert.match(txt, /https:\/\/stone-zhaowu-official\.vercel\.app\//);
  assert.match(txt, /## 常見問題/);
});

test("createRoot is still used (no hydration of the static summary)", async () => {
  const main = await read("src/main.tsx");
  assert.match(main, /createRoot\(root\)\.render/);
  assert.doesNotMatch(main, /hydrateRoot/);
});
