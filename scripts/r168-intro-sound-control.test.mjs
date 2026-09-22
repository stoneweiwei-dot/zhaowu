import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("login animation sound control stays explicit and global intro stays inactive", async () => {
  const login = await source("src/routes/login.tsx");
  const routeRoot = await source("src/routes/__root.tsx");
  const css = await source("src/zhaowu-design-system.css");

  assert.match(login, /stone-login-sound/);
  assert.match(login, /aria-pressed=\{!muted\}/);
  assert.match(login, /muted=\{muted\}/);
  assert.match(login, /playsInline/);
  assert.doesNotMatch(routeRoot, /IntroGate/);
  assert.match(css, /\.stone-login-sound/);
});
