import { useEffect, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { hydrateLocale, useI18n } from "@/lib/i18n";
import { IntroGate } from "@/components/intro-gate";
import { Mark, SealScatter } from "@/components/marks";

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { user, profile, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showScatter = pathname !== "/login";
  useEffect(() => { hydrateLocale(); }, []);
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <IntroGate />
      {showScatter ? <SealScatter /> : null}
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:px-4">
          <Link to="/" className="relative z-10 flex min-w-0 items-center gap-2 text-ink"><Mark id="brand" size={36} className="h-9 w-9 shrink-0" /><span className="min-w-0 leading-none"><span className="block font-display text-lg tracking-[0.2em]">{t("brand")}</span><span className="block truncate text-[9px] tracking-[0.12em] text-ink-mute sm:text-[10px] sm:tracking-[0.18em]">{t("tagline")}</span></span></Link>
          <nav className="relative z-10 flex shrink-0 items-center gap-0.5 text-sm"><Link to="/" className={`hidden rounded-full px-2.5 py-2 min-[430px]:inline ${pathname === "/" ? "text-cinnabar" : "text-ink-soft"}`}>首页</Link><Link to="/account" className={`rounded-full px-2.5 py-2 ${pathname === "/account" ? "text-cinnabar" : "text-ink-soft"}`}>我的</Link>{profile?.isOwner ? <Link to="/admin" className={`rounded-full px-2.5 py-2 ${pathname === "/admin" ? "text-cinnabar" : "text-ink-soft"}`}>后台</Link> : null}<button type="button" className="rounded-full px-2 py-2 text-xs text-ink-soft" onClick={() => setLocale(locale === "zh-Hant" ? "zh-Hans" : "zh-Hant")}>{locale === "zh-Hant" ? "繁" : "简"}</button>{isPending ? <span className="h-8 w-12 animate-pulse rounded-full bg-paper-deep" /> : user ? <button type="button" onClick={() => void signOut()} className="max-w-20 truncate rounded-full px-2 py-2 text-xs text-ink-soft">退出</button> : <Link to="/login" className="rounded-full bg-cinnabar px-3 py-2 text-xs text-cream">登录</Link>}</nav>
        </div>
      </header>
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-8">{children}</div>
      <footer className="relative z-10 mx-auto max-w-5xl px-4 pb-10 pt-2 text-center"><Mark id="04" size={140} className="mx-auto mb-3 h-10 w-36 opacity-45" /><p className="font-display text-sm tracking-[0.28em] text-ink-mute">昭梧 <span className="ml-2 tracking-[0.2em]">ZHAOWU</span></p></footer>
    </div>
  );
}
