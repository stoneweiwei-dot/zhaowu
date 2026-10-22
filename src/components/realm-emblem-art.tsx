import type { Locale } from "@/lib/i18n";

export type RealmKey = "A" | "B" | "C" | "D" | "E" | "F";

type Tone = { field: string; soft: string; ink: string; deep: string; gold: string; accent: string };

// Symbolic emblem per realm (heaven / asura / human / animal / hungry ghost / hell); no figures, no faces.
const TONES: Record<RealmKey, Tone> = {
  A: { field: "#e2ebf0", soft: "#f1f6f8", ink: "#6f92a8", deep: "#3f6478", gold: "#b69152", accent: "#f2d98a" },
  B: { field: "#efe0d6", soft: "#f8eee7", ink: "#a4503a", deep: "#6d3022", gold: "#b3873f", accent: "#e0a35a" },
  C: { field: "#e6e5d6", soft: "#f3f2e6", ink: "#6c7b55", deep: "#43503a", gold: "#ad8441", accent: "#d8c995" },
  D: { field: "#e9e1cf", soft: "#f5efdf", ink: "#7a6340", deep: "#4f3f27", gold: "#ad8441", accent: "#cdb98a" },
  E: { field: "#e4e1e6", soft: "#f1eff3", ink: "#5f5868", deep: "#38323f", gold: "#a88a55", accent: "#c9b97a" },
  F: { field: "#ecdad4", soft: "#f6e9e4", ink: "#8d2f26", deep: "#531a15", gold: "#b3873f", accent: "#e8793a" },
};

const COPY: Record<Locale, { kicker: string; note: string }> = {
  "zh-Hant": { kicker: "六道習氣 · 象徵圖", note: "依你的測驗結果繪製的象徵圖，不是對你本人或來世的判定，只做視覺化。" },
  "zh-Hans": { kicker: "六道习气 · 象征图", note: "依你的测验结果绘制的象征图，不是对你本人或来世的判定，只做视觉化。" },
  en: { kicker: "SIX REALMS HABIT · EMBLEM", note: "A symbolic emblem for your result. It is not a judgement of you or of any rebirth — visual only." },
};

