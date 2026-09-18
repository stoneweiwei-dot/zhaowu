import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { authorizeBridgeHeaders } from "../supabase/functions/zhaowu-owner-data/security.mjs";

const provider = await readFile(new URL("../src/lib/auth/provider.tsx", import.meta.url), "utf8");
const currentUser = await readFile(new URL("../src/lib/auth/use-current-user.ts", import.meta.url), "utf8");
const ownerClient = await readFile(new URL("../src/lib/owner-data-client.ts", import.meta.url), "utf8");
const ownerApi = await readFile(new URL("../api/owner-data.js", import.meta.url), "utf8");
const ownerLogin = await readFile(new URL("../api/owner-login.js", import.meta.url), "utf8");
const ownerEdge = await readFile(new URL("../supabase/functions/zhaowu-owner-data/index.ts", import.meta.url), "utf8");
const ownerSecurity = await readFile(new URL("../supabase/functions/zhaowu-owner-data/security.mjs", import.meta.url), "utf8");
const bridgeReports = await readFile(new URL("../src/lib/bridge/supabase-rest.ts", import.meta.url), "utf8");
const bridgeBackgrounds = await readFile(new URL("../src/lib/bridge/background-assets.ts", import.meta.url), "utf8");
const bridgeGallery = await readFile(new URL("../src/lib/bridge/gallery-assets.ts", import.meta.url), "utf8");
const bridgeDecree = await readFile(new URL("../src/lib/bridge/decree-image.ts", import.meta.url), "utf8");
const tsconfig = await readFile(new URL("../tsconfig.json", import.meta.url), "utf8");
const vercel = await readFile(new URL("../vercel.json", import.meta.url), "utf8");

function ownerHash(source) {
  return source.match(/OWNER_KEY_SHA256\s*=\s*"([a-f0-9]{64})"/)?.[1] ?? "";
}

function bridgeHeaders({ bridge, owner, marker = "r146" }) {
  return new Headers({
    "x-zhaowu-server-bridge": marker,
    "x-zhaowu-bridge-secret": bridge,
    "x-zhaowu-owner-secret": owner,
  });
}

test("r146 preserves r144 guest-first auth and scopes the synthetic data session to owner back-office routes", () => {
  assert.match(provider, /setSession\(null\)/);
  assert.doesNotMatch(provider, /createOwnerCookieSession/);
  assert.match(currentUser, /OWNER_DATA_ROUTES/);
  assert.match(currentUser, /"\/account"/);
  assert.match(currentUser, /"\/gallery"/);
  assert.match(currentUser, /createOwnerCookieSession/);
  assert.match(currentUser, /state\.user\?\.isOwner/);
  assert.match(currentUser, /OWNER_DATA_ROUTES\.has\(pathname\)/);
  assert.match(currentUser, /window\.location\.replace\("\/"\)/);
  assert.match(currentUser, /ownerDataRoute && !state\.isPending && !isOwner/);
  assert.match(currentUser, /return \{ \.\.\.state, isPending: true \}/);
});

test("the browser sentinel never contains a Supabase secret and privileged data crosses only the same-origin owner API", () => {
  assert.match(ownerClient, /OWNER_COOKIE_ACCESS_TOKEN/);
  assert.doesNotMatch(ownerClient, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY|sb_secret_/);
  assert.match(ownerClient, /fetch\("\/api\/owner-data"/);
  assert.match(ownerClient, /credentials:\s*"same-origin"/);
  assert.match(ownerApi, /requestIsSameOrigin/);
  assert.match(ownerApi, /ownerSecretFrom/);
  assert.match(ownerApi, /\/functions\/v1\/zhaowu-owner-data/);
  assert.match(ownerApi, /X-Zhaowu-Owner-Secret/i);
  assert.doesNotMatch(ownerApi, /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY/);
});

test("Vercel and Supabase independently validate the same owner credential before service-role access", () => {
  const loginHash = ownerHash(ownerLogin);
  const edgeHash = ownerHash(ownerSecurity);
  assert.equal(loginHash.length, 64);
  assert.equal(edgeHash, loginHash);
  assert.match(ownerApi, /timingSafeEqual/);
  assert.match(ownerSecurity, /constantTimeEqual/);
  assert.match(ownerSecurity, /x-zhaowu-owner-secret/i);
  assert.match(ownerSecurity, /x-zhaowu-server-bridge/i);
  assert.match(ownerEdge, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(ownerEdge, /ALLOWED_ACTIONS/);
});

test("Supabase rejects missing or incorrect owner and bridge credentials before service-role access", () => {
  const bridgeSecret = "b".repeat(32);
  const ownerSecret = "test-owner-secret";
  const testOwnerHash = createHash("sha256").update(ownerSecret, "utf8").digest("hex");

  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ bridge: bridgeSecret, owner: ownerSecret }), bridgeSecret, testOwnerHash).ok, true);
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ bridge: bridgeSecret, owner: "wrong-owner" }), bridgeSecret, testOwnerHash).error, "OWNER_UNAUTHORIZED");
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ bridge: bridgeSecret, owner: "" }), bridgeSecret, testOwnerHash).error, "OWNER_UNAUTHORIZED");
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ bridge: "x".repeat(32), owner: ownerSecret }), bridgeSecret, testOwnerHash).error, "BRIDGE_UNAUTHORIZED");
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ bridge: "", owner: ownerSecret }), bridgeSecret, testOwnerHash).error, "BRIDGE_UNAUTHORIZED");
  assert.equal(authorizeBridgeHeaders(bridgeHeaders({ bridge: bridgeSecret, owner: ownerSecret, marker: "" }), bridgeSecret, testOwnerHash).error, "BRIDGE_REQUIRED");
});

test("owner reports, backgrounds, gallery and decree actions are routed through bridge modules", () => {
  assert.match(tsconfig, /src\/lib\/bridge\/supabase-rest\.ts/);
  assert.match(tsconfig, /src\/lib\/bridge\/background-assets\.ts/);
  assert.match(tsconfig, /src\/lib\/bridge\/gallery-assets\.ts/);
  assert.match(tsconfig, /src\/lib\/bridge\/decree-image\.ts/);
  assert.match(bridgeReports, /report\.list/);
  assert.match(bridgeReports, /report\.get/);
  assert.match(bridgeReports, /report\.delete/);
  assert.match(bridgeBackgrounds, /background\.prepareUpload/);
  assert.match(bridgeGallery, /gallery\.prepareUpload/);
  assert.match(bridgeDecree, /report\.generateImage/);
  assert.match(ownerEdge, /createSignedUploadUrl/);
  assert.match(ownerEdge, /createSignedUrl/);
});

test("r146 registers the Vercel server function and does not expose service credentials in Vite env", () => {
  assert.match(vercel, /api\/owner-data\.js/);
  assert.doesNotMatch(tsconfig, /service_role|sb_secret_/i);
  assert.doesNotMatch(ownerClient, /VITE_.*SECRET|VITE_.*SERVICE/i);
});
