import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

const VISITOR_KEY = "zhaowu.visitor.v1";
const PUBLIC_DATA_TIMEOUT_MS = 900;
const PUBLIC_DATA_COOLDOWN_MS = 5 * 60_000;
let publicDataBlockedUntil = 0;

export type PublicSiteStats = {
  totalVisits: number;
  todayVisits: number;
  version: string;
  updateNumber: number;
  publishedAt: string | null;
  latestSummary: string;
};

export const SITE_RELEASE_FALLBACK = {
  version: "ZW-WEB-2026.09.29-r222",
  updateNumber: 222,
  publishedAt: "2026-09-29T07:30:00+10:00",
  latestSummary: "首頁重整為單一紙面系統：今日指引不再卡中套卡，分頁與標題不再斷字，五色選擇改為清晰清單；夜間統一墨色底，修正「近日天象」與延伸內容看不見文字的問題。",
  details: {
    "zh-Hant": [
      "r221 的首頁樣式實際被舊層（以 ID 選擇器撰寫的五行穿衣樣式、三層 class 的黃曆樣式）壓過，畫面幾乎沒有變化。r222 以足夠特異性的單一區塊取代 r221，成為首頁唯一有效的視覺規則。",
      "白天：英雄標題去框、移除穿過標題的金線；「今日」內的黃曆、穿衣、天象併入同一張紙，以細線分段，不再四層邊框；分頁改短標籤（黃曆／穿衣／靈籤），完整名稱保留為頁內標題；五色狀態改為色帶＋名稱＋心願的清單；延伸內容去除外框。",
      "夜間：頁面統一墨色底；今日與延伸內容為深松綠承載面、月白字；「近日天象」與延伸內容卡片的淺底淺字問題已修正；生辰表單維持暖紙深墨；加入主畫面提示在夜間恢復可讀。",
    ],
    en: [
      "r221's homepage rules were outranked by older layers (the #id-based five-element wardrobe stylesheet and the three-class almanac stylesheet), so the page barely changed. r222 replaces r221 with one sufficiently specific block that is now the effective visual authority for the homepage.",
      "Day: the hero is no longer boxed and the stray gold rule through the title is gone; almanac, dress colours and sky events now sit on one paper sheet separated by hairlines instead of four nested frames; tabs use short labels with the full name kept as the in-page heading; the five colour states are a clean swatch · name · wish list; the Explore wrapper box is removed.",
      "Night: one ink page field; Today and Explore are dark pine carriers with moon-white text; the light-on-light 'Recent sky events' and Explore cards are fixed; the birth form keeps warm paper with dark ink; the add-to-home-screen sheet is readable again.",
    ],
  },
} as const;

function fallbackStats(): PublicSiteStats {
  return {
    totalVisits: 0,
    todayVisits: 0,
    version: SITE_RELEASE_FALLBACK.version,
    updateNumber: SITE_RELEASE_FALLBACK.updateNumber,
    publishedAt: SITE_RELEASE_FALLBACK.publishedAt,
    latestSummary: SITE_RELEASE_FALLBACK.latestSummary,
  };
}

function publicHeaders(extra?: HeadersInit): HeadersInit {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function publicFetch(input: string, init: RequestInit = {}) {
  if (Date.now() < publicDataBlockedUntil) throw new Error("public-data-cooldown");
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), PUBLIC_DATA_TIMEOUT_MS);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    if (res.status === 402) publicDataBlockedUntil = Date.now() + PUBLIC_DATA_COOLDOWN_MS;
    return res;
  } catch (error) {
    publicDataBlockedUntil = Date.now() + PUBLIC_DATA_COOLDOWN_MS;
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function recordVisit() {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return;
  if (Date.now() < publicDataBlockedUntil) return;

  let key = "";
  try {
    key = localStorage.getItem(VISITOR_KEY) ?? "";
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, key);
    }
  } catch {
    key = crypto.randomUUID();
  }

  const res = await publicFetch(`${SUPABASE_URL}/rest/v1/rpc/zhaowu_record_visit`, {
    method: "POST",
    headers: publicHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify({ p_visitor_key: key }),
  });
  if (!res.ok) throw new Error(`Visit counter failed: HTTP ${res.status}`);
}

export async function getPublicSiteStats(): Promise<PublicSiteStats> {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return fallbackStats();
  if (Date.now() < publicDataBlockedUntil) return fallbackStats();

  try {
    const [settingsRes, releaseRes] = await Promise.all([
      publicFetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }),
      publicFetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }),
    ]);

    if (!settingsRes.ok || !releaseRes.ok) return fallbackStats();

    const settings = await settingsRes.json() as { value?: { total?: number; today?: number } }[];
    const releases = await releaseRes.json() as { version?: string; update_number?: number; published_at?: string; notes?: { summary?: string } }[];
    const latest = releases[0];
    const databaseUpdateNumber = Number(latest?.update_number ?? 0);
    const databaseIsCurrent = databaseUpdateNumber >= SITE_RELEASE_FALLBACK.updateNumber;

    return {
      totalVisits: Number(settings[0]?.value?.total ?? 0),
      todayVisits: Number(settings[0]?.value?.today ?? 0),
      version: databaseIsCurrent ? String(latest?.version ?? SITE_RELEASE_FALLBACK.version) : SITE_RELEASE_FALLBACK.version,
      updateNumber: databaseIsCurrent ? databaseUpdateNumber : SITE_RELEASE_FALLBACK.updateNumber,
      publishedAt: databaseIsCurrent ? (latest?.published_at ?? SITE_RELEASE_FALLBACK.publishedAt) : SITE_RELEASE_FALLBACK.publishedAt,
      latestSummary: databaseIsCurrent ? String(latest?.notes?.summary ?? SITE_RELEASE_FALLBACK.latestSummary) : SITE_RELEASE_FALLBACK.latestSummary,
    };
  } catch {
    return fallbackStats();
  }
}
