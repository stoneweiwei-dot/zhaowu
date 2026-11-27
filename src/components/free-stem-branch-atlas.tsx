import { useState } from "react";
import type { Chart } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import {
  FREE_ATLAS_COPY, VERIFIED_ATLAS_POSTERS, FREE_ATLAS_FALLBACK_ART,
  selectFreeAtlas, freeAtlasGenderCopy, freeAtlasImage,
} from "@/lib/report/free-stem-branch-atlas";
import "./free-stem-branch-atlas.css";

/** Free, deterministic and keyed only to the computed chart. No paywall or additional AI request. */
export function FreeStemBranchAtlas({ chart, embedded = false }: { chart: Chart; embedded?: boolean }) {
  const { locale } = useI18n();
  const [failedArt, setFailedArt] = useState<string[]>([]);
  const copy = FREE_ATLAS_COPY[locale];
  const entries = selectFreeAtlas(chart);
  if (!entries.length) return null;
  return (
    <section className="zw-free-atlas" data-free-stem-branch-atlas aria-label={copy.title}>
      <header className="zw-free-atlas__header">
        {embedded ? null : <><span className="zw-free-atlas__kicker">ZHAOWU · FREE</span><h3>{copy.title}</h3></>}
        <p>{copy.lead}</p>
        <p className="zw-free-atlas__gender" data-free-atlas-gender={chart.gender}>{freeAtlasGenderCopy(chart.gender, locale)}</p>
      </header>
      <div className="zw-free-atlas__list">
        {entries.map((entry, index) => {
          const imagePath = failedArt.includes(entry.symbol)
            ? FREE_ATLAS_FALLBACK_ART[entry.symbol]
            : freeAtlasImage(entry, locale);
          const art = (
            <span className={"zw-free-atlas__art " + (failedArt.includes(entry.symbol) ? "is-fallback" : "is-poster")}>
              <img
                src={imagePath}
                alt={embedded ? "" : entry.heading[locale]}
                width={720}
                height={536}
                loading="lazy"
                decoding="async"
                onError={() => setFailedArt(prev => prev.includes(entry.symbol) ? prev : [...prev, entry.symbol])}
              />
            </span>
          );
          return (
            <details className="zw-free-atlas__item" key={entry.symbol} data-free-atlas-symbol={entry.symbol} open={!embedded && index === 0}>
              <summary>
                {embedded ? art : null}
                {embedded ? <span><b lang="zh">{entry.symbol}</b> {entry.roman}</span> : <><span lang="zh">{entry.symbol}</span><span>{entry.roman}</span></>}
                <span>{entry.kind === "stem" ? copy.stem : copy.branch}</span>
              </summary>
              <div className={embedded ? undefined : "zw-free-atlas__body"}>
                {embedded ? null : art}
                <div className="zw-free-atlas__words">
                  <strong>{entry.heading[locale]}</strong>
                  <p><b>{copy.strength}</b> · {entry.strength[locale]}</p>
                  <p><b>{copy.watch}</b> · {entry.caution[locale]}</p>
                  {VERIFIED_ATLAS_POSTERS ? <small>{copy.original}</small> : null}
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
