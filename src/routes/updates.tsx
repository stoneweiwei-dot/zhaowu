import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { displayText, intlTagFor, useDisplayLanguage } from "@/lib/display-language";
import { SORTED_PUBLIC_CHANGELOG, publicChangeText } from "@/lib/public-changelog";
import { getPublicSiteStats, SITE_RELEASE_FALLBACK, type PublicSiteStats } from "@/lib/site-stats";

export const Route = createFileRoute("/updates")({ component: UpdatesPage });

function UpdatesPage() {
  const { language } = useDisplayLanguage();
  const [history, setHistory] = useState<{ count: number; sha: string; measuredAt: string } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/development-history.json", { signal: controller.signal, cache: "no-cache" }).then((r) => r.ok ? r.json() : null).then((value) => {
      if (value && Number.isSafeInteger(value.count) && value.count > 0 && /^[a-f0-9]{40}$/.test(value.sha) && Number.isFinite(Date.parse(value.measuredAt))) setHistory(value);
    }).catch(() => undefined);
    return () => controller.abort();
  }, []);
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

  const latestChange = SORTED_PUBLIC_CHANGELOG[0];
  const latestChangeSummary = latestChange ? publicChangeText(latestChange, language).summary : releaseSummary;
  const historyDate = history ? new Intl.DateTimeFormat(intlTagFor(language), { year: "numeric", month: "long", day: "numeric", timeZone: "Australia/Sydney" }).format(new Date(history.measuredAt)) : "";
  const title = displayText(language, "最新版本更新內容", "最新版本更新内容", "Latest release", "最新バージョン", "최신 버전", "नवीनतम संस्करण");
  const currentLabel = displayText(language, "最近編號版本", "最近编号版本", "Latest numbered release", "直近の番号付きリリース", "최근 번호가 지정된 릴리스", "नवीनतम क्रमांकित रिलीज़");
  const changesLabel = displayText(language, "近期更新紀錄", "近期更新记录", "Recorded changes", "変更履歴", "변경 내역", "बदलाव");
  const changesIntro = displayText(
    language,
    "以下列出已整理的網站更新；正式版本可以批次發布。",
    "以下列出已整理的网站更新；正式版本可以批次发布。",
    "The recorded site updates are listed below. Formal releases can contain multiple changes.",
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
        <p className="zhaowu-updates-lead">{latestChangeSummary}</p>
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
        {history ? <>
          <p>{displayText(language, `截至 ${historyDate}，Git 主分支歷史共有 ${history.count.toLocaleString(intlTagFor(language))} 次提交。提交包含功能、修正及文件變動；一次正式發布可以包含多次提交。`, `截至 ${historyDate}，Git 主分支历史共有 ${history.count.toLocaleString(intlTagFor(language))} 次提交。提交包含功能、修正及文档变动；一次正式发布可以包含多次提交。`, `As of ${historyDate}, the Git main branch history contains ${history.count.toLocaleString(intlTagFor(language))} commits, including features, fixes and documentation. One release can contain multiple commits.`, `Git 履歴: ${history.count} コミット (${historyDate})。`, `Git 기록: ${history.count}개 커밋 (${historyDate}).`, `Git इतिहास: ${history.count} कमिट (${historyDate}).`)}</p>
          <a href={`https://github.com/stoneweiwei-dot/zhaowu/commit/${history.sha}`}>{displayText(language, "查看統計基準", "查看统计基准", "View the reference commit", "基準コミット", "기준 커밋", "संदर्भ कमिट")}</a>
        </> : <p>{displayText(language, "開發提交數暫時無法取得。", "开发提交数暂时无法获取。", "Development commit count is temporarily unavailable.", "コミット数を取得できません。", "커밋 수를 가져올 수 없습니다.", "कमिट संख्या उपलब्ध नहीं है।")}</p>}
      </section>

      <section className="zhaowu-updates-card" aria-labelledby="public-changelog-title" data-public-changelog>
        <p className="zhaowu-updates-label" id="public-changelog-title">{changesLabel}</p>
        <p>{changesIntro}</p>
        <ol>
          {SORTED_PUBLIC_CHANGELOG.map((entry) => {
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
