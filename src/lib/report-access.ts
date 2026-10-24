import { readOwnerSession } from "@/lib/auth/owner-api";
import { oncePerSession, trackConversion } from "@/lib/observability/conversion-telemetry";
import { hasPurchaseConsent } from "@/lib/purchase-consent";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export type ReportSystemId = "bazi" | "ziwei" | "qizheng" | "western" | "indian" | "palm" | "numerology";
export type ReportAccessProduct = "quick" | "system";
export type ReportAccessLevel = "none" | "quick" | "system";

// The "quick" tier is no longer sold: every visitor gets it for free.
export type ReportPriceCurrency = "usd" | "aud" | "cny";
type FixedReportPrice = { amountCents: number; price: string };

const FIXED_REPORT_PRICES = {
  standard: {
    usd: { amountCents: 990, price: "US$9.90" },
    aud: { amountCents: 1490, price: "A$14.90" },
    cny: { amountCents: 6800, price: "¥68" },
  },
  deep: {
    usd: { amountCents: 1690, price: "US$16.90" },
    aud: { amountCents: 2490, price: "A$24.90" },
    cny: { amountCents: 10800, price: "¥108" },
  },
} as const satisfies Record<"standard" | "deep", Record<ReportPriceCurrency, FixedReportPrice>>;

// Canonical USD values remain exported for contracts that need a stable base.
// Customer-facing labels use reportAccessPrice(), which selects one of the
// manually fixed Stripe currencies; it never calculates a live exchange rate.
export const REPORT_ACCESS_PRODUCTS = {
  quick: { amountCents: 0, price: "$0" },
  system: FIXED_REPORT_PRICES.standard.usd,
} as const;

const DEEP_REPORT_SYSTEMS: ReadonlySet<ReportSystemId> = new Set<ReportSystemId>(["bazi", "ziwei"]);

export function detectReportPriceCurrency(): ReportPriceCurrency {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "usd";
  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const hasRegion = (region: string) => locales.some((locale) => new RegExp(`[-_]${region}(?:$|[-_])`, "i").test(locale));

  if (hasRegion("AU") || timeZone.startsWith("Australia/") || timeZone === "Antarctica/Macquarie") return "aud";
  if (hasRegion("CN") || ["Asia/Shanghai", "Asia/Urumqi", "Asia/Chongqing", "Asia/Harbin"].includes(timeZone)) return "cny";
  return "usd";
}

export function reportAccessPrice(product: ReportAccessProduct, system: ReportSystemId): FixedReportPrice {
  if (product === "quick") return REPORT_ACCESS_PRODUCTS.quick;
  const currency = detectReportPriceCurrency();
  return FIXED_REPORT_PRICES[DEEP_REPORT_SYSTEMS.has(system) ? "deep" : "standard"][currency];
}

const ACCESS_KEY_STORAGE = "zhaowu.report-access-key.v1";
const SESSION_STORAGE = "zhaowu.report-access-sessions.v1";
const BAZI_RETURN_STORAGE = "zhaowu.pending-bazi-return.v1";
const ACCESS_ENDPOINT = `${SUPABASE_URL}/functions/v1/stripe-checkout`;
const PROMO_ENDPOINT = `${SUPABASE_URL}/functions/v1/promo-code`;

const PAYMENT_LINKS: Record<ReportSystemId, string> = {
  bazi: "https://buy.stripe.com/9B600ja510QNgoH5582sM0C", // 2026-10-19 fixed deep price
  ziwei: "https://buy.stripe.com/9B69AT0urbvr6O77dg2sM0B", // 2026-10-19 fixed deep price
  qizheng: "https://buy.stripe.com/14A6oH7WTdDz4FZ7dg2sM0o",
  western: "https://buy.stripe.com/00w3cvb95gPL6O70OS2sM0q",
  indian: "https://buy.stripe.com/7sY14ncd9arn1tNgNQ2sM0s",
  palm: "https://buy.stripe.com/bJeaEXdhdarn5K3eFI2sM0u",
  numerology: "https://buy.stripe.com/dRm00jgtpgPL1tN2X02sM0w",
};

type Verification = {
  ok?: boolean;
  paid?: boolean;
  pending?: boolean;
  product?: ReportAccessProduct;
  system?: ReportSystemId | null;
  error?: { code?: string } | string;
};

function randomAccessKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function reportAccessKey() {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(ACCESS_KEY_STORAGE)?.trim();
    if (existing && /^[A-Za-z0-9-]{20,100}$/.test(existing)) return existing;
    const next = randomAccessKey();
    localStorage.setItem(ACCESS_KEY_STORAGE, next);
    return next;
  } catch {
    return randomAccessKey();
  }
}

function storedSessions() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_STORAGE) || "[]");
    return Array.isArray(parsed)
      ? [...new Set(parsed.map(String).filter((value) => /^cs_(?:live|test)_[A-Za-z0-9]{10,200}$/.test(value)))].slice(-12)
      : [];
  } catch {
    return [];
  }
}

function rememberSession(sessionId: string) {
  if (typeof window === "undefined" || !/^cs_(?:live|test)_[A-Za-z0-9]{10,200}$/.test(sessionId)) return;
  try {
    localStorage.setItem(SESSION_STORAGE, JSON.stringify([...new Set([...storedSessions(), sessionId])].slice(-12)));
  } catch {
    /* A privacy-restricted browser can still use the current success URL. */
  }
}

function apiHeaders() {
  return { apikey: SUPABASE_KEY, "Content-Type": "application/json" };
}

async function payloadOf(response: Response): Promise<Verification> {
  const payload = await response.json().catch(() => ({})) as Verification;
  if (!response.ok) {
    const raw = typeof payload.error === "string" ? payload.error : payload.error?.code;
    throw new Error(raw || `HTTP_${response.status}`);
  }
  return payload;
}

async function verifySession(sessionId: string): Promise<Verification> {
  const url = new URL(ACCESS_ENDPOINT);
  url.searchParams.set("session_id", sessionId);
  const response = await fetch(url, { headers: apiHeaders(), cache: "no-store" });
  return payloadOf(response);
}

async function verifyPromo(accessKey: string, system: ReportSystemId): Promise<Verification> {
  const url = new URL(PROMO_ENDPOINT);
  url.searchParams.set("access_key", accessKey);
  url.searchParams.set("system", system);
  const response = await fetch(url, { headers: apiHeaders(), cache: "no-store" });
  return payloadOf(response);
}

export type PromoRedeemError =
  | "CONSENT_REQUIRED"
  | "ACCESS_KEY_UNAVAILABLE"
  | "PROMO_CODE_REQUIRED"
  | "PROMO_NOT_FOUND"
  | "PROMO_EXPIRED"
  | "PROMO_EXHAUSTED"
  | "PROMO_WRONG_SYSTEM"
  | "PROMO_ALREADY_REDEEMED"
  | "PROMO_UNAVAILABLE";

/** Redeems a temporary free-access code for one report system. Never grants access itself:
 * the server (promo-code Edge Function) is the sole authority, exactly like a Stripe purchase. */
export async function redeemPromoCode(code: string, system: ReportSystemId): Promise<ReportAccessLevel> {
  if (!hasPurchaseConsent()) throw new Error("CONSENT_REQUIRED" satisfies PromoRedeemError);
  const accessKey = reportAccessKey();
  if (!accessKey) throw new Error("ACCESS_KEY_UNAVAILABLE" satisfies PromoRedeemError);
  const trimmed = code.trim();
  if (!trimmed) throw new Error("PROMO_CODE_REQUIRED" satisfies PromoRedeemError);
  const response = await fetch(PROMO_ENDPOINT, {
    method: "POST",
    headers: apiHeaders(),
    cache: "no-store",
    body: JSON.stringify({ code: trimmed, system, access_key: accessKey }),
  });
  const payload = await response.json().catch(() => ({})) as Verification;
  if (!response.ok || !payload.paid) {
    const raw = typeof payload.error === "string" ? payload.error : payload.error?.code;
    const known: PromoRedeemError[] = ["PROMO_NOT_FOUND", "PROMO_EXPIRED", "PROMO_EXHAUSTED", "PROMO_WRONG_SYSTEM", "PROMO_ALREADY_REDEEMED"];
    throw new Error((known as string[]).includes(raw || "") ? raw! : "PROMO_UNAVAILABLE" satisfies PromoRedeemError);
  }
  trackConversion("zhaowu_promo_redeemed", { system, level: "system" });
  return levelFor(payload, system);
}

