import type { Locale } from "@/lib/i18n";

type SacredResultKind = "animal" | "element" | "realm";

type ConcealedSacredResultArtProps = {
  locale: Locale;
  seed: string;
  title: string;
  kind: SacredResultKind;
};

type Palette = {
  field: string;
  fieldSoft: string;
  mineral: string;
  mineralDeep: string;
  robe: string;
  robeDeep: string;
  gold: string;
  skin: string;
  ink: string;
};

const PALETTES: Palette[] = [
  { field: "#dceadf", fieldSoft: "#edf3e9", mineral: "#5f9b88", mineralDeep: "#315f58", robe: "#8fb8a8", robeDeep: "#4f7d70", gold: "#b38a45", skin: "#ead3bb", ink: "#3d4b45" },
  { field: "#dce7ef", fieldSoft: "#edf3f5", mineral: "#688da4", mineralDeep: "#3f6478", robe: "#9bb2bf", robeDeep: "#587486", gold: "#b69152", skin: "#ead1b9", ink: "#3d4850" },
  { field: "#eadfdf", fieldSoft: "#f4ece9", mineral: "#a56f72", mineralDeep: "#75484c", robe: "#c08e8c", robeDeep: "#8a5b5b", gold: "#b58948", skin: "#ebd1b9", ink: "#514444" },
  { field: "#e9e3d2", fieldSoft: "#f3efe5", mineral: "#9d895a", mineralDeep: "#6f5b37", robe: "#b9a477", robeDeep: "#806d45", gold: "#a77b38", skin: "#ead0b7", ink: "#4b4539" },
];

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function copy(locale: Locale) {
  if (locale === "en") return {
    kicker: "CONCEALED SACRED ICON",
    title: "Sacred result portrait",
    note: "A saturated Song-mineral visual layer for this quiz result. It does not add a deity, affinity or fate judgement.",
  };
  if (locale === "zh-Hans") return {
    kicker: "含藏圣相 · 测验结果",
    title: "本次结果圣相",
    note: "用浓郁宋彩、薄金月轮与半遮面圣相呈现本次测验结果；只做视觉化，不新增仙佛本缘或命理判定。",
  };
  return {
    kicker: "含藏聖相 · 測驗結果",
    title: "本次結果聖相",
    note: "用濃郁宋彩、薄金月輪與半遮面聖相呈現本次測驗結果；只做視覺化，不新增仙佛本緣或命理判定。",
  };
}

function CoverObject({ type, palette }: { type: number; palette: Palette }) {
  if (type === 1) {
    return (
      <g transform="translate(10 2) rotate(-11 250 338)">
        <path d="M172 356 Q250 274 328 356 L307 398 Q250 369 193 398 Z" fill={palette.fieldSoft} stroke={palette.gold} strokeWidth="4" />
        <path d="M250 314 L250 399" stroke={palette.gold} strokeWidth="4" opacity="0.7" />
        <path d="M203 343 Q250 318 297 343" fill="none" stroke={palette.mineralDeep} strokeWidth="3" opacity="0.7" />
      </g>
    );
  }
  if (type === 2) {
    return (
      <g transform="translate(0 8)">
        <circle cx="266" cy="340" r="67" fill={palette.fieldSoft} stroke={palette.gold} strokeWidth="5" />
        <circle cx="266" cy="340" r="51" fill="none" stroke={palette.mineralDeep} strokeWidth="2.5" opacity="0.55" />
        <path d="M232 342 Q266 314 300 342 Q266 366 232 342Z" fill={palette.mineral} opacity="0.75" />
      </g>
    );
  }
  if (type === 3) {
    return (
      <g transform="translate(4 10)">
        {[0, 45, 90, 135].map((rotation) => (
          <ellipse key={rotation} cx="264" cy="340" rx="26" ry="65" transform={`rotate(${rotation} 264 340)`} fill={palette.fieldSoft} stroke={palette.gold} strokeWidth="3" opacity="0.96" />
        ))}
        <circle cx="264" cy="340" r="20" fill={palette.mineral} stroke={palette.gold} strokeWidth="3" />
      </g>
    );
  }
  return (
    <g transform="translate(12 8) rotate(-7 246 340)">
      <rect x="192" y="274" width="116" height="154" rx="16" fill={palette.fieldSoft} stroke={palette.gold} strokeWidth="5" />
      <rect x="208" y="294" width="84" height="116" rx="9" fill={palette.mineral} opacity="0.72" />
      <path d="M226 320 H274 M226 344 H274 M226 368 H264" stroke={palette.gold} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
    </g>
  );
}

