import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  DeviceError,
  MAX_ACTIVE_DEVICES,
  deviceCheck,
  deviceCreate,
  deviceCredential,
  deviceList,
  deviceRevoke,
  deviceTouch,
} from "../supabase/functions/zhaowu-owner-data/devices.mjs";
import { authorizeBridgeHeaders, authorizeBridgeOnly } from "../supabase/functions/zhaowu-owner-data/security.mjs";

// ---- minimal in-memory stand-in for supabase-js ---------------------------------------------------------------
function fakeService(initial = []) {
  const rows = initial.map((row) => ({ ...row }));
  let nextId = 1;
  const uuid = () => `00000000-0000-4000-8000-${String(nextId++).padStart(12, "0")}`;

  function query(table) {
    assert.equal(table, "owner_devices");
    const state = { op: "select", filters: [], patch: null, insert: null, head: false, order: null };
    const matches = () => rows.filter((row) => state.filters.every((test) => test(row)));
    const builder = {
      select(_columns, options) { if (state.op === "select" || state.op === "insert" || state.op === "update") state.returning = true; state.head = Boolean(options?.head); return builder; },
      insert(values) { state.op = "insert"; state.insert = values; return builder; },
      update(patch) { state.op = "update"; state.patch = patch; return builder; },
      eq(column, value) { state.filters.push((row) => row[column] === value); return builder; },
      is(column, value) { state.filters.push((row) => (row[column] ?? null) === value); return builder; },
      order() { return builder; },
      async maybeSingle() { return run((found) => found[0] ?? null); },
      async single() { return run((found) => found[0] ?? null); },
      then(resolve, reject) { return run((found) => found).then(resolve, reject); },
    };
    async function run(pick) {
      if (state.op === "insert") {
        if (rows.some((row) => row.credential_id === state.insert.credential_id)) return { data: null, error: { code: "23505", message: "duplicate" } };
        const row = { id: uuid(), created_at: new Date().toISOString(), last_used_at: null, revoked_at: null, ...state.insert };
        rows.push(row);
        return { data: pick([row]), error: null };
      }
      if (state.op === "update") {
        const found = matches();
        found.forEach((row) => Object.assign(row, state.patch));
        return { data: pick(found), error: null };
      }
      const found = matches();
      if (state.head) return { data: null, count: found.length, error: null };
      return { data: pick(found), error: null };
    }
    return builder;
  }
  return { from: query, rows };
}

const KEY = "A".repeat(43);
const CRED = "B".repeat(43);
const newDevice = (overrides = {}) => ({ credentialId: CRED, publicKey: KEY, signCount: 0, transports: ["internal", "bogus"], label: "iPhone 15", ...overrides });
const code = async (promise) => promise.then(() => null, (error) => (error instanceof DeviceError ? error.code : `unexpected:${error.message}`));

test("create, list, check and revoke a device", async () => {
  const service = fakeService();
  const { item } = await deviceCreate(service, newDevice());
  assert.equal(item.label, "iPhone 15");
  assert.deepEqual(item.transports, ["internal"], "unknown transports are dropped");

  assert.equal((await deviceList(service)).items.length, 1);
  assert.equal((await deviceCheck(service, { deviceId: item.id })).active, true);
  await deviceRevoke(service, { id: item.id });
  assert.equal((await deviceCheck(service, { deviceId: item.id })).active, false);
  assert.equal(await code(deviceRevoke(service, { id: item.id })), "DEVICE_NOT_FOUND", "already revoked");
  assert.equal(service.rows.length, 1, "revoking never deletes the row");
});

test("a revoked credential id can never be registered again", async () => {
  const service = fakeService();
  const { item } = await deviceCreate(service, newDevice());
  assert.equal(await code(deviceCreate(service, newDevice())), "DEVICE_EXISTS");
  await deviceRevoke(service, { id: item.id });
  assert.equal(await code(deviceCreate(service, newDevice())), "DEVICE_EXISTS");
});

test("at most five active devices; revoked ones do not count", async () => {
  const service = fakeService();
  const ids = [];
  for (let index = 0; index < MAX_ACTIVE_DEVICES; index += 1) {
    ids.push((await deviceCreate(service, newDevice({ credentialId: `${String(index).repeat(20)}ABCDEFGHIJ` }))).item.id);
  }
  assert.equal(await code(deviceCreate(service, newDevice({ credentialId: "Z".repeat(30) }))), "DEVICE_LIMIT_REACHED");
  await deviceRevoke(service, { id: ids[0] });
  assert.equal(await code(deviceCreate(service, newDevice({ credentialId: "Z".repeat(30) }))), null);
});

test("credential lookup returns the stored key and flags revoked rows", async () => {
  const service = fakeService();
  const { item } = await deviceCreate(service, newDevice());
  const found = (await deviceCredential(service, { credentialId: CRED })).device;
  assert.equal(found.id, item.id);
  assert.equal(found.public_key, KEY);
  assert.equal(found.revoked_at, null);
  await deviceRevoke(service, { id: item.id });
  assert.ok((await deviceCredential(service, { credentialId: CRED })).device.revoked_at);
  assert.equal((await deviceCredential(service, { credentialId: "C".repeat(43) })).device, null);
});

test("touch updates the counter only for active devices", async () => {
  const service = fakeService();
  const { item } = await deviceCreate(service, newDevice());
  await deviceTouch(service, { id: item.id, signCount: 7 });
  assert.equal(service.rows[0].sign_count, 7);
  assert.ok(service.rows[0].last_used_at);
  await deviceRevoke(service, { id: item.id });
  await deviceTouch(service, { id: item.id, signCount: 9 });
  assert.equal(service.rows[0].sign_count, 7);
});

