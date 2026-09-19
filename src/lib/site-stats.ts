import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
const VISITOR_KEY = "zhaowu.visitor.v1";
export type PublicSiteStats = { totalVisits: number; todayVisits: number; version: string; updateNumber: number; publishedAt: string | null; latestSummary: string; };
export const SITE_RELEASE_FALLBACK = {
  version: "ZW-WEB-2026.09.19-r158",
  updateNumber: 158,
  publishedAt: "2026-09-19T11:50:00+10:00",
  latestSummary: "首頁移除七個公開流派入口；客人保存出生資料後，直接得到一份由內部專項系統交叉組裝的完整綜合報告。",
  details: {
    "zh-Hant": [
      "首頁不再展示七種個人分析卡或流派入口，避免客人自行選派系與重複閱讀。",
      "保存出生資料後，同一畫面直接顯示四柱命盤、基礎解釋與完整綜合報告。",
      "子平維持唯一結構主判；其他方法只在內部提供性情、關係、事業、時間與反覆課題旁證。",
      "原有專項計算與路由保留作內部能力，本次不改排盤公式、報告問答、登入、付款或資料庫。",
    ],
    en: [
      "The home page no longer exposes seven separate schools or reading cards.",
      "After saving birth details, the same page immediately shows the Four Pillars chart, foundation and one complete integrated report.",
      "Zi Ping remains the primary structural judgement; other methods contribute internal supporting evidence only.",
      "Specialist calculation capabilities remain available internally; chart maths, question reports, auth, payment and data are unchanged.",
    ],
  },
} as const;
function publicHeaders(extra?: HeadersInit): HeadersInit { return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", ...extra }; }
export async function recordVisit() { if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return; let key = ""; try { key = localStorage.getItem(VISITOR_KEY) ?? ""; if (!key) { key = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, key); } } catch { key = crypto.randomUUID(); } const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/zhaowu_record_visit`, { method: "POST", headers: publicHeaders({ Prefer: "return=minimal" }), body: JSON.stringify({ p_visitor_key: key }) }); if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`); }
export async function getPublicSiteStats(): Promise<PublicSiteStats> { if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Public site statistics are not configured."); const [settingsRes, releaseRes] = await Promise.all([ fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }), fetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }) ]); if (!settingsRes.ok || !releaseRes.ok) throw new Error(`Public site statistics failed: HTTP ${settingsRes.status}/${releaseRes.status}`); const settings = await settingsRes.json() as { value?: { total?: number; today?: number } }[]; const releases = await releaseRes.json() as { version?: string; update_number?: number; published_at?: string; notes?: { summary?: string } }[]; const latest = releases[0]; const databaseUpdateNumber = Number(latest?.update_number ?? 0); const databaseIsCurrent = databaseUpdateNumber >= SITE_RELEASE_FALLBACK.updateNumber; return { totalVisits: Number(settings[0]?.value?.total ?? 0), todayVisits: Number(settings[0]?.value?.today ?? 0), version: databaseIsCurrent ? String(latest?.version ?? SITE_RELEASE_FALLBACK.version) : SITE_RELEASE_FALLBACK.version, updateNumber: databaseIsCurrent ? databaseUpdateNumber : SITE_RELEASE_FALLBACK.updateNumber, publishedAt: databaseIsCurrent ? (latest?.published_at ?? SITE_RELEASE_FALLBACK.publishedAt) : SITE_RELEASE_FALLBACK.publishedAt, latestSummary: databaseIsCurrent ? String(latest?.notes?.summary ?? SITE_RELEASE_FALLBACK.latestSummary) : SITE_RELEASE_FALLBACK.latestSummary }; }
