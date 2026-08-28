import { useEffect, useMemo, useState } from "react";
import type { Chart } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import {
  explainCustomerGalleryChoice,
  loadCustomerGalleryCandidates,
  rankCustomerGalleryArt,
  type GalleryArtKnowledge,
} from "@/lib/gallery-match";
import type { GalleryAsset } from "@/lib/gallery-assets";

const COPY = {
  "zh-Hant": {
    kicker: "你的個人命詮圖",
    title: "為你選一張圖",
    note: "系統會按這次命盤和問題，從作品庫選一張最合適的圖，做成你的個人命詮圖。圖片只負責呈現，不會改動命理判斷。",
    generate: "製作我的命詮圖",
    generating: "命詮圖生成中…",
    matched: "為你選的圖",
    generated: "你的成圖",
    reasonTitle: "為什麼是這張圖",
    unavailable: "目前啟用作品庫沒有可用圖片，暫時無法生成命詮圖。",
    alt: "昭梧作品庫參考圖",
    generatedAlt: "昭梧個人命詮圖",
  },
  "zh-Hans": {
    kicker: "你的个人命诰图",
    title: "为你选一张图",
    note: "系统会按这次命盘和问题，从作品库选一张最合适的图，做成你的个人命诰图。图片只负责呈现，不会改动命理判断。",
    generate: "制作我的命诰图",
    generating: "命诰图生成中…",
    matched: "为你选的图",
    generated: "你的成图",
    reasonTitle: "为什么是这张图",
    unavailable: "目前启用作品库没有可用图片，暂时无法生成命诺图。",
    alt: "昭梧作品库参考图",
    generatedAlt: "昭梧个人命诺图",
  },
  en: {
    kicker: "YOUR PERSONAL DECREE IMAGE",
    title: "Your decree image",
    note: "Zhaowu chooses one image that fits this chart and question, then makes it your personal decree image. The artwork presents the reading; it never changes it.",
    generate: "Generate my decree image",
    generating: "Generating decree image…",
    matched: "Chosen for you",
    generated: "Your image",
    reasonTitle: "Why this image",
    unavailable: "The enabled visual library is empty, so a decree image cannot be created yet.",
    alt: "Zhaowu visual-library reference",
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
};

export function DecreeGalleryPreview({ chart, question, busy, generatedImageUrl, selectedAssetId, onGenerate }: Props) {
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
  const secondary = useMemo(() => matches.slice(generatedImageUrl ? 0 : 1, generatedImageUrl ? 2 : 3), [generatedImageUrl, matches]);
  const selectedCandidate = useMemo(
    () => selectedAssetId ? candidates.find((candidate) => candidate.asset.id === selectedAssetId) ?? null : null,
    [candidates, selectedAssetId],
  );
  const selectionReason = useMemo(
    () => generatedImageUrl && selectedCandidate
      ? explainCustomerGalleryChoice(chart, question, selectedCandidate, locale)
      : null,
    [chart, generatedImageUrl, locale, question, selectedCandidate],
  );
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

      {selectionReason ? (
        <div className="mt-4 rounded-xl border border-line bg-cream p-4 text-sm leading-7 text-ink-soft">
          <p className="font-display text-base text-ink">{copy.reasonTitle}</p>
          <p className="mt-1">{selectionReason}</p>
        </div>
      ) : null}
    </article>
  );
}
