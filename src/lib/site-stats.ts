import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
const VISITOR_KEY = "zhaowu.visitor.v1";
export type PublicSiteStats = { totalVisits: number; todayVisits: number; version: string; updateNumber: number; publishedAt: string | null; latestSummary: string; };
export const SITE_RELEASE_FALLBACK = {
  version: "ZW-WEB-2026.09.19-r160",
  updateNumber: 160,
  publishedAt: "2026-09-19T16:40:00+10:00",
  latestSummary: "首頁測驗收成單一「昭梧 · 心境小測」入口；公開圖鑑隔離有面部重影的人像舊圖，只展示無人物祥紋。",
  details: {
    "zh-Hant": [
      "首頁不再把所有測驗直接攤開，只保留「昭梧 · 心境小測」單一入口，預設收起。",
      "點開入口後仍可使用原有各項測驗；題目、計分、紀錄與既有路由不變。",
      "公開吉象圖鑑只展示無人物祥紋，避免面部重影舊圖再次出現在首頁與圖鑑。",
      "舊圖與報告母圖原檔均未刪除；本次不改排盤、報告內容、登入、付款或資料庫。",
    ],
    en: [
      "The home page now keeps every optional quiz behind one collapsed ZHAOWU · SELF DISCOVERY entry.",
      "Opening it preserves the existing quizzes, scoring, saved results and routes.",
      "The public atlas now displays face-free auspicious ornaments only, preventing legacy portrait artifacts from returning.",
      "No original media is deleted; chart maths, report content, auth, payment and data are unchanged.",
    ],
  },
} as const;
function publicHeaders(extra?: HeadersInit): HeadersInit { return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", ...extra }; }
export async function recordVisit() { if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return; let key = ""; try { key = localStorage.getItem(VISITOR_KEY) ?? ""; if (!key) { key = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, key); } } catch { key = crypto.randomUUID(); } const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/zhaowu_record_visit`, { method: "POST", headers: publicHeaders({ Prefer: "return=minimal" }), body: JSON.stringify({ p_visitor_key: key }) }); if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`); }
export async function getPublicSiteStats(): Promise<PublicSiteStats> { if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Public site statistics are not configured."); const [settingsRes, releaseRes] = await Promise.all([ fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }), fetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }) ]); if (!settingsRes.ok || !releaseRes.ok) throw new Error(`Public site statistics failed: HTTP ${settingsRes.status}/${releaseRes.status}`); const settings = await settingsRes.json() as { value?: { total?: number; today?: number } }[]; const releases = await releaseRes.json() as { version?: string; update_number?: number; published_at?: string; notes?: { summary?: string } }[]; const latest = releases[0]; const databaseUpdateNumber = Number(latest?.update_number ?? 0); const databaseIsCurrent = databaseUpdateNumber >= SITE_RELEASE_FALLBACK.updateNumber; return { totalVisits: Number(settings[0]?.value?.total ?? 0), todayVisits: Number(settings[0]?.value?.today ?? 0), version: databaseIsCurrent ? String(latest?.version ?? SITE_RELEASE_FALLBACK.version) : SITE_RELEASE_FALLBACK.version, updateNumber: databaseIsCurrent ? databaseUpdateNumber : SITE_RELEASE_FALLBACK.updateNumber, publishedAt: databaseIsCurrent ? (latest?.published_at ?? SITE_RELEASE_FALLBACK.publishedAt) : SITE_RELEASE_FALLBACK.publishedAt, latestSummary: databaseIsCurrent ? String(latest?.notes?.summary ?? SITE_RELEASE_FALLBACK.latestSummary) : SITE_RELEASE_FALLBACK.latestSummary }; }
