import { createFileRoute, Link } from "@tanstack/react-router";
import { OwnerGalleryManager } from "@/components/owner-gallery-manager";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/gallery")({ component: GalleryPage });

function GalleryPage() {
  const { locale } = useI18n();
  const { user, session, isPending } = useCurrentUserState();

  if (isPending) return <div className="mx-auto h-52 max-w-3xl animate-pulse rounded-xl bg-cream/70" />;

  if (!user || !session) {
    return (
      <main className="mx-auto max-w-xl">
        <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
          <p className="text-xs tracking-[0.28em] text-cinnabar">ZHAOWU GALLERY</p>
          <h1 className="mt-2 font-display text-3xl">{locale === "en" ? "Owner sign-in required" : locale === "zh-Hans" ? "请先登录站主账号" : "請先登入站主帳號"}</h1>
          <Link to="/login" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-cinnabar px-5 text-cream">{locale === "en" ? "Sign in" : locale === "zh-Hans" ? "登录" : "登入"}</Link>
        </section>
      </main>
    );
  }

  if (!user.isOwner) {
    return (
      <main className="mx-auto max-w-xl">
        <section className="seal-border rounded-xl bg-cream/95 p-6 sm:p-8">
          <p className="text-xs tracking-[0.28em] text-cinnabar">OWNER ONLY</p>
          <h1 className="mt-2 font-display text-3xl">{locale === "en" ? "Gallery administration is owner-only" : locale === "zh-Hans" ? "图库管理仅限站主" : "圖庫管理僅限站主"}</h1>
          <Link to="/account" className="mt-6 inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-5 text-ink-soft">← {locale === "en" ? "Back to account" : locale === "zh-Hans" ? "返回账户" : "返回帳戶"}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-5 pb-12">
      <OwnerGalleryManager session={session} locale={locale} />
      <Link to="/account" className="inline-flex min-h-11 items-center rounded-full border border-line bg-cream px-5 text-sm text-ink-soft">← {locale === "en" ? "Owner console" : locale === "zh-Hans" ? "站主后台" : "站主後台"}</Link>
    </main>
  );
}
