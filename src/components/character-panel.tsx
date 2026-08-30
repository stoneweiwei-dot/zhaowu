import { useEffect, useState } from "react";
import type { Chart } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { loadCustomerGalleryCandidates, rankCustomerGalleryArt } from "@/lib/gallery-match";
import {
  DAO_ARTS,
  FO_ARTS,
  PANEL_ATTRS,
  WU_ARTS,
  buildCharacterPanel,
  isActiveArt,
  type ArtKey,
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
import { isCharacterPanelVisualEligible } from "@/lib/report/character-panel-visual-contract";

const COPY = {
  "zh-Hant": {
    portrait: "為你匹配的宋系人物畫像",
    empty: "正在按你的命盤匹配宋系人物畫像。",
    save: "保存這份 9:16 人物屬性圖",
    saving: "正在製圖…",
    saved: "9:16 人物屬性圖已保存到此裝置。",
    failed: "人物屬性圖暫時無法保存，請稍後再試。",
  },
  "zh-Hans": {
    portrait: "为你匹配的宋系人物画像",
    empty: "正在按你的命盘匹配宋系人物画像。",
    save: "保存这份 9:16 人物属性图",
    saving: "正在制图…",
    saved: "9:16 人物属性图已保存到此装置。",
    failed: "人物属性图暂时无法保存，请稍后再试。",
  },
  en: {
    portrait: "Song-style portrait matched to this chart",
    empty: "Matching a Song-style portrait to this chart.",
    save: "Save this 9:16 character attribute image",
    saving: "Preparing image…",
    saved: "The 9:16 character attribute image was saved on this device.",
    failed: "The character attribute image could not be saved right now.",
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
  const initialPortrait = portraitUrl && isCharacterPanelVisualEligible({ storage_path: portraitUrl }) ? portraitUrl : null;
  const [faceUrl, setFaceUrl] = useState<string | null>(initialPortrait);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (portraitUrl && isCharacterPanelVisualEligible({ storage_path: portraitUrl })) {
      setFaceUrl(portraitUrl);
      return;
    }
    let live = true;
    void loadCustomerGalleryCandidates()
      .then((rows) => rows.filter(({ asset, knowledge }) => isCharacterPanelVisualEligible({
        category: asset.category,
        asset_key: asset.asset_key,
        title: asset.title,
        storage_path: asset.storage_path,
        summary: knowledge.summary,
        subject_labels: knowledge.subject_labels,
        motifs: knowledge.motifs,
        use_roles: knowledge.use_roles,
      })))
      .then((rows) => rankCustomerGalleryArt(chart, rows)[0]?.imageUrl ?? null)
      .then((url) => {
        if (live && url && isCharacterPanelVisualEligible({ storage_path: url })) setFaceUrl(url);
        else if (live) setFaceUrl(null);
      })
      .catch(() => {
        if (live) setFaceUrl(null);
      });
    return () => { live = false; };
  }, [chart, portraitUrl]);

  async function onSaveImage() {
    setBusy(true);
    setMsg(null);
    try {
      await downloadCharacterPanelImage(panel, locale, faceUrl);
      setMsg(copy.saved);
    } catch {
      setMsg(copy.failed);
    } finally {
      setBusy(false);
    }
  }

  function artClass(key: ArtKey) {
    return isActiveArt(panel.artScores[key]) ? "is-active" : undefined;
  }

  return (
    <article className="zhaowu-character-panel seal-border" aria-labelledby="zhaowu-character-panel-title">
      <div className="zhaowu-character-sheet">
        <div className="zhaowu-character-left">
          <figure className="zhaowu-character-portrait">
            {faceUrl ? (
              <img src={faceUrl} alt={copy.portrait} />
            ) : (
              <figcaption>{copy.empty}</figcaption>
            )}
          </figure>
          <table className="zhaowu-character-arts">
            <tbody>
              <tr className={panel.school === "dao" ? "is-school" : undefined}>
                {arts.dao.map((art, index) => <th key={art} className={artClass(DAO_ARTS[index])}>{art}</th>)}
              </tr>
              <tr className={panel.school === "fo" ? "is-school" : undefined}>
                {arts.fo.map((art, index) => <td key={art} className={artClass(FO_ARTS[index])}>{art}</td>)}
              </tr>
              <tr className={panel.school === "wu" ? "is-school" : undefined}>
                {arts.wu.map((art, index) => <td key={art} className={artClass(WU_ARTS[index])}>{art}</td>)}
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
