import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// The owner-music write path's git-receive-pack rejection used to reject
// with `曲目保存失敗。${out.slice(-300)}` — `out` is the raw git wire-protocol
// pkt-line stream, which on an early failure (before our push is ever
// acknowledged) is just the tail of the *initial ref advertisement*: raw
// commit SHAs and every branch name in the repo (e.g.
// refs/heads/visual-baseline/today-regression), not a human-readable
// reason. That garbage landed verbatim in the owner-facing error banner.
// Guards: the raw response is logged server-side only (for Vercel runtime
// log diagnosis) and the owner sees a clean, bounded Chinese message with
// no interpolated wire-protocol bytes.

const root = new URL("..", import.meta.url);
const source = (rel) => readFile(new URL(rel, root), "utf8");

test("git-receive-pack failure never interpolates the raw wire response into the owner-facing error", async () => {
  const lib = await source("lib/owner-music-git.js");

  // The old leak: template-interpolating `out` (sliced or not) directly into
  // the rejected Error's message.
  assert.doesNotMatch(lib, /reject\(new Error\(`曲目保存失敗。\$\{out/);
  assert.doesNotMatch(lib, /out\.slice\(-300\)/);

  // The new behavior: a fixed, bounded Chinese message with no `out`
  // interpolation reaching the client...
  assert.match(lib, /reject\(new Error\("曲目保存失敗，請稍後再試一次/);

  // ...while the full raw response is still captured server-side for
  // diagnosis via Vercel runtime logs.
  assert.match(lib, /console\.error\(`\[owner-music\] git-receive-pack push to refs\/heads\/\$\{BRANCH\} rejected \(exit \$\{code\}\): \$\{out/);
});
