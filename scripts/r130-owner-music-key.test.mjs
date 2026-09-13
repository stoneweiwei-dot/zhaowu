import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("owner music API is a self-contained cookie-gated function off the SPA rewrite", async () => {
  const api = await source("api/owner-music.js");
  const git = await source("lib/owner-music-git.js");
  const ssh = await source("lib/owner-music-ssh.json");
  const vercel = JSON.parse(await source("vercel.json"));
  assert.match(api, /OWNER_KEY_SHA256/);
  assert.match(api, /saveOwnerMusicTrack/);
  assert.match(api, /OWNER_REQUIRED/);
  assert.doesNotMatch(api, /from ["']\.\.\/src\//);
  assert.match(api, /from ["']\.\.\/lib\/owner-music-git\.js["']/);
  assert.match(git, /owner-music/);
  assert.match(git, /decryptOwnerSshKey/);
  assert.doesNotMatch(ssh, /BEGIN OPENSSH PRIVATE KEY/);
  assert.match(ssh, /aes-256-gcm/);
  assert.equal(vercel.functions["api/owner-music.js"].maxDuration, 30);
  assert.equal(vercel.git.deploymentEnabled["owner-music"], false);
  assert.equal(vercel.rewrites.at(-1).source, "/((?!api/).*)");
});

test("owner key hash is rotated and the raw secret is not in the repo", async () => {
  const login = await source("api/owner-login.js");
  const session = await source("api/owner-session.js");
  const server = await source("src/server/owner-auth.ts");
  const music = await source("api/owner-music.js");
  assert.match(login, /6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07/);
  assert.match(session, /6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07/);
  assert.match(server, /6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07/);
  assert.match(music, /6236d83b2be351c9c80cd4ed07e8cadac684ab8d5a659096eb26b2e984a33c07/);
  assert.match(login, /value\.length < 8/);
  assert.match(session, /value\.length < 8/);
  assert.match(server, /value\.length < 8/);
  assert.match(music, /value\.length < 8/);
  assert.doesNotMatch(login, /value\.length < 32/);
  assert.doesNotMatch(login, /BEGIN OPENSSH PRIVATE KEY/);
  assert.doesNotMatch(server, /BEGIN OPENSSH PRIVATE KEY/);
});

test("account console and player use the owner-music API instead of a generated pad", async () => {
  const manager = await source("src/components/owner-background-music-manager.tsx");
  const player = await source("src/components/background-music.tsx");
  const account = await source("src/routes/account.tsx");
  const client = await source("src/lib/owner-music-client.ts");
  assert.match(manager, /uploadOwnerMusic/);
  assert.match(manager, /user\?\.isOwner \|\| !onAccount/);
  assert.doesNotMatch(manager, /uploadBackgroundMusicResilient/);
  assert.match(player, /loadOwnerMusic/);
  assert.doesNotMatch(player, /zhaowu-background\.m4a/);
  assert.match(account, /背景音樂管理/);
  assert.match(client, /x-zhaowu-music-name/);
  assert.match(client, /zhaowu-music-change/);
});
