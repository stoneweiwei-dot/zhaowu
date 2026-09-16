import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandSeal } from "@/components/brand-seal";
import { BrandIcon } from "@/components/brand-icon";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hydrateLocale, useI18n } from "@/lib/i18n";
import {
  displayText,
  hydrateDisplayLanguage,
  intlTagFor,
  useDisplayLanguage,
  type DisplayLanguage,
} from "@/lib/display-language";
import { getPublicSiteStats, recordVisit, SITE_RELEASE_FALLBACK, type PublicSiteStats } from "@/lib/site-stats";
import { GreenDragonGuide } from "@/components/green-dragon-guide";
import { runLocalHousekeeping } from "@/lib/local-housekeeping";
import { hydrateBrandTheme, useBrandTheme } from "@/lib/brand-theme";

const EMPTY_STATS: PublicSiteStats = {
  totalVisits: 0,
  todayVisits: 0,
  version: SITE_RELEASE_FALLBACK.version,
  updateNumber: SITE_RELEASE_FALLBACK.updateNumber,
  publishedAt: SITE_RELEASE_FALLBACK.publishedAt,
  latestSummary: SITE_RELEASE_FALLBACK.latestSummary,
};

function formatReleaseDate(value: string | null, language: DisplayLanguage) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(intlTagFor(language), { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function releaseSummaryForLanguage(summary: string, version: string, language: DisplayLanguage) {
  if (language === "zh-Hant" || language === "zh-Hans") return summary;
  if (language === "ja") return `最新の本番更新：${version} には、現在のUI・コンテンツ・安定性に関する修正が含まれています。`;
  if (language === "ko") return `최신 프로덕션 업데이트: ${version}에는 현재 UI, 콘텐츠 및 안정성 수정 사항이 포함되어 있습니다.`;
  if (language === "hi") return `नवीनतम प्रोडक्शन अपडेट: ${version} में वर्तमान इंटरफ़ेस, सामग्री और स्थिरता से जुड़े सुधार शामिल हैं।`;
  if (!/[\u3400-\u9fff]/u.test(summary)) return summary;
  return `Latest production update: ${version} includes the current interface, content and reliability fixes.`;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { language, setLanguage } = useDisplayLanguage();
  const { user, isPending } = useCurrentUserState();
  const { night, toggle } = useBrandTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const isLogin = pathname === "/login" || pathname === "/auth/callback";
  const [stats, setStats] = useState<PublicSiteStats>(EMPTY_STATS);

  useEffect(() => {
    hydrateLocale();
    hydrateDisplayLanguage();
    hydrateBrandTheme();
    runLocalHousekeeping();
    let alive = true;
    void recordVisit().catch(() => undefined).finally(() => {
      void getPublicSiteStats().then((value) => { if (alive) setStats(value); }).catch(() => undefined);
    });
    return () => { alive = false; };
  }, []);

  const releaseDate = formatReleaseDate(stats.publishedAt, language);
  const releaseSummary = releaseSummaryForLanguage(stats.latestSummary, stats.version, language);
  const numberLocale = intlTagFor(language);
  const languageOptions = [
    { value: "en" as const, label: "English", aria: "English" },
    { value: "zh-Hant" as const, label: "繁體", aria: "繁體中文" },
    { value: "ko" as const, label: "한국어", aria: "한국어" },
    { value: "hi" as const, label: "हिन्दी", aria: "हिन्दी" },
  ];

  const updateLabel = displayText(language, "累計更新", "累计更新", "Updates", "更新", "누적 업데이트", "कुल अपडेट");
  const todayLabel = displayText(language, "今日", "今日", "Today", "本日", "오늘", "आज");
  const totalLabel = displayText(language, "累計訪問", "累计访问", "Total visits", "累計訪問", "누적 방문", "कुल विज़िट");
  const latestLabel = displayText(language, "本次更新", "本次更新", "What changed", "今回の更新", "이번 업데이트", "इस अपडेट में");
  const siteControlsLabel = displayText(language, "網站控制", "网站控制", "Site controls", "サイト操作", "사이트 메뉴", "साइट नियंत्रण");
  const galleryLabel = displayText(language, "圖庫", "图库", "Gallery", "ギャラリー", "갤러리", "गैलरी");
  const openGalleryLabel = displayText(language, "打開圖庫", "打开图库", "Open Gallery", "ギャラリーを開く", "갤러리 열기", "गैलरी खोलें");
  const dayModeLabel = displayText(language, "切換日間模式", "切换日间模式", "Switch to day mode", "昼モードに切り替える", "주간 모드로 전환", "दिन मोड पर जाएँ");
  const nightModeLabel = displayText(language, "切換夜間模式", "切换夜间模式", "Switch to night mode", "夜モードに切り替える", "야간 모드로 전환", "रात मोड पर जाएँ");

  return (
    <div className={`relative min-h-dvh bg-transparent text-ink ${!isLogin ? "zhaowu-home-sheet-shell" : ""} ${isLogin ? "zhaowu-login-shell overflow-auto" : "overflow-x-hidden"}`}>
      {!isLogin ? (
        <header className="zhaowu-site-header sticky top-0 z-30">
          <div className="zhaowu-header-shell">
            <div className="zhaowu-status-strip" data-site-status-strip>
              <span className="zhaowu-status-release" data-site-release>
                {stats.version} · {updateLabel} {stats.updateNumber}{releaseDate ? ` · ${releaseDate}` : ""}
              </span>
              <span className="zhaowu-status-visits">
                {todayLabel} {stats.todayVisits.toLocaleString(numberLocale)} · {totalLabel} {stats.totalVisits.toLocaleString(numberLocale)}
              </span>
              <details className="zhaowu-status-details" data-latest-change-report>
                <summary>{latestLabel}</summary>
                <p>{releaseSummary}</p>
              </details>
            </div>

            <div className="zhaowu-header-primary">
              <Link to="/" className="zhaowu-brand-link" aria-label={t("brand")}>
                <BrandSeal />
                <span className="zhaowu-brand-copy">
                  <span className="zhaowu-brand-name" aria-hidden="true">{t("brand")}</span>
                  <span className="zhaowu-brand-tagline">{t("tagline")}</span>
                </span>
              </Link>

              <div className="zhaowu-header-account-actions">
                {user?.isOwner ? <Link to="/gallery" className="zhaowu-header-utility zhaowu-header-gallery" aria-label={openGalleryLabel}>{galleryLabel}</Link> : null}
                {isPending ? <span className="zhaowu-header-pending" /> : user ? <>
                  <Link to="/account" className="zhaowu-header-utility"><BrandIcon name="account" />{user.isOwner ? t("navAdmin") : t("navMine")}</Link>
                  <button type="button" onClick={() => void signOut()} className="zhaowu-header-utility zhaowu-header-signout">{authEnabled ? t("logout") : user.displayName}</button>
                </> : null}
              </div>
            </div>

            <nav className="zhaowu-header-nav" aria-label={siteControlsLabel}>
              <div role="group" aria-label={t("language")} className="zhaowu-language-switcher">
                <span className="zhaowu-language-icon" aria-hidden="true"><BrandIcon name="language" /></span>
                {languageOptions.map(({ value, label, aria }) => {
                  const active = language === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLanguage(value)}
                      aria-label={aria}
                      aria-pressed={active}
                      data-active={active ? "true" : "false"}
                      className="zhaowu-language-option"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <button type="button" className="zhaowu-theme-toggle zhaowu-header-mode-toggle" onClick={toggle} aria-pressed={night} aria-label={night ? dayModeLabel : nightModeLabel} title={night ? dayModeLabel : nightModeLabel}>
                <BrandIcon name={night ? "day" : "night"} />
              </button>
            </nav>
          </div>
        </header>
      ) : null}

      {!isLogin ? <GreenDragonGuide /> : null}
      <div className={isLogin ? "relative z-10 min-h-dvh" : `zhaowu-app-frame relative z-10 mx-auto ${isHome ? "zhaowu-home-app-frame" : ""}`}>{children}</div>

      {!isLogin ? (
        <footer className="zhaowu-site-footer zhaowu-site-footer--minimal">
          <p>{t("brand")}<span>ZHAOWU</span></p>
        </footer>
      ) : null}
    </div>
  );
}
