import { useState } from "react";
import type { Chart } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  PANEL_ATTRS,
  buildCharacterPanel,
  type MethodSchool,
  type PanelAttr,
} from "@/lib/report/character-panel";
import {
  artRows,
  attrLabel,
  downloadCharacterPanelImage,
  panelCaptions,
  radarVertex,
  schoolCaption,
} from "@/lib/report/character-panel-card";

const COPY = {
  "zh-Hant": {
    portrait: "命詰圖",
    empty: "生成命詰圖後，畫像會放在這裡。",
    save: "保存人物面板圖",
    saving: "正在製圖…",
    saved: "人物面板圖已保存到此裝置。",
    failed: "人物面板圖暫時無法保存，請稍後再試。",
  },
  "zh-Hans": {
    portrait: "命诰图",
    empty: "生成命诰图后，画像会放在这里。",
    save: "保存人物面板图",
    saving: "正在制图…",
    saved: "人物面板图已保存到此装置。",
    failed: "人物面板图暂时无法保存，请稍后再试。",
  },
  en: {
    portrait: "Decree image",
    empty: "Generate the decree image to place the portrait here.",
    save: "Save character panel image",
    saving: "Preparing image…",
    saved: "The character panel image was saved on this device.",
    failed: "The character panel image could not be saved right now.",
  },
} as const;

const SCHOOL_MARK: Record<MethodSchool, Record<Locale, string>> = {
  dao: { "zh-Hant": "道", "zh-Hans": "道", en: "Dao" },
  fo: { "zh-Hant": "佛", "zh-Hans": "佛", en: "Fo" },
  wu: { "zh-Hant": "巫", "zh-Hans": "巫", en: "Wu" },
};

function radarPoints(scores: Record<PanelAttr, number>, cx: number, cy: number, r: number) {
  return PANEL_ATTRS.map((key, index) => {
    const point = radarVertex(index, cx, cy, (scores[key] / 10) * r);
    return `${point.x},${point.y}`;
  }).join(" ");
}

function ringPoints(cx: number, cy: number, r: number) {
  return PANEL_ATTRS.map((_, index) => {
    const point = radarVertex(index, cx, cy, r);
    return `${point.x},${point.y}`;
  }).join(" ");
}

export function CharacterPanel({
  chart,
  portraitUrl,
}: {
  chart: Chart;
  portraitUrl?: string | null;
}) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const panel = buildCharacterPanel(chart);
  const arts = artRows(locale);
  const captions = panelCaptions(locale);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSaveImage() {
    setBusy(true);
    setMsg(null);
    try {
      await downloadCharacterPanelImage(panel, locale, portraitUrl);
      setMsg(copy.saved);
    } catch {
      setMsg(copy.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="zhaowu-character-panel seal-border" aria-labelledby="zhaowu-character-panel-title">
      <div className="zhaowu-character-sheet">
        <div className="zhaowu-character-left">
          <figure className="zhaowu-character-portrait">
            {portraitUrl ? (
              <img src={portraitUrl} alt={copy.portrait} />
            ) : (
              <figcaption>{copy.empty}</figcaption>
            )}
          </figure>
          <table className="zhaowu-character-arts">
            <tbody>
              <tr className={panel.school === "dao" ? "is-school" : undefined}>
                {arts.dao.map((art) => <th key={art}>{art}</th>)}
              </tr>
              <tr className={panel.school === "fo" ? "is-school" : undefined}>
                {arts.fo.map((art) => <td key={art}>{art}</td>)}
              </tr>
              <tr className={panel.school === "wu" ? "is-school" : undefined}>
                {arts.wu.map((art) => <td key={art}>{art}</td>)}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="zhaowu-character-right">
          <header className="zhaowu-character-nameblock">
            <h3 id="zhaowu-character-panel-title">{panel.title}</h3>
            <p>{schoolCaption(panel.school, locale)} · {panel.dayMaster} · {SCHOOL_MARK[panel.school][locale]}</p>
          </header>
          <svg className="zhaowu-character-radar" viewBox="0 0 280 280" role="img" aria-label={captions[0]}>
            <polygon className="zhaowu-character-radar-ring" points={ringPoints(140, 140, 92)} />
            <polygon className="zhaowu-character-radar-fill" points={radarPoints(panel.scores, 140, 140, 92)} />
            {PANEL_ATTRS.map((key, index) => {
              const pos = radarVertex(index, 140, 140, 118);
              return (
                <text key={key} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle">
                  {attrLabel(key, locale)}
                </text>
              );
            })}
          </svg>
          <table className="zhaowu-character-scores">
            <thead>
              <tr>{PANEL_ATTRS.map((key) => <th key={key}>{attrLabel(key, locale)}</th>)}</tr>
            </thead>
            <tbody>
              <tr>{PANEL_ATTRS.map((key) => <td key={key}>{panel.scores[key]}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="zhaowu-character-notes">
        {captions.map((line) => <p key={line}>{line}</p>)}
      </div>

      <div className="zhaowu-character-actions">
        <button type="button" className="zhaowu-character-save" disabled={busy} onClick={() => void onSaveImage()}>
          {busy ? copy.saving : copy.save}
        </button>
        {msg ? <p className="zhaowu-character-msg">{msg}</p> : null}
      </div>
    </article>
  );
}
