/**
 * answer-writer — rewrites the first-screen answer so it addresses the visitor's
 * exact question, using ONLY chart facts the browser engine already computed.
 *
 * Owner-approved spend (2026-10-03): OpenAI usage for public answers, hard cap
 * US$20/month. Enforced here, fail-closed:
 *   - site_settings.answer_writer must exist with enabled=true (kill switch)
 *   - global monthly call cap  (default 5000 calls ≈ US$6 at gpt-4.1-mini rates)
 *   - per-visitor daily cap    (default 5, keyed by a salted hash of the IP)
 * Any failure returns { source: "rule" } and the site keeps the rule answer.
 * The model never recalculates the chart; the browser validates the output again.
 */
const PRIMARY_ORIGIN = "https://stone-zhaowu-official.vercel.app";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

type Settings = { enabled: boolean; monthlyCap: number; perVisitorDaily: number; model: string };

function allowedOrigin(origin: string | null) {
  if (!origin) return PRIMARY_ORIGIN;
  try {
    const url = new URL(origin);
    if (
      url.hostname === "stone-zhaowu-official.vercel.app" ||
      url.hostname === "zhaowu.soul-terminal.com" ||
      (url.hostname.startsWith("stone-zhaowu-official-") && url.hostname.endsWith(".vercel.app")) ||
      url.hostname === "localhost" || url.hostname === "127.0.0.1"
    ) return origin;
  } catch { /* fall through */ }
  return PRIMARY_ORIGIN;
}

function cors(req: Request) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(req.headers.get("origin")),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

const rest = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });

async function loadSettings(): Promise<Settings | null> {
  const res = await rest("site_settings?key=eq.answer_writer&select=value");
  if (!res.ok) return null;
  const rows = await res.json();
  const v = rows?.[0]?.value ?? null;
  if (!v || v.enabled !== true) return null;
  return {
    enabled: true,
    monthlyCap: Math.min(Number(v.monthlyCap) || 5000, 15000),
    perVisitorDaily: Math.min(Number(v.perVisitorDaily) || 5, 20),
    model: typeof v.model === "string" && /^gpt-[\w.-]+$/.test(v.model) ? v.model : "gpt-4.1-mini",
  };
}

