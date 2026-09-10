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
import { BRAND_ASSETS } from "@/lib/brand-assets";

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
  return new Intl.DateTimeFormat(intlTagFor(language), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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
  const isLogin = pathname === "/login";
  const [stats, setStats] = useState<PublicSiteStats>(EMPTY_STATS);

  useEffect(() => {
    hydrateLocale();
    hydrateDisplayLanguage();
    hydrateBrandTheme();
    runLocalHousekeeping();
    let alive = true;
    void recordVisit()
      .catch(() => undefined)
      .finally(() => {
        void getPublicSiteStats()
          .then((value) => { if (alive) setStats(value); })
          .catch(() => undefined);
      });
    return () => { alive = false; };
  }, []);

  const releaseDate = formatReleaseDate(stats.publishedAt, language);
  const releaseSummary = releaseSummaryForLanguage(stats.latestSummary, stats.version, language);
  const numberLocale = intlTagFor(language);
  const languageOptions = [
    { value: "en" as const, label: "English", aria: "English" },
    { value: "zh-Hans" as const, label: "简体", aria: "简体中文" },
    { value: "zh-Hant" as const, label: "繁體", aria: "繁體中文" },
    { value: "ja" as const, label: "日本語", aria: "日本語" },
    { value: "ko" as const, label: "한국어", aria: "한국어" },
    { value: "hi" as const, label: "हिन्दी", aria: "हिन्दी" },
  ];

  const updateLabel = displayText(language, "累計更新", "累计更新", "Updates", "更新", "누적 업데이트", "कुल अपडेट");
  const todayLabel = displayText(language, "今日", "今日", "Today", "本日", "오늘", "आज");
  const totalLabel = displayText(language, "累計訪問", "累计访问", "Total visits", "累計訪問", "누적 방문", "कुल विज़िट");
  const latestLabel = displayText(language, "最新更新 ＋", "最新更新 ＋", "Latest update ＋", "最新更新 ＋", "최신 업데이트 ＋", "नवीनतम अपडेट ＋");
  const siteControlsLabel = displayText(language, "網站控制", "网站控制", "Site controls", "サイト操作", "사이트 메뉴", "साइट नियंत्रण");
  const galleryLabel = displayText(language, "圖庫", "图库", "Gallery", "ギャラリー", "갤러리", "गैलरी");
  const openGalleryLabel = displayText(language, "打開圖庫", "打开图库", "Open Gallery", "ギャラリーを開く", "갤러리 열기", "गैलरी खोलें");
  const homeProductLabel = displayText(language, "四柱八字", "四柱八字", "BaZi", "四柱推命", "사주팔자", "BaZi");
  const dayModeLabel = displayText(language, "切換日間模式", "切换日间模式", "Switch to day mode", "昼モードに切り替える", "주간 모드로 전환", "दिन मोड पर जाएँ");
  const nightModeLabel = displayText(language, "切換夜間模式", "切换夜间模式", "Switch to night mode", "夜モードに切り替える", "야간 모드로 전환", "रात मोड पर जाएँ");

  return (
    <div className={`relative min-h-dvh bg-transparent text-ink ${!isLogin ? "zhaowu-home-sheet-shell" : ""} ${isLogin ? "zhaowu-login-shell overflow-auto" : "overflow-x-hidden"}`}>
      {!isLogin ? (
        <header className="zhaowu-site-header sticky top-0 z-30">
          <div className="zhaowu-header-shell mx-auto max-w-5xl px-3 py-2 sm:px-4">
            <div className="mb-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-line/50 pb-1 text-[11px] leading-4 text-ink-mute" data-site-status-strip>
              <span data-site-release>
                {stats.version} · {updateLabel} {stats.updateNumber}{releaseDate ? ` · ${releaseDate}` : ""}
              </span>
              <span>
                {todayLabel} {stats.todayVisits.toLocaleString(numberLocale)} · {totalLabel} {stats.totalVisits.toLocaleString(numberLocale)}
              </span>
              <details className="group basis-full text-center" data-latest-change-report>
                <summary className="cursor-pointer list-none font-medium text-ink-soft [&::-webkit-details-marker]:hidden">
                  {latestLabel}
                </summary>
                <p className="mx-auto mt-1 max-w-2xl px-2 text-center leading-5">{releaseSummary}</p>
              </details>
            </div>

            <div className="zhaowu-header-primary">
              <Link to="/" className="zhaowu-brand-link text-ink" aria-label={t("brand")}>
                <BrandSeal />
                <span className="zhaowu-brand-copy">
                  <span className="zhaowu-brand-name font-display">{t("brand")}</span>
                  <span className="zhaowu-brand-tagline">{t("tagline")}</span>
                </span>
              </Link>

              <div className="zhaowu-header-account-actions">
                <button
                  type="button"
                  className="zhaowu-theme-toggle"
                  onClick={toggle}
                  aria-pressed={night}
                  aria-label={night ? dayModeLabel : nightModeLabel}
                >
                  <BrandIcon name={night ? "day" : "night"} />
                </button>
                {user?.isOwner ? (
                  <Link to="/gallery" className="zhaowu-header-utility zhaowu-header-gallery" aria-label={openGalleryLabel}>
                    {galleryLabel}
                  </Link>
                ) : null}
                {isPending ? (
                  <span className="zhaowu-header-pending" />
                ) : user ? (
                  <>
                    <Link to="/account" className="zhaowu-header-utility">
                      <BrandIcon name="account" />
                      {user.isOwner ? t("navAdmin") : t("navMine")}
                    </Link>
                    <button type="button" onClick={() => void signOut()} className="zhaowu-header-utility zhaowu-header-signout">
                      {authEnabled ? t("logout") : user.displayName}
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="zhaowu-header-login">
                    <BrandIcon name="login" />
                    {t("navLogin")}
                  </Link>
                )}
              </div>
            </div>

            <nav className="zhaowu-header-nav" aria-label={siteControlsLabel}>
              <div
                role="group"
                aria-label={t("language")}
                className="site-lang-group"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  maxWidth: "100%",
                  overflowX: "auto",
                  padding: 4,
                  border: "1px solid rgba(196,160,90,.62)",
                  borderRadius: 999,
                  background: night ? "rgba(15,32,28,.72)" : "rgba(250,248,241,.76)",
                  boxShadow: "0 6px 18px rgba(60,46,28,.06)",
                  backdropFilter: "blur(9px)",
                  WebkitBackdropFilter: "blur(9px)",
                }}
              >
                <span aria-hidden="true" style={{ display: "grid", placeItems: "center", flex: "0 0 auto", width: 36, height: 40, color: night ? "#d4b074" : "#1f4e3a" }}>
                  <BrandIcon name="language" />
                </span>
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
                      className="site-lang-button"
                      style={{
                        flex: "0 0 auto",
                        minHeight: 40,
                        padding: "0 11px",
                        borderRadius: 999,
                        border: active ? "1px solid #c4a05a" : "1px solid transparent",
                        background: active ? (night ? "rgba(212,176,116,.15)" : "#1f4e3a") : "transparent",
                        color: active ? (night ? "#f1dfba" : "#fffaf0") : (night ? "#e7e0d1" : "#4f4a42"),
                        fontSize: 12,
                        lineHeight: 1,
                        fontWeight: active ? 700 : 600,
                        letterSpacing: value === "en" ? ".04em" : ".01em",
                        whiteSpace: "nowrap",
                        boxShadow: active && !night ? "inset 0 0 0 1px rgba(255,255,255,.08)" : "none",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <Link to="/" aria-current={pathname === "/" ? "page" : undefined} className={`zhaowu-header-home-link ${pathname === "/" ? "is-active" : ""}`}>
                <BrandIcon name="home" />
                {user ? homeProductLabel : t("navHome")}
              </Link>
            </nav>
          </div>
        </header>
      ) : null}

      {!isLogin ? <GreenDragonGuide /> : null}

      <div className={isLogin ? "relative z-10 min-h-dvh" : `zhaowu-app-frame relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-4 sm:pt-8 ${isHome ? "zhaowu-home-app-frame" : ""}`}>
        {children}
      </div>

      {!isLogin ? (
        <footer className="zhaowu-site-footer relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-4 text-center">
          <img className="zhaowu-footer-logo is-day" src={BRAND_ASSETS.logoHorizontal} alt="" width={360} height={96} decoding="async" />
          <img className="zhaowu-footer-logo is-night" src={BRAND_ASSETS.logoHorizontalNight} alt="" width={360} height={96} decoding="async" />
          <p className="font-display text-sm tracking-[0.22em] text-ink-mute">{t("brand")}<span className="ml-2">ZHAOWU</span></p>
        </footer>
      ) : null}
    </div>
  );
}
