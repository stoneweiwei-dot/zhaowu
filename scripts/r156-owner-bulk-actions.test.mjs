import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("owner music supports rename and one-request multi-delete", async () => {
  const client = await source("src/lib/owner-music-client.ts");
  const api = await source("api/owner-music.js");
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
  assert.match(manager, /刪除所選/);
});

test("all owner file lists expose multi-select batch controls", async () => {
  const music = await source("src/components/owner-background-music-manager.tsx");
  const gallery = await source("src/components/owner-gallery-manager.tsx");
  const login = await source("src/components/owner-login-visuals-manager.tsx");
  const account = await source("src/routes/account.tsx");

  assert.match(music, /data-owner-selectable-file="music"/);
  assert.match(gallery, /data-owner-selectable-file="gallery"/);
  assert.match(login, /data-owner-selectable-file="login-visuals"/);
  assert.match(account, /data-owner-selectable-file="background"/);
  assert.match(account, /data-owner-selectable-file="report"/);

  assert.match(gallery, /data-owner-bulk-toolbar="gallery"/);
  assert.match(login, /data-owner-bulk-toolbar="login-visuals"/);
  assert.match(account, /data-owner-bulk-toolbar="backgrounds"/);
  assert.match(account, /data-owner-bulk-toolbar="reports"/);

  assert.match(gallery, /deleteSelected/);
  assert.match(login, /deleteSelected/);
  assert.match(account, /deleteSelectedBackgrounds/);
  assert.match(account, /deleteSelectedReports/);
});

test("bulk selectors remain touch-sized and destructive actions require confirmation", async () => {
  const music = await source("src/components/owner-background-music-manager.tsx");
  const gallery = await source("src/components/owner-gallery-manager.tsx");
  const login = await source("src/components/owner-login-visuals-manager.tsx");
  const account = await source("src/routes/account.tsx");

  for (const text of [music, gallery, login, account]) {
    assert.match(text, /min-h-11|min-h-10/);
  }
  assert.match(music, /window\.confirm\(c\.batchDeleteConfirm/);
  assert.match(gallery, /window\.confirm\(copy\.batchDeleteConfirm/);
  assert.match(login, /window\.confirm\(copy\.batchDeleteConfirm/);
  assert.match(account, /window\.confirm\(c\.batchDeleteBackgroundsConfirm/);
  assert.match(account, /window\.confirm\(c\.batchDeleteReportsConfirm/);
});
