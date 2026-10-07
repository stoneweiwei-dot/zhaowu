const DEFAULT_GRAPH_VERSION = "v26.0";
const DEFAULT_THREADS_VERSION = "v1.0";
const REQUEST_TIMEOUT_MS = 25_000;

export class SocialPublishError extends Error {
  constructor(code, message, status = 502) {
    super(message);
    this.name = "SocialPublishError";
    this.code = code;
    this.status = status;
  }
}

function cleanVersion(value, fallback) {
  const version = String(value || fallback).trim();
  return /^v\d+\.\d+$/.test(version) ? version : fallback;
}

function envValue(env, key) {
  return String(env?.[key] ?? "").trim();
}

function normalizeUsername(value) {
  return envValue({ value }, "value").replace(/^@+/, "").toLowerCase();
}

export function socialConfiguration(env = process.env) {
  const instagram = Boolean(envValue(env, "META_INSTAGRAM_USER_ID") && envValue(env, "META_INSTAGRAM_ACCESS_TOKEN"));
  const threads = Boolean(envValue(env, "META_THREADS_USER_ID") && envValue(env, "META_THREADS_ACCESS_TOKEN"));
  const targets = {
    instagram: normalizeUsername(envValue(env, "META_TARGET_INSTAGRAM_USERNAME")),
    threads: normalizeUsername(envValue(env, "META_TARGET_THREADS_USERNAME")),
  };
  return { instagram, threads, ready: instagram || threads, targets };
}

function publicHttpsUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  let url;
  try { url = new URL(raw); } catch { throw new SocialPublishError("INVALID_IMAGE_URL", "圖片網址格式不正確。", 400); }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new SocialPublishError("INVALID_IMAGE_URL", "圖片必須使用公開 HTTPS 網址。", 400);
  }
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host === "0.0.0.0" || host === "127.0.0.1" || host === "::1") {
    throw new SocialPublishError("INVALID_IMAGE_URL", "圖片必須位於公開伺服器。", 400);
  }
  return url.toString();
}

export function validateSocialPost(input) {
  const text = String(input?.text ?? "").trim();
  const imageUrl = publicHttpsUrl(input?.imageUrl);
  const altText = String(input?.altText ?? "").trim();
  const requested = Array.isArray(input?.channels) ? input.channels.map((value) => String(value)) : [];
  const channels = [...new Set(requested)].filter((value) => value === "instagram" || value === "threads");

  if (!channels.length) throw new SocialPublishError("CHANNEL_REQUIRED", "請至少選擇一個平台。", 400);
  if (!text && !imageUrl) throw new SocialPublishError("CONTENT_REQUIRED", "請輸入文字或圖片。", 400);
  if (channels.includes("instagram") && !imageUrl) {
    throw new SocialPublishError("INSTAGRAM_IMAGE_REQUIRED", "Instagram 官方接口需要一張公開圖片。", 400);
  }
  if (channels.includes("threads") && Buffer.byteLength(text, "utf8") > 500) {
    throw new SocialPublishError("THREADS_TEXT_TOO_LONG", "Threads 文字最多 500 個 UTF-8 位元組。", 400);
  }
  if (channels.includes("instagram") && [...text].length > 2200) {
    throw new SocialPublishError("INSTAGRAM_CAPTION_TOO_LONG", "Instagram 文字最多 2,200 字。", 400);
  }
  if ([...altText].length > 1000) {
    throw new SocialPublishError("ALT_TEXT_TOO_LONG", "圖片說明最多 1,000 字。", 400);
  }
  return { text, imageUrl, altText, channels };
}

function scrubMessage(value, token) {
  let message = String(value || "Meta 沒有接受這次發布。")
    .replace(/access_token\s*[=:]\s*[^\s&,]+/gi, "access_token=[hidden]")
    .slice(0, 500);
  if (token) message = message.split(token).join("[hidden]");
  return message;
}

async function postForm(url, values, token, fetchImpl = fetch) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== "" && value !== undefined && value !== null) body.set(key, String(value));
  }
  body.set("access_token", token);

  let response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    throw new SocialPublishError(timedOut ? "META_TIMEOUT" : "META_UNAVAILABLE", timedOut ? "Meta 回應逾時，請先不要重按，稍後到平台確認。" : "暫時連不到 Meta。", 502);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) {
    const error = payload?.error ?? {};
    throw new SocialPublishError(
      "META_REJECTED",
      scrubMessage(error.message || `Meta HTTP ${response.status}`, token),
      502,
    );
  }
  const id = String(payload?.id ?? "").trim();
  if (!id) throw new SocialPublishError("META_INVALID_RESPONSE", "Meta 回傳內容缺少發布編號。", 502);
  return id;
}


