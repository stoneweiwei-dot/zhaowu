import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { BrandSeal } from "@/components/brand-seal";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ownerSignIn } from "@/lib/auth/owner-api";
import { useI18n } from "@/lib/i18n";
import { clockFallbackPhase, loginSolarPhaseAt, type LoginSolarPhase } from "@/lib/login-solar-phase";

const LOGIN_DAY_IMAGE = "/login/login-day-r147.webp";
const LOGIN_NIGHT_IMAGE = "/login/login-night-r147.webp";
const FALLBACK_LOGIN_VIDEO = "/intro/owner-immortal-ascent-r123.mp4";
const FALLBACK_LOGIN_POSTER = "/intro/owner-immortal-ascent-r123.jpg";

type SolarLocationPayload = {
  latitude: number | null;
  longitude: number | null;
  source?: "vercel-ip" | "clock";
};

function ownerText(locale: string, hant: string, hans: string, en: string) {
  if (locale === "en") return en;
  return locale === "zh-Hans" ? hans : hant;
}

function LoginStageBackdrop() {
  const [phase, setPhase] = useState<LoginSolarPhase>(() => clockFallbackPhase(new Date()));
  const [source, setSource] = useState<"clock" | "vercel-ip">("clock");
  const [failed, setFailed] = useState<Record<LoginSolarPhase, boolean>>({ day: false, night: false });

  useEffect(() => {
    let alive = true;
    let refreshTimer: number | null = null;
    let coordinates: { latitude: number; longitude: number } | null = null;

    const refreshPhase = () => {
      if (!alive) return;
      const now = new Date();
      if (coordinates) {
        setPhase(loginSolarPhaseAt(now, coordinates.latitude, coordinates.longitude));
        setSource("vercel-ip");
      } else {
        setPhase(clockFallbackPhase(now));
        setSource("clock");
      }
    };

    const startRefreshTimer = () => {
      refreshPhase();
      if (refreshTimer !== null) window.clearInterval(refreshTimer);
      refreshTimer = window.setInterval(refreshPhase, 60_000);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshPhase();
    };

    // Load both scenes up front so a sunrise/sunset transition does not flash a blank frame.
    [LOGIN_DAY_IMAGE, LOGIN_NIGHT_IMAGE].forEach((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
    });

    document.addEventListener("visibilitychange", onVisibilityChange);
    startRefreshTimer();

    void fetch("/api/login-solar-location", {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`solar location ${response.status}`);
        return response.json() as Promise<SolarLocationPayload>;
      })
      .then((payload) => {
        if (!alive) return;
        const latitude = Number(payload.latitude);
        const longitude = Number(payload.longitude);
        if (
          Number.isFinite(latitude)
          && Number.isFinite(longitude)
          && latitude >= -90
          && latitude <= 90
          && longitude >= -180
          && longitude <= 180
        ) {
          coordinates = { latitude, longitude };
        }
        refreshPhase();
      })
      .catch(() => {
        // Fail open: device clock still chooses a reasonable day/night scene.
      });

    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (refreshTimer !== null) window.clearInterval(refreshTimer);
    };
  }, []);

  if (failed[phase]) {
    return (
      <video
        className="stone-login-stage-media"
        src={FALLBACK_LOGIN_VIDEO}
        poster={FALLBACK_LOGIN_POSTER}
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
      />
    );
  }

  return (
    <div
      className={`stone-login-stage stone-login-stage--${phase}`}
      data-solar-phase={phase}
      data-solar-source={source}
      aria-hidden="true"
    >
      <img
        className={`stone-login-stage-media stone-login-stage-media--day ${phase === "day" ? "is-active" : ""}`}
        src={LOGIN_DAY_IMAGE}
        alt=""
        loading="eager"
        decoding="async"
        draggable={false}
        onError={() => setFailed((current) => ({ ...current, day: true }))}
      />
      <img
        className={`stone-login-stage-media stone-login-stage-media--night ${phase === "night" ? "is-active" : ""}`}
        src={LOGIN_NIGHT_IMAGE}
        alt=""
        loading="eager"
        decoding="async"
        draggable={false}
        onError={() => setFailed((current) => ({ ...current, night: true }))}
      />
    </div>
  );
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
    <main className="stone-login-screen" aria-labelledby="login-title" data-owner-only-login="true">
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
          {ownerText(locale, "一般使用者不需要登入；出生資料會保存在自己的手機。這裡只保留獨立站主入口，站主登入不經 Supabase Auth。", "一般使用者不需要登录；出生资料会保存在自己的手机。这里只保留独立站主入口，站主登录不经 Supabase Auth。", "Visitors do not need an account; birth details stay on their own device. This route is reserved for the independent owner sign-in and does not use Supabase Auth.")}
        </p>

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

        <p className="stone-login-signature">{t("tagline")}</p>
        <p className="stone-login-signature"><Link to="/">{t("backHome")}</Link></p>
      </section>
    </main>
  );
}
