import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validSiteSkin, SITE_SKIN_IDS, readPublishedSiteSkin } from "../lib/owner-site-skin-public.js";

test("shared skin catalog covers all 14 registered choices and classic", () => {
  const src = readFileSync("src/lib/theme-skins.ts", "utf8");
  const ids = [...src.matchAll(/\{ id: "([a-z-]+)", ref: (\d+), mode: "(light|dark)"/g)].map((match) => match[1]);
  assert.equal(ids.length, 14);
  assert.equal(SITE_SKIN_IDS.size, 15);
  for (const id of ids) assert.equal(validSiteSkin(id), id);
  assert.equal(validSiteSkin("none"), "none");
  for (const id of ["", "../../api", "auto", "unknown", 1, null]) assert.equal(validSiteSkin(id), null);
});

test("public read: missing config means classic, no owner login needed", async () => {
  const result = await readPublishedSiteSkin(async () => ({ status: 404, ok: false }));
  assert.deepEqual(result, { skin: "none", configured: false });
});

test("public read: chooses only known theme id, rejects poisoned values", async () => {
  const valid = await readPublishedSiteSkin(async () => ({
    status: 200, ok: true,
    json: async () => ({ skin: "song-clear-dragon", updatedAt: "2026-10-13T00:00:00.000Z" }),
  }));
  assert.deepEqual(valid, { skin: "song-clear-dragon", configured: true, updatedAt: "2026-10-13T00:00:00.000Z" });
  await assert.rejects(readPublishedSiteSkin(async () => ({
    status: 200, ok: true, json: async () => ({ skin: "future-unregistered" }),
  })));
});

test("public read: upstream error is not mistaken for classic", async () => {
  await assert.rejects(readPublishedSiteSkin(async () => ({ status: 503, ok: false })));
});

test("owner write is cookie gated, same-origin only and the UI never reports local-only success", () => {
  const api = readFileSync("api/owner-data.js", "utf8");
  const skin = readFileSync("src/lib/theme-skins.ts", "utf8");
  const manager = readFileSync("src/components/owner-theme-skins-manager.tsx", "utf8");
  const shell = readFileSync("src/components/site-shell.tsx", "utf8");
  assert.match(api, /ownerSecretFromRequest\(req\)/);
  assert.match(api, /if \(!requestIsSameOrigin\(req\)\)/);
  assert.match(api, /if \(!ownerSecret\)/);
  assert.match(api, /validSiteSkin\(payload\?\.skin\)/);
  assert.match(skin, /await fetch\("\/api\/owner-data", \{/);
  assert.match(skin, /if \(!response\.ok\) throw new Error/);
  assert.match(skin, /localStorage\.removeItem\(SKIN_KEY\)/);
  assert.doesNotMatch(skin, /localStorage\.setItem\(SKIN_KEY/);
  assert.match(api, /view !== "site-skin"/);
  assert.match(api, /action === "site-skin.publish"/);
  assert.match(manager, /await apply\(next\)/);
  assert.match(shell, /refreshSharedSkin\(\)/);
});
