import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import ts from "typescript";
const source = readFileSync("src/lib/report/free-stem-branch-atlas.ts", "utf8");
const component = readFileSync("src/components/free-stem-branch-atlas.tsx", "utf8");
const report = readFileSync("src/components/result-view.tsx", "utf8");
const form = readFileSync("src/components/analysis-form.tsx", "utf8");
const match = source.match(/export const FREE_ATLAS_CONTENT:[^=]+ = (\{[\s\S]*?\});\nexport const FREE_ATLAS_COPY/);
assert.ok(match, "Missing structured free atlas data");
const values = JSON.parse(match[1]);
assert.deepEqual(values.stems.map(x=>x.symbol), [..."甲乙丙丁戊己庚辛壬癸"]);
assert.deepEqual(values.branches.map(x=>x.symbol), [..."子丑寅卯辰巳午未申酉戌亥"]);
for (const item of [...values.stems,...values.branches]) {
 for (const key of ["heading","strength","caution"])
  for (const locale of ["zh-Hant","zh-Hans","en"]) assert.ok(item[key][locale]?.trim(),item.symbol+" "+key+" "+locale);
 assert.equal(item.kind, values.stems.includes(item) ? "stem" : "branch");
}
for(const file of ["src/lib/report/free-stem-branch-atlas.ts","src/components/free-stem-branch-atlas.tsx"]) {
 const text = readFileSync(file,"utf8");
 const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
 const ast = ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,kind);
 assert.equal(ast.parseDiagnostics.length,0,file+" parse errors");
}
assert.match(component,/chart\.gender/);
assert.match(source,/pillar\.ready !== false/);
assert.match(source,/seen\.has\(zhi\)/);
assert.match(source,/FREE_ATLAS_COPY/);
assert.match(source,/VERIFIED_ATLAS_POSTERS = true/);
assert.match(form,/<FreeStemBranchAtlas chart=\{previewChart\}/);
assert.match(report,/<FreeStemBranchAtlas chart=\{chart\}/);
assert.match(component,/data-free-atlas-gender=\{chart.gender\}/);
console.log("Free atlas: 10 stems + 12 branches, 3 locales, gender safety, dedupe and free path PASS");

// Runtime contract: the exact chart determines the symbols; the submitted gender only selects the copy.
const { selectFreeAtlas, freeAtlasGenderCopy, freeAtlasImage } = await import("../src/lib/report/free-stem-branch-atlas.ts");
const example = { dayMaster: "壬", gender: "female", pillars: [
  { zhi: "辰", ready: true }, { zhi: "酉", ready: true },
  { zhi: "辰", ready: true }, { zhi: "巳", ready: false },
] };
assert.deepEqual(selectFreeAtlas(example).map(item => item.symbol), ["壬", "辰", "酉"]);
assert.deepEqual(selectFreeAtlas({ ...example, gender: "male" }).map(item => item.symbol), ["壬", "辰", "酉"]);
assert.deepEqual(selectFreeAtlas({ ...example, gender: "unspecified" }).map(item => item.symbol), ["壬", "辰", "酉"]);
assert.match(freeAtlasGenderCopy("male", "zh-Hant"), /男性/);
assert.match(freeAtlasGenderCopy("female", "zh-Hant"), /女性/);
assert.match(freeAtlasGenderCopy("unspecified", "zh-Hant"), /中性/);
assert.match(freeAtlasGenderCopy("female", "en"), /female/);
assert.ok(freeAtlasImage(selectFreeAtlas(example)[0], "en").includes("/atlas/"), "every locale uses paired scene art and independently localized HTML");
assert.match(component,/is-poster/);
const css = readFileSync("src/components/free-stem-branch-atlas.css", "utf8");
assert.match(css,/object-position:center center/);
