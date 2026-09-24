import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (p) => readFile(new URL(p, root), "utf8");

test("r194 keeps the storage policy gate but enables writes for the approved Pro plan", async () => {
  const policy = await source("src/lib/storage-write-policy.ts");
  const gallery = await source("src/lib/gallery-assets.ts");
  const backgrounds = await source("src/lib/background-assets.ts");
  const decree = await source("src/lib/report/decree-image.ts");
  const bridgeGallery = await source("src/lib/bridge/gallery-assets.ts");
  const bridgeBackgrounds = await source("src/lib/bridge/background-assets.ts");
  const bridgeDecree = await source("src/lib/bridge/decree-image.ts");
  const ownerApi = await source("api/owner-data.js");
  const ownerClient = await source("src/lib/owner-data-client.ts");
  const ownerEdge = await source("supabase/functions/zhaowu-owner-data/index.ts");

  assert.match(policy, /SUPABASE_STORAGE_WRITES_PAUSED = false/);
  for (const file of [gallery, backgrounds, decree, bridgeGallery, bridgeBackgrounds, bridgeDecree]) {
    assert.match(file, /assertSupabaseStorageWritesEnabled/);
  }
  assert.doesNotMatch(ownerApi, /STORAGE_GROWING_ACTIONS/);
  assert.match(ownerClient, /new tus\.Upload/);
  assert.match(ownerClient, /chunkSize: 6 \* 1024 \* 1024/);
  assert.match(ownerClient, /"x-signature": signedUploadToken/);
  assert.match(ownerEdge, /MAX_LOADING_VIDEO_BYTES = 500 \* 1024 \* 1024/);
});

test("r194 owner UI storage controls follow the shared live policy", async () => {
  const galleryUi = await source("src/components/owner-gallery-manager.tsx");
  const loginUi = await source("src/components/owner-login-visuals-manager.tsx");
  const account = await source("src/routes/account.tsx");

  assert.match(galleryUi, /disabled=\{SUPABASE_STORAGE_WRITES_PAUSED\}/);
  assert.match(loginUi, /disabled=\{SUPABASE_STORAGE_WRITES_PAUSED\}/);
  assert.match(account, /disabled=\{SUPABASE_STORAGE_WRITES_PAUSED\}/);
  assert.match(account, /loadExistingDecreeImage/);
});