async function sha(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

/** Increment a counter row in daily_usage; returns the count before increment, or null on failure. */
async function bump(visitorKey: string, usageDate: string): Promise<number | null> {
  const q = `daily_usage?visitor_key=eq.${encodeURIComponent(visitorKey)}&usage_date=eq.${usageDate}&select=id,question_count`;
  const res = await rest(q);
  if (!res.ok) return null;
  const rows = await res.json();
  if (rows?.[0]) {
    const before = Number(rows[0].question_count) || 0;
    const up = await rest(`daily_usage?id=eq.${rows[0].id}`, { method: "PATCH", body: JSON.stringify({ question_count: before + 1, updated_at: new Date().toISOString() }) });
    return up.ok ? before : null;
  }
  const ins = await rest("daily_usage", { method: "POST", body: JSON.stringify({ visitor_key: visitorKey, usage_date: usageDate, question_count: 1 }) });
  return ins.ok ? 0 : null;
}

async function peek(visitorKey: string, usageDate: string): Promise<number | null> {
  const res = await rest(`daily_usage?visitor_key=eq.${encodeURIComponent(visitorKey)}&usage_date=eq.${usageDate}&select=question_count`);
  if (!res.ok) return null;
  const rows = await res.json();
  return Number(rows?.[0]?.question_count) || 0;
}

const SYSTEM = `你是「昭梧」的回答撰寫者。系統已經用八字引擎把盤面算好，給你「盤面事實」和一份「規則式草稿」。你的工作只有一件：讀懂使用者真正在問什麼，用白話、像一位踏實的真人命理師那樣，直接回答這一題。

規則：
1. 第一句就回答問題本身（可以／不建議／偏向哪邊／什麼時候／怎麼做），不要先鋪陳。
2. 全部 1 到 3 句，每句以「。」結尾，總長不超過 150 字。
3. 只能使用盤面事實裡寫到的資訊（長處、要留意的地方、底子、今年整體、月份）。不得自行推算或新增任何命盤判斷、月份、年份或五行；沒寫到的月份一律不能提。
4. 不得出現命理術語：日主、月令、格局、十神、用神、喜用、七殺、正印、偏印、正官、偏官、正財、偏財、食神、傷官、比肩、劫財、身強、身弱、大運、流年、天干、地支、沖、刑、害、破。全部改成日常說法。
5. 命盤看不出來的事（對方心意、別人的健康、官司結果、彩券、壽命、疾病診斷），直接說命盤看不出來，再轉向他自己能做的事。
6. 不保證結果，不恐嚇，不說「一定會」。健康只給生活提醒並建議看醫生。
7. 繁體中文、台灣日常用語，語氣溫和但直接，不要客套、不要說「親愛的」。
8. 另外給「下一步」：一個這週就能做的具體動作，最多 60 字。
9. 只輸出 JSON：{"answer":"…","next":"…"}`;

function clean(text: unknown, max: number) {
  return String(text ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

const JARGON = /日主|月令|格局|十神|用神|喜用|七殺|七杀|正印|偏印|正官|偏官|正財|偏財|食神|傷官|比肩|劫財|身強|身弱|大運|流年|天干|地支|納音/;
const FORBIDDEN = /死期|壽命|會死|去世|過世|絕症|血光|中獎號碼|(?<!不)保證|(?<!不)一定會/;

function valid(answer: string, next: string, allowedMonths: number[]) {
  const n = (answer.match(/[。！？]/g) ?? []).length;
  if (n < 1 || n > 3 || answer.length > 220 || !next || next.length > 100) return false;
  if (JARGON.test(answer + next) || FORBIDDEN.test(answer + next)) return false;
  for (const m of `${answer}${next}`.matchAll(/(\d{1,2})月/g)) if (!allowedMonths.includes(Number(m[1]))) return false;
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "METHOD_NOT_ALLOWED" }, 405);
  const rule = { source: "rule" };
  try {
    if (!SUPABASE_URL || !SERVICE_KEY || !OPENAI_KEY) return json(req, rule);
    const body = await req.json().catch(() => null);
    const question = clean(body?.question, 300);
    const facts = clean(body?.facts, 3000);
    const draftAnswer = clean(body?.draft?.answer, 400);
    const draftNext = clean(body?.draft?.next, 200);
    const allowedMonths: number[] = Array.isArray(body?.months) ? body.months.map(Number).filter((m: number) => m >= 1 && m <= 12).slice(0, 24) : [];
    if (!question || !facts || !draftAnswer) return json(req, rule);

    const settings = await loadSettings();
    if (!settings) return json(req, rule);

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const monthStart = `${today.slice(0, 7)}-01`;
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    const visitorKey = `aw:${await sha(`zhaowu-answer-writer:${ip}`)}`;
    const monthKey = "aw:__month";

    const [mine, month] = await Promise.all([peek(visitorKey, today), peek(monthKey, monthStart)]);
    if (mine === null || month === null) return json(req, rule);
    if (mine >= settings.perVisitorDaily || month >= settings.monthlyCap) return json(req, { source: "rule", reason: "cap" });
    // Count the attempt before calling the provider so failures cannot bypass the cap.
    if ((await bump(monthKey, monthStart)) === null || (await bump(visitorKey, today)) === null) return json(req, rule);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const ai = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: settings.model,
        temperature: 0.5,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `今天日期：${today}\n\n使用者的問題：${question}\n\n盤面事實：\n${facts}\n\n規則式草稿（可改寫，不可新增事實）：\n回答：${draftAnswer}\n下一步：${draftNext}` },
        ],
      }),
    }).finally(() => clearTimeout(timer));
    if (!ai.ok) return json(req, { source: "rule", reason: `provider_${ai.status}` });
    const out = await ai.json();
    const content = out?.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content);
    const answer = clean(parsed?.answer, 300);
    const next = clean(parsed?.next, 160);
    // Rejected candidates are echoed for owner evaluation only; the browser ignores non-"llm" sources.
    if (!valid(answer, next, allowedMonths)) return json(req, { source: "rule", reason: "invalid", candidate: { answer, next } });
    return json(req, { source: "llm", answer, next });
  } catch {
    return json(req, rule);
  }
});
