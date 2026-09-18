import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("one visible Gallery keeps owner asset management independent of the fixed shell", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const account = await source("src/routes/account.tsx");
  const gallery = await source("src/components/owner-gallery-manager.tsx");
  const main = await source("src/main.tsx");
  const lock = await source("src/gallery-unification.css");

  assert.doesNotMatch(shell, /from "@\/lib\/background-assets"/);
  assert.doesNotMatch(shell, /listPublicBackgrounds\(\)/);
  assert.doesNotMatch(shell, /chooseDailyBackground/);
  assert.doesNotMatch(shell, /zhaowu-site-wallpaper/);
  assert.match(shell, /to="\/gallery"/);
  assert.match(shell, /"图库"/);

  assert.match(account, /from "@\/lib\/background-assets"/);
  assert.match(account, /listOwnerBackgroundPage/);
  assert.match(account, /setBackgroundWallpaper/);

  assert.match(gallery, /登录画面与内容图库分开管理|登入畫面與內容圖庫分開管理/);
  assert.match(gallery, /Loading 与界面小素材不会混进这里|Loading 與介面小素材不會混進這裡/);
  assert.match(gallery, /category:\s*"visual-library"/);
  assert.match(gallery, /auto-classify/);
  assert.doesNotMatch(gallery, /category === "background" \? "site-wallpaper"/);

  assert.match(main, /gallery-unification\.css/);
  assert.match(lock, /section:nth-of-type\(2\):has\(input\[type="file"\]/);
});
