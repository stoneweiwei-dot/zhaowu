import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const names = ["01-falling-star.svg","02-follow-the-light.svg","03-reflection-mountain.svg","04-heaven-gate.svg","05-lone-boat.svg","06-enter-water.svg","07-star-palace.svg","08-meeting.svg","09-star-returns.svg"];
const source = await readFile(new URL("../src/routes/-mythic-atlas-borrow-star.tsx", import.meta.url), "utf8");
test("Borrowed Star uses nine distinct permanent illustrated files", async () => {
  assert.equal(names.length, 9);
  for (const name of names) {
    const path = new URL("../public/mythic-atlas/borrow-star/" + name, import.meta.url);
    const [svg, info] = await Promise.all([readFile(path, "utf8"), stat(path)]);
    assert.ok(info.size > 1500, name + " must contain illustration, not an empty placeholder");
    assert.match(svg, /<svg\b[^>]*viewBox="0 0 540 960"/);
    assert.match(svg, /<title>[^<]+<\/title>/);
    assert.doesNotMatch(svg, /<script|<foreignObject|<image\b[^>]*href="https?:/i);
    assert.ok(source.includes('file: "' + name + '"'), name + " is not linked from the route");
  }
  assert.equal((source.match(/file:\s*"\d\d-[a-z-]+\.svg"/g) || []).length, 9);
  assert.match(source, /STONE 原創/);
  assert.match(source, /"I · Falling Star"/);
  assert.match(source, /"壹 · 墜星"/);
  assert.match(source, /"壹 · 坠星"/);
});
