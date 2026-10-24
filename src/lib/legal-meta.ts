// Version date of the legal documents. Kept apart from legal-content.ts (~47 kB of legal copy) so
// small modules such as the purchase-consent record can read it without pulling the full text into
// the first-screen bundle. legal-content.ts re-exports it, so existing imports keep working.
export const LEGAL_LAST_UPDATED = "2026-10-11";
