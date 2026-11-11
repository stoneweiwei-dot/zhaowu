import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import content from "@/lib/kaiming-content.json";
import "./kaiming.css";

export const Route = createFileRoute("/myth/xianhui-chronicle/creatures/kai-ming-beast")({ component: KaimingPage });

// 共用資料供瀏覽器及靜態頁讀取，避免搜尋結果與內文不一致。
function KaimingPage() {
  const { locale } = useI18n();
  const text = content.locales[locale];
  return <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 text-ink">
    <article className="rounded-2xl bg-paper p-6 sm:p-10">
      <header><p className="text-sm tracking-widest text-ink-soft">ZHAOWU · BESTIARY</p><h1 className="mt-4 font-display text-3xl leading-tight">{text.title}</h1><p className="mt-6 text-lg leading-8">{text.lead}</p></header>
      <figure className="kaiming-figure">
        <img src="/mythic-atlas/web/kaiming-beast-stone-original.webp" alt={locale === "en" ? "The Kaiming Beast, a tiger-like guardian with nine human faces, standing eastward before Kunlun at sunrise" : locale === "zh-Hans" ? "开明兽，虎身九首皆人面，面向东方立于昆仑晨光之间" : "開明獸虎身九首皆人面，面向東方立於崑崙晨光之間"} width={941} height={1672} loading="eager" />
        <span className="kaiming-watermark" aria-hidden="true">STONE 原創</span>
        <figcaption>{locale === "en" ? "Original ZHAOWU interpretation inspired by the Classic of Mountains and Seas." : locale === "zh-Hans" ? "取意《山海经》的昭梧原创图像。" : "取意《山海經》的昭梧原創圖像。"}</figcaption>
      </figure>
      {text.sections.map(([heading, body]) => <section key={heading} className="kaiming-section"><h2 className="font-display text-2xl">{heading}</h2><p className="mt-3 text-base leading-8">{body}</p></section>)}
      <section className="kaiming-source"><h2>{locale === "en" ? "Classical source" : locale === "zh-Hans" ? "古籍出处" : "古籍出處"}</h2><p>{locale === "en" ? "Classic of Mountains and Seas, Inner Classic of the Western Regions (海內西經). The text describes the beast as tiger-like, with nine human-faced heads, facing east on Kunlun." : locale === "zh-Hans" ? "《山海经·海内西经》记载：“开明兽身大类虎而九首，皆人面，东向立昆仑上。”" : "《山海經·海內西經》記載：「開明獸身大類虎而九首，皆人面，東嚮立崑崙上。」"}</p><a href="https://ctext.org/shan-hai-jing/hai-nei-xi-jing" target="_blank" rel="noreferrer">Chinese Text Project · 海內西經</a><p>{locale === "en" ? "The boundary-keeping and inner-observation symbolism on this page is ZHAOWU’s original interpretation." : locale === "zh-Hans" ? "本页的守界与观心象征属于昭梧原创诠释。" : "本頁的守界與觀心象徵屬於昭梧原創詮釋。"}</p></section>
      <nav className="mt-10 flex flex-wrap gap-5 text-base underline"><a href="/mythic-atlas">{text.atlas}</a><a href="/knowledge/five-elements-tone-qi">{text.related}</a><a href="/#birth-form">{text.chart}</a></nav>
    </article>
  </main>;
}
