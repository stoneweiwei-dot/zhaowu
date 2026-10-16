import type { Locale } from "@/lib/i18n";

export type TotemAnimal = "eagle" | "wolf" | "fox" | "deer" | "leopard" | "crane" | "whale" | "horse";

type Tone = { field: string; soft: string; ink: string; deep: string; gold: string; accent: string };

// One tone per animal so each result reads differently; all stay in the site's Song-mineral / antique-gold family.
const TONES: Record<TotemAnimal, Tone> = {
  eagle: { field: "#e3e6ea", soft: "#f1f3f4", ink: "#3b4654", deep: "#27303b", gold: "#b48d49", accent: "#d8c08a" },
  wolf: { field: "#dfe5e8", soft: "#eef2f3", ink: "#4a5560", deep: "#2d353d", gold: "#b08a4a", accent: "#c9d3d8" },
  fox: { field: "#efe1d3", soft: "#f8efe5", ink: "#9a4f33", deep: "#6a321f", gold: "#b3873f", accent: "#f3e6d4" },
  deer: { field: "#e6e4d2", soft: "#f2f1e4", ink: "#7a6340", deep: "#4f3f27", gold: "#ad8441", accent: "#efe6c6" },
  leopard: { field: "#e9e0cc", soft: "#f4eddc", ink: "#3a3128", deep: "#231d17", gold: "#b78b3c", accent: "#d9a94f" },
  crane: { field: "#e4ebe6", soft: "#f2f6f2", ink: "#2f3b38", deep: "#1f2927", gold: "#b48d49", accent: "#c4463a" },
  whale: { field: "#d9e6ec", soft: "#ebf3f6", ink: "#37596f", deep: "#223c4d", gold: "#b08c4c", accent: "#a9c7d6" },
  horse: { field: "#ebe0d6", soft: "#f6eee6", ink: "#5a3b2c", deep: "#3a251b", gold: "#b3873f", accent: "#e9d5b8" },
};

const COPY: Record<Locale, { kicker: string; note: string; label: (name: string) => string }> = {
  "zh-Hant": { kicker: "內在動物 · 圖騰", note: "依你的測驗結果繪製的象徵圖騰，只做視覺化，不新增命理判定。", label: (n) => `圖騰：${n}` },
  "zh-Hans": { kicker: "内在动物 · 图腾", note: "依你的测验结果绘制的象征图腾，只做视觉化，不新增命理判定。", label: (n) => `图腾：${n}` },
  en: { kicker: "INNER ANIMAL · TOTEM", note: "A symbolic totem drawn for your result. Visual only — it adds no fate judgement.", label: (n) => `Totem: ${n}` },
};