test("malformed input is rejected before touching the database", async () => {
  const service = fakeService();
  assert.equal(await code(deviceCheck(service, { deviceId: "nope" })), "INVALID_DEVICE_ID");
  assert.equal(await code(deviceRevoke(service, { id: "../etc" })), "INVALID_DEVICE_ID");
  assert.equal(await code(deviceCredential(service, { credentialId: "short" })), "INVALID_CREDENTIAL_ID");
  assert.equal(await code(deviceCredential(service, { credentialId: "x'; drop table owner_devices;--".padEnd(40, "a") })), "INVALID_CREDENTIAL_ID");
  assert.equal(await code(deviceCreate(service, newDevice({ publicKey: "***" }))), "INVALID_DEVICE");
  assert.equal(await code(deviceCreate(service, newDevice({ signCount: -1 }))), "INVALID_DEVICE");
  assert.equal(await code(deviceTouch(service, { id: "00000000-0000-4000-8000-000000000001", signCount: 1.5 })), "INVALID_SIGN_COUNT");
  assert.equal(service.rows.length, 0);
});

// ---- authorization ---------------------------------------------------------------------------------------------
const OWNER = "test-owner-secret";
const OWNER_HASH = createHash("sha256").update(OWNER, "utf8").digest("hex");
const BRIDGE = "b".repeat(32);
const DEVICE = "3f2b8c1e-5d4a-4e7b-9c10-a1b2c3d4e5f6";
const headers = (values) => new Headers({ "x-zhaowu-server-bridge": "r162", ...values });

test("password sessions authorize as before; device sessions authorize as a device", () => {
  const secret = authorizeBridgeHeaders(headers({ "x-zhaowu-bridge-secret": BRIDGE, "x-zhaowu-owner-secret": OWNER }), BRIDGE, OWNER_HASH);
  assert.equal(secret.ok, true);
  assert.equal(secret.mode, "secret");

  const device = authorizeBridgeHeaders(headers({ "x-zhaowu-bridge-secret": BRIDGE, "x-zhaowu-owner-device": DEVICE.toUpperCase() }), BRIDGE, OWNER_HASH);
  assert.deepEqual(device, { ok: true, mode: "device", deviceId: DEVICE });
});

test("a wrong password never falls through to a device id, and bad device ids are refused", () => {
  const wrong = authorizeBridgeHeaders(headers({ "x-zhaowu-bridge-secret": BRIDGE, "x-zhaowu-owner-secret": "wrong" }), BRIDGE, OWNER_HASH);
  assert.equal(wrong.error, "OWNER_UNAUTHORIZED");
  const junk = authorizeBridgeHeaders(headers({ "x-zhaowu-bridge-secret": BRIDGE, "x-zhaowu-owner-device": "not-a-uuid" }), BRIDGE, OWNER_HASH);
  assert.equal(junk.error, "OWNER_UNAUTHORIZED");
  const none = authorizeBridgeHeaders(headers({ "x-zhaowu-bridge-secret": BRIDGE }), BRIDGE, OWNER_HASH);
  assert.equal(none.error, "OWNER_UNAUTHORIZED");
});

test("a device id without the bridge secret is refused", () => {
  const result = authorizeBridgeHeaders(headers({ "x-zhaowu-owner-device": DEVICE }), BRIDGE, OWNER_HASH);
  assert.equal(result.error, "BRIDGE_UNAUTHORIZED");
});

test("bridge-only actions never skip the bridge secret, even when none is configured", () => {
  assert.equal(authorizeBridgeOnly(headers({ "x-zhaowu-bridge-secret": BRIDGE }), BRIDGE).ok, true);
  assert.equal(authorizeBridgeOnly(headers({ "x-zhaowu-bridge-secret": "x".repeat(32) }), BRIDGE).error, "BRIDGE_UNAUTHORIZED");
  assert.equal(authorizeBridgeOnly(headers({}), BRIDGE).error, "BRIDGE_UNAUTHORIZED");
  assert.equal(authorizeBridgeOnly(headers({ "x-zhaowu-bridge-secret": "" }), "").error, "BRIDGE_NOT_CONFIGURED");
  assert.equal(authorizeBridgeOnly(headers({ "x-zhaowu-bridge-secret": "short" }), "short").error, "BRIDGE_NOT_CONFIGURED");
  assert.equal(authorizeBridgeOnly(new Headers({ "x-zhaowu-bridge-secret": BRIDGE }), BRIDGE).error, "BRIDGE_REQUIRED");
});

test("the edge function wires device actions with the right guards", async () => {
  const edge = await readFile(new URL("../supabase/functions/zhaowu-owner-data/index.ts", import.meta.url), "utf8");
  assert.match(edge, /BRIDGE_ONLY_ACTIONS = new Set\(\["owner\.device\.check", "owner\.device\.credential", "owner\.device\.touch"\]\)/);
  assert.match(edge, /SECRET_ONLY_ACTIONS = new Set\(\["owner\.device\.create"\]\)/);
  assert.match(edge, /OWNER_PASSWORD_REQUIRED/);
  assert.match(edge, /auth\.mode === "device"[\s\S]*deviceCheck\(service/);
  for (const action of ["check", "credential", "touch", "list", "create", "revoke"]) assert.match(edge, new RegExp(`case "owner\\.device\\.${action}"`));
  const migration = await readFile(new URL("../supabase/migrations/20261022000000_owner_devices.sql", import.meta.url), "utf8");
  assert.match(migration, /enable row level security/i);
  assert.doesNotMatch(migration, /create policy/i);
});
