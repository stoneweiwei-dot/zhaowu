import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { useI18n, type Locale } from "@/lib/i18n";

export type ScrollHintKind = "default" | "chart" | "cycles" | "months" | "none";

interface MobileScrollContainerProps {
  children: ReactNode;
  className?: string;
  minWidth?: string | number;
  hint?: ScrollHintKind | string;
  showHint?: boolean;
  role?: string;
  ariaLabel?: string;
  fadeEdges?: boolean;
}

const HINT_PRESETS: Record<Exclude<ScrollHintKind, "none">, Record<Locale, string>> = {
  default: {
    "zh-Hant": "← 左右滑動查看完整數據 →",
    "zh-Hans": "← 左右滑动查看完整数据 →",
    en: "← Scroll horizontally to view full table →",
  },
  chart: {
    "zh-Hant": "← 左右滑動查看完整盤面 →",
    "zh-Hans": "← 左右滑动查看完整盘面 →",
    en: "← Scroll horizontally to view full chart →",
  },
  cycles: {
    "zh-Hant": "← 左右滑動查看大運流年 →",
    "zh-Hans": "← 左右滑动查看大运流年 →",
    en: "← Scroll horizontally to view luck cycles →",
  },
  months: {
    "zh-Hant": "← 左右滑動查看完整流月與宜忌 →",
    "zh-Hans": "← 左右滑动查看完整流月与宜忌 →",
    en: "← Scroll horizontally to view monthly forecast →",
  },
};

export function MobileScrollContainer({
  children,
  className = "",
  minWidth,
  hint = "default",
  showHint = true,
  role = "region",
  ariaLabel,
  fadeEdges = true,
}: MobileScrollContainerProps) {
  const { locale } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const scrollable = scrollWidth > clientWidth + 2;
    setIsScrollable(scrollable);
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      checkScroll();
      if (!hasScrolled && el.scrollLeft > 8) {
        setHasScrolled(true);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(checkScroll) : null;
    if (observer) {
      observer.observe(el);
      if (el.firstElementChild) observer.observe(el.firstElementChild);
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkScroll);
      observer?.disconnect();
    };
  }, [checkScroll, hasScrolled]);

  const resolvedHintText = (() => {
    if (hint === "none" || !showHint) return null;
    if (hint in HINT_PRESETS) {
      return HINT_PRESETS[hint as keyof typeof HINT_PRESETS][locale];
    }
    return typeof hint === "string" ? hint : HINT_PRESETS.default[locale];
  })();

  const label = ariaLabel || resolvedHintText || "Scrollable table";

  return (
    <div
      className={`mobile-scroll-container ${fadeEdges ? "has-edge-fades" : ""} ${className}`.trim()}
      data-scroll-left={canScrollLeft ? "true" : "false"}
      data-scroll-right={canScrollRight ? "true" : "false"}
      data-scrollable={isScrollable ? "true" : "false"}
    >
      {isScrollable && resolvedHintText ? (
        <div
          className={`mobile-scroll-hint-bar ${hasScrolled ? "is-scrolled" : ""}`}
          aria-hidden="true"
        >
          <span className="mobile-scroll-hint">{resolvedHintText}</span>
        </div>
      ) : null}
      <div
        ref={trackRef}
        className="mobile-scroll-track"
        tabIndex={0}
        role={role}
        aria-label={label}
      >
        <div className="mobile-scroll-content" style={minWidth ? { minWidth } : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}
