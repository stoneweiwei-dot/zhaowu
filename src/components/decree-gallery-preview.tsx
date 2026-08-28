import { useEffect, useMemo, useState } from "react";
import type { Chart } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import {
  loadCustomerGalleryCandidates,
  rankCustomerGalleryArt,
  type CustomerGalleryArt,
} from "@/lib/gallery-match";

const COPY = {
  "zh-Hant": {
    kicker: "昭梧作品庫 · 個人命詮母圖",
    title: "你的命詮圖",
    note: "先依本次命盤，從整個啟用作品庫中選出最接近的一張，再複製為你的個人命詮圖。不再用核准標籤或佛、道等人工分組決定能不能出圖。圖像只負責視覺呈現，不反向改動命理判斷。",
    generate: "生成個人命詮圖",
    generating: "命詮圖生成中…",
    matched: "匹配母圖",
    generated: "你的成圖",
    unavailable: "目前啟用作品庫沒有可用圖片，暫時無法生成命詮圖。",
    alt: "昭梧作品庫參考圖",
    generatedAlt: "昭梧個人命詮圖",
  },
  "zh-Hans": {
    kicker: "昭梧作品库 · 个人命诺母图",
    title: "你的命诺图",
    note: "先依本次命盘，从整个启用作品库中选出最接近的一张，再复制为你的个人命诺图。不再用核准标签或佛、道等人工分组决定能不能出图。图像只负责视觉呈现，不反向改动命理判断。",
    generate: "生成个人命诺图",
    generating: "命诺图生成中…",
    matched: "匹配母图",
    generated: "你的成图",
    unavailable: "目前启用作品库没有可用图片，暂时无法生成命诺图。",
    alt: "昭梧作品库参考图",
    generatedAlt: "昭梧个人命诺图",
  },
  en: {
    kicker: "ZHAOWU VISUAL LIBRARY · PERSONAL SOURCE",
    title: "Your decree image",
    note: "Zhaowu ranks the whole enabled visual library, copies the closest image into a private decree asset, and never blocks delivery on approval tags. Religious category guesses do not control the match. The image never changes the reading itself.",
    generate: "Generate my decree image",
    generating: "Generating decree image…",
    matched: "Matched reference",
    generated: "Your image",
    unavailable: "The enabled visual library is empty, so a decree image cannot be created yet.",
    alt: "Zhaowu visual-library reference",
    generatedAlt: "Your Zhaowu decree image",
  },
} as const;

type Props = {
  chart: Chart;
  busy: boolean;
  generatedImageUrl: string | null;
  onGenerate: () => void;
};

export function DecreeGalleryPreview({ chart, busy, generatedImageUrl, onGenerate }: Props) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [matches, setMatches] = useState<CustomerGalleryArt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void loadCustomerGalleryCandidates()
      .then((candidates) => {
        if (active) setMatches(rankCustomerGalleryArt(chart, candidates).slice(0, 3));
      })
      .catch(() => {
        if (active) setMatches([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [chart]);

  const heroSrc = generatedImageUrl ?? matches[0]?.imageUrl ?? null;
  const heroAlt = generatedImageUrl ? copy.generatedAlt : copy.alt;
  const secondary = useMemo(() => matches.slice(generatedImageUrl ? 0 : 1, generatedImageUrl ? 2 : 3), [generatedImageUrl, matches]);
  // Preview ranking is decorative. Default generation is owned by generate-decree-image
  // and must stay clickable even if approved/client_eligible knowledge is missing.
  const canGenerate = !loading;

  return (
    <article className="zhaowu-decree-gallery seal-border" aria-labelledby="zhaowu-decree-gallery-title">
      <div className="zhaowu-decree-copy">
        <p className="zhaowu-decree-kicker">{copy.kicker}</p>
        <h3 id="zhaowu-decree-gallery-title">{copy.title}</h3>
        <p className="zhaowu-decree-note">{copy.note}</p>
        <button
          type="button"
          disabled={busy || !canGenerate}
          onClick={onGenerate}
          className="zhaowu-decree-generate"
        >
          <span>{busy ? copy.generating : copy.generate}</span>
          {!busy ? <b aria-hidden>→</b> : null}
        </button>
        {!loading && !matches.length ? <p className="zhaowu-decree-unavailable">{copy.unavailable}</p> : null}
      </div>

      <div className="zhaowu-decree-previews" aria-busy={loading}>
        {loading ? (
          <>
            <span className="zhaowu-decree-preview-skeleton is-main" />
            <span className="zhaowu-decree-preview-skeleton" />
            <span className="zhaowu-decree-preview-skeleton" />
          </>
        ) : heroSrc ? (
          <>
            <figure className="zhaowu-decree-preview is-main">
              <img src={heroSrc} alt={heroAlt} loading="eager" decoding="async" />
              <figcaption>{generatedImageUrl ? copy.generated : copy.matched}</figcaption>
            </figure>
            {secondary.map((match) => (
              <figure key={match.asset.id} className="zhaowu-decree-preview">
                <img src={match.imageUrl} alt={copy.alt} loading="lazy" decoding="async" />
              </figure>
            ))}
          </>
        ) : null}
      </div>
    </article>
  );
}
