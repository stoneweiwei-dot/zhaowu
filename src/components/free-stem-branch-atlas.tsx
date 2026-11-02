import { useState } from "react";
import type { Chart } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import {
  FREE_ATLAS_COPY, VERIFIED_ATLAS_POSTERS, FREE_ATLAS_FALLBACK_ART,
  selectFreeAtlas, freeAtlasGenderCopy, freeAtlasImage,
} from "@/lib/report/free-stem-branch-atlas";
import "./free-stem-branch-atlas.css";

/** Free, deterministic and keyed only to the computed chart. No paywall or additional AI request. */
export function FreeStemBranchAtlas({ chart }: { chart: Chart }) {
  const { locale } = useI18n();
  const [failedArt, setFailedArt] = useState<string[]>([]);
  const copy = FREE_ATLAS_COPY[locale];
  const entries = selectFreeAtlas(chart);
  if (!entries.length) return null;
  return (
    <section className="zw-free-atlas" data-free-stem-branch-atlas aria-label={copy.title}>
      <header className="zw-free-atlas__header">
        <span className="zw-free-atlas__kicker">ZHAOWU · FREE</span>
        <h3>{copy.title}</h3>
        <p>{copy.lead}</p>
        <p className="zw-free-atlas__gender" data-free-atlas-gender={chart.gender}>{freeAtlasGenderCopy(chart.gender, locale)}</p>
      </header>
      <div className="zw-free-atlas__list">
        {entries.map((entry, i) => {
          const imagePath = failedArt.includes(entry.symbol)
            ? FREE_ATLAS_FALLBACK_ART[entry.symbol]
            : freeAtlasImage(entry, locale);
          return (
            <details className="zw-free-atlas__item" key={entry.symbol} data-free-atlas-symbol={entry.symbol} open={i === 0}>
              <summary><span lang="zh">{entry.symbol}</span><span>{entry.roman}</span><span>{entry.kind === "stem" ? copy.stem : copy.branch}</span></summary>
              <div className="zw-free-atlas__body">
                <img
                  src={imagePath}
                  alt={entry.heading[locale]}
                  width={entry.kind === "stem" ? 720 : 1080}
                  height={entry.kind === "stem" ? 773 : 1080}
                  loading="lazy"
                  decoding="async"
                  onError={() => setFailedArt(prev => prev.includes(entry.symbol) ? prev : [...prev, entry.symbol])}
                />
                <div className="zw-free-atlas__words">
                  <strong>{entry.heading[locale]}</strong>
                  <p><b>{copy.strength}</b> · {entry.strength[locale]}</p>
                  <p><b>{copy.watch}</b> · {entry.caution[locale]}</p>
                  {VERIFIED_ATLAS_POSTERS && locale === "zh-Hant" ? <small>{copy.original}</small> : null}
                </div>
              </div>
            </details>
          );
        })}
      </div>
      <p className="zw-free-atlas__footnote">{copy.source}</p>
    </section>
  );
}
