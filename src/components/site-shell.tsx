import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandSeal } from "@/components/brand-seal";
import { BrandIcon } from "@/components/brand-icon";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { hydrateLocale, useI18n } from "@/lib/i18n";
import {
  displayText,
  hydrateDisplayLanguage,
  intlTagFor,
  useDisplayLanguage,
  type DisplayLanguage,
} from "@/lib/display-language";
import { getPublicSiteStats, recordVisit, SITE_RELEASE_FALLBACK, type PublicSiteStats } from "@/lib/site-stats";
import { SiteUtilityDock } from "@/components/site-utility-dock";
import { IntroGate } from "@/components/intro-gate";
import { runLocalHousekeeping } from "@/lib/local-housekeeping";
import { applyBrandTheme, hydrateBrandTheme, NIGHT_MODE_ENABLED, useBrandTheme } from "@/lib/brand-theme";
import { backgroundPublicUrl, chooseDailyBackground, listPublicBackgrounds } from "@/lib/background-assets";

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

const PRIVATE_ROUTES = ["/login", "/account", "/history", "/auth", "/gallery", "/social"];
const SELF_CANONICAL_ROUTES = ["/", "/knowledge", "/knowledge/five-elements-tone-qi", "/knowledge/shushu-boundary", "/knowledge/system-map", "/updates", "/daily-colors"];

