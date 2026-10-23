import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { validateMemberForm, type MemberMode } from "@/lib/auth/member-form";
import {
  loginVisitor,
  registerVisitor,
  requestVisitorPasswordReset,
  logoutVisitor,
  useVisitor,
  VisitorAuthError,
} from "@/lib/auth/visitor";
import "./visitor-entrance.css";

type FormMode = Extract<MemberMode, "login" | "signup" | "forgot">;

function textFor(locale: string) {
  const tx = (hant: string, hans: string, en: string) => locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
  return {
    heading: tx("訪客登入", "访客登录", "Visitor sign in"),
    subtitle: tx("真正的會員入口 · 可輸入帳號與密碼", "真实的会员入口 · 可输入账号与密码", "A real account sign-in, not an animated form"),
    login: tx("登入", "登录", "Sign in"),
    signup: tx("註冊", "注册", "Register"),
    email: tx("Email／會員帳號", "Email／会员账号", "Email / member account"),
    password: tx("密碼", "密码", "Password"),
    confirm: tx("確認密碼", "确认密码", "Confirm password"),
    name: tx("暱稱（選填）", "昵称（选填）", "Nickname (optional)"),
    submitLogin: tx("登入昭梧", "登录昭梧", "Sign in to ZHAOWU"),
    submitSignup: tx("註冊並登入", "注册并登录", "Create account & sign in"),
    submitting: tx("處理中…", "处理中…", "Working…"),
    guest: tx("免登入進入網站", "免登录进入网站", "Continue without signing in"),
    about: tx("認識昭梧特色", "认识昭梧特色", "Discover ZHAOWU"),
    forgot: tx("忘記密碼？", "忘记密码？", "Forgot password?"),
    sendReset: tx("寄送重設密碼連結", "发送重置密码链接", "Send password reset link"),
    back: tx("返回登入", "返回登录", "Back to sign in"),
    optional: tx("也可以直接以訪客身份瀏覽，無須註冊。", "也可以直接以访客身份浏览，无须注册。", "You can also browse freely without an account."),
    signedIn: tx("已登入會員帳號", "已登录会员账号", "Signed in as a member"),
    signOut: tx("登出", "登出", "Sign out"),
    resetting: tx("如果這個信箱已註冊，重設連結就會寄出。請查看收件匣與垃圾郵件。", "如果这个邮箱已注册，重置链接就会寄出。请查看收件箱和垃圾邮件。", "If this account exists, a reset link has been sent. Check inbox and spam."),
    invalidEmail: tx("請輸入正確 Email。", "请输入正确 Email。", "Enter a valid email address."),
    invalidPassword: tx("密碼需要 8 至 72 個字元。", "密码需要 8 至 72 个字符。", "Password must be 8–72 characters."),
    mismatch: tx("兩次輸入的密碼不一致。", "两次输入的密码不一致。", "The passwords do not match."),
    exists: tx("此 Email 已註冊，請直接登入。", "此 Email 已注册，请直接登录。", "This email already exists. Sign in instead."),
    badCredentials: tx("Email 或密碼不正確。", "Email 或密码不正确。", "Incorrect email or password."),
    rate: tx("操作太頻繁，請稍後重試。", "操作太频繁，请稍后重试。", "Too many attempts. Please try later."),
    network: tx("連線失敗或逾時，請檢查網路。", "连接失败或超时，请检查网络。", "Network failed or timed out."),
    failed: tx("暫時無法完成，請稍後重試。", "暂时无法完成，请稍后重试。", "Unable to complete right now. Try later."),
  };
}

/**
 * Public homepage entry only. Real React inputs connected to the existing optional
 * visitor Supabase auth flow. Owner Face ID/password remain on a separate /login.
 * Deliberately NO stock / AI MP4 assets with fake baked-in form fields.
 */