export function ConcealedSacredResultArt({ locale, seed, title, kind }: ConcealedSacredResultArtProps) {
  const hash = hashSeed(`${kind}:${seed}`);
  const palette = PALETTES[hash % PALETTES.length];
  const coverType = (hash >>> 3) % 4;
  const text = copy(locale);

  return (
    <article className="seal-border overflow-hidden rounded-2xl bg-cream/95 p-4 sm:p-6" data-quiz-sacred-result={kind}>
      <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[28px] border border-line bg-paper shadow-sm">
          <svg viewBox="0 0 540 960" role="img" aria-label={`${text.title}: ${title}`} className="block aspect-[9/16] h-auto w-full">
            <rect width="540" height="960" fill={palette.field} />
            <rect x="24" y="24" width="492" height="912" rx="28" fill="none" stroke={palette.gold} strokeWidth="2" opacity="0.45" />
            <circle cx="270" cy="340" r="190" fill={palette.fieldSoft} opacity="0.66" />
            <circle cx="270" cy="340" r="176" fill="none" stroke={palette.gold} strokeWidth="5" opacity="0.9" />
            <circle cx="270" cy="340" r="158" fill="none" stroke={palette.gold} strokeWidth="2" opacity="0.45" />

            <path d="M116 760 Q146 540 270 514 Q394 540 424 760 L456 915 H84 Z" fill={palette.robe} stroke={palette.gold} strokeWidth="4" />
            <path d="M126 760 Q185 656 270 628 Q355 656 414 760" fill="none" stroke={palette.robeDeep} strokeWidth="22" opacity="0.42" />
            <path d="M167 705 Q216 664 270 658 Q324 664 373 705" fill="none" stroke={palette.gold} strokeWidth="5" opacity="0.75" />
            <path d="M151 790 Q270 725 389 790" fill="none" stroke={palette.fieldSoft} strokeWidth="9" opacity="0.65" />

            <ellipse cx="270" cy="347" rx="104" ry="132" fill={palette.skin} stroke={palette.gold} strokeWidth="3" />
            <path d="M177 320 Q191 214 270 198 Q349 214 363 320 Q344 278 314 255 Q276 225 226 249 Q197 264 177 320Z" fill={palette.ink} opacity="0.9" />
            <path d="M216 342 Q237 330 256 342" fill="none" stroke={palette.ink} strokeWidth="6" strokeLinecap="round" />
            <path d="M288 342 Q307 330 326 342" fill="none" stroke={palette.ink} strokeWidth="6" strokeLinecap="round" opacity="0.72" />
            <path d="M257 404 Q270 412 283 404" fill="none" stroke={palette.ink} strokeWidth="4" strokeLinecap="round" opacity="0.62" />
            <path d="M224 464 Q270 488 316 464" fill="none" stroke={palette.gold} strokeWidth="3" opacity="0.55" />

            <CoverObject type={coverType} palette={palette} />

            <path d="M76 194 Q118 152 160 194" fill="none" stroke={palette.gold} strokeWidth="3" opacity="0.45" />
            <path d="M380 194 Q422 152 464 194" fill="none" stroke={palette.gold} strokeWidth="3" opacity="0.45" />
            <path d="M72 842 Q122 812 168 842 Q122 872 72 842Z" fill={palette.mineral} opacity="0.2" />
            <path d="M372 842 Q418 812 468 842 Q418 872 372 842Z" fill={palette.mineral} opacity="0.2" />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-xs tracking-[0.24em] text-cinnabar">{text.kicker}</p>
          <h3 className="mt-2 font-display text-2xl text-ink">{text.title}</h3>
          <p className="mt-2 font-display text-lg leading-7 text-ink">{title}</p>
          <p className="mt-4 text-sm leading-7 text-ink-soft">{text.note}</p>
          <div className="mt-5 h-px bg-line" />
          <p className="mt-3 text-[11px] tracking-[0.2em] text-ink-mute">STONE · 昭梧</p>
        </div>
      </div>
    </article>
  );
}
