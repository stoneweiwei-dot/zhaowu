import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const consolePage = source("src/routes/account.tsx");
const overview = source("src/components/owner/console-overview.tsx");
const music = source("src/components/owner-background-music-manager.tsx");
const root = source("src/routes/__root.tsx");
const shell = source("src/components/site-shell.tsx");

test("owner console shows four primary categories with clear content tools", () => {
  assert.match(consolePage, /後台主要分類/);
  for (const label of ["內容與素材", "客戶與營運", "網站設定", "總覽", "文章管理", "上傳音樂", "圖片與背景", "影片素材"]) {
    assert.ok(consolePage.includes(label), `missing owner navigation: ${label}`);
  }
  assert.match(consolePage, /function consoleGroup\(view: ConsoleView\)/);
  assert.match(consolePage, /consoleGroup\(consoleView\) === consoleGroup\(view\)/);
});

test("music upload has a dedicated deep link and the existing owner portal still mounts", () => {
  assert.match(consolePage, /"music"/);
  assert.match(consolePage, /id="console-panel-music"/);
  assert.match(consolePage, /hidden=\{consoleView !== "music"\}/);
  assert.match(consolePage, /data-owner-music-slot/);
  assert.ok(consolePage.indexOf("data-owner-music-slot") > consolePage.indexOf('id="console-panel-music"'));
  assert.ok(consolePage.indexOf("data-owner-music-slot") < consolePage.indexOf('id="console-panel-images"'));
  assert.match(root, /<OwnerBackgroundMusicManager \/>/);
  assert.match(music, /data-owner-music-slot/);
  assert.match(music, /uploadOwnerMusic\(/);
  assert.match(overview, /\["music", "上傳音樂"/);
});

test("existing admin deep links and legacy gallery remain valid", () => {
  for (const view of ["overview", "articles", "music", "images", "opening", "reports", "promo", "themes", "devices"]) {
    assert.match(consolePage, new RegExp(`\\["${view}",`));
  }
  assert.match(consolePage, /function consoleViewHref\(view: ConsoleView\)/);
  assert.match(shell, /href="\/account\?view=images"/);
  assert.doesNotMatch(shell, /to="\/gallery" className="zhaowu-header-utility/);
  assert.match(overview, /\["articles", "文章管理"/);
  assert.match(overview, /\["opening", "影片素材"/);
});

test("film library still exclusively manages real uploaded film assets", () => {
  const film = source("src/components/owner-login-visuals-manager.tsx");
  assert.match(film, /listOwnerGalleryAssets\(session, "loading"\)/);
  assert.match(film, /login-background[^\n]+&& isVideo\(asset\)/);
  assert.match(film, /SUPABASE_STORAGE_WRITES_PAUSED/);
  assert.match(film, /uploadGalleryAsset\(/);
  assert.doesNotMatch(consolePage, /deleteGalleryAsset\(/);
});