function updateMeta(selector: string, content: string) {
  const node = document.querySelector<HTMLMetaElement>(selector);
  if (node) node.content = content;
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
  const { night } = useBrandTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const isLogin = pathname === "/login" || pathname === "/auth/callback";
  const isOwnerWorkspace = Boolean(user?.isOwner && (pathname === "/account" || pathname === "/gallery" || pathname === "/social"));
  const [stats, setStats] = useState<PublicSiteStats>(EMPTY_STATS);
  const [wallpaperUrl, setWallpaperUrl] = useState("");

  useEffect(() => {
    if (isLogin) {
      setWallpaperUrl("");
      return;
    }
    let alive = true;
    const refreshWallpaper = async () => {
      try {
        const assets = await listPublicBackgrounds();
        if (!alive) return;
        const selected = chooseDailyBackground(assets);
        if (!selected) {
          setWallpaperUrl("");
          return;
        }
        const cdn = String(selected.cdn_url ?? "").trim();
        setWallpaperUrl(cdn.startsWith("https://") ? cdn : backgroundPublicUrl(selected.storage_path));
      } catch {
        if (alive) setWallpaperUrl("");
      }
    };
    void refreshWallpaper();
    const onBackgroundChange = () => { void refreshWallpaper(); };
    window.addEventListener("zhaowu-background-change", onBackgroundChange);
    return () => {
      alive = false;
      window.removeEventListener("zhaowu-background-change", onBackgroundChange);
    };
  }, [isLogin]);

  const shellStyle = wallpaperUrl
    ? ({ ["--zhaowu-shell-wallpaper" as string]: `url(${JSON.stringify(wallpaperUrl)})` } as CSSProperties)
    : undefined;

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
  // Korean and Hindi remain implemented in the codebase but are intentionally
  // hidden from the public language selector until they are reactivated.
  const languageOptions = [
    { value: "zh-Hant" as const, label: "繁體", short: "繁", aria: "繁體中文" },
    { value: "zh-Hans" as const, label: "简体", short: "简", aria: "简体中文" },
    { value: "en" as const, label: "English", short: "EN", aria: "English" },
  ];

  const updateLabel = displayText(language, "累計更新", "累计更新", "Updates", "更新", "누적 업데이트", "कुल अपडेट");
  const todayLabel = displayText(language, "今日", "今日", "Today", "本日", "오늘", "आज");
  const totalLabel = displayText(language, "累計訪問", "累计访问", "Total visits", "累計訪問", "누적 방문", "कुल विज़िट");
  // Owner 2026-10-01: view counts must be visible. The header strip that used to carry them is hidden by the
  // layout system, so they live in the page footer (existing counter/RPC unchanged).
  const viewsTodayLabel = displayText(language, "今日瀏覽", "今日浏览", "Views today", "本日の閲覧", "오늘 조회", "आज के दृश्य");
  const viewsTotalLabel = displayText(language, "累計瀏覽", "累计浏览", "Total views", "累計閲覧", "누적 조회", "कुल दृश्य");
  const latestLabel = displayText(language, "最新更新", "最新更新", "Latest update", "最新更新", "최신 업데이트", "नवीनतम अपडेट");
  const siteControlsLabel = displayText(language, "網站控制", "网站控制", "Site controls", "サイト操作", "사이트 메뉴", "साइट नियंत्रण");
  const galleryLabel = displayText(language, "圖庫", "图库", "Gallery", "ギャラリー", "갤러리", "गैलरी");
  const openGalleryLabel = displayText(language, "打開圖庫", "打开图库", "Open Gallery", "ギャラリーを開く", "갤러리 열기", "गैलरी खोलें");
  const dayModeLabel = displayText(language, "切換日間模式", "切换日间模式", "Switch to day mode", "昼モードに切り替える", "주간 모드로 전환", "दिन मोड पर जाएँ");
  const nightModeLabel = displayText(language, "切換夜間模式", "切换夜间模式", "Switch to night mode", "夜モードに切り替える", "야간 모드로 전환", "रात मोड पर जाएँ");
  const ownerLoginLabel = displayText(language, "站主登入", "站主登录", "Owner sign-in", "站主ログイン", "관리자 로그인", "मालिक लॉगिन");
  const homeLoginLabel = displayText(language, "登入", "登录", "Login", "ログイン", "로그인", "लॉगिन");
  const languageVisualLabel = displayText(language, "語言", "语言", "Language", "言語", "언어", "भाषा");
  const skipLabel = displayText(language, "跳到主要內容", "跳到主要内容", "Skip to main content", "本文へ移動", "본문으로 이동", "मुख्य सामग्री पर जाएँ");

  useEffect(() => {
    const title = displayText(
      language,
      "昭梧｜八字排盤・子平八字・真太陽時・流年運勢｜免登入免費",
      "昭梧｜八字排盘・子平八字・真太阳时・流年运势｜免登录免费",
      "ZHAOWU｜Free BaZi Chart · Four Pillars · True Solar Time · Annual Luck · No Sign-up",
      "ZHAOWU｜出生情報から読むパーソナル命書",
      "ZHAOWU｜출생 정보로 읽는 개인 명서",
      "ZHAOWU｜जन्म विवरण से व्यक्तिगत Destiny Book",
    );
    const description = displayText(
      language,
      "免登入免費八字排盤：依子平八字與真太陽時校正，整理五行旺衰、大運與流年運勢、今日提示。",
      "免登录免费八字排盘：依子平八字与真太阳时校正，整理五行旺衰、大运与流年运势、今日提示。",
      "Free BaZi (Four Pillars) chart with true solar time correction: five-element balance, luck cycles, annual luck and daily guidance. No sign-up needed.",
      "四柱推命を中心に、命盤・人生の流れ・今日の指針を整理するパーソナル命書。",
      "사주를 중심으로 명식, 삶의 흐름, 오늘의 안내를 정리하는 개인 명서.",
      "BaZi आधारित व्यक्तिगत Destiny Book, जिसमें जन्म-चार्ट, जीवन-लय और दैनिक मार्गदर्शन शामिल है।",
    );

    document.title = title;
    updateMeta('meta[name="description"]', description);
    updateMeta('meta[property="og:title"]', title);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[name="twitter:title"]', title);
    updateMeta('meta[name="twitter:description"]', description);
    updateMeta(
      'meta[property="og:locale"]',
      language === "en" ? "en_AU" : language === "zh-Hans" ? "zh_CN" : "zh_TW",
    );
  }, [language]);

  // SEO: private/account routes are noindex; sitemap-listed public routes self-canonicalise, everything else keeps "/".
  useEffect(() => {
    const origin = "https://stone-zhaowu-official.vercel.app";
    const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
    const isPrivate = PRIVATE_ROUTES.some((route) => normalized === route || normalized.startsWith(`${route}/`));
    const canonicalPath = SELF_CANONICAL_ROUTES.includes(normalized) ? normalized : "/";
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${origin}${canonicalPath === "/" ? "/" : canonicalPath}`;
    updateMeta('meta[property="og:url"]', `${origin}${canonicalPath}`);
    updateMeta('meta[name="robots"]', isPrivate ? "noindex,nofollow" : "index,follow");
  }, [pathname]);

  return (
    <div style={shellStyle} className={`relative min-h-dvh bg-transparent text-ink ${!isLogin ? "zhaowu-home-sheet-shell" : ""} ${isHome ? "zhaowu-route-home" : ""} ${isLogin ? "zhaowu-login-shell overflow-auto" : "overflow-x-hidden"}`}>
      <a className="zhaowu-skip-link" href="#zhaowu-main-content">{skipLabel}</a>
      {isHome ? <IntroGate /> : null}
      {!isLogin ? (
        <header className={`zhaowu-site-header sticky top-0 z-30${isHome ? " is-home-compact" : ""}`}>
          <div className="zhaowu-header-shell mx-auto max-w-5xl px-3 py-2 sm:px-4">
            {!isOwnerWorkspace ? (
              <div className="mb-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-line/50 pb-1 text-[11px] leading-4 text-ink-mute" data-site-status-strip>
                {!isHome ? (
                  <>
                    <span data-site-release>{stats.version} · {updateLabel} {stats.updateNumber}{releaseDate ? ` · ${releaseDate}` : ""}</span>
                    <span>{todayLabel} {stats.todayVisits.toLocaleString(numberLocale)} · {totalLabel} {stats.totalVisits.toLocaleString(numberLocale)}</span>
                  </>
                ) : null}
                <Link to="/updates" className="zhaowu-latest-update-link" data-latest-change-report aria-label={`${latestLabel}：${releaseSummary}`}>
                  <span>{latestLabel}</span><span aria-hidden="true">›</span>
                </Link>
              </div>
            ) : null}

            {!isHome ? (
              <div className="zhaowu-header-primary">
                <Link to="/" className="zhaowu-brand-link text-ink" aria-label={t("brand")}>
                <BrandSeal />
                <span className="zhaowu-brand-copy">
                  <span className="zhaowu-brand-name font-display" aria-hidden="true">{t("brand")}</span>
                  <span className="zhaowu-brand-tagline">{t("tagline")}</span>
                </span>
              </Link>

              <div className="zhaowu-header-account-actions">
                {user?.isOwner && pathname !== "/gallery" ? <Link to="/gallery" className="zhaowu-header-utility zhaowu-header-gallery" aria-label={openGalleryLabel}>{galleryLabel}</Link> : null}
                {isPending ? <span className="zhaowu-header-pending" /> : user ? <>
                  {(!user.isOwner || pathname !== "/account") ? <Link to="/account" className="zhaowu-header-utility"><BrandIcon name="account" />{user.isOwner ? t("navAdmin") : t("navMine")}</Link> : null}
                  <button type="button" onClick={() => void signOut()} className="zhaowu-header-utility zhaowu-header-signout">{t("logout")}</button>
                </> : (
                  <Link
                    to="/login"
                    className="zhaowu-header-utility zhaowu-header-owner-login"
                    aria-label={ownerLoginLabel}
                    data-owner-login-entry="true"
                  >
                    <BrandIcon name="account" />
                    {ownerLoginLabel}
                  </Link>
                )}
              </div>
              </div>
            ) : null}

            <nav className={`zhaowu-header-nav${isHome ? " is-home-entry-row" : ""}`} aria-label={siteControlsLabel}>
              <div role="group" aria-label={t("language")} className="site-lang-group">
                <span className="zhaowu-language-label">
                  <BrandIcon name="language" />
                  <span>{languageVisualLabel}</span>
                </span>
                {languageOptions.map(({ value, label, short, aria }) => {
                  const active = language === value;
                  return <button key={value} type="button" onClick={() => setLanguage(value)} aria-label={aria} aria-pressed={active} data-active={active ? "true" : "false"} className="site-lang-button">{isHome ? short : label}</button>;
                })}
              </div>

              {isHome ? (
                isPending ? <span className="zhaowu-home-login-inline is-pending" aria-hidden="true" /> :
                user?.isOwner ? (
                  <Link to="/account" className="zhaowu-home-login-inline" aria-label={t("navAdmin")}>
                    <BrandIcon name="account" />
                    <span>{displayText(language, "後台", "后台", "Console", "管理", "관리", "कंसोल")}</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="zhaowu-home-login-inline"
                    aria-label={ownerLoginLabel}
                    data-owner-login-entry="true"
                  >
                    <BrandIcon name="account" />
                    <span>{homeLoginLabel}</span>
                  </Link>
                )
              ) : null}

              {NIGHT_MODE_ENABLED ? <div className="zhaowu-header-mode-toggle" role="group" aria-label={language === "en" ? "Appearance" : "日夜模式"}>
                <button type="button" onClick={() => applyBrandTheme("day")} aria-pressed={!night} aria-label={dayModeLabel} data-active={!night ? "true" : "false"}>{displayText(language, "日", "日", "Day", "日", "낮", "दिन")}</button>
                <button type="button" onClick={() => applyBrandTheme("night")} aria-pressed={night} aria-label={nightModeLabel} data-active={night ? "true" : "false"}>{displayText(language, "夜", "夜", "Night", "夜", "밤", "रात")}</button>
              </div> : null}
            </nav>
          </div>
        </header>
      ) : null}

      {!isOwnerWorkspace ? <SiteUtilityDock /> : null}
      <div id="zhaowu-main-content" tabIndex={-1} className={isLogin ? "relative z-10 min-h-dvh" : `zhaowu-app-frame relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-4 sm:pt-8 ${isHome ? "zhaowu-home-app-frame" : ""}`}>{children}</div>

      {!isLogin && !isOwnerWorkspace ? <footer className="zhaowu-site-footer zhaowu-site-footer--minimal relative z-10 mx-auto max-w-5xl px-4 pb-8 pt-2 text-center">
        {stats.totalVisits > 0 ? (
          <p className="zhaowu-site-views" data-site-views aria-label={`${viewsTodayLabel} ${stats.todayVisits.toLocaleString(numberLocale)}，${viewsTotalLabel} ${stats.totalVisits.toLocaleString(numberLocale)}`}>
            <span>{viewsTodayLabel} <b>{stats.todayVisits.toLocaleString(numberLocale)}</b></span>
            <i aria-hidden="true" />
            <span>{viewsTotalLabel} <b>{stats.totalVisits.toLocaleString(numberLocale)}</b></span>
          </p>
        ) : null}
        <p className="font-display text-xs tracking-[0.22em] text-ink-mute">{t("brand")}<span className="ml-2">ZHAOWU</span></p>
      </footer> : null}
    </div>
  );
}