// Each silhouette is drawn in a local box of roughly x∈[-190,190], y∈[-170,170], facing right.
function Shape({ animal, t }: { animal: TotemAnimal; t: Tone }) {
  const ink = t.ink;
  switch (animal) {
    case "horse":
      return (
        <g fill={ink}>
          <path d="M-120 -5 C-122 -42 -78 -52 -28 -48 C22 -46 50 -50 76 -40 L84 40 C40 52 -30 52 -92 42 C-116 36 -119 14 -120 -5Z" />
          <path d="M58 -44 C70 -90 92 -130 112 -150 L152 -128 C164 -120 166 -104 154 -98 L126 -92 C118 -70 108 -30 96 -8Z" />
          <path d="M108 -152 L120 -178 L132 -146Z" />
          <path d="M60 -46 C48 -92 70 -140 104 -158 C84 -128 80 -90 92 -50Z" fill={t.deep} />
          <path d="M-116 -20 C-160 -6 -170 54 -150 112 C-150 62 -138 24 -112 8Z" fill={t.deep} />
          <path d="M44 30 L72 30 L68 150 L50 150Z M-104 30 L-72 30 L-78 150 L-98 150Z M12 36 L36 36 L26 148 L10 148Z M-62 40 L-36 40 L-50 148 L-66 148Z" />
          <path d="M96 -150 C72 -140 62 -108 66 -78 M104 -158 C84 -150 72 -128 70 -104" fill="none" stroke={t.accent} strokeWidth="3" opacity="0.6" />
          <circle cx="142" cy="-116" r="4" fill={t.soft} />
        </g>
      );
    case "deer":
      return (
        <g fill={ink}>
          <path d="M-100 -8 C-102 -40 -62 -50 -14 -46 C30 -44 52 -48 72 -38 L78 34 C36 46 -30 46 -78 36 C-98 30 -100 10 -100 -8Z" />
          <path d="M56 -42 C66 -84 82 -118 100 -136 L134 -118 C142 -112 142 -100 134 -96 L116 -94 C110 -66 100 -30 90 -6Z" />
          <path d="M112 -136 L108 -160 L122 -140Z M126 -126 L146 -148 L136 -120Z" />
          <path d="M-100 -20 C-116 -16 -118 -2 -112 10 C-106 0 -102 -4 -96 -4Z" fill={t.deep} />
          <path d="M44 28 L62 28 L58 156 L50 156Z M-90 28 L-72 28 L-76 156 L-84 156Z M14 32 L30 32 L22 154 L14 154Z M-52 34 L-36 34 L-44 154 L-52 154Z" />
          <g fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round">
            <path d="M112 -136 C100 -176 78 -184 62 -176 M100 -166 C88 -170 78 -160 78 -150 M110 -150 C98 -156 90 -150 88 -140" />
            <path d="M122 -138 C128 -176 150 -190 168 -184 M136 -168 C148 -168 158 -158 160 -148 M126 -150 C136 -152 144 -146 146 -138" />
          </g>
          <g fill={t.soft} opacity="0.75">{[[-70, -10], [-40, -22], [-8, -12], [22, -24], [-52, 8], [-18, 12], [14, 4]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="5" />)}</g>
          <circle cx="126" cy="-110" r="3.5" fill={t.soft} />
        </g>
      );
    case "wolf":
      return (
        <g fill={ink}>
          <path d="M-100 -22 C-102 -62 -48 -74 8 -66 C46 -62 72 -64 94 -50 L100 30 C50 48 -40 48 -90 34 C-104 28 -100 -2 -100 -22Z" />
          <path d="M66 -58 C86 -70 108 -74 128 -72 L140 -100 L154 -74 L204 -58 C212 -50 206 -40 194 -40 L164 -38 C154 -26 140 -16 124 -8 C110 0 100 10 92 22Z" />
          <path d="M132 -74 L142 -102 L152 -76Z" fill={t.deep} />
          <path d="M-98 -46 C-146 -44 -188 -10 -204 30 C-206 44 -196 46 -186 42 C-150 30 -120 20 -98 2Z" fill={t.deep} />
          <path d="M-204 30 C-206 44 -196 46 -186 42 C-196 36 -200 32 -204 30Z" fill={t.soft} />
          <path d="M46 26 L78 26 L74 156 L54 156Z M-92 30 L-60 30 L-68 156 L-88 156Z M12 34 L38 34 L30 154 L12 154Z M-58 38 L-30 38 L-40 154 L-60 154Z" />
          <path d="M70 -46 C58 -22 52 0 60 28 C78 8 92 -8 98 -24Z" fill={t.accent} opacity="0.5" />
          <g fill="none" stroke={t.soft} strokeWidth="3" strokeLinecap="round" opacity="0.55">
            <path d="M-60 -50 C-40 -40 -30 -30 -24 -14 M-20 -56 C0 -44 8 -32 12 -14 M20 -54 C36 -42 42 -30 44 -16" />
          </g>
          <path d="M172 -48 C182 -46 192 -48 198 -52" fill="none" stroke={t.soft} strokeWidth="3" opacity="0.7" />
          <circle cx="160" cy="-62" r="4.5" fill={t.soft} />
        </g>
      );
    case "fox":
      return (
        <g fill={ink}>
          <path d="M-70 -4 C-72 -38 -36 -46 8 -42 C44 -40 62 -42 80 -32 L84 36 C44 48 -20 48 -60 38 C-72 34 -70 14 -70 -4Z" />
          <path d="M62 -38 C76 -72 90 -92 108 -104 L112 -138 L130 -112 L176 -98 C184 -94 184 -84 176 -82 L148 -76 C140 -62 120 -44 100 -18Z" />
          <path d="M106 -106 L110 -138 L124 -112Z" fill={t.deep} />
          <path d="M-66 -16 C-132 -60 -190 -20 -178 56 C-168 90 -120 96 -92 66 C-76 48 -70 24 -64 10Z" />
          <path d="M-178 56 C-170 90 -124 96 -96 66 C-120 60 -150 54 -178 56Z" fill={t.soft} />
          <path d="M40 30 L62 30 L58 142 L46 142Z M-58 32 L-34 32 L-40 142 L-54 142Z M10 36 L28 36 L22 140 L12 140Z M-34 38 L-18 38 L-26 140 L-36 140Z" />
          <path d="M70 -34 C60 -10 56 6 62 28 C76 8 86 -6 92 -22Z" fill={t.soft} />
          <circle cx="150" cy="-92" r="4" fill={t.soft} />
        </g>
      );
    case "leopard":
      return (
        <g>
          <path fill={ink} d="M-128 -14 C-130 -44 -86 -52 -34 -48 C14 -46 52 -50 84 -38 L92 22 C50 40 -30 40 -88 30 C-120 24 -128 4 -128 -14Z" />
          <path fill={ink} d="M70 -42 C92 -70 118 -84 142 -80 C164 -78 178 -62 176 -44 C172 -30 156 -22 138 -22 C120 -22 104 -6 92 20Z" />
          <path fill={ink} d="M126 -80 L132 -102 L148 -82Z" />
          <path fill="none" stroke={ink} strokeWidth="16" strokeLinecap="round" d="M-122 -10 C-176 -30 -196 20 -164 70 C-150 90 -120 86 -104 70" />
          <path fill={ink} d="M52 20 L86 20 L96 112 L64 112Z M-110 20 L-72 20 L-62 112 L-98 112Z M10 24 L38 24 L36 112 L6 112Z M-60 26 L-34 26 L-30 112 L-58 112Z" />
          <g fill={t.accent} opacity="0.85">{[[-94, -20], [-60, -32], [-24, -24], [12, -34], [46, -26], [-80, 6], [-44, 0], [-8, 4], [28, -4], [66, 0]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="7" />)}</g>
          <circle cx="152" cy="-60" r="4" fill={t.accent} />
        </g>
      );
    case "crane":
      return (
        <g>
          <path fill={t.soft} stroke={ink} strokeWidth="5" d="M-70 24 C-80 -20 -40 -50 14 -46 C60 -44 86 -22 84 6 C78 34 30 46 -20 44 C-46 44 -62 38 -70 24Z" />
          <path fill={ink} d="M-70 24 C-120 30 -164 12 -190 -10 C-150 6 -110 0 -76 -8Z" />
          <path fill={ink} d="M-4 -10 C26 -26 58 -22 76 0 C56 6 28 8 -4 -10Z" opacity="0.9" />
          <path fill="none" stroke={ink} strokeWidth="14" strokeLinecap="round" d="M70 -26 C98 -62 70 -110 90 -150 C100 -168 120 -166 124 -152" />
          <path fill={ink} d="M124 -152 L184 -140 L126 -140Z" />
          <circle cx="116" cy="-156" r="9" fill={t.accent} />
          <circle cx="119" cy="-158" r="2.6" fill={t.soft} />
          <path fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" d="M8 44 L6 124 L26 160 M-22 44 C-30 90 -44 112 -60 118" />
          <path fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" d="M6 124 L-14 160" />
        </g>
      );
    case "whale":
      return (
        <g>
          <path fill={ink} d="M-170 24 C-170 -34 -112 -76 -26 -76 C60 -76 128 -52 160 -2 C122 6 96 -2 70 14 C30 44 -30 66 -96 62 C-142 58 -170 48 -170 24Z" />
          <path fill={ink} d="M146 -14 C170 -62 200 -84 216 -112 C214 -70 202 -40 192 -14 C206 -4 214 20 222 54 C190 40 164 24 146 -14Z" transform="translate(-26 4) scale(0.92)" />
          <path fill={t.soft} opacity="0.9" d="M-150 36 C-110 58 -40 70 20 58 C48 52 70 38 84 22 C40 44 -40 54 -100 48 C-124 46 -140 42 -150 36Z" />
          <path fill={t.deep} d="M-40 48 C-30 74 -6 92 20 94 C8 76 -4 60 -10 50Z" />
          <circle cx="-118" cy="-12" r="5" fill={t.soft} />
          <g fill="none" stroke={t.accent} strokeWidth="6" strokeLinecap="round">
            <path d="M-112 -92 C-112 -120 -128 -134 -146 -138 M-112 -92 C-110 -122 -92 -136 -74 -138 M-112 -92 L-112 -140" />
          </g>
          <g fill="none" stroke={t.ink} strokeWidth="5" strokeLinecap="round" opacity="0.55">
            <path d="M-190 106 C-160 92 -140 120 -110 106 C-80 92 -60 120 -30 106 C0 92 20 120 50 106 C80 92 100 120 130 106 C150 98 166 108 180 106" />
            <path d="M-170 134 C-140 122 -120 146 -90 134 C-60 122 -40 146 -10 134 C20 122 40 146 70 134 C100 122 120 146 150 134" />
          </g>
        </g>
      );
    case "eagle":
    default:
      return (
        <g fill={ink}>
          <path d="M-14 -38 C-60 -86 -132 -112 -196 -96 L-176 -72 L-198 -58 L-168 -40 L-184 -18 L-140 -8 L-122 12 L-98 4 L-80 26 L-52 16 L-30 36Z" />
          <path d="M14 -38 C60 -86 132 -112 196 -96 L176 -72 L198 -58 L168 -40 L184 -18 L140 -8 L122 12 L98 4 L80 26 L52 16 L30 36Z" />
          <path d="M-150 -58 C-110 -68 -70 -56 -36 -28 M-140 -32 C-104 -38 -70 -26 -42 -4 M-116 -6 C-90 -8 -66 2 -50 18" fill="none" stroke={t.accent} strokeWidth="4" opacity="0.7" />
          <path d="M150 -58 C110 -68 70 -56 36 -28 M140 -32 C104 -38 70 -26 42 -4 M116 -6 C90 -8 66 2 50 18" fill="none" stroke={t.accent} strokeWidth="4" opacity="0.7" />
          <path d="M-42 -30 C-48 20 -38 86 -22 140 L-10 176 L0 186 L10 176 L22 140 C38 86 48 20 42 -30 C30 -48 -30 -48 -42 -30Z" />
          <path d="M-20 90 L-30 150 L-10 120Z M20 90 L30 150 L10 120Z M0 100 L-8 170 L0 186 L8 170Z" fill={t.deep} />
          <ellipse cx="0" cy="-66" rx="34" ry="38" fill={t.soft} />
          <path d="M6 -70 C30 -72 50 -60 54 -44 C40 -46 26 -40 12 -34 C10 -46 8 -58 6 -70Z" fill={t.gold} />
          <path d="M6 -70 C24 -72 40 -66 48 -58" fill="none" stroke={t.deep} strokeWidth="2.5" opacity="0.6" />
          <circle cx="-6" cy="-72" r="4.5" fill={t.deep} />
          <path d="M-14 -88 L-6 -100 L2 -88 M-4 -90 L6 -102 L12 -88" fill="none" stroke={t.soft} strokeWidth="5" strokeLinecap="round" />
          <path d="M-22 150 L-34 178 M22 150 L34 178" fill="none" stroke={t.gold} strokeWidth="7" strokeLinecap="round" />
        </g>
      );
  }
}

