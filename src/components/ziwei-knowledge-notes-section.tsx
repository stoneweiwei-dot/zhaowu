import { useI18n, type Locale } from "@/lib/i18n";

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

export function ZiweiKnowledgeNotesSection() {
  const { locale } = useI18n();

  const bureaus = [
    ["水二局", "2–11"],
    ["木三局", "3–12"],
    ["金四局", "4–13"],
    ["土五局", "5–14"],
    ["火六局", "6–15"],
  ] as const;

  return (
    <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
      <p className="text-xs tracking-[0.22em] text-cinnabar">
        {tr(locale, "紫微斗數 · 基礎判讀", "紫微斗数 · 基础判读", "ZI WEI DOU SHU · READING BASICS")}
      </p>

      <h3 className="mt-2 font-display text-2xl text-ink">
        {tr(locale, "五行局不是性格標籤", "五行局不是性格标签", "The Five-Element Bureau is not a personality label")}
      </h3>

      <p className="mt-3 text-sm leading-7 text-ink-soft">
        {tr(
          locale,
          "五行局首先是排盤底層參數。命宮干支的納音五行定局，局數同時決定第一個十年大限從幾歲開始；它不能單獨拿來判一個人的脾氣、善惡或人生層級。",
          "五行局首先是排盘底层参数。命宫干支的纳音五行定局，局数同时决定第一个十年大限从几岁开始；它不能单独拿来判断一个人的脾气、善恶或人生层级。",
          "The Five-Element Bureau is first a chart-calculation parameter. It is derived from the Life Palace stem-branch Na Yin and also determines the starting age of the first 10-year cycle. It should not be used by itself to judge temperament, morality or life rank."
        )}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {bureaus.map(([name, ages]) => (
          <article key={name} className="flex items-center justify-between rounded-xl border border-line bg-cream px-4 py-3">
            <strong className="font-display text-lg text-ink">{name}</strong>
            <span className="text-sm text-earth">{ages}</span>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-line bg-cream p-4">
        <h4 className="font-display text-lg text-ink">
          {tr(locale, "這些數字真正代表什麼？", "这些数字真正代表什么？", "What do these numbers actually mean?")}
        </h4>
        <p className="mt-2 text-sm leading-7 text-ink-soft">
          {tr(
            locale,
            "例如命盤寫「6–15」，先確認的是火六局，第一個大限由 6 歲起；不是「火六局＝脾氣爆」之類的人格代碼。",
            "例如命盘写“6–15”，先确认的是火六局，第一个大限由 6 岁起；不是“火六局＝脾气爆”之类的人格代码。",
            "If a chart shows “6–15”, the direct fact is Fire Six Bureau and a first decadal cycle starting at age 6. It does not mean “Fire Six Bureau = explosive temperament”."
          )}
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-cinnabar/20 bg-cream p-4">
        <h4 className="font-display text-lg text-ink">
          {tr(locale, "性格要看什麼？", "性格要看什么？", "What should personality analysis use instead?")}
        </h4>
        <p className="mt-2 text-sm leading-7 text-ink-soft">
          {tr(
            locale,
            "至少要回到命宮主星、輔煞、四化、三方四正、身宮與整體結構。五行局若作氣質背景，也只能在流派與來源明確時作次級旁證，不能取代命宮判讀。",
            "至少要回到命宫主星、辅煞、四化、三方四正、身宫与整体结构。五行局若作气质背景，也只能在流派与来源明确时作次级旁证，不能取代命宫判断。",
            "At minimum, use the Life Palace major stars, supporting and challenging stars, transformations, the trine-opposition structure, Body Palace and the overall chart. If a school uses the bureau as an elemental background, it remains secondary evidence and must not replace the Life Palace reading."
          )}
        </p>
      </div>
    </section>
  );
}
