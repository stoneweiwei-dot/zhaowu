import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { signInWithPassword, signUpWithPassword, supabaseConfigured } from "@/lib/supabase-rest";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
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
      setError("登入服務尚未配置完成。");
      return;
    }
    if (!email.trim() || password.length < 8) {
      setError("請輸入有效 Email，密碼至少 8 位。");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const out = await signUpWithPassword(email, password, displayName || email.split("@")[0]);
        if (!out.session) {
          setMessage("帳號已建立。請到 Email 完成確認後，再回來登入。");
          setMode("login");
          return;
        }
      } else {
        await signInWithPassword(email, password);
      }
      window.dispatchEvent(new Event("zhaowu-auth-change"));
      await navigate({ to: "/account" });
    } catch (err) {
      const text = err instanceof Error ? err.message : "登入失敗。";
      setError(text.includes("Invalid login credentials") ? "Email 或密碼不正確。" : text);
    } finally {
      setBusy(false);
    }
  }

  if (!isPending && user) {
    return (
      <main className="mx-auto max-w-xl">
        <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
          <p className="text-xs tracking-[0.28em] text-cinnabar">ACCOUNT</p>
          <h1 className="mt-2 font-display text-3xl">已登入昭梧</h1>
          <p className="mt-4 text-sm leading-7 text-ink-soft">
            {user.displayName} · {user.email}{user.isOwner ? " · 站主" : ""}
          </p>
          <Link to="/account" className="mt-6 inline-flex h-11 items-center rounded-full bg-cinnabar px-5 text-cream">
            進入我的昭梧
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl">
      <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
        <p className="text-xs tracking-[0.28em] text-cinnabar">ACCOUNT</p>
        <h1 className="mt-2 font-display text-3xl">{mode === "login" ? "登入昭梧" : "建立昭梧帳號"}</h1>
        <p className="mt-3 text-sm leading-7 text-ink-soft">
          登入後會保存出生資料與最近報告；站主帳號可直接查看客戶目前可用的最高版本報告。
        </p>

        <div className="mt-5 grid grid-cols-2 rounded-full border border-line bg-paper/50 p-1 text-sm">
          <button type="button" onClick={() => setMode("login")} className={`rounded-full px-4 py-2 ${mode === "login" ? "bg-cinnabar text-cream" : "text-ink-soft"}`}>
            登入
          </button>
          <button type="button" onClick={() => setMode("signup")} className={`rounded-full px-4 py-2 ${mode === "signup" ? "bg-cinnabar text-cream" : "text-ink-soft"}`}>
            註冊
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(e) => void submit(e)}>
          {mode === "signup" ? (
            <label className="block text-sm text-ink-soft">
              <span className="mb-2 block">稱呼</span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-12 w-full rounded-md border border-line bg-cream px-4 text-base outline-none focus:border-cinnabar" placeholder="你的稱呼" />
            </label>
          ) : null}
          <label className="block text-sm text-ink-soft">
            <span className="mb-2 block">Email</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 w-full rounded-md border border-line bg-cream px-4 text-base outline-none focus:border-cinnabar" placeholder="name@example.com" />
          </label>
          <label className="block text-sm text-ink-soft">
            <span className="mb-2 block">密碼</span>
            <input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-md border border-line bg-cream px-4 text-base outline-none focus:border-cinnabar" placeholder="至少 8 位" />
          </label>

          {message ? <p className="rounded-md border border-wood/30 bg-wood/5 px-4 py-3 text-sm leading-6 text-wood">{message}</p> : null}
          {error ? <p className="rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm leading-6 text-cinnabar-deep">{error}</p> : null}

          <button type="submit" disabled={busy || !supabaseConfigured} className="h-12 w-full rounded-full bg-cinnabar px-6 text-base text-cream disabled:opacity-50">
            {busy ? "處理中…" : mode === "login" ? "登入" : "建立帳號"}
          </button>
        </form>

        <Link to="/" className="mt-5 inline-flex text-sm text-ink-mute hover:text-ink">返回首頁</Link>
      </section>
    </main>
  );
}
