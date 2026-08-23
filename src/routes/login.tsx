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

export const Route = createFileRoute("/login")({ component: LoginPage });

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
    <main className="stone-login-screen">
      <div className="stone-login-art" aria-hidden>
        <img src="/intro/loading-poster.jpg" alt="" draggable={false} />
        <div className="stone-login-art-shade" />
      </div>

      <div className="stone-login-topbar">
        <Link to="/" className="stone-login-pill">← {t("backHome")}</Link>
        <label htmlFor="login-language" className="sr-only">{t("language")}</label>
        <select
          id="login-language"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          aria-label={t("language")}
          className="stone-login-pill stone-login-language"
        >
          <option value="zh-Hant">繁體</option>
          <option value="zh-Hans">简体</option>
          <option value="en">EN</option>
        </select>
      </div>

      <section className="stone-login-sheet">
        {!isPending && user ? (
          <div className="text-center">
            <p className="stone-login-kicker">ACCOUNT</p>
            <h1 className="stone-login-title">{t("loggedInTitle")}</h1>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              {user.displayName} · {user.email}{user.isOwner ? ` · ${t("owner")}` : ""}
            </p>
            <Link to="/account" className="stone-login-primary mt-4">{t("enterMine")}</Link>
          </div>
        ) : (
          <>
            <div className="stone-login-sheet-head">
              <div>
                <p className="stone-login-kicker">ZHAOWU · ACCOUNT</p>
                <h1 className="stone-login-title">{mode === "login" ? t("loginTitle") : t("signupTitle")}</h1>
              </div>
              <div className="stone-login-tabs" aria-label="account mode">
                <button type="button" onClick={() => setMode("login")} className={mode === "login" ? "is-active" : ""}>{t("loginTab")}</button>
                <button type="button" onClick={() => setMode("signup")} className={mode === "signup" ? "is-active" : ""}>{t("signupTab")}</button>
              </div>
            </div>

            <div className="stone-login-providers">
              <button type="button" disabled={!supabaseConfigured || oauthBusy !== null} onClick={() => onOAuth("google")}>
                <span>G</span>{oauthBusy === "google" ? t("processing") : t("withGoogle")}
              </button>
              <button type="button" disabled={!supabaseConfigured || oauthBusy !== null} onClick={() => onOAuth("apple")}>
                <span>●</span>{oauthBusy === "apple" ? t("processing") : t("withApple")}
              </button>
            </div>

            <div className="stone-login-divider"><span />{t("orEmail")}<span /></div>

            <form className="stone-login-form" onSubmit={(e) => void submit(e)}>
              {mode === "signup" ? (
                <input id="display-name" aria-label={t("displayName")} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("displayNamePh")} />
              ) : null}
              <input id="login-email" aria-label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <input id="login-password" aria-label={t("password")} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password")} />

              {message ? <p role="status" className="stone-login-message">{message}</p> : null}
              {error ? <p role="alert" className="stone-login-error">{error}</p> : null}

              <button type="submit" disabled={busy || !supabaseConfigured} className="stone-login-primary w-full disabled:opacity-50">
                {busy ? t("processing") : mode === "login" ? t("loginTab") : t("createAccount")}
              </button>
            </form>
          </>
        )}
        <p className="stone-login-signature">STONE 原創 · 2026</p>
      </section>
    </main>
  );
}
