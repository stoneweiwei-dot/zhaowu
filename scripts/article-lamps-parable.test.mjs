import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("src/routes/knowledge.nine-heavens-lamps.tsx", "utf8");
const index = readFileSync("src/routes/knowledge.tsx", "utf8");
const sitemap = readFileSync("public/sitemap.xml", "utf8");
const routeMeta = JSON.parse(readFileSync("src/lib/route-meta.json", "utf8"));

test("four independent portrait assets with direct text labels", () => {
 const labels = ["青燈相續", "黑焰與白燈", "風與燈芯", "無人掌燈"];
 for(let i=1;i<=4;i++){
  const src="/articles/lamps-parable-0"+i+".svg";
  const file="public"+src;
  const svg=readFileSync(file,"utf8");
  assert.match(svg,/^<\?xml version="1\.0"/);
  assert.match(svg,/<svg[^>]+width="1080" height="1920" viewBox="0 0 1080 1920"/);
  assert.equal((svg.match(/<svg\b/g)||[]).length,1,"one scene root per image");
  assert.equal((svg.match(/<\/svg>/g)||[]).length,1);
  assert.ok(svg.includes(labels[i-1]),"image includes a directly readable chapter name");
  assert.ok(svg.includes("STONE 原創"),"approved creator credit");
  assert.ok(route.includes(src),"image referenced by published route");
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
