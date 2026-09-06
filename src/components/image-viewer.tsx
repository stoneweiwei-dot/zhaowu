import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import "@/image-viewer.css";

export type ImageViewerItem = {
  id: string;
  alt: string;
  thumbnailUrl: string;
  fullImageUrl: string;
};

const COPY = {
  "zh-Hant": { close: "關閉", prev: "上一張", next: "下一張", fail: "圖片暫時無法載入", hint: "點按查看" },
  "zh-Hans": { close: "关闭", prev: "上一张", next: "下一张", fail: "图片暂时无法载入", hint: "点按查看" },
  en: { close: "Close", prev: "Previous", next: "Next", fail: "Image could not be loaded just now", hint: "Tap to view" },
} as const;

type Props = {
  items: ImageViewerItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function ImageViewer({ items, index, onClose, onIndexChange }: Props) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const item = items[index];
  const [src, setSrc] = useState(item?.fullImageUrl ?? "");
  const [failed, setFailed] = useState(false);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const start = useRef({ x: 0, y: 0, tx: 0, ty: 0, dist: 0, scale: 1, pinched: false, pointers: new Map<number, { x: number; y: number }>() });
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSrc(item?.fullImageUrl ?? "");
    setFailed(false);
    setScale(1);
    setTx(0);
    setTy(0);
  }, [item?.id, item?.fullImageUrl]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && items.length > 1) onIndexChange((index - 1 + items.length) % items.length);
      if (event.key === "ArrowRight" && items.length > 1) onIndexChange((index + 1) % items.length);
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKey);
    };
  }, [index, items.length, onClose, onIndexChange]);

  if (!item || typeof document === "undefined") return null;

  function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function onPointerDown(event: React.PointerEvent) {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    start.current.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    start.current.x = event.clientX;
    start.current.y = event.clientY;
    start.current.tx = tx;
    start.current.ty = ty;
    start.current.scale = scale;
    if (start.current.pointers.size === 2) {
      const [a, b] = [...start.current.pointers.values()];
      start.current.dist = distance(a, b);
      start.current.pinched = true;
    }
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!start.current.pointers.has(event.pointerId)) return;
    start.current.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (start.current.pointers.size === 2) {
      const [a, b] = [...start.current.pointers.values()];
      const next = distance(a, b) / Math.max(1, start.current.dist);
      setScale(Math.min(4, Math.max(1, start.current.scale * next)));
      return;
    }
    if (scale > 1) {
      setTx(start.current.tx + event.clientX - start.current.x);
      setTy(start.current.ty + event.clientY - start.current.y);
    }
  }

  function onPointerUp(event: React.PointerEvent) {
    start.current.pointers.delete(event.pointerId);
    if (start.current.pointers.size > 0) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    const pinched = start.current.pinched;
    start.current.pinched = false;
    if (pinched || scale > 1) return;
    if (dy > 90 && Math.abs(dx) < 80) {
      onClose();
      return;
    }
    if (items.length > 1 && Math.abs(dx) > 80 && Math.abs(dy) < 80) {
      onIndexChange(dx < 0 ? (index + 1) % items.length : (index - 1 + items.length) % items.length);
    }
  }

  return createPortal(
    <div className="zhaowu-image-viewer" role="dialog" aria-modal="true" aria-label={item.alt} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="zhaowu-image-viewer-toolbar">
        <span />
        <button ref={closeRef} type="button" onClick={onClose} aria-label={copy.close}>×</button>
      </div>
      <div
        className="zhaowu-image-viewer-stage"
        onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={src}
          alt={item.alt}
          decoding="async"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
          onError={() => {
            if (!failed && src !== item.thumbnailUrl) {
              setFailed(true);
              setSrc(item.thumbnailUrl);
            }
          }}
        />
      </div>
      {failed ? <p className="zhaowu-image-viewer-status">{copy.fail}</p> : null}
      {items.length > 1 ? (
        <div className="zhaowu-image-viewer-nav">
          <button type="button" aria-label={copy.prev} onClick={() => onIndexChange((index - 1 + items.length) % items.length)}>‹</button>
          <button type="button" aria-label={copy.next} onClick={() => onIndexChange((index + 1) % items.length)}>›</button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}

export function viewerCopy(locale: "zh-Hant" | "zh-Hans" | "en") {
  return COPY[locale];
}
