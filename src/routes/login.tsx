import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ownerSignIn } from "@/lib/auth/owner-api";
import { useI18n } from "@/lib/i18n";
import { useSkin } from "@/lib/theme-skins";

const LOGIN_BACKDROP = "/hero-gallery/dragon-scholar.webp";

function ownerText(locale: string, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { t, locale } = useI18n();
  const { skin } = useSkin();
  const navigate = useNavigate();
  const { user, reload } = useCurrentUserState();
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user?.isOwner) void navigate({ to: "/account" });
  }, [navigate, user?.isOwner]);

  async function onOwnerSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim() || secret.length < 8) {
      setError(ownerText(locale, "請輸入帳號與站主密碼。", "请输入账号与站主密码。", "Enter the owner account and passcode."));
      return;
    }
    setBusy(true);
    try {
      const mode = await ownerSignIn(email.trim(), secret);
      setSecret("");
      if (mode === "tester") {
        setNotice(ownerText(locale, "測試帳號登入成功。此帳號僅供驗證登入流程，沒有任何後台權限。", "测试账号登录成功。此账号仅供验证登录流程，没有任何后台权限。", "Test account sign-in succeeded. This account only verifies the sign-in flow and has no console access."));
        return;
      }
      await reload();
      await navigate({ to: "/account" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loginFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className="stone-login-screen"
      aria-labelledby="login-title"
      data-owner-only-login="true"
      data-login-backend="vercel-owner-cookie"
      data-login-surface="song-landing-r224"
    >
      <img
        className="stone-login-stage-media"
        src={skin?.hero ?? LOGIN_BACKDROP}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        data-login-stage-static="true"
      />

      <section className="stone-login-sheet seal-border">
        <div className="stone-login-brand" aria-label={`${t("brand")} ZHAOWU`}>
          <BrandSeal size="lg" decorative />
          <div className="stone-login-brand-copy">
            <p className="stone-login-brand-name">{t("brand")}</p>
            <p className="stone-login-brand-latin">ZHAOWU</p>
          </div>
        </div>

        <p className="stone-login-kicker">
          {ownerText(locale, "一份看見自己的命書", "一份看见自己的命书", "A guide for a clearer you")}
        </p>
        <h1 id="login-title" className="stone-login-title">
          {ownerText(locale, "站主登入", "站主登录", "Owner sign-in")}
        </h1>

        <form onSubmit={onOwnerSubmit} className="stone-login-form">
          <label>
            <span>{ownerText(locale, "帳號", "账号", "Account")}</span>
            <input
              id="owner-account"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={ownerText(locale, "輸入帳號（Email）", "输入账号（Email）", "Enter account email")}
            />
          </label>
          <label>
            <span>{ownerText(locale, "站主密碼", "站主密码", "Owner password")}</span>
            <input
              id="login-secret"
              type="password"
              autoComplete="current-password"
              value={secret}
              onChange={(event) => setSecret(event.target.value.trim())}
              placeholder={ownerText(locale, "輸入站主密碼", "输入站主密码", "Enter owner password")}
            />
          </label>
          {error ? <p className="stone-login-error" role="alert">{error}</p> : null}
          {notice ? <p className="stone-login-message" role="status" data-login-test-account="true">{notice}</p> : null}
          <button type="submit" disabled={busy} className="stone-login-primary">
            {busy ? t("processing") : ownerText(locale, "進入站主後台", "进入站主后台", "Enter owner console")}
          </button>
        </form>

        <div className="stone-login-footer">
          <span>{t("tagline")}</span>
          <Link to="/">{t("backHome")}</Link>
        </div>
      </section>
    </main>
  );
}
