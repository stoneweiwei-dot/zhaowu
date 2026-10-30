// Customer redeem responses. Every "no such code" and "code exists but cannot
// be used" outcome shares one status and one body so the client cannot tell
// them apart. The reason stays on the server log only.

export const PROMO_INVALID_STATUS = 404;

export const PROMO_INVALID_BODY = {
  ok: false,
  error: {
    code: "PROMO_INVALID",
    message: "This code cannot be used.",
  },
};

export function clientPromoRejection(reason) {
  return { status: PROMO_INVALID_STATUS, body: PROMO_INVALID_BODY, reason };
}

export function isCustomerPromoCode(value) {
  return typeof value === "string" && /^[A-Za-z0-9-]{3,64}$/.test(value.trim());
}

/** null when the row may still be redeemed; otherwise a server-only reason. */
export function promoRejectReason(promo, system, now = new Date()) {
  if (!promo) return "not_found";
  if (!promo.active) return "inactive";
  if (promo.expires_at && new Date(promo.expires_at).getTime() <= now.getTime()) return "expired";
  if (promo.system_id && promo.system_id !== system) return "wrong_system";
  if (promo.product_id !== "system") return "wrong_product";
  return null;
}

export function promoExhausted(promo) {
  return promo.max_redemptions !== null && promo.max_redemptions !== undefined && Number(promo.redeemed_count) >= promo.max_redemptions;
}

export async function shortPromoCodeHash(code) {
  const normalized = String(code ?? "").trim().toUpperCase();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 12);
}

export async function promoRejectLog(reason, code) {
  return {
    event: "promo_redeem_rejected",
    reason,
    code_hash: await shortPromoCodeHash(code),
  };
}
