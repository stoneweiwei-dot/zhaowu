import { useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import "./-mythic-image-viewer.css";

/** Keep the original link usable without JavaScript; enhance it with an in-page viewer. */
export function MythicImageViewer({ src, label, locale, children, className }: {
  src: string; label: string; locale: Locale; children: ReactNode; className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const closeText = locale === "en" ? "Close image" : locale === "zh-Hans" ? "关闭图片" : "關閉圖片";
  return <>
    <a ref={trigger} className={className} href={src} aria-label={label} onClick={(event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.current?.showModal) return;
      event.preventDefault();
      setFailed(false);
      setOpen(true);
      dialog.current.showModal();
    }}>{children}</a>
    <dialog ref={dialog} className="hq-image-viewer" aria-label={label} onClose={() => {
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    }} onClick={(event) => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    }}>
      <button type="button" className="hq-image-viewer-close" onClick={() => dialog.current?.close()} autoFocus>{closeText} <span aria-hidden="true">×</span></button>
      <a className="hq-image-viewer-original" href={src} target="_blank" rel="noopener noreferrer">{locale === "en" ? "Full size" : locale === "zh-Hans" ? "查看原图" : "查看原圖"}</a>
      {open && (failed
        ? <p className="hq-image-viewer-error" role="status">{locale === "en" ? "The image could not be loaded. Please close and try again." : locale === "zh-Hans" ? "图片加载失败，请关闭后重试。" : "圖片載入失敗，請關閉後重試。"}</p>
        : <img src={src} alt={label} onError={() => setFailed(true)} />)}
    </dialog>
  </>;
}
