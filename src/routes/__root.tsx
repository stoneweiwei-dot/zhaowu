import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteShell } from "@/components/site-shell";
import { OwnerBackgroundMusicManager } from "@/components/owner-background-music-manager";
import { OwnerConsoleOrganizer } from "@/components/owner-console-organizer";
import { displayText, useDisplayLanguage } from "@/lib/display-language";

function PublicNotFound() {
  const { language } = useDisplayLanguage();
  const title = displayText(language, "這一頁走遠了", "这一页走远了", "This page has wandered off", "ページが見つかりません", "페이지를 찾을 수 없습니다", "यह पृष्ठ नहीं मिला");
  const body = displayText(language, "網址可能已更改，或這個頁面已經不存在。你可以回到首頁，從昭梧命書重新開始。", "网址可能已更改，或这个页面已经不存在。你可以回到首页，从昭梧命书重新开始。", "The address may have changed, or this page no longer exists. Return home to continue with your ZHAOWU Destiny Book.", "URL が変更されたか、このページは存在しません。ホームに戻って続けてください。", "주소가 변경되었거나 페이지가 더 이상 존재하지 않습니다. 홈으로 돌아가 계속해 주세요.", "पता बदल गया हो सकता है या यह पृष्ठ अब मौजूद नहीं है। होम पर लौटकर आगे बढ़ें।");
  const home = displayText(language, "返回首頁", "返回首页", "Back home", "ホームへ戻る", "홈으로", "होम पर वापस");
  const updates = displayText(language, "查看最新更新", "查看最新更新", "View latest updates", "最新情報を見る", "최신 업데이트 보기", "नवीनतम अपडेट देखें");

  return (
    <main className="mx-auto max-w-xl pb-16 pt-4" data-public-not-found="true">
      <section className="seal-border rounded-2xl bg-cream/95 p-6 sm:p-8">
        <p className="text-xs tracking-[0.26em] text-cinnabar">404 · ZHAOWU</p>
        <h1 className="mt-3 font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        <p className="mt-4 text-[15px] leading-7 text-ink-soft">{body}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/" className="inline-flex min-h-12 items-center rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">{home}</Link>
          <Link to="/updates" className="inline-flex min-h-12 items-center rounded-full border border-line bg-paper px-5 py-3 text-sm text-ink">{updates}</Link>
        </div>
      </section>
    </main>
  );
}

export const Route = createRootRoute({
  notFoundComponent: PublicNotFound,
  component: () => (
    <>
      <PreviewHostBridge />
      <AuthProvider>
        <SiteShell>
          <Outlet />
        </SiteShell>
        <OwnerBackgroundMusicManager />
        <OwnerConsoleOrganizer />
      </AuthProvider>
    </>
  ),
});
