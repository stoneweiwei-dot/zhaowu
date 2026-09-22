import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (p) => readFile(new URL(p, root), "utf8");

test("r181 freezes every known Supabase Storage growth path", async () => {
  const policy = await source("src/lib/storage-write-policy.ts");
  const gallery = await source("src/lib/gallery-assets.ts");
  const backgrounds = await source("src/lib/background-assets.ts");
  const decree = await source("src/lib/report/decree-image.ts");
  const bridgeGallery = await source("src/lib/bridge/gallery-assets.ts");
  const bridgeBackgrounds = await source("src/lib/bridge/background-assets.ts");
  const bridgeDecree = await source("src/lib/bridge/decree-image.ts");
  const ownerApi = await source("api/owner-data.js");

  assert.match(policy, /SUPABASE_STORAGE_WRITES_PAUSED = true/);
  for (const file of [gallery, backgrounds, decree, bridgeGallery, bridgeBackgrounds, bridgeDecree]) {
    assert.match(file, /assertSupabaseStorageWritesEnabled/);
  }
  assert.match(ownerApi, /STORAGE_GROWING_ACTIONS/);
  assert.match(ownerApi, /background\.prepareUpload/);
  assert.match(ownerApi, /gallery\.prepareUpload/);
  assert.match(ownerApi, /report\.generateImage/);
  assert.match(ownerApi, /STORAGE_WRITES_PAUSED/);
});

test("r181 owner UI exposes storage growth controls as disabled while cleanup is active", async () => {
  const galleryUi = await source("src/components/owner-gallery-manager.tsx");
  const loginUi = await source("src/components/owner-login-visuals-manager.tsx");
  const account = await source("src/routes/account.tsx");

  assert.match(galleryUi, /disabled=\{SUPABASE_STORAGE_WRITES_PAUSED\}/);
  assert.match(loginUi, /disabled=\{SUPABASE_STORAGE_WRITES_PAUSED\}/);
  assert.match(account, /disabled=\{SUPABASE_STORAGE_WRITES_PAUSED\}/);
  assert.match(account, /loadExistingDecreeImage/);
});
