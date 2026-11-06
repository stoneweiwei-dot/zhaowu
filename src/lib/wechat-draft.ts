/** Offline, owner-only WeChat copy preparation. Never claims an API draft or publication. */
export type WechatDraftFields = { title: string; summary: string; body: string };
export function prepareWechatDraft(input: WechatDraftFields) {
  const trim = (value: string) => value.replace(/\r\n?/g, "\n").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  const title = trim(input.title);
  const summary = trim(input.summary);
  const body = trim(input.body).replace(/\n{3,}/g, "\n\n");
  const warnings: string[] = [];
  if (!title) warnings.push("TITLE_REQUIRED");
  if (!body) warnings.push("BODY_REQUIRED");
  if (title.length > 64) warnings.push("TITLE_TOO_LONG");
  if (summary.length > 120) warnings.push("SUMMARY_TOO_LONG");
  if (/<(?:script|iframe)\b/i.test(body)) warnings.push("UNSAFE_HTML_REVIEW");
  const formatted = [title, summary ? `導讀｜${summary}` : "", body, "——", "昭梧觀象｜認識先天條件，把選擇留給自己。"].filter(Boolean).join("\n\n");
  return { title, summary, body, formatted, warnings };
}
