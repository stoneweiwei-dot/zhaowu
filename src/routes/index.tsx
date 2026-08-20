import { createFileRoute } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { ResultView } from "@/components/result-view";
import { FollowUpBox } from "@/components/follow-up-box";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t, locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const isEnglish = locale === "en";
  const isHans = locale === "zh-Hans";

  const safeTitle = isEnglish ? "Zhaowu Safe Entry" : isHans ? "昭梧安全入口" : "昭梧安全入口";
  const safeLead = isEnglish
    ? "The visual experiment has been paused. This page keeps the reading form, account entry and report flow available while the homepage art direction is rebuilt separately."
    : isHans
      ? "新版视觉先暂停。这里保留测算入口、账号入口和报告流程，先保证网站可打开、可使用，再单独重做美术。"
      : "新版視覺先暫停。這裡保留測算入口、帳號入口和報告流程，先保證網站可打開、可使用，再單獨重做美術。";

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-line bg-cream/95 px-5 py-8 shadow-[0_18px_50px_rgb(60_42_20_/_0.10)] sm:px-8 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.28em] text-cinnabar">ZHAOWU · SAFE · 2026.08.20</p>
        <h1 className="mt-5 font-display text-5xl font-bold tracking-[0.18em] text-ink sm:text-7xl">昭梧</h1>
        <p className="mt-5 max-w-2xl font-display text-xl leading-9 tracking-[0.08em] text-ink sm:text-2xl">{t("heroSlogan")}</p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">{safeLead}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#analysisForm" className="inline-flex h-12 items-center rounded-full bg-cinnabar px-6 text-cream shadow-sm">{t("start")}</a>
          <a href="/account" className="inline-flex h-12 items-center rounded-full border border-line bg-paper px-6 text-ink-soft">{isEnglish ? "Account / Admin" : "帳號 / 後台"}</a>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[t("s1"), t("s2"), t("s3")].map((item, i) => (
          <article key={item} className="rounded-2xl border border-line bg-cream/85 p-4">
            <p className="text-xs tracking-[0.2em] text-cinnabar">0{i + 1}</p>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{item}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-line bg-cream/92 p-4 shadow-[0_12px_38px_rgb(60_42_20_/_0.08)] sm:p-6">
        <div className="mb-4 border-b border-line/70 pb-4">
          <p className="text-xs tracking-[0.24em] text-cinnabar">{safeTitle}</p>
          <p className="mt-2 text-sm leading-7 text-ink-soft">
            {isEnglish
              ? "Fill in the question and birth data below. The visual layer is deliberately simplified here to avoid blocking the reading workflow."
              : isHans
                ? "下面继续填写问题与出生资料。这个版本故意把视觉层简化，避免再挡住测算流程。"
                : "下面繼續填寫問題與出生資料。這個版本故意把視覺層簡化，避免再擋住測算流程。"}
          </p>
        </div>
        <AnalysisForm />
      </section>

      {current ? <ResultView result={current} /> : null}
      {current ? <FollowUpBox result={current} /> : null}

      <section className="rounded-2xl border border-line bg-paper/80 p-5 text-sm leading-7 text-ink-soft">
        <p className="font-display text-lg text-ink">{isEnglish ? "Current handling" : "目前處理"}</p>
        <p className="mt-2">
          {isEnglish
            ? "The previous homepage art changes were the likely cause of the blank screen. This safe entry keeps the app usable first."
            : isHans
              ? "上一版首页视觉改动很可能造成白屏。现在先恢复可用入口，再单独重做视觉。"
              : "上一版首頁視覺改動很可能造成白屏。現在先恢復可用入口，再單獨重做視覺。"}
        </p>
      </section>
    </main>
  );
}
