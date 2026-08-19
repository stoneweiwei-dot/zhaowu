import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  return (
    <main className="mx-auto max-w-xl">
      <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
        <p className="text-xs tracking-[0.28em] text-cinnabar">MY ZHAOWU</p>
        <h1 className="mt-2 font-display text-3xl">我的昭梧</h1>
        <p className="mt-4 text-sm leading-7 text-ink-soft">
          帳號存檔與歷史報告目前尚未接回正式資料庫。為避免把測試資料當成客戶資料，這一頁暫不顯示任何假報告。
        </p>
        <Link to="/" className="mt-6 inline-flex h-11 items-center rounded-full border border-line bg-cream px-5 text-ink">
          返回首頁
        </Link>
      </section>
    </main>
  );
}
