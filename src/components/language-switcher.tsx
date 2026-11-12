import { useEffect, useLayoutEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { BrandIcon } from "@/components/brand-icon";

export type LanguageSwitcherOption<T extends string> = {
  value: T;
  /** Visible, native-script name. Also the collapsed short name. */
  label: string;
  /** Accessible name announced to assistive tech. */
  aria: string;
};

/**
 * Site language switcher.
 *
 * Collapsed by default: a 44px control with the globe and the current language's short name.
 * Opening it reveals the full list (44px targets, wrapping rows). Choosing a language, tapping
 * the compact control again, pressing Escape, or tapping outside collapses it.
 * Styling lives in `src/language-switcher.css`.
 */
export function LanguageSwitcher<T extends string>({
  value,
  options,
  label,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<LanguageSwitcherOption<T>>;
  label: string;
  onChange: (next: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();

  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const active = options[activeIndex] ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The inner-page control can wrap to either side depending on its translated
  // label. Clamp the open list to the viewport rather than assuming alignment.
  useLayoutEffect(() => {
    if (!open) return;
    const fit = () => {
      const root = rootRef.current;
      const track = root?.querySelector<HTMLElement>(".zw-langpick__track");
      if (!root || !track) return;
      root.style.setProperty("--zw-langpick-shift", "0px");
      const rect = track.getBoundingClientRect();
      const shift = rect.left < 12 ? rect.left - 12 : Math.max(0, rect.right - window.innerWidth + 12);
      root.style.setProperty("--zw-langpick-shift", `${shift}px`);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open, value]);

  function move(from: number, step: number) {
    const next = (from + step + options.length) % options.length;
    onChange(options[next].value);
    optionRefs.current[next]?.focus();
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      move(index, 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      move(index, -1);
    }
  }

  function choose(next: T) {
    onChange(next);
    setOpen(false);
    toggleRef.current?.focus();
  }

  return (
    <div
      ref={rootRef}
      className={`zw-langpick${open ? " is-open" : ""}`}
      data-language-switcher
      data-open={open ? "true" : "false"}
    >
      <button
        ref={toggleRef}
        type="button"
        className="zw-langpick__toggle"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${active?.aria ?? ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <BrandIcon name="language" />
        <span>{active?.label}</span>
      </button>
      <div id={listId} className="zw-langpick__track" role="radiogroup" aria-label={label} hidden={!open}>
        {options.map((option, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={option.value}
              ref={(node) => { optionRefs.current[index] = node; }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.aria}
              tabIndex={selected ? 0 : -1}
              data-active={selected ? "true" : "false"}
              data-lang={option.value}
              className="zw-langpick__opt"
              onClick={() => choose(option.value)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
