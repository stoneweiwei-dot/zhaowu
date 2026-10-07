import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("r197 owner media shows one focused manager at a time", async () => {
  const route = await source("src/routes/gallery.tsx");
  assert.match(route, /type MediaView = "login" \| "content"/);
  assert.match(route, /useState<MediaView>\("login"\)/);
  assert.match(route, /role="tablist"/);
  assert.match(route, /開場影片/);
  assert.match(route, /內容圖片/);
  assert.match(route, /view === "login"[\s\S]*OwnerLoginVisualsManager[\s\S]*OwnerGalleryManager/);
});

test("owner media surfaces only the actions the owner actually needs", async () => {
  const [login, gallery, account, music] = await Promise.all([
    source("src/components/owner-login-visuals-manager.tsx"),
    source("src/components/owner-gallery-manager.tsx"),
    source("src/routes/account.tsx"),
    source("src/components/owner-background-music-manager.tsx"),
  ]);
  assert.doesNotMatch(login, /data-owner-bulk-toolbar="login-visuals"/);
  assert.doesNotMatch(gallery, /data-owner-bulk-toolbar="gallery"/);
  assert.match(gallery, /設為首頁背景/);
  assert.match(login, /設為目前使用/);
  assert.match(login, /改名/);
  assert.match(music, /data-owner-bulk-toolbar="music"/);
  assert.match(account, /data-owner-bulk-toolbar="reports"/);
  assert.doesNotMatch(account, /onClick=\{\(\) => setOwnerView\("backgrounds"\)\}/);
});

test("r197 preserves login video-only constraints and owner bridge", async () => {
  const manager = await source("src/components/owner-login-visuals-manager.tsx");
  assert.match(manager, /accept=\{LOGIN_VIDEO_ACCEPT\}/);
  assert.match(manager, /login-background[^\n]+&& isVideo\(asset\)/);
  assert.match(manager, /@\/lib\/bridge\/gallery-assets/);
  assert.doesNotMatch(manager, /accept="[^"]*image\//);
});


test("r199 owner music public read avoids the legacy git HTTP URL parser", async () => {
  const publicRead = await source("lib/owner-music-public.js");
  assert.match(publicRead, /raw\.githubusercontent\.com/);
  assert.doesNotMatch(publicRead, /git\.getRemoteInfo/);
  assert.doesNotMatch(publicRead, /isomorphic-git\/http|isomorphic-git|ssh2/);
});


test("r214 public owner-music GET is a separate function from the Git writer", async () => {
  const api = await source("api/owner-music.js");
  const writeApi = await source("api/owner-music-write.js");
  const publicRead = await source("lib/owner-music-public.js");
  const git = await source("lib/owner-music-git.js");
  assert.doesNotMatch(api, /owner-music-git|isomorphic-git|ssh2|OWNER_KEY_SHA256/);
  assert.match(api, /readOwnerMusicManifest/);
  assert.match(writeApi, /from ["']\.\.\/lib\/owner-music-git\.js["']/);
  assert.match(writeApi, /OWNER_KEY_SHA256/);
  assert.doesNotMatch(publicRead, /isomorphic-git\/http\/node|isomorphic-git|ssh2/);
  assert.doesNotMatch(git, /import git from ["']isomorphic-git["']/);
  assert.doesNotMatch(git, /import \{ Client \} from ["']ssh2["']/);
  assert.doesNotMatch(git, /import http from ["']isomorphic-git\/http\/node["']/);
  assert.match(git, /import\("isomorphic-git"\)/);
  assert.match(git, /import\("ssh2"\)/);
  // r223/r224: the writer no longer fetches the branch over git at all (see
  // scripts/owner-music-git-plumbing.test.mjs), so isomorphic-git's HTTP
  // transport is gone entirely rather than merely lazy-loaded.
  assert.doesNotMatch(git, /isomorphic-git\/http\/node/);
});
