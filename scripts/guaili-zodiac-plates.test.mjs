import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Source originals supplied in the conversation. Hashes protect the actual art
// against accidental placeholder, compression, re-generation or branch swaps.
const originals = [
  ["01-zi-rat.png", "cd2b672f365226c8550f709439821979bee3ad24c7c685c6aef8f744902ca2c8"],
  ["02-chou-ox.png", "871db1c304e28deb3b816cea4d9549b18c07992699feec7a769307acdb7222dd"],
  ["03-yin-tiger.png", "1eead0d2e8ab91f4fa74c5913b70649fcd1ad7446eb44f4e4e7467685c995196"],
  ["04-mao-rabbit.png", "3410952b9ac206431aae4b9aa7fd6a2a81d7e6749546d3276b3afb6de6b21548"],
  ["05-chen-dragon.png", "9ea9d10cff2ad9ef1f50f2a8dc85c0b75ca4cc6c4642d758e2312334c1366270"],
  ["06-si-snake.png", "5401cae8bd010b182963717cfe470529725ff31cd0d59b72b3772d26ba4a373b"],
  ["07-wu-horse.png", "791f92119c0e7ee2645b24847c68d5e386387a3230583969152452e44082fedb"],
  ["08-wei-sheep.png", "032399fc92b2c51d51024cf61a3a5da5926da826feed08aab400ff0f06bb2ef5"],
  ["09-shen-monkey.png", "9483c75763ef2fa6dcded86f043c75cf1625b4ec65335de35c6f6b02caf3d52b"],
  ["10-you-rooster.png", "a7ff85aa49cfafef381b25e71dfaf8ecb40ecb8b867ccb173132cceb2a41d090"],
  ["11-xu-dog.png", "8b860ffedd2b3cf73a851c9ead342bd9a01e3e43f4b8a14f991759c270e8cd78"],
  ["12-hai-boar.png", "46b72fa127a5e3a49b4159a8276f4853b27b46101493dab56dee2503a493b280"],
];

test("all twelve zodiac plates preserve Stone's exact original PNG bytes and 9:16 dimensions", () => {
  for (const [name, hash] of originals) {
    const bytes = readFileSync(join("public/mythic-atlas/zodiac", name));
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", name);
    assert.equal(bytes.readUInt32BE(16), 941, name);
    assert.equal(bytes.readUInt32BE(20), 1672, name);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), hash, name);
  }
});

test("the illustrated essay points to the twelve originals in branch order", () => {
  const essay = readFileSync("src/routes/-mythic-atlas-zodiac-essay.ts", "utf8");
  const actual = [...essay.matchAll(/image:"(\d\d-[a-z-]+\.png)"/g)].map((match) => match[1]);
  assert.deepEqual(actual, originals.map(([name]) => name));
  const view = readFileSync("src/routes/-mythic-atlas-guaili.tsx", "utf8");
  // 2026-10-30: the page renders the web WebP derivative; the exact original PNG stays the full-plate link.
  assert.match(view, /<img src=\{mythicWebPlate\("zodiac", ZODIAC_PLATES\[index\]\.image\)\}/);
  assert.match(view, /<a href=\{`\/mythic-atlas\/zodiac\/\$\{ZODIAC_PLATES\[index\]\.image\}`\}/);
  assert.match(view, /loading="lazy"/);
});
