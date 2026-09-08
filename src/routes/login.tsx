import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { captureOAuthRedirect, signInWithPassword, signUpWithPassword, startOAuth, supabaseConfigured, type OAuthProvider } from "@/lib/supabase-rest";

export const Route = createFileRoute("/login")({ component: LoginPage });

type Mode = "signin" | "signup";

const OAUTH_COPY = {
  "zh-Hant": { quick: "快速登入", email: "或使用電子郵件", google: "使用 Google 繼續", apple: "使用 Apple 繼續", x: "使用 X 繼續" },
  "zh-Hans": { quick: "快速登录", email: "或使用电子邮箱", google: "使用 Google 继续", apple: "使用 Apple 继续", x: "使用 X 继续" },
  en: { quick: "Quick sign in", email: "or use email", google: "Continue with Google", apple: "Continue with Apple", x: "Continue with X" },
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
    void captureOAuthRedirect().then((session) => {
      if (session) void reload();
    }).catch((err) => {
      setOauthBusy(null);
      setError(err instanceof Error ? err.message : t("loginFailed"));
    });
  }, [reload, t]);

  useEffect(() => {
    if (user) void navigate({ to: "/" });
  }, [navigate, user]);

  function onOAuth(provider: OAuthProvider) {
    setError(null);
    setInfo(null);
    setOauthBusy(provider);
    try {
      startOAuth(provider);
    } catch (err) {
      setOauthBusy(null);
      setError(err instanceof Error ? err.message : t("loginUnavailable"));
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 8) {
      setError(t("loginValidation"));
      return;
    }
    if (!supabaseConfigured) {
      setError(t("loginUnavailable"));
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithPassword(email.trim(), password);
        await reload();
        await navigate({ to: "/" });
        return;
      }
      const { session } = await signUpWithPassword(email.trim(), password, displayName.trim());
      if (session) {
        await reload();
        await navigate({ to: "/" });
        return;
      }
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
      <section className="stone-login-sheet seal-border">
        <div className="stone-login-brand" aria-label={`${t("brand")} ZHAOWU`}>
          <BrandSeal size="lg" decorative />
          <div className="stone-login-brand-copy">
            <p className="stone-login-brand-name">{t("brand")}</p>
            <p className="stone-login-brand-latin">ZHAOWU</p>
          </div>
        </div>

        <p className="stone-login-kicker">ZHAOWU · ACCOUNT</p>
        <h1 id="login-title" className="stone-login-title">{mode === "signin" ? t("loginTitle") : t("signupTitle")}</h1>
        <p className="stone-login-lead">{mode === "signin" ? t("loginLead") : t("loginPageLead")}</p>

        <div className="stone-login-tabs" role="tablist" aria-label={t("loginTitle")}>
          <button type="button" role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "is-active" : undefined} onClick={() => setMode("signin")}>{t("loginTab")}</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "is-active" : undefined} onClick={() => setMode("signup")}>{t("signupTab")}</button>
        </div>

        <div className="stone-login-oauth-group">
          <p className="stone-login-oauth-label">{oauthCopy.quick}</p>
          <div className="stone-login-oauth-grid">
            <button type="button" data-provider="google" disabled={busy || oauthBusy !== null} onClick={() => onOAuth("google")} className="stone-login-oauth">
              {oauthCopy.google}
            </button>
            <button type="button" data-provider="apple" disabled={busy || oauthBusy !== null} onClick={() => onOAuth("apple")} className="stone-login-oauth">
              {oauthCopy.apple}
            </button>
            <button type="button" data-provider="x" disabled={busy || oauthBusy !== null} onClick={() => onOAuth("twitter")} className="stone-login-oauth">
              {oauthCopy.x}
            </button>
          </div>
          <p className="stone-login-email-divider"><span>{oauthCopy.email}</span></p>
        </div>

        <form onSubmit={onSubmit} className="stone-login-form">
          {mode === "signup" ? (
            <label>
              <span>{t("displayName")}</span>
              <input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={t("displayNamePh")} />
            </label>
          ) : null}
          <label>
            <span>Email</span>
            <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
          </label>
          <label>
            <span>{t("password")}</span>
            <input id="login-password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("passwordPh")} />
          </label>

          {error ? <p className="stone-login-error" role="alert">{error}</p> : null}
          {info ? <p className="stone-login-message" role="status">{info}</p> : null}

          <button type="submit" disabled={busy || oauthBusy !== null} className="stone-login-primary">
            {busy ? t("processing") : mode === "signin" ? t("loginTab") : t("createAccount")}
          </button>
        </form>

        <p className="stone-login-signature">{t("tagline")}</p>
      </section>
    </main>
  );
}
