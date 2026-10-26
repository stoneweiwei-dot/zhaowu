import { createRootRoute, Link, Outlet, type ErrorComponentProps } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteShell } from "@/components/site-shell";
import { OwnerBackgroundMusicManager } from "@/components/owner-background-music-manager";
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
          <Link to="/" className="inline-flex min-h-12 items-center rounded-sm bg-cinnabar px-5 py-3 text-sm text-cream">{home}</Link>
          <Link to="/updates" className="inline-flex min-h-12 items-center rounded-sm border border-line bg-paper px-5 py-3 text-sm text-ink">{updates}</Link>
        </div>
      </section>
    </main>
  );
}

/** Recover without deleting birth details, purchase references or saved reports. */
export function PublicRouteError({ reset }: ErrorComponentProps) {
  const { language } = useDisplayLanguage();
  const text = (hant: string, hans: string, en: string) => language === "en" ? en : language === "zh-Hans" ? hans : hant;
  return <main className="mx-auto max-w-xl px-5 py-16" data-route-recovery>
    <h1 className="font-display text-2xl">{text("頁面暫時無法顯示", "页面暂时无法显示", "This page could not load")}</h1>
    <p className="mt-4 text-sm leading-7">{text("已保存的生辰與報告不會被清除。請重新載入；若仍出現錯誤，可返回首頁或從「我的報告」重開。", "已保存的生辰与报告不会被清除。请重新载入；若仍出现错误，可返回首页或从“我的报告”重开。", "Your saved birth details and reports are kept. Reload, or return home and reopen the report from My reports.")}</p>
    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" className="min-h-11 rounded-lg bg-cinnabar px-5 text-cream" onClick={() => { reset(); window.location.reload(); }}>{text("重新載入", "重新载入", "Reload")}</button>
      <a href="/" className="min-h-11 rounded-lg border border-line px-5 py-3">{text("返回首頁", "返回首页", "Home")}</a>
      <a href="/history" className="min-h-11 rounded-lg border border-line px-5 py-3">{text("我的報告", "我的报告", "My reports")}</a>
    </div>
  </main>;
}

export const Route = createRootRoute({
  notFoundComponent: PublicNotFound,
  errorComponent: PublicRouteError,
  component: () => (
    <>
      <PreviewHostBridge />
      <AuthProvider>
        <SiteShell>
          <Outlet />
        </SiteShell>
        <OwnerBackgroundMusicManager />
      </AuthProvider>
    </>
  ),
});
