import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("one visible Gallery keeps owner asset management independent of the fixed shell", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const account = await source("src/routes/account.tsx");
  const gallery = await source("src/components/owner-gallery-manager.tsx");
  const galleryRoute = await source("src/routes/gallery.tsx");
  const main = await source("src/legacy-visual-compat.css");
  const lock = await source("src/gallery-unification.css");

  assert.doesNotMatch(shell, /from "@\/lib\/background-assets"/);
  assert.doesNotMatch(shell, /listPublicBackgrounds\(\)/);
  assert.doesNotMatch(shell, /chooseDailyBackground/);
  assert.doesNotMatch(shell, /zhaowu-site-wallpaper/);
  assert.match(shell, /to="\/gallery"/);
  assert.match(shell, /"图库"/);

  assert.match(account, /from "@\/lib\/bridge\/background-assets"/);
  assert.match(account, /listOwnerBackgroundPage/);
  assert.match(account, /setBackgroundWallpaper/);

  assert.match(galleryRoute, /type MediaView = "login" \\| "content"/);
  assert.match(galleryRoute, /登入影片/);
  assert.match(galleryRoute, /內容圖片/);
  assert.match(gallery, /assets\.filter\(\(asset\) => !isLoadingGalleryAsset\(asset\)\)/);
  assert.match(gallery, /category:\s*"visual-library"/);
  assert.match(gallery, /auto-classify/);
  assert.doesNotMatch(gallery, /category === "background" \? "site-wallpaper"/);

  assert.match(main, /gallery-unification\.css/);
  assert.match(lock, /section:nth-of-type\(2\):has\(input\[type="file"\]/);
});
