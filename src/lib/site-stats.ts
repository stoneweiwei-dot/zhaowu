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
  version: "ZW-WEB-2026.10.01-r223",
  updateNumber: 223,
  publishedAt: "2026-10-01T13:00:00+10:00",
  latestSummary: "開場影片每次開啟 App 都會播放並可跳過、保留聲音且上限 15 秒；聲音鈕改為乾淨的圖示；素材管理只留「設為目前使用／改名／刪除」；音樂上傳改用真實分支狀態重試，不再誤報失敗。",
  details: {
    "zh-Hant": [
      "開場影片：每次重新開啟 App 或網站都會播放（同一次瀏覽內換頁不重播），底部有「跳過」鈕；站主上傳的影片保留原聲，最長 15 秒，上傳時自動在瀏覽器內壓縮（不產生雲端費用）。",
      "聲音鈕：開場與登入頁的聲音控制改為細線喇叭圖示（開／靜音兩態），不再有文字逐字換行溢出螢幕的問題，並與「跳過」鈕同高並排。",
      "素材管理（站主後台）：每支影片只留「設為目前使用」「改名」「刪除」；日夜版、停用、預覽等多餘選項已移除；上傳失敗（檔案超過儲存單檔上限）時改以中文說明原因。",
      "背景音樂：站主上傳曲目時，改以最新的分支狀態自動重試，修正「曲目保存失敗」的假失敗；頁面切到背景時暫停音樂，起始音量放輕。",
    ],
    en: [
      "Opening video: it now plays every time the app or site is opened (not again on page changes within the same visit), with a Skip button at the bottom. Owner uploads keep their sound, are capped at 15 seconds and are compressed in the browser at no cloud cost.",
      "Sound button: the opening and login sound control is now a clean line speaker icon (on / muted). The label that used to wrap one character per line off the screen is gone, and the button sits level with Skip.",
      "Media manager (owner console): each video now offers only Set as current, Rename and Delete; the day/night, disable and preview options were removed; when an upload exceeds the storage per-file limit the reason is explained in plain language.",
      "Background music: owner track uploads now retry against the live branch state, fixing the false 'track save failed' error; music pauses when the page goes to the background and starts at a softer volume.",
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
