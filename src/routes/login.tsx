import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { sendMagicLink, signInWithPassword, signUpWithPassword } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(kind: "login" | "signup" | "magic") {
    setBusy(kind); setMsg(null);
    try {
      if (!email.trim()) throw new Error("请输入邮箱。");
      if (kind !== "magic" && password.length < 6) throw new Error("密码至少 6 位。");
      if (kind === "login") {
        const { error } = await signInWithPassword(email, password);
        if (error) throw error;
        window.location.assign("/account");
      } else if (kind === "signup") {
        const { data, error } = await signUpWithPassword(email, password);
        if (error) throw error;
        setMsg(data.session ? "账号已建立并登录。" : "账号已建立。请到邮箱完成确认后再登录。");
      } else {
        const { error } = await sendMagicLink(email);
        if (error) throw error;
        setMsg("登录链接已发送到邮箱。");
      }
    } catch (err) { setMsg(err instanceof Error ? err.message : "登录失败。"); }
    finally { setBusy(null); }
  }

  if (isPending) return <div className="h-40 animate-pulse rounded-xl bg-cream/70" />;
  if (user) return <section className="seal-border rounded-xl bg-cream/95 p-6"><h1 className="font-display text-2xl">你已经登录</h1><p className="mt-3 text-sm text-ink-soft">{user.email}</p><Link to="/account" className="mt-5 inline-flex rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">进入我的昭梧</Link></section>;

  return (
    <section className="mx-auto max-w-lg seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
      <p className="text-xs tracking-[0.28em] text-cinnabar">昭梧账号</p>
      <h1 className="mt-2 font-display text-3xl">一个入口，会员与站主共用</h1>
      <p className="mt-3 text-sm leading-7 text-ink-soft">登录后自动记住出生资料、保存报告并继续追问。站主使用已登记的 Outlook / Hotmail 邮箱登录后，会自动获得站主权限，不再另设一套站主密码。</p>
      <div className="mt-6 space-y-4">
        <label className="block text-xs text-ink-mute">邮箱<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-cream px-3 text-sm" /></label>
        <label className="block text-xs text-ink-mute">密码<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-cream px-3 text-sm" /></label>
        <div className="grid gap-2 sm:grid-cols-2"><button disabled={Boolean(busy)} onClick={() => void run("login")} className="h-11 rounded-full bg-cinnabar px-5 text-sm text-cream disabled:opacity-50">{busy === "login" ? "登录中…" : "登录"}</button><button disabled={Boolean(busy)} onClick={() => void run("signup")} className="h-11 rounded-full border border-line px-5 text-sm disabled:opacity-50">{busy === "signup" ? "建立中…" : "建立账号"}</button></div>
        <button disabled={Boolean(busy)} onClick={() => void run("magic")} className="h-11 w-full rounded-full border border-line bg-paper/50 px-5 text-sm disabled:opacity-50">{busy === "magic" ? "发送中…" : "发邮件登录链接"}</button>
        {msg ? <p className="rounded-md bg-paper px-3 py-3 text-sm leading-6 text-ink-soft">{msg}</p> : null}
      </div>
    </section>
  );
}
