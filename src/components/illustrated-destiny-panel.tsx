import type { AnalysisResult } from "@/lib/bazi/types";
import { buildIllustratedDestiny, type IllustratedSceneType } from "@/lib/report/illustrated-destiny";

const ART: Record<IllustratedSceneType, { horizon: string; accent: string; path: string }> = {
  workshop: { horizon: "M20 145 Q105 124 205 145 T380 140", accent: "#64865D", path: "M260 145 Q280 118 310 106" },
  crossing: { horizon: "M20 145 Q110 140 190 145 T380 140", accent: "#456B72", path: "M135 145 Q200 110 260 145" },
  courtyard: { horizon: "M20 145 Q105 124 205 145 T380 140", accent: "#AF8E55", path: "M85 145 L85 104 Q120 72 155 104 L155 145" },
  "open-road": { horizon: "M20 145 Q105 124 205 145 T380 140", accent: "#355E50", path: "M175 145 Q200 118 190 96 Q180 76 214 56" },
};

function SceneDrawing({ type }: { type: IllustratedSceneType }) {
  const art = ART[type];
  return (
    <svg viewBox="0 0 400 190" role="img" aria-label="A quiet Song-inspired landscape in ink and mineral colour" className="illustrated-destiny-art">
      <path d="M0 0H400V190H0Z" fill="#FFF9EE" />
      <path d="M16 128 Q80 58 146 127 Q230 44 318 127 Q348 100 390 119 V170 H16Z" fill="#DCE4DB" opacity=".72" />
      <path d={art.horizon} fill="none" stroke="#456B72" strokeWidth="1.5" strokeLinecap="round" />
      <path d={art.path} fill="none" stroke={art.accent} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 160 Q125 152 205 161 T378 157" fill="none" stroke="#C19A55" strokeWidth="1" opacity=".72" />
      <circle cx="276" cy="53" r="16" fill="#E7D9B8" opacity=".72" />
      <path d="M0 171 Q90 166 180 172 T400 168 V190 H0Z" fill="#F6F1E7" />
      <g fill="none" stroke="#242620" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="197" cy="120" r="4" fill="#F6F1E7" />
        <path d="M197 124v17m0-11-6 7m6-7 6 6m-6 5-5 9m5-9 6 9" />
      </g>
      <path d="M190 117q7-8 14 0" fill="none" stroke={art.accent} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IllustratedDestinyPanel({ result }: { result: AnalysisResult }) {
  const scene = buildIllustratedDestiny(result);
  if (!scene) return null;
  return (
    <figure className="illustrated-destiny-panel" data-illustrated-destiny data-scene={scene.sceneType}
      data-source-claim={scene.sourceClaim} data-confidence={scene.confidence}>
      <SceneDrawing type={scene.sceneType} />
      <figcaption>{scene.caption}</figcaption>
      <details>
        <summary>{result.locale === "en" ? "Reading basis" : result.locale === "zh-Hant" ? "命理依據" : "判断依据"}</summary>
        <p>{scene.sourceClaim}</p>
        <ul>{scene.sourceEvidence.map((evidence, index) => <li key={index}>{evidence}</li>)}</ul>
        <small>{scene.visualMetaphor}</small>
      </details>
    </figure>
  );
}
