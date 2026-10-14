import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validSiteSkin, SITE_SKIN_IDS, readPublishedSiteSkin } from "../lib/owner-site-skin-public.js";

test("shared skin catalog covers all registered choices and classic", () => {
  const src = readFileSync("src/lib/theme-skins.ts", "utf8");
  const ids = [...src.matchAll(/\{ id: "([a-z-]+)", ref: (\d+), mode: "(light|dark)"/g)].map((match) => match[1]);
  assert.equal(ids.length, 18);
  assert.equal(SITE_SKIN_IDS.size, ids.length + 1);
  for (const id of ids) assert.equal(validSiteSkin(id), id);
  assert.equal(validSiteSkin("none"), "none");
  for (const id of ["", "../../api", "auto", "unknown", 1, null]) assert.equal(validSiteSkin(id), null);
});

test("public read: missing config means classic, no owner login needed", async () => {
  const result = await readPublishedSiteSkin(async () => ({ status: 404, ok: false }));
  assert.deepEqual(result, { skin: "pastel-koi", configured: false });
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

// Exercise the actual client module with controlled network replies: a focus
// refresh must not replace or invalidate an owner's in-flight publication.
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

function skinClient(fetcher) {
  const attrs = new Map();
  const context = vm.createContext({
    fetch: fetcher, Event,
    document: { documentElement: {
      setAttribute: (key, value) => attrs.set(key, value),
      removeAttribute: (key) => attrs.delete(key),
      getAttribute: (key) => attrs.get(key) ?? null,
    }, querySelector: () => null },
    window: { dispatchEvent() {} },
    localStorage: { removeItem() {} },
  });
  const source = readFileSync("src/lib/theme-skins.ts", "utf8")
    .replace(/^import .* from "react";\n/, "");
  vm.runInContext(stripTypeScriptTypes(source).replace(/\bexport /g, ""), context);
  return { attrs, run: (code) => vm.runInContext(code, context) };
}

test("focus refresh during publish cannot revert the chosen skin", async () => {
  let reply;
  let calls = 0;
  const client = skinClient(() => {
    calls++;
    return new Promise((resolve) => { reply = resolve; });
  });
  client.run('applySkin("verdant-dragon")');
  const publication = client.run('publishSkin("verdant-mist")');
  assert.equal(await client.run('refreshSharedSkin()'), null);
  assert.equal(calls, 1);
  reply({ ok: true, json: async () => ({ ok: true, skin: "verdant-mist" }) });
  await publication;
  assert.equal(client.attrs.get("data-zws"), "verdant-mist");
});

test("failed publish retains current skin and releases refresh lock", async () => {
  let calls = 0;
  const client = skinClient(async () => ++calls === 1
    ? { ok: false, status: 503 }
    : { ok: true, json: async () => ({ skin: "verdant-rain", configured: true }) });
  client.run('applySkin("verdant-dragon")');
  await assert.rejects(client.run('publishSkin("verdant-mist")'));
  assert.equal(client.attrs.get("data-zws"), "verdant-dragon");
  assert.equal(await client.run('refreshSharedSkin()'), "verdant-rain");
  assert.equal(client.attrs.get("data-zws-mode"), "dark");
});

test("public reader accepts each of the four new verdant skins", async () => {
  for (const skin of ["verdant-dragon", "verdant-mist", "verdant-pavilion", "verdant-rain"]) {
    const result = await readPublishedSiteSkin(async () => ({
      status: 200, ok: true, json: async () => ({ skin }),
    }));
    assert.equal(result.skin, skin);
    assert.equal(result.configured, true);
  }
});
