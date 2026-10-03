import { useI18n, type Locale } from "@/lib/i18n";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

/**
 * A quiet entry into the longer birth-record reading, carried by original
 * Song-inspired mineral-pigment landscape art and a warm-paper caption.
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
        className="group block overflow-hidden rounded-[10px] border border-[#b9ad91]/60 bg-[#f7f3ea] text-[#1f1f1c]"
        aria-label={tr(locale, "深度解讀：循聲入局，開始一段更深的命書旅程", "深度解读：循声入局，开始一段更深的命书旅程", "Deep interpretation: begin a longer journey through your Destiny Book")}
      >
        <img
          src="/deep-reading-song-mineral.webp"
          className="block h-40 w-full object-cover sm:h-48"
          loading="lazy"
          decoding="async"
          alt=""
          aria-hidden="true"
        />
        <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0">
            <span className="text-xs tracking-[0.18em] text-[#77523d]">{tr(locale, "深度解讀", "深度解读", "DEEP INTERPRETATION")}</span>
            <h2 className="mt-1 font-display text-xl leading-tight sm:text-2xl">{tr(locale, "循聲入局：一段更深的命書旅程", "循声入局：一段更深的命书旅程", "Enter through the sound: a longer journey through your book")}</h2>
          </div>
          <span className="shrink-0 text-[#41675a] transition group-hover:translate-x-1" aria-hidden>→</span>
        </div>
      </a>
    </section>
  );
}
