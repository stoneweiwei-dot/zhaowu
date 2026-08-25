import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  signInWithPassword,
  signUpWithPassword,
  supabaseConfigured,
} from "@/lib/supabase-rest";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();
  const { user, isPending, reload } = useCurrentUserState();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!supabaseConfigured) {
      setError(t("loginUnavailable"));
      return;
    }
    if (!email.trim() || password.length < 8) {
      setError(t("loginValidation"));
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const out = await signUpWithPassword(email, password, displayName || email.split("@")[0]);
        if (!out.session) {
          setMessage(t("accountCreated"));
          setMode("login");
          return;
        }
      } else {
        await signInWithPassword(email, password);
      }
      window.dispatchEvent(new Event("zhaowu-auth-change"));
      await reload();
      await navigate({ to: "/account" });
    } catch (err) {
      const text = err instanceof Error ? err.message : t("loginFailed");
      setError(text.includes("Invalid login credentials") ? t("invalidCredentials") : text);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="stone-login-screen">
      <div className="stone-login-art" aria-hidden>
        <div className="stone-login-orbit">
          <span />
          <span />
          <span />
          <b>昭梧</b>
        </div>
        <div className="stone-login-panel panel-a">
          <i>日主</i>
          <strong>甲木</strong>
          <em>平衡</em>
        </div>
        <div className="stone-login-panel panel-b">
          <i>流年</i>
          <strong>丙午</strong>
          <em>推演</em>
        </div>
        <div className="stone-login-art-shade" />
      </div>

      <div className="stone-login-topbar">
        <Link to="/" className="stone-login-pill">← {t("backHome")}</Link>
        <div
          role="group"
          aria-label={t("language")}
          className="flex shrink-0 items-stretch overflow-hidden rounded-full border border-[#f5e0ac]/55 bg-[#1f180e]/55 shadow-[0_8px_26px_rgba(0,0,0,.18)] backdrop-blur-md"
        >
          {([
            ["zh-Hant", "繁中"],
            ["zh-Hans", "简中"],
            ["en", "EN"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setLocale(value)}
              aria-pressed={locale === value}
              className={`min-h-[2.45rem] min-w-[2.7rem] border-r border-[#f5e0ac]/25 px-2 text-[11px] font-medium transition last:border-r-0 ${
                locale === value ? "bg-[#f1ddb0] text-[#21170d]" : "text-[#fff7df] hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="stone-login-sheet">
        {!isPending && user ? (
          <div className="text-center">
            <p className="stone-login-kicker">ACCOUNT</p>
            <h1 className="stone-login-title">{t("loggedInTitle")}</h1>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              {user.displayName} · {user.email}{user.isOwner ? ` · ${t("owner")}` : ""}
            </p>
            <Link to="/account" className="stone-login-primary mt-4">{t("enterMine")}</Link>
          </div>
        ) : (
          <>
            <div className="stone-login-sheet-head">
              <div>
                <p className="stone-login-kicker">ZHAOWU · ACCOUNT</p>
                <h1 className="stone-login-title">{mode === "login" ? t("loginTitle") : t("signupTitle")}</h1>
              </div>
              <div className="stone-login-tabs" aria-label="account mode">
                <button type="button" onClick={() => setMode("login")} className={mode === "login" ? "is-active" : ""}>{t("loginTab")}</button>
                <button type="button" onClick={() => setMode("signup")} className={mode === "signup" ? "is-active" : ""}>{t("signupTab")}</button>
              </div>
            </div>

            <form className="stone-login-form stone-login-form-member-only" onSubmit={(e) => void submit(e)}>
              {mode === "signup" ? (
                <input id="display-name" aria-label={t("displayName")} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("displayNamePh")} />
              ) : null}
              <input id="login-email" aria-label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <input id="login-password" aria-label={t("password")} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password")} />

              {message ? <p role="status" className="stone-login-message">{message}</p> : null}
              {error ? <p role="alert" className="stone-login-error">{error}</p> : null}

              <button type="submit" disabled={busy || !supabaseConfigured} className="stone-login-primary w-full disabled:opacity-50">
                {busy ? t("processing") : mode === "login" ? t("loginTab") : t("createAccount")}
              </button>
            </form>
          </>
        )}
        <p className="stone-login-signature">STONE 原創 · 2026</p>
      </section>
    </main>
  );
}
