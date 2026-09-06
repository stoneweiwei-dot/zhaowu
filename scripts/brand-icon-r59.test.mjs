import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const brand = await readFile(new URL("../src/components/brand-seal.tsx", import.meta.url), "utf8");
const install = await readFile(new URL("../src/components/home-screen-install-prompt.tsx", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const worker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

const rewrites = new Map(vercel.rewrites.map((entry) => [entry.source, entry.destination]));

test("final jade lotus is the active brand mark", () => {
  assert.match(brand, /\/brand\/zhaowu-logo-r59\.png/);
  assert.doesNotMatch(brand, /bg-\[#9d4033\]|<span>昭<\/span>|<span>梧<\/span>/);
  assert.match(html, /\/brand\/zhaowu-logo-r59\.png/);
});

test("r59 same-origin asset routes proxy only to Zhaowu Supabase production storage", () => {
  const base = "https://plgpxusmemnmzckbwtiv.supabase.co/storage/v1/object/public/zhaowu-backgrounds/brand/r59/";
  assert.equal(rewrites.get("/brand/zhaowu-logo-r59.png"), `${base}zhaowu-logo.png`);
  assert.equal(rewrites.get("/apple-touch-icon-r59.png"), `${base}zhaowu-home-icon-180.png`);
  assert.equal(rewrites.get("/apple-touch-icon-r59-precomposed.png"), `${base}zhaowu-home-icon-180.png`);
  assert.equal(rewrites.get("/icons/zhaowu-lotus-r59-192.png"), `${base}zhaowu-home-icon-192.png`);
  assert.equal(rewrites.get("/icons/zhaowu-lotus-r59-512.png"), `${base}zhaowu-home-icon-512.png`);
});

test("install guide and service worker use only the r59 active icon family", () => {
  assert.match(install, /\/apple-touch-icon-r59\.png/);
  assert.match(worker, /zhaowu-shell-r59/);
  assert.match(worker, /\/brand\/zhaowu-logo-r59\.png/);
  assert.match(worker, /\/apple-touch-icon-r59\.png/);
  assert.match(worker, /zhaowu-lotus-r59-192\.png/);
  assert.match(worker, /zhaowu-lotus-r59-512\.png/);
});
