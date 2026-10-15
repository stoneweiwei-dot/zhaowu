import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  loginVisitor,
  logoutVisitor,
  registerVisitor,
  useVisitor,
  VisitorAuthError,
} from "@/lib/auth/visitor";

export const Route = createFileRoute("/member")({ component: MemberPage });

type Mode = "login" | "signup";

function MemberPage() {
  const { locale } = useI18n();
  const tx = (hant: string, hans: string, en: string) => (locale === "en" ? en : locale === "zh-Hans" ? hans : hant);
  const { visitor, pending } = useVisitor();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const errorText: Record<string, string> = {
    INVALID_EMAIL: tx("Email 格式不正確。", "Email 格式不正确。", "That email address looks invalid."),
    INVALID_PASSWORD: tx("密碼需要 8 到 72 個字元。", "密码需要 8 到 72 个字符。", "Password must be 8 to 72 characters."),
    EMAIL_EXISTS: tx("這個 Email 已註冊，請直接登入。", "这个 Email 已注册，请直接登录。", "This email is already registered. Please sign in."),
    RATE_LIMITED: tx("嘗試次數太多，請一小時後再試。", "尝试次数太多，请一小时后再试。", "Too many attempts. Please try again in an hour."),
    BAD_CREDENTIALS: tx("Email 或密碼不正確。", "Email 或密码不正确。", "Incorrect email or password."),
    NETWORK: tx("連線失敗，請檢查網路後再試。", "连接失败，请检查网络后再试。", "Connection failed. Check your network and try again."),
    FAILED: tx("操作失敗，請稍後再試。", "操作失败，请稍后再试。", "Something went wrong. Please try again."),
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (password.length < 8) { setError(errorText.INVALID_PASSWORD); return; }
    setBusy(true);
    try {
      if (mode === "signup") await registerVisitor(cleanEmail, password, name);
      await loginVisitor(cleanEmail, password);
      setPassword("");
    } catch (err) {
      const code = err instanceof VisitorAuthError ? err.code : "FAILED";
      setError(errorText[code] ?? errorText.FAILED);
      if (code === "EMAIL_EXISTS") setMode("login");
    } finally {
      setBusy(false);
    }
  }

  const field = "mt-1 h-12 w-full rounded-lg border border-line bg-cream px-4 text-base outline-none focus:border-cinnabar";

  return (
    <main className="mx-auto max-w-md space-y-5" data-member-page>
      <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
        <p className="text-xs tracking-[0.28em] text-cinnabar">MEMBER</p>
        <h1 className="mt-1 font-display text-3xl">{visitor ? tx("我的帳號", "我的账号", "My account") : mode === "login" ? tx("會員登入", "会员登录", "Sign in") : tx("建立帳號", "创建账号", "Create account")}</h1>
        <p className="mt-3 text-sm leading-7 text-ink-soft">
          {tx("不登入也能使用目前所有功能。帳號用來之後跨裝置保存報告與購買紀錄，註冊不需要收驗證信。", "不登录也能使用目前所有功能。账号用来之后跨设备保存报告与购买记录，注册不需要收验证邮件。", "Everything works without signing in. An account is for keeping reports and purchases across devices later. No confirmation email is needed.")}
        </p>

        {pending ? <div className="mt-6 h-24 animate-pulse rounded-lg bg-paper-deep" /> : visitor ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg border border-line bg-paper/60 px-4 py-3 text-sm">
              {tx("已登入：", "已登录：", "Signed in as ")}<b className="break-all">{visitor.email}</b>
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/history" className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-5 text-sm">{tx("我的報告", "我的报告", "My reports")}</Link>
              <Link to="/" className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-5 text-sm">{tx("回首頁", "回首页", "Home")}</Link>
              <button type="button" onClick={() => void logoutVisitor()} className="min-h-11 rounded-full border border-line bg-paper/60 px-5 text-sm text-ink-soft">{tx("登出", "登出", "Sign out")}</button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-line bg-paper/60 p-1" role="tablist">
              {(["login", "signup"] as Mode[]).map((value) => (
                <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => { setMode(value); setError(""); }} className={`min-h-11 rounded-full text-sm font-medium ${mode === value ? "bg-wood text-cream" : "text-ink-soft"}`}>
                  {value === "login" ? tx("登入", "登录", "Sign in") : tx("註冊", "注册", "Sign up")}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              {mode === "signup" ? (
                <label className="block text-sm"><span>{tx("暱稱（選填）", "昵称（选填）", "Nickname (optional)")}</span>
                  <input className={field} value={name} maxLength={40} autoComplete="nickname" onChange={(e) => setName(e.target.value)} />
                </label>
              ) : null}
              <label className="block text-sm"><span>Email</span>
                <input className={field} type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className="block text-sm"><span>{tx("密碼（至少 8 個字元）", "密码（至少 8 个字符）", "Password (8+ characters)")}</span>
                <input className={field} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              {error ? <p role="alert" className="rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm text-cinnabar-deep">{error}</p> : null}
              <button type="submit" disabled={busy} className="min-h-12 w-full rounded-full bg-cinnabar px-5 text-base font-medium text-cream disabled:opacity-50">
                {busy ? tx("處理中…", "处理中…", "Working…") : mode === "login" ? tx("登入", "登录", "Sign in") : tx("建立帳號並登入", "创建账号并登录", "Create account and sign in")}
              </button>
            </form>
            <p className="mt-4 text-xs leading-6 text-ink-mute">{tx("目前不支援信箱找回密碼，請記好密碼。", "目前不支持邮箱找回密码，请记好密码。", "Password reset by email is not available yet. Please keep your password safe.")}</p>
          </>
        )}
      </section>
    </main>
  );
}
