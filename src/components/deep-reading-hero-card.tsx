import { useI18n, type Locale } from "@/lib/i18n";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

/**
 * Promotional entry card nudging visitors toward the full birth-record flow.
 *
 * The illustration is original artwork (mist, a dragon and a flute-player
 * silhouette) drawn directly in the site's own brand palette — it does not
 * trace or reuse any reference image. See docs/INSTRUCTION-REGISTRY.md and
 * the "昭梧視覺融合提案" design proposal this card implements: reference
 * material collected for mood only, original redraw for anything that ships.
 *
 * Deliberately does NOT use the shared `seal-border` class: across the
 * codebase that class is wired (in ~15 legacy stylesheets, several scoped to
 * `.zhaowu-home-sheet-page .seal-border` with `!important`) to force the
 * light "parchment card" background used by every other home card. This
 * card is intentionally dark (a night-mist illustration), so picking up
 * that override would silently flatten it to near-unreadable cream-on-cream.
 * The border/shadow treatment below is self-contained instead.
 */
export function DeepReadingHeroCard() {
  const { locale } = useI18n();

  function scrollToBirthRecord() {
    document.getElementById("customer-record")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="zhaowu-home-stage">
      <a
        href="#customer-record"
        onClick={(event) => { event.preventDefault(); scrollToBirthRecord(); }}
        className="group block overflow-hidden rounded-2xl border border-line/40 bg-wood text-cream shadow-xl"
        aria-label={tr(locale, "深度解讀：循聲入局，開始一段更深的命書旅程", "深度解读：循声入局，开始一段更深的命书旅程", "Deep interpretation: begin a longer journey through your Destiny Book")}
      >
        <svg viewBox="0 0 400 220" className="block h-40 w-full sm:h-48" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="dc-mist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2f6f5f" stopOpacity="0" />
              <stop offset="1" stopColor="#15392c" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="400" height="220" fill="#1f4e3a" />
          <path d="M -10 150 Q 90 108 190 140 T 410 124" fill="none" stroke="#c99a4a" strokeWidth="1.2" opacity="0.45" />
          <path d="M -10 176 Q 120 146 220 168 T 410 158" fill="none" stroke="#f7f0e2" strokeWidth="1" opacity="0.18" />
          <path
            d="M 250 44 C 280 26, 320 30, 336 50 C 350 66, 344 80, 322 84 C 340 86, 356 98, 350 114 C 344 128, 320 130, 306 120 C 316 130, 312 146, 292 148 C 274 150, 264 138, 268 124"
            fill="none" stroke="#e7cf9c" strokeWidth="2.2" strokeLinecap="round" opacity="0.9"
          />
          <circle cx="256" cy="46" r="3.8" fill="#e7cf9c" opacity="0.9" />
          <g>
            <path
              d="M 150 102 C 150 88, 160 80, 170 80 C 180 80, 186 90, 184 99 C 200 96, 210 105, 206 114 L 168 164 L 140 154 Z"
              fill="#faf8f1" opacity="0.94"
            />
            <line x1="150" y1="109" x2="122" y2="102" stroke="#a7352b" strokeWidth="2" strokeLinecap="round" />
            <circle cx="167" cy="90" r="6" fill="#faf8f1" opacity="0.96" />
          </g>
          <path d="M -10 198 Q 130 184 220 196 T 410 191" fill="none" stroke="#f7f0e2" strokeWidth="0.8" opacity="0.12" />
          <rect x="0" y="0" width="400" height="220" fill="url(#dc-mist)" />
        </svg>
        <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0">
            <span className="text-xs tracking-[0.18em] text-paper/80">{tr(locale, "深度解讀", "深度解读", "DEEP INTERPRETATION")}</span>
            <h2 className="mt-1 font-display text-xl leading-tight sm:text-2xl">{tr(locale, "循聲入局：一段更深的命書旅程", "循声入局：一段更深的命书旅程", "Enter through the sound: a longer journey through your book")}</h2>
          </div>
          <span className="shrink-0 text-cream transition group-hover:translate-x-1" aria-hidden>→</span>
        </div>
      </a>
    </section>
  );
}
