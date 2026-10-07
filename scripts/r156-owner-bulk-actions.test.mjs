import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("owner music supports rename and one-request multi-delete", async () => {
  const client = await source("src/lib/owner-music-client.ts");
  const api = await source("api/owner-music-write.js");
  const git = await source("lib/owner-music-git.js");
  const manager = await source("src/components/owner-background-music-manager.tsx");

  assert.match(client, /export async function renameOwnerMusic/);
  assert.match(client, /action:\s*"rename"/);
  assert.match(client, /export async function deleteOwnerMusicMany/);
  assert.match(api, /renameOwnerMusicTrack/);
  assert.match(api, /deleteOwnerMusicTracks/);
  assert.match(api, /Array\.isArray\(body\?\.ids\)/);
  assert.match(git, /export async function renameOwnerMusicTrack/);
  assert.match(git, /export async function deleteOwnerMusicTracks/);
  assert.match(manager, /data-owner-bulk-toolbar="music"/);
  assert.match(manager, /editingName/);
  assert.match(manager, /保存名稱/);
  assert.match(manager, /批次刪除/);
});

test("owner media keeps direct actions clear while bulk stays on true bulk workflows", async () => {
  const music = await source("src/components/owner-background-music-manager.tsx");
  const gallery = await source("src/components/owner-gallery-manager.tsx");
  const login = await source("src/components/owner-login-visuals-manager.tsx");
  const account = await source("src/routes/account.tsx");

  assert.match(music, /data-owner-bulk-toolbar="music"/);
  assert.match(account, /data-owner-bulk-toolbar="reports"/);

  assert.doesNotMatch(gallery, /data-owner-bulk-toolbar="gallery"|批次顯示|批次隱藏/);
  assert.doesNotMatch(login, /data-owner-bulk-toolbar="login-visuals"|批次啟用|批次停用/);
  assert.match(gallery, /setAsHomepageBackground/);
  assert.match(gallery, /setHomeBackground/);
  assert.match(login, /setLoginVisualCurrent/);
  assert.match(login, /copy\.rename/);
});

test("bulk selectors remain touch-sized and destructive actions require confirmation", async () => {
  const music = await source("src/components/owner-background-music-manager.tsx");
  const gallery = await source("src/components/owner-gallery-manager.tsx");
  const login = await source("src/components/owner-login-visuals-manager.tsx");
  const account = await source("src/routes/account.tsx");

  for (const text of [music, gallery, login, account]) assert.match(text, /min-h-11|min-h-10/);
  assert.match(music, /window\.confirm\(c\.batchDeleteConfirm/);
  assert.match(gallery, /window\.confirm\(/);
  assert.match(login, /window\.confirm\(/);
  assert.match(account, /window\.confirm\(c\.batchDeleteReportsConfirm/);
});