export function AnimalTotemArt({ animal, title, locale }: { animal: TotemAnimal; title: string; locale: Locale }) {
  const t = TONES[animal];
  const text = COPY[locale];
  return (
    <article className="seal-border overflow-hidden rounded-2xl bg-cream/95 p-4 sm:p-6" data-quiz-animal-totem={animal}>
      <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[28px] border border-line bg-paper shadow-sm">
          <svg viewBox="0 0 540 960" role="img" aria-label={text.label(title)} className="block aspect-[9/16] h-auto w-full">
            <rect width="540" height="960" fill={t.field} />
            <rect x="24" y="24" width="492" height="912" rx="28" fill="none" stroke={t.gold} strokeWidth="2" opacity="0.5" />
            <circle cx="270" cy="470" r="214" fill={t.soft} opacity="0.85" />
            <circle cx="270" cy="470" r="214" fill="none" stroke={t.gold} strokeWidth="5" opacity="0.9" />
            <circle cx="270" cy="470" r="194" fill="none" stroke={t.gold} strokeWidth="2" opacity="0.45" />
            <g transform="translate(270 480)">
              <Shape animal={animal} t={t} />
            </g>
            <ellipse cx="270" cy="760" rx="150" ry="14" fill={t.deep} opacity="0.12" />
            <path d="M110 800 Q270 768 430 800" fill="none" stroke={t.gold} strokeWidth="3" opacity="0.55" />
            <path d="M150 826 Q270 800 390 826" fill="none" stroke={t.gold} strokeWidth="2" opacity="0.4" />
            <path d="M74 190 Q118 147 162 190 M378 190 Q422 147 466 190" fill="none" stroke={t.gold} strokeWidth="3" opacity="0.42" />
            <path d="M82 860 Q126 828 174 860 Q126 890 82 860Z M366 860 Q414 828 458 860 Q414 890 366 860Z" fill={t.deep} opacity="0.14" />
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
