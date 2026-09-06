import { useI18n } from "@/lib/i18n";

type Copy = {
  title: string;
  hint: string;
};

export function MethodExplainPage({
  copies,
}: {
  copies: { "zh-Hant": Copy; "zh-Hans": Copy; en: Copy };
}) {
  const { locale } = useI18n();
  const copy = copies[locale];
  const cta =
    locale === "en"
      ? { lead: "Birth details are filled once on the homepage. This page only explains what the system looks at.", action: "Back to the birth form" }
      : locale === "zh-Hans"
        ? { lead: "出生资料只在首页填写一次。本页只说明这个体系主要看什么。", action: "回到出生资料" }
        : { lead: "出生資料只在首頁填寫一次。本頁只說明這個體系主要看什麼。", action: "回到出生資料" };

  return (
    <main className="zhaowu-method-explain mx-auto max-w-2xl px-1 py-6">
      <section className="rounded-2xl border border-line bg-cream/95 p-5 sm:p-7">
        <h1 className="font-display text-2xl sm:text-3xl">{copy.title}</h1>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.hint}</p>
        <p className="mt-4 text-sm leading-7 text-ink-mute">{cta.lead}</p>
        <a href="/#analysisForm" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-cinnabar px-5 text-sm text-cream">
          {cta.action}
        </a>
      </section>
    </main>
  );
}
