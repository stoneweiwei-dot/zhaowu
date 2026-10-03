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
const CHECKOUT_ENDPOINT = `${SUPABASE_URL}/functions/v1/stripe-checkout`;

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

async function payloadOf(response: Response): Promise<Verification & { url?: string }> {
  const payload = await response.json().catch(() => ({})) as Verification & { url?: string };
  if (!response.ok) {
    const raw = typeof payload.error === "string" ? payload.error : payload.error?.code;
    throw new Error(raw || `HTTP_${response.status}`);
  }
  return payload;
}

async function verifySession(sessionId: string, accessKey: string): Promise<Verification> {
  const url = new URL(CHECKOUT_ENDPOINT);
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
  const returnPath = typeof window === "undefined" ? "/" : `${window.location.pathname}${window.location.hash}`;
  const response = await fetch(CHECKOUT_ENDPOINT, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({ product, system, accessKey, returnPath }),
  });
  const payload = await payloadOf(response);
  if (!payload.url || !payload.url.startsWith("https://checkout.stripe.com/")) throw new Error("CHECKOUT_URL_MISSING");
  window.location.assign(payload.url);
}
