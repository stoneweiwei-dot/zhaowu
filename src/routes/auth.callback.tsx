import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { captureOAuthRedirect } from "@/lib/supabase-rest";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth/callback")({ component: AuthCallbackPage });

function AuthCallbackPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { reload } = useCurrentUserState();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        await captureOAuthRedirect();
        await reload();
        if (!alive) return;
        await navigate({ to: "/account" });
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : t("loginFailed"));
      }
    })();
    return () => { alive = false; };
  }, [navigate, reload, t]);

  const pending = locale === "en" ? "Finishing sign-in…" : locale === "zh-Hans" ? "正在完成登录…" : "正在完成登入…";
  const failedTitle = locale === "en" ? "Sign-in could not finish" : locale === "zh-Hans" ? "登录未能完成" : "登入未能完成";

  return (
    <main className="stone-login-screen" data-auth-callback="true" aria-labelledby="auth-callback-title">
      <section className="stone-login-sheet seal-border">
        <h1 id="auth-callback-title" className="stone-login-title">{error ? failedTitle : pending}</h1>
        {error ? <p className="stone-login-error" role="alert">{error}</p> : <p className="stone-login-lead">{pending}</p>}
        <p className="stone-login-signature">
          <Link to="/login">{t("navLogin")}</Link>
          {" · "}
          <Link to="/">{t("backHome")}</Link>
        </p>
      </section>
    </main>
  );
}
