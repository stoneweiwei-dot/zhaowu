import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// The owner-music write path used to reject with a slice of the raw
// git-receive-pack stream. That stream is not a human-readable reason.
// Guards: the owner sees a fixed Chinese message, and server logs record
// only the HTTP status — never a response body, token, or wire dump.

const root = new URL("..", import.meta.url);
const source = (rel) => readFile(new URL(rel, root), "utf8");

test("music write failures stay bounded and do not echo GitHub or SSH bytes", async () => {
  const lib = await source("lib/owner-music-git.js");

  assert.doesNotMatch(lib, /reject\(new Error\(`曲目保存失敗。\$\{out/);
  assert.doesNotMatch(lib, /out\.slice\(-300\)/);
  assert.doesNotMatch(lib, /git-receive-pack|ssh2|privateKey|BEGIN OPENSSH/);
  assert.match(lib, /曲目保存失敗，請稍後再試一次；若持續失敗請截圖聯絡站主排查。/);
  assert.match(lib, /console\.error\(`\[owner-music\] GitHub \$\{method\} \$\{urlPath\} failed HTTP \$\{res\.status\}`\)/);
  assert.doesNotMatch(lib, /console\.error\([^)]*raw/);
  assert.doesNotMatch(lib, /authorization: `Bearer \$\{token\}`[\s\S]{0,80}console\.error\([^)]*token/);
});
