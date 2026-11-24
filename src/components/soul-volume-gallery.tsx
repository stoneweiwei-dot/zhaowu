import { useState } from "react";
import type { Locale } from "@/lib/soul-chapters-data";
import "@/soul-volume-gallery.css";

const VOLUMES: Record<Locale, {title:string;subtitle:string;question:string}[]> = {
  "zh-Hant": [
    { title:"初識人間", subtitle:"萌芽 · 初啼", question:"從感受世界，到慢慢聽見自己的聲音。" },
    { title:"卷入洪流", subtitle:"探險 · 爭鬥", question:"在想融入人群時，也記得保留自己的位置。" },
    { title:"建功立業", subtitle:"建功 · 愛憎", question:"努力追求成果，也學習照顧自己的關係。" },
    { title:"向內反思", subtitle:"反思 · 破局", question:"舊答案不再適用時，你想重新選擇什麼？" },
    { title:"歸整與澄明", subtitle:"歸隱 · 歸真", question:"從奔忙到安定，找到適合自己的生活。" },
  ],
  "zh-Hans": [
    { title:"初识人间", subtitle:"萌芽 · 初啼", question:"从感受世界，到慢慢听见自己的声音。" },
    { title:"卷入洪流", subtitle:"探险 · 争斗", question:"在想融入人群时，也记得保留自己的位置。" },
    { title:"建功立业", subtitle:"建功 · 爱憎", question:"努力追求成果，也学习照顾自己的关系。" },
    { title:"向内反思", subtitle:"反思 · 破局", question:"旧答案不再适用时，你想重新选择什么？" },
    { title:"归整与澄明", subtitle:"归隐 · 归真", question:"从奔忙到安定，找到适合自己的生活。" },
  ],
  "en": [
    { title:"Becoming", subtitle:"First questions · First choices", question:"What feels like yours, before anyone else decides?" },
    { title:"Belonging", subtitle:"Connection · Boundaries", question:"Where do you shrink yourself to fit in?" },
    { title:"Ambition & Love", subtitle:"Achievement · Connection", question:"What is your version of success costing you?" },
    { title:"Rewriting", subtitle:"Change · Courage", question:"What would you change if nobody judged you?" },
    { title:"Enough", subtitle:"Contentment · Meaning", question:"What would enough look like in your real life?" },
  ],
};

export function SoulVolumeGallery({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const volumes = VOLUMES[locale];
  const volume = volumes[active];
  const imagePath = "/images/soul-chapters/" + (locale === "en" ? "en" : "zh") + "/volume-" + (active + 1) + ".webp";
  const label = locale === "en" ? "THE HUMAN ATLAS" : "昭梧 · 人生五卷";
  const intro = locale === "en"
    ? "Five real-life themes, ten chapters. Not a ranking or a personality test."
    : locale === "zh-Hant" ? "五卷山水，十種人生課題。這是圖鑑，不是靈魂等級測驗。" : "五卷山水，十种人生课题。这是图鉴，不是灵魂等级测验。";
  const jump = locale === "en" ? "Read both chapters" : locale === "zh-Hant" ? "閱讀本卷兩章" : "阅读本卷两章";
  return (
    <section className={"sc-atlas sc-atlas--" + (locale === "en" ? "en" : "zh")} aria-label={label}>
      <div className="sc-atlas-heading"><h2>{label}</h2><p>{intro}</p></div>
      <div className="sc-atlas-tabs" role="group" aria-label={locale === "en" ? "Choose a volume" : locale === "zh-Hans" ? "选择卷次" : "選擇卷次"}>
        {volumes.map((v, i) => (
          <button key={i} type="button" className={"sc-atlas-tab" + (i === active ? " is-active" : "")}
            aria-pressed={i === active} onClick={() => setActive(i)}>
            <span>{String(i + 1).padStart(2, "0")}</span>{v.title}
          </button>
        ))}
      </div>
      <figure className="sc-atlas-figure">
        {failedImage !== imagePath && (
          <img key={imagePath} src={imagePath} alt={volume.title + " · " + volume.subtitle}
            loading="lazy" decoding="async" width={941} height={1672}
            onError={() => setFailedImage(imagePath)} />
        )}
        <figcaption>
          <small>{locale === "en" ? "VOLUME" : "卷"} {String(active + 1).padStart(2, "0")} · {active * 2 + 1}–{active * 2 + 2}</small>
          <strong>{volume.title}</strong>
          <p>{volume.question}</p>
          <a href={"#sc-chapter-volume-" + (active + 1)}>{jump} ↓</a>
          <span className="sc-atlas-credit">STONE · ZHAOWU</span>
        </figcaption>
      </figure>
    </section>
  );
}
