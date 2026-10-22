import { timingSafeEqual } from "node:crypto";

/**
 * Daily availability check for /release.json — the file every installed PWA reads to learn that a
 * newer release exists. Invoked by the Vercel cron in vercel.json (GET, `Authorization: Bearer
 * $CRON_SECRET`, fail closed when the secret is unset or short — same contract as the autopublish cron).
 *
 * Outcome:
 *   200 { ok: true }                 reachable, valid JSON, within the latency budget
 *   200 { ok: true, warn: [...] }    reachable but slow, or serving a different release than this deployment
 *   503 { ok: false, ... }           timeout / non-200 / invalid JSON after one retry
 * A 503 shows the cron run as failed in the Vercel dashboard and logs a structured `[release-watch] ALERT`
 * line. If the owner sets RELEASE_WATCH_WEBHOOK_URL (any incoming-webhook URL), the alert is also POSTed there.
 * No SaaS dependency is added: the webhook is optional and off by default.
 */

export const RELEASE_WATCH_TIMEOUT_MS = 5000;
export const RELEASE_WATCH_SLOW_MS = 2500;
const RETRY_DELAY_MS = 1500;
const DEFAULT_ORIGIN = "https://zhao-wu.com";

function header(req, name) {
  const value = req?.headers?.[name];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return String(value[0] ?? "");
  if (req?.headers && typeof req.headers.get === "function") return String(req.headers.get(name) ?? "");
  return "";
}

export function requestIsAuthorizedCron(req, env = process.env) {
  const expected = String(env.CRON_SECRET || "").trim();
  if (expected.length < 16) return false;
  const raw = header(req, "authorization").trim();
  const actual = raw.toLowerCase().startsWith("bearer ") ? raw.slice(7).trim() : "";
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function validOrigin(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.origin : DEFAULT_ORIGIN;
  } catch {
    return DEFAULT_ORIGIN;
  }
}

/** One probe of release.json. Never throws; always resolves to a result object. */
export async function probeReleaseJson({ origin = DEFAULT_ORIGIN, fetchImpl = fetch, timeoutMs = RELEASE_WATCH_TIMEOUT_MS, now = () => Date.now() } = {}) {
  const started = now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${origin}/release.json?watch=${started}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: { "Cache-Control": "no-cache" },
    });
    const latencyMs = now() - started;
    if (!response.ok) return { ok: false, reason: `HTTP_${response.status}`, latencyMs };
    let payload;
    try {
      payload = await response.json();
    } catch {
      return { ok: false, reason: "INVALID_JSON", latencyMs };
    }
    const release = typeof payload?.release === "string" ? payload.release.trim() : "";
    const builtAt = typeof payload?.builtAt === "string" ? payload.builtAt : "";
    if (!release || Number.isNaN(Date.parse(builtAt))) return { ok: false, reason: "INVALID_SHAPE", latencyMs };
    return { ok: true, release, builtAt, latencyMs };
  } catch (error) {
    const latencyMs = now() - started;
    return { ok: false, reason: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR", latencyMs };
  } finally {
    clearTimeout(timer);
  }
}

async function sendWebhook(url, body, fetchImpl) {
  if (!url) return false;
  try {
    const target = new URL(url);
    if (target.protocol !== "https:") return false;
    const response = await fetchImpl(target.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `[ZHAOWU release-watch] ${body.reason} — ${body.origin}/release.json (${body.latencyMs}ms)`, ...body }),
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function runReleaseWatch({ env = process.env, fetchImpl = fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), now = () => Date.now() } = {}) {
  const origin = validOrigin(env.RELEASE_WATCH_ORIGIN || DEFAULT_ORIGIN);
  let result = await probeReleaseJson({ origin, fetchImpl, now });
  let attempts = 1;
  if (!result.ok) {
    await sleep(RETRY_DELAY_MS);
    result = await probeReleaseJson({ origin, fetchImpl, now });
    attempts = 2;
  }
  if (!result.ok) {
    const alert = { ok: false, origin, reason: result.reason, latencyMs: result.latencyMs, attempts, checkedAt: new Date(now()).toISOString() };
    console.error("[release-watch] ALERT", JSON.stringify(alert));
    const webhookSent = await sendWebhook(String(env.RELEASE_WATCH_WEBHOOK_URL || "").trim(), alert, fetchImpl);
    return { status: 503, body: { ...alert, webhookSent } };
  }
  const warn = [];
  if (result.latencyMs > RELEASE_WATCH_SLOW_MS) warn.push(`SLOW_${result.latencyMs}ms`);
  const deployed = String(env.VERCEL_GIT_COMMIT_SHA || "").trim();
  if (deployed && deployed !== result.release) warn.push("RELEASE_MISMATCH");
  const body = { ok: true, origin, release: result.release, builtAt: result.builtAt, latencyMs: result.latencyMs, attempts, ...(warn.length ? { warn } : {}) };
  if (warn.length) console.warn("[release-watch] WARN", JSON.stringify(body));
  return { status: 200, body };
}

export default async function handler(req, res) {
  const send = (status, body) => {
    const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
    if (res && typeof res.status === "function" && typeof res.setHeader === "function") {
      for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
      return res.status(status).json(body);
    }
    return new Response(JSON.stringify(body), { status, headers });
  };
  if ((req?.method || "GET") !== "GET") return send(405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  if (!requestIsAuthorizedCron(req)) return send(401, { ok: false, error: "CRON_UNAUTHORIZED" });
  const { status, body } = await runReleaseWatch();
  return send(status, body);
}
