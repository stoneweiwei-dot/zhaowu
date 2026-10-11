// Pre-payment consent record. Consent is tied to the version (last-updated date) of the legal
// documents so a material change to /terms or /privacy asks buyers again. The record lives in
// the browser only; the strongest evidence is Stripe's own terms-of-service consent on the
// Payment Link (see docs/LEGAL-COMPLIANCE.md §8).
import { LEGAL_LAST_UPDATED } from "@/lib/legal-content";

const CONSENT_STORAGE = "zhaowu.purchase-consent.v1";

export const PURCHASE_CONSENT_VERSION = LEGAL_LAST_UPDATED;

// Private-mode browsers can block localStorage; keep the answer for this page load as well.
let memoryVersion = "";

export function recordPurchaseConsent() {
  memoryVersion = PURCHASE_CONSENT_VERSION;
  try {
    localStorage.setItem(CONSENT_STORAGE, JSON.stringify({ version: PURCHASE_CONSENT_VERSION, at: new Date().toISOString() }));
  } catch { /* in-memory record still covers this visit */ }
}

export function clearPurchaseConsent() {
  memoryVersion = "";
  try { localStorage.removeItem(CONSENT_STORAGE); } catch { /* nothing to clear */ }
}

export function hasPurchaseConsent() {
  if (memoryVersion === PURCHASE_CONSENT_VERSION) return true;
  try {
    const stored = JSON.parse(localStorage.getItem(CONSENT_STORAGE) || "null") as { version?: string } | null;
    return stored?.version === PURCHASE_CONSENT_VERSION;
  } catch {
    return false;
  }
}
