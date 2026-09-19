import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
const VISITOR_KEY = "zhaowu.visitor.v1";
export type PublicSiteStats = { totalVisits: number; todayVisits: number; version: string; updateNumber: number; publishedAt: string | null; latestSummary: string; };
export const SITE_RELEASE_FALLBACK = {
  version: "ZW-WEB-2026.09.19-r162",
  updateNumber: 162,
  publishedAt: "2026-09-19T18:30:00+10:00",
  latestSummary: "專業計算路由改為站主專用；Netlify 補上主人資料橋接，公開紀錄與導覽只保留完整命盤及心境小測。",
  details: {
    "zh-Hant": [
      "八個專業計算路由現在先驗證站主 HttpOnly Cookie，未登入的公開訪客會回到首頁。",
      "站主報告、圖庫、登入素材、首頁背景與命詮圖操作統一經過同源 /api/owner-data 橋接。",
      "我的紀錄、知識庫與青玉小龍不再露出專業流派入口，只引導至首頁完整命盤或心境小測。",
      "資料庫 SECURITY DEFINER RPC 已限縮為 service_role；Supabase 儲存額度 402 仍需帳務端處理。",
    ],
    en: [
      "Eight specialist calculation routes now verify the owner HttpOnly cookie and redirect public visitors home.",
      "Owner reports, gallery, login visuals, backgrounds and decree images use the same-origin /api/owner-data bridge.",
      "History, Knowledge and the dragon guide expose only the unified home report and self-discovery test.",
      "The SECURITY DEFINER RPC is restricted to service_role; Supabase Storage HTTP 402 still requires an account-side quota decision.",
    ],
  },
} as const;
function publicHeaders(extra?: HeadersInit): HeadersInit { return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", ...extra }; }
export async function recordVisit() { if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return; let key = ""; try { key = localStorage.getItem(VISITOR_KEY) ?? ""; if (!key) { key = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, key); } } catch { key = crypto.randomUUID(); } const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/zhaowu_record_visit`, { method: "POST", headers: publicHeaders({ Prefer: "return=minimal" }), body: JSON.stringify({ p_visitor_key: key }) }); if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`); }
export async function getPublicSiteStats(): Promise<PublicSiteStats> { if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Public site statistics are not configured."); const [settingsRes, releaseRes] = await Promise.all([ fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }), fetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }) ]); if (!settingsRes.ok || !releaseRes.ok) throw new Error(`Public site statistics failed: HTTP ${settingsRes.status}/${releaseRes.status}`); const settings = await settingsRes.json() as { value?: { total?: number; today?: number } }[]; const releases = await releaseRes.json() as { version?: string; update_number?: number; published_at?: string; notes?: { summary?: string } }[]; const latest = releases[0]; const databaseUpdateNumber = Number(latest?.update_number ?? 0); const databaseIsCurrent = databaseUpdateNumber >= SITE_RELEASE_FALLBACK.updateNumber; return { totalVisits: Number(settings[0]?.value?.total ?? 0), todayVisits: Number(settings[0]?.value?.today ?? 0), version: databaseIsCurrent ? String(latest?.version ?? SITE_RELEASE_FALLBACK.version) : SITE_RELEASE_FALLBACK.version, updateNumber: databaseIsCurrent ? databaseUpdateNumber : SITE_RELEASE_FALLBACK.updateNumber, publishedAt: databaseIsCurrent ? (latest?.published_at ?? SITE_RELEASE_FALLBACK.publishedAt) : SITE_RELEASE_FALLBACK.publishedAt, latestSummary: databaseIsCurrent ? String(latest?.notes?.summary ?? SITE_RELEASE_FALLBACK.latestSummary) : SITE_RELEASE_FALLBACK.latestSummary }; }
