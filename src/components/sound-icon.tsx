/**
 * Owner 2026-09-30: the opening/login sound control used a text glyph ("♪") plus a text label inside a 44px
 * circle, so the label wrapped one character per line and overflowed the screen, and the login page used
 * emoji. One inline-SVG speaker icon (line style, currentColor) replaces both; the accessible name lives
 * on the button's aria-label, never inside the visual.
 */
export function SoundIcon({ on, size = 20 }: { on: boolean; size?: number }) {
  return (
    <svg
      className="zhaowu-sound-icon"
      data-sound-on={on ? "true" : "false"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 9.5v5h3.6L12.5 19V5L7.6 9.5H4Z" fill="currentColor" fillOpacity=".14" />
      {on ? (
        <>
          <path d="M15.6 9.2a4 4 0 0 1 0 5.6" />
          <path d="M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
        </>
      ) : (
        <>
          <path d="M16 9.6l4.4 4.8" />
          <path d="M20.4 9.6L16 14.4" />
        </>
      )}
    </svg>
  );
}
