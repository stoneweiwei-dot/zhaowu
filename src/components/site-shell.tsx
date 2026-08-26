import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandSeal } from "@/components/brand-seal";
import { SealScatter } from "@/components/marks";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hydrateLocale, useI18n } from "@/lib/i18n";
import { getPublicSiteStats, recordVisit, type PublicSiteStats } from "@/lib/site-stats";
import { backgroundPublicUrl, chooseDailyBackground, listPublicBackgrounds } from "@/lib/background-assets";
import { GreenDragonGuide } from "@/components/green-dragon-guide";

const EMPTY_STATS: PublicSiteStats = {
  totalVisits: 0,
  todayVisits: 0,
  version: "—",
  updateNumber: 0,
  publishedAt: null,
};

const WEEKLY_WALLPAPER_B64_PATH = "/wallpapers/current-weekly.b64";

async function loadWeeklyWallpaper(): Promise<string | null> {
  try {
    const res = await fetch(WEEKLY_WALLPAPER_B64_PATH, { cache: "force-cache" });
    if (!res.ok) return null;
    const b64 = (await res.text()).trim();
    if (!b64 || b64.length < 32) return null;
    return `data:image/jpeg;base64,${b64}`;
  } catch {
    return null;
  }
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/login";
  const [stats, setStats] = useState<PublicSiteStats>(EMPTY_STATS);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  useEffect(() => {
    hydrateLocale();
    let alive = true;

    void recordVisit()
      .catch(() => undefined)
      .finally(() => {
        void getPublicSiteStats()
          .then((value) => { if (alive) setStats(value); })
          .catch(() => undefined);
      });

    const loadBackground = () => {
      void (async () => {
        try {
          const assets = await listPublicBackgrounds();
          if (!alive) return;
          const selected = chooseDailyBackground(assets);
          if (selected) {
            setBackgroundUrl(backgroundPublicUrl(selected.storage_path));
            return;
          }
        } catch {
          // Fall through to the weekly generated fallback.
        }

        const weekly = await loadWeeklyWallpaper();
        if (!alive) return;
        setBackgroundUrl(weekly ?? "/wallpaper-song.jpg");
      })();
    };

    loadBackground();
    window.addEventListener("zhaowu-background-change", loadBackground);
    return () => {
      alive = false;
      window.removeEventListener("zhaowu-background-change", loadBackground);
    };
  }, []);

  return (
    <div className={`relative isolate min-h-dvh bg-transparent text-ink ${isLogin ? "zhaowu-login-shell overflow-auto" : "overflow-x-clip"} ${backgroundUrl ? "zhaowu-has-wallpaper" : ""}`}>
      {backgroundUrl ? (
        <div
          aria-hidden
          className={`zhaowu-site-wallpaper ${isLogin ? "is-login" : ""}`}
          style={{ backgroundImage: `url("${backgroundUrl}")` }}
        />
      ) : null}

      {!isLogin ? <SealScatter seedKey={pathname} /> : null}

      {!isLogin ? (
        <header className="zhaowu-site-header sticky top-0 z-30 border-b border-line/70 backdrop-blur-md">
          <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-2 px-3 py-2 sm:px-4">
            <Link to="/" className="flex min-w-0 items-center gap-2 text-ink">
              <BrandSeal />
              <span className="min-w-0 leading-none">
                <span className="block font-display text-base tracking-[0.18em] sm:text-lg sm:tracking-[0.2em]">{t("brand")}</span>
                <span className="hidden max-w-[16rem] truncate text-[10px] tracking-[0.15em] text-ink-mute sm:block">{t("tagline")}</span>
              </span>
            </Link>
            <nav className="flex shrink-0 items-center gap-1 text-sm">
              <Link to="/" className={`hidden rounded-full px-2.5 py-2 min-[520px]:inline ${pathname === "/" ? "text-cinnabar" : "text-ink-soft hover:text-ink"}`}>
                {t("navHome")}
              </Link>
              {user ? (
                <Link to="/account" className={`hidden rounded-full px-2 py-2 min-[380px]:inline-flex ${pathname === "/account" ? "text-cinnabar" : "text-ink-soft hover:text-ink"}`}>
                  {user.isOwner ? t("navAdmin") : t("navMine")}
                </Link>
              ) : null}
              <div
                role="group"
                aria-label={t("language")}
                className="flex h-9 shrink-0 items-stretch overflow-hidden rounded-full border border-line/80 bg-cream/95"
              >
                {([
                  ["zh-Hant", "繁中"],
                  ["zh-Hans", "简中"],
                  ["en", "EN"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLocale(value)}
                    aria-pressed={locale === value}
                    className={`min-w-[2.25rem] border-r border-line/60 px-1.5 text-[10px] font-medium transition last:border-r-0 sm:min-w-[2.6rem] sm:px-2 sm:text-[11px] ${
                      locale === value ? "bg-wood text-cream" : "text-ink-soft hover:bg-paper-deep hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {isPending ? (
                <span className="h-8 w-14 animate-pulse rounded-full bg-paper-deep" />
              ) : user ? (
                <button type="button" onClick={() => void signOut()} className="max-w-20 truncate rounded-full px-2.5 py-2 text-ink-soft hover:text-ink">
                  {authEnabled ? t("logout") : user.displayName}
                </button>
              ) : (
                <Link to="/login" className="rounded-full bg-wood px-3 py-2 text-cream">{t("navLogin")}</Link>
              )}
            </nav>
          </div>
        </header>
      ) : null}

      <div className={isLogin ? "relative z-10 min-h-dvh" : "relative z-10 mx-auto max-w-5xl px-4 pb-14 pt-4 sm:pt-8"}>
        {user?.isOwner && pathname === "/account" ? (
          <div className="mb-4 flex justify-end">
            <Link to="/gallery" className="inline-flex min-h-10 items-center rounded-full border border-line bg-cream/95 px-4 text-xs font-medium text-ink-soft shadow-sm">
              {locale === "en" ? "Open Gallery" : locale === "zh-Hans" ? "打开图库" : "打開圖庫"}
            </Link>
          </div>
        ) : null}
        {children}
      </div>

      {!isLogin ? <GreenDragonGuide /> : null}

      {!isLogin ? (
        <footer className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-4 text-center">
          <p className="font-display text-sm tracking-[0.28em] text-ink-mute">
            {t("brand")}<span className="ml-2 tracking-[0.2em]">ZHAOWU</span>
          </p>
          <p className="mt-2 text-[10px] tracking-[0.08em] text-ink-mute">
            {stats.version !== "—" ? `${stats.version} · #${stats.updateNumber}` : "ZHAOWU"}
            {stats.version !== "—" ? " · " : ""}
            {locale === "en" ? "Today" : "今日"} {stats.todayVisits.toLocaleString()} · {locale === "en" ? "Total" : locale === "zh-Hans" ? "累计" : "累計"} {stats.totalVisits.toLocaleString()}
          </p>
        </footer>
      ) : null}
    </div>
  );
}
