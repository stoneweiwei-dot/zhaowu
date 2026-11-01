/**
 * Server-side, opt-in WeChat official-account draft adapter.
 * No Vercel function or scheduled publisher. Never prints AppSecret / access token.
 * Usage:
 *   WECHAT_APP_ID=... WECHAT_APP_SECRET=... node scripts/wechat-draft-api.mjs --check
 *   WECHAT_APP_ID=... WECHAT_APP_SECRET=... WECHAT_THUMB_MEDIA_ID=... node scripts/wechat-draft-api.mjs --create docs/unpublished/wechat-2026-11-02.json
 * Requires owner-granted API rights. A created draft is NOT a published article.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API = "https://api.weixin.qq.com";
export class WechatApiError extends Error {
  constructor(code) {
    super(`WECHAT_API_${String(code).replace(/[^\w-]/g, "").slice(0, 32)}`);
    this.code = code;
  }
}
export async function callWeChat(path, { method = "GET", body, accessToken, fetchImpl = fetch } = {}) {
  const url = new URL(path, API);
  if (accessToken) url.searchParams.set("access_token", accessToken);
  let response;
  try {
    response = await fetchImpl(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch { throw new WechatApiError("NETWORK_OR_TIMEOUT"); }
  if (!response.ok) throw new WechatApiError(`HTTP_${response.status}`);
  let result;
  try { result = await response.json(); } catch { throw new WechatApiError("BAD_RESPONSE"); }
  if (!result || typeof result !== "object") throw new WechatApiError("BAD_RESPONSE");
  if (result.errcode && result.errcode !== 0) throw new WechatApiError(result.errcode);
  return result;
}
export async function getStableToken(appid, secret, fetchImpl = fetch) {
  if (!appid || !secret) throw new WechatApiError("CREDENTIALS_MISSING");
  const result = await callWeChat("/cgi-bin/stable_token", { method: "POST", body: { grant_type: "client_credential", appid, secret, force_refresh: false }, fetchImpl });
  if (typeof result.access_token !== "string" || !result.access_token) throw new WechatApiError("TOKEN_MISSING");
  return result.access_token;
}
export async function checkDraftPermission(accessToken, fetchImpl = fetch) {
  const result = await callWeChat("/cgi-bin/draft/count", { accessToken, fetchImpl });
  if (!Number.isFinite(result.total_count)) throw new WechatApiError("COUNT_INVALID");
  return { ok: true, permission: "granted", count: result.total_count };
}
export function validArticle(article, thumbId) {
  const title = typeof article?.title === "string" ? article.title.trim() : "";
  const digest = typeof article?.digest === "string" ? article.digest.trim() : "";
  const content = typeof article?.content === "string" ? article.content.trim() : "";
  const thumb_media_id = String(thumbId || article?.thumb_media_id || "").trim();
  if (!title || !content || !thumb_media_id) throw new WechatApiError("TITLE_CONTENT_THUMB_REQUIRED");
  if (title.length > 64 || digest.length > 120 || content.length > 150000) throw new WechatApiError("ARTICLE_LENGTH_INVALID");
  if (/<(?:script|iframe)\b/i.test(content)) throw new WechatApiError("UNSAFE_HTML");
  return { title, digest, content, thumb_media_id, author: "昭梧觀象", need_open_comment: 0, only_fans_can_comment: 0, show_cover_pic: 1 };
}
export async function createAndVerifyDraft(article, accessToken, fetchImpl = fetch) {
  // A create call is deliberately never retried: an ambiguous failure could duplicate drafts.
  const created = await callWeChat("/cgi-bin/draft/add", { method: "POST", accessToken, body: { articles: [article] }, fetchImpl });
  if (!created.media_id) throw new WechatApiError("MEDIA_ID_MISSING");
  try {
    const verified = await callWeChat("/cgi-bin/draft/get", { method: "POST", accessToken, body: { media_id: created.media_id }, fetchImpl });
    if (!verified.news_item?.length) return { status: "created_unverified", media_id: created.media_id };
    return { status: "draft_verified_not_published", media_id: created.media_id };
  } catch {
    return { status: "created_unverified", media_id: created.media_id };
  }
}
async function main() {
  const mode = process.argv[2];
  if (!["--check", "--create"].includes(mode)) throw new WechatApiError("USAGE_CHECK_OR_CREATE");
  const token = await getStableToken(process.env.WECHAT_APP_ID, process.env.WECHAT_APP_SECRET);
  const checked = await checkDraftPermission(token);
  if (mode === "--check") { process.stdout.write(JSON.stringify(checked) + "\n"); return; }
  const path = process.argv[3];
  if (!path) throw new WechatApiError("FILE_REQUIRED");
  const input = JSON.parse(await readFile(path, "utf8"));
  const article = validArticle(input, process.env.WECHAT_THUMB_MEDIA_ID);
  const result = await createAndVerifyDraft(article, token);
  process.stdout.write(JSON.stringify(result) + "\n");
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => {
    // Only our own static error codes: do not leak tokens, fetch URLs, or upstream bodies.
    process.stderr.write((error instanceof WechatApiError ? error.message : "WECHAT_API_INPUT_OR_RUNTIME_ERROR") + "\n");
    process.exitCode = 1;
  });
}
