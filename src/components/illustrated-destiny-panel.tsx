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
    <summary>{result.locale === "en" ? "Share this scene" : "分享這幅插頁"}</summary>
    <div className="illustrated-destiny-formats">{(["9:16", "4:5", "1:1"] as const).map((ratio) =>
      <button type="button" key={ratio} onClick={() => downloadIllustratedShare(scene, result.question, ratio)}>{ratio}</button>)}</div>
  </details>;
}
export function IllustratedDestinyWelcome({ locale }: { locale: string }) {
  return <aside className="illustrated-destiny-welcome" data-illustrated-welcome>
    <svg viewBox="0 0 100 44" aria-hidden="true"><path d="M1 36Q23 7 49 36T99 32V43H1Z" fill="#DCE4DB"/>
      <path d="M2 38Q50 33 98 37" fill="none" stroke="#456B72" strokeWidth="1.3"/>
      <circle cx="70" cy="13" r="6" fill="#E7D9B8"/>
      <path d="M40 30v8m0-5-3 4m3-4 4 3" stroke="#242620" fill="none" strokeWidth="1.2"/></svg>
    <span>{locale === "en" ? "Start with one question" : "今天先看一件事"}</span>
    <a href="#analysis">{locale === "en" ? "Begin with your birth details" : "從生辰開始"}</a>
  </aside>;
}
