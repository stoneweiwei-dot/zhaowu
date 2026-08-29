import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalysisForm } from "@/components/analysis-form";
import { QizhengHomePanel } from "@/components/qizheng-home";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/qizheng")({ component: QizhengPage });

function QizhengPage() {
  const { locale } = useI18n();
  const current = useAppStore((s) => s.current);
  const copy =
    locale === "en"
      ? {
          kicker: "ZHAOWU · CLASSICAL SKY",
          title: "Seven Luminaries & Four Derived Points",
          lead: "Enter one set of birth details. The sky layer is calculated separately from the main Zhaowu reading.",
          back: "Back to Zhaowu",
        }
      : locale === "zh-Hans"
        ? {
            kicker: "昭梧 · 古法天象",
            title: "七政四余",
            lead: "只填一份出生资料。七政四余独立成区，不再塞进主页主报告里。",
            back: "返回昭梧",
          }
        : {
            kicker: "昭梧 · 古法天象",
            title: "七政四餘",
            lead: "只填一份出生資料。七政四餘獨立成區，不再塞進主頁主報告裡。",
            back: "返回昭梧",
          };

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 pb-6">
      <section className="seal-border rounded-[18px] border border-line/80 bg-paper/95 p-5 shadow-paper sm:p-6">
        <Link to="/" className="text-xs tracking-[0.12em] text-cinnabar">← {copy.back}</Link>
        <p className="mt-5 text-[10px] font-semibold tracking-[0.22em] text-earth">{copy.kicker}</p>
        <h1 className="mt-2 font-display text-3xl tracking-[0.08em] text-ink sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">{copy.lead}</p>
      </section>

      <AnalysisForm />
      {current ? <QizhengHomePanel result={current} /> : null}
    </main>
  );
}
