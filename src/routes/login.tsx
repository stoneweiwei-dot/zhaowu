import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return (
    <main className="mx-auto max-w-xl">
      <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
        <p className="text-xs tracking-[0.28em] text-cinnabar">ACCOUNT</p>
        <h1 className="mt-2 font-display text-3xl">登入昭梧</h1>
        <p className="mt-4 text-sm leading-7 text-ink-soft">
          正式帳號登入目前尚未接回這份 GitHub 主幹。這裡不會用假登入冒充完成；公開分析仍可正常使用，帳號保存功能待正式資料庫與身份驗證接線後開放。
        </p>
        <Link to="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-cinnabar px-5 text-cream">
          返回首頁
        </Link>
      </section>
    </main>
  );
}
