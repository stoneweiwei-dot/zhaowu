/**
 * Shared PostHog property guard for every capture site.
 *
 * Question text is never a property. Page URLs are pathname only.
 * Referrers keep origin + path, with the query string and hash removed.
 */

const QUESTION_TEXT_KEYS = new Set([
  "question",
  "question_text",
  "question_redacted",
  "original_question",
  "original_question_redacted",
  "incorrect_answer",
  "incorrect_answer_redacted",
  "answer_text",
  "answer_redacted",
  "redacted_question",
]);

const REFERRER_KEYS = new Set([
  "$referrer",
  "referrer",
  "$referring_url",
  "referring_url",
]);

const PAGE_URL_KEYS = new Set([
  "$current_url",
  "current_url",
  "url",
  "href",
  "page_url",
  "pageurl",
  "$pathname",
  "pathname",
]);

const LENGTH_BUCKETS = ["0", "1-40", "41-120", "121-400", "401+"] as const;
export type QuestionLengthBucket = (typeof LENGTH_BUCKETS)[number];

export function analyticsPathname(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "/";
  try {
    const url = trimmed.startsWith("//")
      ? new URL(`https:${trimmed}`)
      : new URL(trimmed, "https://zhao-wu.invalid");
    const path = url.pathname || "/";
    return path.startsWith("/") ? path : `/${path}`;
  } catch {
    const bare = trimmed.split("#")[0]?.split("?")[0] ?? "";
    return bare.startsWith("/") ? bare || "/" : "/";
  }
}

/** Drop search and hash. Absolute URLs keep origin; relative URLs become a path. */
export function stripQueryAndHash(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.startsWith("//")) {
      const url = new URL(`https:${trimmed}`);
      return `//${url.host}${url.pathname}`;
    }
    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
    const url = new URL(trimmed, "https://zhao-wu.invalid");
    if (!hasScheme) return url.pathname || "/";
    return `${url.origin}${url.pathname}`;
  } catch {
    return trimmed.split("#")[0]?.split("?")[0] ?? "";
  }
}

export function questionLengthBucket(length: number): QuestionLengthBucket {
  if (!Number.isFinite(length) || length <= 0) return "0";
  if (length <= 40) return "1-40";
  if (length <= 120) return "41-120";
  if (length <= 400) return "121-400";
  return "401+";
}

const MACHINE_CODE = /^[A-Z][A-Z0-9_]{2,48}$/;
const ERROR_NAME = /^[A-Za-z][A-Za-z0-9_]{0,48}$/;

/** Coarse error class. Never returns error.message unless it is already a machine code. */
export function coarseErrorType(error: unknown): string {
  if (error instanceof Error) {
    if (error.name && error.name !== "Error" && ERROR_NAME.test(error.name)) return error.name;
    if (MACHINE_CODE.test(error.message)) return error.message;
    return "Error";
  }
  if (typeof error === "string" && MACHINE_CODE.test(error)) return error;
  return "unknown";
}

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
    || /^\/\//.test(value)
    || /^\/\?/.test(value)
    || /^\/[^?\s]*[?#]/.test(value);
}

function sanitizeProperty(key: string, value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (REFERRER_KEYS.has(key)) return stripQueryAndHash(value);
  if (PAGE_URL_KEYS.has(key) || looksLikeUrl(value)) return analyticsPathname(value);
  return value;
}

/**
 * Force `$current_url` to the page pathname and strip query/hash from every
 * other URL-like property. Question-text keys are dropped, not scrubbed.
 */
export function sanitizePosthogProperties(
  properties: Record<string, unknown>,
  pageHref: string,
): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (key === "$current_url" || QUESTION_TEXT_KEYS.has(key)) continue;
    next[key] = sanitizeProperty(key, value);
  }
  next.$current_url = analyticsPathname(pageHref);
  return next;
}
