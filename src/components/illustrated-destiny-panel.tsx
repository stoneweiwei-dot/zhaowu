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
      <defs>
        <linearGradient id="scene-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBF2" />
          <stop offset="1" stopColor="#F3ECDD" />
        </linearGradient>
        <linearGradient id="scene-jade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#DCE6DC" />
          <stop offset=".55" stopColor="#AFC3B5" />
          <stop offset="1" stopColor="#7F9D8F" />
        </linearGradient>
      </defs>
      <path d="M0 0H400V190H0Z" fill="url(#scene-paper)" />
      <circle cx="310" cy="47" r="19" fill="#DFC58C" opacity=".76" />
      <path d="M0 128 Q58 62 116 124 Q168 80 211 124 Q270 49 340 126 Q366 103 400 114V176H0Z" fill="#D8E2D9" opacity=".82" />
      <path d="M42 132 Q91 87 139 130 Q193 72 244 129 Q303 91 365 130V176H42Z" fill="url(#scene-jade)" opacity=".48" />
      <path d={art.horizon} fill="none" stroke="#466D68" strokeWidth="1.7" strokeLinecap="round" />
      <path d={art.path} fill="none" stroke={art.accent} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18 151 Q90 141 153 150 T278 149 T389 146" fill="none" stroke="#F4EFE3" strokeWidth="8" strokeLinecap="round" opacity=".9" />
      <path d="M20 156 Q115 148 202 157 T382 152" fill="none" stroke="#C19A55" strokeWidth="1.3" opacity=".72" />
      <path d="M36 59c14-10 28-8 39 4 12-11 26-12 39-3M272 82c12-9 25-8 36 3 10-9 22-10 34-2" fill="none" stroke="#A8B9AE" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
      <g fill="none" stroke="#536F63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".9">
        <path d="M79 129v-29m0 5-11 11m11-4 12 11" />
        <path d="M66 116c7-8 13-10 19-4M74 106c6-7 11-8 16-3" />
        <path d="M326 132v-27m0 5-9 9m9-3 10 10" />
      </g>
      <g transform="translate(286 104)" fill="none" stroke="#8E6A3D" strokeWidth="1.7" strokeLinejoin="round">
        <path d="M0 22h38M5 22V7h28v15M2 7h34L19-2Z" />
        <path d="M12 9v13M26 9v13" />
      </g>
      <path d="M0 174 Q91 166 181 173 T400 169V190H0Z" fill="#F7F1E6" />
    </svg>
  );
}

export function IllustratedDestinyPanel({ result }: { result: AnalysisResult }) {
  const scene = buildIllustratedDestiny(result);
  if (!scene) return null;
  const basisEvidence = scene.sourceEvidence.filter((evidence) => evidence.trim() !== scene.sourceClaim.trim());
  return (
    <figure className="illustrated-destiny-panel" data-illustrated-destiny data-scene={scene.sceneType}
      data-source-claim={scene.sourceClaim} data-confidence={scene.confidence}>
      <SceneDrawing type={scene.sceneType} />
      <figcaption>{scene.caption}</figcaption>
      <details>
        <summary>{result.locale === "en" ? "Reading basis" : result.locale === "zh-Hant" ? "命理依據" : "判断依据"}</summary>
        {basisEvidence.length ? <ul>{basisEvidence.map((evidence, index) => <li key={index}>{evidence}</li>)}</ul> : null}
        <small>{scene.visualMetaphor}</small>
      </details>
    </figure>
  );
}

function xmlEscape(text: string) {
  return text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char] ?? char);
}
function downloadIllustratedShare(scene: NonNullable<ReturnType<typeof buildIllustratedDestiny>>, question: string, ratio: "9:16" | "4:5" | "1:1") {
  const sizes = { "9:16": [1080, 1920], "4:5": [1080, 1350], "1:1": [1080, 1080] } as const;
  const [width, height] = sizes[ratio];
  const caption = xmlEscape(Array.from(scene.caption).slice(0, 92).join(""));
  const prompt = xmlEscape(Array.from(question).slice(0, 72).join(""));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#F6F1E7"/><path d="M0 ${height*.42}Q${width*.2} ${height*.27} ${width*.48} ${height*.42}T${width} ${height*.39}V${height*.59}H0Z" fill="#DCE4DB"/><path d="M0 ${height*.49}Q${width*.5} ${height*.46} ${width} ${height*.5}" fill="none" stroke="#456B72" stroke-width="3"/><circle cx="${width*.7}" cy="${height*.32}" r="42" fill="#E7D9B8"/><g stroke="#242620" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="${width*.5}" cy="${height*.44}" r="13"/><path d="M${width*.5} ${height*.455}v54m0-33-20 23m20-23 19 20m-19 13-17 30m17-30 20 30"/></g><rect y="${height*.59}" width="100%" height="${height*.41}" fill="#FFF9EE"/><foreignObject x="80" y="${height*.61}" width="${width-160}" height="${height*.09}"><div xmlns="http://www.w3.org/1999/xhtml" style="font:30px/1.4 sans-serif;color:#355E50;overflow-wrap:anywhere">${prompt}</div></foreignObject><foreignObject x="80" y="${height*.70}" width="${width-160}" height="${height*.17}"><div xmlns="http://www.w3.org/1999/xhtml" style="font:48px/1.5 serif;color:#242620;overflow-wrap:anywhere">${caption}</div></foreignObject><text x="80" y="${height-65}" font-size="28" letter-spacing="3" fill="#355E50">ZHAOWU · 昭梧</text><rect x="${width-190}" y="${height-195}" width="96" height="96" fill="none" stroke="#C19A55" stroke-width="3" stroke-dasharray="8 7"/></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `zhaowu-share-${ratio.replace(":", "x")}.svg`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function IllustratedShareCard({ result }: { result: AnalysisResult }) {
  const scene = buildIllustratedDestiny(result);
  if (!scene) return null;
  return <details className="illustrated-destiny-share" data-illustrated-share>
    <summary>{result.locale === "en" ? "Share this scene" : result.locale === "zh-Hans" ? "分享这幅插页" : "分享這幅插頁"}</summary>
    <div className="illustrated-destiny-formats">{(["9:16", "4:5", "1:1"] as const).map((ratio) =>
      <button type="button" key={ratio} onClick={() => downloadIllustratedShare(scene, result.question, ratio)}>{ratio}</button>)}</div>
  </details>;
}
