import { useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import "./-mythic-image-viewer.css";

/** Keep the original link usable without JavaScript; enhance it with an in-page viewer. */
export function MythicImageViewer({ src, label, locale, children, className }: {
  src: string; label: string; locale: Locale; children: ReactNode; className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const closeText = locale === "en" ? "Close image" : locale === "zh-Hans" ? "关闭图片" : "關閉圖片";
  return <>
    <a className={className} href={src} aria-label={label} onClick={(event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.current?.showModal) return;
      event.preventDefault();
      setOpen(true);
      dialog.current.showModal();
    }}>{children}</a>
    <dialog ref={dialog} className="hq-image-viewer" aria-label={label} onClose={() => setOpen(false)} onClick={(event) => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    }}>
      <button type="button" className="hq-image-viewer-close" onClick={() => dialog.current?.close()} autoFocus>{closeText} <span aria-hidden="true">×</span></button>
      {open && <img src={src} alt={label} />}
    </dialog>
  </>;
}
