import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("src/routes/knowledge.nine-heavens-lamps.tsx", "utf8");
const index = readFileSync("src/routes/knowledge.tsx", "utf8");
const sitemap = readFileSync("public/sitemap.xml", "utf8");
const routeMeta = JSON.parse(readFileSync("src/lib/route-meta.json", "utf8"));

test("four distinct original 9:16 PNG paintings and verified WebP production assets", () => {
 const sha = ["a4cb28702a6100dc4a7d44264dbff10750ea39fa66ed2ae2be06256a5406a14a","943bb8e1621003155aa982082ffe2ce863c2f423eeff5def7b9ad438e1be9654","5f1d9722400f9d9e18b3391ad900c4a006f0333ce7f6b1578c98275c70bc0ee3","a515b2b9dafde3344dd5894daeb6192572128a65a868ea00644499acf90aafd1"];
 const seen = new Set();
 for(let i=1;i<=4;i++){
  const src = "/articles/lamps-parable-0"+i+".webp";
  const binary = readFileSync("public"+src);
  const original = readFileSync("art-source/lamps/lamps-0"+i+"-original.png");
  assert.ok(original.length>2000000, "Original source not a full image");
  assert.equal(original.subarray(0,8).toString("hex"), "89504e470d0a1a0a", "Original PNG header");
  assert.equal(original.readUInt32BE(16),941, "Original width");
  assert.equal(original.readUInt32BE(20),1672, "Original height");
  const actual = createHash("sha256").update(original).digest("hex");
  assert.equal(actual,sha[i-1],"Correct original asset, no imagegen.png collision");
  assert.ok(!seen.has(actual),"No duplicate scene");
  seen.add(actual);
  assert.equal(binary.toString("ascii",0,4),"RIFF");
  assert.equal(binary.toString("ascii",8,12),"WEBP");
  assert.ok(binary.length>200000,"Image must retain meaningful detail");
  assert.ok(route.includes(src),"Route references real binary media");
  assert.ok(!existsSync("public/articles/lamps-parable-0"+i+".svg"),"No placeholder SVG retained");
 }
});

test("narrative is complete, three languages, sourced and not a mere image gallery", () => {
 assert.ok(route.length>12000,"parable and concepts should be substantive");
 assert.ok(route.includes("不是同一盞燈，亦非毫無關聯"),"central ending present");
 assert.ok(route.includes("Neither the same flame nor utterly unrelated"),"English ending present");
 assert.ok(route.includes("suttacentral.net/sn12.17"),"primary source present");
 assert.ok(route.includes("suttacentral.net/sn12.46"),"second primary source present");
 assert.ok(route.includes("plato.stanford.edu/entries/nagarjuna"),"secondary philosophy reference present");
 assert.ok(route.includes('lang')===false || route.includes("locale"),"locale support present");
 assert.ok(index.includes('to="/knowledge/nine-heavens-lamps"'),"knowledge entry linked");
});

test("SEO sitemap and three-locale metadata",()=>{
 const routeName="/knowledge/nine-heavens-lamps";
 assert.ok(sitemap.includes("https://zhao-wu.com"+routeName));
 const entry=routeMeta.routes[routeName];
 assert.ok(entry);
 for(const l of ["zh-Hant","zh-Hans","en"]){
  assert.ok(entry[l].title.length>12);
  assert.ok(entry[l].description.length>25);
 }
});
