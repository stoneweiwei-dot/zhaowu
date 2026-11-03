import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { displayText, intlTagFor, useDisplayLanguage } from "@/lib/display-language";
import { PUBLIC_CHANGELOG, publicChangeText } from "@/lib/public-changelog";
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
  const fallbackLanguage = language === "en" ? "en" : language === "zh-Hans" ? "zh-Hans" : "zh-Hant";
  const fallbackSummary = SITE_RELEASE_FALLBACK.summary[fallbackLanguage];
  const englishSummary = currentFallback
    ? SITE_RELEASE_FALLBACK.summary.en
    : "An English summary for this update isn't available yet; see the Chinese notes above.";
  const releaseSummary = currentFallback
    ? fallbackSummary
    : language === "en" && /[\u3400-\u9fff]/u.test(release.latestSummary)
      ? englishSummary
      : release.latestSummary;
  const details = currentFallback
    ? SITE_RELEASE_FALLBACK.details[fallbackLanguage]
    : [releaseSummary];
  const published = release.publishedAt
    ? new Intl.DateTimeFormat(intlTagFor(language), { year: "numeric", month: "long", day: "numeric" }).format(new Date(release.publishedAt))
    : "";

  const title = displayText(language, "最新版本更新內容", "最新版本更新内容", "Latest release", "最新バージョン", "최신 버전", "नवीनतम संस्करण");
  const currentLabel = displayText(language, "最近編號版本", "最近编号版本", "Latest numbered release", "直近の番号付きリリース", "최근 번호가 지정된 릴리스", "नवीनतम क्रमांकित रिलीज़");
  const changesLabel = displayText(language, "每次改動", "每次改动", "Every change", "変更履歴", "변경 내역", "बदलाव");
  const changesIntro = displayText(
    language,
    "以下按時間列出網站實際改過的內容；正式版本可以批次發布，但改動紀錄不再等到下一個版本才更新。",
    "以下按时间列出网站实际改过的内容；正式版本可以批次发布，但改动记录不再等到下一个版本才更新。",
    "Real site changes are listed below as they happen. Formal releases can still be batched, but the change history no longer waits for the next release.",
    "実際の変更を時系列で記録します。",
    "실제 변경 사항을 시간순으로 기록합니다.",
    "वास्तविक बदलाव समय के क्रम में दर्ज किए जाते हैं।",
  );
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
          <span>{displayText(language, `正式版本序號 ${release.updateNumber}`, `正式版本序号 ${release.updateNumber}`, `Release number ${release.updateNumber}`, `更新 ${release.updateNumber}`, `업데이트 ${release.updateNumber}`, `अपडेट ${release.updateNumber}`)}</span>
        </div>
        {published ? <time dateTime={release.publishedAt ?? undefined}>{published}</time> : null}
        <ul>{details.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section className="zhaowu-updates-card" aria-labelledby="development-history-title">
        <p className="zhaowu-updates-label" id="development-history-title">{displayText(language, "開發紀錄", "开发记录", "Development history", "開発履歴", "개발 기록", "विकास इतिहास")}</p>
        <p>{displayText(language, "截至 2026 年 11 月 3 日（悉尼時間），Git 主分支歷史共有 2,257 次提交。提交包含功能、修正及文件變動；一次正式發布可以包含多次提交。", "截至 2026 年 11 月 3 日（悉尼时间），Git 主分支历史共有 2,257 次提交。提交包含功能、修正及文档变动；一次正式发布可以包含多次提交。", "As of 3 November 2026 (Sydney time), the Git main branch history contains 2,257 commits. These include features, fixes and documentation; one formal release can contain multiple commits.", "2026年11月3日時点の Git 履歴：2,257 コミット。", "2026년 11월 3일 기준 Git 기록: 2,257개 커밋.", "3 नवंबर 2026 तक Git इतिहास में 2,257 कमिट।")}</p>
        <a href="https://github.com/stoneweiwei-dot/zhaowu/commit/73a7e0fa9d50">{displayText(language, "查看統計基準", "查看统计基准", "View the reference commit", "基準コミット", "기준 커밋", "संदर्भ कमिट")}</a>
      </section>

      <section className="zhaowu-updates-card" aria-labelledby="public-changelog-title" data-public-changelog>
        <p className="zhaowu-updates-label" id="public-changelog-title">{changesLabel}</p>
        <p>{changesIntro}</p>
        <ol>
          {PUBLIC_CHANGELOG.map((entry) => {
            const copy = publicChangeText(entry, language);
            const changeDate = new Intl.DateTimeFormat(intlTagFor(language), {
              year: "numeric",
              month: "short",
              day: "numeric",
            }).format(new Date(`${entry.date}T12:00:00Z`));
            return (
              <li key={entry.id}>
                <article>
                  <time dateTime={entry.date}>{changeDate}</time>
                  <h2>{copy.title}</h2>
                  <p>{copy.summary}</p>
                </article>
              </li>
            );
          })}
        </ol>
      </section>

      <Link to="/" className="zhaowu-updates-back">{backLabel}</Link>
    </main>
  );
}
