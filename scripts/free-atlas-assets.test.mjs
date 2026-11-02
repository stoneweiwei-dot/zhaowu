import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
const manifest=JSON.parse(await readFile(new URL("../public/report-visuals/atlas/manifest.json",import.meta.url),"utf8"));
test("22 original two-character scene WebPs have verified digests",async()=>{
  assert.equal(manifest.assets.length,22);
  assert.equal(new Set(manifest.assets.map(x=>x.id)).size,22);
  assert.equal(manifest.assets.filter(x=>x.id.startsWith("stems/")).length,10);
  assert.equal(manifest.assets.filter(x=>x.id.startsWith("branches/")).length,12);
  for(const item of manifest.assets){
    assert.match(item.id,/^(stems|branches)\/[a-z]+$/);
    assert.equal(item.width,720);assert.equal(item.height,536);
    const path=new URL("../public/"+item.file,import.meta.url);
    const data=await readFile(path),s=await stat(path);
    assert.equal(s.size,item.bytes,item.id);
    assert.equal(data.toString("ascii",0,4),"RIFF",item.id);
    assert.equal(data.toString("ascii",8,12),"WEBP",item.id);
    assert.equal(createHash("sha256").update(data).digest("hex"),item.sha256,item.id);
  }
});
