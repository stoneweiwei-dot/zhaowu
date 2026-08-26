import { useEffect, useState } from "react";
import type { Chart } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import {
  chooseCustomerGalleryArt,
  loadCustomerGalleryCandidates,
  type CustomerGalleryArt,
} from "@/lib/gallery-match";

const COPY = {
  "zh-Hant": {
    kicker: "昭梧圖庫 · 個人視覺匹配",
    title: "你的昭梧標配圖",
    note: "依本次命盤已成立的喜用方向，從站主核准圖庫中穩定匹配；只影響視覺呈現，不反向改動命理判斷。",
    alt: "昭梧個人標配圖",
  },
  "zh-Hans": {
    kicker: "昭梧图库 · 个人视觉匹配",
    title: "你的昭梧标配图",
    note: "依本次命盘已成立的喜用方向，从站主核准图库中稳定匹配；只影响视觉呈现，不反向改动命理判断。",
    alt: "昭梧个人标配图",
  },
  en: {
    kicker: "ZHAOWU LIBRARY · PERSONAL VISUAL MATCH",
    title: "Your Zhaowu visual",
    note: "Selected deterministically from owner-approved artwork to fit the tone of this reading. It changes presentation only, never the underlying reading.",
    alt: "Your Zhaowu matched artwork",
  },
} as const;

export function CustomerStandardArt({ chart }: { chart: Chart }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const [match, setMatch] = useState<CustomerGalleryArt | null>(null);

  useEffect(() => {
    let active = true;
    void loadCustomerGalleryCandidates()
      .then((candidates) => {
        if (active) setMatch(chooseCustomerGalleryArt(chart, candidates));
      })
      .catch(() => {
        if (active) setMatch(null);
      });
    return () => { active = false; };
  }, [chart]);

  if (!match) return null;

  return (
    <article className="seal-border overflow-hidden rounded-[1.35rem] bg-cream/95">
      <div className="relative mx-auto aspect-[9/16] w-full max-w-md overflow-hidden bg-paper-deep">
        <img
          src={match.imageUrl}
          alt={copy.alt}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setMatch(null)}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#21170f]/80 via-[#21170f]/35 to-transparent px-5 pb-5 pt-16 text-[#fff7e7]">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-[#e7c77f]">{copy.kicker}</p>
          <h3 className="mt-1 font-display text-2xl tracking-[0.04em]">{copy.title}</h3>
        </div>
      </div>
      <p className="px-5 py-4 text-xs leading-6 text-ink-mute">{copy.note}</p>
    </article>
  );
}
