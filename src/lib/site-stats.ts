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

/**
 * PLACEHOLDER legacy cumulative visit count from before the database migration.
 * Not a verified figure — 日曜 will confirm the real legacy total later.
 */
export const LEGACY_VISITS_BASE = 32_000;

export function getDisplayedTotalVisits(newDbCount: number | null | undefined = 0): number {
  const safeNewCount = typeof newDbCount === "number" && Number.isFinite(newDbCount) && newDbCount > 0
    ? Math.floor(newDbCount)
    : 0;
  return LEGACY_VISITS_BASE + safeNewCount;
}

export function formatCumulativeVisits(total: number, language: string): string {
  const safeTotal = Number.isFinite(total) && total >= 0 ? Math.floor(total) : LEGACY_VISITS_BASE;
  const formatWan = (value: number) => {
    const rounded = Math.round((value / 10_000) * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  };

  if (language === "zh-Hans") {
    if (safeTotal >= 10_000) {
      return `累计 ${formatWan(safeTotal)} 万人次`;
    }
    return `累计 ${safeTotal.toLocaleString("zh-CN")} 人次`;
  }

  if (language === "zh-Hant") {
    if (safeTotal >= 10_000) {
      return `累計 ${formatWan(safeTotal)} 萬人次`;
    }
    return `累計 ${safeTotal.toLocaleString("zh-TW")} 人次`;
  }

  if (language === "ja") {
    if (safeTotal >= 10_000) {
      return `累計 ${formatWan(safeTotal)} 万回訪問`;
    }
    return `累計 ${safeTotal.toLocaleString("ja-JP")} 回訪問`;
  }

  if (language === "ko") {
    if (safeTotal >= 10_000) {
      return `누적 ${formatWan(safeTotal)}만 회 방문`;
    }
    return `누적 ${safeTotal.toLocaleString("ko-KR")}회 방문`;
  }

  return `${safeTotal.toLocaleString("en-US")}+ visits`;
}

export const SITE_RELEASE_FALLBACK = {
  version: "ZW-WEB-2026.11.11-r228",
  updateNumber: 228,
  publishedAt: "2026-11-11T00:00:00.000Z",
  latestSummary: "精簡此時天象頁面並保留太陽系互動示意圖，頁尾常駐顯示累計到訪人次，並補齊近期網站更新紀錄。",
  summary: {
    "zh-Hant": "精簡此時天象頁面並保留太陽系互動示意圖，頁尾常駐顯示累計到訪人次，並補齊近期網站更新紀錄。",
    "zh-Hans": "精简此时天象页面并保留太阳系互动示意图，页尾常驻显示累计到访人次，并补齐近期网站更新记录。",
    en: "Streamlined The Sky Now around the interactive solar system illustration, kept cumulative visit totals always visible in the footer, and brought the public release log up to date."
  },
  details: {
    "zh-Hant": [
      "此時天象保留上方太陽系互動示意圖，移除下方重複的天象運行轉盤，讓星象重點與觀測紀錄更清晰。",
      "頁尾常駐顯示包含既有歷史基數的累計到訪人次，並依繁中、簡中與英文自然格式化。",
      "更新紀錄頁補齊首頁四主塊收合、九語切換選單、悉尼自動七十二候、手機縮放滑動提示與站主 Face ID 穩定性等近期正式更新。"
    ],
    "zh-Hans": [
      "此时天象保留上方太阳系互动示意图，移除下方重复的天象运行转盘，让星象重点与观测记录更清晰。",
      "页尾常驻显示包含既有历史基数的累计到访人次，并依繁中、简中与英文自然格式化。",
      "更新记录页补齐首页四主块收合、九语切换菜单、悉尼自动七十二候、手机缩放滑动提示与站主 Face ID 稳定性等近期正式更新。"
    ],
    en: [
      "Kept the upper interactive solar system illustration on The Sky Now and removed the lower duplicate motion dial for cleaner reading.",
      "Made cumulative visit totals always visible in the footer by combining the historical baseline with live counts in locale-appropriate formats.",
      "Updated the public change log with the collapsible four-block homepage, nine-language switcher, Sydney auto 72 micro-seasons panel, mobile zoom/swipe cues and owner Face ID sign-in improvements."
    ]
  }
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
      publicFetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.visitor_count&select=value&limit=1`, { headers: publicHeaders() }).catch(() => null),
      publicFetch(`${SUPABASE_URL}/rest/v1/release_history?select=version,update_number,published_at,notes&order=update_number.desc.nullslast,published_at.desc&limit=1`, { headers: publicHeaders() }).catch(() => null),
    ]);

    if (!settingsRes?.ok && !releaseRes?.ok) return fallbackStats();

    const settings = settingsRes?.ok
      ? (await settingsRes.json() as { value?: { total?: number; today?: number } }[])
      : [];
    const releases = releaseRes?.ok
      ? (await releaseRes.json() as { version?: string; update_number?: number; published_at?: string; notes?: { summary?: string } }[])
      : [];
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
