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
  assert.equal(vercel.functions["api/owner-music.js"].maxDuration, 60);
  assert.equal(vercel.git.deploymentEnabled, true);
  assert.equal(Object.prototype.hasOwnProperty.call(vercel, "ignoreCommand"), false);
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

test("account console and player use owner music with browser-side format optimization", async () => {
  const manager = await source("src/components/owner-background-music-manager.tsx");
  const player = await source("src/components/background-music.tsx");
  const account = await source("src/routes/account.tsx");
  const organizer = await source("src/components/owner-console-organizer.tsx");
  const client = await source("src/lib/owner-music-client.ts");
  const transcoder = await source("src/lib/owner-music-transcode.ts");
  assert.match(manager, /uploadOwnerMusic/);
  assert.match(manager, /user\?\.isOwner \|\| !onAccount/);
  assert.doesNotMatch(manager, /單檔最多 4 MB/);
  assert.match(manager, /自動轉碼|自動轉換/);
  assert.doesNotMatch(manager, /uploadBackgroundMusicResilient/);
  assert.match(player, /loadOwnerMusic/);
  assert.doesNotMatch(player, /zhaowu-background\.m4a/);
  assert.match(organizer, /背景音樂|背景音乐/);
  assert.match(client, /optimizeOwnerMusic/);
  assert.match(client, /x-zhaowu-music-name/);
  assert.match(client, /zhaowu-music-change/);
  assert.match(transcoder, /TARGET_UPLOAD_BYTES = 3_550_000/);
  assert.match(transcoder, /MAX_OWNER_UPLOAD_BYTES = 12 \* 1024 \* 1024/);
  assert.match(transcoder, /aac_low/);
  assert.match(transcoder, /INITIAL_AAC_KBPS = 96/);
  assert.match(transcoder, /MIN_AAC_KBPS = 64/);
  assert.match(transcoder, /CORE_LOAD_TIMEOUT_MS = 90_000/);
  assert.match(transcoder, /TRANSCODE_TIMEOUT_MS = 180_000/);
  assert.match(transcoder, /MAX_SOURCE_BYTES = 200 \* 1024 \* 1024/);
  assert.match(transcoder, /decodeOwnerAudioPcm/);
  assert.match(transcoder, /isIosOwnerDevice/);
  assert.match(transcoder, /本機壓縮音樂，避免 iPhone 卡住/);
  assert.match(client, /x-zhaowu-music-upload-id/);
});

test("independent owner cookie does not get falsely sent back to login on gallery", async () => {
  const gallery = await source("src/routes/gallery.tsx");
  assert.doesNotMatch(gallery, /if \(!user \|\| !session\)/);
  assert.match(gallery, /if \(!user\)/);
  assert.match(gallery, /if \(!user\.isOwner\)/);
  assert.match(gallery, /data-owner-gallery-data-offline/);
  assert.match(gallery, /站主登入與其他後台功能仍正常|站主登录与其他后台功能仍正常/);
  assert.match(gallery, /session \? \(/);
});
