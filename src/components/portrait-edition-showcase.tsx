import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import "./portrait-edition-showcase.css";

const ART_PATH = "/portrait-editions/stone-song-original.webp";

const COPY = {
  "zh-Hant": {
    eyebrow: "昭梧藝術典藏 · STONE 原創",
    title: "以一幅宋畫，照見獨有的氣韻。",
    intro: "院體工筆、絹本設色、山水與神獸，將人物的精神氣質凝成一幅畫。這是風格示例，不是所有客戶共用的肖像。",
    alt: "昭梧原創宋式工筆藝術示例：男性人物、龍與靈獸、貓及層疊山水",
    caption: "藝術示例 · 941 × 1672 · STONE 原創",
  },
  "zh-Hans": {
    eyebrow: "昭梧艺术典藏 · STONE 原创",
    title: "以一幅宋画，照见独有的气韵。",
    intro: "院体工笔、绢本设色、山水与神兽，将人物的精神气质凝成一幅画。这是风格示例，不是所有客户共用的肖像。",
    alt: "昭梧原创宋式工笔艺术示例：男性人物、龙与灵兽、猫及层叠山水",
    caption: "艺术示例 · 941 × 1672 · STONE 原创",
  },
  en: {
    eyebrow: "ZHAOWU ART EDITIONS · STONE ORIGINAL",
    title: "A Song-style portrait, shaped by character.",
    intro: "Fine-line court painting, silk-textured mineral pigments and a landscape of mythical companions. This is a style example, not a generic portrait distributed to customers.",
    alt: "Original Song-inspired illustrated art with a male scholar, dragon, spirit animals, cat and layered mountains",
    caption: "Illustration sample · 941 × 1672 · STONE Original",
  },
} as const;

/** Same-origin, fail-closed art slot: no replacement SVG, stock art, or broken image on production. */
export function PortraitEditionShowcase({ locale }: { locale: Locale }) {
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    let alive = true;
    void fetch(ART_PATH, { method: "HEAD", credentials: "same-origin" })
      .then((response) => {
        if (!alive) return;
        const imageType = response.headers.get("content-type")?.toLowerCase() ?? "";
        setVerified(response.ok && imageType.includes("image/webp"));
      })
      .catch(() => { if (alive) setVerified(false); });
    return () => { alive = false; };
  }, []);
  if (!verified) return null;
  const copy = COPY[locale];
  return <section className="zw-portrait-showcase" data-original-art-showcase aria-labelledby="zw-portrait-showcase-title">
    <div className="zw-portrait-showcase__copy">
      <p className="zw-portrait-showcase__eyebrow">{copy.eyebrow}</p>
      <h2 id="zw-portrait-showcase-title">{copy.title}</h2>
      <p>{copy.intro}</p>
    </div>
    <figure>
      <img src={ART_PATH} alt={copy.alt} width={941} height={1672} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.closest("section")?.setAttribute("hidden", ""); }} />
      <figcaption>{copy.caption}</figcaption>
    </figure>
  </section>;
}
