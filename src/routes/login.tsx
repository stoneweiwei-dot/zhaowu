import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  captureOAuthRedirect,
  signInWithPassword,
  signUpWithPassword,
  startOAuth,
  supabaseConfigured,
  type OAuthProvider,
} from "@/lib/supabase-rest";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n, type Locale } from "@/lib/i18n";
import { BrandSeal } from "@/components/brand-seal";

export const Route = createFileRoute("/login")({ component: LoginPage });

const LOGIN_EMBLEMS = [
  ["/emblems/crane-feather-emblem.svg", "login-emblem-crane"],
  ["/emblems/lotus-emblem.svg", "login-emblem-lotus"],
  ["/emblems/modern-bagua-emblem.svg", "login-emblem-bagua"],
  ["/emblems/modern-gourd-emblem.svg", "login-emblem-gourd"],
] as const;

function LoginPage() {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();
  const { user, isPending, reload } = useCurrentUserState();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<OAuthProvider | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resetOAuthBusy = () => setOauthBusy(null);
    window.addEventListener("pageshow", resetOAuthBusy);
    window.addEventListener("focus", resetOAuthBusy);

    let alive = true;
    void (async () => {
      try {
        const session = await captureOAuthRedirect();
        if (!alive || !session) return;
        window.dispatchEvent(new Event("zhaowu-auth-change"));
        await reload();
        await navigate({ to: "/account" });
      } catch (err) {
        if (!alive) return;
        const text = err instanceof Error ? err.message : t("loginFailed");
        setError(text);
      }
    })();
    return () => {
      alive = false;
      window.removeEventListener("pageshow", resetOAuthBusy);
      window.removeEventListener("focus", resetOAuthBusy);
    };
  }, [navigate, reload, t]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!supabaseConfigured) {
      setError(t("loginUnavailable"));
      return;
    }
    if (!email.trim() || password.length < 8) {
      setError(t("loginValidation"));
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const out = await signUpWithPassword(email, password, displayName || email.split("@")[0]);
        if (!out.session) {
          setMessage(t("accountCreated"));
          setMode("login");
          return;
        }
      } else {
        await signInWithPassword(email, password);
      }
      window.dispatchEvent(new Event("zhaowu-auth-change"));
      await navigate({ to: "/account" });
    } catch (err) {
      const text = err instanceof Error ? err.message : t("loginFailed");
      setError(text.includes("Invalid login credentials") ? t("invalidCredentials") : text);
    } finally {
      setBusy(false);
    }
  }

  function onOAuth(provider: OAuthProvider) {
    setError(null);
    setMessage(null);
    if (!supabaseConfigured) {
      setError(t("loginUnavailable"));
      return;
    }
    setOauthBusy(provider);
    try {
      startOAuth(provider);
    } catch (err) {
      const text = err instanceof Error ? err.message : t("loginFailed");
      setError(text);
      setOauthBusy(null);
    }
  }

  return (
    <main className="zhaowu-login-page">
      <div className="zhaowu-login-topbar">
        <Link to="/" className="zhaowu-login-home-link">← {t("backHome")}</Link>
        <label htmlFor="login-language" className="sr-only">{t("language")}</label>
        <select
          id="login-language"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          aria-label={t("language")}
          className="zhaowu-login-language"
        >
          <option value="zh-Hant">繁體</option>
          <option value="zh-Hans">简体</option>
          <option value="en">EN</option>
        </select>
      </div>

      <div className="zhaowu-login-emblems" aria-hidden>
        {LOGIN_EMBLEMS.map(([src, className]) => (
          <img key={src} src={src} alt="" className={`zhaowu-emblem ${className}`} draggable={false} />
        ))}
      </div>

      <section className="zhaowu-login-card">
        <div className="zhaowu-login-brand-block">
          <BrandSeal size="lg" decorative className="zhaowu-login-seal" />
          <p className="zhaowu-login-brand-en">Z H A O W U</p>
          <h1 className="zhaowu-login-brand-title">{t("brand")}</h1>
          <p className="zhaowu-login-brand-sub">DESTINY · TIMING · CHOICE</p>
        </div>

        <div className="zhaowu-login-rule" aria-hidden><span /><i /><span /></div>

        {!isPending && user ? (
          <div className="zhaowu-login-account-ready">
            <p className="text-xs tracking-[0.24em] text-cinnabar">ACCOUNT</p>
            <h2 className="mt-2 font-display text-3xl text-ink">{t("loggedInTitle")}</h2>
            <p className="mt-4 text-sm leading-7 text-ink-soft">
              {user.displayName} · {user.email}{user.isOwner ? ` · ${t("owner")}` : ""}
            </p>
            <Link to="/account" className="zhaowu-login-primary mt-6">{t("enterMine")}</Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-xs tracking-[0.24em] text-cinnabar">ACCOUNT</p>
              <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">{mode === "login" ? t("loginTitle") : t("signupTitle")}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-ink-soft">{t("loginPageLead")}</p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={!supabaseConfigured || oauthBusy !== null}
                onClick={() => onOAuth("google")}
                className="zhaowu-login-provider"
              >
                <span className="zhaowu-login-provider-dot">G</span>
                {oauthBusy === "google" ? t("processing") : t("withGoogle")}
              </button>
              <button
                type="button"
                disabled={!supabaseConfigured || oauthBusy !== null}
                onClick={() => onOAuth("apple")}
                className="zhaowu-login-provider"
              >
                <span className="zhaowu-login-provider-dot">●</span>
                {oauthBusy === "apple" ? t("processing") : t("withApple")}
              </button>
            </div>

            <div className="my-6 flex items-center gap-3 text-[11px] tracking-[0.18em] text-ink-mute">
              <span className="h-px flex-1 bg-line" />
              <span>{t("orEmail")}</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="grid grid-cols-2 rounded-full border border-line/80 bg-paper/55 p-1 text-sm">
              <button type="button" onClick={() => setMode("login")} className={`rounded-full px-4 py-2.5 transition ${mode === "login" ? "bg-wood text-cream shadow-sm" : "text-ink-soft"}`}>
                {t("loginTab")}
              </button>
              <button type="button" onClick={() => setMode("signup")} className={`rounded-full px-4 py-2.5 transition ${mode === "signup" ? "bg-wood text-cream shadow-sm" : "text-ink-soft"}`}>
                {t("signupTab")}
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={(e) => void submit(e)}>
              {mode === "signup" ? (
                <label htmlFor="display-name" className="block text-sm text-ink-soft">
                  <span className="mb-2 block">{t("displayName")}</span>
                  <input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="zhaowu-login-input" placeholder={t("displayNamePh")} />
                </label>
              ) : null}
              <label htmlFor="login-email" className="block text-sm text-ink-soft">
                <span className="mb-2 block">Email</span>
                <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="zhaowu-login-input" placeholder="name@example.com" />
              </label>
              <label htmlFor="login-password" className="block text-sm text-ink-soft">
                <span className="mb-2 block">{t("password")}</span>
                <input id="login-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="zhaowu-login-input" placeholder={t("passwordPh")} />
              </label>

              {message ? <p role="status" className="rounded-xl border border-wood/25 bg-wood/5 px-4 py-3 text-sm leading-6 text-wood">{message}</p> : null}
              {error ? <p role="alert" className="rounded-xl border border-cinnabar/25 bg-cinnabar/5 px-4 py-3 text-sm leading-6 text-cinnabar-deep">{error}</p> : null}

              <button type="submit" disabled={busy || !supabaseConfigured} className="zhaowu-login-primary w-full disabled:opacity-50">
                {busy ? t("processing") : mode === "login" ? t("loginTab") : t("createAccount")}
              </button>
            </form>
          </>
        )}
      </section>

      <p className="zhaowu-login-signature">ZHAOWU · STONE 原創</p>
    </main>
  );
}
