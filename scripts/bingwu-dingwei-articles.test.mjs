import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const source = readFileSync("src/lib/life-view-long-form/bingwu-dingwei-2026-2027.ts", "utf8");
const articles = JSON.parse(source.slice(source.indexOf("= [") + 2).trim().replace(/;$/, ""));
const manifest = JSON.parse(readFileSync("docs/article-image-manifest.json", "utf8"));
const originals = [
  ["bingwu-2026-fire-symbolism", "/articles/bingwu-2026-stone-original.png", "a2ee1338bad8f928b903cfff2caed05bec8b5a4588b62c10c68e082d76c7d5b3"],
  ["dingwei-2027-fire-earth-transition", "/articles/dingwei-2027-stone-original.png", "d34231de9886519964666c838278ca04cffc5906880ae1a657a301d412271a61"],
];

test("both year essays are publicly registered once without dropping current main articles", () => {
  const registry = readFileSync("src/lib/life-view-long-form.ts", "utf8");
  assert.equal((registry.match(/\.\.\.BINGWU_DINGWEI_ARTICLES/g) || []).length, 1);
  assert.match(registry, /GATE_OF_LIFE_ARTICLE,/);
  assert.match(registry, /ZHAOJIAN_BENXIN_ARTICLE,/);
  assert.equal(articles.length, 2);
});

for (const [id, src, sha256] of originals) {
  test(`${id}: original PNG, manifest and all three reading paths agree`, () => {
    const article = articles.find((row) => row.id === id);
    assert.ok(article);
    assert.equal(article.publishedAt, "2026-10-25");
    assert.equal(article.illustrations.length, 1);
    const image = article.illustrations[0];
    assert.equal(image.src, src);
    assert.equal(image.display, "wide");
    assert.equal(image.afterParagraph, 2);
    for (const locale of ["zh-Hant", "zh-Hans", "en"]) {
      assert.ok(article.title[locale] && article.summary[locale] && image.alt[locale]);
      const paragraphs = article.body[locale].split(/\n\n+/);
      assert.ok(paragraphs.length >= 5, `${locale}: missing translated content`);
      assert.match(paragraphs[1], /STONE/);
      assert.match(paragraphs[1], /未經驗證|未经验证|unverified/);
      assert.match(paragraphs[1], /繁體中文|繁体中文|Traditional Chinese/);
      assert.ok(image.afterParagraph < paragraphs.length, `${locale}: image is not on the reading path`);
    }
    const bytes = readFileSync(`public${src}`);
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(bytes.readUInt32BE(16), 941);
    assert.equal(bytes.readUInt32BE(20), 1672);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), sha256);
    const entries = manifest.entries.filter((row) => row.src === src);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].articleId, id);
    assert.equal(entries[0].article, "bingwu-dingwei-2026-2027");
    assert.equal(entries[0].kind, "infographic");
    assert.equal(entries[0].source, "stone-original");
    assert.equal(entries[0].status, "approved");
    assert.equal(entries[0].sha256, sha256);
  });
}

test("Dingwei translation keeps storehouse, conditional transformation and calendrical limits", () => {
  const body = articles[1].body;
  for (const locale of ["zh-Hant", "zh-Hans"]) {
    assert.match(body[locale], /木庫|木库/);
    assert.match(body[locale], /合不等於必化|合不等于必化/);
    assert.match(body[locale], /立春/);
    assert.match(body[locale], /三十、四十五或六十日/);
  }
  assert.match(body.en, /wood storehouse/);
  assert.match(body.en, /does not guarantee transformation/);
  assert.match(body.en, /exact Start of Spring/);
  assert.match(body.en, /30, 45 or 60 days/);
});
