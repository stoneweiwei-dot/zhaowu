import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("ZHAOWU story is public, multilingual and linked from login without touching auth", () => {
  const about = read("src/routes/about.tsx");
  const login = read("src/routes/login.tsx");
  const meta = JSON.parse(read("src/lib/route-meta.json"));
  const sitemap = read("public/sitemap.xml");
  assert.match(about, /createFileRoute\("\/about"\)/);
  assert.match(about, /import "@\/about-zhaowu\.css"/);
  assert.match(about, /讓天時有形，讓命理可讀/);
  assert.match(about, /让天时有形，让命理可读/);
  assert.match(about, /Where the seasons have a form/);
  assert.match(about, /二十四節氣 × 七十二候/);
  assert.match(about, /其他節氣沿用既有畫作/);
  assert.match(about, /並非澳洲天氣預報/);
  assert.match(about, /<Link to="\/">/);
  assert.match(login, /data-zhaowu-discover-link/);
  assert.match(login, /<Link to="\/about">/);
  assert.match(login, /passkeySignIn/);
  assert.match(login, /ownerSignIn/);
  for (const language of ["zh-Hant", "zh-Hans", "en"]) assert.ok(meta.routes["/about"][language]);
  assert.match(sitemap, /https:\/\/zhao-wu\.com\/about/);
  const media = [...about.matchAll(/(?:image|src):?\s*["'](\/(?:art|theme-skins)\/[^"']+\.webp)["']/g)];
  assert.ok(media.length >= 7);
  for (const [, path] of media) assert.ok(existsSync(new URL("../public" + path, import.meta.url)), "Missing art: " + path);
});
