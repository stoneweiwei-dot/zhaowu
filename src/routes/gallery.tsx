import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandUiLibrary } from "@/components/brand-ui-library";
import { OwnerGalleryManager } from "@/components/owner-gallery-manager";
import { OwnerLoginVisualsManager } from "@/components/owner-login-visuals-manager";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createOwnerCookieSession } from "@/lib/owner-data-client";
import type { SupabaseSession } from "@/lib/supabase-rest";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/gallery")({ component: GalleryPage });

function GalleryPage() {
  const { locale } = useI18n();
  const { user, session: authSession, isPending } = useCurrentUserState();
  const session = user?.isOwner && !authSession
    ? createOwnerCookieSession() as SupabaseSession
    : authSession;
  const tx = (hant: string, hans: string, en: string) => locale === "en" ? en : locale === "zh-Hans" ? hans : hant;

  if (isPending) return <div className="mx-auto h-52 max-w-3xl animate-pulse rounded-xl bg-cream/70" />;
  if (!user) return <main className="mx-auto max-w-xl"><section className="seal-border rounded-xl bg-cream/95 p-6"><h1 className="font-display text-3xl">{tx("請先登入站主帳號", "请先登录站主账号", "Owner sign-in required")}</h1><Link to="/login" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-cinnabar px-5 text-cream">{tx("登入", "登录", "Sign in")}</Link></section></main>;
  if (!user.isOwner) return <main className="mx-auto max-w-xl"><section className="seal-border rounded-xl bg-cream/95 p-6"><h1 className="font-display text-3xl">{tx("圖庫管理僅限站主", "图库管理仅限站主", "Gallery administration is owner-only")}</h1><Link to="/account" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-5">← {tx("帳戶", "账户", "Account")}</Link></section></main>;

  return <main className="mx-auto max-w-5xl space-y-5 pb-12" data-owner-gallery-console>
    <BrandUiLibrary locale={locale} />
    {session ? <>
      <OwnerLoginVisualsManager session={session} locale={locale} />
      <OwnerGalleryManager session={session} locale={locale} />
    </> : <section className="seal-border rounded-xl bg-cream/95 p-5 sm:p-6" data-owner-gallery-data-offline>
      <p className="text-xs tracking-[0.22em] text-cinnabar">OWNER · GALLERY</p>
      <h2 className="mt-2 font-display text-2xl text-ink">{tx("站主已登入，不需要重新登入", "站主已登录，不需要重新登录", "Owner sign-in is already valid")}</h2>
      <p className="mt-3 text-sm leading-7 text-ink-soft">{tx(
        "目前這兩個舊管理面板仍依賴 Supabase 資料 session；當資料服務被 spend cap 暫停時，只暫停需要 Supabase 的上傳／刪除操作，不再錯誤顯示「請先登入」。上方昭梧品牌素材庫仍可正常查看。",
        "目前这两个旧管理面板仍依赖 Supabase 数据 session；当数据服务被 spend cap 暂停时，只暂停需要 Supabase 的上传／删除操作，不再错误显示“请先登录”。上方昭梧品牌素材库仍可正常查看。",
        "These two legacy management panels still require a Supabase data session. When that data service is paused by the spend cap, only Supabase-backed upload/delete actions are unavailable; the page no longer falsely asks an already-authenticated owner to sign in again. The Zhaowu brand library above remains available."
      )}</p>
    </section>}
    <Link to="/account" className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-5 text-sm text-ink-soft">← {tx("站主後台", "站主后台", "Owner console")}</Link>
  </main>;
}
