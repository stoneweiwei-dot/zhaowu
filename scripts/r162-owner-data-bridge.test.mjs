import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { authorizeBridgeHeaders } from "../supabase/functions/zhaowu-owner-data/security.mjs";
import ownerDataHandler from "../api/owner-data.js";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

function bridgeHeaders({ bridge = "", owner = "", marker = "r162" }) {
  return new Headers({
    "x-zhaowu-server-bridge": marker,
    "x-zhaowu-bridge-secret": bridge,
    "x-zhaowu-owner-secret": owner,
  });
}

test("edge authorization always verifies the owner secret", () => {
  const owner = "test-owner-secret";
  const ownerHash = createHash("sha256").update(owner, "utf8").digest("hex");
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ owner }), "", ownerHash).ok, true);
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ owner: "wrong" }), "", ownerHash).error, "OWNER_UNAUTHORIZED");
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ owner, marker: "" }), "", ownerHash).error, "BRIDGE_REQUIRED");
});

test("a configured bridge secret is additionally required and compared", () => {
  const owner = "test-owner-secret";
  const ownerHash = createHash("sha256").update(owner, "utf8").digest("hex");
  const bridge = "b".repeat(32);
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ owner, bridge }), bridge, ownerHash).ok, true);
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ owner, bridge: "x".repeat(32) }), bridge, ownerHash).error, "BRIDGE_UNAUTHORIZED");
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ owner }), bridge, ownerHash).error, "BRIDGE_UNAUTHORIZED");
});

test("browser code contains no Supabase service credential and calls only the same-origin API", async () => {
  const client = await source("src/lib/owner-data-client.ts");
  const api = await source("api/owner-data.js");
  const edge = await source("supabase/functions/zhaowu-owner-data/index.ts");
  assert.doesNotMatch(client, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY|sb_secret_/);
  assert.match(client, /fetch\("\/api\/owner-data"/);
  assert.match(client, /credentials: "same-origin"/);
  assert.match(api, /requestIsSameOrigin/);
  assert.match(api, /ownerSecretFrom/);
  assert.match(api, /X-Zhaowu-Owner-Secret/i);
  assert.doesNotMatch(api, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY/);
  assert.match(edge, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(edge, /ALLOWED_ACTIONS/);
});

test("uploads are bound to signed tickets before database finalization", async () => {
  const edge = await source("supabase/functions/zhaowu-owner-data/index.ts");
  const security = await source("supabase/functions/zhaowu-owner-data/security.mjs");
  assert.match(edge, /createSignedUploadUrl/);
  assert.match(edge, /verifyStoredObject/);
  assert.match(edge, /ZHAOWU_OWNER_UPLOAD_TICKET_SECRET[\s\S]*SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(security, /assertUploadTicketBinding/);
  assert.match(security, /UPLOADED_OBJECT_SIZE_MISMATCH/);
  assert.match(security, /UPLOADED_OBJECT_MIME_MISMATCH/);
});

test("the Netlify bridge parses a Fetch Request body before forwarding it", async () => {
  const originalFetch = globalThis.fetch;
  let forwarded = null;
  globalThis.fetch = async (_url, init) => {
    forwarded = JSON.parse(String(init?.body ?? "{}"));
    return new Response(JSON.stringify({ message: "Storage quota exceeded" }), {
      status: 402,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const request = new Request("https://archive-stone-zhaowu-official.netlify.app/api/owner-data", {
      method: "POST",
      headers: {
        origin: "https://archive-stone-zhaowu-official.netlify.app",
        host: "archive-stone-zhaowu-official.netlify.app",
        "sec-fetch-site": "same-origin",
        cookie: "__Host-zhaowu_owner_session=19881004",
        "content-type": "application/json",
      },
      body: JSON.stringify({ action: "report.list" }),
    });
    const response = await ownerDataHandler(request);
    assert.deepEqual(forwarded, { action: "report.list" });
    assert.equal(response.status, 402);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("active owner report data uses Floot DB while Vercel only deploys main", async () => {
  const api = await source("api/owner-data.js");
  const vercel = JSON.parse(await source("vercel.json"));
  assert.match(api, /zhaowu-media-vault\.floot\.app\/_api\/zhaowu-owner-data/);
  assert.match(api, /ZHAOWU_OWNER_DATA_URL/);
  assert.doesNotMatch(api, /gyisxbkjzvdretbqzeuw|\/functions\/v1\/zhaowu-owner-data/);
  assert.deepEqual(vercel.git?.deploymentEnabled, { "*": false, main: true });
  assert.equal(
    vercel.rewrites?.some((row) => row.source === "/api/gallery-ingest-finalize"),
    false,
  );
});
