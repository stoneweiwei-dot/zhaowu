import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ownerSignIn } from "@/lib/auth/owner-api";
import { passkeySignIn, passkeySupported } from "@/lib/auth/passkey-client";
import { useI18n } from "@/lib/i18n";
import { useSkin } from "@/lib/theme-skins";

function ownerText(locale: string, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

const LOGIN_BACKDROP = "/hero-gallery/dragon-scholar.webp";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { t, locale } = useI18n();
  const { skin } = useSkin();
  const navigate = useNavigate();
  const { user, reload } = useCurrentUserState();
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
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
      setError(code === "PASSKEY_TIMEOUT"
        ? ownerText(locale, "Face ID 等待逾時，請重試，或使用下方站主密碼登入。", "Face ID 等待超时，请重试，或使用下方站主密码登录。", "Face ID timed out. Try again or sign in with your owner password below.")
        : code === "PASSKEY_DEVICE_UNKNOWN"
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
        src={LOGIN_BACKDROP}
        alt=""
        aria-hidden="true"
        width={1248}
        height={1248}
        style={skin?.focus ? { objectPosition: skin.focus } : undefined}
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
            {/* Keep the value exactly as typed. Trimming on every keystroke silently dropped leading
                and trailing spaces, so a password holding one could never be entered and the server
                (which hashes the password verbatim) answered INVALID_OWNER_CREDENTIAL. */}
            <span className="owner-password-field">
              <input
                id="login-secret"
                type={showSecret ? "text" : "password"}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder={ownerText(locale, "輸入站主密碼", "输入站主密码", "Enter owner password")}
              />
              <button
                type="button"
                className="owner-password-toggle"
                aria-pressed={showSecret}
                aria-label={showSecret
                  ? ownerText(locale, "隱藏密碼", "隐藏密码", "Hide password")
                  : ownerText(locale, "顯示密碼", "显示密码", "Show password")}
                onClick={() => setShowSecret((value) => !value)}
                data-owner-password-toggle
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showSecret ? null : <path d="M4 4l16 16" />}
                </svg>
              </button>
            </span>
          </label>
          <button type="button" className="owner-forgot-toggle" aria-expanded={showForgot} onClick={() => setShowForgot((value) => !value)} data-owner-forgot-toggle>
            {ownerText(locale, "忘記密碼？", "忘记密码？", "Forgot password?")}
          </button>
          {showForgot ? (
            <p className="stone-login-message" role="note" data-owner-forgot-help>
              {ownerText(
                locale,
                "手機已加入受信任裝置：直接按上方「用 Face ID 登入」，不需要密碼。沒有可用的手機：密碼只以雜湊保存，無法寄信找回，需由站主在伺服器端重設。",
                "手机已加入受信任设备：直接按上方“用 Face ID 登录”，不需要密码。没有可用的手机：密码只以哈希保存，无法寄信找回，需由站主在服务器端重设。",
                "Trusted phone: tap “Sign in with Face ID” above, no password needed. No trusted phone: the password is stored only as a hash and cannot be emailed back; the owner must reset it on the server.",
              )}
            </p>
          ) : null}
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