function levelFor(verification: Verification, system: ReportSystemId): ReportAccessLevel {
  if (!verification.paid || !verification.product) return "none";
  if (verification.system !== system) return "none";
  return verification.product;
}

const rank: Record<ReportAccessLevel, number> = { none: 0, quick: 1, system: 2 };

export async function resolveReportAccess(system: ReportSystemId) {
  // Only a server-verified HttpOnly owner session grants the complimentary tier.
  // Never persist owner access in localStorage or infer it from a query parameter.
  if (await readOwnerSession()) return { level: "system" as ReportAccessLevel, pending: false, owner: true };
  const accessKey = reportAccessKey();
  // "quick" is a standing new-user welcome gift, not a purchase: everyone
  // starts at this level rather than "none", regardless of whether an
  // access key could be minted or any session verifies. Paid "system" access
  // is earned strictly through verified Stripe sessions
  // below and only ever raises this free floor, never lowers it.
  if (!accessKey) return { level: "quick" as ReportAccessLevel, pending: false, owner: false };
  const query = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("session_id") || "";
  if (query) rememberSession(query);
  let level: ReportAccessLevel = "quick";
  let pending = false;
  let stripeGranted = false;
  for (const sessionId of [...new Set([query, ...storedSessions()].filter(Boolean))]) {
    try {
      // The checkout session ID is the high-entropy return capability. Verification
      // must also work when Stripe opens the success URL in a different browser whose
      // localStorage cannot contain the original client reference key.
      const verification = await verifySession(sessionId);
      pending ||= verification.pending === true;
      const candidate = levelFor(verification, system);
      if (candidate === "system") stripeGranted = true;
      if (rank[candidate] > rank[level]) level = candidate;
    } catch {
      /* One expired or invalid session must not block other valid purchases. */
    }
  }
  {
    try {
      // Server-authoritative, same as a Stripe session: the access key alone never grants
      // access locally. A promo redemption only ever raises the floor, never lowers it.
      const promoVerification = await verifyPromo(accessKey, system);
      const promoLevel = levelFor(promoVerification, system);
      if (rank[promoLevel] > rank[level]) level = promoLevel;
    } catch {
      /* Promo lookup failing must not block an otherwise-valid Stripe entitlement. */
    }
  }
  // Funnel: count only Stripe-verified purchases (a promo redemption also yields "system"
  // but is reported separately as zhaowu_promo_redeemed).
  if (stripeGranted && oncePerSession(`confirmed:${system}`)) {
    trackConversion("zhaowu_purchase_confirmed", { system });
  }
  return { level, pending, owner: false };
}

export async function startReportCheckout(product: ReportAccessProduct, system: ReportSystemId, reportId?: string) {
  // Every purchase entry point must collect the Terms/Privacy consent first (PurchaseConsent).
  if (!hasPurchaseConsent()) throw new Error("CONSENT_REQUIRED");
  const accessKey = reportAccessKey();
  if (!accessKey) throw new Error("ACCESS_KEY_UNAVAILABLE");
  if (product !== "system") throw new Error("PAYMENT_LINK_MISSING");
  const link = PAYMENT_LINKS[system];
  if (!link) throw new Error("PAYMENT_LINK_MISSING");
  // Preserve the already-saved BaZi result across the Stripe round trip.
  // A session ID/URL/localStorage marker is NOT an entitlement: the server
  // still verifies the paid Stripe session before showing gated content.
  if (system === "bazi" && product === "system" && /^[0-9a-f-]{36}$/i.test(reportId || "")) {
    try { localStorage.setItem("zhaowu.pending-bazi-report.v1", reportId!); } catch { /* Recovery remains available in My reports. */ }
  }
  if (system === "bazi" && product === "system") {
    try { localStorage.setItem(BAZI_RETURN_STORAGE, "bazi"); } catch { /* The success query still opens the birth flow. */ }
  }
  const url = new URL(link);
  url.searchParams.set("client_reference_id", accessKey);
  trackConversion("zhaowu_checkout_clicked", {
    system,
    product,
    currency: detectReportPriceCurrency(),
    has_report_id: Boolean(reportId),
  });
  window.location.assign(url.toString());
}
