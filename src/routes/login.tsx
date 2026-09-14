import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ownerSignIn } from "@/lib/auth/owner-api";
import { signUpWithPassword } from "@/lib/auth/signup";
import { useI18n } from "@/lib/i18n";
import { listActiveLoginAnimations, pickLoginAnimation, type LoginAnimationAsset } from "@/lib/login-animation";
import { readBrandTheme } from "@/lib/brand-theme";
import { signInWithPassword, startOAuth, type OAuthProvider } from "@/lib/supabase-rest";

const FALLBACK_LOGIN_VIDEO: LoginAnimationAsset = {
  id: "fallback:owner-immortal",
  title: "登入動畫",
  type: "video",
  fileUrl: "/intro/owner-immortal-ascent-r123.mp4",
  posterUrl: "/intro/owner-immortal-ascent-r123.jpg",
  durationMs: 10040,
  active: true,
  current: true,
  theme: "common",
  sortOrder: 0,
  createdAt: "2026-09-13T00:00:00.000Z",
};

type LoginTab = "login" | "signup" | "owner";

function ownerText(locale: string, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function oauthRedirect() {
  if (typeof window === "undefined") return "https://stone-zhaowu-official.vercel.app/auth/callback";
  return `${window.location.origin}/auth/callback`;
}

function LoginStageBackdrop() {
  const [asset, setAsset] = useState<LoginAnimationAsset | null>(FALLBACK_LOGIN_VIDEO);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    void listActiveLoginAnimations().then((rows) => {
      if (!alive) return;
      setAsset(pickLoginAnimation(rows, readBrandTheme()) ?? FALLBACK_LOGIN_VIDEO);
    }).catch(() => {
      if (alive) setAsset(FALLBACK_LOGIN_VIDEO);
    });
    return () => { alive = false; };
  }, []);
  const media = failed || !asset ? FALLBACK_LOGIN_VIDEO : asset;
  if (media.type === "video") {
    return (
      <video
        className="stone-login-stage-media"
        src={media.fileUrl}
        poster={media.posterUrl}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        onError={() => {
          if (media.fileUrl !== FALLBACK_LOGIN_VIDEO.fileUrl) setFailed(true);
        }}
      />
    );
  }
  return <img className="stone-login-stage-media" src={media.fileUrl} alt="" onError={() => setFailed(true)} />;
}

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { user, reload } = useCurrentUserState();
  const [tab, setTab] = useState<LoginTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) void navigate({ to: "/account" });
  }, [navigate, user]);

  function resetAlerts() {
    setError(null);
    setMessage(null);
  }

  async function onMemberLogin(event: FormEvent) {
    event.preventDefault();
    resetAlerts();
    // Existing members must be authenticated against the password already on
    // their Supabase account. Do not reuse today's signup length policy here.
    if (!email.trim() || !password) {
      setError(t("loginValidation"));
      return;
    }
    setBusy(true);
    try {
      await signInWithPassword(email, password);
      await reload();
      await navigate({ to: "/account" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function onSignup(event: FormEvent) {
    event.preventDefault();
    resetAlerts();
    if (!email.trim() || password.length < 8 || !displayName.trim()) {
      setError(t("loginValidation"));
      return;
    }
    setBusy(true);
    try {
      await signUpWithPassword(email, password, displayName);
      setMessage(t("accountCreated"));
      setTab("login");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function onOwnerSubmit(event: FormEvent) {
    event.preventDefault();
    resetAlerts();
    if (secret.length < 8) {
      setError(ownerText(locale, "請輸入站主密碼。", "请输入站主密码。", "Enter the owner passcode."));
      return;
    }
    setBusy(true);
    try {
      await ownerSignIn(secret);
      setSecret("");
      await reload();
      await navigate({ to: "/account" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    } finally {
      setBusy(false);
    }
  }

  function onOAuth(provider: OAuthProvider) {
    resetAlerts();
    try {
      startOAuth(provider, oauthRedirect());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginUnavailable"));
    }
  }

  const title = tab === "signup"
    ? t("signupTitle")
    : tab === "owner"
      ? ownerText(locale, "站主登入", "站主登录", "Owner sign-in")
      : t("loggedInTitle") === "已登入昭梧" || locale !== "en"
        ? ownerText(locale, "會員登入", "会员登录", "Member sign-in")
        : "Member sign-in";

  return (
    <main className="stone-login-screen" aria-labelledby="login-title">
      <LoginStageBackdrop />
      <section className="stone-login-sheet seal-border">
        <div className="stone-login-brand" aria-label={`${t("brand")} ZHAOWU`}>
          <BrandSeal size="lg" decorative />
          <div className="stone-login-brand-copy">
            <p className="stone-login-brand-name">{t("brand")}</p>
            <p className="stone-login-brand-latin">ZHAOWU</p>
          </div>
        </div>
        <p className="stone-login-kicker">{tab === "owner" ? "ZHAOWU · OWNER" : "ZHAOWU · MEMBER"}</p>
        <h1 id="login-title" className="stone-login-title">{title}</h1>
        <p className="stone-login-lead" data-login-backend={tab === "owner" ? "vercel-owner-cookie" : "supabase-member"}>
          {tab === "owner"
            ? ownerText(locale, "獨立站主登入，不經 Supabase Auth。會員帳號不能成為站主。", "独立站主登录，不经 Supabase Auth。会员账号不能成为站主。", "Independent owner sign-in. A member account is never the owner.")
            : t("loginLead")}
        </p>

        <div className="stone-login-tabs" role="tablist" aria-label={t("navLogin")}>
          <button type="button" role="tab" aria-selected={tab === "login"} className={tab === "login" ? "is-active" : ""} onClick={() => { setTab("login"); resetAlerts(); }}>{t("loginTab")}</button>
          <button type="button" role="tab" aria-selected={tab === "signup"} className={tab === "signup" ? "is-active" : ""} onClick={() => { setTab("signup"); resetAlerts(); }}>{t("signupTab")}</button>
          <button type="button" role="tab" aria-selected={tab === "owner"} className={tab === "owner" ? "is-active" : ""} onClick={() => { setTab("owner"); resetAlerts(); }}>{ownerText(locale, "站主", "站主", "Owner")}</button>
        </div>

        {tab !== "owner" ? (
          <>
            <div className="stone-login-oauth-group">
              <p className="stone-login-oauth-label">{t("orEmail") === "或使用 Email" ? ownerText(locale, "社交帳號", "社交账号", "Continue with") : "Continue with"}</p>
              <div className="stone-login-oauth-grid">
                <button type="button" className="stone-login-oauth" data-provider="google" onClick={() => onOAuth("google")} disabled={busy}>{t("withGoogle")}</button>
                <button type="button" className="stone-login-oauth" data-provider="apple" onClick={() => onOAuth("apple")} disabled={busy}>{t("withApple")}</button>
                <button type="button" className="stone-login-oauth" data-provider="twitter" onClick={() => onOAuth("twitter")} disabled={busy}>{t("withX")}</button>
              </div>
            </div>
            <p className="stone-login-email-divider">{t("orEmail")}</p>
          </>
        ) : null}

        {tab === "login" ? (
          <form onSubmit={onMemberLogin} className="stone-login-form">
            <label>
              <span>Email</span>
              <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" />
            </label>
            <label>
              <span>{t("password")}</span>
              <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("passwordPh")} />
            </label>
            {error ? <p className="stone-login-error" role="alert">{error}</p> : null}
            {message ? <p className="stone-login-message" role="status">{message}</p> : null}
            <button type="submit" disabled={busy} className="stone-login-primary">
              {busy ? t("processing") : t("loginTab")}
            </button>
          </form>
        ) : null}

        {tab === "signup" ? (
          <form onSubmit={onSignup} className="stone-login-form" data-signup-form="true">
            <label>
              <span>{t("displayName")}</span>
              <input id="signup-name" type="text" autoComplete="nickname" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={t("displayNamePh")} />
            </label>
            <label>
              <span>Email</span>
              <input id="signup-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" />
            </label>
            <label>
              <span>{t("password")}</span>
              <input id="signup-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("passwordPh")} />
            </label>
            {error ? <p className="stone-login-error" role="alert">{error}</p> : null}
            {message ? <p className="stone-login-message" role="status">{message}</p> : null}
            <button type="submit" disabled={busy} className="stone-login-primary">
              {busy ? t("processing") : t("createAccount")}
            </button>
          </form>
        ) : null}

        {tab === "owner" ? (
          <form onSubmit={onOwnerSubmit} className="stone-login-form">
            <label>
              <span>{ownerText(locale, "站主密鑰", "站主密钥", "Owner key")}</span>
              <input id="login-secret" type="password" autoComplete="off" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder={ownerText(locale, "貼上站主密鑰", "粘贴站主密钥", "Paste owner key")} />
            </label>
            {error ? <p className="stone-login-error" role="alert">{error}</p> : null}
            <button type="submit" disabled={busy} className="stone-login-primary">
              {busy ? t("processing") : ownerText(locale, "進入站主後台", "进入站主后台", "Enter owner console")}
            </button>
          </form>
        ) : null}

        <p className="stone-login-signature">{t("tagline")}</p>
        <p className="stone-login-signature"><Link to="/">{t("backHome")}</Link></p>
      </section>
    </main>
  );
}
