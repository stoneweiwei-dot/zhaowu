/**
 * Owner 2026-10-01: the music controls used text glyphs (⏮ ⏭ ▶ Ⅱ ↻ ⇄). On iPhone ⏮/⏭ render as blue emoji
 * squares, which looked like stuck-on patches and clashed with the paper/ink theme. One inline-SVG set
 * (line style, currentColor) replaces them everywhere the player appears.
 */
type IconName = "prev" | "next" | "play" | "pause" | "loop" | "shuffle";

export function MusicIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    className: "zhaowu-music-icon",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    focusable: "false" as const,
    "data-music-icon": name,
  };
  switch (name) {
    case "prev":
      return (<svg {...common}><path d="M6.5 5.5v13" /><path d="M18 6.2v11.6L9.4 12 18 6.2Z" fill="currentColor" fillOpacity=".14" /></svg>);
    case "next":
      return (<svg {...common}><path d="M17.5 5.5v13" /><path d="M6 6.2v11.6L14.6 12 6 6.2Z" fill="currentColor" fillOpacity=".14" /></svg>);
    case "play":
      return (<svg {...common}><path d="M8 5.6v12.8L18.4 12 8 5.6Z" fill="currentColor" fillOpacity=".14" /></svg>);
    case "pause":
      return (<svg {...common}><path d="M9 6v12" /><path d="M15 6v12" /></svg>);
    case "loop":
      return (<svg {...common}><path d="M17 3.5l3 3-3 3" /><path d="M4 11V9.5a3 3 0 0 1 3-3h13" /><path d="M7 20.5l-3-3 3-3" /><path d="M20 13v1.5a3 3 0 0 1-3 3H4" /></svg>);
    case "shuffle":
      return (<svg {...common}><path d="M16.5 4h3.5v3.5" /><path d="M4 19l16-15" /><path d="M20 16.5V20h-3.5" /><path d="M14 14l6 6" /><path d="M4 5l5 5" /></svg>);
  }
}
