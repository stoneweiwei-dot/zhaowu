import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CANONICAL_SITE_ORIGIN, publicShareUrl } from "../src/lib/share-url.ts";

const loc = (url) => {
  const u = new URL(url);
  return { origin: u.origin, hostname: u.hostname, pathname: u.pathname };
};

test("preview deployment host is replaced by the canonical production origin", () => {
  const out = publicShareUrl(loc("https://stone-zhaowu-official-jhcm5nxyz-stone-weiwei-5213s-projects.vercel.app/report"));
  assert.equal(out, `${CANONICAL_SITE_ORIGIN}/report`);
  assert.doesNotMatch(out, /jhcm5nxyz|projects\.vercel\.app/);
});

test("query string and hash never reach the shared link", () => {
  const out = publicShareUrl(loc("https://stone-zhaowu-official.vercel.app/?session_id=cs_1&access_key=secret&zw_release=r1&zw_retry=2#x"));
  assert.equal(out, `${CANONICAL_SITE_ORIGIN}/`);
  assert.doesNotMatch(out, /secret|access_key|session_id|zw_|#/);
});

test("canonical host keeps its current path", () => {
  assert.equal(publicShareUrl(loc("https://stone-zhaowu-official.vercel.app/today")), `${CANONICAL_SITE_ORIGIN}/today`);
});

test("non-vercel hosts (custom domain, localhost) keep their own origin", () => {
  assert.equal(publicShareUrl(loc("https://example.com/a?b=1")), "https://example.com/a");
  assert.equal(publicShareUrl(loc("http://localhost:5173/x#y")), "http://localhost:5173/x");
});

test("share card uses publicShareUrl and no longer shares window.location.href", async () => {
  const src = await readFile(new URL("../src/components/song-comic-layer.tsx", import.meta.url), "utf8");
  assert.match(src, /publicShareUrl\(\)/);
  assert.doesNotMatch(src, /url: window\.location\.href/);
  assert.doesNotMatch(src, /\$\{window\.location\.href\}/);
});
