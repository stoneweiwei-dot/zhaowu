import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { captureOAuthRedirect, signInWithPassword, signUpWithPassword, startOAuth, supabaseConfigured, type OAuthProvider } from "@/lib/supabase-rest";

export const Route = createFileRoute("/login")({ component: LoginPage });

type Mode = "signin" | "signup";

const OAUTH_COPY = {
  "zh-Hant": { quick: "快速登入", email: "或使用電子郵件", google: "使用 Google 繼續", apple: "使用 Apple 繼續" },
  "zh-Hans": { quick: "快速登录", email: "或使用电子邮箱", google: "使用 Google 继续", apple: "使用 Apple 继续" },
  en: { quick: "Quick sign in", email: "or use email", google: "Continue with Google", apple: "Continue with Apple" },
} as const;

function LoginPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { user, reload } = useCurrentUserState();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const oauthCopy = OAUTH_COPY[locale];

  useEffect(() => {
    const session = captureOAuthRedirect();
    if (session) void reload();
  }, [reload]);

  useEffect(() => {
    if (user) void navigate({ to: "/account" });
  }, [navigate, user]);

  function onOAuth(provider: "google" | "apple") {
    setError(null);
    setInfo(null);
    setOauthBusy(provider);
    try {
      startOAuth(provider, "/login");
    } catch (err) {
      setOauthBusy(null);
      setError(err instanceof Error ? err.message : t("loginUnavailable"));
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 6) {
      setError(t("loginValidation"));
      return;
    }
    if (!supabaseConfigured()) {
      setError(t("loginUnavailable"));
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithPassword(email.trim(), password);
        await reload();
        await navigate({ to: "/account" });
        return;
      }
      const { session } = await signUpWithPassword(email.trim(), password, displayName.trim());
      if (session) {
        await reload();
        await navigate({ to: "/account" });
        return;
      }
      // Some Supabase projects require one email confirmation after account creation.
      // We do not add a separate verification-code screen; the backend decides whether confirmation is required.
      setInfo(t("accountCreated"));
      setMode("signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="stone-login-screen" aria-labelledby="login-title">
      <section className="stone-login-panel seal-border">
        <p className="stone-login-kicker">ZHAOWU · ACCOUNT</p>
        <h1 id="login-title" className="stone-login-title">{mode === "signin" ? t("loginTitle") : t("signupTitle")}</h1>
        <p className="stone-login-lead">{mode === "signin" ? t("loginLead") : t("signupLead")}</p>

        <div className="stone-login-tabs" role="tablist" aria-label={t("loginMode")}> 
          <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => setMode("signin")}>{t("loginTab")}</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => setMode("signup")}>{t("signupTab")}</button>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-center text-xs tracking-[0.12em] text-ink-mute">{oauthCopy.quick}</p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={busy || oauthBusy !== null} onClick={() => onOAuth("google")} className="min-h-12 rounded-xl border border-line bg-cream/70 px-3 text-sm text-ink disabled:opacity-50">
              {oauthCopy.google}
            </button>
            <button type="button" disabled={busy || oauthBusy !== null} onClick={() => onOAuth("apple")} className="min-h-12 rounded-xl border border-line bg-cream/70 px-3 text-sm text-ink disabled:opacity-50">
              {oauthCopy.apple}
            </button>
          </div>
          <p className="my-4 text-center text-xs text-ink-mute">{oauthCopy.email}</p>
        </div>

        <form onSubmit={onSubmit} className="stone-login-form">
          {mode === "signup" ? (
            <label>
              <span>{t("displayName")}</span>
              <input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={t("displayNamePh")} />
            </label>
          ) : null}
          <label>
            <span>{t("email")}</span>
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
          </label>
          <label>
            <span>{t("password")}</span>
            <input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("passwordPh")} />
          </label>

          {error ? <p className="stone-login-error" role="alert">{error}</p> : null}
          {info ? <p className="stone-login-info" role="status">{info}</p> : null}

          <button type="submit" disabled={busy || oauthBusy !== null} className="stone-login-submit">
            {busy ? t("loginWorking") : mode === "signin" ? t("loginAction") : t("signupAction")}
          </button>
        </form>

        <p className="stone-login-note">{t("loginPageLead")}</p>
      </section>
    </main>
  );
}
