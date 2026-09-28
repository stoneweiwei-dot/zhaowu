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
  version: "ZW-WEB-2026.09.28-r221",
  updateNumber: 221,
  publishedAt: "2026-09-28T00:00:00+10:00",
  latestSummary: "整合首頁視覺：統一揭示卡片、探索區塊與功能卡格局，依宋代美學框架確立金色鉛字層次、深松綠左邊線、琥珀羊皮紙底色，消除多補丁衝突。",
  details: {
    "zh-Hant": [
      "在 `zhaowu-design-system.css` 末尾新增 r221 整合區塊，統一首頁 `/` 路由的整體視覺。修正內容：英雄標題區（`zhaowu-home-lead`）恢復宋代書籍排版感，上下細線 + 金色小標 + 置中正文；揭示卡（`zhaowu-home-disclosure`）改為深松綠左邊線（3px）、溫暖羊皮紙底色、細緻陰影，取代多個補丁互相衝突的邊框設定；「今日」區塊在開啟時使用松綠色邊線強調；「延伸內容」標籤套用與標題相同的金色鉛字格式；功能測驗格（`zhaowu-home-fun-card`）在 480px 以上顯示雙欄，每張卡片使用宋式羊皮紙底色 + 丹紅色箭頭；夜間模式保持紙面卡片淺色底，不強制覆蓋全局 ink 變數。",
    ],
    en: [
      "Added r221 consolidation block at the end of `zhaowu-design-system.css` to unify the visual appearance of the `/` homepage route, eliminating the 'dog-skin plaster' look from conflicting CSS patch files. Changes: hero header (`zhaowu-home-lead`) restored to Song editorial style with hairline borders, gold kicker text, and centred serif h1; disclosure cards (`zhaowu-home-disclosure`) now use a 3px deep-pine-green left accent stripe, warm parchment background, and subtle shadow instead of conflicting !important overrides from five patch files; Today section gets jade accent in open state; explore-section label styled as gold kicker; fun-card grid switches to two columns at ≥480px with Song parchment cards and cinnabar arrows; night mode keeps paper surfaces light — no root-level ink variable override.",
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
