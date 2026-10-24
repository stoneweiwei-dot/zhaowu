/**
 * conversion-telemetry.ts — Issue #1 §6「推廣前的工程前置」转化漏斗埋点
 *
 * 漏斗事件序列（在 PostHog 里按此建 funnel）：
 *   zhaowu_birth_submitted → zhaowu_answer_shown → zhaowu_paywall_viewed
 *   → zhaowu_checkout_clicked → zhaowu_purchase_confirmed
 *   （旁路：zhaowu_promo_redeemed）
 *
 * 设计与 answer-quality-telemetry 保持同一契约：
 *   - 同一 PostHog project / host、同一 session id（复用 zhaowu:qa-session-id），
 *     漏斗事件与既有 QA 事件天然落在同一 $session_id，可直接串接分析。
 *   - fail-silent：任何遥测异常都不得影响排盘、付费与阅读主流程。
 *   - 只在白名单 host 上报；不落 person profile，不带地理位置处理。
 */

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

const POSTHOG_KEY = String(env.VITE_POSTHOG_KEY || "phc_w6rhtrMQLLBczV4uNvsDWGb4zq2GCknyeqa2YWScrs3G").trim();
const POSTHOG_HOST = String(env.VITE_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");
const ALLOWED_HOSTS = new Set(
  String(
    env.VITE_POSTHOG_ALLOWED_HOSTS ||
      "archive-stone-zhaowu-official.netlify.app,stone-zhaowu-official.vercel.app,zhao-wu.com",
  )
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
);

// 与 answer-quality-telemetry 共用同一个会话键，保证漏斗事件和 QA 事件同 session。
const SESSION_KEY = "zhaowu:qa-session-id";

function browserReady() {
  return typeof window !== "undefined" && typeof window.fetch === "function";
}

function telemetryAllowed() {
  if (!browserReady()) return false;
  return ALLOWED_HOSTS.has(window.location.host.toLowerCase());
}

function sessionId() {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = `qa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return `qa-${Date.now().toString(36)}`;
  }
}

export type ConversionEvent =
  | "zhaowu_birth_submitted"
  | "zhaowu_answer_shown"
  | "zhaowu_paywall_viewed"
  | "zhaowu_checkout_clicked"
  | "zhaowu_purchase_confirmed"
  | "zhaowu_promo_redeemed";

/** 上报一个漏斗事件。fire-and-forget，永不抛错、永不 await。 */
export function trackConversion(event: ConversionEvent, properties: Record<string, unknown> = {}) {
  if (!telemetryAllowed() || !POSTHOG_KEY) return;
  const sid = sessionId();
  const payload = {
    api_key: POSTHOG_KEY,
    event,
    properties: {
      distinct_id: `zhaowu:${sid}`,
      $session_id: sid,
      $process_person_profile: false,
      $geoip_disable: true,
      // Never send the query string or hash: the Stripe return URL carries
      // `session_id=cs_live_…`, which the app treats as a purchase capability.
      $current_url: `${window.location.origin}${window.location.pathname}`,
      $host: window.location.host,
      app: "zhaowu",
      funnel_contract: "STONE-F1",
      ...properties,
    },
    timestamp: new Date().toISOString(),
  };
  void fetch(`${POSTHOG_HOST}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
    mode: "cors",
    credentials: "omit",
  }).catch(() => undefined);
}

/** sessionStorage 去重：同一会话内同名 key 只放行一次（用于 purchase_confirmed / paywall_viewed 这类会被重复查询触发的点）。 */
export function oncePerSession(key: string): boolean {
  const storageKey = `zhaowu.cv.once.${key}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return false;
    window.sessionStorage.setItem(storageKey, "1");
    return true;
  } catch {
    return true;
  }
}
