import { useEffect, useMemo, useState } from "react";
import type { Chart } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import {
  loadCustomerGalleryCandidates,
  rankCustomerGalleryArt,
  type GalleryArtKnowledge,
} from "@/lib/gallery-match";
import type { GalleryAsset } from "@/lib/gallery-assets";
import { DecreeImageReason } from "@/components/decree-image-reason";

const COPY = {
  "zh-Hant": {
    kicker: "你的個人命詮圖",
    title: "為你選一張圖",
    note: "這張命詮圖會把這次分析最重要的狀態，轉成一張可以直接感受的畫面。",
    generate: "製作我的命詮圖",
    generating: "命詮圖生成中…",
    matched: "為你選的圖",
    generated: "你的成圖",
    unavailable: "目前沒有可用的命詮圖，暫時無法生成。",
    alt: "昭梧命詮圖參考",
    generatedAlt: "昭梧個人命詮圖",
  },
  "zh-Hans": {
    kicker: "你的个人命诰图",
    title: "为你选一张图",
    note: "这张命诰图会把这次分析最重要的状态，转成一张可以直接感受的画面。",
    generate: "制作我的命诰图",
    generating: "命诰图生成中…",
    matched: "为你选的图",
    generated: "你的成图",
    unavailable: "目前没有可用的命诰图，暂时无法生成。",
    alt: "昭梧命诰图参考",
    generatedAlt: "昭梧个人命诰图",
  },
  en: {
    kicker: "YOUR PERSONAL DECREE IMAGE",
    title: "Your decree image",
    note: "Your decree image turns the core message of this reading into a single visual you can feel at a glance.",
    generate: "Generate my decree image",
    generating: "Generating decree image…",
    matched: "Chosen for you",
    generated: "Your image",
    unavailable: "A decree image is not available right now.",
    alt: "Zhaowu decree image reference",
    generatedAlt: "Your Zhaowu decree image",
  },
} as const;

type GalleryCandidate = { asset: GalleryAsset; knowledge: GalleryArtKnowledge };

type Props = {
  chart: Chart;
  question: string;
  busy: boolean;
  generatedImageUrl: string | null;
  selectedAssetId: string | null;
  onGenerate: () => void;
  onGeneratedImageError?: () => void;
};

export function DecreeGalleryPreview({
  chart,
  question,
  busy,
  generatedImageUrl,
  selectedAssetId,
  onGenerate,
  onGeneratedImageError,
}: Props) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [candidates, setCandidates] = useState<GalleryCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void loadCustomerGalleryCandidates()
      .then((rows) => {
        if (active) setCandidates(rows);
      })
      .catch(() => {
        if (active) setCandidates([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [chart]);

  const matches = useMemo(() => rankCustomerGalleryArt(chart, candidates).slice(0, 3), [chart, candidates]);
  const heroSrc = generatedImageUrl ?? matches[0]?.imageUrl ?? null;
  const heroAlt = generatedImageUrl ? copy.generatedAlt : copy.alt;
  const secondary = useMemo(() => generatedImageUrl ? [] : matches.slice(1, 3), [generatedImageUrl, matches]);
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
              <img
                src={heroSrc}
                alt={heroAlt}
                loading="eager"
                decoding="async"
                onError={generatedImageUrl ? onGeneratedImageError : undefined}
              />
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

      {generatedImageUrl ? (
        <DecreeImageReason chart={chart} question={question} selectedAssetId={selectedAssetId} />
      ) : null}
    </article>
  );
}