async function fetchProfileUsername(url, token, fetchImpl = fetch) {
  const target = new URL(url);
  target.searchParams.set("fields", "username");
  target.searchParams.set("access_token", token);
  let response;
  try {
    response = await fetchImpl(target.toString(), {
      method: "GET",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    throw new SocialPublishError(timedOut ? "META_TIMEOUT" : "META_UNAVAILABLE", timedOut ? "Meta 帳號驗證逾時，這次不發布。" : "暫時無法驗證 Meta 帳號，這次不發布。", 502);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) {
    const error = payload?.error ?? {};
    throw new SocialPublishError("META_ACCOUNT_VERIFY_FAILED", scrubMessage(error.message || `Meta HTTP ${response.status}`, token), 502);
  }
  return normalizeUsername(payload?.username);
}

async function assertTargetAccount({ channel, profileUrl, token, targetUsername, fetchImpl }) {
  const target = normalizeUsername(targetUsername);
  if (!target) return;
  const actual = await fetchProfileUsername(profileUrl, token, fetchImpl);
  if (!actual || actual !== target) {
    throw new SocialPublishError(
      "META_ACCOUNT_MISMATCH",
      `${channel === "instagram" ? "Instagram" : "Threads"} 目前連到 @${actual || "unknown"}，不是已鎖定的 @${target}；已停止發布。`,
      409,
    );
  }
}

export async function publishToThreads(post, env = process.env, fetchImpl = fetch) {
  const userId = envValue(env, "META_THREADS_USER_ID");
  const token = envValue(env, "META_THREADS_ACCESS_TOKEN");
  if (!userId || !token) throw new SocialPublishError("THREADS_NOT_CONNECTED", "Threads 尚未連接。", 503);
  const version = cleanVersion(envValue(env, "META_THREADS_API_VERSION"), DEFAULT_THREADS_VERSION);
  const base = `https://graph.threads.net/${version}/${encodeURIComponent(userId)}`;
  await assertTargetAccount({
    channel: "threads",
    profileUrl: base,
    token,
    targetUsername: envValue(env, "META_TARGET_THREADS_USERNAME"),
    fetchImpl,
  });
  const containerId = await postForm(`${base}/threads`, {
    media_type: post.imageUrl ? "IMAGE" : "TEXT",
    text: post.text,
    image_url: post.imageUrl,
  }, token, fetchImpl);
  const id = await postForm(`${base}/threads_publish`, { creation_id: containerId }, token, fetchImpl);
  return { ok: true, id };
}

export async function publishToInstagram(post, env = process.env, fetchImpl = fetch) {
  const userId = envValue(env, "META_INSTAGRAM_USER_ID");
  const token = envValue(env, "META_INSTAGRAM_ACCESS_TOKEN");
  if (!userId || !token) throw new SocialPublishError("INSTAGRAM_NOT_CONNECTED", "Instagram 尚未連接。", 503);
  const version = cleanVersion(envValue(env, "META_GRAPH_API_VERSION"), DEFAULT_GRAPH_VERSION);
  const base = `https://graph.facebook.com/${version}/${encodeURIComponent(userId)}`;
  await assertTargetAccount({
    channel: "instagram",
    profileUrl: base,
    token,
    targetUsername: envValue(env, "META_TARGET_INSTAGRAM_USERNAME"),
    fetchImpl,
  });
  const containerId = await postForm(`${base}/media`, {
    image_url: post.imageUrl,
    caption: post.text,
    alt_text: post.altText,
  }, token, fetchImpl);
  const id = await postForm(`${base}/media_publish`, { creation_id: containerId }, token, fetchImpl);
  return { ok: true, id };
}

function publicFailure(error) {
  if (error instanceof SocialPublishError) return { ok: false, code: error.code, message: error.message };
  return { ok: false, code: "PUBLISH_FAILED", message: "發布失敗，請稍後再試。" };
}

export async function publishSocialPost(input, env = process.env, fetchImpl = fetch) {
  const post = validateSocialPost(input);
  const jobs = post.channels.map(async (channel) => {
    try {
      const result = channel === "instagram"
        ? await publishToInstagram(post, env, fetchImpl)
        : await publishToThreads(post, env, fetchImpl);
      return [channel, result];
    } catch (error) {
      return [channel, publicFailure(error)];
    }
  });
  const entries = await Promise.all(jobs);
  return Object.fromEntries(entries);
}
