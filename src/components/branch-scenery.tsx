import { useState } from "react";
import type { AnalysisResult, Chart } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { BRANCH_COPY, branchSceneryUrl, branchesInChart } from "@/lib/report/branch-scenery";
import "./branch-scenery.css";

/**
 * Report-only. Shows the scenery for the earthly branches that actually occur in the chart
 * (distinct, max four) — never all twelve. Titles/copy are text; the images are decoration and
 * fall back to text alone if they fail to load.
 */
export function BranchScenery({ result, chart = result?.chart }: { result?: AnalysisResult; chart?: Chart }) {
  const { locale } = useI18n();
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const zhis = (chart?.pillars ?? []).filter((p) => p.ready !== false).map((p) => p.zhi);
  const scenes = branchesInChart(zhis);
  if (!scenes.length) return null;
  const copy = BRANCH_COPY[locale];
  return (
    <section className="zhaowu-branch-scenery" aria-label={copy.heading}>
      <header className="zhaowu-branch-scenery__head">
        <span>{copy.eyebrow}</span>
        <h5>{copy.heading}</h5>
      </header>
      {scenes.map((s) => (
        <figure key={s.key} className="zhaowu-branch-scenery__plate" data-branch={s.key}>
          <div className="zhaowu-branch-scenery__title">
            <strong lang="zh">{s.zhi}</strong>
            <span lang="en">{s.roman}</span>
          </div>
          <dl className="zhaowu-branch-scenery__facts">
            <div><dt>{copy.sky}</dt><dd>{s.sky[locale]}</dd></div>
            <div><dt>{copy.land}</dt><dd>{s.land[locale]}</dd></div>
          </dl>
          {failed.has(s.key) ? (
            <p className="zhaowu-branch-scenery__fallback">{copy.unavailable}</p>
          ) : (
            <img
              src={branchSceneryUrl(s.key)}
              alt={s.alt[locale]}
              width={1080}
              height={1080}
              loading="lazy"
              decoding="async"
              onError={() => setFailed((prev) => new Set(prev).add(s.key))}
            />
          )}
          <figcaption>{s.line[locale]}</figcaption>
        </figure>
      ))}
      <small className="zhaowu-branch-scenery__note">{copy.note}</small>
    </section>
  );
}
