import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { displayText, useDisplayLanguage } from "@/lib/display-language";
import { getPublicReleaseHistory, SITE_RELEASE_FALLBACK, type PublicReleaseEntry } from "@/lib/site-stats";

export const Route = createFileRoute("/updates")({ component: UpdatesPage });

const FALLBACK_ENTRY: PublicReleaseEntry = {
  version: SITE_RELEASE_FALLBACK.version,
  updateNumber: SITE_RELEASE_FALLBACK.updateNumber,
  publishedAt: SITE_RELEASE_FALLBACK.publishedAt,
  summary: SITE_RELEASE_FALLBACK.latestSummary,
};

function UpdatesPage() {
  const { language } = useDisplayLanguage();
  const [entries, setEntries] = useState<PublicReleaseEntry[]>([FALLBACK_ENTRY]);

  useEffect(() => {
    let alive = true;
    void getPublicReleaseHistory(30)
      .then((items) => { if (alive && items.length) setEntries(items); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, []);

  const title = displayText(language, "最新版本更新內容", "最新版本更新内容", "Latest updates", "最新アップデート", "최신 업데이트", "नवीनतम अपडेट");
  const back = displayText(language, "返回首頁", "返回首页", "Back to home", "ホームへ戻る", "홈으로", "होम पर लौटें");
  const updatesLabel = displayText(language, "累計更新", "累计更新", "Update", "更新", "업데이트", "अपडेट");
  const empty = displayText(language, "暫無可讀更新記錄。", "暂无可读更新记录。", "No release notes are available yet.", "更新履歴はまだありません。", "표시할 업데이트 기록이 없습니다.", "अभी कोई अपडेट रिकॉर्ड उपलब्ध नहीं है।");

  return (
    <main className="zhaowu-home-sheet-page zhaowu-home-layout" data-updates-page>
      <div className="zhaowu-home-stage">
        <section className="rounded-[28px] border border-line/70 bg-paper/88 p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.2em] text-ink-mute">ZHAOWU RELEASE LEDGER</p>
              <h1 className="mt-2 font-display text-2xl text-ink sm:text-3xl">{title}</h1>
            </div>
            <Link to="/" className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink">
              {back}
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {entries.length ? entries.map((entry) => (
              <article key={`${entry.updateNumber}-${entry.version}`} className="rounded-2xl border border-line/60 bg-paper/72 p-4" data-release-entry>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-semibold text-ink">{entry.version}</h2>
                  <span className="text-xs text-ink-mute">{updatesLabel} {entry.updateNumber}</span>
                </div>
                {entry.publishedAt ? (
                  <time className="mt-1 block text-xs text-ink-mute" dateTime={entry.publishedAt}>
                    {new Date(entry.publishedAt).toLocaleString()}
                  </time>
                ) : null}
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-soft">{entry.summary}</p>
              </article>
            )) : <p className="text-sm text-ink-mute">{empty}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
