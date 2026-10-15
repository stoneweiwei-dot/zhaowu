import { useRef, type KeyboardEvent } from "react";
import { BrandIcon } from "@/components/brand-icon";

export type LanguageSwitcherOption<T extends string> = {
  value: T;
  /** Visible, native-script name. */
  label: string;
  /** Accessible name announced to assistive tech. */
  aria: string;
};

/**
 * Site language switcher (owner 2026-10-16: the old control was too small to notice).
 *
 * A labelled segmented control: always visible, one tap to switch, 44px+ touch targets, native-script
 * names at a readable size. It is a radio group so keyboard users get arrow-key navigation.
 * Styling lives in `src/language-switcher.css` and is intentionally independent of the legacy
 * `.site-lang-*` rules that previously squeezed this control.
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
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function move(from: number, step: number) {
    const next = (from + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      move(index, 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      move(index, -1);
    }
  }

  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));

  return (
    <div className="zw-langpick" role="radiogroup" aria-label={label} data-language-switcher>
      <span className="zw-langpick__label" aria-hidden="true">
        <BrandIcon name="language" />
        <span>{label}</span>
      </span>
      <div className="zw-langpick__track">
        {options.map((option, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={option.value}
              ref={(node) => { refs.current[index] = node; }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={option.aria}
              tabIndex={active ? 0 : -1}
              data-active={active ? "true" : "false"}
              className="zw-langpick__opt"
              onClick={() => onChange(option.value)}
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
