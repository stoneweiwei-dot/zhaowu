import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { displayText, intlTagFor, useDisplayLanguage } from "@/lib/display-language";
import { getPublicSiteStats, SITE_RELEASE_FALLBACK, type PublicSiteStats } from "@/lib/site-stats";

export const Route = createFileRoute("/updates")({ component: UpdatesPage });

function UpdatesPage() {
  const { language } = useDisplayLanguage();
  const [release, setRelease] = useState<PublicSiteStats>({
    totalVisits: 0,
    todayVisits: 0,
    version: SITE_RELEASE_FALLBACK.version,
    updateNumber: SITE_RELEASE_FALLBACK.updateNumber,
    publishedAt: SITE_RELEASE_FALLBACK.publishedAt,
    latestSummary: SITE_RELEASE_FALLBACK.latestSummary,
  });

  useEffect(() => {
    let active = true;
    void getPublicSiteStats().then((value) => { if (active) setRelease(value); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const currentFallback = release.version === SITE_RELEASE_FALLBACK.version;
  const englishSummary = "Owner music is now quieter and cleaner, batch actions appear only after selection, and public music reads avoid the legacy URL path that caused Node 24 warnings."
  const releaseSummary = language === "en" && /[\u3400-\u9fff]/u.test(release.latestSummary)
    ? englishSummary
    : release.latestSummary;
  const details = currentFallback
    ? SITE_RELEASE_FALLBACK.details[language === "en" ? "en" : "zh-Hant"]
    : [releaseSummary];
  const published = release.publishedAt
    ? new Intl.DateTimeFormat(intlTagFor(language), { year: "numeric", month: "long", day: "numeric" }).format(new Date(release.publishedAt))
    : "";

  const title = displayText(language, "最新版本更新內容", "最新版本更新内容", "Latest release", "最新バージョン", "최신 버전", "नवीनतम संस्करण");
  const currentLabel = displayText(language, "目前正式版本", "当前正式版本", "Current production release", "現在の正式版", "현재 프로덕션 버전", "वर्तमान प्रोडक्शन संस्करण");
  const backLabel = displayText(language, "返回首頁", "返回首页", "Back to home", "ホームへ戻る", "홈으로", "होम पर वापस");

  return (
    <main className="zhaowu-updates-page" data-updates-page>
      <section className="zhaowu-updates-hero seal-border">
        <p className="zhaowu-updates-kicker">RELEASE NOTES</p>
        <h1>{title}</h1>
        <p className="zhaowu-updates-lead">{releaseSummary}</p>
      </section>

      <section className="zhaowu-updates-card" aria-labelledby="current-release-title">
        <p className="zhaowu-updates-label" id="current-release-title">{currentLabel}</p>
        <div className="zhaowu-updates-version-row">
          <strong>{release.version}</strong>
          <span>{displayText(language, `第 ${release.updateNumber} 次更新`, `第 ${release.updateNumber} 次更新`, `Update ${release.updateNumber}`, `更新 ${release.updateNumber}`, `업데이트 ${release.updateNumber}`, `अपडेट ${release.updateNumber}`)}</span>
        </div>
        {published ? <time dateTime={release.publishedAt ?? undefined}>{published}</time> : null}
        <ul>{details.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <Link to="/" className="zhaowu-updates-back">{backLabel}</Link>
    </main>
  );
}
