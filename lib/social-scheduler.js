import { publishSocialPost, socialConfiguration } from "./meta-social-publisher.js";
import { bankPostText, pickBankEntry } from "./social-content-bank.js";
import { socialQueueRequest } from "./social-queue-client.js";
import { decryptThreadsAccessToken } from "./threads-oauth.js";

/** Channels the site can publish to by itself. Everything else becomes a copy-ready manual task. */
export const AUTO_CHANNELS = ["threads", "instagram"];
export const MANUAL_CHANNELS = ["xiaohongshu", "facebook", "x"];
const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Calendar date and weekday (0 = Sunday) in Asia/Taipei, the schedule's reference clock. */
export function taipeiClock(now = new Date()) {
  const shifted = new Date(now.getTime() + TAIPEI_OFFSET_MS);
  return { date: shifted.toISOString().slice(0, 10), weekday: shifted.getUTCDay() };
}

export function isPublishDay(publishDays, now = new Date()) {
  return Array.isArray(publishDays) && publishDays.map(Number).includes(taipeiClock(now).weekday);
}

function usableThreadsAccounts(rows, now) {
  return rows
    .filter((row) => !row.token_expires_at || new Date(row.token_expires_at).getTime() > now.getTime())
    .map((row) => ({
      id: String(row.id),
      userId: String(row.threads_user_id),
      username: String(row.username),
      accessToken: decryptThreadsAccessToken(row.access_token_ciphertext),
    }));
}

function summarize(results, publishable, manualChannels) {
  const autoEntries = Object.entries(results).filter(([channel]) => publishable.includes(channel));
  const okCount = autoEntries.filter(([, result]) => result?.ok).length;
  if (!autoEntries.length) return { status: manualChannels.length ? "manual" : "failed", error: manualChannels.length ? "" : "NO_CHANNEL" };
  if (okCount === autoEntries.length) return { status: "published", error: "" };
  if (okCount > 0) return { status: "partial", error: "PARTIAL_PUBLISH" };
  const first = autoEntries.map(([, result]) => result?.message || result?.code).find(Boolean);
  return { status: "failed", error: String(first || "PUBLISH_FAILED") };
}

async function noteStatus(env, fetchImpl, message) {
  try { await socialQueueRequest("settings.set", { pausedReason: message }, env, fetchImpl); } catch { /* status note is best-effort */ }
}

/**
 * One scheduler tick. Idempotent per Taipei calendar day (database unique index), so a retried or
 * duplicated cron call can never double-post. Nothing is consumed unless there is something to publish to.
 *
 *   force=false  daily cron: obeys enabled flag + weekday schedule, claims the day's slot.
 *   force=true   owner "publish now": ignores schedule, does not use the daily slot.
 */
export async function runAutopublish({ env = process.env, fetchImpl = fetch, now = new Date(), force = false, queueId = "" } = {}) {
  const { settings } = await socialQueueRequest("settings.get", {}, env, fetchImpl);
  if (!force) {
    if (!settings?.enabled) return { ran: false, reason: "DISABLED" };
    if (!isPublishDay(settings.publish_days, now)) return { ran: false, reason: "NOT_PUBLISH_DAY" };
  }
  const clock = taipeiClock(now);
  const slotDate = force ? null : clock.date;

  // 1) Decide what to publish (owner-written queue first, then the vetted bank).
  let target = null;
  if (queueId) {
    const { items } = await socialQueueRequest("queue.list", { limit: 100 }, env, fetchImpl);
    target = (items || []).find((item) => item.id === queueId) || null;
    if (!target) return { ran: false, reason: "NOT_FOUND" };
  } else {
    const { item } = await socialQueueRequest("queue.nextOwner", {}, env, fetchImpl);
    target = item || null;
  }
  let draft;
  if (target) {
    draft = { source: "owner", queueId: target.id, body: target.body, imageUrl: target.image_url || "", altText: target.alt_text || "", channels: target.channels };
  } else {
    const { keys } = await socialQueueRequest("queue.recentBankKeys", {}, env, fetchImpl);
    const entry = pickBankEntry(keys || []);
    if (!entry) return { ran: false, reason: "EMPTY_BANK" };
    draft = { source: "bank", bankKey: entry.key, body: bankPostText(entry), imageUrl: "", altText: "", channels: settings?.channels?.length ? settings.channels : ["threads"] };
  }
  const autoChannels = draft.channels.filter((channel) => AUTO_CHANNELS.includes(channel));
  const manualChannels = draft.channels.filter((channel) => MANUAL_CHANNELS.includes(channel));

  // 2) Resolve credentials BEFORE claiming, so an unconnected account never burns the slot or a bank post.
  let threadAccounts = [];
  if (autoChannels.includes("threads")) {
    const { items } = await socialQueueRequest("accounts.list", {}, env, fetchImpl);
    threadAccounts = usableThreadsAccounts(items || [], now);
  }
  const base = socialConfiguration(env);
  const connected = {
    threads: threadAccounts.length > 0 || base.threads,
    instagram: base.instagram && Boolean(draft.imageUrl),
  };
  const publishable = autoChannels.filter((channel) => connected[channel]);
  // Instagram that cannot be published by the site (no credentials, or no image) becomes a copy-ready manual task
  // instead of silently failing, so the post is never lost.
  if (autoChannels.includes("instagram") && !connected.instagram) manualChannels.push("instagram");
  if (!publishable.length && !manualChannels.length) {
    if (!force) await noteStatus(env, fetchImpl, "尚未連接可發布的平台：請到後台連接 Threads。");
    return { ran: false, reason: "NOTHING_CONNECTED" };
  }

  // 3) Claim (atomic) → publish → record.
  const claim = await socialQueueRequest("run.claim", { ...draft, slotDate }, env, fetchImpl);
  if (!claim.claimed) return { ran: false, reason: claim.reason || "NOT_CLAIMED" };
  const row = claim.item;

  const results = {};
  try {
    if (publishable.length) {
      const published = await publishSocialPost(
        { text: draft.body, imageUrl: draft.imageUrl, altText: draft.altText, channels: publishable },
        env, fetchImpl, threadAccounts,
      );
      Object.assign(results, published);
    }
  } catch (error) {
    for (const channel of publishable) results[channel] = { ok: false, code: error?.code || "PUBLISH_FAILED", message: String(error?.message || "").slice(0, 300) };
  }
  for (const channel of autoChannels) {
    if (!publishable.includes(channel) && !manualChannels.includes(channel)) results[channel] = { ok: false, code: "NOT_CONNECTED", message: channel === "instagram" ? "Instagram 需要已連接帳號與一張公開圖片。" : "尚未連接。" };
  }
  for (const channel of manualChannels) results[channel] = { ok: null, manual: true };

  const outcome = summarize(results, publishable, manualChannels);
  const finished = await socialQueueRequest("run.finish", { id: row.id, status: outcome.status, results, lastError: outcome.error }, env, fetchImpl);
  if (!force) await noteStatus(env, fetchImpl, outcome.status === "failed" ? `上次自動發佈失敗：${outcome.error}` : "");
  return { ran: true, status: outcome.status, item: finished.item, results };
}
