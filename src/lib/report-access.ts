import { readOwnerSession } from "@/lib/auth/owner-api";
import { hasPurchaseConsent } from "@/lib/purchase-consent";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export type ReportSystemId = "bazi" | "ziwei" | "qizheng" | "western" | "indian" | "palm" | "numerology";
export type ReportAccessProduct = "quick" | "system" | "bundle";
export type ReportAccessLevel = "none" | "quick" | "system" | "bundle";

// The "quick" tier is no longer sold: every visitor gets it for free by
// default (see resolveReportAccess below) as a new-user welcome gift, so it
// carries no price and no longer renders as a purchasable card in
// ReportAccessGate. `system`/`bundle` are the only two tiers still sold.
//
// Live Stripe Payment Links charge USD 9.90 per system and USD 19.99
// for the six specialist systems bundle. BaZi is a separate USD 9.90 purchase.
// Keep displayed currency explicit; labels and Stripe amounts must stay aligned.
export const REPORT_ACCESS_PRODUCTS = {
  quick: { amountCents: 0, price: "$0" },
  system: { amountCents: 990, price: "US$9.90" },
  bundle: { amountCents: 1999, price: "US$19.99" },
} as const;

const ACCESS_KEY_STORAGE = "zhaowu.report-access-key.v1";
const SESSION_STORAGE = "zhaowu.report-access-sessions.v1";
const ACCESS_ENDPOINT = `${SUPABASE_URL}/functions/v1/stripe-checkout`;

const PAYMENT_LINKS: Record<ReportSystemId, Record<ReportAccessProduct, string>> = {
  bazi: {
    quick: "", // Always free: never sell the quick tier.
    system: "https://buy.stripe.com/eVq5kD2Czbvrb4n7dg2sM0y",
    bundle: "", // Six-system bundle is NOT a BaZi purchase.
  },
  ziwei: {
    quick: "",
    system: "https://buy.stripe.com/7sY8wPdhdeHDb4n7dg2sM0m",
    bundle: "https://buy.stripe.com/eVq3cv1yvfLHc8reFI2sM0n",
  },
  qizheng: {
    quick: "",
    system: "https://buy.stripe.com/14A6oH7WTdDz4FZ7dg2sM0o",
    bundle: "https://buy.stripe.com/6oU7sL0ur7fb4FZ69c2sM0p",
  },
  western: {
    quick: "",
    system: "https://buy.stripe.com/00w3cvb95gPL6O70OS2sM0q",
    bundle: "https://buy.stripe.com/8x24gz5OL6b76O77dg2sM0r",
  },
  indian: {
    quick: "",
    system: "https://buy.stripe.com/7sY14ncd9arn1tNgNQ2sM0s",
    bundle: "https://buy.stripe.com/aFaaEX0urarnegzeFI2sM0t",
  },
  palm: {
    quick: "",
    system: "https://buy.stripe.com/bJeaEXdhdarn5K3eFI2sM0u",
    bundle: "https://buy.stripe.com/3cI6oH90Xbvr5K3gNQ2sM0v",
  },
  numerology: {
    quick: "",
    system: "https://buy.stripe.com/dRm00jgtpgPL1tN2X02sM0w",
    bundle: "https://buy.stripe.com/eVq7sL6SP0QNa0jdBE2sM0x",
  },
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

async function verifySession(sessionId: string, accessKey: string): Promise<Verification> {
  const url = new URL(ACCESS_ENDPOINT);
  url.searchParams.set("session_id", sessionId);
  url.searchParams.set("access_key", accessKey);
  const response = await fetch(url, { headers: apiHeaders(), cache: "no-store" });
  return payloadOf(response);
}

function levelFor(verification: Verification, system: ReportSystemId): ReportAccessLevel {
  if (!verification.paid || !verification.product) return "none";
  if (verification.product === "bundle") return system === "bazi" ? "none" : "bundle";
  if (verification.system !== system) return "none";
  return verification.product;
}

const rank: Record<ReportAccessLevel, number> = { none: 0, quick: 1, system: 2, bundle: 3 };

export async function resolveReportAccess(system: ReportSystemId) {
  // Only a server-verified HttpOnly owner session grants the complimentary tier.
  // Never persist owner access in localStorage or infer it from a query parameter.
  if (await readOwnerSession()) return { level: "bundle" as ReportAccessLevel, pending: false, owner: true };
  const accessKey = reportAccessKey();
  // "quick" is a standing new-user welcome gift, not a purchase: everyone
  // starts at this level rather than "none", regardless of whether an
  // access key could be minted or any session verifies. Paid "system"/
  // "bundle" levels are still earned strictly through verified Stripe
  // sessions below and only ever raise this floor, never lower it.
  if (!accessKey) return { level: "quick" as ReportAccessLevel, pending: false, owner: false };
  const query = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("session_id") || "";
  if (query) rememberSession(query);
  let level: ReportAccessLevel = "quick";
  let pending = false;
  for (const sessionId of [...new Set([query, ...storedSessions()].filter(Boolean))]) {
    try {
      const verification = await verifySession(sessionId, accessKey);
      pending ||= verification.pending === true;
      const candidate = levelFor(verification, system);
      if (rank[candidate] > rank[level]) level = candidate;
      if (level === "bundle") break;
    } catch {
      /* One expired or invalid session must not block other valid purchases. */
    }
  }
  return { level, pending, owner: false };
}

export async function startReportCheckout(product: ReportAccessProduct, system: ReportSystemId, reportId?: string) {
  // Every purchase entry point must collect the Terms/Privacy consent first (PurchaseConsent).
  if (!hasPurchaseConsent()) throw new Error("CONSENT_REQUIRED");
  const accessKey = reportAccessKey();
  if (!accessKey) throw new Error("ACCESS_KEY_UNAVAILABLE");
  const link = PAYMENT_LINKS[system]?.[product];
  if (!link) throw new Error("PAYMENT_LINK_MISSING");
  // Preserve the already-saved BaZi result across the Stripe round trip.
  // A session ID/URL/localStorage marker is NOT an entitlement: the server
  // still verifies the paid Stripe session before showing gated content.
  if (system === "bazi" && product === "system" && /^[0-9a-f-]{36}$/i.test(reportId || "")) {
    try { localStorage.setItem("zhaowu.pending-bazi-report.v1", reportId!); } catch { /* Recovery remains available in My reports. */ }
  }
  const url = new URL(link);
  url.searchParams.set("client_reference_id", accessKey);
  window.location.assign(url.toString());
}
