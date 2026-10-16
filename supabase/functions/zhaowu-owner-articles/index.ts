import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { authorizeBridgeHeaders } from "./auth.mjs";

type Runtime = { supabaseUrl?: string; supabaseSecretKey?: string; bridgeSecret?: string };
const LANGUAGES = ["zh-Hant", "zh-Hans", "en"] as const;
const ID = /^[a-z0-9][a-z0-9-]{0,119}$/;
const HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: HEADERS }); }
function fromEnv(): Runtime {
  const env = (globalThis as { Deno?: { env: { get(key: string): string | undefined } } }).Deno?.env;
  let key = "";
  try { key = JSON.parse(env?.get("SUPABASE_SECRET_KEYS") || "{}").default || ""; } catch { /* old project key */ }
  return { supabaseUrl: env?.get("SUPABASE_URL"), supabaseSecretKey: key || env?.get("SUPABASE_SERVICE_ROLE_KEY"), bridgeSecret: env?.get("ZHAOWU_OWNER_BRIDGE_SECRET") };
}
function localized(value: unknown, max: number): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const next: Record<string, string> = {};
  for (const language of LANGUAGES) {
    const item = source[language];
    if (typeof item !== "string" || !item.trim() || item.length > max) return null;
    next[language] = item.trim();
  }
  return next;
}
export async function handle(req: Request, env: Runtime = fromEnv()): Promise<Response> {
  if (req.method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
  const auth = authorizeBridgeHeaders(req.headers, env.bridgeSecret ?? "");
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const payload = await req.json().catch(() => null) as Record<string, unknown> | null;
  const action = String(payload?.action ?? "");
  if (!["article.list", "article.save", "article.archive", "article.reset"].includes(action)) return json({ ok: false, error: "ACTION_NOT_ALLOWED" }, 400);
  if (!env.supabaseUrl || !env.supabaseSecretKey) return json({ ok: false, error: "ARTICLE_STORE_NOT_CONFIGURED" }, 503);
  const admin = createClient(env.supabaseUrl, env.supabaseSecretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const table = admin.from("article_editor_overrides");
  if (action === "article.list") {
    const { data, error } = await table.select("id,title,summary,body,archived,updated_at").order("updated_at", { ascending: false }).limit(500);
    return error ? json({ ok: false, error: "ARTICLE_STORE_ERROR" }, 502) : json({ ok: true, articles: data ?? [] });
  }
  const id = String(payload?.id ?? "");
  if (!ID.test(id)) return json({ ok: false, error: "INVALID_ARTICLE_ID" }, 400);
  if (action === "article.reset") {
    const { error } = await table.delete().eq("id", id);
    return error ? json({ ok: false, error: "ARTICLE_STORE_ERROR" }, 502) : json({ ok: true, id });
  }
  if (action === "article.archive") {
    if (typeof payload?.archived !== "boolean") return json({ ok: false, error: "INVALID_STATUS" }, 400);
    const { data, error } = await table.upsert({ id, archived: payload.archived, updated_at: new Date().toISOString() }, { onConflict: "id" }).select("*").single();
    return error ? json({ ok: false, error: "ARTICLE_STORE_ERROR" }, 502) : json({ ok: true, article: data });
  }
  const title = localized(payload?.title, 240), summary = localized(payload?.summary, 1500), body = localized(payload?.body, 80000);
  if (!title || !summary || !body) return json({ ok: false, error: "INVALID_ARTICLE_FIELDS" }, 400);
  const { data, error } = await table.upsert({ id, title, summary, body, updated_at: new Date().toISOString() }, { onConflict: "id" }).select("*").single();
  return error ? json({ ok: false, error: "ARTICLE_STORE_ERROR" }, 502) : json({ ok: true, article: data });
}
const D = (globalThis as { Deno?: { serve(fn: (req: Request) => Promise<Response>): void } }).Deno;
if (D?.serve) D.serve((req) => handle(req).catch(() => json({ ok: false, error: "OWNER_ARTICLE_FAILED" }, 500)));
