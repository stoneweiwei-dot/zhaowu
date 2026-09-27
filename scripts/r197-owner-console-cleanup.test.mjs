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
  assert.match(route, /登入影片/);
  assert.match(route, /內容圖片/);
  assert.match(route, /view === "login"[\s\S]*OwnerLoginVisualsManager[\s\S]*OwnerGalleryManager/);
});

test("r197 idle owner pages do not show batch action bars", async () => {
  const [login, gallery, account, music] = await Promise.all([
    source("src/components/owner-login-visuals-manager.tsx"),
    source("src/components/owner-gallery-manager.tsx"),
    source("src/routes/account.tsx"),
    source("src/components/owner-background-music-manager.tsx"),
  ]);
  assert.match(login, /\{selectedIds\.length \? <div data-owner-bulk-toolbar="login-visuals"/);
  assert.match(gallery, /\{selectedIds\.length \? <div data-owner-bulk-toolbar="gallery"/);
  assert.match(account, /\{selectedBackgroundIds\.length \? <div data-owner-bulk-toolbar="backgrounds"/);
  assert.match(account, /\{user\.isOwner && selectedReportIds\.length \? <div data-owner-bulk-toolbar="reports"/);
  assert.match(music, /\{selectedIds\.length \? <div data-owner-bulk-toolbar="music"/);
});

test("r197 preserves login video-only constraints and owner bridge", async () => {
  const manager = await source("src/components/owner-login-visuals-manager.tsx");
  assert.match(manager, /accept="video\/mp4,video\/webm"/);
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


test("r200 public owner-music GET does not statically evaluate the Node git HTTP adapter", async () => {
  const api = await source("api/owner-music.js");
  const publicRead = await source("lib/owner-music-public.js");
  const git = await source("lib/owner-music-git.js");
  assert.doesNotMatch(api, /from ["']\.\.\/lib\/owner-music-git\.js["']/);
  assert.match(api, /import\(["']\.\.\/lib\/owner-music-git\.js["']\)/);
  assert.doesNotMatch(publicRead, /isomorphic-git\/http\/node|isomorphic-git|ssh2/);
  assert.doesNotMatch(git, /import http from ["']isomorphic-git\/http\/node["']/);
  assert.match(git, /await import\("isomorphic-git\/http\/node"\)/);
});
