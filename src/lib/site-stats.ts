import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
const VISITOR_KEY = "zhaowu.visitor.v1";
export type PublicSiteStats = { totalVisits: number; todayVisits: number; version: string; updateNumber: number; publishedAt: string | null; latestSummary: string; };
export const SITE_RELEASE_FALLBACK = {
  version: "ZW-WEB-2026.09.19-r161",
  updateNumber: 161,
  publishedAt: "2026-09-19T17:55:00+10:00",
  latestSummary: "修復 Netlify 站主密碼讀取；首頁動畫加入聲音控制，核心流程置頂，四個延伸區統一為單一收合系統，日夜切換改為清楚文字分段。",
  details: {
    "zh-Hant": [
      "修正 Netlify Fetch Request body 判讀，站主密碼 19881004 可由正式站正確驗證。",
      "首頁開場與站主登入動畫加入明確聲音按鈕；iPhone 依瀏覽器規則由使用者點擊後播放。",
      "首頁改為命盤與完整報告常駐置頂；今日、心境小測、吉象圖鑑、觀世錄共用同一收合規則，預設全收起且同時只開一區。",
      "右上角日夜圖示改為日／夜文字分段控制；排盤、報告內容、資料、付款與 Supabase schema 均未變更。",
    ],
    en: [
      "Netlify now parses the standards-based Request body correctly so the documented owner password can authenticate.",
      "The opening and owner-login animations expose explicit sound controls; iPhone playback starts after a user tap as required by Safari.",
      "The chart and integrated report now lead the homepage; Today, Self Discovery, Atlas and Notes use one closed-by-default accordion system.",
      "The decorative day/night icons are replaced by a clear labelled segment; chart maths, reports, payments and data remain unchanged.",
    ],
  },
} as const;
function publicHeaders(extra?: HeadersInit): HeadersInit { return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", ...extra }; }
export async function recordVisit() { if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return; let key = ""; try { key = localStorage.getItem(VISITOR_KEY) ?? ""; if (!key) { key = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, key); } } catch { key = crypto.randomUUID(); } const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/zhaowu_record_visit`, { method: "POST", headers: publicHeaders({ Prefer: "return=minimal" }), body: JSON.stringify({ p_visitor_key: key }) }); if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`); }
export async function getPublicSiteStats(): Promise<PublicSiteStats> { if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Public site statistics are not configured."); const [settingsRes, releaseRes] = await Promise.all([ fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }), fetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }) ]); if (!settingsRes.ok || !releaseRes.ok) throw new Error(`Public site statistics failed: HTTP ${settingsRes.status}/${releaseRes.status}`); const settings = await settingsRes.json() as { value?: { total?: number; today?: number } }[]; const releases = await releaseRes.json() as { version?: string; update_number?: number; published_at?: string; notes?: { summary?: string } }[]; const latest = releases[0]; const databaseUpdateNumber = Number(latest?.update_number ?? 0); const databaseIsCurrent = databaseUpdateNumber >= SITE_RELEASE_FALLBACK.updateNumber; return { totalVisits: Number(settings[0]?.value?.total ?? 0), todayVisits: Number(settings[0]?.value?.today ?? 0), version: databaseIsCurrent ? String(latest?.version ?? SITE_RELEASE_FALLBACK.version) : SITE_RELEASE_FALLBACK.version, updateNumber: databaseIsCurrent ? databaseUpdateNumber : SITE_RELEASE_FALLBACK.updateNumber, publishedAt: databaseIsCurrent ? (latest?.published_at ?? SITE_RELEASE_FALLBACK.publishedAt) : SITE_RELEASE_FALLBACK.publishedAt, latestSummary: databaseIsCurrent ? String(latest?.notes?.summary ?? SITE_RELEASE_FALLBACK.latestSummary) : SITE_RELEASE_FALLBACK.latestSummary }; }
