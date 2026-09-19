import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useRef, useState } from "react";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ownerSignIn } from "@/lib/auth/owner-api";
import { useI18n } from "@/lib/i18n";
import { listActiveLoginAnimations, pickLoginAnimation, type LoginAnimationAsset } from "@/lib/login-animation";
import { readBrandTheme } from "@/lib/brand-theme";

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

function ownerText(locale: string, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function LoginStageBackdrop() {
  const { locale } = useI18n();
  const [asset, setAsset] = useState<LoginAnimationAsset | null>(FALLBACK_LOGIN_VIDEO);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
      <>
        <video
          ref={videoRef}
          className="stone-login-stage-media"
          src={media.fileUrl}
          poster={media.posterUrl}
          autoPlay
          muted={muted}
          playsInline
          loop
          preload="auto"
          onError={() => {
            if (media.fileUrl !== FALLBACK_LOGIN_VIDEO.fileUrl) setFailed(true);
          }}
        />
        <button
          type="button"
          className="stone-login-sound"
          aria-pressed={!muted}
          onClick={() => {
            const nextMuted = !muted;
            setMuted(nextMuted);
            if (videoRef.current) {
              videoRef.current.muted = nextMuted;
              videoRef.current.volume = 0.34;
              if (!nextMuted) void videoRef.current.play().catch(() => setMuted(true));
            }
          }}
        >
          <span aria-hidden="true">{muted ? "♪" : "Ⅱ"}</span>
          {ownerText(locale, muted ? "開啟聲音" : "聲音已開啟", muted ? "开启声音" : "声音已开启", muted ? "Play sound" : "Sound on")}
        </button>
      </>
    );
  }
  return <img className="stone-login-stage-media" src={media.fileUrl} alt="" onError={() => setFailed(true)} />;
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
  }, [navigate, user?.isOwner]);

  async function onOwnerSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
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

  return (
    <main className="stone-login-screen" aria-labelledby="login-title" data-owner-only-login="true" data-login-backend="vercel-owner-cookie">
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

        <form onSubmit={onOwnerSubmit} className="stone-login-form">
          <label>
            <span>{ownerText(locale, "站主密碼", "站主密码", "Owner password")}</span>
            <input id="login-secret" type="password" inputMode="numeric" autoComplete="current-password" value={secret} onChange={(event) => setSecret(event.target.value.trim())} placeholder={ownerText(locale, "輸入站主密碼", "输入站主密码", "Enter owner password")} />
          </label>
          {error ? <p className="stone-login-error" role="alert">{error}</p> : null}
          <button type="submit" disabled={busy} className="stone-login-primary">
            {busy ? t("processing") : ownerText(locale, "進入站主後台", "进入站主后台", "Enter owner console")}
          </button>
        </form>

        <p className="stone-login-signature">{t("tagline")}</p>
        <p className="stone-login-signature"><Link to="/">{t("backHome")}</Link></p>
      </section>
    </main>
  );
}
