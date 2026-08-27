import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("owner image management uses one visible Gallery instead of the legacy Background Library", async () => {
  const shell = await source("src/components/site-shell.tsx");
  const gallery = await source("src/components/owner-gallery-manager.tsx");
  const main = await source("src/main.tsx");
  const lock = await source("src/gallery-unification.css");

  assert.match(shell, /listPublicGalleryAssets\("background"\)/);
  assert.match(shell, /galleryPublicUrl\(selected\.storage_path, selected\.bucket_id\)/);
  assert.doesNotMatch(shell, /from "@\/lib\/background-assets"/);
  assert.match(shell, /to="\/gallery"/);
  assert.match(shell, /"图库"/);
  assert.match(gallery, /一般作品统一进作品库/);
  assert.match(gallery, /系统只保留真正会影响网站功能的用途/);
  assert.match(gallery, /category === "background" \? "site-wallpaper"/);
  assert.match(main, /gallery-unification\.css/);
  assert.match(lock, /section:nth-of-type\(2\):has\(input\[type="file"\]/);
});