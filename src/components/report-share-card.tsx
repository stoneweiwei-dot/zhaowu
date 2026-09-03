import { useEffect, useMemo, useState } from "react";
import type { AnalysisResult } from "@/lib/bazi/types";
import { useI18n, type Locale } from "@/lib/i18n";
import { buildShareCardModel, renderShareCardPng } from "@/lib/report/share-card";

const COPY: Record<Locale, {
  kicker: string;
  title: string;
  lead: string;
  make: string;
  making: string;
  share: string;
  remake: string;
  previewAlt: string;
  fallback: string;
  failed: string;
}> = {
  "zh-Hant": {
    kicker: "ZHAOWU · SHARE CARD",
    title: "分享我的命象",
    lead: "網站把已算出的內容排成 9:16 圖卡；不是讓圖片 AI 重畫文字。",
    make: "製作分享圖",
    making: "正在製作…",
    share: "分享／儲存",
    remake: "重新製作",
    previewAlt: "昭梧個人命象分享圖預覽",
    fallback: "若手機不支援系統分享，會改為下載 PNG。",
    failed: "分享圖製作失敗，原報告不受影響。",
  },
  "zh-Hans": {
    kicker: "ZHAOWU · SHARE CARD",
    title: "分享我的命象",
    lead: "网站把已算出的内容排成 9:16 图卡；不是让图片 AI 重画文字。",
    make: "制作分享图",
    making: "正在制作…",
    share: "分享／保存",
    remake: "重新制作",
    previewAlt: "昭梧个人命象分享图预览",
    fallback: "若手机不支持系统分享，会改为下载 PNG。",
    failed: "分享图制作失败，原报告不受影响。",
  },
  en: {
    kicker: "ZHAOWU · SHARE CARD",
    title: "Share my snapshot",
    lead: "The site composes a 9:16 image from calculated fields. AI does not redraw the report text.",
    make: "Create share image",
    making: "Creating…",
    share: "Share / save",
    remake: "Recreate",
    previewAlt: "Zhaowu personal share-card preview",
    fallback: "If system sharing is unavailable, the PNG will download instead.",
    failed: "The share image could not be created. Your report is unaffected.",
  },
};

function safeFilename(locale: Locale) {
  return locale === "en" ? "zhaowu-share-card.png" : "昭梧-命象分享圖.png";
}

export function ReportShareCard({ result }: { result: AnalysisResult }) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const model = useMemo(() => buildShareCardModel(result, locale), [result, locale]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setBlob(null);
    setError(false);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
  }, [result.id, locale]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function createCard() {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const nextBlob = await renderShareCardPng(model);
      const nextUrl = URL.createObjectURL(nextBlob);
      setBlob(nextBlob);
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return nextUrl;
      });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function shareCard() {
    if (!blob) return;
    const file = new File([blob], safeFilename(locale), { type: "image/png" });
    try {
      if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ files: [file], title: model.brand });
        return;
      }
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = safeFilename(locale);
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="zhaowu-share-card-panel" aria-labelledby="zhaowu-share-card-title">
      <header>
        <p>{copy.kicker}</p>
        <h4 id="zhaowu-share-card-title">{copy.title}</h4>
        <span>{copy.lead}</span>
      </header>

      {previewUrl ? (
        <div className="zhaowu-share-preview">
          <img src={previewUrl} alt={copy.previewAlt} />
        </div>
      ) : (
        <div className="zhaowu-share-placeholder" aria-hidden="true">
          <div>
            <small>{model.brand}</small>
            <b>{model.title}</b>
            <span>{model.keywords.join(" · ")}</span>
          </div>
        </div>
      )}

      <div className="zhaowu-share-actions">
        <button type="button" className="zhaowu-share-primary" onClick={previewUrl ? shareCard : createCard} disabled={busy}>
          {busy ? copy.making : previewUrl ? copy.share : copy.make}
        </button>
        {previewUrl ? <button type="button" className="zhaowu-share-secondary" onClick={createCard} disabled={busy}>{copy.remake}</button> : null}
      </div>

      <p className="zhaowu-share-fallback">{error ? copy.failed : copy.fallback}</p>
      <p className="zhaowu-share-watermark" aria-hidden="true">STONE 原創</p>
    </section>
  );
}
