import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
const VISITOR_KEY = "zhaowu.visitor.v1";
export type PublicSiteStats = { totalVisits: number; todayVisits: number; version: string; updateNumber: number; publishedAt: string | null; latestSummary: string; };
export const SITE_RELEASE_FALLBACK = {
  version: "ZW-WEB-2026.09.19-r163",
  updateNumber: 163,
  publishedAt: "2026-09-19T20:48:00+10:00",
  latestSummary: "首頁與核心流程收成高級宋式宣紙：山水退遠、紙面不透明、層級與留白加強，青玉小龍更小更安靜。",
  details: {
    "zh-Hant": [
      "山水背景改為更淡、更遠的底層，主視覺回到暖米宣紙與宋式文字層級。",
      "出生資料、命盤、報告、表單與延伸入口統一使用不透明紙面，移除厚重陰影與玻璃感。",
      "手機版拉開標題、欄位、按鈕與區塊間距，維持 16px 表單字與可讀行距。",
      "青玉小龍維持唯一浮動入口與完整五鍵音樂控制，但縮小尺寸並降低提示泡泡頻率。",
    ],
    en: [
      "The landscape now recedes into a quiet background so warm paper and Song-style typography lead the page.",
      "Birth data, chart, report, form and secondary entries use opaque paper surfaces without glass effects or heavy shadows.",
      "Mobile spacing, type hierarchy, 16px fields and reading rhythm are tuned for a calmer complete flow.",
      "The Jade Dragon remains the only floating entry with all five music controls, but is smaller and speaks less often.",
    ],
  },
} as const;
function publicHeaders(extra?: HeadersInit): HeadersInit { return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", ...extra }; }
export async function recordVisit() { if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return; let key = ""; try { key = localStorage.getItem(VISITOR_KEY) ?? ""; if (!key) { key = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, key); } } catch { key = crypto.randomUUID(); } const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/zhaowu_record_visit`, { method: "POST", headers: publicHeaders({ Prefer: "return=minimal" }), body: JSON.stringify({ p_visitor_key: key }) }); if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`); }
export async function getPublicSiteStats(): Promise<PublicSiteStats> { if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Public site statistics are not configured."); const [settingsRes, releaseRes] = await Promise.all([ fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }), fetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }) ]); if (!settingsRes.ok || !releaseRes.ok) throw new Error(`Public site statistics failed: HTTP ${settingsRes.status}/${releaseRes.status}`); const settings = await settingsRes.json() as { value?: { total?: number; today?: number } }[]; const releases = await releaseRes.json() as { version?: string; update_number?: number; published_at?: string; notes?: { summary?: string } }[]; const latest = releases[0]; const databaseUpdateNumber = Number(latest?.update_number ?? 0); const databaseIsCurrent = databaseUpdateNumber >= SITE_RELEASE_FALLBACK.updateNumber; return { totalVisits: Number(settings[0]?.value?.total ?? 0), todayVisits: Number(settings[0]?.value?.today ?? 0), version: databaseIsCurrent ? String(latest?.version ?? SITE_RELEASE_FALLBACK.version) : SITE_RELEASE_FALLBACK.version, updateNumber: databaseIsCurrent ? databaseUpdateNumber : SITE_RELEASE_FALLBACK.updateNumber, publishedAt: databaseIsCurrent ? (latest?.published_at ?? SITE_RELEASE_FALLBACK.publishedAt) : SITE_RELEASE_FALLBACK.publishedAt, latestSummary: databaseIsCurrent ? String(latest?.notes?.summary ?? SITE_RELEASE_FALLBACK.latestSummary) : SITE_RELEASE_FALLBACK.latestSummary }; }
