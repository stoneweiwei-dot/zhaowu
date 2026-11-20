import { ownerData } from "@/lib/owner-data-client";

export type PromoSystemId = "bazi" | "ziwei" | "qizheng" | "western" | "indian" | "palm" | "numerology";
export type PromoStatus = "active" | "inactive" | "expired" | "exhausted";

export type OwnerPromoCode = {
  id: string;
  code: string;
  productId: "system";
  systemId: PromoSystemId | null;
  active: boolean;
  maxRedemptions: number | null;
  redeemedCount: number;
  expiresAt: string | null;
  note: string;
  createdAt: string | null;
  status: PromoStatus;
};

export const PROMO_SYSTEMS: { id: PromoSystemId; label: string }[] = [
  { id: "bazi", label: "八字" },
  { id: "ziwei", label: "紫微斗數" },
  { id: "qizheng", label: "七政四餘" },
  { id: "western", label: "西洋占星" },
  { id: "indian", label: "印度占星" },
  { id: "palm", label: "手相" },
  { id: "numerology", label: "數字命理" },
];

export type CreatePromoInput = {
  productId: "system";
  systemId: PromoSystemId | null;
  maxRedemptions: number | null;
  expiresAt: string | null;
  note: string;
  code?: string;
};

export const PROMO_ERROR_TEXT: Record<string, string> = {
  BAD_PRODUCT: "產品類型不正確。",
  BAD_SYSTEM: "系統不正確。",
  BAD_MAX_REDEMPTIONS: "名額須為 1 至 100000 的整數，或留空代表不限。",
  BAD_EXPIRY: "到期日須是未來 5 年內的日期。",
  NOTE_TOO_LONG: "備註最長 200 字。",
  BAD_CODE: "優惠碼只能用英數字與連字號，長度 3 至 64。",
  CODE_ALREADY_EXISTS: "這組優惠碼已存在（不分大小寫）。",
  MAX_BELOW_REDEEMED: "名額不能低於已兌換數量。",
  PROMO_NOT_FOUND: "找不到這組優惠碼。",
  PROMO_STORE_ERROR: "優惠碼資料庫暫時無法使用，請稍後再試。",
  PROMO_STORE_NOT_CONFIGURED: "優惠碼資料庫尚未設定。",
  OWNER_REQUIRED: "後台登入已過期，請重新登入後台。",
  ORIGIN_REJECTED: "請從正式網址打開後台再操作。",
};

export function promoErrorText(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  for (const [code, text] of Object.entries(PROMO_ERROR_TEXT)) if (message.includes(code)) return text;
  return message || "操作失敗，請稍後再試。";
}

export async function listPromoCodes() {
  const body = await ownerData<{ ok: true; codes: OwnerPromoCode[] }>("promo.list");
  return body.codes;
}

export async function createPromoCode(input: CreatePromoInput) {
  const body = await ownerData<{ ok: true; code: OwnerPromoCode }>("promo.create", input);
  return body.code;
}

export async function updatePromoCode(id: string, patch: { active?: boolean; maxRedemptions?: number | null; expiresAt?: string | null; note?: string }) {
  const body = await ownerData<{ ok: true; code: OwnerPromoCode }>("promo.update", { id, ...patch });
  return body.code;
}

export async function setPromoActive(id: string, active: boolean) {
  const body = await ownerData<{ ok: true; code: OwnerPromoCode }>("promo.setActive", { id, active });
  return body.code;
}
