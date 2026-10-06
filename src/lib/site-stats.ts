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
  version: "ZW-WEB-2026.10.06-r224",
  updateNumber: 224,
  publishedAt: "2026-10-06T20:16:00+11:00",
  latestSummary: "更新頁改為逐次記錄網站改動，不再停在單一版本；補回近日首頁、報告、後台、PWA 與圖庫變化。開場影片已整理名稱，並將「雙生並蒂蓮」設為目前版本。",
  summary: {
    "zh-Hant": "更新頁改為逐次記錄網站改動，不再停在單一版本；補回近日首頁、報告、後台、PWA 與圖庫變化。開場影片已整理名稱，並將「雙生並蒂蓮」設為目前版本。",
    "zh-Hans": "更新页改为逐次记录网站改动，不再停在单一版本；补回近日首页、报告、后台、PWA 与图库变化。开场影片已整理名称，并将「双生并蒂莲」设为目前版本。",
    en: "The updates page now records site changes as they happen instead of freezing at one release. Recent home, report, owner-console, PWA and gallery changes have been backfilled, and Twin Lotus is now the selected opening video.",
  },
  details: {
    "zh-Hant": [
      "更新紀錄：今後每次網站功能、視覺、站主後台或正式 runtime 有實際改動，都必須在同一個變更加入公開紀錄；CI 會阻止漏寫。",
      "開場影片：後台素材改成可讀名稱；目前使用「雙生並蒂蓮｜主版」MP4，其他影片保留作備用，沒有刪除原檔。",
      "近日改動：已補入手機首頁與五行版面、站主批次操作、Instagram／Threads 發布器、報告手機版、PWA 自癒、宋式圖庫分組與正式圖像品質門檻等變化。",
      "版本機制：正式 rN 仍可按一個完整發布批次更新；但「每次改動」清單會跟著實際產品變化走，不再等 release_history 才顯示。",
    ],
    "zh-Hans": [
      "更新记录：今后每次网站功能、视觉、站主后台或正式 runtime 有实际改动，都必须在同一个变更加入公开记录；CI 会阻止漏写。",
      "开场影片：后台素材改成可读名称；目前使用「双生并蒂莲｜主版」MP4，其他影片保留作备用，没有删除原档。",
      "近日改动：已补入手机首页与五行版面、站主批量操作、Instagram／Threads 发布器、报告手机版、PWA 自愈、宋式图库分组与正式图像质量门槛等变化。",
      "版本机制：正式 rN 仍可按一个完整发布批次更新；但「每次改动」清单会跟着实际产品变化走，不再等 release_history 才显示。",
    ],
    en: [
      "Change history: every real change to site features, visuals, the owner console or production runtime must now add a public note in the same change; CI blocks omissions.",
      "Opening video: owner media now has readable names. Twin Lotus (main MP4) is selected, while every other clip remains available as a fallback and no original was deleted.",
      "Recent changes have been backfilled, including the mobile home/five-element layout, owner bulk actions, Instagram/Threads publisher, report mobile cleanup, PWA self-heal, Song gallery grouping and formal-art QC.",
      "Release numbering can still move in vetted batches, but the Every change list follows actual product changes and no longer waits for release_history before showing them.",
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

/**
 * Owner 2026-10-01: ~92% of the stored "visits" came from automated browsers (every CI / production-smoke
 * Playwright context is a fresh visitor with a new key, and CI loads the app against the live counter).
 * Automated browsers are therefore never counted. navigator.webdriver is true for Playwright/Selenium/
 * Puppeteer; the UA check covers headless Chrome variants that do not set it.
 */
export function isAutomatedBrowser(nav: Pick<Navigator, "webdriver" | "userAgent"> | undefined = typeof navigator === "undefined" ? undefined : navigator) {
  if (!nav) return false;
  if (nav.webdriver) return true;
  return /HeadlessChrome|PhantomJS|Playwright|Puppeteer|Lighthouse/i.test(nav.userAgent || "");
}

export async function recordVisit() {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === "undefined") return;
  if (isAutomatedBrowser()) return;
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
