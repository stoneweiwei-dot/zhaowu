import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("pricing has a route and no redirect to the sample", () => {
  assert.doesNotMatch(read("public/_redirects"), /^\/pricing\s+\/sample-report/m);
  assert.ok(!JSON.parse(read("vercel.json")).redirects.some(rule => rule.source === "/pricing"));
  assert.match(read("src/routeTree.gen.ts"), /PricingRouteImport.update/);
});

test("seven system links show their AUD price alongside free entry and sample links", () => {
  const source = read("src/routes/pricing.tsx");
  for (const [route, price] of Object.entries({ "/": "24.90", "/ziwei": "24.90", "/qizheng": "14.90", "/astrology": "14.90", "/indian-astrology": "14.90", "/yizhangjing": "14.90", "/numerology": "14.90" })) {
    const row = source.split("\n").find(line => line.includes('["' + route + '",'));
    assert.ok(row?.includes('"A$' + price + '"'), route);
  }
  for (const cue of ['hash="birth-form"', 'to="/sample-report"', 'to={row[0]}', "單次付費解鎖", "不自动续费", "single payment"]) assert.ok(source.includes(cue), cue);
});
