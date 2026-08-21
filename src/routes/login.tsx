import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  captureOAuthRedirect,
  signInWithPassword,
  signUpWithPassword,
  startOAuth,
  supabaseConfigured,
  type OAuthProvider,
} from "@/lib/supabase-rest";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user, isPending, reload } = useCurrentUserState();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<OAuthProvider | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Safari restores this page from its back-forward cache after a failed
    // provider redirect. Clear the transient OAuth lock so Email remains usable.
    const resetOAuthBusy = () => setOauthBusy(null);
    window.addEventListener("pageshow", resetOAuthBusy);
    window.addEventListener("focus", resetOAuthBusy);

    let alive = true;
    void (async () => {
      try {
        const session = await captureOAuthRedirect();
        if (!alive || !session) return;
        window.dispatchEvent(new Event("zhaowu-auth-change"));
        await reload();
        await navigate({ to: "/account" });
      } catch (err) {
        if (!alive) return;
        const text = err instanceof Error ? err.message : t("loginFailed");
        setError(text);
      }
    })();
    return () => {
      alive = false;
      window.removeEventListener("pageshow", resetOAuthBusy);
      window.removeEventListener("focus", resetOAuthBusy);
    };
  }, [navigate, reload, t]);

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
      await navigate({ to: "/account" });
    } catch (err) {
      const text = err instanceof Error ? err.message : t("loginFailed");
      setError(text.includes("Invalid login credentials") ? t("invalidCredentials") : text);
    } finally {
      setBusy(false);
    }
  }

  function onOAuth(provider: OAuthProvider) {
    setError(null);
    setMessage(null);
    if (!supabaseConfigured) {
      setError(t("loginUnavailable"));
      return;
    }
    setOauthBusy(provider);
    try {
      startOAuth(provider);
    } catch (err) {
      const text = err instanceof Error ? err.message : t("loginFailed");
      setError(text);
      setOauthBusy(null);
    }
  }

  if (!isPending && user) {
    return (
      <main className="mx-auto max-w-xl">
        <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
          <p className="text-xs tracking-[0.28em] text-cinnabar">ACCOUNT</p>
          <h1 className="mt-2 font-display text-3xl">{t("loggedInTitle")}</h1>
          <p className="mt-4 text-sm leading-7 text-ink-soft">
            {user.displayName} · {user.email}{user.isOwner ? ` · ${t("owner")}` : ""}
          </p>
          <Link to="/account" className="mt-6 inline-flex h-11 items-center rounded-full bg-cinnabar px-5 text-cream">
            {t("enterMine")}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl">
      <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
        <p className="text-xs tracking-[0.28em] text-cinnabar">ACCOUNT</p>
        <h1 className="mt-2 font-display text-3xl">{mode === "login" ? t("loginTitle") : t("signupTitle")}</h1>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{t("loginPageLead")}</p>

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            disabled={!supabaseConfigured || oauthBusy !== null}
            onClick={() => onOAuth("google")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-cream px-4 text-sm text-ink disabled:opacity-50"
          >
            {oauthBusy === "google" ? t("processing") : t("withGoogle")}
          </button>
          <button
            type="button"
            disabled={!supabaseConfigured || oauthBusy !== null}
            onClick={() => onOAuth("apple")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line bg-cream px-4 text-sm text-ink disabled:opacity-50"
          >
            {oauthBusy === "apple" ? t("processing") : t("withApple")}
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-[11px] tracking-[0.18em] text-ink-mute">
          <span className="h-px flex-1 bg-line" />
          <span>{t("orEmail")}</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="grid grid-cols-2 rounded-full border border-line bg-paper/50 p-1 text-sm">
          <button type="button" onClick={() => setMode("login")} className={`rounded-full px-4 py-2 ${mode === "login" ? "bg-cinnabar text-cream" : "text-ink-soft"}`}>
            {t("loginTab")}
          </button>
          <button type="button" onClick={() => setMode("signup")} className={`rounded-full px-4 py-2 ${mode === "signup" ? "bg-cinnabar text-cream" : "text-ink-soft"}`}>
            {t("signupTab")}
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(e) => void submit(e)}>
          {mode === "signup" ? (
            <label htmlFor="display-name" className="block text-sm text-ink-soft">
              <span className="mb-2 block">{t("displayName")}</span>
              <input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-12 w-full rounded-md border border-line bg-cream px-4 text-base outline-none focus:border-cinnabar" placeholder={t("displayNamePh")} />
            </label>
          ) : null}
          <label htmlFor="login-email" className="block text-sm text-ink-soft">
            <span className="mb-2 block">Email</span>
            <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-md border border-line bg-cream px-4 text-base outline-none focus:border-cinnabar" placeholder="name@example.com" />
          </label>
          <label htmlFor="login-password" className="block text-sm text-ink-soft">
            <span className="mb-2 block">{t("password")}</span>
            <input id="login-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-md border border-line bg-cream px-4 text-base outline-none focus:border-cinnabar" placeholder={t("passwordPh")} />
          </label>

          {message ? <p role="status" className="rounded-md border border-wood/30 bg-wood/5 px-4 py-3 text-sm leading-6 text-wood">{message}</p> : null}
          {error ? <p role="alert" className="rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm leading-6 text-cinnabar-deep">{error}</p> : null}

          <button type="submit" disabled={busy || !supabaseConfigured} className="h-12 w-full rounded-full bg-cinnabar px-6 text-base text-cream disabled:opacity-50">
            {busy ? t("processing") : mode === "login" ? t("loginTab") : t("createAccount")}
          </button>
        </form>

        <Link to="/" className="mt-5 inline-flex text-sm text-ink-mute hover:text-ink">{t("backHome")}</Link>
      </section>
    </main>
  );
}
