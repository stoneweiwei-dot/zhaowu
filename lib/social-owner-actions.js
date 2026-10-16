import { socialConfiguration } from "./meta-social-publisher.js";
import { SOCIAL_CONTENT_BANK, bankPostText, pickBankEntry } from "./social-content-bank.js";
import { isPublishDay, runAutopublish, taipeiClock } from "./social-scheduler.js";
import { socialQueueConfigured, socialQueueRequest } from "./social-queue-client.js";
import { threadsOauthConfiguration } from "./threads-oauth.js";

/** Cron fires 12:00 UTC daily (= 20:00 Asia/Taipei). The weekday filter decides whether that tick posts. */
export const CRON_HOUR_UTC = 12;

function publicAccount(row) {
  return {
    id: String(row.id),
    username: String(row.username || "").replace(/^@+/, ""),
    expiresAt: row.token_expires_at || null,
  };
}

/** Next calendar dates (Taipei) on which the schedule will post, based on the saved weekdays. */
export function upcomingPublishDates(publishDays, now = new Date(), count = 4) {
  const days = (publishDays || []).map(Number);
  const out = [];
  for (let offset = 0; out.length < count && offset < 28; offset += 1) {
    const probe = new Date(now.getTime() + offset * 86_400_000);
    const clock = taipeiClock(probe);
    const tickPassed = offset === 0 && probe.getUTCHours() >= CRON_HOUR_UTC;
    if (days.includes(clock.weekday) && !tickPassed) out.push(clock.date);
  }
  return out;
}

export async function autopublishOverview(env = process.env, fetchImpl = fetch, now = new Date()) {
  const configured = socialQueueConfigured(env);
  if (!configured) return { ok: true, configured: false };
  const [{ settings }, { items }, accounts, { keys }] = await Promise.all([
    socialQueueRequest("settings.get", {}, env, fetchImpl),
    socialQueueRequest("queue.list", { limit: 60 }, env, fetchImpl),
    socialQueueRequest("accounts.list", {}, env, fetchImpl),
    socialQueueRequest("queue.recentBankKeys", {}, env, fetchImpl),
  ]);
  const base = socialConfiguration(env);
  const next = pickBankEntry(keys || []);
  const threadsAccounts = (accounts.items || []).map(publicAccount);
  return {
    ok: true,
    configured: true,
    settings,
    items: items || [],
    channels: {
      threads: threadsAccounts.length > 0 || base.threads,
      instagram: base.instagram,
      threadsAccounts,
      targets: base.targets,
      oauth: (({ ready, redirectUri }) => ({ ready, redirectUri }))(threadsOauthConfiguration(env)),
    },
    bank: { total: SOCIAL_CONTENT_BANK.length, next: next ? { key: next.key, text: bankPostText(next) } : null },
    schedule: {
      cronHourUtc: CRON_HOUR_UTC,
      todayIsPublishDay: isPublishDay(settings?.publish_days, now),
      upcoming: upcomingPublishDates(settings?.publish_days, now),
    },
  };
}

const bad = (error) => ({ status: 400, body: { ok: false, error } });

/** Owner-session-gated actions. The caller (api/owner-session.js) has already verified the owner cookie. */
export async function handleAutopublishAction(payload, env = process.env, fetchImpl = fetch) {
  if (!socialQueueConfigured(env)) return { status: 503, body: { ok: false, error: "SOCIAL_QUEUE_NOT_CONFIGURED" } };
  const call = (action, extra = {}) => socialQueueRequest(action, extra, env, fetchImpl);
  switch (payload?.action) {
    case "autopublish.overview":
      return { status: 200, body: await autopublishOverview(env, fetchImpl) };
    case "autopublish.settings": {
      const body = await call("settings.set", {
        enabled: payload.enabled,
        publishDays: payload.publishDays,
        channels: payload.channels,
      });
      return { status: 200, body };
    }
    case "autopublish.queue.create":
      return { status: 200, body: await call("queue.create", {
        body: payload.body, imageUrl: payload.imageUrl, altText: payload.altText,
        channels: payload.channels, notBefore: payload.notBefore, status: payload.status,
      }) };
    case "autopublish.queue.update":
      return { status: 200, body: await call("queue.update", {
        id: payload.id, body: payload.body, imageUrl: payload.imageUrl, altText: payload.altText,
        channels: payload.channels, notBefore: payload.notBefore, status: payload.status,
      }) };
    case "autopublish.queue.delete":
      return { status: 200, body: await call("queue.delete", { id: payload.id }) };
    case "autopublish.markDone": {
      const id = String(payload.id || "");
      if (!/^[0-9a-f-]{36}$/i.test(id)) return bad("INVALID_ID");
      return { status: 200, body: await call("run.finish", { id, status: "published", results: { manualDone: true } }) };
    }
    case "autopublish.run": {
      const queueId = String(payload.queueId || "");
      if (queueId && !/^[0-9a-f-]{36}$/i.test(queueId)) return bad("INVALID_ID");
      const result = await runAutopublish({ env, fetchImpl, force: true, queueId });
      return { status: 200, body: { ok: true, result } };
    }
    default:
      return null;
  }
}
