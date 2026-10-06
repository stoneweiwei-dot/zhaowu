import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

export type ReportSystemId = "ziwei" | "qizheng" | "western" | "indian" | "palm" | "numerology";
export type ReportAccessProduct = "quick" | "system" | "bundle";
export type ReportAccessLevel = "none" | "quick" | "system" | "bundle";

export const REPORT_ACCESS_PRODUCTS = {
  quick: { amountCents: 199, price: "$1.99" },
  system: { amountCents: 499, price: "$4.99" },
  bundle: { amountCents: 999, price: "$9.99" },
} as const;

const ACCESS_KEY_STORAGE = "zhaowu.report-access-key.v1";
const SESSION_STORAGE = "zhaowu.report-access-sessions.v1";
const ACCESS_ENDPOINT = `${SUPABASE_URL}/functions/v1/stripe-checkout`;

const PAYMENT_LINKS: Record<ReportSystemId, Record<ReportAccessProduct, string>> = {
  ziwei: {
    quick: "https://buy.stripe.com/8x2bJ16SPgPL1tN8hk2sM03",
    system: "https://buy.stripe.com/14A5kDelh42ZgoH69c2sM04",
    bundle: "https://buy.stripe.com/8x27sLgtp9njb4naps2sM05",
  },
  qizheng: {
    quick: "https://buy.stripe.com/aFa6oHb959nj0pJ7dg2sM06",
    system: "https://buy.stripe.com/7sY28r5OL573egzbtw2sM07",
    bundle: "https://buy.stripe.com/eVq9AT7WTdDz8Wfaps2sM08",
  },
  western: {
    quick: "https://buy.stripe.com/14AbJ190X7fb1tN69c2sM09",
    system: "https://buy.stripe.com/dRmaEX1yv42Z5K37dg2sM0a",
    bundle: "https://buy.stripe.com/9B68wPb95eHDegz2X02sM0b",
  },
  indian: {
    quick: "https://buy.stripe.com/14A7sL4KH7fb1tNeFI2sM0c",
    system: "https://buy.stripe.com/7sY4gzelharn0pJcxA2sM0d",
    bundle: "https://buy.stripe.com/dRm28r4KH9nj6O7fJM2sM0e",
  },
  palm: {
    quick: "https://buy.stripe.com/28E5kD3GDdDz8Wf69c2sM0f",
    system: "https://buy.stripe.com/3cI8wPcd9arn4FZeFI2sM0g",
    bundle: "https://buy.stripe.com/eVqdR93GD6b7a0japs2sM0h",
  },
  numerology: {
    quick: "https://buy.stripe.com/28E5kDfpl1UR2xR2X02sM0i",
    system: "https://buy.stripe.com/3cI4gz3GD9nj0pJdBE2sM0j",
    bundle: "https://buy.stripe.com/14AeVdfplfLHgoH0OS2sM0k",
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
  if (verification.product === "bundle") return "bundle";
  if (verification.system !== system) return "none";
  return verification.product;
}

const rank: Record<ReportAccessLevel, number> = { none: 0, quick: 1, system: 2, bundle: 3 };

export async function resolveReportAccess(system: ReportSystemId) {
  const accessKey = reportAccessKey();
  if (!accessKey) return { level: "none" as ReportAccessLevel, pending: false };
  const query = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("session_id") || "";
  if (query) rememberSession(query);
  let level: ReportAccessLevel = "none";
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
  return { level, pending };
}

export async function startReportCheckout(product: ReportAccessProduct, system: ReportSystemId) {
  const accessKey = reportAccessKey();
  if (!accessKey) throw new Error("ACCESS_KEY_UNAVAILABLE");
  const link = PAYMENT_LINKS[system]?.[product];
  if (!link) throw new Error("PAYMENT_LINK_MISSING");
  const url = new URL(link);
  url.searchParams.set("client_reference_id", accessKey);
  window.location.assign(url.toString());
}
