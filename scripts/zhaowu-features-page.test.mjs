import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("ZHAOWU story is public, multilingual and linked from login without touching auth", () => {
  const about = read("src/routes/about.tsx");
  const login = read("src/routes/login.tsx");
  const home = read("src/components/painted-home.tsx");
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
  assert.match(about, /不反轉四柱、月令與大運/);
  assert.match(about, /不反转四柱、月令与大运/);
  assert.match(about, /does not reverse the four pillars/);
  assert.match(about, /單次解鎖，不設自動續費/);
  assert.equal([...about.matchAll(/label: "0\d \/ /g)].length, 24, "8 features x 3 languages");
  assert.match(read("public/llms.txt"), /zhao-wu\.com\/about/);
  assert.match(read("index.html"), /<h2>網站特色<\/h2>[\s\S]*<h2>常見問題<\/h2>/);
  assert.match(about, /<Link to="\/" /);
  assert.doesNotMatch(home, /<VisitorEntrance|<VisitorWelcomeFilms/);
  assert.match(home, /<HomeTree t=\{t\} onOpen=\{onOpen\} \/>/);
  assert.doesNotMatch(login, /data-zhaowu-discover-link/);
  assert.match(login, /passkeySignIn/);
  assert.match(login, /ownerSignIn/);
  for (const language of ["zh-Hant", "zh-Hans", "en"]) assert.ok(meta.routes["/about"][language]);
  assert.match(sitemap, /https:\/\/zhao-wu\.com\/about/);
  const media = [...about.matchAll(/(?:image|src):?\s*["'](\/(?:art|theme-skins)\/[^"']+\.webp)["']/g)];
  assert.ok(media.length >= 7);
  for (const [, path] of media) assert.ok(existsSync(new URL("../public" + path, import.meta.url)), "Missing art: " + path);
});
