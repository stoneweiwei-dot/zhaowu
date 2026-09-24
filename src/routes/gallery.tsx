import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { OwnerGalleryManager } from "@/components/owner-gallery-manager";
import { OwnerLoginVisualsManager } from "@/components/owner-login-visuals-manager";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/gallery")({ component: GalleryPage });

type MediaView = "login" | "content";

function GalleryPage() {
  const { locale } = useI18n();
  const { user, session, isPending } = useCurrentUserState();
  const [view, setView] = useState<MediaView>("login");
  const tx = (hant: string, hans: string, en: string) => locale === "en" ? en : locale === "zh-Hans" ? hans : hant;

  if (isPending) return <div className="mx-auto h-52 max-w-3xl animate-pulse rounded-xl bg-cream/70" />;
  if (!user) return <main className="mx-auto max-w-xl"><section className="seal-border rounded-xl bg-cream/95 p-6"><h1 className="font-display text-3xl">{tx("請先登入站主帳號", "请先登录站主账号", "Owner sign-in required")}</h1><Link to="/login" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-cinnabar px-5 text-cream">{tx("登入", "登录", "Sign in")}</Link></section></main>;
  if (!user.isOwner) return <main className="mx-auto max-w-xl"><section className="seal-border rounded-xl bg-cream/95 p-6"><h1 className="font-display text-3xl">{tx("圖庫管理僅限站主", "图库管理仅限站主", "Gallery administration is owner-only")}</h1><Link to="/account" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-5">← {tx("帳戶", "账户", "Account")}</Link></section></main>;

  return (
    <main className="mx-auto max-w-5xl space-y-4 pb-12" data-owner-gallery-console>
      <section className="seal-border rounded-[1.35rem] bg-cream/95 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.22em] text-cinnabar">MEDIA</p>
            <h1 className="mt-1 font-display text-3xl">{tx("素材管理", "素材管理", "Media")}</h1>
          </div>
          <Link to="/account" className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line bg-paper/70 px-4 text-sm text-ink-soft">← {tx("後台", "后台", "Console")}</Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2" role="tablist" aria-label={tx("素材分類", "素材分类", "Media type")}>
          <button
            type="button"
            role="tab"
            aria-selected={view === "login"}
            onClick={() => setView("login")}
            className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${view === "login" ? "border-[#315f51] bg-[#315f51] text-[#fffaf0]" : "border-line bg-paper/55 text-ink-soft"}`}
          >
            {tx("登入影片", "登录视频", "Login videos")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "content"}
            onClick={() => setView("content")}
            className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${view === "content" ? "border-[#315f51] bg-[#315f51] text-[#fffaf0]" : "border-line bg-paper/55 text-ink-soft"}`}
          >
            {tx("內容圖片", "内容图片", "Content images")}
          </button>
        </div>
      </section>

      {session ? (
        view === "login"
          ? <OwnerLoginVisualsManager session={session} locale={locale} />
          : <OwnerGalleryManager session={session} locale={locale} />
      ) : (
        <section className="rounded-xl border border-line bg-paper/45 px-4 py-4" data-owner-gallery-data-offline>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">{tx("資料功能暫停", "数据功能暂停", "Data tools paused")}</p>
            <span className="rounded-full border border-line bg-cream/80 px-3 py-1 text-xs text-ink-mute">{tx("稍後自動恢復", "稍后自动恢复", "Auto-resumes")}</span>
          </div>
        </section>
      )}
    </main>
  );
}
