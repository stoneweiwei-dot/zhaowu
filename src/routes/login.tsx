import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { listActiveLoginAnimations, pickLoginAnimation, type LoginAnimationAsset } from "@/lib/login-animation";
import { readBrandTheme } from "@/lib/brand-theme";
import { captureOAuthRedirect, signInWithPassword, signUpWithPassword, supabaseConfigured } from "@/lib/supabase-rest";

function LoginStageBackdrop() {
  const [asset, setAsset] = useState<LoginAnimationAsset | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    void listActiveLoginAnimations().then((rows) => { if (alive) setAsset(pickLoginAnimation(rows, readBrandTheme())); });
    return () => { alive = false; };
  }, []);
  if (!asset || failed) return null;
  if (asset.type === "video") {
    return (
      <video className="stone-login-stage-media" src={asset.fileUrl} poster={asset.posterUrl} autoPlay muted playsInline loop preload="metadata" onError={() => setFailed(true)} />
    );
  }
  return <img className="stone-login-stage-media" src={asset.fileUrl} alt="" onError={() => setFailed(true)} />;
}

export const Route = createFileRoute("/login")({ component: LoginPage });

type Mode = "signin" | "signup";

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, reload } = useCurrentUserState();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    void captureOAuthRedirect().then((session) => {
      if (session) void reload();
    }).catch((err) => {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    });
  }, [reload, t]);

  useEffect(() => {
    if (user) void navigate({ to: "/" });
  }, [navigate, user]);

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
      // The backend decides whether confirmation is required; the UI does not add a separate confirmation step.
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
      <LoginStageBackdrop />
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
          <button type="submit" disabled={busy} className="stone-login-primary">
            {busy ? t("processing") : mode === "signin" ? t("loginTab") : t("createAccount")}
          </button>
        </form>
        <p className="stone-login-signature">{t("tagline")}</p>
      </section>
    </main>
  );
}
