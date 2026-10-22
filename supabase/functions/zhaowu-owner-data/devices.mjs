// Owner Passkey devices. Pure of Deno/Supabase imports: `service` is a supabase-js client (or a test double).

export class DeviceError extends Error {
  constructor(code, status = 400, detail = code) {
    super(detail);
    this.code = code;
    this.status = status;
  }
}

export const MAX_ACTIVE_DEVICES = 5;
export const DEVICE_SELECT = "id,label,transports,created_at,last_used_at,revoked_at";
const CREDENTIAL_SELECT = "id,credential_id,public_key,sign_count,transports,revoked_at";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CREDENTIAL_ID = /^[A-Za-z0-9_-]{16,1024}$/;
const BASE64URL = /^[A-Za-z0-9_-]{32,2048}$/;
const TRANSPORTS = new Set(["usb", "nfc", "ble", "internal", "hybrid", "smart-card", "cable"]);

const text = (value) => String(value ?? "").trim();

function deviceId(payload, field = "deviceId") {
  const id = text(payload?.[field]).toLowerCase();
  if (!UUID.test(id)) throw new DeviceError("INVALID_DEVICE_ID", 400);
  return id;
}

function fail(error, code) {
  if (error) throw new DeviceError(code, 502, error.message);
}

/** Is this device present and not revoked? Used on every Passkey-session request (cached by the caller). */
export async function deviceCheck(service, payload) {
  const id = deviceId(payload);
  const { data, error } = await service.from("owner_devices").select("id").eq("id", id).is("revoked_at", null).maybeSingle();
  fail(error, "DEVICE_CHECK_FAILED");
  return { ok: true, active: Boolean(data) };
}

/** Looks up the stored credential during sign-in. Returns revoked rows too so the server can say why it refused. */
export async function deviceCredential(service, payload) {
  const credentialId = text(payload?.credentialId);
  if (!CREDENTIAL_ID.test(credentialId)) throw new DeviceError("INVALID_CREDENTIAL_ID", 400);
  const { data, error } = await service.from("owner_devices").select(CREDENTIAL_SELECT).eq("credential_id", credentialId).maybeSingle();
  fail(error, "DEVICE_LOOKUP_FAILED");
  return { ok: true, device: data ?? null };
}

export async function deviceTouch(service, payload) {
  const id = deviceId(payload, "id");
  const signCount = Number(payload?.signCount);
  if (!Number.isSafeInteger(signCount) || signCount < 0) throw new DeviceError("INVALID_SIGN_COUNT", 400);
  const { error } = await service
    .from("owner_devices")
    .update({ sign_count: signCount, last_used_at: new Date().toISOString() })
    .eq("id", id)
    .is("revoked_at", null);
  fail(error, "DEVICE_TOUCH_FAILED");
  return { ok: true };
}

export async function deviceList(service) {
  const { data, error } = await service.from("owner_devices").select(DEVICE_SELECT).order("created_at", { ascending: true });
  fail(error, "DEVICE_LIST_FAILED");
  return { ok: true, items: data ?? [] };
}

export async function deviceCreate(service, payload) {
  const credentialId = text(payload?.credentialId);
  const publicKey = text(payload?.publicKey);
  const signCount = Number(payload?.signCount ?? 0);
  const transports = Array.isArray(payload?.transports) ? payload.transports.map(text).filter((item) => TRANSPORTS.has(item)) : [];
  const label = text(payload?.label).slice(0, 40) || "我的手機";
  if (!CREDENTIAL_ID.test(credentialId) || !BASE64URL.test(publicKey) || !Number.isSafeInteger(signCount) || signCount < 0) {
    throw new DeviceError("INVALID_DEVICE", 400);
  }
  const { count, error: countError } = await service.from("owner_devices").select("id", { count: "exact", head: true }).is("revoked_at", null);
  fail(countError, "DEVICE_LIST_FAILED");
  if ((count ?? 0) >= MAX_ACTIVE_DEVICES) throw new DeviceError("DEVICE_LIMIT_REACHED", 409);
  const { data, error } = await service
    .from("owner_devices")
    .insert({ credential_id: credentialId, public_key: publicKey, sign_count: signCount, transports, label })
    .select(DEVICE_SELECT)
    .single();
  if (error?.code === "23505") throw new DeviceError("DEVICE_EXISTS", 409);
  fail(error, "DEVICE_CREATE_FAILED");
  return { ok: true, item: data };
}

/** Soft revoke: the row stays for the audit trail and the credential id can never be registered again. */
export async function deviceRevoke(service, payload) {
  const id = deviceId(payload, "id");
  const { data, error } = await service
    .from("owner_devices")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();
  fail(error, "DEVICE_REVOKE_FAILED");
  if (!data) throw new DeviceError("DEVICE_NOT_FOUND", 404);
  return { ok: true };
}
