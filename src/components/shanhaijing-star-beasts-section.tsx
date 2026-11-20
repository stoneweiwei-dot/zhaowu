import { useI18n, type Locale } from "@/lib/i18n";

type Creature = {
  slug: string;
  src: string;
  name: Record<Locale, string>;
};

const CREATURES: Creature[] = [
  { slug: "jiuweihu", src: "/images/articles/shanhaijing-star-beasts/jiuweihu.webp", name: { "zh-Hant": "九尾狐", "zh-Hans": "九尾狐", en: "Nine-tailed Fox" } },
  { slug: "yinglong", src: "/images/articles/shanhaijing-star-beasts/yinglong.webp", name: { "zh-Hant": "應龍", "zh-Hans": "应龙", en: "Yinglong" } },
  { slug: "zhulong", src: "/images/articles/shanhaijing-star-beasts/zhulong.webp", name: { "zh-Hant": "燭龍", "zh-Hans": "烛龙", en: "Torch Dragon" } },
  { slug: "qiongqi", src: "/images/articles/shanhaijing-star-beasts/qiongqi.webp", name: { "zh-Hant": "窮奇", "zh-Hans": "穷奇", en: "Qiongqi" } },
  { slug: "bifang", src: "/images/articles/shanhaijing-star-beasts/bifang.webp", name: { "zh-Hant": "畢方", "zh-Hans": "毕方", en: "Bifang" } },
  { slug: "kui", src: "/images/articles/shanhaijing-star-beasts/kui.webp", name: { "zh-Hant": "夔", "zh-Hans": "夔", en: "Kui" } },
  { slug: "dijiang", src: "/images/articles/shanhaijing-star-beasts/dijiang.webp", name: { "zh-Hant": "帝江", "zh-Hans": "帝江", en: "Dijiang" } },
  { slug: "paoxiao", src: "/images/articles/shanhaijing-star-beasts/paoxiao.webp", name: { "zh-Hant": "狍鴞", "zh-Hans": "狍鸮", en: "Paoxiao" } },
  { slug: "xiangliu", src: "/images/articles/shanhaijing-star-beasts/xiangliu.webp", name: { "zh-Hant": "相柳", "zh-Hans": "相柳", en: "Xiangliu" } },
  { slug: "luwu", src: "/images/articles/shanhaijing-star-beasts/luwu.webp", name: { "zh-Hant": "陸吾", "zh-Hans": "陆吾", en: "Luwu" } },
  { slug: "yingzhao", src: "/images/articles/shanhaijing-star-beasts/yingzhao.webp", name: { "zh-Hant": "英招", "zh-Hans": "英招", en: "Yingzhao" } },
  { slug: "kaimingshou", src: "/images/articles/shanhaijing-star-beasts/kaimingshou.webp", name: { "zh-Hant": "開明獸", "zh-Hans": "开明兽", en: "Kaiming Beast" } },
  { slug: "chenghuang", src: "/images/articles/shanhaijing-star-beasts/chenghuang.webp", name: { "zh-Hant": "乘黃", "zh-Hans": "乘黄", en: "Chenghuang" } },
  { slug: "fuzhu", src: "/images/articles/shanhaijing-star-beasts/fuzhu.webp", name: { "zh-Hant": "夫諸", "zh-Hans": "夫诸", en: "Fuzhu" } },
  { slug: "zhuyan", src: "/images/articles/shanhaijing-star-beasts/zhuyan.webp", name: { "zh-Hant": "朱厭", "zh-Hans": "朱厌", en: "Zhuyan" } },
  { slug: "tiangou", src: "/images/articles/shanhaijing-star-beasts/tiangou.webp", name: { "zh-Hant": "天狗", "zh-Hans": "天狗", en: "Tiangou" } },
  { slug: "dangkang", src: "/images/articles/shanhaijing-star-beasts/dangkang.webp", name: { "zh-Hant": "當康", "zh-Hans": "当康", en: "Dangkang" } },
  { slug: "zheng", src: "/images/articles/shanhaijing-star-beasts/zheng.webp", name: { "zh-Hant": "猙", "zh-Hans": "狰", en: "Zheng" } },
  { slug: "gudiao", src: "/images/articles/shanhaijing-star-beasts/gudiao.webp", name: { "zh-Hant": "蠱雕", "zh-Hans": "蛊雕", en: "Gudiao" } },
  { slug: "suanyu", src: "/images/articles/shanhaijing-star-beasts/suanyu.webp", name: { "zh-Hant": "酸與", "zh-Hans": "酸与", en: "Suanyu" } },
];

const COPY: Record<Locale, { kicker: string; title: string; lead: string; open: string }> = {
  "zh-Hant": {
    kicker: "原創圖志 · 山海異聞",
    title: "山海經・星海異獸",
    lead: "二十尊異獸，以古籍形貌為骨、星海流光為衣。此系列為當代原創視覺演繹，與古籍原文分開閱讀。",
    open: "開啟高清原圖",
  },
  "zh-Hans": {
    kicker: "原创图志 · 山海异闻",
    title: "山海经・星海异兽",
    lead: "二十尊异兽，以古籍形貌为骨、星海流光为衣。此系列为当代原创视觉演绎，与古籍原文分开阅读。",
    open: "打开高清原图",
  },
  en: {
    kicker: "ORIGINAL PLATES · SHANHAI BEINGS",
    title: "Shanhaijing · Beasts of the Star Sea",
    lead: "Twenty beings reimagined from classical descriptions in a contemporary star-sea visual language. Read these original artworks separately from the source texts.",
    open: "Open original full-size image",
  },
};

export function ShanhaijingStarBeastsSection() {
  const { locale } = useI18n();
  const copy = COPY[locale];

  return (
    <section id="shanhaijing-star-beasts" className="scroll-mt-24 border-t border-line/70 pt-8" aria-labelledby="shanhaijing-star-beasts-title">
      <header className="max-w-2xl">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-cinnabar">{copy.kicker}</p>
        <h2 id="shanhaijing-star-beasts-title" className="mt-2 font-display text-2xl tracking-[0.06em] text-ink sm:text-3xl">{copy.title}</h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{copy.lead}</p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
        {CREATURES.map((creature) => (
          <figure key={creature.slug} className="min-w-0">
            <a
              href={creature.src}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.open + "：" + creature.name[locale]}
              className="group block overflow-hidden rounded-[18px] border border-line/70 bg-cream shadow-[0_8px_20px_rgba(86,62,31,0.07)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cinnabar"
            >
              <img
                src={creature.src}
                alt={creature.name[locale] + "，《山海經・星海異獸》原創圖志"}
                loading="lazy"
                decoding="async"
                width={941}
                height={1672}
                className="aspect-[9/16] w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              />
            </a>
            <figcaption className="mt-2 border-l border-cinnabar/30 pl-2">
              <span className="block font-display text-base tracking-[0.08em] text-ink">{creature.name[locale]}</span>
              {locale !== "en" ? <span className="mt-0.5 block text-[10px] tracking-[0.12em] text-ink-mute">{creature.name.en}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
