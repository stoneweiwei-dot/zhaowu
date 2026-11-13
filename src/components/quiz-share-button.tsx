import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { trackConversion } from "@/lib/observability/conversion-telemetry";
import { buildQuizShareModel, renderQuizShareCard, type QuizShareInput } from "@/lib/quiz-share-card";

const UI = {
  "zh-Hant": { share: "分享結果", copied: "已下載分享圖並複製測驗連結。", failed: "分享圖製作失敗，請再試一次。" },
  "zh-Hans": { share: "分享结果", copied: "已下载分享图并复制测验链接。", failed: "分享图制作失败，请重试。" },
  en: { share: "Share result", copied: "Image downloaded and quiz link copied.", failed: "Could not create the share image. Please try again." },
} as const;

export function QuizShareButton(props: QuizShareInput) {
  const { locale } = useI18n(); const copy = UI[locale]; const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function share() {
    if (busy) return; setBusy(true); setMessage("");
    try {
      const model = buildQuizShareModel({ ...props, locale });
      const canvas = renderQuizShareCard(model);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG export failed")), "image/png"));
      const file = new File([blob], `zhaowu-${props.quizId}-result.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: model.quizName, text: model.resultLabel, url: model.shareUrl });
        trackConversion("quiz_shared", { quiz_id: props.quizId, locale });
      } else {
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = file.name; link.click(); window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        try { await navigator.clipboard.writeText(model.shareUrl); } catch { /* download still succeeds */ }
        trackConversion("quiz_shared", { quiz_id: props.quizId, locale, method: "download" }); setMessage(copy.copied);
      }
    } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setMessage(copy.failed); }
    finally { setBusy(false); }
  }
  return <div className="grid gap-2"><button type="button" onClick={() => void share()} disabled={busy} className="min-h-12 rounded-full bg-wood px-5 py-3 text-sm font-semibold text-cream disabled:opacity-60">{busy ? "…" : copy.share}</button>{message ? <p role="status" className="text-center text-sm text-wood">{message}</p> : null}</div>;
}
