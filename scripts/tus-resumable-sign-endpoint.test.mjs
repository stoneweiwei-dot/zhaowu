import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// r215 fixed the wrong half of a two-part bug: it moved the signed-upload
// token out of `authorization` into `x-signature`, but kept the client
// pointed at the plain /storage/v1/upload/resumable endpoint. That endpoint
// authorizes the caller normally — checking storage.objects RLS against the
// Authorization header's JWT role — and this app has no real Supabase Auth
// session (the owner signs in through a cookie bridge), so every request
// resolves to role=anon and the RLS policy (roles={authenticated}, confirmed
// live via Supabase pg_policies: zhaowu_gallery_owner_insert) rejects it with
// the exact same 403 "new row violates row-level security policy", no matter
// what headers carry the token. Supabase's own resumable-upload-signed-uppy
// example uses a dedicated `.../resumable/sign` endpoint for this: it trusts
// x-signature (minted server-side via createSignedUploadUrl under the
// service role, which already bypasses RLS) instead of re-checking the
// caller's own role, and sends no Authorization header at all.
const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("owner resumable video/image uploads use Supabase's signed TUS endpoint, not the plain one", async () => {
  const client = await source("src/lib/owner-data-client.ts");

  // The literal endpoint string must end in /sign — a bare
  // "/storage/v1/upload/resumable`" (no /sign) is the exact regression this
  // guards against, since it silently reproduces the r215-era 403.
  assert.match(client, /\/storage\/v1\/upload\/resumable\/sign`/);
  assert.doesNotMatch(client, /\/storage\/v1\/upload\/resumable`/);

  // Headers must match Supabase's own signed-upload TUS example: apikey +
  // x-signature, no Authorization bearer (the signed endpoint doesn't check
  // the caller's own role, so sending one is at best noise and at worst a
  // stale anon-key bearer someone "fixes" back into a 403 later).
  const tusCallStart = client.indexOf("new tus.Upload");
  assert.ok(tusCallStart >= 0, "expected a tus.Upload(...) call in owner-data-client.ts");
  const headersBlock = client.slice(tusCallStart, tusCallStart + 800);
  assert.match(headersBlock, /apikey: SUPABASE_KEY/);
  assert.match(headersBlock, /"x-signature": signedUploadToken/);
  assert.doesNotMatch(headersBlock, /authorization:/);

  // The server side that mints signedUploadToken must still use the service
  // role's createSignedUploadUrl (bypasses RLS at ticket-creation time) —
  // unrelated to this bug, but if this ever regresses, x-signature would be
  // signed by the wrong authority and the /sign endpoint would reject it too.
  const edge = await source("supabase/functions/zhaowu-owner-data/index.ts");
  assert.match(edge, /createSignedUploadUrl\(path, \{ upsert: false \}\)/);
  assert.match(edge, /token: data\.token \?\? null/);
});
