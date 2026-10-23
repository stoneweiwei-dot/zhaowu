import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ownerSignIn } from "@/lib/auth/owner-api";
import { passkeySignIn, passkeySupported } from "@/lib/auth/passkey-client";
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

  async function onPasskey() {
    setError(null);
    setBusy(true);
    try {
      await passkeySignIn();
      await reload();
      await navigate({ to: "/account" });
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "PASSKEY_CANCELLED") return;
      setError(code === "PASSKEY_DEVICE_UNKNOWN"
        ? ownerText(locale, "這支手機還不是受信任裝置。請先用密碼登入，再到站主後台加入。", "这支手机还不是受信任设备。请先用密码登录，再到站主后台加入。", "This phone is not a trusted device yet. Sign in with the password first, then add it in the owner console.")
        : code === "PASSKEY_BROWSER_BLOCKED"
          ? ownerText(locale, "Face ID 未完成。請在 iPhone Safari 開啟 zhao-wu.com，避免使用 ChatGPT 內建瀏覽器註冊。", "Face ID 未完成。请在 iPhone Safari 打开 zhao-wu.com，不要在内置浏览器注册。", "Face ID was blocked or cancelled. Open zhao-wu.com in Safari rather than an in-app browser.")
          : ownerText(locale, "Face ID 尚不可用：請先確認後台「登入與裝置」已完成註冊，否則繼續使用站主密碼。", "Face ID 尚不可用：请先确认后台「登录与设备」已注册，否则用站主密码。", "Face ID is not ready. Complete device registration under Sign-in, or use the owner password."));
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
        src={skin?.id === "solar-frost-descent" ? "/theme-skins/solar-frost-descent/login-wash.webp" : skin?.hero ?? LOGIN_BACKDROP}
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

        {passkeySupported() ? (
          <div className="stone-login-form" data-owner-passkey-block>
            <button type="button" disabled={busy} onClick={() => void onPasskey()} className="stone-login-primary" data-owner-passkey-login>
              {busy ? t("processing") : ownerText(locale, "用 Face ID 登入", "用 Face ID 登录", "Sign in with Face ID")}
            </button>
            {error ? <p className="stone-login-error" role="alert">{error}</p> : null}
            <p className="stone-login-message" data-owner-passkey-hint>
              {ownerText(locale, "手機已加入受信任裝置就直接按。第一次請用下方帳號密碼登入，再到後台「登入與裝置」加入。", "手机已加入受信任设备就直接按。第一次请用下方账号密码登录，再到后台“登录与设备”加入。", "Tap if this phone is already trusted. First time: sign in below, then add this phone under “Sign-in” in the owner console.")}
            </p>
          </div>
        ) : null}

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
          {!passkeySupported() && error ? <p className="stone-login-error" role="alert">{error}</p> : null}
          {notice ? <p className="stone-login-message" role="status" data-login-test-account="true">{notice}</p> : null}
          <button type="submit" disabled={busy} className="stone-login-primary">
            {busy ? t("processing") : ownerText(locale, "用帳號密碼登入", "用账号密码登录", "Sign in with password")}
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
