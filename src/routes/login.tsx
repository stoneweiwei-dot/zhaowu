import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ownerSignIn } from "@/lib/auth/owner-api";
import { useI18n } from "@/lib/i18n";
import { listActiveLoginAnimations, pickLoginAnimation, type LoginAnimationAsset } from "@/lib/login-animation";
import { readBrandTheme } from "@/lib/brand-theme";

function ownerText(locale: string, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

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
    return <video className="stone-login-stage-media" src={asset.fileUrl} poster={asset.posterUrl} autoPlay muted playsInline loop preload="metadata" onError={() => setFailed(true)} />;
  }
  return <img className="stone-login-stage-media" src={asset.fileUrl} alt="" onError={() => setFailed(true)} />;
}

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { user, reload } = useCurrentUserState();
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.isOwner) void navigate({ to: "/account" });
  }, [navigate, user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (secret.length < 32) {
      setError(ownerText(locale, "請輸入完整站主密鑰。", "请输入完整站主密钥。", "Enter the full owner key."));
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
        <p className="stone-login-kicker">ZHAOWU · OWNER</p>
        <h1 id="login-title" className="stone-login-title">{ownerText(locale, "站主登入", "站主登录", "Owner sign-in")}</h1>
        <p className="stone-login-lead" data-login-backend="vercel-owner-cookie">
          {ownerText(locale, "獨立站主登入，不經 Supabase Auth。", "独立站主登录，不经 Supabase Auth。", "Independent owner sign-in. Supabase Auth is not used.")}
        </p>
        <form onSubmit={onSubmit} className="stone-login-form">
          <label>
            <span>{ownerText(locale, "站主密鑰", "站主密钥", "Owner key")}</span>
            <input id="login-secret" type="password" autoComplete="off" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder={ownerText(locale, "貼上站主密鑰", "粘贴站主密钥", "Paste owner key")} />
          </label>
          {error ? <p className="stone-login-error" role="alert">{error}</p> : null}
          <button type="submit" disabled={busy} className="stone-login-primary">
            {busy ? t("processing") : ownerText(locale, "進入站主後台", "进入站主后台", "Enter owner console")}
          </button>
        </form>
        <p className="stone-login-signature">{t("tagline")}</p>
      </section>
    </main>
  );
}
