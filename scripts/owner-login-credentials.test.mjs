import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ownerLogin from "../api/owner-login.js";
import { isPublicTestCredential } from "../lib/owner-test-account.js";

// No credential in plaintext lives in this repo. Behavioural checks that need the real pairs read
// them from the environment and skip when unset; everything else is verified through hashes.
const sha = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const OWNER_EMAIL = process.env.ZHAOWU_OWNER_TEST_EMAIL ?? "";
const OWNER_SECRET = process.env.ZHAOWU_OWNER_TEST_SECRET ?? "";
const TESTER_EMAIL = process.env.ZHAOWU_TESTER_EMAIL ?? "";
const TESTER_SECRET = process.env.ZHAOWU_TESTER_SECRET ?? "";

const post = (body) => ownerLogin(new Request("https://zhao-wu.com/api/owner-login", {
  method: "POST",
  headers: { "content-type": "application/json", origin: "https://zhao-wu.com", "x-forwarded-host": "zhao-wu.com" },
  body: JSON.stringify(body),
}));

const OWNER_HASH_FILES = [
  "lib/owner-session-cookie.js",
  "src/server/owner-auth.ts",
  "supabase/functions/zhaowu-owner-data/security.mjs",
  "supabase/functions/zhaowu-owner-articles/auth.mjs",
  "supabase/functions/zhaowu-owner-promo/auth.mjs",
];

test("owner verifiers are supplied only by runtime configuration", async () => {
  for (const file of [...OWNER_HASH_FILES, "api/owner-login.js"]) {
    const code = await source(file);
    assert.doesNotMatch(code, /OWNER_(?:KEY|ACCOUNT)_SHA256\s*=\s*"[0-9a-f]{64}"/);
    if (file !== "src/server/owner-auth.ts") assert.match(code, /ZHAOWU_OWNER_(?:KEY|ACCOUNT)_SHA256/);
  }
});

test("the public tester module is not imported by any owner-privilege path", async () => {
  for (const file of [...OWNER_HASH_FILES, "api/owner-data.js", "api/owner-session.js", "api/owner-music-write.js"]) {
    assert.doesNotMatch(await source(file), /owner-test-account/, `${file} must not know about the tester credential`);
  }
  const login = await source("api/owner-login.js");
  assert.match(login, /isPublicTestCredential\(account, secret\)\) return json\(res, 200, \{ ok: true, mode: "tester" \}\);/);
  // The tester branch must return before any cookie is minted.
  assert.ok(login.indexOf("isPublicTestCredential(account, secret)") < login.indexOf("ownerSetCookie(secret)"));
});

test("tester helper rejects empty and oversized input", () => {
  assert.equal(isPublicTestCredential("", ""), false);
  assert.equal(isPublicTestCredential("a@b.co", "x".repeat(300)), false);
  assert.equal(isPublicTestCredential("x".repeat(300), "password1"), false);
});

test("wrong or incomplete pairs are rejected without a cookie", async () => {
  for (const bad of [
    { email: "someone@example.com", secret: "not-the-password" },
    { email: "someone@example.com" },
    { secret: "not-the-password" },
    {},
  ]) {
    const response = await post(bad);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("owner pair opens a session; tester pair never does", { skip: !(OWNER_EMAIL && OWNER_SECRET && TESTER_EMAIL && TESTER_SECRET) && "credential env vars not set" }, async () => {
  const owner = await post({ email: OWNER_EMAIL, secret: OWNER_SECRET });
  assert.equal(owner.status, 200);
  assert.match(owner.headers.get("set-cookie") ?? "", /__Host-zhaowu_owner_session=/);

  const tester = await post({ email: TESTER_EMAIL, secret: TESTER_SECRET });
  assert.equal(tester.status, 200);
  assert.deepEqual(await tester.json(), { ok: true, mode: "tester" });
  assert.equal(tester.headers.get("set-cookie"), null);

  assert.equal((await post({ email: OWNER_EMAIL, secret: TESTER_SECRET })).status, 401);
  assert.equal((await post({ email: TESTER_EMAIL, secret: OWNER_SECRET })).status, 401);
  assert.equal(sha(OWNER_SECRET) === sha(TESTER_SECRET), false);
});