function Emblem({ realm, t }: { realm: RealmKey; t: Tone }) {
  switch (realm) {
    case "A": // heaven: sun disc, rays, cloud scrolls, lotus
      return (
        <g>
          <g stroke={t.gold} strokeWidth="5" strokeLinecap="round" opacity="0.85">
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i * Math.PI * 2) / 16;
              const r1 = 84, r2 = i % 2 ? 112 : 130;
              return <line key={i} x1={Math.cos(a) * r1} y1={-60 + Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={-60 + Math.sin(a) * r2} />;
            })}
          </g>
          <circle cx="0" cy="-60" r="70" fill={t.accent} stroke={t.gold} strokeWidth="5" />
          <circle cx="0" cy="-60" r="48" fill="none" stroke={t.gold} strokeWidth="3" opacity="0.6" />
          <g fill="none" stroke={t.ink} strokeWidth="9" strokeLinecap="round">
            <path d="M-150 56 C-130 24 -96 30 -86 56 C-70 40 -44 44 -36 62 C-20 46 4 50 12 66 C28 52 54 54 62 70 C80 58 108 62 120 82" />
            <path d="M-120 100 C-100 76 -70 82 -62 102 C-46 88 -22 92 -14 108 C2 94 26 98 34 112" opacity="0.7" />
          </g>
          <g fill={t.soft} stroke={t.deep} strokeWidth="3">
            {[-50, -25, 0, 25, 50].map((r) => <ellipse key={r} cx="0" cy="146" rx="15" ry="42" transform={`rotate(${r} 0 168)`} />)}
          </g>
        </g>
      );
    case "B": // asura: crossed spears over a shield, banner
      return (
        <g>
          <g stroke={t.deep} strokeWidth="9" strokeLinecap="round">
            <line x1="-120" y1="150" x2="110" y2="-120" />
            <line x1="120" y1="150" x2="-110" y2="-120" />
          </g>
          <path d="M104 -134 L136 -150 L124 -112Z" fill={t.ink} stroke={t.deep} strokeWidth="3" />
          <path d="M-104 -134 L-136 -150 L-124 -112Z" fill={t.ink} stroke={t.deep} strokeWidth="3" />
          <path d="M-70 -50 C-70 -88 70 -88 70 -50 L70 40 C70 100 24 128 0 140 C-24 128 -70 100 -70 40Z" fill={t.ink} stroke={t.gold} strokeWidth="6" />
          <path d="M0 -70 L0 120 M-56 -6 L56 -6" stroke={t.gold} strokeWidth="4" opacity="0.7" />
          <path d="M-30 20 C-10 -20 10 -20 30 20 C10 10 -10 10 -30 20Z" fill={t.accent} />
          <path d="M-130 -150 C-90 -176 -40 -150 0 -166 C40 -150 90 -176 130 -150" fill="none" stroke={t.accent} strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        </g>
      );
    case "C": // human: balance scale (choice and adjustment)
      return (
        <g stroke={t.deep} strokeWidth="8" strokeLinecap="round" fill="none">
          <line x1="0" y1="-130" x2="0" y2="130" />
          <circle cx="0" cy="-138" r="12" fill={t.accent} />
          <path d="M-130 -70 C-60 -96 60 -96 130 -70" />
          <path d="M-130 -70 L-160 20 M-130 -70 L-100 20 M130 -70 L100 20 M130 -70 L160 -4" strokeWidth="4" />
          <path d="M-176 20 C-170 64 -90 64 -84 20Z" fill={t.ink} />
          <path d="M84 -4 C90 40 170 40 176 -4Z" fill={t.ink} transform="translate(0 0)" />
          <path d="M-70 134 L70 134 L50 108 L-50 108Z" fill={t.ink} />
          <circle cx="-130" cy="-70" r="7" fill={t.gold} stroke="none" />
          <circle cx="130" cy="-70" r="7" fill={t.gold} stroke="none" />
        </g>
      );
    case "D": // animal: paw prints along a path with grass
      return (
        <g fill={t.ink}>
          {[[-96, 96, -20], [-34, 34, -10], [34, -28, 0], [98, -92, 10]].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(0.66)`}>
              <ellipse cx="0" cy="14" rx="34" ry="28" />
              <ellipse cx="-34" cy="-18" rx="13" ry="17" transform="rotate(-18 -34 -18)" />
              <ellipse cx="-12" cy="-34" rx="13" ry="18" transform="rotate(-6 -12 -34)" />
              <ellipse cx="14" cy="-34" rx="13" ry="18" transform="rotate(6 14 -34)" />
              <ellipse cx="36" cy="-18" rx="13" ry="17" transform="rotate(18 36 -18)" />
            </g>
          ))}
          <g stroke={t.deep} strokeWidth="6" strokeLinecap="round" fill="none">
            <path d="M-150 150 C-146 120 -140 104 -130 90 M-134 150 C-134 126 -126 112 -116 100 M-118 150 C-122 128 -116 118 -106 110" />
            <path d="M110 150 C112 124 120 108 132 96 M126 150 C128 130 136 118 146 110" />
          </g>
        </g>
      );
    case "E": // hungry ghost: empty bowl, thin steam that rises but nothing in it
      return (
        <g>
          <path d="M-120 20 C-118 110 -60 150 0 150 C60 150 118 110 120 20Z" fill={t.ink} stroke={t.gold} strokeWidth="5" />
          <ellipse cx="0" cy="20" rx="120" ry="28" fill={t.deep} stroke={t.gold} strokeWidth="5" />
          <ellipse cx="0" cy="22" rx="98" ry="19" fill={t.soft} opacity="0.35" />
          <rect x="-46" y="146" width="92" height="14" rx="6" fill={t.deep} />
          <g fill="none" stroke={t.accent} strokeWidth="5" strokeLinecap="round" opacity="0.85">
            <path d="M-50 -6 C-72 -40 -30 -62 -52 -100 C-62 -118 -52 -134 -40 -146" />
            <path d="M0 -10 C-22 -44 22 -70 0 -108 C-8 -124 2 -140 14 -152" />
            <path d="M50 -6 C28 -40 70 -62 48 -100 C40 -116 48 -130 60 -140" />
          </g>
          <g stroke={t.gold} strokeWidth="3" opacity="0.6">
            <line x1="-40" y1="60" x2="40" y2="60" /><line x1="-30" y1="86" x2="30" y2="86" />
          </g>
        </g>
      );
    case "F": // hell: flame wheel over cracked ground
    default:
      return (
        <g>
          <path d="M0 -150 C30 -110 70 -90 64 -40 C100 -70 96 -110 86 -130 C140 -90 146 -10 110 50 C96 80 56 108 0 108 C-56 108 -96 80 -110 50 C-146 -10 -140 -90 -86 -130 C-96 -110 -100 -70 -64 -40 C-70 -90 -30 -110 0 -150Z" fill={t.ink} stroke={t.deep} strokeWidth="5" />
          <path d="M0 -92 C18 -62 44 -50 40 -14 C60 -34 62 -62 56 -78 C88 -52 92 -4 70 34 C60 54 34 70 0 70 C-34 70 -60 54 -70 34 C-92 -4 -88 -52 -56 -78 C-62 -62 -60 -34 -40 -14 C-44 -50 -18 -62 0 -92Z" fill={t.accent} />
          <path d="M0 -40 C10 -20 24 -10 22 12 C32 2 34 -16 30 -26 C46 -8 46 22 32 40 C22 52 10 58 0 58 C-10 58 -22 52 -32 40 C-46 22 -46 -8 -30 -26 C-34 -16 -32 2 -22 12 C-24 -10 -10 -20 0 -40Z" fill={t.soft} opacity="0.9" />
          <path d="M-150 130 L-100 118 L-62 136 L-20 116 L24 134 L66 114 L108 132 L150 120" fill="none" stroke={t.deep} strokeWidth="7" strokeLinecap="round" />
          <path d="M-20 116 L-8 150 M66 114 L54 148 M-100 118 L-110 146" fill="none" stroke={t.deep} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        </g>
      );
  }
}

export function RealmEmblemArt({ realm, title, locale }: { realm: RealmKey; title: string; locale: Locale }) {
  const t = TONES[realm];
  const text = COPY[locale];
  return (
    <article className="seal-border overflow-hidden rounded-2xl bg-cream/95 p-4 sm:p-6" data-quiz-realm-emblem={realm}>
      <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[28px] border border-line bg-paper shadow-sm">
          <svg viewBox="0 0 540 960" role="img" aria-label={title} className="block aspect-[9/16] h-auto w-full">
            <rect width="540" height="960" fill={t.field} />
            <rect x="24" y="24" width="492" height="912" rx="28" fill="none" stroke={t.gold} strokeWidth="2" opacity="0.5" />
            <circle cx="270" cy="470" r="214" fill={t.soft} opacity="0.85" />
            <circle cx="270" cy="470" r="214" fill="none" stroke={t.gold} strokeWidth="5" opacity="0.9" />
            <circle cx="270" cy="470" r="194" fill="none" stroke={t.gold} strokeWidth="2" opacity="0.45" />
            <g transform="translate(270 470)">
              <Emblem realm={realm} t={t} />
            </g>
            <ellipse cx="270" cy="760" rx="150" ry="14" fill={t.deep} opacity="0.12" />
            <path d="M110 800 Q270 768 430 800" fill="none" stroke={t.gold} strokeWidth="3" opacity="0.55" />
            <path d="M150 826 Q270 800 390 826" fill="none" stroke={t.gold} strokeWidth="2" opacity="0.4" />
            <path d="M74 190 Q118 147 162 190 M378 190 Q422 147 466 190" fill="none" stroke={t.gold} strokeWidth="3" opacity="0.42" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs tracking-[0.24em] text-cinnabar">{text.kicker}</p>
          <h3 className="mt-2 font-display text-2xl text-ink">{title}</h3>
          <p className="mt-4 text-sm leading-7 text-ink-soft">{text.note}</p>
          <div className="mt-5 h-px bg-line" />
          <p className="mt-3 text-[11px] tracking-[0.2em] text-ink-mute">{locale === "en" ? "STONE · ZHAOWU" : "STONE · 昭梧"}</p>
        </div>
      </div>
    </article>
  );
}
