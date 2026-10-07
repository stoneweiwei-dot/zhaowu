import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("static login has no sound control and global intro stays inactive", async () => {
  const login = await source("src/routes/login.tsx");
  const routeRoot = await source("src/routes/__root.tsx");
  const css = await source("src/zhaowu-design-system.css");

  assert.match(login, /data-login-stage-static="true"/);
  assert.doesNotMatch(login, /stone-login-sound|<video/);
  assert.doesNotMatch(routeRoot, /IntroGate/);
  assert.ok(css.length > 0);
});
