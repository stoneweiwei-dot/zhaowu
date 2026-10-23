// Pure validation / shaping for the owner promo-code console. No I/O, so node:test can cover it.
// Mirrors the live constraints on public.promo_codes (checked against the production schema 2026-10-17):
//   code UNIQUE · product_id = system · system_id null or one of the 7 systems ·
//   max_redemptions null or > 0 · redeemed_count >= 0.
// The customer-facing redeem path (promo-code Edge Function) is NOT touched by this module.

export const SYSTEM_IDS = ["bazi", "ziwei", "qizheng", "western", "indian", "palm", "numerology"];
export const PRODUCT_IDS = ["system"];
// No 0/O/1/I/L so a code read aloud or typed from a screenshot is not ambiguous.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_PATTERN = /^[A-Za-z0-9-]{3,64}$/;
const MAX_REDEMPTIONS_CAP = 100000;
const MAX_EXPIRY_YEARS = 5;
const NOTE_MAX = 200;

const fail = (error) => ({ ok: false, error });
const ok = (value) => ({ ok: true, value });

export function generateCode(randomBytes) {
  const bytes = randomBytes(8);
  let body = "";
  for (const byte of bytes) body += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  return `ZW-${body.slice(0, 4)}-${body.slice(4, 8)}`;
}

function optionalInt(value, { min, max }) {
  if (value === null || value === undefined || value === "") return { set: true, value: null };
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(n) || n < min || n > max) return { set: false };
  return { set: true, value: n };
}

function expiry(value, now) {
  if (value === null || value === undefined || value === "") return { set: true, value: null };
  const at = new Date(String(value));
  if (Number.isNaN(at.getTime())) return { set: false };
  if (at.getTime() <= now.getTime()) return { set: false };
  if (at.getTime() > now.getTime() + MAX_EXPIRY_YEARS * 365 * 86_400_000) return { set: false };
  return { set: true, value: at.toISOString() };
}

function cleanNote(value) {
  const note = String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return note.length > NOTE_MAX ? null : note;
}

export function normalizeCreate(payload, { now = new Date(), randomBytes } = {}) {
  const productId = String(payload?.productId ?? "");
  if (!PRODUCT_IDS.includes(productId)) return fail("BAD_PRODUCT");

  let systemId = payload?.systemId ?? null;
  if (systemId === "" || systemId === "all") systemId = null;
  if (systemId !== null && !SYSTEM_IDS.includes(String(systemId))) {
    return fail("BAD_SYSTEM");
  }

  const max = optionalInt(payload?.maxRedemptions, { min: 1, max: MAX_REDEMPTIONS_CAP });
  if (!max.set) return fail("BAD_MAX_REDEMPTIONS");
  const exp = expiry(payload?.expiresAt, now);
  if (!exp.set) return fail("BAD_EXPIRY");
  const note = cleanNote(payload?.note);
  if (note === null) return fail("NOTE_TOO_LONG");

  let code = String(payload?.code ?? "").trim();
  if (!code) {
    if (typeof randomBytes !== "function") return fail("NO_RANDOM_SOURCE");
    code = generateCode(randomBytes);
  } else if (!CODE_PATTERN.test(code)) {
    return fail("BAD_CODE");
  }

  return ok({
    code,
    product_id: productId,
    system_id: systemId === null ? null : String(systemId),
    max_redemptions: max.value,
    expires_at: exp.value,
    note,
    active: payload?.active === false ? false : true,
  });
}

export function normalizeUpdate(payload, current, { now = new Date() } = {}) {
  const patch = {};
  if ("active" in (payload ?? {})) {
    if (typeof payload.active !== "boolean") return fail("BAD_ACTIVE");
    patch.active = payload.active;
  }
  if ("maxRedemptions" in (payload ?? {})) {
    const max = optionalInt(payload.maxRedemptions, { min: 1, max: MAX_REDEMPTIONS_CAP });
    if (!max.set) return fail("BAD_MAX_REDEMPTIONS");
    // Lowering the cap below slots already used would make the row contradict its own history.
    if (max.value !== null && max.value < Number(current?.redeemed_count ?? 0)) return fail("MAX_BELOW_REDEEMED");
    patch.max_redemptions = max.value;
  }
  if ("expiresAt" in (payload ?? {})) {
    const exp = expiry(payload.expiresAt, now);
    if (!exp.set) return fail("BAD_EXPIRY");
    patch.expires_at = exp.value;
  }
  if ("note" in (payload ?? {})) {
    const note = cleanNote(payload.note);
    if (note === null) return fail("NOTE_TOO_LONG");
    patch.note = note;
  }
  if (!Object.keys(patch).length) return fail("NOTHING_TO_UPDATE");
  patch.updated_at = now.toISOString();
  return ok(patch);
}

export function promoStatus(row, now = new Date()) {
  if (!row.active) return "inactive";
  if (row.expires_at && new Date(row.expires_at).getTime() <= now.getTime()) return "expired";
  if (row.max_redemptions !== null && row.max_redemptions !== undefined && row.redeemed_count >= row.max_redemptions) return "exhausted";
  return "active";
}

export function toPublicRow(row, now = new Date()) {
  return {
    id: row.id,
    code: row.code,
    productId: row.product_id,
    systemId: row.system_id ?? null,
    active: Boolean(row.active),
    maxRedemptions: row.max_redemptions ?? null,
    redeemedCount: Number(row.redeemed_count ?? 0),
    expiresAt: row.expires_at ?? null,
    note: row.note ?? "",
    createdAt: row.created_at ?? null,
    status: promoStatus(row, now),
  };
}
