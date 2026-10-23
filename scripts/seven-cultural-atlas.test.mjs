import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

test("STONE seven cultural atlas uses seven original 1080×1920 PNG files", () => {
  const src = readFileSync("src/lib/life-view-long-form/seven-cultural-atlases-20261023.ts", "utf8");
  const refs = [...src.matchAll(/"src": "(\/articles\/stone-cultural-atlas-\d\d\.png)"/g)].map(m => m[1]);
  assert.equal(refs.length, 7);
  assert.equal(new Set(refs).size, 7);
  for (let i=1;i<=7;i++) {
    const name = "/articles/stone-cultural-atlas-"+String(i).padStart(2,"0")+".png";
    assert.ok(refs.includes(name));
    const file = path.join("public",name.slice(1));
    const data = readFileSync(file);
    assert.deepEqual([...data.subarray(0,8)],[137,80,78,71,13,10,26,10]);
    assert.equal(data.readUInt32BE(16),1080);
    assert.equal(data.readUInt32BE(20),1920);
    assert.ok(statSync(file).size > 100_000,"full-size real art required");
  }
  assert.ok(src.includes("七情、六根、五毒、八苦不可混派"));
  assert.ok(src.includes("署名待考"));
});