export function VisitorEntrance({ locale }: { locale: string }) {
  const c = textFor(locale);
  const { visitor, pending } = useVisitor();
  const [mode, setMode] = useState<FormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const errorLabels: Record<string, string> = {
    INVALID_EMAIL: c.invalidEmail, INVALID_PASSWORD: c.invalidPassword,
    PASSWORD_MISMATCH: c.mismatch, EMAIL_EXISTS: c.exists,
    BAD_CREDENTIALS: c.badCredentials, RATE_LIMITED: c.rate,
    NETWORK: c.network, FAILED: c.failed,
  };

  function switchMode(next: FormMode) {
    if (busy) return;
    setMode(next);
    setPassword("");
    setConfirmation("");
    setError("");
    setNotice("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");
    const cleanEmail = email.trim().toLowerCase();
    const validation = validateMemberForm(mode, cleanEmail, password, confirmation);
    if (validation) { setError(errorLabels[validation]); return; }
    if (mode === "signup" && password !== confirmation) {
      setError(c.mismatch);
      return;
    }
    setBusy(true);
    try {
      if (mode === "forgot") {
        await requestVisitorPasswordReset(cleanEmail);
        setNotice(c.resetting);
      } else {
        if (mode === "signup") await registerVisitor(cleanEmail, password, nickname);
        await loginVisitor(cleanEmail, password);
        setPassword("");
        setConfirmation("");
      }
    } catch (caught) {
      const code = caught instanceof VisitorAuthError ? caught.code : "FAILED";
      setError(errorLabels[code] ?? c.failed);
      if (code === "EMAIL_EXISTS") setMode("login");
    } finally {
      setBusy(false);
    }
  }

  return <section className="zw-visitor-entry" data-public-visitor-login aria-label={c.heading}>
    <img className="zw-visitor-art" src="/theme-skins/reference-day-flute.webp" alt="" width={1248} height={1248} fetchPriority="high" aria-hidden="true" />
    <div className="zw-visitor-entry-shade" aria-hidden="true" />
    <div className="zw-visitor-entry-content">
      <div className="zw-visitor-entry-brand"><strong>昭梧</strong><span>Z H A O W U</span></div>
      <div className="zw-visitor-auth-card" data-visitor-auth-card>
        <span className="zw-visitor-eyebrow">ZHAOWU · MEMBER</span>
        <h2>{c.heading}</h2>
        <p className="zw-visitor-subtitle">{c.subtitle}</p>
        {pending ? <p role="status" className="zw-visitor-hint">{c.submitting}</p> : visitor ? <>
          <p className="zw-visitor-signed" role="status">{c.signedIn}<strong>{visitor.email}</strong></p>
          <button className="zw-visitor-logout" type="button" disabled={busy} onClick={() => {
            setBusy(true);
            void logoutVisitor().catch(() => setError(c.network)).finally(() => setBusy(false));
          }}>{c.signOut}</button>
        </> : <>
          {mode !== "forgot" && <div className="zw-visitor-tabs" role="group" aria-label={c.heading}>
            <button type="button" className={mode === "login" ? "is-active" : ""} aria-pressed={mode === "login"} onClick={() => switchMode("login")}>{c.login}</button>
            <button type="button" className={mode === "signup" ? "is-active" : ""} aria-pressed={mode === "signup"} onClick={() => switchMode("signup")}>{c.signup}</button>
          </div>}
          <form className="zw-visitor-form" data-public-visitor-form onSubmit={submit} noValidate aria-busy={busy}>
            {mode === "signup" && <label>{c.name}
              <input type="text" autoComplete="nickname" maxLength={40} value={nickname} onChange={e => setNickname(e.target.value)} />
            </label>}
            <label>{c.email}
              <input type="email" inputMode="email" autoComplete="username" name="visitor-email" required value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            {mode !== "forgot" && <label>{c.password}
              <input type="password" name="visitor-password" minLength={8} maxLength={72} autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={password} onChange={e => setPassword(e.target.value)} />
            </label>}
            {mode === "signup" && <label>{c.confirm}
              <input type="password" minLength={8} maxLength={72} autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} />
            </label>}
            {error && <p className="zw-visitor-error" role="alert">{error}</p>}
            {notice && <p className="zw-visitor-notice" role="status">{notice}</p>}
            <button type="submit" className="zw-visitor-submit" disabled={busy}>{busy ? c.submitting : mode === "forgot" ? c.sendReset : mode === "signup" ? c.submitSignup : c.submitLogin}</button>
          </form>
          <div className="zw-visitor-reset">
            <button type="button" disabled={busy} onClick={() => switchMode(mode === "forgot" ? "login" : "forgot")}>{mode === "forgot" ? c.back : c.forgot}</button>
          </div>
        </>}
        <nav className="zw-visitor-entry-links" aria-label={c.guest}>
          <a href="#home-guide" data-public-guest-entry>{c.guest} <span aria-hidden="true">↓</span></a>
          <Link to="/about" data-public-features-link>{c.about} <span aria-hidden="true">↗</span></Link>
        </nav>
        <p className="zw-visitor-hint">{c.optional}</p>
      </div>
    </div>
  </section>;
}
